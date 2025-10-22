#!/usr/bin/env node

/**
 * Script to test Paystack API credentials
 * This will verify if your Paystack secret key is valid
 */

require('dotenv').config({ path: '.env' });

async function testPaystackCredentials() {
  console.log('🧪 Testing Paystack API Credentials...\n');

  // Check if secret key exists
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('❌ PAYSTACK_SECRET_KEY not found in environment variables');
    process.exit(1);
  }

  // Log key info (masked for security)
  const keyPrefix = secretKey.substring(0, 8);
  const keyLength = secretKey.length;
  const keyType = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';

  console.log('🔑 Key Information:');
  console.log(`   Type: ${keyType}`);
  console.log(`   Prefix: ${keyPrefix}...`);
  console.log(`   Length: ${keyLength} characters\n`);

  // Test the key by making a simple API call
  console.log('📡 Testing API connection...\n');

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        amount: 100000, // ₦1,000 in kobo
        currency: 'NGN',
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      console.log('✅ SUCCESS: Paystack API credentials are VALID!\n');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('\n✨ Your Paystack integration is properly configured.');
    } else {
      console.error('❌ FAILED: Paystack API rejected the credentials\n');
      console.error('HTTP Status:', response.status, response.statusText);
      console.error('Error Response:', JSON.stringify(data, null, 2));

      if (data.message?.includes('Invalid key')) {
        console.error('\n⚠️  The secret key appears to be invalid. Please:');
        console.error('   1. Log into your Paystack dashboard at https://dashboard.paystack.com');
        console.error('   2. Go to Settings → API Keys & Webhooks');
        console.error('   3. Copy the correct secret key (sk_test_xxx or sk_live_xxx)');
        console.error('   4. Update your .env file with the correct key');
        console.error('   5. Restart your development server\n');
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('\n⚠️  Could not connect to Paystack API. Please check:');
    console.error('   1. Your internet connection');
    console.error('   2. If Paystack API is accessible from your location');
    console.error('   3. Any firewall or proxy settings\n');
    process.exit(1);
  }
}

testPaystackCredentials();
