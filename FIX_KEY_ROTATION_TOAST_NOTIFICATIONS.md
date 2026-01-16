# API Key Rotation Toast Notifications Fix - Issue #1

## Problem Summary
API keys were being rotated successfully (4 keys failed and rotated), but NO toast messages appeared to the user.

**Evidence from logs:**
```
⚠️ The Orchestrator failed (attempt 1/11): 402 "You need a min balance..."
💀 Key #1 marked as FAILED (1 errors)
🔄 Rotated: Key #1 → Key #2
🔌 BytezClient connected: 🔑 API Keys: 10/11 healthy
🔄 Retrying The Orchestrator with new key...
```

This happened 4 times (Keys #1, #2, #3, #4 failed) but the user saw **ZERO toast notifications**!

## Root Cause

**The key rotation was happening in the backend, but toasts are client-side:**

- ✅ **Backend**: Key rotation happens in `AgentRunner.executeWithRetry` (orchestrator.ts)
- ✅ **Backend**: KeyManager tracks rotation events
- ❌ **Frontend**: No mechanism to receive rotation events in real-time
- ❌ **Result**: Toasts never shown because frontend doesn't know about rotations

**The missing link:** Backend had no way to notify frontend when rotation occurred!

## Solution Implemented

### Added Real-Time Key Rotation Events via SSE

We added a complete event pipeline from backend to frontend:

```
Backend (KeyManager) 
  → Orchestrator (detects event)
    → API Route (sends SSE event)
      → Frontend (use-chat.ts receives event)
        → Toast Notification (shows to user)
```

---

### Files Modified

**Modified:**
1. `lib/agents/orchestrator.ts` - Added onKeyRotation callback
2. `app/api/agents/chat/route.ts` - Send key rotation SSE events
3. `lib/hooks/use-chat.ts` - Handle key rotation events and show toasts

---

**Result**: API key rotation events are now sent in real-time from backend to frontend via SSE, and toast notifications appear immediately when keys are rotated! 🎉
