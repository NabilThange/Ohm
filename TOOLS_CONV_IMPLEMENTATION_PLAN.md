# 🎯 TOOLS_CONV Implementation Plan
**Context-Aware Multi-Agent System with Universal File I/O**

## Executive Summary
This plan implements a "Shared Memory System" for OHM's multi-agent architecture, enabling seamless agent handoffs through universal read/write tools, automated conversation summarization, and dynamic context injection. The goal is to eliminate agent amnesia and provide transparent project state tracking.

---

## 📋 Current State Analysis

### Existing Infrastructure (Already Working)
✅ **Conversation Summarizer Agent** - Defined in `lib/agents/config.ts` (lines 401-444)
✅ **ConversationSummarizer Service** - Fully implemented in `lib/agents/summarizer.ts`
✅ **Conversation Summary Drawer** - UI component exists at `components/tools/ConversationSummaryDrawer.tsx`
✅ **Artifact System** - Database tables and services (`lib/db/artifacts.ts`, `lib/db/chat.ts`)
✅ **Tool Execution Framework** - `lib/agents/tool-executor.ts` with complete tool handling
✅ **Agent System Prompts** - All agents configured in `lib/agents/config.ts`
✅ **Database Schema** - Supports `conversation_summary` artifact type

### What's Missing
❌ **Universal `read_file` tool** - Agents can't read arbitrary artifacts
❌ **Universal `write_file` tool** - Specialized update tools instead of generic write
❌ **Dynamic context injection** - Agents don't automatically receive conversation summary
❌ **Conversation summary integration** - Drawer not connected to sidebar/UI flow
❌ **Tool deprecation strategy** - Old specialized tools need phase-out path

---

## 🏗️ Implementation Phases

## Phase 1: Universal File I/O Tools (Foundation)

### 1.1 Define `read_file` Tool Schema
**File:** `lib/agents/tools.ts`
**Location:** Add to `DRAWER_TOOLS` object after existing tools (after line 375)

```typescript
read_file: {
    name: "read_file",
    description: "Read any project artifact to understand current project state. Use this to check what's been created or decided before making changes. Available artifacts: context, mvp, prd, bom, code, wiring, budget, conversation_summary.",
    parameters: {
        type: "object",
        properties: {
            artifact_type: {
                type: "string",
                enum: ["context", "mvp", "prd", "bom", "code", "wiring", "budget", "conversation_summary"],
                description: "Type of artifact to read"
            },
            file_path: {
                type: "string",
                description: "Optional: For code artifacts, specify which file to read (e.g., 'src/main.cpp')"
            }
        },
        required: ["artifact_type"]
    }
},
```

### 1.2 Define `write_file` Tool Schema
**File:** `lib/agents/tools.ts`
**Location:** Add after `read_file` definition

```typescript
write_file: {
    name: "write_file",
    description: "Create or update any project artifact. This replaces specialized update tools (update_context, update_bom, etc.). Always read the artifact first to preserve existing data.",
    parameters: {
        type: "object",
        properties: {
            artifact_type: {
                type: "string",
                enum: ["context", "mvp", "prd", "bom", "code", "wiring", "budget"],
                description: "Type of artifact to write"
            },
            content: {
                type: ["string", "object"],
                description: "Content to write. Use string for markdown (context/mvp/prd), object for structured data (bom/wiring/budget)"
            },
            merge_strategy: {
                type: "string",
                enum: ["replace", "append", "merge"],
                description: "How to handle existing content. Default: replace"
            },
            file_path: {
                type: "string",
                description: "For code artifacts: file path (e.g., 'src/main.cpp')"
            },
            language: {
                type: "string",
                description: "For code artifacts: programming language identifier"
            }
        },
        required: ["artifact_type", "content"]
    }
},
```

### 1.3 Update Tool Registry Function
**File:** `lib/agents/tools.ts`
**Location:** Modify `getToolsForAgent()` function (starts at line 381)

