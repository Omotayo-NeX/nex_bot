-- Updated Knowledge Base Schema for Supabase
-- Uses text-embedding-3-small (1536 dimensions) compatible with HNSW indexes
-- Execute this in your Supabase SQL Editor

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Create simplified documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  source text NOT NULL, -- filename of the source document
  chunk_index integer DEFAULT 0, -- chunk position within the source file
  token_count integer, -- number of tokens in this chunk
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX documents_source_idx ON documents(source);
CREATE INDEX documents_chunk_index_idx ON documents(chunk_index);
CREATE INDEX documents_created_at_idx ON documents(created_at);

-- HNSW index for vector similarity search (works with 1536 dimensions)
CREATE INDEX documents_embedding_idx ON documents 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_source text DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    content text,
    source text,
    chunk_index integer,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.content,
        d.source,
        d.chunk_index,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    WHERE 
        (1 - (d.embedding <=> query_embedding)) > match_threshold
        AND (filter_source IS NULL OR d.source = filter_source)
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create RLS policies for security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations for service role
CREATE POLICY "Enable all operations for service role" ON documents
FOR ALL USING (true);

-- Policy to allow read access for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON documents
FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON documents TO postgres;
GRANT ALL ON documents TO service_role;
GRANT SELECT ON documents TO authenticated;

-- Create a view for easier querying
CREATE OR REPLACE VIEW document_stats AS
SELECT 
    source,
    COUNT(*) as total_chunks,
    SUM(token_count) as total_tokens,
    MIN(created_at) as first_ingested,
    MAX(updated_at) as last_updated
FROM documents 
GROUP BY source
ORDER BY last_updated DESC;