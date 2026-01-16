-- Add agent_id column to messages table to track which agent generated each response
-- This enables displaying the correct agent avatar in chat history

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS agent_id TEXT;

-- Add index for faster queries filtering by agent
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);

-- Add comment explaining the column
COMMENT ON COLUMN messages.agent_id IS 'ID of the agent that generated this message (e.g., projectInitializer, conversational, bomGenerator)';
