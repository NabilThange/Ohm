import { NextRequest, NextResponse } from "next/server";
import { AssemblyLineOrchestrator } from "@/lib/agents/orchestrator";
import { ChatService } from "@/lib/db/chat";

export async function POST(req: NextRequest) {
    try {
        const { message, chatId } = await req.json();

        if (!message || !chatId) {
            return NextResponse.json({ error: "Message and chatId are required" }, { status: 400 });
        }

        const orchestrator = new AssemblyLineOrchestrator(chatId);
        const title = await orchestrator.generateTitle(message);

        // Update chat in DB
        await ChatService.updateChat(chatId, { title });

        return NextResponse.json({ title });
    } catch (error: any) {
        console.error("Title generation API error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate title" }, { status: 500 });
    }
}
