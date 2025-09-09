#!/usr/bin/env tsx

/**
 * Knowledge Base Document Ingestion Script
 * 
 * Uses OpenAI text-embedding-3-small (1536 dimensions) for Supabase compatibility
 * Processes .txt files from /knowledge directory with robust re-ingestion support
 * 
 * Usage: npx tsx ingestDocs.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Configuration
const CONFIG = {
  knowledgeDir: './knowledge',
  chunkSize: 1000, // ~1000 tokens per chunk
  chunkOverlap: 100, // ~100 token overlap
  embeddingModel: 'text-embedding-3-small', // 1536 dimensions - compatible with HNSW
  embeddingDimensions: 1536,
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  batchSize: 5, // Smaller batches for stability
  rateLimitDelay: 200, // milliseconds between API calls
} as const;

// Types
interface DocumentChunk {
  content: string;
  source: string;
  chunk_index: number;
  token_count: number;
  embedding: number[];
}

interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  processedChunks: number;
  skippedFiles: number;
  errors: string[];
  startTime: Date;
  fileStats: Record<string, { chunks: number; tokens: number }>;
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const encoder = encoding_for_model('gpt-4');

/**
 * Enhanced Logger with colors and formatting
 */
class Logger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  static info(message: string): void {
    console.log(`\x1b[36m[${this.formatTime()}]\x1b[0m ${message}`);
  }

  static success(message: string): void {
    console.log(`\x1b[32m[${this.formatTime()}]\x1b[0m ✅ ${message}`);
  }

  static warn(message: string): void {
    console.log(`\x1b[33m[${this.formatTime()}]\x1b[0m ⚠️  ${message}`);
  }

  static error(message: string): void {
    console.error(`\x1b[31m[${this.formatTime()}]\x1b[0m ❌ ${message}`);
  }

  static progress(message: string): void {
    console.log(`\x1b[35m[${this.formatTime()}]\x1b[0m 🔄 ${message}`);
  }

  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`\x1b[90m[${this.formatTime()}]\x1b[0m ${message}`);
    }
  }
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Count tokens in text using tiktoken
 */
function countTokens(text: string): number {
  try {
    return encoder.encode(text).length;
  } catch (error) {
    Logger.warn(`Token counting failed, using character approximation: ${error}`);
    return Math.ceil(text.length / 4); // Rough approximation: 4 chars ≈ 1 token
  }
}

/**
 * Split text into chunks with smart overlap
 */
function chunkText(text: string, maxTokens: number = CONFIG.chunkSize, overlap: number = CONFIG.chunkOverlap): string[] {
  // Split into sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceText = sentence.trim() + '.';
    const sentenceTokens = countTokens(sentenceText);
    
    // If adding this sentence would exceed our token limit
    if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from the end of current chunk
      const overlapText = getOverlapText(currentChunk, overlap);
      currentChunk = overlapText + sentenceText;
      currentTokens = countTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentenceText;
      currentTokens = countTokens(currentChunk);
    }
  }

  // Add the final chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // If no chunks were created (very short text), return the original text
  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Get overlap text from the end of a chunk
 */
function getOverlapText(text: string, targetTokens: number): string {
  const words = text.split(' ');
  let overlapText = '';
  let tokens = 0;

  // Build overlap text from the end, word by word
  for (let i = words.length - 1; i >= 0 && tokens < targetTokens; i--) {
    const testText = words[i] + (overlapText ? ' ' + overlapText : '');
    const testTokens = countTokens(testText);
    
    if (testTokens <= targetTokens) {
      overlapText = testText;
      tokens = testTokens;
    } else {
      break;
    }
  }

  return overlapText ? overlapText + ' ' : '';
}

/**
 * Generate embedding with retry logic
 */