```typescript
export function getToolsForAgent(agentType: string): any[] {
    const toolMap: Record<string, string[]> = {
        conversational: [
            'read_file', 'write_file', // NEW: Universal tools
            'open_context_drawer', 'update_context', 'update_mvp', 'update_prd'
        ],
        projectInitializer: [
            'read_file', 'write_file',
            'open_context_drawer', 'update_context', 'update_mvp', 'update_prd'
        ],
        bomGenerator: [
            'read_file', 'write_file',
            'open_bom_drawer', 'update_bom'
        ],
        codeGenerator: [
            'read_file', 'write_file',
            'open_code_drawer', 'add_code_file'
        ],
        wiringDiagram: [
            'read_file', 'write_file',
            'open_wiring_drawer', 'update_wiring'
        ],
        budgetOptimizer: [
            'read_file', 'write_file',
            'open_budget_drawer', 'update_budget'
        ],
        conversationSummarizer: ['read_file'], // Can read but not write artifacts
        orchestrator: [],
        circuitVerifier: [],
        datasheetAnalyzer: []
    };

    const toolNames = toolMap[agentType] || [];
    return toolNames.map(name => DRAWER_TOOLS[name as keyof typeof DRAWER_TOOLS]);
}
```

### 1.4 Implement `read_file` Executor
**File:** `lib/agents/tool-executor.ts`
**Location:** Add new method to `ToolExecutor` class (after constructor, around line 50)

```typescript
/**
 * Read any artifact from the database
 */
private async readFile(artifactType: string, filePath?: string): Promise<any> {
    console.log(`📖 [ToolExecutor] Reading artifact: ${artifactType}${filePath ? ` (${filePath})` : ''}`);

    try {
        // Special handling for conversation summary
        if (artifactType === 'conversation_summary') {
            const { ConversationSummarizer } = await import('./summarizer');
            const summarizer = new ConversationSummarizer(this.chatId);
            return await summarizer.getSummaryForContext();
        }

        // Map artifact_type to database type
        const typeMap: Record<string, any> = {
            'context': 'context',
            'mvp': 'mvp',
            'prd': 'prd',
            'bom': 'bom',
            'code': 'code',
            'wiring': 'wiring',
            'budget': 'budget'
        };

        const dbType = typeMap[artifactType];
        if (!dbType) {
            throw new Error(`Unknown artifact type: ${artifactType}`);
        }

        const result = await ArtifactService.getLatestArtifact(this.chatId, dbType);

        if (!result || !result.version) {
            return {
                exists: false,
                message: `No ${artifactType} artifact found. This would be the first version.`
            };
        }

        // Handle code files specifically
        if (artifactType === 'code' && filePath) {
            const files = result.version.content_json?.files || [];
            const file = files.find((f: any) => f.path === filePath);
            
            if (!file) {
                return {
                    exists: false,
                    message: `File ${filePath} not found in code artifact`,
                    availableFiles: files.map((f: any) => f.path)
                };
            }

            return {
                exists: true,
                file: file,
                totalFiles: files.length
            };
        }

        // Return appropriate content format
        const content = result.version.content || result.version.content_json;
        
        return {
            exists: true,
            artifact_id: result.artifact.id,
            version: result.artifact.current_version,
            content: content,
            title: result.artifact.title
        };

    } catch (error: any) {
        console.error(`❌ [ToolExecutor] Failed to read ${artifactType}:`, error.message);
        throw error;
    }
}
```

### 1.5 Implement `write_file` Executor
**File:** `lib/agents/tool-executor.ts`
**Location:** Add after `readFile()` method

```typescript
/**
 * Write/update any artifact with merge strategies
 */
private async writeFile(params: {
    artifact_type: string;
    content: any;
    merge_strategy?: 'replace' | 'append' | 'merge';
    file_path?: string;
    language?: string;
}): Promise<any> {
    const { artifact_type, content, merge_strategy = 'replace', file_path, language } = params;
    
    console.log(`✍️ [ToolExecutor] Writing artifact: ${artifact_type} (strategy: ${merge_strategy})`);

    try {
        // Handle code files specially (use existing addCodeFile logic)
        if (artifact_type === 'code' && file_path) {
            return await this.addCodeFile({
                filename: file_path,
                language: language || 'text',
                content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
            });
        }

        // Route to specialized handlers for backward compatibility
        switch (artifact_type) {
            case 'context':
                return await this.updateContext(content);
            case 'mvp':
                return await this.updateMVP(content);
            case 'prd':
                return await this.updatePRD(content);
            case 'bom':
                return await this.updateBOM(content);
            case 'wiring':
                return await this.updateWiring(content);
            case 'budget':
                return await this.updateBudget(content);
            default:
                throw new Error(`Unsupported artifact type: ${artifact_type}`);
        }

    } catch (error: any) {
        console.error(`❌ [ToolExecutor] Failed to write ${artifact_type}:`, error.message);
        throw error;
    }
}
```

