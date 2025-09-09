/**
 * Simple RAG Testing Script
 * Tests the knowledge-enhanced chat API with various queries
 */

const testQueries = [
  {
    name: "Marketing Automation",
    query: "What are the best marketing automation tools?"
  },
  {
    name: "AI Agents & n8n", 
    query: "How do I create AI agent workflows with n8n?"
  },
  {
    name: "Social Media Marketing",
    query: "What are effective social media marketing strategies?"
  },
  {
    name: "Web Development",
    query: "What are the modern web development best practices?"
  },
  {
    name: "General Business",
    query: "How can I grow my online business?"
  }
];

async function testRAG() {
  console.log('🧪 Testing RAG-Enhanced Chat API\n');
  
  for (const test of testQueries) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`❓ Query: "${test.query}"`);
      
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: test.query }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Response received (${data.response.length} chars)`);
      
      // Check for knowledge sources in metadata
      if (data._metadata?.hasKnowledge) {
        console.log(`🧠 Knowledge used: YES`);
        console.log(`📚 Sources: ${data._metadata.sources.join(', ')}`);
        console.log(`📄 Chunks used: ${data._metadata.chunksUsed}`);
      } else {
        console.log(`🧠 Knowledge used: NO`);
      }
      
      console.log(`📝 Preview: "${data.response.substring(0, 100)}..."`);
      console.log('─'.repeat(80));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Test "${test.name}" failed:`, error.message);
      console.log('─'.repeat(80));
    }
  }
  
  console.log('\n🎉 RAG Testing Complete!');
}

// Run the tests
testRAG();