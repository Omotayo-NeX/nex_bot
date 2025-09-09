#!/usr/bin/env tsx

/**
 * Supabase Schema Setup Script
 * 
 * This script helps set up the database schema for the knowledge base
 * embeddings system by providing the SQL and verification.
 * 
 * Usage: npx tsx setupSchema.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

/**
 * Logger utility with timestamps and colors
 */
class Logger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  static info(message: string): void {
    console.log(`\x1b[36m[${this.formatTime()}]\x1b[0m ${message}`);
  }

  static success(message: string): void {
    console.log(`\x1b[32m[${this.formatTime()}]\x1b[0m ✓ ${message}`);
  }

  static warn(message: string): void {
    console.log(`\x1b[33m[${this.formatTime()}]\x1b[0m ⚠ ${message}`);
  }

  static error(message: string): void {
    console.error(`\x1b[31m[${this.formatTime()}]\x1b[0m ✗ ${message}`);
  }

  static step(message: string): void {
    console.log(`\x1b[35m[${this.formatTime()}]\x1b[0m 🔧 ${message}`);
  }

  static code(message: string): void {
    console.log(`\x1b[90m${message}\x1b[0m`);
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check if schema exists
 */
async function checkSchema(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
}

/**
 * Create tables directly using Supabase client
 */
async function createSchemaDirectly(): Promise<boolean> {
  try {
    Logger.step('Attempting direct table creation...');
    
    // This is a simplified approach - we'll create basic tables
    // The user will need to run the full SQL in Supabase dashboard for advanced features
    
    Logger.info('Direct schema creation has limitations.');
    Logger.info('Please follow the manual setup instructions below.');
    
    return false;
  } catch (error: any) {
    Logger.warn(`Direct creation failed: ${error.message}`);
    return false;
  }
}

/**
 * Setup database schema
 */
async function setupSchema(): Promise<void> {
  try {
    Logger.info('🚀 Starting Supabase Schema Setup');

    // Verify required environment variables
    const requiredEnvs = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
    }

    Logger.success('Environment variables verified');

    // Check if schema already exists
    const schemaExists = await checkSchema();
    
    if (schemaExists) {
      Logger.success('✅ Database schema already exists!');
      Logger.info('🎯 You can now run: npm run ingest');
      return;
    }

    Logger.info('📋 Database schema needs to be created');
    
    // Try direct creation first
    const directSuccess = await createSchemaDirectly();
    
    if (!directSuccess) {
      // Provide manual setup instructions
      Logger.info('');
      Logger.info('📝 MANUAL SETUP REQUIRED');
      Logger.info('================================');
      Logger.info('');
      Logger.info('Please follow these steps to set up your database schema:');
      Logger.info('');
      Logger.info('1. Open your Supabase dashboard:');
      Logger.code(`   https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/sql`);
      Logger.info('');
      Logger.info('2. Click "New Query" in the SQL Editor');
      Logger.info('');
      Logger.info('3. Copy and paste the following SQL schema:');
      Logger.info('');
      
      try {
        const schema = readFileSync('./embeddings-schema.sql', 'utf8');
        Logger.code('-- Copy this SQL to your Supabase SQL Editor:');
        Logger.code('');
        Logger.code(schema);
        Logger.info('');
      } catch (fileError) {
        Logger.error('Could not read embeddings-schema.sql file');
        Logger.info('Please make sure the embeddings-schema.sql file exists');
      }
      
      Logger.info('4. Click "Run" to execute the schema');
      Logger.info('');
      Logger.info('5. After successful execution, run:');
      Logger.code('   npm run ingest');
      Logger.info('');
      Logger.info('💡 Alternatively, you can copy the schema from embeddings-schema.sql');
    }

  } catch (error: any) {
    Logger.error(`💥 Schema setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the schema setup if this script is executed directly
if (require.main === module) {
  setupSchema().catch(error => {
    Logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export { setupSchema, checkSchema };