/**
 * Test Script for Paystack Webhook Forwarding
 *
 * This script simulates a Paystack webhook to test the NeXAI router's
 * forwarding functionality for ElevenOne webhooks.
 */

const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://ai.nexconsultingltd.com/api/paystack/webhook';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error('❌ Error: PAYSTACK_SECRET_KEY environment variable is required');
  process.exit(1);
}

// Test webhook payload for ElevenOne
const testPayload = {
  event: 'charge.success',
  data: {
    id: 123456789,
    domain: 'test',
    status: 'success',
    reference: `TEST_ELEVENONE_${Date.now()}`,
    amount: 1000000, // ₦10,000 in kobo
    currency: 'NGN',
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    channel: 'card',
    ip_address: '127.0.0.1',
    metadata: {
      app: 'elevenone',  // THIS TRIGGERS FORWARDING
      user_email: 'test@elevenone.com',
      user_id: 'test-user-123',
      plan: 'premium'
    },
    customer: {
      id: 123456,
      email: 'test@elevenone.com',
      customer_code: 'CUS_test123'
    }
  }
};

// Generate Paystack signature
function generateSignature(payload) {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payloadString)
    .digest('hex');
}

// Send test webhook
async function testWebhookForwarding() {
  console.log('🧪 Testing Webhook Forwarding for ElevenOne\n');
  console.log('Configuration:');
  console.log(`  Webhook URL: ${WEBHOOK_URL}`);
  console.log(`  Test Reference: ${testPayload.data.reference}`);
  console.log(`  App: ${testPayload.data.metadata.app}`);
  console.log(`  Event: ${testPayload.event}\n`);

  const payloadString = JSON.stringify(testPayload);
  const signature = generateSignature(testPayload);

  console.log('📤 Sending webhook to NeXAI router...\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature,
      },
      body: payloadString,
    });

    const responseText = await response.text();

    console.log('📨 Response from NeXAI router:');
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Body: ${responseText}\n`);

    if (response.ok) {
      console.log('✅ Webhook received successfully by NeXAI router');
      console.log('\n📋 Next Steps:');
      console.log('1. Check Supabase webhook_forward_logs table:');
      console.log(`   SELECT * FROM webhook_forward_logs WHERE reference = '${testPayload.data.reference}';`);
      console.log('\n2. Check ElevenOne logs to confirm forwarding:');
      console.log('   - Verify webhook was received at https://elevenoneapp.com/api/webhooks/paystack');
      console.log('   - Confirm header x-router-source: nexai-paystack-router');
      console.log('\n3. Check elevenone_subscriptions table:');
      console.log(`   SELECT * FROM elevenone_subscriptions WHERE reference = '${testPayload.data.reference}';`);
    } else {
      console.error('❌ Webhook failed');
      console.error(`Error: ${responseText}`);
    }

  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
    process.exit(1);
  }
}

// Run test
testWebhookForwarding();
