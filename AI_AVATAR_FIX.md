# AI Avatar Visibility Fix

## Problem
AI avatars were not visible in the chat. The component was showing `/avatar/default.svg` which doesn't exist, and the fallback mechanism wasn't working properly.

## Root Causes

1. **Missing Metadata Propagation**: ChatPane was passing `metadata={m.metadata}` but messages had `agent_name` directly on the object
2. **Invalid Default Avatar**: Fallback was using `/avatar/default.svg` which doesn't exist
3. **No Reverse Lookup**: When agent_name was a display name (not an ID), there was no way to find the correct agent

## Solutions Implemented

### 1. Fixed ChatPane Message Passing
**File:** `components/ai_chat/ChatPane.jsx`

Changed from:
```jsx
<Message role={m.role} metadata={m.metadata}>
```

To:
```jsx
<Message role={m.role} metadata={{ agent_name: m.agent_name, agentId: m.agent_id, ...m.metadata }}>
```

Now the Message component receives the agent_name directly from the message object.

### 2. Updated Default Avatar
**File:** `lib/agents/agent-identities.ts`

Changed fallback avatar from:
```typescript
avatar: "/avatar/default.svg"  // Doesn't exist!
```

To:
```typescript
avatar: "/avatar/orchestator.svg"  // Valid avatar that exists
```

### 3. Added Reverse Lookup Function
**File:** `lib/agents/agent-identities.ts`

Added new function to find agent ID by display name:
```typescript
export function findAgentIdByName(name: string | null | undefined): string | null {
  if (!name) return null;
  
  for (const [id, identity] of Object.entries(AGENT_IDENTITIES)) {
    if (identity.name.toLowerCase() === name.toLowerCase()) {
      return id;
    }
  }
  return null;
}
```

### 4. Enhanced Message Component Logic
**File:** `components/ai_chat/Message.jsx`

Improved agent ID resolution with multiple fallbacks:
1. Check `metadata.agentId` (explicit ID)
2. Check `metadata.agent_id` (alternative ID field)
3. Check if `metadata.agent_name` is already an agent ID
4. Use reverse lookup to find ID by display name
5. Fall back to default identity if nothing matches

Also added check to skip "thinking..." placeholder:
```typescript
if (!agentId && metadata?.agent_name && metadata.agent_name !== 'thinking...') {
    // Try to resolve agent ID
}
```

### 5. Exported AGENT_IDENTITIES
**File:** `lib/agents/agent-identities.ts`

Made AGENT_IDENTITIES available for import so Message component can check if a name is a valid agent ID.

## How It Works Now

1. **Message is created** with `agent_name: "conversational"`
2. **ChatPane passes** metadata with agent_name to Message component
3. **Message component checks**:
   - Is "conversational" a valid agent ID? ✅ Yes
   - Get identity for "conversational" agent
4. **Avatar displays** with correct image and fallback emoji
5. **If image fails**, emoji icon shows instead

## Avatar Fallback Chain

1. **Primary**: SVG avatar image (e.g., `/avatar/Lead_Engineer.svg`)
2. **Secondary**: Emoji icon (e.g., `🧑‍💼`)
3. **Tertiary**: Default orchestrator avatar + emoji

## Testing

✅ All avatars now visible in chat
✅ Correct agent avatar displays for each response
✅ Fallback to emoji works if SVG fails
✅ No console errors
✅ No TypeScript errors

## Files Modified

1. `components/ai_chat/ChatPane.jsx` - Fixed metadata passing
2. `components/ai_chat/Message.jsx` - Enhanced agent ID resolution
3. `lib/agents/agent-identities.ts` - Fixed default avatar, added reverse lookup

## Result

AI avatars are now properly displayed in the chat with:
- Correct agent identity for each response
- Proper fallback handling
- No broken image references
- Emoji fallback if SVG fails to load
