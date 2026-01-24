# Code Changes Summary - Message Persistence Debugging

## Overview
Added comprehensive logging and error handling to track why assistant messages weren't being saved to the database.

## File 1: lib/agents/orchestrator.ts

### Before (Lines 623-637)
```typescript
// 7. Persist Assistant Response
if (this.chatId) {
    const seq = await ChatService.getNextSequenceNumber(this.chatId);
    await ChatService.addMessage({
        chat_id: this.chatId,
        role: "assistant",
        content: response,
        agent_name: finalAgentType,
        agent_id: finalAgentType,
        sequence_number: seq,
        intent: intent,
        metadata: (toolCalls.length > 0 ? { toolCalls } : null) as any
    });

    await ChatService.updateSession(this.chatId, {
        current_agent: finalAgentType,
        last_active_at: new Date().toISOString()
    });

    const summarizer = new ConversationSummarizer(this.chatId);
    summarizer.updateSummary('system').catch(err => {
        console.error('[Orchestrator] Background summarization failed:', err);
    });
}
```

### After (Lines 623-680)
```typescript
// 7. Persist Assistant Response
if (this.chatId) {
    try {
        console.log(`💾 [Orchestrator] Attempting to save assistant message:`, {
            chatId: this.chatId,
            role: 'assistant',
            contentLength: response.length,
            agentName: finalAgentType,
            intent: intent
        });

        const seq = await ChatService.getNextSequenceNumber(this.chatId);
        console.log(`📊 [Orchestrator] Got sequence number: ${seq}`);

        const messagePayload = {
            chat_id: this.chatId,
            role: "assistant" as const,
            content: response,
            agent_name: finalAgentType,
            agent_id: finalAgentType,
            sequence_number: seq,
            intent: intent,
            metadata: (toolCalls.length > 0 ? { toolCalls } : null) as any
        };

        console.log(`📝 [Orchestrator] Message payload prepared:`, {
            ...messagePayload,
            content: `${messagePayload.content.substring(0, 50)}...`
        });

        const savedMessage = await ChatService.addMessage(messagePayload);
        console.log(`✅ [Orchestrator] Message saved successfully with ID: ${savedMessage.id}`);

        console.log(`🔄 [Orchestrator] Updating session state...`);
        await ChatService.updateSession(this.chatId, {
            current_agent: finalAgentType,
            last_active_at: new Date().toISOString()
        });
        console.log(`✅ [Orchestrator] Session updated`);

        const summarizer = new ConversationSummarizer(this.chatId);
        summarizer.updateSummary('system').catch(err => {
            console.error('[Orchestrator] Background summarization failed:', err);
        });
    } catch (error: any) {
        console.error(`❌ [Orchestrator] CRITICAL: Failed to save assistant message:`, {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            chatId: this.chatId,
            responseLength: response.length
        });
        throw new Error(`Failed to persist assistant message: ${error.message}`);
    }
} else {
    console.warn(`⚠️  [Orchestrator] No chatId provided, skipping message persistence`);
}
```

### Key Changes
- ✅ Wrapped in try-catch block
- ✅ Added logging before attempting save
- ✅ Added logging after getting sequence number
- ✅ Added logging for message payload
- ✅ Added logging for successful save with message ID
- ✅ Added logging for session update
- ✅ Added comprehensive error logging with all error details
- ✅ Re-throws error so caller knows about failure
- ✅ Added warning if chatId is missing

---

## File 2: lib/db/chat.ts

### Before: addMessage() (Lines 52-60)
```typescript
async addMessage(message: MessageInsert) {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()

    if (error) throw error
    return data
},
```

### After: addMessage() (Lines 52-82)
```typescript
async addMessage(message: MessageInsert) {
    console.log(`📤 [ChatService] Inserting message:`, {
        chat_id: message.chat_id,
        role: message.role,
        contentLength: (message.content as string).length,
        sequence_number: message.sequence_number
    });

    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()

    if (error) {
        console.error(`❌ [ChatService] Insert failed:`, {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }

    console.log(`✅ [ChatService] Message inserted successfully:`, {
        id: data.id,
        chat_id: data.chat_id,
        role: data.role,
        sequence_number: data.sequence_number
    });

    return data
},
```

### Key Changes
- ✅ Added logging before insert
- ✅ Added detailed error logging with code, details, hint
- ✅ Added success logging with message ID

---

### Before: getNextSequenceNumber() (Lines 130-138)
```typescript
async getNextSequenceNumber(chatId: string) {
    const { data, error } = await supabase
        .from('messages')
        .select('sequence_number')
        .eq('chat_id', chatId)
        .order('sequence_number', { ascending: false })
        .limit(1)

    if (error) throw error
    const max = data[0]?.sequence_number || 0
    return max + 1
}
```

### After: getNextSequenceNumber() (Lines 130-147)
```typescript
async getNextSequenceNumber(chatId: string) {
    console.log(`🔢 [ChatService] Getting next sequence number for chat: ${chatId}`);

    const { data, error } = await supabase
        .from('messages')
        .select('sequence_number')
        .eq('chat_id', chatId)
        .order('sequence_number', { ascending: false })
        .limit(1)

    if (error) {
        console.error(`❌ [ChatService] Failed to get sequence number:`, error);
        throw error;
    }

    const max = data[0]?.sequence_number || 0;
    const nextSeq = max + 1;
    console.log(`📊 [ChatService] Current max sequence: ${max}, next sequence: ${nextSeq}`);

    return nextSeq;
}
```

### Key Changes
- ✅ Added logging before query
- ✅ Added error logging
- ✅ Added logging showing current and next sequence numbers

---

## Summary of Changes

| File | Lines | Change | Purpose |
|------|-------|--------|---------|
| orchestrator.ts | 623-680 | Added try-catch + logging | Catch and log message persistence errors |
| chat.ts | 52-82 | Enhanced addMessage() | Log insert attempts and errors |
| chat.ts | 130-147 | Enhanced getNextSequenceNumber() | Log sequence number retrieval |

## Impact

### Before
- Silent failures - no way to know if message save failed
- No visibility into the persistence process
- Debugging required guessing and manual database queries

### After
- All failures are logged with full error details
- Complete visibility into the persistence process
- Easy debugging with clear log messages
- Can identify exactly where the failure occurs

## Testing

1. Restart dev server
2. Send a message to trigger Project Initializer
3. Check terminal for the complete logging sequence
4. Verify both USER and ASSISTANT messages in database
5. If error occurs, error details will be clearly logged
