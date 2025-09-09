# Knowledge Base Document Ingestion System

This system automatically processes text files from your `/knowledge` directory, creates semantic embeddings, and stores them in Supabase for retrieval-augmented generation (RAG).

## 🚀 Quick Start

### 1. Set up Supabase Database

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the schema to your clipboard
cat embeddings-schema.sql
```

Then paste and execute it in your Supabase dashboard.

### 2. Run the Ingestion Script

```bash
npx tsx ingestDocs.ts
```

## 📁 File Structure

```
/knowledge/                    # Your knowledge base files
├── ai.txt
├── marketing.txt
├── automation.txt
└── ...                       # All .txt files are processed

ingestDocs.ts                 # Main ingestion script
embeddings-schema.sql         # Database schema
```

## 🔧 Configuration

The script uses these configurable settings:

```typescript
const CONFIG = {
  knowledgeDir: './knowledge',
  chunkSize: 1000,              // ~1000 tokens per chunk
  chunkOverlap: 100,           // ~100 token overlap between chunks
  embeddingModel: 'text-embedding-3-large',
  embeddingDimensions: 3072,
  maxRetries: 3,
  batchSize: 10,               // Chunks processed in parallel
  rateLimitDelay: 100,         // ms between API calls
}
```

## 📊 What the Script Does

1. **File Discovery**: Automatically finds all `.txt` files in `/knowledge`
2. **Duplicate Detection**: Skips files that haven't changed (using SHA-256 hash)
3. **Smart Chunking**: 
   - Splits text into ~1000 token chunks
   - Maintains ~100 token overlap between chunks
   - Preserves sentence boundaries
4. **Embedding Generation**: Uses OpenAI's `text-embedding-3-large` (3072 dimensions)
5. **Storage**: Stores in Supabase with pgvector for similarity search
6. **Rate Limiting**: Respects API limits with exponential backoff
7. **Error Handling**: Comprehensive logging and retry logic

## 🗃️ Database Schema

### `documents` table:
- `id`: UUID primary key
- `filename`: Original filename
- `content`: Full file content
- `file_size`: Size in bytes
- `file_hash`: SHA-256 hash for change detection
- `created_at`, `updated_at`: Timestamps

### `document_chunks` table:
- `id`: UUID primary key
- `document_id`: Foreign key to documents
- `chunk_index`: Order within document
- `content`: Chunk text content
- `token_count`: Number of tokens
- `embedding`: Vector(3072) for similarity search

## 🔍 Similarity Search

Use the built-in function for semantic search:

```sql
SELECT * FROM match_documents(
  query_embedding := '[your_query_embedding_vector]',
  match_threshold := 0.5,
  match_count := 10
);
```

## 📈 Performance Features

- **Batch Processing**: Processes multiple chunks simultaneously
- **Rate Limiting**: Built-in delays to respect API limits
- **Caching**: Only re-processes files that have changed
- **Progress Tracking**: Real-time logging and statistics
- **Error Recovery**: Continues processing even if individual chunks fail

## 🔐 Environment Variables Required

```bash
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📝 Example Output

```
[2024-09-09 08:17:45] 🚀 Starting Knowledge Base Document Ingestion
[2024-09-09 08:17:45] Knowledge directory: ./knowledge
[2024-09-09 08:17:45] Chunk size: ~1000 tokens
[2024-09-09 08:17:45] Chunk overlap: ~100 tokens
[2024-09-09 08:17:45] Embedding model: text-embedding-3-large
[2024-09-09 08:17:45] ✓ Supabase connection verified
[2024-09-09 08:17:45] Found 8 .txt files to process
[2024-09-09 08:17:46] Processing file: ai.txt
[2024-09-09 08:17:46] ✓ Stored document: ai.txt (ID: 123e4567-e89b-12d3-a456-426614174000)
[2024-09-09 08:17:47] Split ai.txt into 15 chunks
[2024-09-09 08:17:52] ✓ Completed processing ai.txt
[2024-09-09 08:17:52] Processing file: marketing.txt
...
[2024-09-09 08:20:15] ✅ Document ingestion completed!
[2024-09-09 08:20:15] 📊 Processing Summary:
[2024-09-09 08:20:15]    Files processed: 8/8
[2024-09-09 08:20:15]    Chunks processed: 127/127
[2024-09-09 08:20:15]    Duration: 2.50 minutes
[2024-09-09 08:20:15]    Errors: 0
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variable: OPENAI_API_KEY
   ```
   Solution: Check your `.env.local` file

2. **Supabase Connection Failed**
   ```
   Error: Supabase connection failed: Invalid API key
   ```
   Solution: Verify your Supabase URL and service role key

3. **Rate Limit Errors**
   ```
   Error: Rate limit exceeded
   ```
   Solution: The script has built-in retry logic, but you can increase delays in CONFIG

4. **No Files Found**
   ```
   Error: No .txt files found in ./knowledge
   ```
   Solution: Ensure your `.txt` files are in the `/knowledge` directory

### Debug Mode

Enable debug logging:
```bash
DEBUG=1 npx tsx ingestDocs.ts
```

## 🔄 Re-running the Script

The script is designed to be run multiple times safely:
- Only processes files that have changed (based on content hash)
- Skips unchanged files automatically
- Updates existing documents when content changes

## 🎯 Integration with Your App

After running the ingestion, you can use the embeddings for:
- Semantic search in your chat interface
- Context retrieval for RAG (Retrieval Augmented Generation)
- Knowledge base queries
- Similar document recommendations

Example integration code will depend on your specific use case and framework.