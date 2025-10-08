/**
 * Script to sync Supabase Auth users to Prisma database
 * Run with: npx tsx scripts/sync-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncUsers() {
  try {
    console.log('🔄 Starting user sync...');

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all users from Supabase Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error fetching users from Supabase:', error);
      return;
    }

    console.log(`📊 Found ${users?.length || 0} users in Supabase Auth`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const user of users || []) {
      try {
        const result = await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email || '',
            emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
            updatedAt: new Date(),
          },
          create: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            plan: 'free',
            subscriptionStatus: 'inactive',
            emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
            updatedAt: new Date(),
            last_reset_date: new Date(),
            preferred_model: 'gpt-4o-mini',
            preferred_temperature: 0.7,
            chat_used_today: 0,
            videos_generated_this_week: 0,
            voice_minutes_this_week: 0,
            images_generated_this_week: 0,
          }
        });

        // Check if it was created or updated
        const existing = await prisma.user.findUnique({ where: { id: user.id } });
        if (existing) {
          updated++;
          console.log(`✅ Updated user: ${user.email}`);
        } else {
          created++;
          console.log(`✅ Created user: ${user.email}`);
        }
      } catch (error: any) {
        console.error(`❌ Error syncing user ${user.email}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${users?.length || 0}`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsers();