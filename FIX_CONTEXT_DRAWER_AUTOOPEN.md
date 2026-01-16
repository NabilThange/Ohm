# Context Drawer Auto-Open Fix - Issue #3

## Problem Summary
The Context drawer was opening automatically and repeatedly, disrupting the user experience. This happened because the auto-open logic ran on every message change without tracking whether it had already opened for a specific artifact.

## Root Causes Identified

### 1. **Effect Running on Every Message Change**
The `loadArtifacts` effect had `messages` in its dependency array (line 278), causing it to re-run every time a new message was added to the chat.

### 2. **No Tracking of Already-Opened Artifacts**
The auto-open logic didn't track which artifacts had already triggered a drawer open, so it would open repeatedly for the same artifact across multiple re-renders.

### 3. **Insufficient Conditions**
The original logic only checked:
- If `activeTool` was null
- If `showArtifacts` was false

It didn't check:
- If the user had manually closed the drawer (`closedDrawers` set)
- If this specific artifact had already triggered an auto-open

## Changes Made

### 1. Added Artifact ID Tracking (`AIAssistantUI.jsx` lines 151-152)
```javascript
// Track which artifact IDs have already triggered auto-open to prevent repeated opening
const autoOpenedArtifacts = useRef(new Set());
```

**Why a ref?**
- Refs persist across re-renders without causing re-renders themselves
- Perfect for tracking state that doesn't need to trigger UI updates
- Automatically reset when switching chats

### 2. Reset Tracking on Chat Switch (lines 155-158)
```javascript
// Reset closed drawers and auto-opened tracking when switching chats
useEffect(() => {
    setClosedDrawers(new Set());
    autoOpenedArtifacts.current = new Set();
}, [selectedId]);
```

**Why reset?**
- Each chat should have independent drawer behavior
- Starting a new chat should allow auto-open again
- Prevents tracking data from accumulating indefinitely

### 3. Enhanced Auto-Open Logic in loadArtifacts (lines 260-283)
**Added three new conditions:**
1. ✅ Check if drawer is in `closedDrawers` set (user manually closed it)
2. ✅ Check if artifact ID is already in `autoOpenedArtifacts` (already opened for this artifact)
3. ✅ Track the artifact ID when auto-opening

**Detailed logging added:**
- Logs artifact ID being checked
- Logs all conditions (closed set, active tool, already opened)
- Logs when auto-open is triggered with artifact ID

### 4. Enhanced Auto-Open Logic in Realtime Subscription (lines 357-371)
**Same improvements as loadArtifacts:**
- Checks `autoOpenedArtifacts` ref
- Tracks artifact ID when opening
- Improved logging for debugging

## How It Works Now

### First Time Context Artifact is Created
1. ✅ Artifact created via tool call
2. ✅ `loadArtifacts` effect runs
3. ✅ Checks: not in closed set ✓, no active tool ✓, not already opened ✓
4. ✅ Opens drawer and adds artifact ID to `autoOpenedArtifacts`
5. ✅ User sees drawer open **once**

### Subsequent Message Changes
1. ✅ New message added to chat
2. ✅ `loadArtifacts` effect runs again (due to `messages` dependency)
3. ✅ Checks: artifact ID already in `autoOpenedArtifacts` ✗
4. ✅ **Does NOT open drawer**
5. ✅ User continues working without interruption

### User Manually Closes Drawer
1. ✅ User clicks close button
2. ✅ Drawer type added to `closedDrawers` set
3. ✅ Future auto-open attempts check this set
4. ✅ **Drawer stays closed** even if new artifacts are created

### Realtime Artifact Updates
1. ✅ Supabase realtime event fires
2. ✅ Checks: not in closed set ✓, not already opened for this artifact ID ✓
3. ✅ Opens drawer **once** and tracks artifact ID
4. ✅ Subsequent updates to same artifact don't re-open

## Testing Scenarios

