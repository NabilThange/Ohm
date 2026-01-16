# Agent Avatar Routing Fix

## Problem
The avatar was always showing the Orchestrator avatar because the `agent_id` wasn't being stored when the agent was routed. The multi-agent system works like this:

1. **Orchestrator** receives the message
2. **Orchestrator** determines which agent should handle it (routing)
3. **Orchestrator** sends `agent_selected` event with the routed agent info
4. **Routed Agent** (e.g., conversational, bomGenerator) generates the response
5. **Response** is saved with the routed agent's ID

However, the temporary message created in the frontend was only being updated with `agent_name` but NOT `agent_id`, so the Message component couldn't properly identify which agent to display.

## Root Cause
In `lib/hooks/use-chat.ts`, when the `agent_selected` event was received, the code was updating:
```typescript
agent_name: data.agent.name,
intent: data.agent.intent
```

But NOT storing the agent ID (`data.agent.type`), so the Message component had no way to look up the correct avatar.

## Solution
Updated the message state update to also store the agent ID:

**File:** `lib/hooks/use-chat.ts` (line ~217)

```typescript
// Update the temporary AI message with agent info
setMessages(prev => prev.map(m =>
    m.id === aiTempId ? {
        ...m,
        agent_name: data.agent.name,
        agent_id: data.agent.type || data.agent.id,  // NEW: Store the agent ID
        intent: data.agent.intent
    } : m
));
```

## How It Works Now

### Flow:
1. User sends message: "Build a BOM for a drone"
2. Orchestrator receives and classifies intent as `BOM_GENERATOR`
3. Orchestrator sends `agent_selected` event:
   ```json
   {
     "type": "agent_selected",
     "agent": {
       "type": "bomGenerator",
       "name": "Component Specialist",
       "icon": "🔧",
       "intent": "BOM"
     }
   }
   ```
4. Frontend receives event and updates message with:
   - `agent_name: "Component Specialist"`
   - `agent_id: "bomGenerator"` ← **NEW**
5. Message component receives metadata with `agent_id: "bomGenerator"`
6. Message component looks up identity and displays correct avatar: 🔧

### Avatar Resolution Chain:
1. Get `agent_id` from message metadata
2. Look up agent identity in `AGENT_IDENTITIES`
3. Display correct avatar (e.g., `/avatar/Component_Specialist.svg`)
4. Fallback to emoji if image fails

## Result

✅ **Orchestrator avatar** - Shows when orchestrator is routing/classifying
✅ **Conversational avatar** - Shows when conversational agent responds
✅ **BOM Generator avatar** - Shows when bomGenerator responds
✅ **Code Generator avatar** - Shows when codeGenerator responds
✅ **All other agents** - Show their respective avatars

Each agent now displays their unique avatar based on who actually handled the request!

## Testing

To verify the fix works:

1. Send a message that triggers BOM generation: "What components do I need?"
2. Watch the avatar change from Orchestrator to Component Specialist (🔧)
3. Send a message that triggers code generation: "Generate the code"
4. Watch the avatar change to Software Engineer (💻)
5. Send a general question: "Tell me more about this"
6. Watch the avatar change to Lead Engineer (🧑‍💼)

## Files Modified

- `lib/hooks/use-chat.ts` - Added `agent_id` to message state update

## No Breaking Changes

- Backward compatible with existing messages
- Fallback to default avatar if agent_id is missing
- No database changes required
- No API changes required
