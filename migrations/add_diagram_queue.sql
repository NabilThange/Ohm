-- Circuit Diagram Queue and Cache Migration
-- Created: 2026-01-24
-- Purpose: Add diagram generation queue, caching, and status tracking

-- ============================================================================
-- 1. Add diagram fields to artifact_versions table
-- ============================================================================

ALTER TABLE artifact_versions 
ADD COLUMN IF NOT EXISTS fritzing_url TEXT,
ADD COLUMN IF NOT EXISTS diagram_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS generation_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_artifact_diagram_status 
ON artifact_versions(diagram_status) 
WHERE diagram_status IS NOT NULL;

-- ============================================================================
-- 2. Create diagram_queue table
-- ============================================================================

CREATE TABLE IF NOT EXISTS diagram_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_json JSONB NOT NULL,
  artifact_id UUID NOT NULL REFERENCES artifact_versions(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  created_at TIMESTAMP DEFAULT now(),
  processed_at TIMESTAMP,
  error_message TEXT
);

-- Indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_queue_status_created 
ON diagram_queue(status, created_at) 
WHERE status IN ('queued', 'processing');

CREATE INDEX IF NOT EXISTS idx_queue_artifact 
ON diagram_queue(artifact_id);

-- ============================================================================
-- 3. Create diagram_cache table
-- ============================================================================

CREATE TABLE IF NOT EXISTS diagram_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_hash TEXT UNIQUE NOT NULL,
  fritzing_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT now()
);

-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_circuit_hash 
ON diagram_cache(circuit_hash);

-- Index for cache cleanup (find old, unused entries)
CREATE INDEX IF NOT EXISTS idx_cache_access 
ON diagram_cache(last_accessed_at, access_count);

-- ============================================================================
-- 4. Add helpful comments
-- ============================================================================

COMMENT ON TABLE diagram_queue IS 'Queue for processing circuit diagram generation requests';
COMMENT ON TABLE diagram_cache IS 'Cache of generated diagrams by circuit hash to avoid regeneration';
COMMENT ON COLUMN artifact_versions.fritzing_url IS 'URL to generated Fritzing-style breadboard diagram';
COMMENT ON COLUMN artifact_versions.diagram_status IS 'Status: pending, queued, generating, complete, failed';

-- ============================================================================
-- 5. Create Supabase Storage bucket (manual step)
-- ============================================================================

-- MANUAL STEP: Create storage bucket via Supabase Dashboard
-- Bucket name: circuit-diagrams
-- Public: true
-- Allowed MIME types: image/png, image/jpeg
-- File size limit: 10MB

-- To verify bucket exists, run:
-- SELECT * FROM storage.buckets WHERE name = 'circuit-diagrams';