### 1.6 Wire Up Tool Executor Switch Cases
**File:** `lib/agents/tool-executor.ts`
**Location:** Add to `executeToolCall()` method switch statement (after line 99)

```typescript
case 'read_file':
    return await this.readFile(
        toolCall.arguments.artifact_type,
        toolCall.arguments.file_path
    );

case 'write_file':
    return await this.writeFile(toolCall.arguments);
```

---

## Phase 2: Dynamic Context Injection

### 2.1 Create Context Builder Service
**File:** Create new file `lib/agents/context-builder.ts`

```typescript
import { ConversationSummarizer } from './summarizer';

/**
 * Builds dynamic context for agent system prompts
 * Injects conversation summary and project state automatically
 */
export class AgentContextBuilder {
    private chatId: string;

    constructor(chatId: string) {
        this.chatId = chatId;
    }

    /**
     * Get enriched context to prepend to agent messages
     */
    async buildDynamicContext(): Promise<string> {
        const summarizer = new ConversationSummarizer(this.chatId);
        const summaryText = await summarizer.getSummaryForContext();

        // Check if there's actual context (not just "New conversation")
        if (summaryText.includes('New conversation')) {
            return ''; // Don't inject empty context on first message
        }

        return `
---
📋 PROJECT CONTEXT (Auto-injected)
${summaryText}
---

Use the above context to inform your response. Reference previous decisions and artifacts when relevant.
`;
    }

    /**
     * Get artifact metadata summary
     */
    async getArtifactsMetadata(): Promise<string> {
        const { ArtifactService } = await import('@/lib/db/artifacts');
        
        const types = ['context', 'mvp', 'prd', 'bom', 'code', 'wiring', 'budget'];
        const existing: string[] = [];

        for (const type of types) {
            const artifact = await ArtifactService.getLatestArtifact(this.chatId, type as any);
            if (artifact) {
                existing.push(`${type} (v${artifact.artifact.current_version})`);
            }
        }

        return existing.length > 0
            ? `\nExisting artifacts: ${existing.join(', ')}`
            : '\nNo artifacts created yet.';
    }
}
```

### 2.2 Inject Context into Orchestrator
**File:** `lib/agents/orchestrator.ts`
**Location:** Modify `runAgent()` method (around line 136-159)

**Before the system prompt prepending:**
```typescript
async runAgent(
    agentType: AgentType,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: {
        onStream?: (chunk: string) => void;
        stream?: boolean;
        onToolCall?: (toolCall: ToolCall) => Promise<any>;
        chatId?: string; // NEW: Pass chatId for context injection
    }
): Promise<{ response: string; toolCalls: ToolCall[] }> {
    const agent = AGENTS[agentType];

    if (!agent) {
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    // NEW: Build dynamic context if chatId provided
    let systemPrompt = agent.systemPrompt;
    
    if (options?.chatId) {
        const { AgentContextBuilder } = await import('./context-builder');
        const contextBuilder = new AgentContextBuilder(options.chatId);
        const dynamicContext = await contextBuilder.buildDynamicContext();
        
        if (dynamicContext) {
            systemPrompt = `${agent.systemPrompt}\n\n${dynamicContext}`;
            console.log(`💡 [Orchestrator] Injected conversation context for ${agent.name}`);
        }
    }

    // Prepend system prompt
    const fullMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages
    ];

    // ... rest of method unchanged
}
```

