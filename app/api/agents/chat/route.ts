import { NextRequest } from "next/server";
import { AssemblyLineOrchestrator } from "@/lib/agents/orchestrator";

export async function POST(req: NextRequest) {
    try {
        const { message, chatId, userContext, forceAgent } = await req.json();

        const effectiveChatId = chatId || "default_ephemeral_session";

        if (!message) {
            return new Response(JSON.stringify({ error: "Message is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const orchestrator = new AssemblyLineOrchestrator(effectiveChatId, userContext);
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Start the chat with EARLY agent notification callback
                    const result = await orchestrator.chat(
                        message,
                        (chunk) => {
                            // Send text chunks as they arrive
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`));
                        },
                        forceAgent,
                        // NEW: Early agent notification - fires IMMEDIATELY when agent is determined
                        (agent) => {
                            console.log('[API Route] 🚀 Sending early agent notification:', agent.name);
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'agent_selected',
                                agent: agent
                            })}\n\n`));
                        }
                    );

                    // Send final metadata (with any additional info like key rotation)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'metadata',
                        agent: {
                            type: result.agentType,
                            name: result.agentName,
                            icon: result.agentIcon,
                            intent: result.intent
                        },
                        isReadyToLock: result.isReadyToLock,
                        keyRotationEvent: result.keyRotationEvent
                    })}\n\n`));

                    controller.close();
                } catch (error: any) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to process chat" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
