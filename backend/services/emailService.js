const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('[EmailService]: Application Started');
console.log('[EmailService]: Verifying loaded SMTP Environment Variables...');
console.log('  SMTP_HOST:', process.env.SMTP_HOST ? '✓' : '✗');
console.log('  SMTP_PORT:', process.env.SMTP_PORT ? '✓' : '✗');
console.log('  SMTP_USER:', process.env.SMTP_USER ? '✓' : '✗');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? 'Loaded ✓' : '✗');
console.log('  MAIL_FROM_EMAIL:', process.env.MAIL_FROM_EMAIL ? '✓' : '✗');
console.log('  MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME ? '✓' : '✗');
console.log('  EMAIL_MODE:', process.env.EMAIL_MODE || 'queue');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

let isSmtpValid = true;

transporter.verify((error, success) => {
  if (error) {
    isSmtpValid = false;
    console.error(`✗ [EmailService]: SMTP Connection Failed: ${error.message}`);
    console.log(`ℹ [EmailService]: Falling back to Console Mock for Local Development emails.`);
  } else {
    console.log('✓ [EmailService]: SMTP Connected Successfully');
  }
});

const senderEmail = process.env.MAIL_FROM_EMAIL || 'support@familyhub.com';
const senderName = process.env.MAIL_FROM_NAME || 'FamilyHub';

const createEmailTemplate = (title, preheader, content) => `
<div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 35px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
    </div>
    <div style="padding: 40px 30px;">
        ${content}
    </div>
    <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Regards,<br><strong style="color: #475569; margin-top: 6px; display: inline-block;">FamilyHub OS Team</strong></p>
    </div>
</div>
`;

let isQueueProcessing = false;

const sendInstantEmail = async (to, subject, html) => {
  let textContent = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  console.log(`[EmailService]: Sending Email Instantly...`);
  
  if (!isSmtpValid && process.env.NODE_ENV !== 'production') {
    console.log(`[EmailQueue-MOCK]: 📧 Simulating immediate email to ${to}`);
    console.log(`[EmailQueue-MOCK]: Subject: ${subject}`);
    return { messageId: `mock-id-${Date.now()}` };
  }

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: to,
    replyTo: senderEmail,
    subject: subject,
    text: textContent,
    html: html,
    headers: {
      'List-Unsubscribe': `<mailto:${senderEmail}?subject=unsubscribe>`
    }
  });

  console.log(`[EmailService]: Email accepted by SMTP`);
  console.log(`[EmailService]: Message ID: ${info.messageId}`);
  console.log(`[EmailService]: Recipient: ${to}`);
  console.log(`[EmailService]: Subject: ${subject}`);
  
  return info.messageId;
};

const dispatchEmail = async (recipient, subject, template, html) => {
  if (!prisma.emailQueue) {
    console.error('[EmailService]: Prisma EmailQueue not found.');
    return { success: false, error: 'Prisma Client missing EmailQueue' };
  }

  if (process.env.EMAIL_MODE === 'instant') {
    try {
      await sendInstantEmail(recipient, subject, html);
      await prisma.emailQueue.create({
        data: {
          recipient,
          subject,
          template,
          payload: { html },
          status: 'SENT',
          sentAt: new Date()
        }
      });
      return { success: true };
    } catch (err) {
      console.error('[EmailService]: Instant send failed, falling back to queue.', err.message);
    }
  }

  try {
    await prisma.emailQueue.create({
      data: {
        recipient,
        subject,
        template,
        payload: { html },
        status: 'PENDING'
      }
    });
    processAllPendingQueue().catch(console.error);
    return { success: true };
  } catch (err) {
    if (err.code === 'P2002') return { success: true }; 
    console.error("Queue Dispatch Error:", err);
    return { success: false, error: err.message };
  }
};

const processAllPendingQueue = async () => {
  if (isQueueProcessing) return;
  isQueueProcessing = true;

  try {
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: { in: ['PENDING', 'RETRYING'] }
      },
      take: 20
    });

    if (pendingEmails.length > 0) {
      console.log(`[EmailQueue]: Queue Started - Processing ${pendingEmails.length} Emails`);
    }

    for (const email of pendingEmails) {
      if (email.status === 'RETRYING' && email.attempts > 0) {
        const delays = [1, 5, 15, 30, 60];
        const delayMins = delays[email.attempts - 1] || 60;
        const retryTime = new Date(email.updatedAt).getTime() + (delayMins * 60000);
        if (Date.now() < retryTime) continue;
      }
      console.log(`[EmailQueue]: Processing Email for -> ${email.recipient}`);

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'PROCESSING', attempts: { increment: 1 } }
      });

      try {
        console.log(`[EmailQueue]: Sending Email...`);
        let info;
        let textContent = email.payload.html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();

        if (!isSmtpValid && process.env.NODE_ENV !== 'production') {
          console.log(`[EmailQueue-MOCK]: 📧 Simulating email to ${email.recipient}`);
          console.log(`[EmailQueue-MOCK]: Subject: ${email.subject}`);
          info = { messageId: `mock-id-${Date.now()}` };
        } else {
          info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: email.recipient,
            replyTo: senderEmail,
            subject: email.subject,
            text: textContent,
            html: email.payload.html,
            headers: {
              'List-Unsubscribe': `<mailto:${senderEmail}?subject=unsubscribe>`
            }
          });
        }
        
        console.log(`[EmailQueue]: Email accepted! Message ID: ${info.messageId}`);

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: 'SENT', sentAt: new Date(), errorMessage: null }
        });
        console.log('[EmailQueue]: Email Sent successfully updated in DB: ' + email.recipient);
      } catch (err) {
        console.error('[EmailQueue]: SMTP Error ->', err.message);
        console.error(err.stack);

        const status = email.attempts >= 5 ? 'FAILED' : 'RETRYING';
        
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status, errorMessage: err.message }
        });
        
        if (status === 'FAILED') console.log('[EmailQueue]: Email Failed recursively! Abandoned ' + email.recipient);
        else console.log('[EmailQueue]: Retry Attempt queued for ' + email.recipient);
      }
    }
  } catch (error) {
    console.error(`[EmailQueue]: Queue Error during fetch/update: ${error.message}`);
    console.error(error.stack);
  } finally {
    isQueueProcessing = false;
  }
};

