# Quick Implementation Guide: Fix Orchestrator Model Switching

## Overview
This guide provides the exact code changes needed to enable orchestrator-based model switching and UI updates.

---

## Step 1: Update Orchestrator to Include Intent Classification

**File:** `lib/agents/orchestrator.ts`

**Location:** Replace the `chat()` method (lines ~255-306)

```typescript
/**
 * Step 1: Chat with dynamic agent selection based on intent
 */
async chat(
    userMessage: string,
    onStream?: (chunk: string) => void,
    forceAgent?: string
): Promise<{ 
    response: string; 
    isReadyToLock: boolean;
    agentType: string;
    agentName: string;
    agentIcon: string;
    intent: string;
}> {
    // 1. Get History BEFORE adding new message
    const historyBeforeNewMessage = await this.getHistory();
    const messageCount = historyBeforeNewMessage.length;
    
    // 2. Determine agent to use
    let finalAgentType: AgentType;
    let intent = 'CHAT';
    
    if (forceAgent) {
        // User manually selected an agent
        finalAgentType = forceAgent as AgentType;
        intent = 'MANUAL';
        console.log(`👤 User forced agent: ${forceAgent}`);
    } else if (messageCount === 0) {
        // First message - use project initializer
        finalAgentType = 'projectInitializer';
        intent = 'INIT';
        console.log(`🚀 First message, using projectInitializer`);
    } else {
        // Subsequent messages - classify intent
        console.log(`🎯 Classifying intent for: "${userMessage.substring(0, 50)}..."`);
        
        try {
            // Call orchestrator agent to classify intent
            const intentResponse = await this.runner.runAgent(
                'orchestrator',
                [{ role: 'user', content: userMessage }],
                { stream: false }
            );
            
            intent = intentResponse.trim().toUpperCase();
            console.log(`🎯 Detected intent: ${intent}`);
            
            // Map intent to agent
            const intentAgentMap: Record<string, AgentType> = {
                'BOM': 'bomGenerator',
                'CODE': 'codeGenerator',
                'WIRING': 'wiringDiagram',
                'CIRCUIT_VERIFY': 'circuitVerifier',
                'DATASHEET': 'datasheetAnalyzer',
                'BUDGET': 'budgetOptimizer',
                'CHAT': 'conversational'
            };
            
            finalAgentType = intentAgentMap[intent] || 'conversational';
            console.log(`🤖 Routing to agent: ${finalAgentType}`);
            
        } catch (error) {
            console.error('Intent classification failed, falling back to conversational:', error);
            finalAgentType = 'conversational';
            intent = 'CHAT';
        }
    }

    // 3. Persist User Message
    if (this.chatId) {
        const seq = await ChatService.getNextSequenceNumber(this.chatId);
        await ChatService.addMessage({
            chat_id: this.chatId,
            role: "user",
            content: userMessage,
            sequence_number: seq,
            intent: intent
        });
    }

    // 4. Get History (inclusive of new message)
    const history = await this.getHistory();

    // 5. Run Selected Agent
    const response = await this.runner.runAgent(
        finalAgentType,
        history,
        { stream: true, onStream, userContext: this.userContext }
    );

    // 6. Persist Assistant Response
    if (this.chatId) {
        const seq = await ChatService.getNextSequenceNumber(this.chatId);
        await ChatService.addMessage({
            chat_id: this.chatId,
            role: "assistant",
            content: response,
            agent_name: finalAgentType,
            sequence_number: seq,
            intent: intent
        });

        // Update last active
        await ChatService.updateSession(this.chatId, {
            current_agent: finalAgentType,
            last_active_at: new Date().toISOString()
        });
    }

    // Check if ready to lock
    const isReadyToLock = response.toLowerCase().includes("lock this design") ||
        response.toLowerCase().includes("shall we lock");

    // Return with agent metadata
    const agentConfig = AGENTS[finalAgentType];
    return { 
        response, 
        isReadyToLock,
        agentType: finalAgentType,
        agentName: agentConfig.name,
        agentIcon: agentConfig.icon,
        intent
    };
}
```

