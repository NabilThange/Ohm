# Testing Checklist - Assistant Message Persistence Fix

## Pre-Testing Setup

- [ ] All code changes have been applied
  - [ ] lib/agents/orchestrator.ts - Message persistence with try-catch
  - [ ] lib/db/chat.ts - Enhanced logging in addMessage()
  - [ ] lib/db/chat.ts - Enhanced logging in getNextSequenceNumber()
- [ ] No TypeScript errors: `npm run build` passes
- [ ] Dev server can start: `npm run dev` works

## Testing Steps

### 1. Start Fresh
- [ ] Stop dev server if running
- [ ] Clear browser cache (or use incognito window)
- [ ] Start dev server: `npm run dev`
- [ ] Wait for "Ready in XXXms" message

### 2. Create New Chat
- [ ] Navigate to http://localhost:3000
- [ ] Send a message: "Radar sensor"
- [ ] Wait for Project Initializer to respond
- [ ] Response should appear in UI

### 3. Check Terminal Logs

#### Look for this sequence:
```
💾 [Orchestrator] Attempting to save assistant message: {
  chatId: 'UUID',
  role: 'assistant',
  contentLength: 1000+,
  agentName: 'projectInitializer',
  intent: 'INIT'
}
```
- [ ] This log appears

```
📊 [Orchestrator] Got sequence number: 2
```
- [ ] This log appears (sequence should be 2 for second message)

```
📝 [Orchestrator] Message payload prepared: {
  chat_id: 'UUID',
  role: 'assistant',
  contentLength: 1000+,
  ...
}
```
- [ ] This log appears

```
📤 [ChatService] Inserting message: {
  chat_id: 'UUID',
  role: 'assistant',
  contentLength: 1000+,
  sequence_number: 2
}
```
- [ ] This log appears

```
✅ [ChatService] Message inserted successfully: {
  id: 'MESSAGE_UUID',
  chat_id: 'CHAT_UUID',
  role: 'assistant',
  sequence_number: 2
}
```
- [ ] This log appears (indicates successful database insert)

```
✅ [Orchestrator] Message saved successfully with ID: MESSAGE_UUID
```
- [ ] This log appears

```
🔄 [Orchestrator] Updating session state...
✅ [Orchestrator] Session updated
```
- [ ] Both logs appear

### 4. Verify Database

#### Query the messages table:
```sql
SELECT id, role, content, agent_id, sequence_number, created_at
FROM messages
WHERE chat_id = 'YOUR_CHAT_ID'
ORDER BY sequence_number;
```

- [ ] Query returns 2 rows
- [ ] Row 1: role = 'user', content = 'Radar sensor'
- [ ] Row 2: role = 'assistant', content = 'Awesome! Radar sensors...'
- [ ] Row 2: agent_id = 'projectInitializer'
- [ ] Row 2: sequence_number = 2

### 5. Verify UI

- [ ] User message visible in chat
- [ ] Assistant message visible in chat
- [ ] Assistant message shows Project Initializer avatar
- [ ] Message content is complete and readable

### 6. Test Error Handling (Optional)

#### Simulate a database error:
- [ ] Temporarily break the Supabase connection (e.g., wrong URL)
- [ ] Send another message
- [ ] Check terminal for error logs:
  ```
  ❌ [ChatService] Insert failed: {
    error: '...',
    code: '...',
    details: '...',
    hint: '...'
  }
  
  ❌ [Orchestrator] CRITICAL: Failed to save assistant message: {
    error: '...',
    code: '...',
    details: '...',
    hint: '...',
    chatId: '...',
    responseLength: ...
  }
  ```
- [ ] Error details are clearly logged
- [ ] Error is thrown to caller

## Success Criteria

✅ **All of the following must be true**:

1. Terminal shows complete logging sequence for message persistence
2. Database contains both USER and ASSISTANT messages
3. Both messages visible in UI
4. Assistant message has correct agent_id
5. Sequence numbers are correct (1, 2, 3, etc.)
6. No errors in terminal (unless intentionally testing error handling)

## Failure Scenarios

### Scenario 1: No persistence logs appear
**Possible causes**:
- [ ] chatId is null/undefined
- [ ] Code not reaching persistence section
- [ ] Agent not completing successfully

**Debug**:
- Check if agent completion log appears: `✅ [Orchestrator] Agent completed!`
- Check if chatId is being passed to orchestrator

### Scenario 2: Logs appear but database insert fails
**Possible causes**:
- [ ] RLS policy blocking insert
- [ ] Missing columns in messages table
- [ ] Invalid data types
- [ ] Supabase connection issue

**Debug**:
- Read the error details in logs
- Check Supabase dashboard for RLS policies
- Verify messages table schema
- Check SERVICE_ROLE_KEY is being used

### Scenario 3: Insert succeeds but message not visible in UI
**Possible causes**:
- [ ] Realtime subscription not working
- [ ] Frontend not refreshing
- [ ] Message not being fetched

**Debug**:
- Check browser console for errors
- Verify realtime subscription logs
- Manually refresh page
- Check if message appears after refresh

## Rollback Plan

If something breaks:

1. Revert changes to orchestrator.ts
2. Revert changes to chat.ts
3. Restart dev server
4. Test again

## Documentation

- [ ] Read ORCHESTRATOR_MESSAGE_PERSISTENCE_FIX.md
- [ ] Read CODE_CHANGES_SUMMARY.md
- [ ] Read ORCHESTRATOR_CODE_LOCATIONS.md
- [ ] Read DEBUGGING_ASSISTANT_MESSAGE_PERSISTENCE.md

## Sign-Off

- [ ] All tests passed
- [ ] No errors in terminal
- [ ] Database has both messages
- [ ] UI shows both messages
- [ ] Ready for production

---

## Quick Reference

**Expected log sequence**:
```
💾 → 📊 → 📝 → 📤 → ✅ (ChatService) → ✅ (Orchestrator) → 🔄 → ✅ (Session)
```

**Expected database result**:
```
SELECT * FROM messages WHERE chat_id = 'YOUR_ID' ORDER BY sequence_number;
```
Should return 2 rows: USER (seq 1) and ASSISTANT (seq 2)

**Expected UI**:
- User message at top
- Assistant message below
- Both fully visible and readable
