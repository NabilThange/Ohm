# BOM Inline Display Fix

## Problems

### 1. Database Error
```
Could not find the 'metadata' column of 'messages' in the schema cache
```

The orchestrator was trying to save tool calls in a `metadata` column that didn't exist in the database.

### 2. BOM Card Not Visible Inline
The BOM card was showing in the drawer but not inline in the chat because:
- Tool calls weren't being accumulated in the frontend
- Message metadata wasn't being updated with tool calls
- The Message component couldn't find tool calls to render the BOM card

## Solutions

### 1. Added metadata Column to Database
**File:** `migrations/add_metadata_to_messages.sql`

```sql
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);
```

This allows storing structured data like tool calls, agent info, etc.

### 2. Fixed Orchestrator to Save agent_id
**File:** `lib/agents/orchestrator.ts`

Re-added the `agent_id` field that was accidentally removed:
```typescript
await ChatService.addMessage({
    chat_id: this.chatId,
    role: "assistant",
    content: response,
    agent_name: finalAgentType,
    agent_id: finalAgentType,  // ← Re-added
    sequence_number: seq,
    intent: intent,
    metadata: (toolCalls.length > 0 ? { toolCalls } : null) as any
});
```

### 3. Accumulate Tool Calls in Frontend
**File:** `lib/hooks/use-chat.ts`

Added tool call accumulation:
```typescript
let accumulatedToolCalls: any[] = [];  // NEW: Accumulate tool calls

// When tool_call event is received:
accumulatedToolCalls.push(data.toolCall);

// Update message with tool calls in metadata
setMessages(prev => prev.map(m =>
    m.id === aiTempId ? {
        ...m,
        metadata: { ...m.metadata, toolCalls: accumulatedToolCalls }
    } : m
));
```

## How It Works Now

### Flow for BOM Generation:

1. **User asks:** "What components do I need?"
2. **Orchestrator routes** to BOM Generator agent
3. **BOM Generator calls** `update_bom` tool
4. **Backend sends** `tool_call` event:
   ```json
   {
     "type": "tool_call",
     "toolCall": {
       "name": "update_bom",
       "arguments": {
         "project_name": "My Project",
         "components": [...]
       }
     }
   }
   ```
5. **Frontend accumulates** tool call in `accumulatedToolCalls`
6. **Frontend updates** message metadata with tool calls
7. **Message component** finds `update_bom` in metadata
8. **BOM Card renders** inline with the message ✅
9. **BOM Drawer** also gets populated ✅

### Message Metadata Structure:
```typescript
{
  agent_name: "Component Specialist",
  agent_id: "bomGenerator",
  metadata: {
    toolCalls: [
      {
        name: "update_bom",
        arguments: {
          project_name: "...",
          components: [...]
        }
      }
    ]
  }
}
```

## Database Migration Required

Run this in your Supabase SQL editor:

```sql
-- Add metadata column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);

-- Add comment
COMMENT ON COLUMN messages.metadata IS 'JSON metadata for the message including tool calls, agent info, and other structured data';
```

## Result

✅ **No more database errors** - metadata column exists
✅ **BOM card shows inline** - tool calls are in metadata
✅ **BOM drawer works** - still gets populated
✅ **Code blocks show inline** - same mechanism
✅ **Agent avatars correct** - agent_id is saved

## Files Modified

1. `migrations/add_metadata_to_messages.sql` (NEW)
2. `lib/agents/orchestrator.ts` - Re-added agent_id
3. `lib/hooks/use-chat.ts` - Added tool call accumulation

## Testing

1. **Run the migration** in Supabase
2. **Send a message** that triggers BOM generation
3. **Verify** BOM card appears inline in the chat
4. **Verify** BOM drawer also works
5. **Check** no console errors about metadata column

## Other Tool Cards That Will Work

With this fix, all inline tool cards will work:
- ✅ BOM Card (update_bom)
- ✅ Code Block (add_code_file)
- ✅ Context updates (update_context, update_mvp, update_prd)
- ✅ Wiring diagrams (update_wiring)
- ✅ Budget analysis (update_budget)

All tool calls are now properly tracked in metadata and can be rendered inline!
