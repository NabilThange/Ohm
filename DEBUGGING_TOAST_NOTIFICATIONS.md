# Toast Notification Debugging - Issue #2

## Problem Summary
Toast notifications for agent changes and tool calls are appearing delayed or not appearing at all, despite backend logs showing they are being sent correctly.

## Changes Made

### 1. Enhanced Logging in `toast-notifications.ts`
**Added comprehensive performance timing:**
- Tracks when `getToaster()` is called and how long initialization takes
- Logs when toaster is initialized vs reused
- Tracks exact timing of toast function calls (`showAgentChangeToast`, `showToolCallToast`)
- Measures time from function call to toast creation

**Key metrics now logged:**
- `performance.now()` timestamps for all operations
- Time to initialize toaster
- Time to create individual toasts
- Total time from call to creation

### 2. Enhanced ToastProvider (`ToastProvider.tsx`)
**Added eager initialization:**
- Provider now eagerly initializes the toaster on mount
- Uses `requestAnimationFrame` to ensure DOM is ready
- Tracks ready state to prevent race conditions
- Logs when provider mounts, becomes ready, and unmounts

**Added render tracking:**
- Logs when individual toasts are rendered
- Includes toast ID, type, title, and timestamp

### 3. Enhanced Stream Event Processing (`use-chat.ts`)
**Added timing for event handling:**
- Tracks when `agent_selected` events are received
- Measures callback execution time
- Tracks when `tool_call` events are received
- Measures time to trigger toast

## What to Look For in Console Logs

### Expected Flow (Successful Toast Display)

1. **Provider Initialization:**
   ```
   [ToastProvider] 🎨 ToastProvider mounting...
   [Toast Debug] 🔧 Initializing toaster for the first time...
   [Toast Debug] ✅ Toaster initialized in X.XX ms
   [ToastProvider] ✅ ToastProvider ready at X.XX ms (took X.XX ms)
   [ToastProvider] 📊 Ready state changed: true
   ```

2. **Agent Selection Event:**
   ```
   [useChat] ⚡ EARLY agent selection received at X.XX ms: {agent data}
   [useChat] 🔔 Triggering immediate agent change callback...
   [AIAssistantUI] ⚡ Agent change callback triggered: {agent data}
   [AIAssistantUI] 🔔 Showing agent change toast NOW...
   [Toast Debug] 🤖 showAgentChangeToast called at X.XX ms: {agent data}
   [Toast Debug] Creating agent change toast...
   [Toast Debug] ♻️ Reusing existing toaster (initialized X.XX ms ago)
   [Toast Debug] ✅ Agent change toast created in X.XX ms
   [Toast Debug] 📊 Total time from call to creation: X.XX ms
   [useChat] ✅ Agent change callback completed in X.XX ms
   [ToastProvider] 🎨 Rendering toast: {toast data}
   ```

3. **Tool Call Event:**
   ```
   [useChat] 🔧 Tool call notification received at X.XX ms: {tool data}
   [Toast Debug] 🔧 showToolCallToast called at X.XX ms: {tool name}
   [Toast Debug] Creating tool call toast for: {display name}
   [Toast Debug] ♻️ Reusing existing toaster (initialized X.XX ms ago)
   [Toast Debug] ✅ Tool call toast created in X.XX ms
   [Toast Debug] 📊 Total time from call to creation: X.XX ms
   [useChat] ✅ Tool call toast triggered in X.XX ms
   [ToastProvider] 🎨 Rendering toast: {toast data}
   ```

## Potential Issues to Diagnose

### Issue 1: Toaster Not Initialized
**Symptoms:**
- Missing initialization logs
- "Initializing toaster for the first time" appears late

**Cause:** ToastProvider mounted late or not at all

**Fix:** Ensure ToastProvider is in root layout and mounts early

### Issue 2: Race Condition
**Symptoms:**
- Toast functions called before provider is ready
- Large gap between "mounting" and "ready" logs
- Toast creation happens before "ready" state

**Cause:** Toast functions called during initial render before provider is ready

**Fix:** The eager initialization should help, but may need to queue toasts

### Issue 3: Rendering Delay
**Symptoms:**
- Toast created quickly but "Rendering toast" log appears late
- Large gap between creation and render

**Cause:** React rendering delay or CSS animation issues

**Fix:** Check CSS transitions, z-index, or React rendering performance

### Issue 4: Toast Created But Not Visible
**Symptoms:**
- All logs appear correctly
- "Rendering toast" log appears
- But toast not visible on screen

**Cause:** CSS/styling issue (z-index, positioning, opacity)

**Fix:** Inspect DOM, check z-index (should be 9999), check CSS classes

## Testing Instructions

1. **Open browser console** before starting a new chat
2. **Start a new chat** with any message
3. **Watch for the log sequence** outlined above
4. **Note any missing logs** or unusual timing gaps
5. **Check if toasts appear** visually on screen

## Timing Benchmarks (Expected)

- Toaster initialization: < 10ms
- Toast creation: < 5ms
- Event to callback: < 1ms
- Callback to toast creation: < 5ms
- Toast creation to render: < 16ms (1 frame)

**Total expected time from event to visible toast: < 50ms**

If any step takes significantly longer, that's the bottleneck.

## Next Steps Based on Findings

1. **If toaster initializes late:** Move ToastProvider higher in component tree
2. **If race condition:** Implement toast queue with retry mechanism
3. **If rendering is slow:** Optimize React rendering or CSS
4. **If toasts created but not visible:** Debug CSS/DOM issues
5. **If events not received:** Check SSE stream processing

## Files Modified

- `lib/agents/toast-notifications.ts` - Enhanced logging and timing
- `components/ToastProvider.tsx` - Eager initialization and render tracking
- `lib/hooks/use-chat.ts` - Event timing and callback measurement
