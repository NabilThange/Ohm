"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { HeroPromptInput } from "@/components/shared/HeroPromptInput"
import AIAssistantUI from "@/components/ai_chat/AIAssistantUI"

import FaultyTerminal from "@/components/mage-ui/faulty-terminal"

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
            <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-black">
                {/* Background Terminal Effect */}
                <div className="absolute inset-0 -z-0 pointer-events-none opacity-40">
                    <FaultyTerminal
                        scale={1.2}
                        brightness={0.4}
                        tint="#ffaa00"
                        curvature={0.4}
                        glitchAmount={0.4}
                        flickerAmount={0.3}
                    />
                </div>

                <div className="relative z-10 text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
                        Build Mode
                    </h1>
                    <p className="text-lg text-neutral-400">
                        Describe your project in detail
                    </p>
                </div>

                <div className="relative z-10 w-full max-w-4xl">
                    <HeroPromptInput variant="build" />
                </div>
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
