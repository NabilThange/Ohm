# Orchestrator Model Switching Issue - Analysis & Solutions

## Executive Summary

The orchestrator is **NOT currently functioning** as a true intent-based routing system. The system has been configured to use dynamic agent selection based on message count (projectInitializer → conversational), but it lacks:

1. **Intent classification** - No orchestrator agent analyzing user intent
2. **Dynamic model switching** - No automatic routing to specialized agents (BOM, Code, Wiring, etc.)
3. **UI feedback** - No mechanism to update the Header dropdown with the active agent

---

## Problem Breakdown

### 1. **Current System Architecture (What's Actually Happening)**

```
User Message
    ↓
API Route (/api/agents/chat/route.ts)
    ↓
AssemblyLineOrchestrator.chat()
    ↓
getChatAgentType(messageCount)
    ↓
Returns: 'projectInitializer' (if first) OR 'conversational' (if subsequent)
    ↓
AgentRunner.runAgent(agentType, messages)
    ↓
Response sent back to UI
    ↓
Header dropdown NEVER UPDATES (no communication channel)
```

**Issues:**
- ✗ No intent analysis
- ✗ Always uses conversational/projectInitializer agents
- ✗ Specialized agents (BOM, Code, Wiring, etc.) are NEVER called
- ✗ UI dropdown doesn't reflect active agent
- ✗ No orchestrator agent routing decisions

---

### 2. **Expected System Architecture (What Should Happen)**

```
User Message: "Generate a BOM for my ESP32 project"
    ↓
API Route
    ↓
Orchestrator Agent (GPT-4o) analyzes intent
    ↓
Intent Classification: "BOM"
    ↓
Routes to: BOM Generator Agent (GPT-o1)
    ↓
BOM Generator creates component list
    ↓
Response + Agent Info sent to UI
    ↓
Header dropdown updates to show "BOM Generator 📦"
```

**Required:**
- ✓ Intent classification via orchestrator agent
- ✓ Dynamic routing to specialized agents
- ✓ Agent metadata returned in API response
- ✓ UI updates to reflect active agent

---

## Root Causes (Numbered List)

### 1. **Missing Intent Classification Layer**
   - **Current State:** `orchestrator.chat()` directly calls conversational/projectInitializer agents
   - **Expected:** Should first call orchestrator agent to classify intent
   - **Impact:** Specialized agents (BOM, Code, Wiring, etc.) are never invoked

### 2. **No Agent Metadata in API Response**
   - **Current State:** API returns only `{ response, isReadyToLock }`
   - **Expected:** Should return `{ response, agentType, agentName, agentIcon, ... }`
   - **Impact:** UI has no way to know which agent responded

### 3. **Header Component Not Connected to Agent State**
   - **Current State:** Header has local state `selectedAgent` with no external updates
   - **Expected:** Should receive agent updates from parent component
   - **Impact:** Dropdown never reflects actual active agent

### 4. **No State Management for Current Agent**
   - **Current State:** No global/lifted state tracking current agent
   - **Expected:** Parent component should track and pass current agent to Header
   - **Impact:** Agent selection is purely cosmetic, doesn't affect backend

### 5. **Hardcoded Agent Selection Logic**
   - **Current State:** `getChatAgentType()` only checks message count
   - **Expected:** Should analyze user intent from message content
   - **Impact:** System cannot intelligently route to specialized agents

### 6. **Missing Orchestrator Integration**
   - **Current State:** Orchestrator agent exists in config but is never called
   - **Expected:** Should be called first to determine routing
   - **Impact:** The entire multi-agent routing system is bypassed

---

## Detailed Solutions (Numbered List)

### **Solution 1: Implement True Intent-Based Routing**

#### 1.1 Update Orchestrator Chat Method
**File:** `lib/agents/orchestrator.ts`

**Current Code:**
```typescript
async chat(userMessage: string, onStream?: (chunk: string) => void) {
    const historyBeforeNewMessage = await this.getHistory();
    const messageCount = historyBeforeNewMessage.length;
    const agentType = getChatAgentType(messageCount);  // ❌ Only checks count
    
    const response = await this.runner.runAgent(agentType, history, ...);
    return { response, isReadyToLock };
}
```

