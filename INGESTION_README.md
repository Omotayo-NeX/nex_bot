# Knowledge Base Ingestion Guide

This guide shows you how to ingest your knowledge base documents using **OpenAI text-embedding-3-small** (1536 dimensions) for optimal Supabase compatibility.

## 🚀 Quick Start

### Step 1: Set Up Database Schema

1. **Copy the schema:** The updated schema is in `updated-schema.sql`
2. **Open Supabase Dashboard:** https://app.supabase.com/project/gxthnrdeuhiykybpfrae/sql
3. **Execute the schema:**
   - Click "New Query"
   - Paste the contents of `updated-schema.sql`
   - Click "Run"

### Step 2: Run Ingestion

```bash
# Standard ingestion
npm run ingest

# With debug logging  
npm run ingest:debug

# Or directly
npx tsx ingestDocs.ts
```

## 📋 What It Does

### ✅ **Automated Processing**
- Reads all `.txt` files from `/knowledge` directory
- Splits content into ~1000 token chunks with 100-token overlap
- Generates embeddings using `text-embedding-3-small` (1536D)
- Stores in Supabase with full text and vector search

### ✅ **Re-ingestion Safety** 
- **Smart Updates:** If you run ingestion again, it deletes old entries for each file first
- **No Duplicates:** You can drop in updated `.txt` files and rerun safely
- **Preserves Other Data:** Only removes/replaces data for files being processed

### ✅ **Robust Error Handling**
- Retry logic for API failures
- Rate limiting to respect OpenAI limits
- Detailed logging of which files were processed
- Comprehensive error reporting

### ✅ **Performance Features**
- Batch processing for efficient database insertions
- Progress tracking with file-by-file breakdown
- Memory efficient chunking
- Optimized for HNSW vector indexes

## 📊 Expected Output

When you run `npm run ingest`, you'll see:

```
🚀 Starting Knowledge Base Document Ingestion
📂 Knowledge directory: ./knowledge
🔧 Chunk size: ~1000 tokens
🔄 Chunk overlap: ~100 tokens
🤖 Embedding model: text-embedding-3-small (1536D)

✅ Database schema verified
📚 Found 8 .txt files to process

🔄 Processing ai.txt...
📄 ai.txt (14561 bytes, 3654 tokens)
📝 Split into 4 chunks
✅ Completed ai.txt: 4 chunks processed

🔄 Processing marketing.txt...
📄 marketing.txt (10493 bytes, 2623 tokens)
📝 Split into 3 chunks
✅ Completed marketing.txt: 3 chunks processed

... (continues for all files)

🎉 Document ingestion completed!

📊 PROCESSING SUMMARY
═══════════════════
📁 Files processed: 8/8
📝 Total chunks: 127/127
⏱️  Duration: 3.42 minutes
❌ Errors: 0

📋 FILE BREAKDOWN
═════════════════
📄 ai.txt: 4 chunks, 3654 tokens
📄 marketing.txt: 3 chunks, 2623 tokens
📄 automation.txt: 3 chunks, 2401 tokens
... (all files listed)
```

## 🔍 Verification Steps

### 1. Check Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor** → **documents**
2. You should see all your chunks (e.g., 127 rows)
3. Each row should have:
   - `content`: The actual text chunk
   - `embedding`: Vector array [1536 dimensions]
   - `source`: Filename (e.g., "ai.txt")
   - `chunk_index`: Position within file (0, 1, 2...)

### 2. Test Vector Search

Run this query in your Supabase SQL Editor:

```sql
-- Check document stats
SELECT * FROM document_stats ORDER BY total_chunks DESC;

-- Test basic query (replace with actual embedding)
SELECT 
    source, 
    chunk_index,
    LEFT(content, 100) as preview,
    token_count
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Test Similarity Search Function

```sql
-- This requires a real embedding vector from your app
SELECT * FROM match_documents(
    '[your_query_embedding_array]'::vector(1536),
    0.7,  -- similarity threshold
    5     -- max results
);
```

## 🔧 Database Schema

The new simplified schema uses a single `documents` table:

```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,                    -- The actual text chunk
  embedding vector(1536),                   -- 1536D embedding from text-embedding-3-small
  source text NOT NULL,                     -- filename (e.g., "ai.txt") 
  chunk_index integer DEFAULT 0,           -- chunk position within file
  token_count integer,                      -- number of tokens in chunk
  created_at timestamp with time zone,     -- when ingested
  updated_at timestamp with time zone      -- when last updated
);
```

### Key Features:
- ✅ **HNSW Index:** Optimized for 1536D vectors (avoids 2000D limit)
- ✅ **Fast Search:** Cosine similarity with `vector_cosine_ops`
- ✅ **Re-ingestion:** Clean removal by `source` filename
- ✅ **Query Function:** Built-in `match_documents()` function

## 🚨 Troubleshooting

### Common Issues:

**Schema Error:** `Could not find the table 'public.documents'`
- **Solution:** Run `updated-schema.sql` in Supabase SQL Editor first

**OpenAI API Error:** `Insufficient quota` or rate limits
- **Solution:** Check your OpenAI API key credits and usage

**Empty Files:** `Skipping empty file`
- **Solution:** Ensure your `.txt` files have content

**Environment Variables:** `Missing required environment variable`
- **Solution:** Check your `.env.local` file has:
  ```
  OPENAI_API_KEY=sk-proj-...
  NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
  ```

### Debug Mode:

Run with debug logging for detailed information:
```bash
npm run ingest:debug
```

## 🎯 Integration Ready

After successful ingestion, your knowledge base is ready for:

- **RAG (Retrieval Augmented Generation):** Use similarity search to find relevant chunks
- **Semantic Search:** Query by meaning, not just keywords
- **Context Retrieval:** Get the most relevant content for user queries
- **Knowledge Q&A:** Build intelligent chatbots with your domain knowledge

### Next Steps:
1. Integrate the `match_documents()` function into your chat API
2. Generate embeddings for user queries using the same model
3. Retrieve relevant chunks and feed them to your LLM for context
4. Build amazing knowledge-aware applications!

---

**File Sizes in Your Knowledge Base:**
- `ai_agents_n8n.txt`: 360 lines
- `web_dev.txt`: 215 lines  
- `social_media_marketing.txt`: 244 lines
- `business_entrepreneurship.txt`: 164 lines
- `ai.txt`: 144 lines
- `marketing.txt`: 144 lines
- `automation.txt`: 140 lines
- `online_jobs.txt`: 310 lines

**Total: 1,721 lines → ~127 searchable chunks → 1536D vector embeddings**