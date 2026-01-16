-- Migration: Add created_by column to artifact_versions
-- Description: Adds user tracking for artifact version creation
-- Date: 2026-01-15

-- Add created_by column to artifact_versions table
ALTER TABLE artifact_versions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_artifact_versions_created_by 
ON artifact_versions(created_by);

-- Add comment for documentation
COMMENT ON COLUMN artifact_versions.created_by IS 'User who created this version of the artifact';

-- Note: Existing rows will have NULL for created_by
-- This is acceptable as they were created before user tracking was implemented
