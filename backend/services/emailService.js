const crypto = require('crypto');

const sendInvitationEmail = async (member, adminName, familyName) => {
  const token = crypto.randomBytes(32).toString('hex');
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
      try { parsedError = JSON.parse(errorData); } catch (e) {}
      
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

const sendFamilyAdminEmail = async (adminName, adminEmail, familyName, tempPassword) => {
  const appUrl = process.env.APP_URL;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!brevoApiKey || typeof brevoApiKey !== 'string' || brevoApiKey.length < 20) {
    return { success: false, error: 'Invalid Brevo API key.', errorCode: 'INVALID_API_KEY' };
  }

  const loginUrl = `${appUrl}/admin/login`; // Ensure this is the correct login route

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: adminEmail, name: adminName }],
    subject: "Welcome to FamilyHub OS - Administrator Account",
    htmlContent: `
      <p>Hello ${adminName},</p>
      <p>Your FamilyHub OS administrator account for <strong>${familyName}</strong> has been created successfully.</p>
      <p>Login URL: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>Username: ${adminEmail}</p>
      <p>Temporary Password: <strong>${tempPassword}</strong></p>
      <p>For security reasons, you must change your password during your first login.</p>
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
      return { success: false, error: errorData };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvitationEmail, sendFamilyAdminEmail };
