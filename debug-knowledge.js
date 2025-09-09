/**
 * Debug Knowledge Setup
 * Test if all environment variables are accessible
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

console.log('🔧 Environment Variables Check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');
console.log('');

// Test Supabase connection
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Testing Supabase connection...');
  supabase
    .from('documents')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Supabase Error:', error.message);
      } else {
        console.log('✅ Supabase connection successful');
        
        // Test actual document count
        return supabase.from('documents').select('*', { count: 'exact', head: true });
      }
    })
    .then(({ count, error }) => {
      if (error) {
        console.log('❌ Document count error:', error.message);
      } else {
        console.log(`📊 Total documents in knowledge base: ${count}`);
      }
    })
    .catch(err => {
      console.log('❌ Supabase test failed:', err);
    });
} else {
  console.log('❌ Supabase credentials missing, skipping connection test');
}

// Test OpenAI
if (process.env.OPENAI_API_KEY) {
  console.log('🤖 Testing OpenAI connection...');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: 'test query',
    dimensions: 1536,
  })
  .then((response) => {
    console.log('✅ OpenAI embedding API successful');
    console.log(`📐 Embedding dimensions: ${response.data[0].embedding.length}`);
  })
  .catch((error) => {
    console.log('❌ OpenAI embedding error:', error.message);
  });
} else {
  console.log('❌ OpenAI API key missing, skipping connection test');
}