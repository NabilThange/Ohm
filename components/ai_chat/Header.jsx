"use client"
import { Asterisk, MoreHorizontal, Menu, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import GhostIconButton from "./GhostIconButton"

export default function Header({
    createNewChat,
    sidebarCollapsed,
    setSidebarOpen,
    currentAgent,  // Receive from parent
    onAgentChange
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [manualOverride, setManualOverride] = useState(null)

    // Our actual multi-agent system agents
    const agents = [
        {
            id: "projectInitializer",
            name: "Project Initializer",
            icon: "🚀",
            description: "Quick-start wizard for new projects",
            model: "Claude Opus 4.5"
        },
        {
            id: "conversational",
            name: "Conversational Agent",
            icon: "💡",
            description: "Chat & Requirements Gathering",
            model: "Claude Opus 4.5"
        },
        {
            id: "orchestrator",
            name: "Orchestrator",
            icon: "🎯",
            description: "Intent Classification & Routing",
            model: "GPT-4o"
        },
        {
            id: "bomGenerator",
            name: "BOM Generator",
            icon: "📦",
            description: "Component Selection & Optimization",
            model: "GPT-o1"
        },
        {
            id: "codeGenerator",
            name: "Code Generator",
            icon: "⚡",
            description: "Firmware Development",
            model: "Claude Sonnet 4.5"
        },
        {
            id: "wiringDiagram",
            name: "Wiring Specialist",
            icon: "🔌",
            description: "Circuit Design & Wiring",
            model: "GPT-4o"
        },
        {
            id: "circuitVerifier",
            name: "Circuit Inspector",
            icon: "👁️",
            description: "Visual Circuit Verification",
            model: "Gemini 2.5 Flash"
        },
        {
            id: "datasheetAnalyzer",
            name: "Datasheet Analyst",
            icon: "📄",
            description: "Technical Documentation Analysis",
            model: "Claude Opus 4.5"
        },
        {
            id: "budgetOptimizer",
            name: "Budget Optimizer",
            icon: "💰",
            description: "Cost Optimization",
            model: "GPT-o1"
        },
    ]

    // Use currentAgent from props, allow manual override
    const activeAgentId = manualOverride || currentAgent?.type || "conversational"
    const selectedAgentData = agents.find((agent) => agent.id === activeAgentId)
    const isAutoSelected = !manualOverride && currentAgent?.type

    const handleAgentChange = (agentId) => {
        setManualOverride(agentId)  // Set manual override
        setIsDropdownOpen(false)
        if (onAgentChange) {
            onAgentChange(agentId)
        }
    }

    // Clear manual override when currentAgent changes (auto-selection)
    useEffect(() => {
        if (currentAgent?.intent !== 'MANUAL') {
            setManualOverride(null);
        }
    }, [currentAgent]);

    return (
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
            {sidebarCollapsed && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
            )}

            <div className="hidden md:flex relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >
                    <span className="text-sm">{selectedAgentData?.icon}</span>
                    {selectedAgentData?.name}
                    {/* Show indicator for auto-selected agents */}
                    {isAutoSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Auto
                        </span>
                    )}
                    {/* Show intent if available */}
                    {currentAgent?.intent && currentAgent.intent !== 'CHAT' && currentAgent.intent !== 'MANUAL' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            {currentAgent.intent}
                        </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 max-h-96 overflow-y-auto">
                        {agents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleAgentChange(agent.id)}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg transition-colors ${activeAgentId === agent.id ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                                    }`}
                            >
                                <span className="text-lg mt-0.5">{agent.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-sm">{agent.name}</span>
                                        {activeAgentId === agent.id && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Active</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{agent.description}</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{agent.model}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-2">
                <GhostIconButton label="More">
                    <MoreHorizontal className="h-4 w-4" />
                </GhostIconButton>
            </div>
        </div>
    )
}
