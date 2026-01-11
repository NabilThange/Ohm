# Orchestrator Model Switching - Issue Summary & Solutions

## Executive Summary

The orchestrator model is **currently not functioning** as intended. While the multi-agent system architecture exists, the orchestrator agent is not being used to analyze user intent and route to specialized agents. Additionally, the UI dropdown does not reflect which agent is actively responding.

---

## Root Causes (Numbered List)

### 1. **No Intent Classification Layer**
   - The system bypasses the orchestrator agent entirely
   - Goes directly from user message → conversational/projectInitializer agent
   - Specialized agents (BOM Generator, Code Generator, Wiring Specialist, etc.) are never invoked
   - **Impact:** Multi-agent routing system is non-functional

### 2. **Missing Agent Metadata in API Response**
   - API only returns `{ response, isReadyToLock }`
   - Does not include which agent generated the response
   - No information about detected intent
   - **Impact:** Frontend has no way to know which agent responded

### 3. **Disconnected UI State**
   - Header component maintains local state for selected agent
   - No connection between backend agent selection and frontend display
   - Dropdown selection is purely cosmetic
   - **Impact:** UI never reflects actual active agent

### 4. **No State Management for Current Agent**
   - Parent component (AIAssistantUI) doesn't track current agent
   - No mechanism to pass agent updates to Header
   - No callback system for agent changes
   - **Impact:** Agent information cannot flow from backend to UI

### 5. **Hardcoded Agent Selection**
   - `getChatAgentType()` only checks message count (0 vs >0)
   - No analysis of message content
   - No intent detection
   - **Impact:** Cannot intelligently route to specialized agents

### 6. **Orchestrator Agent Not Integrated**
   - Orchestrator agent exists in config but is never called
   - Intent classification logic not implemented
   - No mapping from intent to specialized agents
   - **Impact:** The entire orchestration system is dormant

---

## Detailed Solutions (Numbered List)

### **Solution 1: Implement Intent-Based Routing in Orchestrator**

#### What to Change:
- **File:** `lib/agents/orchestrator.ts`
- **Method:** `chat()`
- **Lines:** ~255-306

#### Implementation Steps:

1. **Add intent classification before agent selection**
   ```typescript
   // Call orchestrator agent to analyze user intent
   const intentResponse = await this.runner.runAgent(
       'orchestrator',
       [{ role: 'user', content: userMessage }],
       { stream: false }
   );
   ```

2. **Map detected intent to appropriate agent**
   ```typescript
   const intentAgentMap = {
       'BOM': 'bomGenerator',
       'CODE': 'codeGenerator',
       'WIRING': 'wiringDiagram',
       'CIRCUIT_VERIFY': 'circuitVerifier',
       'DATASHEET': 'datasheetAnalyzer',
       'BUDGET': 'budgetOptimizer',
       'CHAT': 'conversational'
   };
   ```

3. **Return agent metadata along with response**
   ```typescript
   return { 
       response, 
       isReadyToLock,
       agentType: finalAgentType,
       agentName: AGENTS[finalAgentType].name,
       agentIcon: AGENTS[finalAgentType].icon,
       intent
   };
   ```

#### Benefits:
- ✅ Enables true multi-agent routing
- ✅ Specialized agents become accessible
- ✅ Provides agent metadata for UI updates
- ✅ Maintains backward compatibility

---

### **Solution 2: Update API to Return Agent Metadata**

#### What to Change:
- **File:** `app/api/agents/chat/route.ts`
- **Function:** `POST()`
- **Lines:** ~33-40

#### Implementation Steps:

1. **Destructure agent metadata from orchestrator response**
   ```typescript
   const { 
       response, 
       isReadyToLock, 
       agentType, 
       agentName, 
       agentIcon, 
       intent 
   } = await orchestrator.chat(message, undefined, forceAgent);
   ```