---

## Step 2: Update API Route to Return Agent Metadata

**File:** `app/api/agents/chat/route.ts`

**Replace the entire POST function:**

```typescript
export async function POST(req: NextRequest) {
    try {
        const { message, chatId, userContext, forceAgent } = await req.json();

        const effectiveChatId = chatId || "default_ephemeral_session";

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Instantiate orchestrator with the ID and userContext
        const orchestrator = new AssemblyLineOrchestrator(effectiveChatId, userContext);

        // Run with intent classification and agent selection
        const { 
            response, 
            isReadyToLock, 
            agentType, 
            agentName, 
            agentIcon, 
            intent 
        } = await orchestrator.chat(message, undefined, forceAgent);

        // Return response with agent metadata
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

    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
```

---

## Step 3: Update use-chat Hook to Handle Agent Data

**File:** `lib/hooks/use-chat.ts`

**Add callback parameter and update sendMessage:**

```typescript
export function useChat(
    chatId: string | null, 
    userContext?: any,
    onAgentChange?: (agent: any) => void  // ✅ Add callback
) {
    const [messages, setMessages] = useState<Message[]>([])
    const [session, setSession] = useState<ChatSession | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [forceAgent, setForceAgent] = useState<string | null>(null)  // ✅ Add state

    // ... existing useEffect hooks ...

    const sendMessage = useCallback(async (content: string) => {
        if (!chatId) return

        const tempId = crypto.randomUUID()
        console.log('[useChat] sendMessage called with:', { content, chatId })

        try {
            // Optimistic update
            const now = new Date().toISOString()
            const optimisticMsg: Message = {
                id: tempId,
                chat_id: chatId,
                role: 'user',
                content,
                sequence_number: Date.now(),
                created_at: now,
                agent_name: null,
                agent_model: null,
                intent: null,
                input_tokens: null,
                output_tokens: null,
                created_artifact_ids: null,
                metadata: null,
                content_search: null
            }

            console.log('[useChat] Adding optimistic user message:', optimisticMsg.id)
            setMessages(prev => [...prev, optimisticMsg])

            // Call API with userContext and forceAgent
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: content, 
                    chatId, 
                    userContext,
                    forceAgent  // ✅ Include forced agent
                })
            })

            const data = await res.json()
            console.log('[useChat] API response:', data)

            if (data.error) throw new Error(data.error)

            // ✅ Notify parent of agent change
            if (data.agent && onAgentChange) {
                console.log('[useChat] Agent changed to:', data.agent);
                onAgentChange(data.agent);
            }

            // Optimistic AI Response
            if (data.response) {
                const aiTempId = crypto.randomUUID()
                const optimisticAiMsg: Message = {
                    id: aiTempId,
                    chat_id: chatId,
                    role: 'assistant',
                    content: data.response,
                    sequence_number: Date.now() + 1,
                    created_at: new Date().toISOString(),
                    agent_name: data.agent?.type || 'conversational',  // ✅ Use actual agent
                    agent_model: null,
                    intent: data.agent?.intent || null,  // ✅ Store intent
                    input_tokens: null,
                    output_tokens: null,
                    created_artifact_ids: null,
                    metadata: null,
                    content_search: null
                }
                console.log('[useChat] Adding optimistic AI message:', aiTempId)
                setMessages(prev => [...prev, optimisticAiMsg])
            }

            // Clear force agent after use
            setForceAgent(null);

        } catch (err: any) {
            console.error('[useChat] Send failed:', err)
            setError(err.message)
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }, [chatId, userContext, forceAgent, onAgentChange])

    return { 
        messages, 
        session, 
        isLoading, 
        error, 
        sendMessage,
        setForceAgent  // ✅ Expose for manual agent selection
    }
}
```