async function generateEmbedding(text: string, retries: number = CONFIG.maxRetries): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      Logger.debug(`Generating embedding (attempt ${attempt}/${retries})`);
      
      const response = await openai.embeddings.create({
        model: CONFIG.embeddingModel,
        input: text,
        dimensions: CONFIG.embeddingDimensions,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received from OpenAI');
      }

      const embedding = response.data[0].embedding;
      Logger.debug(`Generated embedding with ${embedding.length} dimensions`);
      
      return embedding;
    } catch (error: any) {
      Logger.warn(`Embedding generation attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === retries) {
        throw new Error(`Failed to generate embedding after ${retries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
      Logger.debug(`Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }

  throw new Error('This should never be reached');
}

/**
 * Delete existing documents for a source file
 */
async function deleteExistingDocuments(source: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('source', source)
      .select('id');

    if (error) {
      throw error;
    }

    return data?.length || 0;
  } catch (error: any) {
    throw new Error(`Failed to delete existing documents for ${source}: ${error.message}`);
  }
}

/**
 * Insert document chunks into Supabase
 */
async function insertDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .insert(chunks.map(chunk => ({
        content: chunk.content,
        embedding: chunk.embedding,
        source: chunk.source,
        chunk_index: chunk.chunk_index,
        token_count: chunk.token_count,
      })));

    if (error) {
      throw error;
    }
  } catch (error: any) {
    throw new Error(`Failed to insert document chunks: ${error.message}`);
  }
}

/**
 * Process a single file
 */
async function processFile(filePath: string, filename: string, stats: ProcessingStats): Promise<void> {
  try {
    Logger.progress(`Processing ${filename}...`);

    // Read file content
    const content = readFileSync(filePath, 'utf8').trim();
    if (!content) {
      Logger.warn(`Skipping empty file: ${filename}`);
      stats.skippedFiles++;
      return;
    }

    const fileSize = statSync(filePath).size;
    Logger.info(`📄 ${filename} (${fileSize} bytes, ${countTokens(content)} tokens)`);

    // Delete existing documents for this file (re-ingestion safety)
    const deletedCount = await deleteExistingDocuments(filename);
    if (deletedCount > 0) {
      Logger.info(`🗑️  Deleted ${deletedCount} existing chunks for ${filename}`);
    }

    // Split into chunks
    const textChunks = chunkText(content);
    Logger.info(`📝 Split into ${textChunks.length} chunks`);
    stats.totalChunks += textChunks.length;
    
    // Initialize file stats
    stats.fileStats[filename] = { chunks: textChunks.length, tokens: countTokens(content) };

    // Process chunks in batches
    const documentChunks: DocumentChunk[] = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      const tokenCount = countTokens(chunkText);
      
      try {
        Logger.debug(`Processing chunk ${i + 1}/${textChunks.length} for ${filename}`);
        
        // Add rate limiting delay
        if (i > 0) {
          await sleep(CONFIG.rateLimitDelay);
        }
        
        const embedding = await generateEmbedding(chunkText);
        
        documentChunks.push({
          content: chunkText,
          source: filename,
          chunk_index: i,
          token_count: tokenCount,
          embedding,
        });

        stats.processedChunks++;
        
        // Insert in batches to avoid large memory usage
        if (documentChunks.length >= CONFIG.batchSize || i === textChunks.length - 1) {
          await insertDocumentChunks(documentChunks);
          Logger.debug(`✅ Inserted batch of ${documentChunks.length} chunks for ${filename}`);
          documentChunks.length = 0; // Clear the array
        }
        
      } catch (error: any) {
        const errorMsg = `Failed to process chunk ${i + 1} of ${filename}: ${error.message}`;
        Logger.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    stats.processedFiles++;
    Logger.success(`Completed ${filename}: ${textChunks.length} chunks processed`);

  } catch (error: any) {
    const errorMsg = `Failed to process file ${filename}: ${error.message}`;
    Logger.error(errorMsg);
    stats.errors.push(errorMsg);
  }
}

/**
 * Verify database schema exists
 */
async function verifySchema(): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Schema verification failed: ${error.message}\n\nPlease run the updated-schema.sql in your Supabase dashboard first.`);
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Main ingestion function
 */
async function ingestDocuments(): Promise<void> {
  const stats: ProcessingStats = {
    totalFiles: 0,
    processedFiles: 0,
    totalChunks: 0,
    processedChunks: 0,
    skippedFiles: 0,
    errors: [],
    startTime: new Date(),
    fileStats: {},
  };

  try {
    Logger.info('🚀 Starting Knowledge Base Document Ingestion');
    Logger.info(`📂 Knowledge directory: ${CONFIG.knowledgeDir}`);
    Logger.info(`🔧 Chunk size: ~${CONFIG.chunkSize} tokens`);
    Logger.info(`🔄 Chunk overlap: ~${CONFIG.chunkOverlap} tokens`);
    Logger.info(`🤖 Embedding model: ${CONFIG.embeddingModel} (${CONFIG.embeddingDimensions}D)`);
    Logger.info('');

    // Verify required environment variables
    const requiredEnvs = ['OPENAI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
    }

    // Verify database schema
    await verifySchema();
    Logger.success('Database schema verified');

    // Read knowledge directory
    if (!readdirSync(CONFIG.knowledgeDir)) {
      throw new Error(`Knowledge directory not found: ${CONFIG.knowledgeDir}`);
    }

    const files = readdirSync(CONFIG.knowledgeDir)
      .filter(file => extname(file).toLowerCase() === '.txt')
      .sort();

    if (files.length === 0) {
      throw new Error(`No .txt files found in ${CONFIG.knowledgeDir}`);
    }

    stats.totalFiles = files.length;
    Logger.info(`📚 Found ${files.length} .txt files to process`);
    Logger.info('');

    // Process each file
    for (const filename of files) {
      const filePath = join(CONFIG.knowledgeDir, filename);
      await processFile(filePath, filename, stats);
      
      // Add delay between files to be respectful to APIs
      if (files.indexOf(filename) < files.length - 1) {
        await sleep(CONFIG.rateLimitDelay);
      }
      Logger.info(''); // Add spacing between files
    }

    // Final report
    const duration = Date.now() - stats.startTime.getTime();
    const durationMin = (duration / 1000 / 60).toFixed(2);

    Logger.info('');
    Logger.success('🎉 Document ingestion completed!');
    Logger.info('');
    Logger.info('📊 PROCESSING SUMMARY');
    Logger.info('═══════════════════');
    Logger.info(`📁 Files processed: ${stats.processedFiles}/${stats.totalFiles}`);
    Logger.info(`📝 Total chunks: ${stats.processedChunks}/${stats.totalChunks}`);
    Logger.info(`⏱️  Duration: ${durationMin} minutes`);
    Logger.info(`❌ Errors: ${stats.errors.length}`);
    if (stats.skippedFiles > 0) {
      Logger.info(`⏭️  Skipped files: ${stats.skippedFiles}`);
    }
    Logger.info('');

    // File-by-file breakdown
    Logger.info('📋 FILE BREAKDOWN');
    Logger.info('═════════════════');
    Object.entries(stats.fileStats).forEach(([filename, fileStats]) => {
      Logger.info(`📄 ${filename}: ${fileStats.chunks} chunks, ${fileStats.tokens} tokens`);
    });
    Logger.info('');

    if (stats.errors.length > 0) {
      Logger.warn('⚠️  ERRORS ENCOUNTERED');
      Logger.warn('═══════════════════');
      stats.errors.forEach((error, index) => {
        Logger.error(`${index + 1}. ${error}`);
      });
      Logger.info('');
    }

    // Success instructions
    Logger.success('✨ NEXT STEPS');
    Logger.success('════════════');
    Logger.success('1. Verify embeddings in Supabase:');
    Logger.info('   • Go to your Supabase dashboard');
    Logger.info('   • Navigate to Table Editor → documents');
    Logger.info(`   • You should see ${stats.processedChunks} rows`);
    Logger.info('');
    Logger.success('2. Test similarity search:');
    Logger.info('   SELECT source, content, 1 - (embedding <=> \'[your_query_embedding]\') AS similarity');
    Logger.info('   FROM documents ORDER BY embedding <=> \'[your_query_embedding]\' LIMIT 5;');
    Logger.info('');
    Logger.success('3. Use the match_documents function:');
    Logger.info('   SELECT * FROM match_documents(\'[your_query_embedding]\', 0.7, 10);');
    Logger.info('');
    Logger.info('🎯 Your knowledge base is ready for RAG integration!');

  } catch (error: any) {
    Logger.error(`💥 Ingestion failed: ${error.message}`);
    Logger.info('');
    Logger.info('🔧 TROUBLESHOOTING');
    Logger.info('═════════════════');
    Logger.info('1. Ensure your Supabase schema is up to date:');
    Logger.info('   • Run updated-schema.sql in your Supabase SQL Editor');
    Logger.info('2. Check your environment variables in .env.local');
    Logger.info('3. Verify your OpenAI API key has sufficient credits');
    Logger.info('4. Make sure your knowledge/*.txt files exist and are readable');
    process.exit(1);
  }
}

// Run the ingestion if this script is executed directly
if (require.main === module) {
  ingestDocuments().catch(error => {
    Logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export { ingestDocuments, CONFIG };