2. **Include agent data in API response**
   ```typescript
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

#### Benefits:
- ✅ Frontend receives agent information
- ✅ Enables UI to display active agent
- ✅ Provides intent context
- ✅ Supports analytics and logging

---

### **Solution 3: Add Agent State Management to UI**

#### What to Change:
- **File:** `components/ai_chat/AIAssistantUI.jsx`
- **Component:** `AIAssistantUI`
- **Lines:** Add new state and callbacks

#### Implementation Steps:

1. **Add current agent state**
   ```javascript
   const [currentAgent, setCurrentAgent] = useState({
       type: 'conversational',
       name: 'Conversational Agent',
       icon: '💡',
       intent: 'CHAT'
   });
   ```

2. **Create agent change callback**
   ```javascript
   const handleAgentChange = useCallback((agent) => {
       console.log('[AIAssistantUI] Agent changed:', agent);
       setCurrentAgent(agent);
   }, []);
   ```

3. **Pass callback to useChat hook**
   ```javascript
   const { messages, isLoading, sendMessage, setForceAgent } = useChat(
       selectedId, 
       userContext,
       handleAgentChange  // Pass callback
   );
   ```

4. **Pass current agent to Header**
   ```javascript
   <Header 
       currentAgent={currentAgent}
       onAgentChange={(agentId) => {
           setForceAgent(agentId);
           // Update current agent state
       }}
   />
   ```

#### Benefits:
- ✅ Centralized agent state management
- ✅ Enables Header to display current agent
- ✅ Supports both automatic and manual selection
- ✅ Provides foundation for agent analytics

---

### **Solution 4: Update useChat Hook to Handle Agent Data**

#### What to Change:
- **File:** `lib/hooks/use-chat.ts`
- **Function:** `useChat()`
- **Lines:** Add callback parameter and agent handling

#### Implementation Steps:

1. **Add onAgentChange callback parameter**
   ```typescript
   export function useChat(
       chatId: string | null, 
       userContext?: any,
       onAgentChange?: (agent: any) => void  // New parameter
   )
   ```

2. **Add forceAgent state for manual selection**
   ```typescript
   const [forceAgent, setForceAgent] = useState<string | null>(null);
   ```

3. **Include forceAgent in API call**
   ```typescript
   body: JSON.stringify({ 
       message: content, 
       chatId, 
       userContext,
       forceAgent  // Include forced agent
   })
   ```

4. **Notify parent when agent changes**
   ```typescript
   if (data.agent && onAgentChange) {
       console.log('[useChat] Agent changed to:', data.agent);
       onAgentChange(data.agent);
   }
   ```

5. **Return setForceAgent for manual selection**
   ```typescript
   return { 
       messages, 
       session, 
       isLoading, 
       error, 
       sendMessage,
       setForceAgent  // Expose for manual agent selection
   }
   ```

#### Benefits:
- ✅ Hooks into agent change events
- ✅ Supports manual agent override
- ✅ Maintains clean separation of concerns
- ✅ Enables parent component to react to agent changes

---

### **Solution 5: Update Header to Display Active Agent**

#### What to Change:
- **File:** `components/ai_chat/Header.jsx`
- **Component:** `Header`
- **Lines:** Update to receive and display current agent

#### Implementation Steps:

1. **Accept currentAgent prop**
   ```javascript
   export default function Header({ 
       createNewChat, 
       sidebarCollapsed, 
       setSidebarOpen, 
       currentAgent,  // Receive from parent
       onAgentChange 
   })
   ```

2. **Add projectInitializer to agents list**
   ```javascript
   {
       id: "projectInitializer",
       name: "Project Initializer",
       icon: "🚀",
       description: "Quick-start wizard for new projects",
       model: "Claude Opus 4.5"
   }
   ```

3. **Use currentAgent for display**
   ```javascript
   const activeAgentId = manualOverride || currentAgent?.type || "conversational"
   const isAutoSelected = !manualOverride && currentAgent?.type
   ```

4. **Add visual indicators**
   ```javascript
   {isAutoSelected && (
       <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900">
           Auto
       </span>
   )}
   {currentAgent?.intent && currentAgent.intent !== 'CHAT' && (
       <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900">
           {currentAgent.intent}
       </span>
   )}
   ```

5. **Clear manual override on auto-selection**
   ```javascript
   useEffect(() => {
       if (currentAgent?.intent !== 'MANUAL') {
           setManualOverride(null);
       }
   }, [currentAgent]);
   ```

#### Benefits:
- ✅ Displays automatically selected agent
- ✅ Shows visual distinction between auto and manual
- ✅ Displays detected intent
- ✅ Allows manual override
- ✅ Provides clear user feedback

---

### **Solution 6: Add Manual Agent Override Support**

#### What to Change:
- **Multiple Files:** Orchestrator, API, useChat, AIAssistantUI

#### Implementation Steps:

1. **Add forceAgent parameter to orchestrator.chat()**
   ```typescript
   async chat(
       userMessage: string,
       onStream?: (chunk: string) => void,
       forceAgent?: string  // New parameter
   )
   ```

2. **Check forceAgent before intent classification**
   ```typescript
   if (forceAgent) {
       finalAgentType = forceAgent as AgentType;
       intent = 'MANUAL';
       console.log(`👤 User forced agent: ${forceAgent}`);
   } else if (messageCount === 0) {
       // ... first message logic
   } else {
       // ... intent classification logic
   }
   ```

3. **Accept forceAgent in API route**
   ```typescript
   const { message, chatId, userContext, forceAgent } = await req.json();
   ```

4. **Pass forceAgent to orchestrator**
   ```typescript
   const result = await orchestrator.chat(message, undefined, forceAgent);
   ```

#### Benefits:
- ✅ Power users can select specific agents
- ✅ Useful for testing and debugging
- ✅ Provides user control over system
- ✅ Supports specialized workflows

---

## Implementation Priority (Numbered Steps)

### **Phase 1: Core Functionality (Critical - 4-6 hours)**

1. **Implement intent classification in orchestrator**
   - Modify `lib/agents/orchestrator.ts`
   - Add orchestrator agent call
   - Map intents to agents
   - Return agent metadata

2. **Update API route to return agent data**
   - Modify `app/api/agents/chat/route.ts`
   - Include agent metadata in response
   - Support forceAgent parameter

3. **Update useChat hook**
   - Modify `lib/hooks/use-chat.ts`
   - Add onAgentChange callback
   - Add forceAgent support
   - Handle agent data from API

### **Phase 2: UI Integration (High Priority - 2-3 hours)**

4. **Add agent state to AIAssistantUI**
   - Modify `components/ai_chat/AIAssistantUI.jsx`
   - Add currentAgent state
   - Create handleAgentChange callback
   - Pass to useChat and Header

5. **Update Header component**
   - Modify `components/ai_chat/Header.jsx`
   - Accept currentAgent prop
   - Display active agent
   - Add visual indicators
   - Support manual override

### **Phase 3: Testing & Refinement (Medium Priority - 2-3 hours)**

6. **Test intent classification**
   - Test BOM generation requests
   - Test code generation requests
   - Test wiring diagram requests
   - Test general chat

7. **Test UI updates**
   - Verify Header displays correct agent
   - Verify auto/manual indicators
   - Verify intent badges
   - Test manual override

8. **Add error handling**
   - Handle intent classification failures
   - Fallback to conversational agent
   - Log errors appropriately

---

## Testing Checklist (Numbered)

### **1. Intent Classification Tests**

1.1. **BOM Generation**
   - Input: "Create a BOM for my ESP32 weather station"
   - Expected: Routes to bomGenerator
   - Verify: Console shows "Intent: BOM"
   - Verify: Header shows "📦 BOM Generator [Auto]"

1.2. **Code Generation**
   - Input: "Write Arduino code for DHT22 sensor"
   - Expected: Routes to codeGenerator
   - Verify: Console shows "Intent: CODE"
   - Verify: Header shows "⚡ Code Generator [Auto]"

1.3. **Wiring Diagram**
   - Input: "How do I wire an ESP32 to a relay module?"
   - Expected: Routes to wiringDiagram
   - Verify: Console shows "Intent: WIRING"
   - Verify: Header shows "🔌 Wiring Specialist [Auto]"

1.4. **General Chat**
   - Input: "What's the best microcontroller for beginners?"
   - Expected: Routes to conversational
   - Verify: Console shows "Intent: CHAT"
   - Verify: Header shows "💡 Conversational Agent [Auto]"

### **2. First Message Tests**

2.1. **Project Initialization**
   - Action: Create new chat, send first message
   - Expected: Routes to projectInitializer
   - Verify: Console shows "First message, using projectInitializer"
   - Verify: Header shows "🚀 Project Initializer [Auto]"

### **3. Manual Override Tests**

3.1. **Manual Agent Selection**
   - Action: Click dropdown, select "Budget Optimizer"
   - Action: Send message: "Tell me about ESP32"
   - Expected: Uses budgetOptimizer despite chat intent
   - Verify: Header shows "💰 Budget Optimizer" (no Auto badge)

3.2. **Override Clearing**
   - Action: Continue conversation after manual override
   - Expected: Next message uses auto-detected agent
   - Verify: Auto badge reappears

### **4. UI Update Tests**

4.1. **Agent Change Reflection**
   - Action: Send messages with different intents
   - Expected: Header updates to show active agent
   - Verify: Icon, name, and badges update correctly

4.2. **Intent Badge Display**
   - Action: Trigger specialized agent (BOM, CODE, etc.)
   - Expected: Intent badge appears
   - Verify: Shows correct intent (BOM, CODE, WIRING, etc.)

---

## Expected Outcomes (Numbered)

### **1. Functional Multi-Agent Routing**
   - Orchestrator analyzes user intent
   - Routes to appropriate specialized agent
   - All 9 agents are accessible based on context

### **2. Real-Time UI Updates**
   - Header dropdown reflects active agent
   - Visual indicators show auto vs manual selection
   - Intent badges display detected intent

### **3. User Control**
   - Users can manually select agents
   - Manual selection overrides auto-detection
   - Clear visual feedback for all states

### **4. Improved User Experience**
   - Transparent agent switching
   - Clear indication of which agent is responding
   - Confidence in system intelligence

### **5. Better System Performance**
   - Right agent for the right task
   - Optimized model usage
   - Reduced token consumption

### **6. Enhanced Debugging**
   - Console logs show intent detection
   - Agent routing decisions visible
   - Easy to troubleshoot issues

---

## Files to Modify (Summary)

| # | File | Purpose | Lines Changed |
|---|------|---------|---------------|
| 1 | `lib/agents/orchestrator.ts` | Add intent classification, return agent metadata | ~100 |
| 2 | `app/api/agents/chat/route.ts` | Return agent data in API response | ~10 |
| 3 | `lib/hooks/use-chat.ts` | Add agent change callback, forceAgent support | ~20 |
| 4 | `components/ai_chat/AIAssistantUI.jsx` | Add currentAgent state, pass to Header | ~30 |
| 5 | `components/ai_chat/Header.jsx` | Display active agent, visual indicators | ~40 |

**Total:** ~200 lines of code changes
**Estimated Time:** 8-12 hours (including testing)

---

## Success Criteria (Numbered)

### **1. Intent Classification Works**
   - ✅ Orchestrator agent successfully analyzes user messages
   - ✅ Correct intent detected for various message types
   - ✅ Appropriate agent selected based on intent

### **2. Specialized Agents Are Used**
   - ✅ BOM Generator responds to component requests
   - ✅ Code Generator handles programming questions
   - ✅ Wiring Specialist answers circuit questions
   - ✅ All 9 agents are accessible

### **3. UI Reflects Active Agent**
   - ✅ Header dropdown shows current agent
   - ✅ Auto/manual indicators display correctly
   - ✅ Intent badges appear when appropriate

### **4. Manual Override Functions**
   - ✅ Users can select agents manually
   - ✅ Manual selection persists for that message
   - ✅ Auto-detection resumes after manual use

### **5. System Is Transparent**
   - ✅ Console logs show routing decisions
   - ✅ Users understand which agent is responding
   - ✅ Clear visual feedback at all times

### **6. Error Handling Works**
   - ✅ Graceful fallback if intent classification fails
   - ✅ Appropriate error messages
   - ✅ System remains functional

---

## Conclusion

The orchestrator model switching issue stems from **6 root causes** that prevent the multi-agent system from functioning as designed. By implementing the **6 detailed solutions** in **3 phases**, the system will:

1. ✅ Analyze user intent automatically
2. ✅ Route to specialized agents intelligently
3. ✅ Update UI to reflect active agent
4. ✅ Support manual agent override
5. ✅ Provide transparent operation
6. ✅ Deliver optimal user experience

**Current State:** Non-functional orchestrator, UI disconnected from backend
**After Implementation:** Fully functional multi-agent routing with real-time UI updates

**Time Investment:** 8-12 hours
**Value Delivered:** Complete multi-agent system with intelligent routing and user control
