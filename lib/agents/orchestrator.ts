import OpenAI from "openai";
import { AGENTS, type AgentType, getContextualSystemPrompt, getChatAgentType, type UserContext } from "./config";
import { KeyManager, type KeyRotationEvent } from "./key-manager";

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
 * - Orchestrator: openai/gpt-4o (fast routing)
 * - Conversational: anthropic/claude-opus-4-5 (best conversational quality)
 * - BOM Generator: openai/o1 (elite reasoning)
 * - Code Generator: anthropic/claude-sonnet-4-5 (SOTA code generation)
 * - Wiring Diagram: openai/gpt-4o (spatial reasoning)
 * - Circuit Verifier: google/gemini-2.5-flash (native multimodal vision)
 * - Datasheet Analyzer: anthropic/claude-opus-4-5 (document comprehension)
 * - Budget Optimizer: openai/o1 (multi-constraint optimization)
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
     * Run a single agent with the given messages
     */
    async runAgent(
        agentType: AgentType,
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        options?: {
            onStream?: (chunk: string) => void;
            stream?: boolean;
            userContext?: UserContext;
        }
    ): Promise<string> {
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

        return this.executeWithRetry(
            async (client) => {
                if (options?.stream) {
                    return await this.runStreamingAgentInternal(client, agent, fullMessages, options.onStream);
                } else {
                    return await this.runNonStreamingAgentInternal(client, agent, fullMessages);
                }
            },
            agent.name
        );
    }

    /**
     * Internal non-streaming agent execution
     */
    private async runNonStreamingAgentInternal(
        client: OpenAI,
        agent: typeof AGENTS[AgentType],
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
    ): Promise<string> {
        // Create request params - BYTEZ only supports max_tokens, not max_completion_tokens
        const requestParams: any = {
            model: agent.model,
            messages,
            temperature: agent.temperature,
            stream: false
        };

        // Only add max_tokens (BYTEZ doesn't support max_completion_tokens)
        // Temporarily commented out - BYTEZ API is rejecting this parameter
        // if (agent.maxTokens) {
        //     requestParams.max_tokens = agent.maxTokens;
        // }

        const response = await client.chat.completions.create(requestParams);

        const content = response.choices[0]?.message?.content || "";
        console.log(`✅ ${agent.name} completed (${content.length} chars)`);

        return content;
    }

    /**
     * Internal streaming agent execution
     */
    private async runStreamingAgentInternal(
        client: OpenAI,
        agent: typeof AGENTS[AgentType],
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        onStream?: (chunk: string) => void
    ): Promise<string> {
        // Create request params - BYTEZ only supports max_tokens, not max_completion_tokens
        const requestParams: any = {
            model: agent.model,
            messages,
            temperature: agent.temperature,
            stream: true
        };

        // Only add max_tokens (BYTEZ doesn't support max_completion_tokens)
        // Temporarily commented out - BYTEZ API is rejecting this parameter
        // if (agent.maxTokens) {
        //     requestParams.max_tokens = agent.maxTokens;
        // }

        const stream = await client.chat.completions.create(requestParams) as any;

        let fullText = "";

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullText += content;
                onStream?.(content);
            }
        }

        console.log(`✅ ${agent.name} completed (${fullText.length} chars)`);
        return fullText;
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
     * Step 1: Chat with dynamic agent selection based on intent
     */
    async chat(
        userMessage: string,
        onStream?: (chunk: string) => void,
        forceAgent?: string,
        onAgentDetermined?: (agent: { type: string; name: string; icon: string; intent: string }) => void
    ): Promise<{
        response: string;
        isReadyToLock: boolean;
        agentType: string;
        agentName: string;
        agentIcon: string;
        intent: string;
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

        // Get any key rotation events that occurred during this request
        const keyRotationEvent = KeyManager.getInstance().getAndClearLastEvent();

        // Return with agent metadata and rotation event
        return {
            response,
            isReadyToLock,
            agentType: finalAgentType,
            agentName: agentConfig.name,
            agentIcon: agentConfig.icon,
            intent,
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

        const blueprintJson = await this.runner.runAgent("bomGenerator", [
            { role: "user", content: `Based on this conversation, create the comprehensive BOM and Blueprint:\n\n${summary}` }
        ]);

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
        const code = await this.runner.runAgent(
            "codeGenerator",
            [{ role: "user", content: `Here is the authorized Blueprint:\n\n${blueprintJson}\n\nGenerate the firmware code.` }],
            { stream: true, onStream }
        );

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