setInterval(processAllPendingQueue, 15000); // 15 seconds

const sendFamilyAdminEmail = async (adminName, adminEmail, familyName, familyCode, tempPassword, isResend = false) => {
  const loginUrl = `${process.env.APP_URL}/login`;
  const subject = isResend ? 'Reminder: Welcome to FamilyHub OS' : 'Welcome to FamilyHub OS';
  const reminderText = isResend ? `<p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">This is a reminder sent on ${new Date().toLocaleString()}.</p>` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${adminName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Your family workspace has been created successfully.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; margin: 30px 0;">
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #475569;"><strong>Family Name:</strong> <span style="color: #0f172a;">${familyName}</span></p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #475569;"><strong>Family Code:</strong> <span style="color: #0f172a;">${familyCode}</span></p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #475569;"><strong>Email:</strong> <span style="color: #0f172a;">${adminEmail}</span></p>
        <p style="margin: 0; font-size: 15px; color: #475569;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 4px 8px; border-radius: 6px; color: #0f172a; font-weight: bold;">${tempPassword}</span></p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); font-size: 16px;">Login URL</a>
    </div>
    <p style="font-size: 14px; color: #64748b; text-align: center;">For security, please change your password after your first login.</p>
    ${reminderText}
  `;
  const html = createEmailTemplate(subject, 'Welcome', content);
  return await dispatchEmail(adminEmail, subject, 'family_admin_welcome', html);
};

const sendInvitationEmail = async (member, adminName, familyName, token, isResend = false) => {
  const inviteUrl = `${process.env.APP_URL}/invite/${token}`;
  const memberName = member.firstName + (member.lastName ? ` ${member.lastName}` : '');
  const subject = isResend ? "Reminder: You're Invited to Join FamilyHub" : "You're Invited to Join FamilyHub";
  const reminderText = isResend ? `<p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">This is a reminder invitation sent on ${new Date().toLocaleString()}.</p>` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${memberName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;"><strong>${adminName}</strong> invited you to join <strong>${familyName}</strong>.</p>
    <p style="font-size: 16px; line-height: 1.6;">Click below to accept.</p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="${inviteUrl}" style="background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); font-size: 16px;">Accept Invitation</a>
    </div>
    <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: -15px; margin-bottom: 30px;">
        <a href="${inviteUrl}" style="color: #64748b;">${inviteUrl}</a>
    </p>
    <p style="font-size: 14px; color: #64748b; text-align: center;">Invitation expires in 7 days.</p>
    ${reminderText}
  `;
  const html = createEmailTemplate("You're Invited!", 'Invitation', content);
  return await dispatchEmail(member.email, subject, 'member_invitation', html);
};

const sendMemberCredentialsEmail = async (memberName, memberEmail, tempPassword, isResend = false) => {
  const loginUrl = `${process.env.APP_URL}/login`;
  const subject = isResend ? 'Reminder: Welcome to FamilyHub' : 'Welcome to FamilyHub';
  const reminderText = isResend ? `<p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">This is a reminder sent on ${new Date().toLocaleString()}.</p>` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${memberName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Your account has been created by an administrator.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; margin: 30px 0;">
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #475569;"><strong>Email:</strong> <span style="color: #0f172a;">${memberEmail}</span></p>
        <p style="margin: 0; font-size: 15px; color: #475569;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 4px 8px; border-radius: 6px; color: #0f172a; font-weight: bold;">${tempPassword}</span></p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="background-color: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); font-size: 16px;">Login to FamilyHub</a>
    </div>
    <p style="font-size: 14px; color: #64748b; text-align: center;">Please change your password after first login.</p>
    ${reminderText}
  `;
  const html = createEmailTemplate(subject, 'Welcome', content);
  return await dispatchEmail(memberEmail, subject, 'member_welcome', html);
};

const sendPasswordResetEmail = async (memberName, memberEmail, resetToken, isResend = false) => {
  const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
  const subject = isResend ? 'Reminder: Password Reset Request' : 'Password Reset Request';
  const reminderText = isResend ? `<p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">This is a reminder sent on ${new Date().toLocaleString()}.</p>` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${memberName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">You requested a password reset for your FamilyHub account.</p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2); font-size: 16px;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #64748b; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
    ${reminderText}
  `;
  const html = createEmailTemplate(subject, 'Reset Password', content);
  return await dispatchEmail(memberEmail, subject, 'password_reset', html);
};

module.exports = { 
  sendInvitationEmail, 
  sendFamilyAdminEmail, 
  sendMemberCredentialsEmail, 
  sendPasswordResetEmail,
  sendInstantEmail,
  processAllPendingQueue,
  transporter
};
