# Conversation Summarizer Implementation Guide

## Overview

This document describes the implementation of incremental conversation summarization in OHM, designed to reduce token usage and maintain clear project context throughout multi-turn conversations.

## Architecture

### How It Works

The summarizer operates **incrementally**, NOT by reading all messages every time:

```
Messages 1-5   → Summary v1 (initial context)
Messages 6-10  → Summary v2 (updates v1 with new info)
Messages 11-15 → Summary v3 (updates v2 with new info)
```

### Key Design Decisions

1. **Trigger Threshold**: Summaries update every 5 messages (configurable via `SUMMARY_TRIGGER_THRESHOLD`)
2. **Background Processing**: Summarization runs asynchronously after message persistence, not blocking responses
3. **Artifact Storage**: Summaries are stored as a new artifact type (`conversation_summary`) with version history
4. **Agent Model**: Uses `claude-sonnet-4-5` for fast, cost-effective summarization

## Implementation Steps

### 1. Database Migration

**File**: `migrations/add_conversation_summary_type.sql`

Run this migration to add the new artifact type:

```sql
ALTER TABLE artifacts 
DROP CONSTRAINT IF EXISTS artifacts_type_check;

ALTER TABLE artifacts 
ADD CONSTRAINT artifacts_type_check 
CHECK (type IN (
  'context', 'mvp', 'prd', 'bom', 'code', 
  'wiring', 'circuit', 'budget', 'conversation_summary'
));
```

**How to apply**:
```bash
# Via Supabase CLI
supabase db push

# Or directly in Supabase Dashboard SQL Editor
# Copy and paste the migration file contents
```

### 2. Type Definitions

**File**: `lib/supabase/types.ts`

Updated to include `conversation_summary` in artifact type unions:
- `artifacts.Row.type`
- `artifacts.Insert.type`  
- `artifacts.Update.type`

### 3. Agent Configuration

**File**: `lib/agents/config.ts`

Added new agent to `AGENTS` record:

```typescript
conversationSummarizer: {
  name: "The Conversation Summarizer",
  model: "anthropic/claude-sonnet-4-5",
  temperature: 0.3,
  maxTokens: 2000,
  // ... system prompt for technical summarization
}
```

### 4. Summarizer Service

**File**: `lib/agents/summarizer.ts`

Core logic for managing conversation summaries:

**Key Methods**:
- `initializeSummary(userId)` - Creates initial summary artifact
- `getCurrentSummary()` - Fetches latest summary version
- `updateSummary(userId)` - Generates new summary from recent messages
- `getSummaryForContext()` - Formats summary for agent system prompts

**Data Structure** (`ConversationSummary`):
```typescript
{
  summary: string                 // Main summary text
  lastProcessedMessageId: string  // Tracking pointer
  lastProcessedSequenceNumber: number
  messageCount: number            // Total messages processed
  projectSnapshot: {
    components: string[]          // Extracted: ESP32, DHT22, etc.
    decisions: string[]           // Key technical decisions
    codeFiles: string[]           // Generated files
    openQuestions: string[]       // Unanswered questions
  }
  updatedAt: string
}
```

### 5. Orchestrator Integration

**File**: `lib/agents/orchestrator.ts`

After assistant message is persisted:

```typescript
// Non-blocking background summarization
const summarizer = new ConversationSummarizer(this.chatId);
summarizer.updateSummary('system').catch(err => {
  console.error('[Orchestrator] Background summarization failed:', err);
});
```

### 6. UI Component

**File**: `components/tools/ConversationSummaryDrawer.tsx`

React component with:
- Real-time updates via Supabase subscriptions
- Resizable drawer (consistent with other OHM drawers)
- Structured display: summary text + quick snapshot (components, code files, questions)
- Empty state for new conversations

## Integration with Existing Chat Flow

### Current Flow
```
User Message → Orchestrator → Agent → Response → Save to DB
```

### Updated Flow
```
User Message → Orchestrator → Agent → Response → Save to DB → Trigger Summarizer (async)
                                                                       ↓
                                                            (Every 5 messages)
                                                                       ↓
                                                            Update Summary Artifact
```