**Proposed Fix:**
```typescript
async chat(userMessage: string, onStream?: (chunk: string) => void) {
    // 1. Get history
    const historyBeforeNewMessage = await this.getHistory();
    const messageCount = historyBeforeNewMessage.length;
    
    // 2. Determine base agent (projectInitializer vs conversational)
    const baseAgentType = getChatAgentType(messageCount);
    
    // 3. If not first message, check for specialized intent
    let finalAgentType = baseAgentType;
    let intent = 'CHAT';
    
    if (messageCount > 0) {
        // Call orchestrator to classify intent
        const intentResponse = await this.runner.runAgent(
            'orchestrator',
            [{ role: 'user', content: userMessage }],
            { stream: false }
        );
        
        intent = intentResponse.trim().toUpperCase();
        
        // Map intent to agent
        const intentAgentMap = {
            'BOM': 'bomGenerator',
            'CODE': 'codeGenerator',
            'WIRING': 'wiringDiagram',
            'CIRCUIT_VERIFY': 'circuitVerifier',
            'DATASHEET': 'datasheetAnalyzer',
            'BUDGET': 'budgetOptimizer',
            'CHAT': baseAgentType
        };
        
        finalAgentType = intentAgentMap[intent] || baseAgentType;
        console.log(`🎯 Intent: ${intent}, Routing to: ${finalAgentType}`);
    }
    
    // 4. Persist user message
    // 5. Get updated history
    // 6. Run selected agent
    const response = await this.runner.runAgent(finalAgentType, history, ...);
    
    // 7. Persist response with agent info
    // 8. Return agent metadata
    return { 
        response, 
        isReadyToLock,
        agentType: finalAgentType,
        agentName: AGENTS[finalAgentType].name,
        agentIcon: AGENTS[finalAgentType].icon,
        intent
    };
}
```

**Benefits:**
- ✓ Enables true intent-based routing
- ✓ Specialized agents are now accessible
- ✓ Returns agent metadata for UI updates

---

### **Solution 2: Update API Response to Include Agent Metadata**

#### 2.1 Modify API Route
**File:** `app/api/agents/chat/route.ts`

**Current Code:**
```typescript
const { response, isReadyToLock } = await orchestrator.chat(message);

return NextResponse.json({
    response,
    isReadyToLock
});
```

**Proposed Fix:**
```typescript
const { response, isReadyToLock, agentType, agentName, agentIcon, intent } 
    = await orchestrator.chat(message);

return NextResponse.json({
    response,
    isReadyToLock,
    agent: {
        type: agentType,
        name: agentName,
        icon: agentIcon,
        intent: intent
    }
});
```

**Benefits:**
- ✓ Frontend receives agent information
- ✓ Enables UI updates based on active agent

---

### **Solution 3: Implement Agent State Management in UI**

#### 3.1 Add Current Agent State to AIAssistantUI
**File:** `components/ai_chat/AIAssistantUI.jsx`

**Add State:**
```javascript
const [currentAgent, setCurrentAgent] = useState({
    type: 'conversational',
    name: 'Conversational Agent',
    icon: '💡'
});
```

**Update sendMessage in use-chat hook:**
```typescript
// In lib/hooks/use-chat.ts
const data = await res.json();

if (data.agent) {
    // Callback to update parent component
    onAgentChange?.(data.agent);
}
```

**Pass to Header:**
```jsx
<Header 
    createNewChat={() => router.push('/build')} 
    sidebarCollapsed={sidebarCollapsed} 
    setSidebarOpen={setSidebarOpen}
    currentAgent={currentAgent}  // ✓ Pass current agent
    onAgentChange={setCurrentAgent}  // ✓ Allow manual override
/>
```

**Benefits:**
- ✓ Centralized agent state management
- ✓ Header can display current agent
- ✓ Supports both automatic and manual agent selection

---

### **Solution 4: Update Header to Reflect Active Agent**

#### 4.1 Modify Header Component
**File:** `components/ai_chat/Header.jsx`

**Current Code:**
```javascript
export default function Header({ createNewChat, sidebarCollapsed, setSidebarOpen, onAgentChange }) {
    const [selectedAgent, setSelectedAgent] = useState("conversational");
    // ...
}
```

