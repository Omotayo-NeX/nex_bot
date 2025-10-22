const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCostTracking() {
  try {
    console.log('🔍 Verifying OpenAICost table...');

    // Check if table exists and is queryable
    const count = await prisma.openAICost.count();
    console.log(`✅ Table is accessible. Current record count: ${count}`);

    // Test insert
    console.log('\n📝 Testing cost tracking insert...');
    const testRecord = await prisma.openAICost.create({
      data: {
        userId: '00000000-0000-0000-0000-000000000000', // test UUID
        model: 'gpt-4o-mini',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        estimatedCost: 0.000023, // $0.000023
        feature: 'chat',
      },
    });

    console.log('✅ Test record created:', {
      id: testRecord.id,
      model: testRecord.model,
      totalTokens: testRecord.totalTokens,
      estimatedCost: `$${testRecord.estimatedCost.toFixed(6)}`,
      feature: testRecord.feature,
    });

    // Clean up test record
    await prisma.openAICost.delete({
      where: { id: testRecord.id },
    });
    console.log('✅ Test record cleaned up');

    console.log('\n🎉 Cost tracking is fully operational!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyCostTracking()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
