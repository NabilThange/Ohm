-- Add metadata column to messages table for storing additional message data
-- This column stores JSON data like tool calls, agent info, etc.

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add index for faster queries on metadata
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);

-- Add comment explaining the column
COMMENT ON COLUMN messages.metadata IS 'JSON metadata for the message including tool calls, agent info, and other structured data';
