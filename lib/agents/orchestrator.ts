import OpenAI from "openai";
import { AGENTS, type AgentType } from "./config";

/**
 * BYTEZ Client Singleton
 * Configured to use the unified BYTEZ API endpoint
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

    static getInstance(): OpenAI {
        if (!this.instance) {
            const apiKey = process.env.BYTEZ_API_KEY || process.env.NEXT_PUBLIC_BYTEZ_API_KEY;

            if (!apiKey) {
                throw new Error("BYTEZ_API_KEY is not set in environment variables");
            }

            this.instance = new OpenAI({
                apiKey,
                baseURL: "https://api.bytez.com/models/v2/openai/v1",
                dangerouslyAllowBrowser: true // For client-side usage
            });
        }

        return this.instance;
    }
}

/**
 * Sequential Agent Runner
 * Executes agents one at a time (respects 1 concurrent request limit)
 */
export class AgentRunner {
    private client: OpenAI;

    constructor() {
        this.client = BytezClient.getInstance();
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
        }
    ): Promise<string> {
        const agent = AGENTS[agentType];

        if (!agent) {
            throw new Error(`Unknown agent type: ${agentType}`);
        }

        // Prepend system prompt
        const fullMessages = [
            { role: "system" as const, content: agent.systemPrompt },
            ...messages
        ];

        console.log(`🤖 Running ${agent.name} (${agent.model})...`);

        try {
            if (options?.stream) {
                return await this.runStreamingAgent(agent, fullMessages, options.onStream);
            } else {
                return await this.runNonStreamingAgent(agent, fullMessages);
            }
        } catch (error: any) {
            console.error(`❌ Error running ${agent.name}:`, error);
            throw new Error(`Agent ${agent.name} failed: ${error.message}`);
        }
    }

    /**
     * Non-streaming agent execution
     */
    private async runNonStreamingAgent(
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

        const response = await this.client.chat.completions.create(requestParams);

        const content = response.choices[0]?.message?.content || "";
        console.log(`✅ ${agent.name} completed (${content.length} chars)`);

        return content;
    }

    /**
     * Streaming agent execution
     */
    private async runStreamingAgent(
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

        const stream = await this.client.chat.completions.create(requestParams) as any;

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
     * Run vision agent with image
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

        const response = await this.client.chat.completions.create(requestParams);

        const content = response.choices[0]?.message?.content || "";
        console.log(`✅ ${agent.name} completed vision analysis`);

        return content;
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

    constructor(chatId?: string) {
        this.runner = new AgentRunner();
        this.chatId = chatId || null;
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
     * Step 1: Chat with Conversational Agent
     */
    async chat(
        userMessage: string,
        onStream?: (chunk: string) => void
    ): Promise<{ response: string; isReadyToLock: boolean }> {
        // 1. Persist User Message
        if (this.chatId) {
            const seq = await ChatService.getNextSequenceNumber(this.chatId);
            await ChatService.addMessage({
                chat_id: this.chatId,
                role: "user",
                content: userMessage,
                sequence_number: seq
            });
        }

        // 2. Get History (inclusive of new message)
        const history = await this.getHistory();

        // 3. Run Agent
        const response = await this.runner.runAgent(
            "conversational",
            history,
            { stream: true, onStream }
        );

        // 4. Persist Assistant Response
        if (this.chatId) {
            const seq = await ChatService.getNextSequenceNumber(this.chatId);
            await ChatService.addMessage({
                chat_id: this.chatId,
                role: "assistant",
                content: response,
                agent_name: "conversational",
                sequence_number: seq
            });

            // Update last active
            await ChatService.updateSession(this.chatId, {
                current_agent: "conversational",
                last_active_at: new Date().toISOString()
            });
        }

        // Check if visionary is asking to lock the design
        const isReadyToLock = response.toLowerCase().includes("lock this design") ||
            response.toLowerCase().includes("shall we lock");

        return { response, isReadyToLock };
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
