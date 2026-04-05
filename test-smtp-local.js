const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    process.env[key] = value;
  }
});

async function testSMTP() {
  console.log('🧪 Testing Gmail SMTP...\n');

  // Check env vars
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ MISSING');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ MISSING');
  console.log('SMTP_USER:', process.env.SMTP_USER ? '✓ SET' : '❌ MISSING');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ SET (length: ' + process.env.SMTP_PASS.length + ')' : '❌ MISSING');
  console.log('');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing SMTP credentials!');
    process.exit(1);
  }

  try {
    // Create transporter
    console.log('🔧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: 'cristicudla123@gmail.com', // Your test email
      subject: '🧪 Test Email - SMTP Working!',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
          <h1 style="color: #00bcd4;">✅ SMTP FUNCȚIONEAZĂ!</h1>
          <p style="font-size: 16px; color: #e5e5e5;">
            Dacă primești acest email, Gmail SMTP funcționează perfect! 🎉
          </p>
          <div style="background: rgba(0,188,212,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin:0; color: #ccc;"><strong>From:</strong> ${process.env.SMTP_FROM_EMAIL}</p>
            <p style="margin:5px 0 0 0; color: #ccc;"><strong>Host:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📨 Accepted:', info.accepted);
    console.log('\n🎉 TEST PASSED! Check your inbox at cristicudla123@gmail.com\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('\nFull error:', error);
  }
}

testSMTP();