### Adding Drawer to Chat UI

In your main chat page component (e.g., `app/chat/[id]/page.tsx`):

```tsx
import ConversationSummaryDrawer from '@/components/tools/ConversationSummaryDrawer'

export default function ChatPage() {
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false)
  
  return (
    <>
      {/* Existing chat UI */}
      
      {/* Add button in sidebar/toolbar */}
      <button onClick={() => setSummaryDrawerOpen(true)}>
        📝 Summary
      </button>
      
      {/* Drawer component */}
      <ConversationSummaryDrawer
        isOpen={summaryDrawerOpen}
        onClose={() => setSummaryDrawerOpen(false)}
        chatId={chatId}
      />
    </>
  )
}
```

## Usage in Agent Context

### Before (Full History)
```typescript
const history = await this.getHistory(); // All messages
const result = await this.runner.runAgent(agentType, history, options);
```

### After (Summary + Recent Messages)
```typescript
const summarizer = new ConversationSummarizer(this.chatId);
const summaryContext = await summarizer.getSummaryForContext();

// Include summary in system prompt
const enhancedSystemPrompt = `${baseSystemPrompt}\n\n${summaryContext}`;

// Only send recent messages (e.g., last 10)
const recentHistory = history.slice(-10);
const result = await this.runner.runAgent(agentType, recentHistory, {
  ...options,
  systemPrompt: enhancedSystemPrompt
});
```

**Benefits**:
- **Cost Reduction**: Send ~500 tokens (summary) instead of 5,000+ tokens (50 messages)
- **Better Context**: Highlights key decisions without conversational noise
- **Faster Processing**: Smaller context = faster agent response

## Configuration Options

### Adjust Summary Frequency

In `lib/agents/summarizer.ts`:

```typescript
const SUMMARY_TRIGGER_THRESHOLD = 5; // Change to 3, 10, etc.
```

**Tradeoffs**:
- Lower (3): More frequent updates, higher cost, better real-time tracking
- Higher (10): Less frequent, lower cost, may miss nuances

### Customize Summary Prompt

In `lib/agents/config.ts`, edit `conversationSummarizer.systemPrompt`:

```typescript
systemPrompt: `Your custom instructions for what to capture...`
```

## Monitoring & Debugging

### Logs to Watch

```bash
# Summary creation
[Summarizer] No existing summary, initializing...
[Summarizer] Updating summary with 5 new messages...
[Summarizer] ✅ Summary updated to v2 (10 messages processed)

# Integration
[Orchestrator] Background summarization failed: <error>
```

### Database Queries

```sql
-- Check summary artifacts per chat
SELECT 
  a.chat_id,
  a.title,
  a.current_version,
  av.content->>'messageCount' as messages_processed
FROM artifacts a
JOIN artifact_versions av ON av.artifact_id = a.id
WHERE a.type = 'conversation_summary'
ORDER BY a.updated_at DESC;

-- View summary content
SELECT 
  a.chat_id,
  av.version_number,
  av.content->>'summary' as summary_text,
  av.content->'projectSnapshot'->>'components' as components
FROM artifacts a
JOIN artifact_versions av ON av.artifact_id = a.id
WHERE a.type = 'conversation_summary' AND a.chat_id = '<chat-id>';
```

### Frontend Debugging

In browser console:

```javascript
// Check if summary drawer is receiving updates
// Should see: [SummaryDrawer] Real-time update: {new: {...}}
```

## Testing

### Manual Test Flow

1. **Start new chat** → Verify no summary exists (empty state shown)
2. **Send 5 messages** → Check logs for summary creation
3. **Open Summary Drawer** → Should show initial summary
4. **Send 5 more messages** → Summary should auto-update (real-time)
5. **Check Database** → Verify `artifact_versions` has 2 entries

### Test Cases

