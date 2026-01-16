# Toast System Diagnostic - Issue #4

## Toast System Overview

### Architecture

```
app/layout.tsx
  └─ ToastProvider (mounted globally)
       └─ Uses getToaster() from toast-notifications.ts
            └─ Creates @ark-ui/react/toast instance
                 └─ Renders toasts with custom styling
```

### Toast Functions Available

**File:** `lib/agents/toast-notifications.ts`

1. ✅ `showAgentChangeToast(agentName, agentIcon)` - Agent selection
2. ✅ `showToolCallToast(toolName)` - Tool execution
3. ✅ `showKeyRotationSuccessToast(keyIndex)` - Key rotation success
4. ✅ `showKeyFailureToast(keyIndex, totalKeys, error)` - Key failure
5. ✅ `showAllKeysExhaustedToast(totalKeys)` - All keys exhausted
6. ✅ `showKeyManagerInitToast(keyCount)` - Key manager init

### Current Setup Status

✅ **ToastProvider** - Mounted in `app/layout.tsx` (line 31)
✅ **Toast CSS** - Imported in `app/layout.tsx` (line 3)
✅ **getToaster()** - Lazy-initialized singleton
✅ **Server-side guards** - All functions check `typeof window === 'undefined'`
✅ **Logging** - Comprehensive console logs for debugging

## Where Toasts Are Triggered

### 1. Agent Selection Toast

**Trigger Point:** `lib/hooks/use-chat.ts` (lines 197-203)

```typescript
} else if (data.type === 'agent_selected') {
    // Direct toast call
    import('@/lib/agents/toast-notifications').then(({ showAgentChangeToast }) => {
        showAgentChangeToast(data.agent.name, data.agent.icon);
    });
    
    // Also calls callback
    if (onAgentChange) {
        onAgentChange(data.agent);
    }
}
```

**Backup:** `components/ai_chat/AIAssistantUI.jsx` (line 119)
```javascript
showAgentChangeToast(agent.name, agent.icon);
```

### 2. Tool Call Toast

**Trigger Point:** `lib/hooks/use-chat.ts` (line 222)

```typescript
} else if (data.type === 'tool_call') {
    showToolCallToast(toolName);
}
```

### 3. Key Rotation Toasts

**Trigger Point:** `lib/hooks/use-chat.ts` (lines 252-289)

```typescript
} else if (data.type === 'key_rotation') {
    const event = data.event;
    
    if (event.type === 'key_rotated') {
        import('@/lib/agents/toast-notifications').then(({ showKeyRotationSuccessToast }) => {
            showKeyRotationSuccessToast(event.newKeyIndex || 0);
        });
    } else if (event.type === 'key_failed') {
        import('@/lib/agents/toast-notifications').then(({ showKeyFailureToast }) => {
            showKeyFailureToast(...);
        });
    }
}
```

## SSE Event Flow

### Backend Sends Events

**File:** `app/api/agents/chat/route.ts`

```typescript
// Agent selection (line 34-38)
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'agent_selected',
    agent: agent
})}\n\n`));

// Tool call (line 42-46)
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'tool_call',
    toolCall: toolCall
})}\n\n`));

// Key rotation (line 48-53)
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'key_rotation',
    event: keyRotationEvent
})}\n\n`));
```

### Frontend Receives Events

**File:** `lib/hooks/use-chat.ts` (lines 160-295)

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            // Handle different event types
            if (data.type === 'agent_selected') { /* show toast */ }
            if (data.type === 'tool_call') { /* show toast */ }
            if (data.type === 'key_rotation') { /* show toast */ }
        }
    }
}
```

## Debugging Checklist

### Step 1: Verify ToastProvider is Mounted

**Check:** Browser DevTools → Elements → Search for "toast-root"

**Expected:** Should find `<div class="toast-root">` elements

**If not found:**
- ToastProvider not mounted
- Check `app/layout.tsx` line 31
- Verify no errors in console during mount

### Step 2: Verify Toast Functions Are Called

**Check:** Browser DevTools → Console

**Expected logs when sending a message:**
```
[useChat] ⚡ EARLY agent selection received at 52.34 ms
[useChat] 🎯 Showing agent selection toast directly...
[Toast Debug] 🤖 showAgentChangeToast called at 54.12 ms
[Toast Debug] Creating agent change toast...
[Toast Debug] ✅ Agent change toast created in 0.45 ms
[ToastProvider] 🎨 Rendering toast: { id: "...", type: "success", title: "Agent Active" }
```

**If missing:**
- SSE event not received
- Event handler not executing
- Import failing

### Step 3: Verify SSE Events Are Sent

**Check:** Browser DevTools → Network tab → Filter: "EventStream"

**Expected:**
- Request to `/api/agents/chat`
- Type: `eventsource`
- Events visible in Messages tab

**Look for:**
```
data: {"type":"agent_selected","agent":{...}}
data: {"type":"tool_call","toolCall":{...}}
data: {"type":"key_rotation","event":{...}}
```

**If not found:**
- Backend not sending events
- Check `app/api/agents/chat/route.ts`
- Verify orchestrator callbacks are being called

### Step 4: Verify Toast Rendering

**Check:** Browser DevTools → Elements → Inspect toast

**Expected structure:**
```html
<div class="toast-root" style="...">
  <div class="toast-content">
    <div class="toast-icon-wrapper">
      <svg class="toast-icon">...</svg>
    </div>
    <div class="toast-text">
      <div class="toast-title">Agent Active</div>
      <div class="toast-description">🚀 The Project Initializer is now handling your request.</div>
    </div>
    <button class="toast-close">...</button>
  </div>
</div>
```