### 2.3 Update Chat API to Pass chatId
**File:** `app/api/agents/chat/route.ts`
**Location:** Modify orchestrator.chat() call (line 24)

```typescript
const result = await orchestrator.chat(
    message,
    (chunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\\n\\n`));
    },
    forceAgent,
    (agent) => {
        console.log('[API Route] 🚀 Sending early agent notification:', agent.name);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'agent_selected',
            agent: agent
        })}\\n\\n`));
    },
    (toolCall) => {
        console.log('[API Route] 🔧 Sending tool call notification:', toolCall.name);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'tool_call',
            toolCall: toolCall
        })}\\n\\n`));
    },
    (keyRotationEvent) => {
        console.log('[API Route] 🔑 Sending key rotation event:', keyRotationEvent.type);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'key_rotation',
            event: keyRotationEvent
        })}\\n\\n`));
    },
    effectiveChatId // NEW: Pass chatId for context injection
);
```

---

## Phase 3: Conversation Summary UI Integration

### 3.1 Add Summary Button to Tools Sidebar
**File:** `components/tools/ToolsSidebar.tsx`
**Location:** Modify tools array (line 21-28)

```typescript
const tools = [
    { id: 'context', label: 'Context', icon: FolderTree },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'components', label: 'Parts', icon: Cpu },
    { id: 'bom', label: 'BOM', icon: ScrollText },
    { id: 'wiring', label: 'Wiring', icon: Cable },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'summary', label: 'Summary', icon: MessageSquare }, // NEW
] as const
```

**Update type definition (line 13):**
```typescript
export type ToolType = 'budget' | 'components' | 'bom' | 'wiring' | 'code' | 'context' | 'summary' | null
```

### 3.2 Connect Summary Drawer to Main UI
**File:** Look for the main chat interface file (likely `components/BuildInterface.tsx` or `components/ai_chat/AIAssistantUI.jsx`)

**Add state for summary drawer:**
```typescript
const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false)

// In the tool selection handler:
const handleToolSelect = (tool: ToolType) => {
    // ... existing logic ...
    if (tool === 'summary') {
        setSummaryDrawerOpen(true)
    }
}

// In the render:
<ConversationSummaryDrawer
    isOpen={summaryDrawerOpen}
    onClose={() => setSummaryDrawerOpen(false)}
    chatId={currentChatId}
/>
```

### 3.3 Fix Real-time Subscription in Drawer
**File:** `components/tools/ConversationSummaryDrawer.tsx`
**Location:** Fix subscription filter (line 98)

**Current (broken):**
```typescript
filter: `artifact_id=eq.${chatId}` // Wrong - chatId is not artifact_id
```

**Fixed:**
```typescript
// First, fetch the artifact ID during initial load
const [artifactId, setArtifactId] = useState<string | null>(null)

// In fetchSummary():
if (artifact) {
    setArtifactId(artifact.id) // Store artifact ID
    // ... rest of fetch logic
}

// In subscription:
if (!artifactId) return // Wait until we have the artifact ID

const channel = supabase
    .channel(`summary:${chatId}`)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'artifact_versions',
        filter: `artifact_id=eq.${artifactId}` // Use actual artifact ID
    }, (payload) => {
        // ... handle update
    })
    .subscribe()
```

---

## Phase 4: Agent System Prompt Updates

### 4.1 Update Conversational Agent Prompt
**File:** `lib/agents/config.ts`
**Location:** Modify conversational agent systemPrompt (line 113-151)

**Add to beginning of prompt:**
```typescript
systemPrompt: `You're OHM - the hardware mentor who's helped 10,000 makers turn "I have an idea" into "I built the thing!"

**IMPORTANT: Before responding, you can read_file(artifact_type: "conversation_summary") to see what's been discussed and decided. Use this to avoid repeating questions and to build on previous context.**

**Your superpower:** Give before you ask...
```

### 4.2 Update BOM Generator Prompt
**File:** `lib/agents/config.ts`
**Location:** Modify bomGenerator systemPrompt (line 161-189)

**Add after initial description:**
```typescript
systemPrompt: `You're the components specialist whose BOMs have never caused a voltage mismatch fire.

**Context Awareness:** Before generating a BOM:
1. Call read_file(artifact_type: "conversation_summary") to understand project requirements
2. Call read_file(artifact_type: "context") to see detailed project constraints
3. Call read_file(artifact_type: "mvp") to understand core features

Your mantra: "Wrong parts waste more time than careful selection."
```