---

## Step 4: Update AIAssistantUI to Track Current Agent

**File:** `components/ai_chat/AIAssistantUI.jsx`

**Add state and callback:**

```javascript
export default function AIAssistantUI({ initialPrompt, initialChatId, userContext }) {
    const router = useRouter()
    
    // ... existing state ...
    
    // ✅ Add current agent state
    const [currentAgent, setCurrentAgent] = useState({
        type: 'conversational',
        name: 'Conversational Agent',
        icon: '💡',
        intent: 'CHAT'
    });

    // ✅ Callback for agent changes
    const handleAgentChange = useCallback((agent) => {
        console.log('[AIAssistantUI] Agent changed:', agent);
        setCurrentAgent(agent);
    }, []);

    // ✅ Lifted useChat Hook - pass callback
    const { messages, isLoading: chatLoading, sendMessage, setForceAgent } = useChat(
        selectedId, 
        userContext,
        handleAgentChange  // ✅ Pass callback
    );

    // ... rest of component ...

    return (
        <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
                {/* ... mobile header ... */}

                <div className="mx-auto flex h-full w-full">
                    <Sidebar
                        {/* ... existing props ... */}
                    />

                    <main className="relative flex min-w-0 flex-1 flex-col h-full">
                        <Header 
                            createNewChat={() => router.push('/build')} 
                            sidebarCollapsed={sidebarCollapsed} 
                            setSidebarOpen={setSidebarOpen}
                            currentAgent={currentAgent}  // ✅ Pass current agent
                            onAgentChange={(agentId) => {
                                // Manual agent selection
                                setForceAgent(agentId);
                                const agentData = agents.find(a => a.id === agentId);
                                if (agentData) {
                                    setCurrentAgent({
                                        type: agentId,
                                        name: agentData.name,
                                        icon: agentData.icon,
                                        intent: 'MANUAL'
                                    });
                                }
                            }}
                        />

                        <ChatPane
                            {/* ... existing props ... */}
                        />
                    </main>
                </div>
            </div>
        </div>
    )
}
```

---

## Step 5: Update Header to Display Active Agent

**File:** `components/ai_chat/Header.jsx`

**Update component:**

