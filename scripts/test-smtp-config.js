// SMTP Configuration Test for NeX AI
// Tests email delivery for Supabase Auth

const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP Configuration for nexconsultingltd.com
const SMTP_CONFIG = {
  host: 'smtp.nexconsultingltd.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: 'nex@nexconsultingltd.com',
    pass: process.env.SMTP_PASSWORD || 'YOUR_SMTP_PASSWORD'
  },
  tls: {
    rejectUnauthorized: false
  }
};

async function testSMTP() {
  console.log('\n🔍 TESTING SMTP CONFIGURATION FOR NEX AI\n');
  console.log('=' .repeat(50));

  console.log('\n📧 SMTP Settings:');
  console.log(`   Host: ${SMTP_CONFIG.host}`);
  console.log(`   Port: ${SMTP_CONFIG.port}`);
  console.log(`   User: ${SMTP_CONFIG.auth.user}`);
  console.log(`   TLS:  Enabled (STARTTLS)`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    // Verify connection
    console.log('\n🔌 Testing SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS');

    // Send test email
    console.log('\n📨 Sending Test Email...');
    const testEmail = {
      from: {
        name: 'NeX AI',
        address: 'nex@nexconsultingltd.com'
      },
      to: process.env.TEST_EMAIL || 'test@example.com',
      replyTo: 'support@nexconsultingltd.com',
      subject: 'NeX AI - SMTP Test Email',
      text: 'This is a test email from NeX AI to verify SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B4636;">NeX AI - SMTP Test</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <p>If you received this email, your SMTP settings are working correctly!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            NeX Consulting Ltd<br>
            Email: support@nexconsultingltd.com<br>
            Website: https://ai.nexconsultingltd.com
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email Sent Successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);

    console.log('\n' + '=' .repeat(50));
    console.log('✅ ALL TESTS PASSED');
    console.log('=' .repeat(50) + '\n');

    return true;
  } catch (error) {
    console.error('\n❌ SMTP TEST FAILED');
    console.error(`   Error: ${error.message}`);

    if (error.code === 'EAUTH') {
      console.error('\n💡 Fix: Check SMTP username and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Fix: Check SMTP host and port');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Fix: Check firewall or network connection');
    }

    console.log('\n' + '=' .repeat(50) + '\n');
    return false;
  }
}

// Run test
if (require.main === module) {
  testSMTP()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testSMTP };
