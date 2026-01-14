import OpenAI from "openai";
import { AGENTS, type AgentType, getContextualSystemPrompt, getChatAgentType, type UserContext } from "./config";
import { KeyManager, type KeyRotationEvent } from "./key-manager";
import { getToolsForAgent, type ToolCall } from "./tools";

/**
 * BYTEZ Client Singleton with Automatic Failover
 * Configured to use the unified BYTEZ API endpoint with multi-key support
 * 
 * BYTEZ API Documentation:
 * - Supports OpenAI-compatible endpoints at https://api.bytez.com/models/v2/openai/v1
 * - Uses `max_tokens` parameter (NOT max_completion_tokens)
 * - Supports streaming for all models
 * 
 * Agent Model Mapping (Ultimate God Mode):
 * - Orchestrator: anthropic/claude-sonnet-4-5 (fast routing)
 * - Conversational: anthropic/claude-opus-4-5 (best conversational quality)
 * - BOM Generator: anthropic/claude-opus-4-5 (elite reasoning)
 * - Code Generator: anthropic/claude-sonnet-4-5 (SOTA code generation)
 * - Wiring Diagram: anthropic/claude-sonnet-4-5 (spatial reasoning)
 * - Circuit Verifier: google/gemini-2.5-flash (native multimodal vision)
 * - Datasheet Analyzer: anthropic/claude-opus-4-5 (document comprehension)
 * - Budget Optimizer: anthropic/claude-sonnet-4-5 (multi-constraint optimization)
 */
class BytezClient {
    private static instance: OpenAI | null = null;
    private static currentKey: string | null = null;
    private static isRefreshing: boolean = false;

    /**
     * Get singleton instance with thread-safety
     */
    static async getInstance(forceRefresh: boolean = false): Promise<OpenAI> {
        // Wait if another request is refreshing
        let waitCount = 0;
        while (this.isRefreshing && waitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
        }

        const keyManager = KeyManager.getInstance();
        const activeKey = keyManager.getCurrentKey();

        if (!this.instance || this.currentKey !== activeKey || forceRefresh) {
            this.isRefreshing = true;
            try {
                this.currentKey = activeKey;
                this.instance = new OpenAI({
                    apiKey: activeKey,
                    baseURL: "https://api.bytez.com/models/v2/openai/v1",
                    dangerouslyAllowBrowser: true // For client-side usage
                });
                console.log(`🔌 BytezClient connected: ${keyManager.getStatus().split('\n')[0]}`);
            } finally {
                this.isRefreshing = false;
            }
        }

        return this.instance;
    }
}

/**
 * Sequential Agent Runner with Automatic Failover
 * Executes agents one at a time with automatic API key rotation on quota errors
 */
export class AgentRunner {
    /**
     * Classify if an error is quota/billing related
     */
    private isQuotaError(error: any): boolean {
        // Check HTTP status codes
        if (error.status === 429 || error.status === 402) return true;

        // Check error message content
        const message = (error.message || '').toLowerCase();
        const keywords = ['quota', 'insufficient_quota', 'rate_limit', 'credits', 'billing', 'payment'];
        return keywords.some(keyword => message.includes(keyword));
    }

    /**
     * Execute API call with automatic failover
     */
    private async executeWithRetry<T>(
        operation: (client: OpenAI) => Promise<T>,
        operationName: string = "API Call"
    ): Promise<T> {
        const keyManager = KeyManager.getInstance();
        const totalKeys = keyManager.getTotalKeys();
        let attempt = 0;

        while (attempt < totalKeys) {
            try {
                const client = await BytezClient.getInstance();
                const result = await operation(client);

                // Record success
                keyManager.recordSuccess();
                return result;

            } catch (error: any) {
                attempt++;

                if (this.isQuotaError(error)) {
                    console.warn(`⚠️ ${operationName} failed (attempt ${attempt}/${totalKeys}): ${error.message}`);

                    // Mark key as failed permanently
                    keyManager.markCurrentKeyAsFailed();

                    // Try to rotate
                    const rotated = keyManager.rotateKey();
                    if (!rotated) {
                        throw new Error(
                            `❌ All ${totalKeys} API keys exhausted. Please add credits at https://bytez.com/api`
                        );
                    }

                    // Force client refresh and retry
                    await BytezClient.getInstance(true);
                    console.log(`🔄 Retrying ${operationName} with new key...`);
                    continue;
                }

                // Non-quota error - don't retry
                console.error(`❌ ${operationName} failed with non-quota error:`, error.message);
                throw error;
            }
        }

        throw new Error(`❌ ${operationName} failed after ${totalKeys} attempts`);
    }