### 4.3 Update Code Generator Prompt
**File:** `lib/agents/config.ts`
**Location:** Modify codeGenerator systemPrompt (line 199-252)

**Add after initial description:**
```typescript
systemPrompt: `You're the embedded dev who writes code that runs for months without crashing.

**Context Awareness:** Before writing code:
1. Call read_file(artifact_type: "bom") to see exact components and pin assignments
2. Call read_file(artifact_type: "wiring") to understand pin connections
3. Call read_file(artifact_type: "conversation_summary") for project context

**Iron laws:**
• NEVER use delay() in loop()...
```

### 4.4 Update Wiring Diagram Prompt
**File:** `lib/agents/config.ts`
**Location:** Modify wiringDiagram systemPrompt (line 262-283)

**Add after initial description:**
```typescript
systemPrompt: `You're the wiring teacher whose students wire circuits perfectly on their first try.

**Context Awareness:** Before creating wiring:
1. Call read_file(artifact_type: "bom") to get exact component list and specifications
2. Call read_file(artifact_type: "conversation_summary") for voltage/power constraints

Your mission: Make it impossible to mess up...
```

### 4.5 Update Budget Optimizer Prompt
**File:** `lib/agents/config.ts`
**Location:** Modify budgetOptimizer systemPrompt (line 369-398)

**Add after initial description:**
```typescript
systemPrompt: `You're the budget-conscious friend who's learned which cheap components are gems.

**Context Awareness:** Before optimizing:
1. Call read_file(artifact_type: "bom") to get current component list and prices
2. Call read_file(artifact_type: "conversation_summary") to understand user's budget constraints

Your wisdom: "Cheap sensors waste more money than expensive ones when they arrive broken."
```

---

## Phase 5: Tool Deprecation Strategy

### 5.1 Mark Old Tools as Deprecated
**File:** `lib/agents/tools.ts`
**Location:** Update descriptions of specialized tools (lines 70-375)

**Example for update_context:**
```typescript
update_context: {
    name: "update_context",
    description: "[DEPRECATED: Use write_file(artifact_type: 'context') instead] Update the project context drawer with overview, background, success criteria, and constraints.",
    parameters: {
        // ... unchanged
    }
},
```

**Apply same pattern to:**
- `update_mvp`
- `update_prd`
- `update_bom`
- `update_wiring`
- `update_budget`

### 5.2 Monitoring Script for Old Tool Usage
**File:** Create new file `scripts/monitor-deprecated-tools.ts`

```typescript
import { supabase } from '@/lib/supabase/client'

/**
 * Monitor usage of deprecated tools to determine when safe to remove
 * Run: node scripts/monitor-deprecated-tools.ts
 */

const DEPRECATED_TOOLS = [
    'update_context',
    'update_mvp',
    'update_prd',
    'update_bom',
    'update_wiring',
    'update_budget'
];

async function checkToolUsage() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: messages } = await supabase
        .from('messages')
        .select('metadata')
        .gte('created_at', oneWeekAgo)
        .not('metadata', 'is', null);

    const usageCounts: Record<string, number> = {};
    DEPRECATED_TOOLS.forEach(tool => usageCounts[tool] = 0);

    messages?.forEach(msg => {
        const toolCalls = msg.metadata?.toolCalls || [];
        toolCalls.forEach((call: any) => {
            if (DEPRECATED_TOOLS.includes(call.name)) {
                usageCounts[call.name]++;
            }
        });
    });

    console.log('📊 Deprecated Tool Usage (Last 7 Days):');
    Object.entries(usageCounts).forEach(([tool, count]) => {
        console.log(`  ${tool}: ${count} uses ${count === 0 ? '✅ Safe to remove' : '⚠️  Still in use'}`);
    });

    const totalUsage = Object.values(usageCounts).reduce((a, b) => a + b, 0);
    console.log(`\n📈 Total deprecated tool calls: ${totalUsage}`);
}

