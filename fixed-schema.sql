-- Fixed Knowledge Base Schema for Supabase
-- Run this as a superuser/owner in your Supabase SQL Editor

-- Enable the pgvector extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS documents CASCADE;

-- Create the documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  source text NOT NULL,
  chunk_index integer DEFAULT 0,
  token_count integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX documents_source_idx ON documents(source);
CREATE INDEX documents_chunk_index_idx ON documents(chunk_index);
CREATE INDEX documents_created_at_idx ON documents(created_at);

-- HNSW index for vector similarity search
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

-- Disable RLS temporarily for easier setup
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to service_role
GRANT ALL PRIVILEGES ON TABLE documents TO service_role;
GRANT ALL PRIVILEGES ON TABLE documents TO postgres;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO postgres;

-- Grant sequence permissions if needed
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

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

-- Grant permissions on the view
GRANT ALL ON document_stats TO service_role;
GRANT ALL ON document_stats TO postgres;