    /**
     * Run a single agent with the given messages (with tool support)
     */
    async runAgent(
        agentType: AgentType,
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        options?: {
            onStream?: (chunk: string) => void;
            stream?: boolean;
            userContext?: UserContext;
            onToolCall?: (toolCall: ToolCall) => Promise<any>;
        }
    ): Promise<{ response: string; toolCalls: ToolCall[] }> {
        const agent = AGENTS[agentType];

        if (!agent) {
            throw new Error(`Unknown agent type: ${agentType}`);
        }

        // Apply user context to system prompt if available
        const systemPrompt = options?.userContext
            ? getContextualSystemPrompt(agent.systemPrompt, options.userContext)
            : agent.systemPrompt;

        // Prepend system prompt
        const fullMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages
        ];

        console.log(`🤖 Running ${agent.name} (${agent.model})...`);

        // Get tools for this agent
        const tools = getToolsForAgent(agentType);

        return this.executeWithRetry(
            async (client) => {
                if (options?.stream) {
                    return await this.runStreamingAgentWithTools(client, agent, fullMessages, tools, options?.onStream, options?.onToolCall);
                } else {
                    return await this.runNonStreamingAgentWithTools(client, agent, fullMessages, tools, options?.onToolCall);
                }
            },
            agent.name
        );
    }

    /**
     * Internal non-streaming agent execution (with tool support)
     */
    private async runNonStreamingAgentWithTools(
        client: OpenAI,
        agent: typeof AGENTS[AgentType],
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        tools: any[],
        onToolCall?: (toolCall: ToolCall) => Promise<any>
    ): Promise<{ response: string; toolCalls: ToolCall[] }> {
        const requestParams: any = {
            model: agent.model,
            messages,
            temperature: agent.temperature,
            stream: false
        };

        // Add tools if available
        if (tools.length > 0) {
            requestParams.tools = tools.map(t => ({
                type: "function",
                function: t
            }));
        }

        const response = await client.chat.completions.create(requestParams);
        const message = response.choices[0]?.message;

        const toolCalls: ToolCall[] = [];
        let content = message?.content || "";

        // Handle tool calls
        if (message?.tool_calls) {
            for (const tc of message.tool_calls) {
                // Type guard: only process function-type tool calls
                if (tc.type === 'function' && 'function' in tc) {
                    const toolCall: ToolCall = {
                        name: tc.function.name,
                        arguments: JSON.parse(tc.function.arguments)
                    };
                    toolCalls.push(toolCall);

                    // Execute tool call if callback provided
                    if (onToolCall) {
                        console.log(`🔧 Executing tool call: ${toolCall.name}`);
                        await onToolCall(toolCall);
                    }
                }
            }
        }

        console.log(`✅ ${agent.name} completed (${content.length} chars, ${toolCalls.length} tool calls)`);
        return { response: content, toolCalls };
    }

    /**
     * Internal streaming agent execution (with tool support)
     */
    private async runStreamingAgentWithTools(
        client: OpenAI,
        agent: typeof AGENTS[AgentType],
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        tools: any[],
        onStream?: (chunk: string) => void,
        onToolCall?: (toolCall: ToolCall) => Promise<any>
    ): Promise<{ response: string; toolCalls: ToolCall[] }> {
        const requestParams: any = {
            model: agent.model,
            messages,
            temperature: agent.temperature,
            stream: true
        };

        // Add tools if available
        if (tools.length > 0) {
            requestParams.tools = tools.map(t => ({
                type: "function",
                function: t
            }));
        }

        const stream = await client.chat.completions.create(requestParams) as any;

        let fullText = "";
        const toolCalls: ToolCall[] = [];
        const toolCallBuffers: Map<number, { name: string; args: string }> = new Map();

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            // Handle text content
            if (delta?.content) {
                fullText += delta.content;
                onStream?.(delta.content);
            }

            // Handle tool calls (buffering)
            if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                    const index = tc.index;

                    if (!toolCallBuffers.has(index)) {
                        toolCallBuffers.set(index, { name: "", args: "" });
                    }

                    const buffer = toolCallBuffers.get(index)!;

                    if (tc.function?.name) {
                        buffer.name = tc.function.name;
                    }
                    if (tc.function?.arguments) {
                        buffer.args += tc.function.arguments;
                    }
                }
            }
        }

        // Process completed tool calls
        for (const buffer of toolCallBuffers.values()) {
            if (buffer.name && buffer.args) {
                try {
                    const toolCall: ToolCall = {
                        name: buffer.name,
                        arguments: JSON.parse(buffer.args)
                    };
                    toolCalls.push(toolCall);

                    if (onToolCall) {
                        console.log(`🔧 Executing tool call: ${toolCall.name}`);
                        await onToolCall(toolCall);
                    }
                } catch (error) {
                    console.error(`❌ Failed to parse tool call ${buffer.name}:`, error);
                }
            }
        }

        console.log(`✅ ${agent.name} completed (${fullText.length} chars, ${toolCalls.length} tool calls)`);
        return { response: fullText, toolCalls };
    }

    /**
     * Run vision agent with image and failover protection
     */
    async runVisionAgent(
        agentType: AgentType,
        imageUrl: string,
        blueprintJson: string
    ): Promise<string> {
        const agent = AGENTS[agentType];

        if (!agent) {
            throw new Error(`Unknown agent type: ${agentType}`);
        }

        console.log(`👁️ Running ${agent.name} with vision...`);

        return this.executeWithRetry(
            async (client) => {
                // Create request params - BYTEZ only supports max_tokens, not max_completion_tokens
                const requestParams: any = {
                    model: agent.model,
                    messages: [
                        { role: "system", content: agent.systemPrompt },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Here is the Blueprint for reference:\n\n${blueprintJson}\n\nPlease inspect the circuit image and verify it matches the Blueprint.`
                                },
                                {
                                    type: "image_url",
                                    image_url: { url: imageUrl }
                                }
                            ] as any
                        }
                    ],
                    temperature: agent.temperature
                };

                // Only add max_tokens (BYTEZ doesn't support max_completion_tokens)
                // Temporarily commented out - BYTEZ API is rejecting this parameter
                // if (agent.maxTokens) {
                //     requestParams.max_tokens = agent.maxTokens;
                // }

                const response = await client.chat.completions.create(requestParams);

                const content = response.choices[0]?.message?.content || "";
                console.log(`✅ ${agent.name} completed vision analysis`);

                return content;
            },
            `${agent.name} (Vision)`
        );
    }
}

/**
 * Sequential Assembly Line Orchestrator
 * Manages the flow: Conversational → BOM Generator → Code Generator → Circuit Verifier
 */
/**
 * Sequential Assembly Line Orchestrator
 * Manages the flow: Conversational → BOM Generator → Code Generator → Circuit Verifier
 * 
 * DB INTEGRATED VERSION
 */
import { ChatService } from "@/lib/db/chat";
import { ArtifactService } from "@/lib/db/artifacts";
import { ComponentService } from "@/lib/db/components";
import { ToolExecutor } from "./tool-executor";

export class AssemblyLineOrchestrator {
    private runner: AgentRunner;
    private chatId: string | null = null;
    private userContext?: UserContext;

    constructor(chatId?: string, userContext?: UserContext) {
        this.runner = new AgentRunner();
        this.chatId = chatId || null;
        this.userContext = userContext;
    }

    private async getHistory() {
        if (this.chatId) {
            const dbMessages = await ChatService.getMessages(this.chatId);
            return dbMessages.map(m => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content
            }));
        }
        return [];
    }

    /**
     * Generate a concise chat title based on the first message
     */
    async generateTitle(userMessage: string): Promise<string> {
        console.log(`🏷️ Generating title for: "${userMessage.substring(0, 50)}..."`);

        try {
            const result = await this.runner.runAgent(
                'orchestrator',
                [
                    {
                        role: 'system',
                        content: `You are a project title generator for a hardware/IoT development platform.
                        
Generate a concise, descriptive title (3-6 words) that captures the essence of the user's project.

Guidelines:
- Focus on the main purpose or function (e.g., "Smart Home Temperature Monitor")  
- Include the key technology if relevant (e.g., "Arduino LED Matrix Display")
- Make it specific and descriptive, not generic
- Do NOT use quotes in your response
- Return ONLY the title, nothing else

Examples:
- "I want to build something to monitor my plants" → Plant Watering Monitor System
- "help me create a device that tracks my fitness" → Wearable Fitness Tracker
- "build an iot thermostat" → Smart WiFi Thermostat Controller`
                    },
                    { role: 'user', content: userMessage }
                ],
                { stream: false }
            );

            const title = result.response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
            console.log(`🏷️ Generated title: ${title}`);
            return title;
        } catch (error) {
            console.error('❌ Title generation failed:', error);
            return 'New Hardware Project';
        }
    }

    /**
     * Step 1: Chat with dynamic agent selection based on intent
     */
    async chat(
        userMessage: string,
        onStream?: (chunk: string) => void,
        forceAgent?: string,
        onAgentDetermined?: (agent: { type: string; name: string; icon: string; intent: string }) => void,
        onToolCall?: (toolCall: ToolCall) => void
    ): Promise<{
        response: string;
        isReadyToLock: boolean;
        agentType: string;
        agentName: string;
        agentIcon: string;
        intent: string;
        toolCalls?: ToolCall[];
        keyRotationEvent?: KeyRotationEvent | null;
    }> {
        // 1. Get History BEFORE adding new message (to determine if this is first message)
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
                const intentResult = await this.runner.runAgent(
                    'orchestrator',
                    [{ role: 'user', content: userMessage }],
                    { stream: false }
                );

                intent = intentResult.response.trim().toUpperCase();
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

        // 2.5 IMMEDIATELY notify client which agent is handling this request
        const agentConfig = AGENTS[finalAgentType];
        if (onAgentDetermined) {
            console.log(`📢 Sending early agent notification: ${agentConfig.name}`);
            onAgentDetermined({
                type: finalAgentType,
                name: agentConfig.name,
                icon: agentConfig.icon,
                intent: intent
            });
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

        // 5. Create ToolExecutor for this chat
        const toolExecutor = this.chatId ? new ToolExecutor(this.chatId) : null;

        // 6. Run Selected Agent with tool support
        const result = await this.runner.runAgent(
            finalAgentType,
            history,
            {
                stream: true,
                onStream,
                userContext: this.userContext,
                onToolCall: async (toolCall) => {
                    // Notify client about tool call via callback
                    if (onToolCall) {
                        console.log(`📢 Sending tool call notification: ${toolCall.name}`);
                        onToolCall(toolCall);
                    }

                    if (toolExecutor) {
                        await toolExecutor.executeToolCall(toolCall);
                    }
                }
            }
        );

        const response = result.response;
        const toolCalls = result.toolCalls;

        // 7. Persist Assistant Response
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

        // Get any key rotation events that occurred during this request
        const keyRotationEvent = KeyManager.getInstance().getAndClearLastEvent();

        // Return with agent metadata, tool calls, and rotation event
        return {
            response,
            isReadyToLock,
            agentType: finalAgentType,
            agentName: agentConfig.name,
            agentIcon: agentConfig.icon,
            intent,
            toolCalls, // NEW: Include tool calls for frontend
            keyRotationEvent // Include rotation event for client-side toasts
        };
    }

    /**
     * Step 2: Generate Blueprint (BOM Generator)
     */
    async generateBlueprint(): Promise<string> {
        const history = await this.getHistory();

        // Summarize conversation for BOM generator
        const summary = history
            .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n\n");

        const result = await this.runner.runAgent("bomGenerator", [
            { role: "user", content: `Based on this conversation, create the comprehensive BOM and Blueprint:\n\n${summary}` }
        ]);

        const blueprintJson = result.response;

        if (this.chatId) {
            // Persist Artifact
            // Note: In real impl, parse JSON and insert into 'parts' table via ComponentService
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const artifact = await ArtifactService.createArtifact("system", {
                chat_id: this.chatId,
                type: 'bom',
                title: 'Autogenerated BOM'
            });

            await ArtifactService.createVersion({
                artifact_id: artifact.id,
                version_number: 1,
                content_json: JSON.parse(blueprintJson),
                change_summary: "Initial generation"
            });
        }

        return blueprintJson;
    }

    /**
     * Step 3: Generate Code (Code Generator)
     */
    async generateCode(blueprintJson: string, onStream?: (chunk: string) => void): Promise<string> {
        const result = await this.runner.runAgent(
            "codeGenerator",
            [{ role: "user", content: `Here is the authorized Blueprint:\n\n${blueprintJson}\n\nGenerate the firmware code.` }],
            { stream: true, onStream }
        );

        const code = result.response;

        if (this.chatId) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const artifact = await ArtifactService.createArtifact("system", {
                chat_id: this.chatId,
                type: 'code',
                title: 'Firmware'
            });

            await ArtifactService.createVersion({
                artifact_id: artifact.id,
                version_number: 1,
                content: code,
                change_summary: "Initial generation"
            });
        }

        return code;
    }

    /**
     * Step 4: Verify Circuit (Circuit Verifier)
     */
    async verifyCircuit(imageUrl: string, blueprintJson: string): Promise<string> {
        const inspectionResult = await this.runner.runVisionAgent(
            "circuitVerifier",
            imageUrl,
            blueprintJson
        );

        // Note: Persist verification to 'circuit_verifications' table if needed

        return inspectionResult;
    }

    /**
     * Get conversation history
     */
    async getConversationHistory() {
        return this.getHistory();
    }

    /**
     * Reset conversation
     */
    reset() {
        // No-op for db-backed
    }
}