checkToolUsage();
```

---

## Phase 6: Testing & Validation

### 6.1 Unit Tests for Universal Tools
**File:** Create `lib/agents/__tests__/universal-tools.test.ts`

```typescript
import { ToolExecutor } from '../tool-executor';
import { ArtifactService } from '@/lib/db/artifacts';

describe('Universal File I/O Tools', () => {
    let executor: ToolExecutor;
    const mockChatId = 'test-chat-id';

    beforeEach(() => {
        executor = new ToolExecutor(mockChatId);
    });

    test('read_file returns artifact content', async () => {
        // Mock ArtifactService
        jest.spyOn(ArtifactService, 'getLatestArtifact').mockResolvedValue({
            artifact: { id: 'art-1', current_version: 1, title: 'Test' },
            version: { content: 'Test content' }
        });

        const result = await executor.executeToolCall({
            name: 'read_file',
            arguments: { artifact_type: 'context' }
        });

        expect(result.exists).toBe(true);
        expect(result.content).toBe('Test content');
    });

    test('write_file creates new version', async () => {
        const result = await executor.executeToolCall({
            name: 'write_file',
            arguments: {
                artifact_type: 'context',
                content: 'Updated content'
            }
        });

        expect(result.success).toBe(true);
    });

    test('read_file handles missing artifact gracefully', async () => {
        jest.spyOn(ArtifactService, 'getLatestArtifact').mockResolvedValue(null);

        const result = await executor.executeToolCall({
            name: 'read_file',
            arguments: { artifact_type: 'context' }
        });

        expect(result.exists).toBe(false);
        expect(result.message).toContain('No context artifact found');
    });
});
```

### 6.2 Integration Test: Agent Handoff
**File:** Create `lib/agents/__tests__/agent-handoff.test.ts`

```typescript
import { AssemblyLineOrchestrator } from '../orchestrator';

