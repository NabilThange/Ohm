"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import MeshGradient from "./mesh-gradient"
import FaultyTerminal from "../mage-ui/faulty-terminal"

interface ProjectCreatorProps {
    onSubmit: (prompt: string, style: string, userLevel: string, projectComplexity: string) => void
}

export function ProjectCreator({ onSubmit }: ProjectCreatorProps) {
    const [prompt, setPrompt] = useState("")
    const [selectedStyle, setSelectedStyle] = useState("")
    const [userLevel, setUserLevel] = useState("")
    const [projectComplexity, setProjectComplexity] = useState("")
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const [showHowItWorks, setShowHowItWorks] = useState(false)

    useEffect(() => {
        if (promptRef.current) {
            promptRef.current.focus()
        }
    }, [])

    const styles = [
        { value: "robotics", label: "Robotics", description: "Motors, sensors, control loops" },
        { value: "iot", label: "IoT", description: "Connected devices, cloud integration" },
        { value: "wearable", label: "Wearable", description: "Low power, compact, sensors" },
        { value: "automation", label: "Automation", description: "Home automation, industrial" },
        { value: "embedded", label: "Embedded", description: "Microcontrollers, RTOS, bare metal" },
    ]

    const userLevels = [
        { value: "beginner", label: "Beginner", description: "New to hardware/electronics" },
        { value: "intermediate", label: "Intermediate", description: "Some experience with projects" },
        { value: "advanced", label: "Advanced", description: "Experienced engineer" },
    ]

    const projectComplexities = [
        { value: "simple", label: "Simple", description: "Basic functionality, few components" },
        { value: "moderate", label: "Moderate", description: "Multiple features, standard complexity" },
        { value: "complex", label: "Complex", description: "Advanced features, many components" },
    ]

    const handleSubmit = () => {
        if (prompt.trim() && selectedStyle && userLevel && projectComplexity) {
            onSubmit(prompt, selectedStyle, userLevel, projectComplexity)
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
                            className="text-5xl md:text-[5rem] font-black tracking-tighter text-white leading-[0.85] mb-2"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                            OHM
                        </h1>
                        <h2
                            className="text-xl md:text-[2.2rem] font-light italic tracking-wide text-zinc-300 leading-none -mt-2"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            Hardware Engineer
                        </h2>
                    </div>
                    <p
                        className="text-xs md:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-3 px-4 md:px-0"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                        Autonomous hardware development with AI. From concept to BOM, wiring, and code.
                    </p>
                </div>

                <div className="space-y-5 md:space-y-6 mt-8 md:mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div className="space-y-2 relative">
                        <Textarea
                            ref={promptRef}
                            placeholder="Describe your hardware project (e.g., 'A smart plant watering system with moisture sensors')..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={3}
                            className="relative z-10 resize-none bg-black border border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all duration-300 text-sm md:text-base rounded-sm px-4 md:px-5 py-3"
                            style={{ fontFamily: "system-ui, sans-serif" }}
                        />
                        <p className="text-xs text-zinc-400 text-right font-light tracking-wide">Press ⌘+Enter to start</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs md:text-sm text-zinc-300 font-semibold tracking-wide uppercase">Select Category</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {styles.map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => setSelectedStyle(style.value)}
                                    className={`group px-2 sm:px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-all duration-300 ease-out cursor-pointer border ${selectedStyle === style.value
                                        ? "text-white bg-[#0071e3] border-[#0071e3] shadow-md shadow-[#0071e3]/20"
                                        : "text-zinc-300 bg-black border-zinc-700 hover:text-white hover:border-zinc-500 hover:bg-zinc-900"
                                        }`}
                                >
                                    <div className="font-bold text-xs md:text-sm tracking-wide leading-tight">{style.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs md:text-sm text-zinc-300 font-semibold tracking-wide uppercase">Your Experience Level</p>
                        <div className="grid grid-cols-3 gap-2">
                            {userLevels.map((level) => (
                                <button
                                    key={level.value}
                                    onClick={() => setUserLevel(level.value)}
                                    className={`group px-2 sm:px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-all duration-300 ease-out cursor-pointer border ${userLevel === level.value
                                        ? "text-white bg-[#0071e3] border-[#0071e3] shadow-md shadow-[#0071e3]/20"
                                        : "text-zinc-300 bg-black border-zinc-700 hover:text-white hover:border-zinc-500 hover:bg-zinc-900"
                                        }`}
                                >
                                    <div className="font-bold text-xs md:text-sm tracking-wide leading-tight">{level.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs md:text-sm text-zinc-300 font-semibold tracking-wide uppercase">Project Complexity</p>
                        <div className="grid grid-cols-3 gap-2">
                            {projectComplexities.map((complexity) => (
                                <button
                                    key={complexity.value}
                                    onClick={() => setProjectComplexity(complexity.value)}
                                    className={`group px-2 sm:px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-all duration-300 ease-out cursor-pointer border ${projectComplexity === complexity.value
                                        ? "text-white bg-[#0071e3] border-[#0071e3] shadow-md shadow-[#0071e3]/20"
                                        : "text-zinc-300 bg-black border-zinc-700 hover:text-white hover:border-zinc-500 hover:bg-zinc-900"
                                        }`}
                                >
                                    <div className="font-bold text-xs md:text-sm tracking-wide leading-tight">{complexity.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4 md:pt-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={!prompt.trim() || !selectedStyle || !userLevel || !projectComplexity}
                            className="w-full sm:w-auto bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all duration-200 h-11 md:h-12 text-sm md:text-base rounded-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-10 md:px-12"
                        >
                            Start Building
                        </Button>
                    </div>
                </div>

                <footer className="mt-8 md:mt-12 py-4 text-center text-xs text-zinc-500 space-x-3 md:space-x-4 font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => setShowHowItWorks(true)}
                        className="hover:text-white transition-colors duration-200 tracking-wide"
                    >
                        how it works
                    </button>
                </footer>
            </div>

            <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
                <DialogContent
                    className="max-w-2xl border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-8"
                    showCloseButton={false}
                >
                    <button
                        onClick={() => setShowHowItWorks(false)}
                        className="absolute right-6 top-6 rounded-full p-2 hover:bg-zinc-800 transition-colors"
                    >
                        <X className="h-5 w-5 text-zinc-400" />
                    </button>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">How Ohm Works</h2>
                        <div className="space-y-5 text-zinc-300">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
