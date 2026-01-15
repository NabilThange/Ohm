-- Migration: Add conversation_summary artifact type
-- Description: Enables storing incremental conversation summaries as artifacts

-- Add 'conversation_summary' to the artifact type enum
ALTER TABLE artifacts 
DROP CONSTRAINT IF EXISTS artifacts_type_check;

ALTER TABLE artifacts 
ADD CONSTRAINT artifacts_type_check 
CHECK (type IN (
  'context', 
  'mvp', 
  'prd', 
  'bom', 
  'code', 
  'wiring', 
  'circuit', 
  'budget',
  'conversation_summary'
));

-- Note: Existing rows will not be affected.
-- New conversation_summary artifacts will be created on-demand per chat.
