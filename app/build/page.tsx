"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { HeroPromptInput } from "@/components/shared/HeroPromptInput"
import AIAssistantUI from "@/components/ai_chat/AIAssistantUI"

function BuildPageContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const chatId = params?.chatId as string | undefined

    // Get prompt from URL query parameter
    const promptFromUrl = searchParams?.get("prompt")
    const initialPromptFromUrl = searchParams?.get("initialPrompt")

    // Determine mode based on chatId or prompt
    const [mode, setMode] = useState(chatId || promptFromUrl || initialPromptFromUrl ? "chat" : "input")
    const [initialPrompt, setInitialPrompt] = useState(promptFromUrl || initialPromptFromUrl || "")

    useEffect(() => {
        if (chatId) setMode("chat")
    }, [chatId])

    // Handle prompt from URL on initial load
    useEffect(() => {
        if ((promptFromUrl || initialPromptFromUrl) && !chatId) {
            setInitialPrompt(promptFromUrl || initialPromptFromUrl || "")
            setMode("chat")
        }
    }, [promptFromUrl, initialPromptFromUrl, chatId])

    if (mode === "input") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Build Mode</h1>
                    <p className="text-lg text-muted-foreground">
                        Describe your project in detail
                    </p>
                </div>

                <HeroPromptInput variant="build" />
            </div>
        )
    }

    // @ts-ignore
    return <AIAssistantUI initialPrompt={initialPrompt} initialChatId={chatId} />
}

export default function BuildPage() {
    return (
        <Suspense fallback={null}>
            <BuildPageContent />
        </Suspense>
    )
}
