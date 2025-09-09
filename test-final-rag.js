/**
 * Final RAG System Test
 * Comprehensive testing of knowledge-enhanced chat responses
 */

const testQueries = [
  {
    name: "n8n Automation",
    query: "How does n8n work for business automation?",
    expectKnowledge: true,
    expectedSources: ["ai_agents_n8n.txt"]
  },
  {
    name: "Social Media Marketing",
    query: "What are the best social media marketing strategies?",
    expectKnowledge: true,
    expectedSources: ["social_media_marketing.txt"]
  },
  {
    name: "Web Development",
    query: "What are modern web development practices?",
    expectKnowledge: true,
    expectedSources: ["web_dev.txt"]
  },
  {
    name: "Marketing Automation",
    query: "How can I automate my marketing processes?",
    expectKnowledge: true,
    expectedSources: ["marketing.txt", "automation.txt"]
  },
  {
    name: "Business Growth",
    query: "How can entrepreneurs grow their business?",
    expectKnowledge: true,
    expectedSources: ["business_entrepreneurship.txt"]
  },
  {
    name: "Casual Query",
    query: "Hi, how are you?",
    expectKnowledge: false,
    expectedSources: []
  }
];

async function runFinalTest() {
  console.log('🧪 FINAL RAG SYSTEM TEST');
  console.log('═'.repeat(50));
  console.log('');
  
  let passedTests = 0;
  let totalTests = testQueries.length;
  
  for (const test of testQueries) {
    try {
      console.log(`🔍 Test: ${test.name}`);
      console.log(`❓ Query: "${test.query}"`);
      
      const response = await fetch('http://localhost:3001/api/chat', {
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
      const hasKnowledge = data._metadata?.hasKnowledge || false;
      const sources = data._metadata?.sources || [];
      
      // Check if knowledge expectation is met
      let testPassed = true;
      let testResults = [];
      
      if (test.expectKnowledge !== hasKnowledge) {
        testResults.push(`❌ Expected knowledge: ${test.expectKnowledge}, got: ${hasKnowledge}`);
        testPassed = false;
      } else {
        testResults.push(`✅ Knowledge expectation met: ${hasKnowledge}`);
      }
      
      if (hasKnowledge) {
        testResults.push(`📚 Sources: ${sources.join(', ')}`);
        testResults.push(`📄 Chunks used: ${data._metadata?.chunksUsed || 0}`);
        
        // Check if any expected source matches
        if (test.expectedSources.length > 0) {
          const hasExpectedSource = test.expectedSources.some(expectedSource =>
            sources.some(source => source.includes(expectedSource.replace('.txt', '')))
          );
          if (hasExpectedSource) {
            testResults.push(`✅ Expected source found`);
          } else {
            testResults.push(`⚠️  Expected sources: ${test.expectedSources.join(', ')}`);
          }
        }
      }
      
      // Show response preview
      const preview = data.response.substring(0, 150) + '...';
      testResults.push(`📝 Response: "${preview}"`);
      
      if (testPassed) {
        console.log('✅ PASSED');
        passedTests++;
      } else {
        console.log('❌ FAILED');
      }
      
      testResults.forEach(result => console.log(`   ${result}`));
      console.log('─'.repeat(80));
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Test "${test.name}" error:`, error.message);
      console.log('─'.repeat(80));
    }
  }
  
  console.log('');
  console.log('🎯 FINAL RESULTS');
  console.log('═'.repeat(50));
  console.log(`✅ Tests passed: ${passedTests}/${totalTests}`);
  console.log(`📊 Success rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! RAG system is working perfectly!');
    console.log('🚀 Your NeX AI now has knowledge-enhanced responses!');
  } else {
    console.log('⚠️  Some tests failed. Check the results above.');
  }
}

// Run the comprehensive test
runFinalTest();