```javascript
export default function Header({ 
    createNewChat, 
    sidebarCollapsed, 
    setSidebarOpen, 
    currentAgent,  // ✅ Receive from parent
    onAgentChange 
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [manualOverride, setManualOverride] = useState(null)

    // Our actual multi-agent system agents
    const agents = [
        {
            id: "projectInitializer",  // ✅ Add missing agent
            name: "Project Initializer",
            icon: "🚀",
            description: "Quick-start wizard for new projects",
            model: "Claude Opus 4.5"
        },
        {
            id: "conversational",
            name: "Conversational Agent",
            icon: "💡",
            description: "Chat & Requirements Gathering",
            model: "Claude Opus 4.5"
        },
        {
            id: "orchestrator",
            name: "Orchestrator",
            icon: "🎯",
            description: "Intent Classification & Routing",
            model: "GPT-4o"
        },
        {
            id: "bomGenerator",
            name: "BOM Generator",
            icon: "📦",
            description: "Component Selection & Optimization",
            model: "GPT-o1"
        },
        {
            id: "codeGenerator",
            name: "Code Generator",
            icon: "⚡",
            description: "Firmware Development",
            model: "Claude Sonnet 4.5"
        },
        {
            id: "wiringDiagram",
            name: "Wiring Specialist",
            icon: "🔌",
            description: "Circuit Design & Wiring",
            model: "GPT-4o"
        },
        {
            id: "circuitVerifier",
            name: "Circuit Inspector",
            icon: "👁️",
            description: "Visual Circuit Verification",
            model: "Gemini 2.5 Flash"
        },
        {
            id: "datasheetAnalyzer",
            name: "Datasheet Analyst",
            icon: "📄",
            description: "Technical Documentation Analysis",
            model: "Claude Opus 4.5"
        },
        {
            id: "budgetOptimizer",
            name: "Budget Optimizer",
            icon: "💰",
            description: "Cost Optimization",
            model: "GPT-o1"
        },
    ]

    // ✅ Use currentAgent from props, allow manual override
    const activeAgentId = manualOverride || currentAgent?.type || "conversational"
    const selectedAgentData = agents.find((agent) => agent.id === activeAgentId)
    const isAutoSelected = !manualOverride && currentAgent?.type

    const handleAgentChange = (agentId) => {
        setManualOverride(agentId)  // ✅ Set manual override
        setIsDropdownOpen(false)
        if (onAgentChange) {
            onAgentChange(agentId)
        }
    }

    // ✅ Clear manual override when currentAgent changes (auto-selection)
    useEffect(() => {
        if (currentAgent?.intent !== 'MANUAL') {
            setManualOverride(null);
        }
    }, [currentAgent]);

    return (
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
            {sidebarCollapsed && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
            )}

            <div className="hidden md:flex relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >
                    <span className="text-sm">{selectedAgentData?.icon}</span>
                    {selectedAgentData?.name}
                    {/* ✅ Show indicator for auto-selected agents */}
                    {isAutoSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Auto
                        </span>
                    )}
                    {/* ✅ Show intent if available */}
                    {currentAgent?.intent && currentAgent.intent !== 'CHAT' && currentAgent.intent !== 'MANUAL' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            {currentAgent.intent}
                        </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 max-h-96 overflow-y-auto">
                        {agents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleAgentChange(agent.id)}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                    activeAgentId === agent.id ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                                }`}
                            >
                                <span className="text-lg mt-0.5">{agent.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-sm">{agent.name}</span>
                                        {activeAgentId === agent.id && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{agent.description}</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{agent.model}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-2">
                <GhostIconButton label="More">
                    <MoreHorizontal className="h-4 w-4" />
                </GhostIconButton>
            </div>
        </div>
    )
}
```

**Add import:**
```javascript
import { useEffect } from "react"
```

---

## Testing Instructions

### 1. Test Intent Classification
```bash
# Start dev server
npm run dev

# Open browser console
# Send message: "Create a BOM for my ESP32 project"
# Check console for:
#   🎯 Detected intent: BOM
#   🤖 Routing to agent: bomGenerator
# Check Header shows: 📦 BOM Generator [Auto]
```

### 2. Test Code Generation
```bash
# Send message: "Write Arduino code for DHT22 sensor"
# Check console for:
#   🎯 Detected intent: CODE
#   🤖 Routing to agent: codeGenerator
# Check Header shows: ⚡ Code Generator [Auto]
```

### 3. Test Manual Override
```bash
# Click Header dropdown
# Select "Budget Optimizer"
# Send message: "Tell me about ESP32"
# Check Header shows: 💰 Budget Optimizer (no Auto badge)
# Next auto-detected message should clear override
```

### 4. Test First Message
```bash
# Create new chat
# Send first message
# Check console for:
#   🚀 First message, using projectInitializer
# Check Header shows: 🚀 Project Initializer [Auto]
```

---

## Summary of Changes

| File | Changes | Lines |
|------|---------|-------|
| `lib/agents/orchestrator.ts` | Add intent classification, return agent metadata | ~100 |
| `app/api/agents/chat/route.ts` | Return agent data in response | ~10 |
| `lib/hooks/use-chat.ts` | Add onAgentChange callback, forceAgent support | ~20 |
| `components/ai_chat/AIAssistantUI.jsx` | Add currentAgent state, pass to Header | ~30 |
| `components/ai_chat/Header.jsx` | Display active agent, show auto/manual indicators | ~40 |

**Total:** ~200 lines of code changes

**Time Estimate:** 3-4 hours

**Result:** Fully functional orchestrator with intent-based routing and UI updates!
