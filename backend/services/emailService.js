const crypto = require('crypto');

const sendInvitationEmail = async (member, adminName, familyName, token) => {
  const appUrl = process.env.APP_URL;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  console.log('BREVO_API_KEY Loaded:', brevoApiKey ? `${brevoApiKey.substring(0, 12)}...${brevoApiKey.substring(brevoApiKey.length - 4)}` : 'No');
  console.log('BREVO_SENDER_EMAIL:', senderEmail);
  console.log('BREVO_SENDER_NAME:', senderName);
  console.log('APP_URL:', appUrl);
  console.log('Request URL: https://api.brevo.com/v3/smtp/email');

  if (!brevoApiKey || typeof brevoApiKey !== 'string' || brevoApiKey.length < 20) {
    console.error('Invalid Brevo API key.');
    return { success: false, error: 'Invalid Brevo API key.', errorCode: 'INVALID_API_KEY', token: null };
  }

  if (!senderEmail || !senderName || !appUrl) {
    console.error('Brevo configuration missing');
    return { success: false, error: 'Brevo configuration missing', errorCode: 'CONFIG_MISSING', token: null };
  }

  const inviteUrl = `${appUrl}/invite/${token}`;

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: member.email,
        name: member.firstName + ' ' + (member.lastName || '')
      }
    ],
    subject: "You're Invited to Join FamilyHub",
    htmlContent: `
      <p>Hello ${member.firstName},</p>
      <p>You have been invited by ${adminName} to join the ${familyName} family.</p>
      <p>Click the button below to join.</p>
      <a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background-color:#4F46E5;color:#ffffff;text-decoration:none;border-radius:5px;">Join Family</a>
      <p>Invitation Link: ${inviteUrl}</p>
      <p>This invitation expires in 7 days.</p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <p>FamilyHub OS Team</p>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      let parsedError = {};
      try { parsedError = JSON.parse(errorData); } catch (e) { }

      console.error("BREVO ERROR");
      console.error("HTTP Status Code:", response.status);
      console.error("Error Code:", parsedError.code || 'UNKNOWN');
      console.error("Error Message:", parsedError.message || errorData);
      console.error("Response Body:", errorData);
      console.error("Request Body:", JSON.stringify(payload));

      const errMsg = parsedError.message || errorData || 'Invalid response from email provider';
      const code = parsedError.code || 'BREVO_API_ERROR';

      return { success: false, error: errMsg, errorCode: code, token: null };
    }

    const data = await response.json();
    return { success: true, token, messageId: data.messageId || null };
  } catch (error) {
    console.error("BREVO ERROR");
    console.error("Fetch Exception:", error.message);
    return { success: false, error: error.message, errorCode: 'FETCH_FAILED', token: null };
  }
};

const sendFamilyAdminEmail = async (adminName, adminEmail, familyName, familyId, tempPassword) => {
  const appUrl = process.env.APP_URL;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!brevoApiKey || typeof brevoApiKey !== 'string' || brevoApiKey.length < 20) {
    return { success: false, error: 'Invalid Brevo API key.', errorCode: 'INVALID_API_KEY' };
  }

  const loginUrl = `${appUrl}/login`; // Direct them strictly to /login

  const htmlContent = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #7c3aed, #2563eb); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">FamilyHub OS</h1>
    </div>
    <div style="padding: 30px;">
        <p style="font-size: 16px;">Hello <strong>${adminName}</strong>,</p>
        <p style="font-size: 16px;">Welcome to FamilyHub OS!</p>
        <p style="font-size: 16px;">Your family workspace has been successfully created. Below are your login credentials.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 8px 0; font-size: 15px;"><strong>Family Name:</strong> ${familyName}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Family ID:</strong> ${familyId}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Role:</strong> Family Administrator</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Login Email:</strong> ${adminEmail}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
        </div>

        <div style="background-color: #fff8eb; color: #b45309; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <strong style="display: block; margin-bottom: 8px;">Important Security Notice:</strong>
            <ul style="margin-top: 5px; margin-bottom: 0; padding-left: 20px; line-height: 1.6;">
                <li>This is a temporary password.</li>
                <li>You must change your password during your first login.</li>
                <li>Do not share these credentials with anyone.</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);">Login to FamilyHub</a>
        </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">Regards,<br><strong style="color: #4b5563; margin-top: 4px; display: inline-block;">FamilyHub OS Team</strong></p>
    </div>
</div>
  `;

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: adminEmail, name: adminName }],
    subject: "🎉 Welcome to FamilyHub OS",
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("BREVO FAMILY ADMIN EMAIL ERROR:", errorData);
      return { success: false, error: errorData };
    }
    return { success: true };
  } catch (error) {
    console.error("BREVO FAMILY ADMIN FETCH EXCEPTION:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvitationEmail, sendFamilyAdminEmail };