describe('Agent Handoff with Context', () => {
    test('BOM agent reads context from conversational agent', async () => {
        const orchestrator = new AssemblyLineOrchestrator('test-chat');

        // 1. Conversational agent creates context
        await orchestrator.chat('I want to build a temp monitor with ESP32');

        // 2. BOM agent should have access to that context
        const result = await orchestrator.chat('Generate the BOM');

        // Verify BOM references ESP32 without asking again
        expect(result.response).toContain('ESP32');
    });
});
```

### 6.3 Manual Test Checklist

**Test Scenario 1: Context Reading**
```
1. Start new chat: "Build IoT plant monitor"
2. Conversational creates context/mvp/prd
3. Type: "What components do I need?"
4. Verify BOM agent mentions components without asking for details again
5. Check logs for "💡 [Orchestrator] Injected conversation context"
```

**Test Scenario 2: File Writing**
```
1. Continue from Scenario 1
2. Type: "Generate the code"
3. Code agent should reference BOM components automatically
4. Check that code includes correct pin numbers from wiring
5. Verify no "What sensor are you using?" questions
```

**Test Scenario 3: Summary Drawer**
```
1. Send 6+ messages in a conversation
2. Click "Summary" in tools sidebar
3. Verify summary appears with project snapshot
4. Check components/code files lists are populated
5. Verify timestamp shows recent update
```

---

## 🚨 Critical Implementation Notes

### Gotcha #1: Infinite Loop Prevention
**Issue:** Summarizer writes artifact → triggers drawer → triggers summarization
**Solution:** In `lib/agents/orchestrator.ts` (line 608-613), summarizer only triggers on user/assistant messages, not artifact updates.

**Verify:** Check that `summarizer.updateSummary()` is only called AFTER chat response, not after tool calls.

### Gotcha #2: UUID Validation
**Issue:** `created_by` field requires valid UUID, but agents use 'system' string
**Solution:** Already handled in `lib/agents/summarizer.ts` (lines 44-97, 265-270) with `isValidUUID()` check

**Verify:** Check that system-generated artifacts don't fail with UUID constraint errors.

### Gotcha #3: Context Injection Token Bloat
**Issue:** Injecting full summary on every message wastes tokens
**Solution:** Context is only injected when summary exists (not on first message), and summary is kept under 400 words by ConversationSummarizer.

**Verify:** Log token usage before/after implementation to ensure < 10% increase.

### Gotcha #4: Drawer Opening Race Condition
**Issue:** Tool calls in parallel can cause multiple drawers to flash
**Solution:** `open_*_drawer` tools are synchronous no-ops that just return metadata. UI handles opening based on tool call notifications.

**Verify:** Check that only ONE drawer opens per agent response, even with multiple tool calls.

---

## 📊 Success Metrics

### Functional Validation
- [ ] Agent can call `read_file(conversation_summary)` and receive formatted context
- [ ] Agent can call `read_file(bom)` and access component data
- [ ] BOM agent mentions components without re-asking for details
- [ ] Code agent uses exact pin numbers from BOM without hallucinating
- [ ] Summary drawer displays after 5+ messages
- [ ] Real-time updates work in summary drawer

### Performance Validation
- [ ] Context injection adds < 500ms latency per request
- [ ] Token usage increases < 15% on average
- [ ] Summarizer runs in < 3 seconds (non-blocking)
- [ ] Read operations complete in < 200ms

### Quality Validation
- [ ] No repeated questions across agent handoffs
- [ ] Agents reference prior decisions correctly
- [ ] Summary captures key components/decisions
- [ ] Code matches BOM without manual correction

---

## 🔄 Migration Timeline

### Week 1: Foundation
- ✅ Day 1-2: Implement `read_file` and `write_file` tool definitions
- ✅ Day 3-4: Implement tool executors in `tool-executor.ts`
- ✅ Day 5: Test universal tools in isolation

### Week 2: Context Injection
- ✅ Day 6-7: Create `AgentContextBuilder` service
- ✅ Day 8-9: Integrate context injection into orchestrator
- ✅ Day 10: Test agent handoffs with context

### Week 3: UI Integration
- ✅ Day 11-12: Connect summary drawer to sidebar
- ✅ Day 13: Fix real-time subscription
- ✅ Day 14: End-to-end testing

### Week 4: Agent Updates & Cleanup
- ✅ Day 15-16: Update all agent system prompts
- ✅ Day 17-18: Mark old tools as deprecated
- ✅ Day 19-21: Monitor usage, prepare removal

---

## 📁 Files Modified Summary

### New Files Created
1. `lib/agents/context-builder.ts` - Dynamic context injection service
2. `scripts/monitor-deprecated-tools.ts` - Tool deprecation monitoring
3. `lib/agents/__tests__/universal-tools.test.ts` - Unit tests
4. `lib/agents/__tests__/agent-handoff.test.ts` - Integration tests

### Files Modified
1. `lib/agents/tools.ts`
   - Add `read_file` and `write_file` tool definitions
   - Update `getToolsForAgent()` to include new tools
   - Mark old tools as deprecated

2. `lib/agents/tool-executor.ts`
   - Add `readFile()` method
   - Add `writeFile()` method
   - Add switch cases for new tools

3. `lib/agents/orchestrator.ts`
   - Import `AgentContextBuilder`
   - Inject dynamic context in `runAgent()`
   - Pass chatId through options

4. `app/api/agents/chat/route.ts`
   - Pass chatId to orchestrator for context injection

5. `lib/agents/config.ts`
   - Update system prompts for all agents (conversational, bomGenerator, codeGenerator, wiringDiagram, budgetOptimizer)
   - Add context awareness instructions

6. `components/tools/ToolsSidebar.tsx`
   - Add 'summary' to tools array
   - Update ToolType definition

7. `components/tools/ConversationSummaryDrawer.tsx`
   - Fix real-time subscription filter to use artifact_id
   - Add artifactId state management

8. Main chat UI component (BuildInterface.tsx or AIAssistantUI.jsx)
   - Add summary drawer state
   - Wire up drawer to tool selection

---

## 🎯 Post-Implementation Validation

### Week 5: Monitoring Phase
Run these queries to validate system is working:

```sql
-- Check summarizer activity
SELECT 
    chat_id,
    COUNT(*) as summary_updates,
    MAX(created_at) as last_update
