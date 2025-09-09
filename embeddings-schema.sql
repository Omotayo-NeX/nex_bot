-- Knowledge Base Embeddings Schema for Supabase
-- This script creates the necessary tables and functions for document embeddings storage
-- Run this in your Supabase SQL editor

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table to store knowledge base files
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(filename, file_hash)
);

-- Create document_chunks table to store text chunks and embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding VECTOR(3072), -- OpenAI text-embedding-3-large has 3072 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, chunk_index)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS documents_filename_idx ON documents(filename);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at);
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(3072),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    document_id UUID,
    filename TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.filename,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant permissions (adjust as needed for your setup)
-- These are basic permissions for the authenticated role
-- You may need to adjust based on your row-level security setup
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed)
CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON document_chunks FOR SELECT USING (true);