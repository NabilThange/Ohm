# Orchestrator Fix - Quick Reference Card

## 🚨 Problem
Orchestrator is NOT routing to specialized agents. UI dropdown doesn't update.

## ✅ Solution Overview
Implement intent classification → Route to specialized agents → Update UI

---

## 📋 Quick Implementation Checklist

### ☐ Step 1: Update Orchestrator (lib/agents/orchestrator.ts)
```typescript
// Add intent classification
const intentResponse = await this.runner.runAgent('orchestrator', ...);
const intent = intentResponse.trim().toUpperCase();

// Map to agent
const agentType = intentAgentMap[intent] || 'conversational';

// Return metadata
return { response, agentType, agentName, agentIcon, intent };
```

### ☐ Step 2: Update API (app/api/agents/chat/route.ts)
```typescript
// Return agent data
return NextResponse.json({
    response,
    isReadyToLock,
    agent: { type, name, icon, intent }
});
```

### ☐ Step 3: Update useChat (lib/hooks/use-chat.ts)
```typescript
// Add callback
export function useChat(chatId, userContext, onAgentChange) {
    // Notify on agent change
    if (data.agent && onAgentChange) {
        onAgentChange(data.agent);
    }
}
```

### ☐ Step 4: Update AIAssistantUI (components/ai_chat/AIAssistantUI.jsx)
```javascript
// Add state
const [currentAgent, setCurrentAgent] = useState({...});

// Pass to useChat
const { ... } = useChat(selectedId, userContext, setCurrentAgent);

// Pass to Header
<Header currentAgent={currentAgent} onAgentChange={...} />
```

### ☐ Step 5: Update Header (components/ai_chat/Header.jsx)
```javascript
// Receive currentAgent
export default function Header({ currentAgent, onAgentChange }) {
    // Display active agent
    const activeAgentId = currentAgent?.type || "conversational";
    
    // Show indicators
    {isAutoSelected && <span>Auto</span>}
}
```

---

## 🧪 Quick Test

```bash
# 1. Start dev server
npm run dev

# 2. Send message: "Create a BOM for my project"
# Expected: Console shows "Intent: BOM, Routing to: bomGenerator"
# Expected: Header shows "📦 BOM Generator [Auto]"

# 3. Send message: "Write Arduino code"
# Expected: Console shows "Intent: CODE, Routing to: codeGenerator"
# Expected: Header shows "⚡ Code Generator [Auto]"
```

---

## 📊 Agent Intent Mapping

| User Message Contains | Intent | Routes To |
|----------------------|--------|-----------|
| "BOM", "parts", "components" | BOM | 📦 BOM Generator |
| "code", "program", "firmware" | CODE | ⚡ Code Generator |
| "wire", "connect", "circuit" | WIRING | 🔌 Wiring Specialist |
| "verify", "check circuit" | CIRCUIT_VERIFY | 👁️ Circuit Inspector |
| "datasheet", "specs" | DATASHEET | 📄 Datasheet Analyst |
| "budget", "cheaper", "cost" | BUDGET | 💰 Budget Optimizer |
| Everything else | CHAT | 💡 Conversational Agent |
| First message | INIT | 🚀 Project Initializer |

---

## 🔍 Debugging

### Check Console Logs
```
✅ Good: "🎯 Detected intent: BOM"
✅ Good: "🤖 Routing to agent: bomGenerator"
❌ Bad: No intent logs = orchestrator not running
```

### Check Network Tab
```
✅ Good: Response includes { agent: { type, name, icon, intent } }
❌ Bad: Response only has { response, isReadyToLock }
```

### Check Header
```
✅ Good: Shows "📦 BOM Generator [Auto]"
❌ Bad: Always shows "💡 Conversational Agent"
```

---

## 🎯 Success Indicators

1. ✅ Console shows intent classification
2. ✅ Console shows agent routing
3. ✅ Header updates automatically
4. ✅ Specialized agents respond
5. ✅ Manual override works
6. ✅ Auto badge appears

---

## ⏱️ Time Estimate

- **Phase 1 (Core):** 4-6 hours
- **Phase 2 (UI):** 2-3 hours
- **Phase 3 (Testing):** 2-3 hours
- **Total:** 8-12 hours

---

## 📚 Documentation

- **Full Analysis:** `docs/ORCHESTRATOR_ISSUE_ANALYSIS.md`
- **Implementation Guide:** `docs/ORCHESTRATOR_IMPLEMENTATION_GUIDE.md`
- **Summary:** `docs/ORCHESTRATOR_SUMMARY.md`
- **This Card:** `docs/ORCHESTRATOR_QUICK_REFERENCE.md`

---

## 🆘 Common Issues

### Issue: Intent always "CHAT"
**Fix:** Check orchestrator agent prompt, ensure it returns only intent name

### Issue: Header doesn't update
**Fix:** Verify currentAgent prop is passed to Header, check onAgentChange callback

### Issue: Specialized agents never called
**Fix:** Verify intentAgentMap includes all intents, check agent routing logic

### Issue: Manual override doesn't work
**Fix:** Check forceAgent parameter is passed through API to orchestrator

---

## 🎉 Expected Result

**Before:**
```
User: "Create a BOM"
→ Conversational Agent responds
→ Header shows: 💡 Conversational Agent
```

**After:**
```
User: "Create a BOM"
→ Orchestrator detects intent: BOM
→ Routes to BOM Generator
→ BOM Generator responds
→ Header shows: 📦 BOM Generator [Auto] [BOM]
```

---

**Status:** Ready to implement
**Priority:** High
**Complexity:** Medium
**Impact:** High - Unlocks full multi-agent system