### Scenario 1: New Chat with Context Creation
**Expected Behavior:**
1. Start new chat
2. Send message that triggers context creation
3. Drawer opens **once**
4. Send follow-up messages
5. Drawer **stays open** (doesn't close and reopen)

### Scenario 2: User Closes Drawer
**Expected Behavior:**
1. Drawer is open
2. User clicks close
3. Drawer closes
4. Send more messages
5. Drawer **stays closed**

### Scenario 3: Switch Between Chats
**Expected Behavior:**
1. Chat A has context, drawer open
2. Switch to Chat B (new chat)
3. Tracking resets
4. Create context in Chat B
5. Drawer opens **once** for Chat B

### Scenario 4: Multiple Artifact Updates
**Expected Behavior:**
1. Context artifact created (drawer opens)
2. Context artifact updated (drawer stays open, doesn't reopen)
3. MVP artifact created (drawer stays on context, doesn't switch)
4. User manually switches to MVP
5. Works normally

## Debugging Logs

### Successful Auto-Open (First Time)
```
[AIAssistantUI] ✅ Artifacts loaded: {context: true, ...}
[AIAssistantUI] 🔍 Context artifacts exist. Should auto-open? true {
  artifactId: "abc123",
  inClosedSet: false,
  activeToolExists: false,
  alreadyOpened: false
}
[AIAssistantUI] ✅ Auto-opening context drawer for artifact: abc123
```

### Prevented Auto-Open (Already Opened)
```
[AIAssistantUI] ✅ Artifacts loaded: {context: true, ...}
[AIAssistantUI] 🔍 Context artifacts exist. Should auto-open? false {
  artifactId: "abc123",
  inClosedSet: false,
  activeToolExists: true,
  alreadyOpened: true
}
```

### Prevented Auto-Open (User Closed)
```
[AIAssistantUI] ✅ Artifacts loaded: {context: true, ...}
[AIAssistantUI] 🔍 Context artifacts exist. Should auto-open? false {
  artifactId: "abc123",
  inClosedSet: true,
  activeToolExists: false,
  alreadyOpened: false
}
```

## Benefits of This Approach

### 1. **Ref-Based Tracking**
- ✅ No unnecessary re-renders
- ✅ Persists across component updates
- ✅ Automatically cleaned up on unmount

### 2. **Artifact ID Granularity**
- ✅ Tracks specific artifacts, not just drawer types
- ✅ Allows new artifacts to open drawer
- ✅ Prevents same artifact from opening multiple times

### 3. **Respects User Intent**
- ✅ If user closes drawer, it stays closed
- ✅ User can manually reopen anytime
- ✅ Auto-open only for genuinely new content

### 4. **Comprehensive Logging**
- ✅ Easy to debug if issues occur
- ✅ Shows all decision factors
- ✅ Tracks artifact IDs for correlation

## Files Modified

- `components/ai_chat/AIAssistantUI.jsx`
  - Added `autoOpenedArtifacts` ref
  - Enhanced auto-open logic in `loadArtifacts` effect
  - Enhanced auto-open logic in realtime subscription
  - Added comprehensive logging

## Performance Impact

- ✅ **Minimal**: Ref operations are O(1)
- ✅ **No extra renders**: Refs don't trigger re-renders
- ✅ **Memory efficient**: Set only stores artifact IDs (strings)
- ✅ **Auto cleanup**: Resets on chat switch

## Edge Cases Handled

1. ✅ **Rapid message sending**: Only opens once per artifact
2. ✅ **Multiple artifact types**: Each tracked independently
3. ✅ **Chat switching**: Tracking resets appropriately
4. ✅ **User closes then new artifact**: New artifact can still open
5. ✅ **Realtime updates**: Coordinated with initial load
6. ✅ **No artifact ID**: Gracefully handles missing IDs

## Future Improvements (Optional)

1. **Persist closed state**: Use localStorage to remember user's drawer preferences across sessions
2. **Debounce**: Add debouncing if rapid artifact updates still cause issues
3. **Smart reopening**: Reopen drawer if user explicitly requests artifact update
4. **Analytics**: Track how often auto-open is prevented vs allowed
