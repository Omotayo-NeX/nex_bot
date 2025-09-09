/**
 * Knowledge Base Retrieval System
 * Handles semantic search and context retrieval for RAG
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Types
interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  chunk_index: number;
  similarity: number;
}

interface RetrievalOptions {
  maxChunks?: number;
  similarityThreshold?: number;
  filterSource?: string;
}

interface KnowledgeContext {
  chunks: KnowledgeChunk[];
  sources: string[];
  context: string;
  hasRelevantKnowledge: boolean;
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate embedding for a query using the same model as ingestion
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Must match ingestion model
      input: query,
      dimensions: 1536, // Must match ingestion dimensions
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No embedding data received from OpenAI');
    }

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('❌ [Knowledge] Failed to generate query embedding:', error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Search knowledge base for relevant chunks
 */
export async function searchKnowledgeBase(
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  const {
    maxChunks = 5,
    similarityThreshold = 0.7,
    filterSource = null
  } = options;

  try {
    console.log('🔍 [Knowledge] Searching knowledge base...');
    console.log(`🎯 [Knowledge] Options: maxChunks=${maxChunks}, threshold=${similarityThreshold}, source=${filterSource}`);

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: maxChunks,
      filter_source: filterSource
    });

    if (error) {
      console.error('❌ [Knowledge] Supabase search error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('📭 [Knowledge] No relevant chunks found');
      return [];
    }

    const chunks: KnowledgeChunk[] = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      source: item.source,
      chunk_index: item.chunk_index,
      similarity: parseFloat(item.similarity.toFixed(3))
    }));

    console.log(`✅ [Knowledge] Found ${chunks.length} relevant chunks`);
    chunks.forEach((chunk, i) => {
      console.log(`📄 [Knowledge] Chunk ${i + 1}: ${chunk.source} (similarity: ${chunk.similarity})`);
    });

    return chunks;
  } catch (error: any) {
    console.error('❌ [Knowledge] Search failed:', error);
    throw new Error(`Knowledge search failed: ${error.message}`);
  }
}

/**
 * Get knowledge context for a user query
 */
export async function getKnowledgeContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeContext> {
  try {
    console.log('🧠 [Knowledge] Getting context for query:', query.slice(0, 100) + '...');

    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);

    // Search for relevant chunks
    const chunks = await searchKnowledgeBase(queryEmbedding, options);

    if (chunks.length === 0) {
      return {
        chunks: [],
        sources: [],
        context: '',
        hasRelevantKnowledge: false
      };
    }

    // Extract unique sources
    const sources = [...new Set(chunks.map(chunk => chunk.source))];

    // Build context string
    const context = chunks
      .map((chunk, index) => `[Source: ${chunk.source}]\n${chunk.content}`)
      .join('\n\n');

    console.log(`📚 [Knowledge] Context built from ${chunks.length} chunks across ${sources.length} sources`);
    console.log(`📖 [Knowledge] Sources: ${sources.join(', ')}`);

    return {
      chunks,
      sources,
      context,
      hasRelevantKnowledge: true
    };
  } catch (error: any) {
    console.error('❌ [Knowledge] Failed to get context:', error);
    return {
      chunks: [],
      sources: [],
      context: '',
      hasRelevantKnowledge: false
    };
  }
}

/**
 * Check if a query would benefit from knowledge retrieval
 */
export function shouldUseKnowledge(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Skip knowledge for very short or simple queries
  if (query.length < 10) {
    return false;
  }

  // Skip for greeting/casual conversation
  const casualPatterns = [
    /^(hi|hello|hey|thanks|thank you|bye|goodbye)$/,
    /^(how are you|what's up|what up)$/,
    /^(ok|okay|alright|sure)$/,
    /^(continue|go on|next|more)$/
  ];

  if (casualPatterns.some(pattern => pattern.test(lowerQuery.trim()))) {
    return false;
  }

  // Use knowledge for specific domain queries
  const knowledgeKeywords = [
    'marketing', 'automation', 'ai', 'business', 'entrepreneurship',
    'social media', 'web development', 'online jobs', 'strategy',
    'tools', 'tips', 'how to', 'what is', 'explain', 'guide',
    'process', 'workflow', 'campaign', 'seo', 'content', 'email',
    'sales', 'leads', 'customers', 'revenue', 'growth', 'agency',
    'freelance', 'startup', 'digital', 'technology', 'platform',
    'n8n', 'zapier', 'chatbot', 'wordpress', 'ecommerce'
  ];

  const hasKnowledgeKeywords = knowledgeKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  );

  console.log(`🤔 [Knowledge] Should use knowledge for "${query.slice(0, 50)}..."? ${hasKnowledgeKeywords}`);
  
  return hasKnowledgeKeywords;
}

/**
 * Format knowledge sources for display
 */
export function formatKnowledgeSources(sources: string[]): string {
  if (sources.length === 0) return '';
  
  const sourceNames = sources.map(source => source.replace('.txt', ''));
  
  if (sources.length === 1) {
    return `\n\n*Source: ${sourceNames[0]}*`;
  }
  
  return `\n\n*Sources: ${sourceNames.join(', ')}*`;
}

/**
 * Validate environment setup
 */
export function validateKnowledgeSetup(): boolean {
  const requiredEnvs = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredEnvs.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ [Knowledge] Missing environment variables:', missing);
    return false;
  }

  return true;
}