**Proposed Fix:**
```javascript
export default function Header({ 
    createNewChat, 
    sidebarCollapsed, 
    setSidebarOpen, 
    currentAgent,  // ✓ Receive from parent
    onAgentChange 
}) {
    // Use currentAgent from props, fallback to local state
    const [manualOverride, setManualOverride] = useState(null);
    
    const activeAgent = manualOverride || currentAgent?.type || "conversational";
    
    const handleAgentChange = (agentId) => {
        setManualOverride(agentId);  // Allow manual override
        setIsDropdownOpen(false);
        if (onAgentChange) {
            onAgentChange({ type: agentId, ...agents.find(a => a.id === agentId) });
        }
    };
    
    // Add visual indicator for auto-selected vs manual
    const selectedAgentData = agents.find((agent) => agent.id === activeAgent);
    const isAutoSelected = !manualOverride && currentAgent?.type;
    
    return (
        <div className="...">
            <button className="...">
                <span className="text-sm">{selectedAgentData?.icon}</span>
                {selectedAgentData?.name}
                {isAutoSelected && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Auto
                    </span>
                )}
                <ChevronDown className="h-4 w-4" />
            </button>
            {/* ... dropdown ... */}
        </div>
    );
}
```

**Benefits:**
- ✓ Displays automatically selected agent
- ✓ Allows manual override
- ✓ Visual indicator for auto vs manual selection

---

### **Solution 5: Add Agent Transition Notifications**

#### 5.1 Create Agent Change Toast/Notification
**File:** `components/ai_chat/ChatPane.jsx` or `AIAssistantUI.jsx`

**Add Effect to Monitor Agent Changes:**
```javascript
const [previousAgent, setPreviousAgent] = useState(null);

useEffect(() => {
    if (currentAgent && previousAgent && currentAgent.type !== previousAgent.type) {
        // Show notification
        toast.info(
            `Switched to ${currentAgent.icon} ${currentAgent.name}`,
            { duration: 3000 }
        );
    }
    setPreviousAgent(currentAgent);
}, [currentAgent]);
```

**Benefits:**
- ✓ User awareness of agent switches
- ✓ Improved transparency
- ✓ Better UX

---

### **Solution 6: Add Manual Agent Selection Support**

#### 6.1 Allow Users to Force Specific Agents
**File:** `lib/hooks/use-chat.ts`

**Add forceAgent Parameter:**
```typescript
const sendMessage = useCallback(async (content: string, forceAgent?: string) => {
    const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: content, 
            chatId, 
            userContext,
            forceAgent  // ✓ Allow manual agent selection
        })
    });
}, [chatId, userContext]);
```

**Update Orchestrator:**
```typescript
async chat(userMessage: string, onStream?: (chunk: string) => void, forceAgent?: string) {
    let finalAgentType = baseAgentType;
    
    if (forceAgent) {
        // User manually selected an agent
        finalAgentType = forceAgent;
        console.log(`👤 User forced agent: ${forceAgent}`);
    } else if (messageCount > 0) {
        // Auto-detect intent
        // ... intent classification logic ...
    }
    
    // ... rest of method ...
}
```

**Benefits:**
- ✓ Power users can select specific agents
- ✓ Useful for testing and debugging
- ✓ Provides user control

---

## Implementation Priority (Numbered Steps)

### **Phase 1: Core Functionality (Critical)**

1. **Implement intent classification in orchestrator** (Solution 1)
   - Add orchestrator agent call before routing
   - Map intents to specialized agents
   - Test with various user prompts

2. **Return agent metadata in API response** (Solution 2)
   - Update API route to return agent info
   - Update TypeScript types

3. **Add agent state management to UI** (Solution 3)
   - Add currentAgent state to AIAssistantUI
   - Update use-chat hook to handle agent data
   - Pass state to Header component

### **Phase 2: UI Updates (High Priority)**

4. **Update Header to display active agent** (Solution 4)
   - Receive currentAgent from props
   - Show auto-selected agent
   - Add visual indicators

5. **Add agent transition notifications** (Solution 5)
   - Implement toast/notification system
   - Show when agent switches
   - Provide context for why agent switched

### **Phase 3: Enhanced Features (Medium Priority)**

6. **Implement manual agent override** (Solution 6)
   - Add forceAgent parameter
   - Update UI to support manual selection
   - Persist user preferences

7. **Add agent performance tracking**
   - Log agent usage statistics
   - Track response times per agent
   - Identify most-used agents

8. **Create agent switching analytics**
   - Track intent classification accuracy
   - Monitor agent switch frequency
   - Optimize routing logic based on data

---

## Testing Checklist

