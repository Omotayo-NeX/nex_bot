// Test script to verify Supabase tables are accessible
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTables() {
  console.log('🔍 Testing Supabase subscription tables...\n');

  try {
    // Test nexai_subscriptions
    console.log('Testing nexai_subscriptions table...');
    const nexaiRes = await supabase
      .from('nexai_subscriptions')
      .select('*')
      .limit(5);

    if (nexaiRes.error) {
      console.error('❌ nexai_subscriptions error:', nexaiRes.error.message);
    } else {
      console.log(`✅ nexai_subscriptions: ${nexaiRes.data.length} records found`);
      if (nexaiRes.data.length > 0) {
        console.log('   Sample record:', JSON.stringify(nexaiRes.data[0], null, 2));
      }
    }

    console.log('\nTesting elevenone_subscriptions table...');
    const elevenRes = await supabase
      .from('elevenone_subscriptions')
      .select('*')
      .limit(5);

    if (elevenRes.error) {
      console.error('❌ elevenone_subscriptions error:', elevenRes.error.message);
    } else {
      console.log(`✅ elevenone_subscriptions: ${elevenRes.data.length} records found`);
      if (elevenRes.data.length > 0) {
        console.log('   Sample record:', JSON.stringify(elevenRes.data[0], null, 2));
      }
    }

    console.log('\n✨ Test complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTables();
