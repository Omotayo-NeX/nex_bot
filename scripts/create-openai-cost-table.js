const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createOpenAICostTable() {
  try {
    console.log('Creating OpenAICost table...');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OpenAICost" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "model" TEXT NOT NULL,
        "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
        "completion_tokens" INTEGER NOT NULL DEFAULT 0,
        "total_tokens" INTEGER NOT NULL DEFAULT 0,
        "estimated_cost" DOUBLE PRECISION NOT NULL,
        "feature" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OpenAICost_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✅ Table created successfully');

    console.log('Creating index...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "OpenAICost_user_id_created_at_idx"
      ON "OpenAICost"("user_id", "created_at");
    `);

    console.log('✅ Index created successfully');
    console.log('🎉 OpenAICost table setup complete!');

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createOpenAICostTable()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
