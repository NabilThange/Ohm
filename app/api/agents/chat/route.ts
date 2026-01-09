import { NextRequest, NextResponse } from "next/server";
import { AssemblyLineOrchestrator } from "@/lib/agents/orchestrator";

// Remove in-memory map since we use DB persistence/loading
// const orchestrators = new Map<string, AssemblyLineOrchestrator>();

export async function POST(req: NextRequest) {
    try {
        const { message, chatId } = await req.json();

        // Allow "default" or missing chatId for checking status, but for real chat we need it.
        // If no chatId, we can't persist history easily.
        // For now, if no chatId, we might fall back to ephemeral mode or error.

        // However, the frontend should always pass chatId now.
        const effectiveChatId = chatId || "default_ephemeral_session";

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Instantiate orchestrator with the ID
        const orchestrator = new AssemblyLineOrchestrator(effectiveChatId);

        // Run conversational agent (Claude Opus 4.5)
        // This will now persist messages to DB if chatId is valid (UUID)
        // "default_ephemeral_session" won't likely match UUID format so DB insert might fail if UUID required.
        // Ideally frontend ensures valid UUID using ChatService.createChat

        const { response, isReadyToLock } = await orchestrator.chat(message);

        // We don't need to return history anymore because Frontend uses Realtime/Hook
        // But we can return isReadyToLock and response for immediate feedback
        return NextResponse.json({
            response,
            isReadyToLock
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
