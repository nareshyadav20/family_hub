require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');
const util = require('util');

const lookup = util.promisify(dns.lookup);

async function runTest() {
  console.log('--- DNS INVESTIGATION ---');
  try {
    const v4 = await lookup('smtp.gmail.com', { family: 4, all: true });
    console.log('IPv4 Resolution:', v4);
    
    const v6 = await lookup('smtp.gmail.com', { family: 6, all: true });
    console.log('IPv6 Resolution:', v6);
  } catch (err) {
    console.error('DNS Lookup Error:', err);
  }

  console.log('\n--- SMTP TRANSPORT SETUP ---');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    family: 4,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: true,
    debug: true
  });

  console.log('Family config:', transporter.options.family);

  console.log('\n--- SMTP VERIFICATION ---');
  try {
    await transporter.verify();
    console.log('SMTP Verified Successfully');
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM_EMAIL || 'test@familyhub.com',
      to: process.env.MAIL_FROM_EMAIL || 'test@familyhub.com',
      subject: 'Standalone SMTP Test',
      text: 'This is a test from smtp-test.js'
    });
    console.log('Test email sent:', info.messageId);
  } catch (err) {
    console.error('SMTP Verify/Send Error:', err);
  }
}

runTest();