### **Test Case 1: Intent Classification**
```
✓ User: "Create a BOM for my project"
  Expected: Routes to bomGenerator
  Verify: Console shows "Intent: BOM, Routing to: bomGenerator"
  Verify: Header shows "📦 BOM Generator"
```

### **Test Case 2: Code Generation**
```
✓ User: "Write Arduino code for temperature sensor"
  Expected: Routes to codeGenerator
  Verify: Console shows "Intent: CODE, Routing to: codeGenerator"
  Verify: Header shows "⚡ Code Generator"
```

### **Test Case 3: Wiring Diagram**
```
✓ User: "How do I wire an ESP32 to a relay?"
  Expected: Routes to wiringDiagram
  Verify: Console shows "Intent: WIRING, Routing to: wiringDiagram"
  Verify: Header shows "🔌 Wiring Specialist"
```

### **Test Case 4: General Chat**
```
✓ User: "What's the best microcontroller for beginners?"
  Expected: Routes to conversational
  Verify: Console shows "Intent: CHAT, Routing to: conversational"
  Verify: Header shows "💡 Conversational Agent"
```

### **Test Case 5: First Message**
```
✓ User: First message in new chat
  Expected: Routes to projectInitializer
  Verify: Console shows "Using agent: projectInitializer"
  Verify: Header shows "🚀 Project Initializer"
```

### **Test Case 6: Manual Override**
```
✓ User manually selects "Budget Optimizer" from dropdown
✓ Sends message: "Tell me about ESP32"
  Expected: Uses budgetOptimizer despite chat intent
  Verify: Header shows "💰 Budget Optimizer" with manual indicator
```

---

## Code Quality & Best Practices

### **1. Type Safety**
```typescript
// Define agent metadata type
export interface AgentMetadata {
    type: AgentType;
    name: string;
    icon: string;
    model: string;
    intent?: string;
}

// Use in API response
interface ChatResponse {
    response: string;
    isReadyToLock: boolean;
    agent: AgentMetadata;
}
```

### **2. Error Handling**
```typescript
try {
    const intent = await classifyIntent(userMessage);
    const agentType = mapIntentToAgent(intent);
} catch (error) {
    console.error('Intent classification failed, falling back to conversational');
    agentType = 'conversational';
}
```

### **3. Logging & Debugging**
```typescript
console.log(`🎯 [Orchestrator] Intent: ${intent}`);
console.log(`🤖 [Orchestrator] Selected Agent: ${agentType}`);
console.log(`📊 [Orchestrator] Message Count: ${messageCount}`);
console.log(`👤 [Orchestrator] Forced Agent: ${forceAgent || 'None'}`);
```

### **4. Performance Optimization**
```typescript
// Cache intent classification for similar messages
const intentCache = new Map<string, string>();

async function classifyIntent(message: string): Promise<string> {
    const cacheKey = message.toLowerCase().trim();
    if (intentCache.has(cacheKey)) {
        return intentCache.get(cacheKey)!;
    }
    
    const intent = await orchestratorAgent.classify(message);
    intentCache.set(cacheKey, intent);
    return intent;
}
```

### **5. User Experience**
- Show loading state during agent switching
- Provide clear visual feedback
- Allow users to understand why agent was selected
- Enable easy manual override

---

## Summary

### **Current State:**
- ❌ No intent classification
- ❌ Specialized agents never called
- ❌ UI doesn't reflect active agent
- ❌ Orchestrator agent not integrated

### **After Implementation:**
- ✅ Intent-based routing to specialized agents
- ✅ UI updates to show active agent
- ✅ Automatic and manual agent selection
- ✅ Full multi-agent system functionality
- ✅ Transparent agent switching with user feedback

### **Key Files to Modify:**
1. `lib/agents/orchestrator.ts` - Add intent classification
2. `app/api/agents/chat/route.ts` - Return agent metadata
3. `components/ai_chat/AIAssistantUI.jsx` - Add agent state
4. `components/ai_chat/Header.jsx` - Display active agent
5. `lib/hooks/use-chat.ts` - Handle agent data

### **Estimated Implementation Time:**
- Phase 1 (Core): 4-6 hours
- Phase 2 (UI): 2-3 hours
- Phase 3 (Enhanced): 3-4 hours
- **Total: 9-13 hours**

The orchestrator will then function as a true multi-agent routing system with full UI integration!
