"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import MeshGradient from "./mesh-gradient"
import FaultyTerminal from "../mage-ui/faulty-terminal"
import { AvatarGroup, AvatarGroupTooltip } from "@/components/animate-ui/components/animate/avatar-group"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TypingAnimation } from "@/components/ui/typing-animation"

interface ProjectCreatorProps {
    onSubmit: (prompt: string, style: string, userLevel: string, projectComplexity: string) => void
}

const AVATARS = [
    {
        src: "/avatar/1GWRMnhKM0cOW-4U3AAp.svg",
        fallback: "EN",
        tooltip: "Electronics Engineer",
        className: "w-12 h-12 border-2 border-border bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
        src: "/avatar/6ghHj9wt308Ia6VxSSfX.svg",
        fallback: "RB",
        tooltip: "Robotics Builder",
        className: "w-12 h-12 border-2 border-border bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
        src: "/avatar/K6Yg63HPckCgnwEYxxnY.svg",
        fallback: "IT",
        tooltip: "IoT Developer",
        className: "w-12 h-12 border-2 border-border bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
        src: "/avatar/Qga5M5EYD6Tbt4GDvHzf.svg",
        fallback: "ME",
        tooltip: "Mechatronics Expert",
        className: "w-12 h-12 border-2 border-border bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
        src: "",
        fallback: "+5",
        tooltip: "More Agents",
        className: "w-12 h-12 border-2 border-border bg-card text-foreground"
    }
]

export function ProjectCreator({ onSubmit }: ProjectCreatorProps) {
    const [prompt, setPrompt] = useState("")
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const [showHowItWorks, setShowHowItWorks] = useState(false)

    useEffect(() => {
        if (promptRef.current) {
            promptRef.current.focus()
        }
    }, [])

    const handleSubmit = () => {
        if (prompt.trim()) {
            // Pass empty strings for removed options
            onSubmit(prompt, "", "", "")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <FaultyTerminal />
            </div>

            <div className="w-full max-w-3xl mx-auto p-4 md:p-8 relative z-10">
                <div className="text-center space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-1">
                        <h1
                            className="text-5xl md:text-[5rem] font-black tracking-tighter text-foreground leading-[0.85] mb-2"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                            OHM
                        </h1>
                        <h2
                            className="text-xl md:text-[2.2rem] font-light italic tracking-wide text-muted-foreground leading-none -mt-2"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            Hardware Engineer
                        </h2>
                    </div>
                    <div className="flex justify-center items-center gap-3 pt-4">
                        <AvatarGroup>
                            {AVATARS.map((avatar, index) => (
                                <Avatar key={index} className={avatar.className}>
                                    <AvatarImage src={avatar.src} className="p-2" />
                                    <AvatarFallback>{avatar.fallback}</AvatarFallback>
                                    <AvatarGroupTooltip>{avatar.tooltip}</AvatarGroupTooltip>
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <p
                            className="text-xs md:text-sm text-muted-foreground font-light leading-relaxed"
                            style={{ fontFamily: "system-ui, sans-serif" }}
                        >
                            10 Experts, One Mission: Your Prototype
                        </p>
                    </div>
                </div>

                <div className="space-y-5 md:space-y-6 mt-8 md:mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div
                        onClick={() => promptRef.current?.focus()}
                        className="bg-card p-6 mb-12 w-full cursor-text hover:ring-2 hover:ring-primary/50 transition-all max-w-4xl mx-auto rounded-lg relative"
                    >
                        <div className="block w-full">
                            {!prompt && (
                                <div className="text-muted-foreground text-sm font-mono mb-6 h-6 overflow-hidden relative pointer-events-none">
                                    <TypingAnimation
                                        words={[
                                            "Create a lamp that turns on/off and changes colors when you wave your hand near it",
                                            "Make a camera that automatically identifies and photographs wild animals in your backyard",
                                            "I want to build a smart weather station with ESP32 and e-ink display.",
                                            "Design a drone that drops tiny weather sensors across a forest to monitor air quality",
                                            "Build a door lock that generates truly random passwords using radioactive particles",
                                            "Create a robotic arm controlled by your muscle signals and brain patterns",
                                            "Set up a homemade satellite receiver that tracks and downloads images from space"
                                        ]}
                                        loop
                                        typeSpeed={50}
                                        deleteSpeed={30}
                                        pauseDelay={3000}
                                        showCursor
                                        blinkCursor
                                        cursorStyle="line"
                                        className="text-muted-foreground"
                                    />
                                </div>
                            )}
                            <textarea
                                ref={promptRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder=""
                                className="w-full bg-transparent text-foreground text-sm font-mono mb-6 min-h-6 resize-none outline-none border-none focus:outline-none focus:ring-0"
                                style={{ fontFamily: "system-ui, sans-serif" }}
                                rows={3}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button type="button" className="text-muted-foreground hover:text-foreground transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    </button>
                                    <button type="button" className="text-muted-foreground hover:text-foreground transition">
                                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" className="text-muted-foreground hover:text-foreground transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!prompt.trim()}
                                        className="text-muted-foreground hover:text-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center font-light tracking-wide">Press ⌘+Enter to start</p>
                </div>

                <footer className="mt-8 md:mt-12 py-4 text-center text-xs text-muted-foreground space-x-3 md:space-x-4 font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => setShowHowItWorks(true)}
                        className="hover:text-foreground transition-colors duration-200 tracking-wide"
                    >
                        how it works
                    </button>
                </footer>
            </div>

            <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
                <DialogContent
                    className="max-w-2xl border-border bg-card/95 backdrop-blur-xl rounded-3xl p-8"
                    showCloseButton={false}
                >
                    <button
                        onClick={() => setShowHowItWorks(false)}
                        className="absolute right-6 top-6 rounded-full p-2 hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-foreground">How Ohm Works</h2>
                        <div className="space-y-5 text-muted-foreground">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                        1
                                    </span>
                                    Describe Your Project
                                </h3>
                                <p className="text-sm leading-relaxed pl-9">
                                    Describe your hardware idea in natural language. Ohm supports robotics, IoT, wearables, and more.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                        2
                                    </span>
                                    AI Analysis & Architecture
                                </h3>
                                <p className="text-sm leading-relaxed pl-9">
                                    Ohm analyzes your requirements to select the best components, microcontrollers, and architecture for your needs.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                        3
                                    </span>
                                    BOM & Wiring
                                </h3>
                                <p className="text-sm leading-relaxed pl-9">
                                    Get a complete Bill of Materials (BOM) and interactive wiring diagrams to assemble your project suitable for your expertise level.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                        4
                                    </span>
                                    Code & Firmware
                                </h3>
                                <p className="text-sm leading-relaxed pl-9">
                                    Ohm generates the necessary firmware code (C++, Python, etc.) to bring your hardware to life.
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
