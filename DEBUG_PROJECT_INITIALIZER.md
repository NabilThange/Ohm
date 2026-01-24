# 🔍 Project Initializer Response Not Visible - Debugging Guide

## Issue
The Project Initializer agent's response is not visible in the UI, but other agents' responses work fine.

## Possible Causes

### 1. Empty Response Content
**Symptom:** Message appears but has no text
**Cause:** The agent returns an empty string or the content is not being captured

**Check:**
- Open browser console
- Look for: `[useChat] Received stream data: text (X chars)`
- If X is 0 or very small, the agent isn't generating content

**Fix:** Check if context injection is breaking the system prompt

### 2. Content Not Streaming
**Symptom:** Loading animation never stops
**Cause:** Stream never completes or gets stuck

**Check:**
- Look for: `[useChat] Stream finished`
- If missing, the stream is hanging

**Fix:** Check for errors in the orchestrator or agent runner

### 3. Message Not Persisting to Database
**Symptom:** Message disappears after refresh
**Cause:** Database insert fails

**Check:**
- Look for: `[Orchestrator] Persist Assistant Response`
- Check Supabase logs for insert errors

**Fix:** Check if agent_name or agent_id is causing issues

### 4. Realtime Subscription Not Picking Up Message
**Symptom:** Message shows during stream but disappears after
**Cause:** Temp message is removed but real message doesn't appear

**Check:**
- Look for: `[useChat] Realtime INSERT event received`
- Check if message ID matches

**Fix:** Ensure realtime subscription is working

### 5. Message Component Not Rendering
**Symptom:** Message exists in state but doesn't render
**Cause:** React rendering issue or conditional logic

**Check:**
- Look at React DevTools
- Check if message is in the messages array
- Check if Message component receives the data

**Fix:** Check Message component's conditional rendering

## Debugging Steps

### Step 1: Check Browser Console
Open browser console and send a message. Look for these logs:

```
[useChat] Starting to read stream...
[useChat] Received stream data: agent_selected ...
[useChat] Received stream data: text (X chars)
[useChat] Received stream data: text (X chars)
...
[useChat] Received stream data: metadata ...
[useChat] Stream finished
```

**If you see:**
- ✅ All logs present → Stream is working
- ❌ No "text" logs → Agent not generating content
- ❌ No "Stream finished" → Stream hanging

### Step 2: Check Message Content
In console, after stream finishes, type:
```javascript
// Get the last message
const messages = document.querySelectorAll('[role="assistant"]');
const lastMessage = messages[messages.length - 1];
console.log('Last message content:', lastMessage?.textContent);
```

**If you see:**
- ✅ Content present → Rendering issue
- ❌ Empty or undefined → Content not captured

### Step 3: Check Database
Go to Supabase dashboard → Messages table → Find the latest message

**Check:**
- Is the message there?
- Does it have content?
- What's the agent_name?
- What's the agent_id?

### Step 4: Check Realtime
In console, look for:
```
[useChat] Realtime INSERT event received: { id: '...', content: '...', ... }
```

**If missing:**
- Realtime subscription not working
- Message not being inserted
- Filter not matching

### Step 5: Check React State
In React DevTools:
1. Find the ChatPane component
2. Look at the `messages` prop
3. Find the projectInitializer message
4. Check its content field

## Quick Fixes

### Fix 1: Add Logging to Context Builder
Already done! Check for these logs:
```
[ContextBuilder] 🔍 Building dynamic context for chatId: ...
[ContextBuilder] 📝 Summary text received: ...
[ContextBuilder] ⏭️  New conversation detected, skipping context injection
```

### Fix 2: Check if Agent is Actually Running
Add this to orchestrator.ts after line 170:
```typescript
console.log(`🤖 [Orchestrator] Running ${agent.name} with ${fullMessages.length} messages`);
console.log(`🤖 [Orchestrator] System prompt length: ${systemPrompt.length} chars`);
```

### Fix 3: Check if Response is Empty
Add this to orchestrator.ts after line 602:
```typescript
console.log(`📝 [Orchestrator] Agent response length: ${response.length} chars`);
console.log(`📝 [Orchestrator] First 100 chars: ${response.substring(0, 100)}`);
```

### Fix 4: Force Agent ID in Message
In useChat.ts, line 220, change to:
```typescript
agent_id: data.agent.type || data.agent.id || 'projectInitializer',  // Force fallback
```

## Most Likely Cause

Based on the symptoms, the most likely cause is:

**The context builder is throwing an error for new conversations, breaking the agent execution.**

Why?
- Other agents work (they're on existing conversations with context)
- Project Initializer is used for NEW conversations (no context yet)
- Context builder might be failing on empty/new conversations

**Solution:**
The error handling we added should fix this. Check the logs for:
```
[ContextBuilder] ❌ ERROR building context: ...
```

If you see this error, the context builder is failing but now it's failing gracefully.

## Testing

### Test 1: New Conversation
1. Create a new chat
2. Send: "I want to build a temperature monitor"
3. Check console for logs
4. Verify response appears

### Test 2: Existing Conversation
1. Open an existing chat
2. Send a message
3. Verify response appears
4. Check if context is injected

### Test 3: Force Project Initializer
1. In existing chat
2. Manually set agent to projectInitializer
3. Send a message
4. Check if response appears

## Expected Behavior

**New Conversation:**
```
[Orchestrator] chatId provided: xxx, building context...
[ContextBuilder] 🔍 Building dynamic context for chatId: xxx
[ContextBuilder] 📝 Summary text received: New conversation - no prior context
[ContextBuilder] ⏭️  New conversation detected, skipping context injection
[Orchestrator] ⏭️  No context to inject (new conversation or empty)
[Orchestrator] Running The Project Initializer (anthropic/claude-opus-4-5)...
[useChat] Received stream data: agent_selected { type: 'projectInitializer', name: 'The Project Initializer', ... }
[useChat] Received stream data: text (50 chars)
[useChat] Received stream data: text (100 chars)
...
[useChat] Stream finished
```

**If you don't see this flow, something is broken.**

## Next Steps

1. Start dev server
2. Open browser console
3. Create new chat
4. Send a message
5. Watch the logs
6. Report back what you see

The logs will tell us exactly where it's failing.
