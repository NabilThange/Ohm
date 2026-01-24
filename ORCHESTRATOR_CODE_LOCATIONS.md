# Orchestrator Message Persistence - Code Locations

## Key Code Sections

### 1. Message Persistence in Orchestrator (lib/agents/orchestrator.ts)

**Location**: Lines 623-680 in the `chat()` method

**What it does**:
- Gets the next sequence number for the message
- Creates a message payload with all required fields
- Calls `ChatService.addMessage()` to insert into database
- Updates the session state
- Triggers background summarization

**Key fields being saved**:
```typescript
{
    chat_id: this.chatId,           // Chat identifier
    role: "assistant",              // Message role
    content: response,              // The actual response text
    agent_name: finalAgentType,     // Which agent generated this
    agent_id: finalAgentType,       // For avatar display
    sequence_number: seq,           // Order in conversation
    intent: intent,                 // INIT, CHAT, BOM, CODE, etc.
    metadata: { toolCalls }         // Any tool calls made
}
```

### 2. ChatService.addMessage() (lib/db/chat.ts)

**Location**: Lines 52-82

**What it does**:
- Takes a message object
- Inserts it into the 'messages' table via Supabase
- Returns the saved message with ID

**Error handling**:
- Logs all error details (code, message, details, hint)
- Throws error to caller

### 3. ChatService.getNextSequenceNumber() (lib/db/chat.ts)

**Location**: Lines 130-147

**What it does**:
- Queries the messages table for the current chat
- Finds the highest sequence_number
- Returns max + 1

**Important**: This must work correctly or sequence numbers will be wrong

### 4. Supabase Client (lib/supabase/client.ts)

**Location**: Lines 1-35

**What it does**:
- Provides the Supabase client instance
- Uses SERVICE_ROLE_KEY on server-side (bypasses RLS)
- Uses ANON_KEY on client-side (respects RLS)

**Key fix**: Uses Proxy to ensure correct context at runtime

## Call Flow

```
API Route (/api/agents/chat)
    ↓
orchestrator.chat(userMessage)
    ↓
1. Determine agent type
2. Save USER message to database
3. Run agent with streaming
4. Collect response
    ↓
5. Save ASSISTANT message ← THIS IS WHERE IT WAS FAILING
    ├─ Get next sequence number
    ├─ Create message payload
    ├─ Call ChatService.addMessage()
    ├─ Update session
    └─ Trigger summarization
    ↓
6. Return response to client
```

## Database Schema (messages table)

Required columns:
- `id` (UUID, primary key)
- `chat_id` (UUID, foreign key to chats)
- `role` (text: 'user' or 'assistant')
- `content` (text: the message content)
- `sequence_number` (integer: order in conversation)
- `agent_id` (text, nullable: which agent generated this)
- `agent_name` (text, nullable: agent display name)
- `intent` (text, nullable: INIT, CHAT, BOM, CODE, etc.)
- `metadata` (jsonb, nullable: tool calls, etc.)
- `created_at` (timestamp)

## Logging Output Format

### When saving a message, you should see:

```
💾 [Orchestrator] Attempting to save assistant message: {
  chatId: 'bd68b876-edf4-44e7-b008-a3c45999b524',
  role: 'assistant',
  contentLength: 1042,
  agentName: 'projectInitializer',
  intent: 'INIT'
}

📊 [Orchestrator] Got sequence number: 2

📝 [Orchestrator] Message payload prepared: {
  chat_id: 'bd68b876-edf4-44e7-b008-a3c45999b524',
  role: 'assistant',
  contentLength: 1042,
  agent_name: 'projectInitializer',
  agent_id: 'projectInitializer',
  sequence_number: 2,
  intent: 'INIT',
  content: 'Awesome! Radar sensors are super versatile!...'
}

📤 [ChatService] Inserting message: {
  chat_id: 'bd68b876-edf4-44e7-b008-a3c45999b524',
  role: 'assistant',
  contentLength: 1042,
  sequence_number: 2
}

✅ [ChatService] Message inserted successfully: {
  id: '04ff0cef-3430-4c8b-a8b3-30d7143db4be',
  chat_id: 'bd68b876-edf4-44e7-b008-a3c45999b524',
  role: 'assistant',
  sequence_number: 2
}

✅ [Orchestrator] Message saved successfully with ID: 04ff0cef-3430-4c8b-a8b3-30d7143db4be

🔄 [Orchestrator] Updating session state...

✅ [Orchestrator] Session updated
```

## Debugging Checklist

- [ ] Restart dev server after changes
- [ ] Check terminal logs for the logging sequence above
- [ ] Verify chatId is not null (should be UUID)
- [ ] Check database for both USER and ASSISTANT messages
- [ ] If error occurs, read the error details carefully
- [ ] Check Supabase dashboard for any RLS policy issues
- [ ] Verify SERVICE_ROLE_KEY is being used on server-side