**If structure exists but not visible:**
- CSS issue (z-index, positioning)
- Check `components/toast.css`
- Verify z-index is 99999

### Step 5: Test Toast System Directly

**Add test button to your UI:**

```tsx
// In any component
<button onClick={() => {
    import('@/lib/agents/toast-notifications').then(({ showAgentChangeToast }) => {
        showAgentChangeToast('Test Agent', '🧪');
    });
}}>
    Test Toast
</button>
```

**Expected:** Toast appears immediately

**If it works:**
- Toast system is fine
- Issue is with event handling

**If it doesn't work:**
- ToastProvider issue
- CSS issue
- Import issue

## Common Issues & Solutions

### Issue 1: Toasts Not Appearing

**Symptoms:**
- Console logs show toast functions called
- No visual toast appears

**Possible Causes:**
1. CSS z-index too low
2. Toast positioned off-screen
3. Toast duration too short
4. Toast hidden behind other elements

**Solutions:**
1. Check `components/toast.css` - z-index should be 99999
2. Verify `placement: 'top-end'` in toast config
3. Increase duration to 10000ms for testing
4. Inspect element to see if it exists but is hidden

### Issue 2: SSE Events Not Received

**Symptoms:**
- Backend logs show events sent
- Frontend doesn't receive them

**Possible Causes:**
1. SSE connection not established
2. Event name mismatch
3. JSON parsing error
4. Network issue

**Solutions:**
1. Check Network tab for EventStream connection
2. Verify event type names match exactly
3. Add try-catch around JSON.parse
4. Check for CORS issues

### Issue 3: Dynamic Import Failing

**Symptoms:**
- Console shows import error
- Toast function not called

**Possible Causes:**
1. Module not found
2. Circular dependency
3. Build issue

**Solutions:**
1. Use static import instead: `import { showAgentChangeToast } from '@/lib/agents/toast-notifications'`
2. Check build output for errors
3. Clear `.next` folder and rebuild

### Issue 4: Server-Side Execution

**Symptoms:**
- Console log: "Skipping - server side"
- No toast appears

**Possible Causes:**
1. Function called during SSR
2. Component not marked as 'use client'

**Solutions:**
1. Ensure component has `'use client'` directive
2. Only call toast functions in useEffect or event handlers
3. Check `typeof window !== 'undefined'` before calling

## Expected Console Logs (Full Flow)

### When Sending First Message

```
[ToastProvider] 🎨 ToastProvider mounting...
[Toast Debug] 🔧 Initializing toaster for the first time...
[Toast Debug] ✅ Toaster initialized in 0.23 ms
[ToastProvider] ✅ ToastProvider ready at 45.67 ms (took 0.34 ms)
[ToastProvider] 📊 Ready state changed: true

[API Route] 🚀 Sending early agent notification: The Project Initializer

[useChat] ⚡ EARLY agent selection received at 52.34 ms: { name: "The Project Initializer", ... }
[useChat] 🎯 Showing agent selection toast directly...
[Toast Debug] 🤖 showAgentChangeToast called at 54.12 ms: { agentName: "The Project Initializer", agentIcon: "🚀" }
[Toast Debug] ♻️ Reusing existing toaster (initialized 8.45 ms ago)
[Toast Debug] Creating agent change toast...
[Toast Debug] ✅ Agent change toast created in 0.45 ms
[Toast Debug] 📊 Total time from call to creation: 0.45 ms

[ToastProvider] 🎨 Rendering toast: { id: "toast-1", type: "success", title: "Agent Active", timestamp: "54.57ms" }
```

### When Key Rotation Occurs

```
[API Route] 🔑 Sending key rotation event: key_rotated

[useChat] 🔑 Key rotation event received at 2010.45 ms: { type: "key_rotated", ... }
[useChat] 🔄 Showing key rotation toast: Switched to backup key (10/11 available)
[Toast Debug] 🟢 showKeyRotationSuccessToast called: { newKeyIndex: 1 }
[Toast Debug] ♻️ Reusing existing toaster (initialized 1965.78 ms ago)
[Toast Debug] Creating success toast...
[Toast Debug] ✅ Success toast created
[ToastProvider] 🎨 Rendering toast: { id: "toast-2", type: "success", title: "✅ API Key Rotated Successfully" }
```

## Files Involved

### Core Files
1. `lib/agents/toast-notifications.ts` - Toast functions
2. `components/ToastProvider.tsx` - Toast renderer
3. `components/toast.css` - Toast styling
4. `app/layout.tsx` - ToastProvider mount point

### Event Handlers
1. `lib/hooks/use-chat.ts` - SSE event handling
2. `components/ai_chat/AIAssistantUI.jsx` - Agent change callback
3. `app/api/agents/chat/route.ts` - SSE event sending

### Configuration
1. `lib/agents/orchestrator.ts` - Event generation
2. `lib/agents/key-manager.ts` - Key rotation events

## Quick Fixes

### If Toasts Never Appear

1. **Add static import in use-chat.ts:**
```typescript
import { showAgentChangeToast, showToolCallToast, showKeyRotationSuccessToast } from '@/lib/agents/toast-notifications';

// Then use directly (no dynamic import)
showAgentChangeToast(data.agent.name, data.agent.icon);
```

2. **Increase z-index in toast.css:**
```css
.toast-root {
    z-index: 999999 !important;
}
```

3. **Force toast to stay longer:**
```typescript
getToaster().success({
    title: 'Test',
    description: 'Testing',
    duration: Infinity  // Stays until dismissed
});
```

---

**Summary:** The toast system is properly set up with ToastProvider mounted, comprehensive logging, and SSE event handling. If toasts aren't appearing, check console logs to identify which step is failing, then use the debugging checklist above to diagnose and fix the issue.