FROM artifact_versions av
JOIN artifacts a ON av.artifact_id = a.id
WHERE a.type = 'conversation_summary'
GROUP BY chat_id
ORDER BY last_update DESC
LIMIT 10;

-- Check tool usage patterns
SELECT 
    metadata->>'toolCalls' as tools,
    COUNT(*) as usage_count
FROM messages
WHERE metadata IS NOT NULL
    AND created_at > NOW() - INTERVAL '7 days'
GROUP BY metadata->>'toolCalls'
ORDER BY usage_count DESC;

-- Verify deprecated tool decline
SELECT 
    (metadata->>'toolCalls')::jsonb->0->>'name' as tool_name,
    DATE(created_at) as date,
    COUNT(*) as uses
FROM messages
WHERE metadata->>'toolCalls' LIKE '%update_context%'
    OR metadata->>'toolCalls' LIKE '%update_bom%'
GROUP BY tool_name, date
ORDER BY date DESC;
```

### User Feedback Collection
Add telemetry to track:
- Time spent per conversation (should decrease with better context)
- Number of clarifying questions per session (should decrease)
- Tool call frequency (read_file should be common)
- User satisfaction surveys

---

## 🔧 Troubleshooting Guide

### Issue: Agents not reading conversation summary
**Diagnosis:** Check logs for "💡 [Orchestrator] Injected conversation context"
**Fix:** Verify chatId is being passed through orchestrator.chat() options

### Issue: Summary drawer shows "No summary available"
**Diagnosis:** Check if summarizer is running (needs 5+ messages)
**Fix:** Manually trigger: `ConversationSummarizer.updateSummary('system')`

### Issue: Real-time updates not working in drawer
**Diagnosis:** Check subscription filter uses artifact_id not chat_id
**Fix:** Ensure artifactId state is set before subscription

### Issue: Context injection causing token limit errors
**Diagnosis:** Check summary length and frequency
**Fix:** Reduce SUMMARY_TRIGGER_THRESHOLD from 5 to 7 messages

### Issue: Agents still calling deprecated tools
**Diagnosis:** System prompts may need stronger deprecation language
**Fix:** Update agent configs to explicitly prefer read_file/write_file

---

## 📚 Developer Quick Reference

### Common Patterns

**Reading an artifact:**
```typescript
const result = await executor.executeToolCall({
    name: 'read_file',
    arguments: { artifact_type: 'bom' }
});

if (result.exists) {
    const bomData = result.content;
    // Use bomData.components, bomData.totalCost, etc.
}
```

**Writing an artifact:**
```typescript
await executor.executeToolCall({
    name: 'write_file',
    arguments: {
        artifact_type: 'context',
        content: markdownString,
        merge_strategy: 'replace'
    }
});
```

**Getting conversation summary:**
```typescript
const summarizer = new ConversationSummarizer(chatId);
const contextText = await summarizer.getSummaryForContext();
// Returns formatted markdown suitable for agent prompts
```

**Building dynamic context:**
```typescript
const contextBuilder = new AgentContextBuilder(chatId);
const enrichedPrompt = await contextBuilder.buildDynamicContext();
// Append to agent system prompt
```

---

## ✅ Final Checklist

Before marking this implementation complete, verify:

- [ ] All 8 files modified as documented
- [ ] 4 new files created
- [ ] Unit tests passing (95%+ coverage on new code)
- [ ] Integration tests passing
- [ ] Manual test scenarios completed
- [ ] No increase in error rates (check Sentry/logs)
- [ ] Token usage increase < 15%
- [ ] Performance metrics within acceptable range
- [ ] Deprecated tools marked in code
- [ ] Monitoring script deployed
- [ ] Documentation updated (this file + inline comments)
- [ ] Team training completed
- [ ] Rollout plan approved

---

**Implementation Owner:** [Developer Name]
**Timeline:** 4 weeks (can be parallelized)
**Status:** Ready for implementation
**Last Updated:** 2026-01-17