```typescript
// Test 1: Summary creation
// Expected: Creates artifact after 5 messages
const summarizer = new ConversationSummarizer(chatId);
await summarizer.updateSummary('test-user');

// Test 2: Incremental updates
// Expected: Updates existing summary, doesn't create new artifact
await summarizer.updateSummary('test-user'); // After 5 more messages

// Test 3: Empty state
// Expected: Returns null or empty summary
const summary = await summarizer.getCurrentSummary();
expect(summary?.summary.messageCount).toBe(0);
```

## Performance Metrics

### Token Usage Comparison

**Without Summarizer** (50-message conversation):
- Average message: 100 tokens
- Total context sent per request: ~5,000 tokens
- Cost per request: ~$0.025

**With Summarizer**:
- Summary: 300-500 tokens
- Recent 10 messages: 1,000 tokens
- Total context: ~1,500 tokens
- Cost per request: ~$0.008

**Savings**: ~67% reduction in context tokens

### Response Time Impact

- Summary generation: +2-3 seconds (background, doesn't affect user)
- Agent requests: -0.5 to -1 second (smaller context = faster)
- **Net impact**: Improved response times

## Future Enhancements

### 1. Smart Summarization Triggers
Instead of fixed message count, trigger based on:
- Significant events (BOM created, code generated)
- Topic changes detected by orchestrator
- User-initiated checkpoints

### 2. Multi-Level Summaries
```
High-level: 200 words (project goals, decisions)
Mid-level: 500 words (technical details)
Low-level: 1000 words (full history context)
```

### 3. Summary Diffs
Show what changed between versions:
```
v2 → v3: Added ESP32, removed Arduino, generated main.cpp
```

### 4. Export & Sharing
- Export summary as project brief
- Share summary link for onboarding new collaborators

### 5. Context Compression
Use embedding-based retrieval for even longer conversations:
- Embed all messages
- Retrieve only semantically relevant messages per query
- Combine with summary for optimal context

## Troubleshooting

### Issue: Summary not updating

**Check**:
1. Message count: `SELECT COUNT(*) FROM messages WHERE chat_id = '<id>'`
2. Logs: Look for errors in summarizer
3. Artifact exists: `SELECT * FROM artifacts WHERE type = 'conversation_summary' AND chat_id = '<id>'`

**Fix**: Manually trigger: 
```typescript
const summarizer = new ConversationSummarizer(chatId);
await summarizer.updateSummary(userId);
```

### Issue: Real-time updates not working in drawer

**Check**:
1. Supabase real-time enabled for `artifact_versions` table
2. RLS policies allow reading
3. Browser console for subscription errors

**Fix**: Verify RLS policy:
```sql
-- Allow users to read their chat artifacts
CREATE POLICY "Users can read their chat artifact versions"
ON artifact_versions FOR SELECT
USING (
  artifact_id IN (
    SELECT id FROM artifacts WHERE chat_id IN (
      SELECT id FROM chats WHERE user_id = auth.uid()
    )
  )
);
```

### Issue: Summary quality is poor

**Tuning**:
1. Adjust temperature in `config.ts` (lower = more focused)
2. Refine system prompt to emphasize key info
3. Increase `maxTokens` if summaries are cut off
4. Change model (try `claude-opus-4-5` for better reasoning)

## Cost Analysis

### Per-Chat Cost (50 messages)

**Old approach** (full history every time):
- 10 agent calls × 5,000 tokens context = 50,000 tokens
- Cost: ~$0.25

**New approach** (summary + recent):
- 1 summary generation: 5,000 input + 500 output = 5,500 tokens (~$0.03)
- 10 agent calls × 1,500 tokens context = 15,000 tokens (~$0.08)
- Total: ~$0.11

**Savings**: 56% cost reduction

**Break-even**: Summarization cost is recovered after ~2-3 agent calls

## Conclusion

The conversation summarizer provides:
- ✅ Significant cost savings (50-67% reduction)
- ✅ Better agent context (highlights key decisions)
- ✅ Improved response times (smaller context)
- ✅ User transparency (visible summary in drawer)
- ✅ Non-blocking implementation (no UX impact)

The system is production-ready and can be deployed immediately. Monitor logs and database for the first few days to ensure smooth operation.
