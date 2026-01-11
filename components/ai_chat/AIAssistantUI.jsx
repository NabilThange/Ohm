"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Calendar, LayoutGrid, MoreHorizontal, FileText, Cpu, Code } from "lucide-react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import GhostIconButton from "./GhostIconButton"
import ThemeToggle from "./ThemeToggle"
import { INITIAL_TEMPLATES, INITIAL_FOLDERS } from "./mockData"
import { useChatList } from "@/lib/hooks/use-chat-list"
import { ChatService } from "@/lib/db/chat"
import { useChat } from "@/lib/hooks/use-chat"
import { extractBOMFromMessage, extractCodeFromMessage, extractContextFromMessage, extractCodeBlocksFromMessage } from "@/lib/parsers"
import { showAgentChangeToast } from "@/lib/agents/toast-notifications"

// Import Drawers
import BOMDrawer from "@/components/tools/BOMDrawer"
import CodeDrawer from "@/components/tools/CodeDrawer"
import ContextDrawer from "@/components/tools/ContextDrawer"

// Default/System user ID for MVP
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000"

export default function AIAssistantUI({ initialPrompt, initialChatId, userContext }) {
    const router = useRouter()

    // Theme Management - Initialize to null to avoid hydration mismatch
    const [theme, setTheme] = useState(null)

    // Initialize theme on client side only
    useEffect(() => {
        if (theme !== null) return // Already initialized

        const saved = localStorage.getItem("theme")
        if (saved) {
            setTheme(saved)
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark")
        } else {
            setTheme("light")
        }
    }, [])

    useEffect(() => {
        if (!theme) return // Wait for theme to be initialized

        try {
            if (theme === "dark") document.documentElement.classList.add("dark")
            else document.documentElement.classList.remove("dark")
            document.documentElement.setAttribute("data-theme", theme)
            document.documentElement.style.colorScheme = theme
            localStorage.setItem("theme", theme)
        } catch { }
    }, [theme])

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(() => {
        try {
            const raw = localStorage.getItem("sidebar-collapsed")
            return raw ? JSON.parse(raw) : { pinned: true, recent: false, folders: true, templates: true }
        } catch {
            return { pinned: true, recent: false, folders: true, templates: true }
        }
    })
    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
        } catch { }
    }, [collapsed])

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem("sidebar-collapsed-state")
            return saved ? JSON.parse(saved) : false
        } catch {
            return false
        }
    })
    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed-state", JSON.stringify(sidebarCollapsed))
        } catch { }
    }, [sidebarCollapsed])

    // Chat Data
    const { chats: dbChats, isLoading: chatsLoading } = useChatList(DEFAULT_USER_ID)
    const [selectedId, setSelectedId] = useState(initialChatId || null)
    const [templates, setTemplates] = useState(INITIAL_TEMPLATES)
    const [folders, setFolders] = useState(INITIAL_FOLDERS)
    const [query, setQuery] = useState("")
    const searchRef = useRef(null)

    // Current Agent State
    const [currentAgent, setCurrentAgent] = useState({
        type: 'conversational',
        name: 'Conversational Agent',
        icon: '💡',
        intent: 'CHAT'
    });

    // Callback for agent changes - IMMEDIATELY called when orchestrator detects intent
    const handleAgentChange = useCallback((agent) => {
        console.log('[AIAssistantUI] ⚡ Agent change callback triggered:', {
            newAgent: agent?.name,
            newAgentType: agent?.type,
            previousAgent: currentAgent?.name,
            previousAgentType: currentAgent?.type,
            intent: agent?.intent
        });

        // Show toast for ANY agent notification (not just when switching)
        if (agent && agent.name) {
            console.log('[AIAssistantUI] 🔔 Showing agent change toast NOW...');
            showAgentChangeToast(agent.name, agent.icon);
        }

        // Update state - this triggers Header dropdown update
        console.log('[AIAssistantUI] 📝 Updating currentAgent state...');
        setCurrentAgent(agent);
        console.log('[AIAssistantUI] ✅ Agent change complete');
    }, [currentAgent?.type]);

    // Lifted useChat Hook - pass userContext and agent change callback
    const { messages, isLoading: chatLoading, sendMessage, setForceAgent } = useChat(
        selectedId,
        userContext,
        handleAgentChange
    )

    // Artifact Parsing State
    const [bomData, setBomData] = useState(null)
    const [codeData, setCodeData] = useState(null)
    const [contextData, setContextData] = useState(null)
    const [showArtifacts, setShowArtifacts] = useState(false)
    const [activeTool, setActiveTool] = useState(null) // 'context', 'bom', 'code'

    // Event Listener for "View All Files" from Chat
    useEffect(() => {
        const handleOpenCodeDrawer = (event) => {
            const extracted = event.detail;
            if (extracted && extracted.files) {
                // Adapt to CodeData format
                const adaptedData = {
                    files: extracted.files.map(f => ({
                        path: f.filename,
                        content: f.content
                    }))
                };
                console.log('[AIAssistantUI] 📨 Received open-code-drawer event', adaptedData);
                setCodeData(adaptedData);
            }
        };

        window.addEventListener('open-code-drawer', handleOpenCodeDrawer);
        return () => window.removeEventListener('open-code-drawer', handleOpenCodeDrawer);
    }, []);

    // Parser Logic (Ported from BuildInterface)
    useEffect(() => {
        if (messages.length === 0) return;

        // console.log(`[Parser STATUS: ON] 🟢 Scanning ${messages.length} messages for artifacts (AIAssistantUI)...`);

        let foundBom = null;
        // Accumulate code files to handle multiple messages and updates
        const codeFilesMap = new Map();
        let accumulatedContext = { context: null, mvp: null, prd: null };

        messages.forEach((msg, index) => {
            const i = index + 1; // 1-based index for logs
            // Parse both Assistant and User messages so user can paste context/artifacts
            if (msg.role === 'assistant' || msg.role === 'user') {
                let hits = [];
                const bom = extractBOMFromMessage(msg.content);
                if (bom) {
                    foundBom = bom;
                    hits.push("BOM");
                }

                let code = extractCodeFromMessage(msg.content);
                if (!code) {
                    // Try markdown extraction fallback
                    const extracted = extractCodeBlocksFromMessage(msg.content);
                    if (extracted && extracted.files.length > 0) {
                        code = {
                            files: extracted.files.map(f => ({
                                path: f.filename,
                                content: f.content
                            }))
                        };
                    }
                }

                if (code && code.files) {
                    code.files.forEach(f => codeFilesMap.set(f.path, f));
                    hits.push("Code");
                }

                const ctx = extractContextFromMessage(msg.content);
                if (ctx.context || ctx.mvp || ctx.prd) {
                    accumulatedContext = {
                        context: ctx.context || accumulatedContext.context,
                        mvp: ctx.mvp || accumulatedContext.mvp,
                        prd: ctx.prd || accumulatedContext.prd
                    };
                    hits.push(`Context(${[
                        ctx.context ? 'Ctx' : '',
                        ctx.mvp ? 'MVP' : '',
                        ctx.prd ? 'PRD' : ''
                    ].filter(Boolean).join(',')})`);
                }

                /*
                if (hits.length > 0) {
                     console.log(`[Parser] Parsed message ${i}: Found ${hits.join(', ')}`);
                } else {
                    // console.log(`[Parser] Parsed message ${i}: No artifacts`);
                }
                */
            }
        });

        if (foundBom) {
            // console.log("[AIAssistantUI] Restoring BOM");
            setBomData(prev => JSON.stringify(prev) !== JSON.stringify(foundBom) ? foundBom : prev);
        }

        if (codeFilesMap.size > 0) {
            // console.log("[AIAssistantUI] Restoring Code (Accumulated)");
            const accumulatedCode = { files: Array.from(codeFilesMap.values()) };
            setCodeData(prev => JSON.stringify(prev) !== JSON.stringify(accumulatedCode) ? accumulatedCode : prev);
        }

        if (accumulatedContext.context || accumulatedContext.mvp || accumulatedContext.prd) {
            // console.log("[AIAssistantUI] Restoring Context");
            setContextData(prev => {
                const isDifferent = !prev ||
                    prev.context !== accumulatedContext.context ||
                    prev.mvp !== accumulatedContext.mvp ||
                    prev.prd !== accumulatedContext.prd;
                if (isDifferent) {
                    // Auto-open context drawer if not open and we have new context?
                    // Maybe don't force it, just let user know.
                    // For now, if no tool active, maybe default to context?
                    if (!activeTool) setActiveTool('context');
                    if (!showArtifacts) setShowArtifacts(true);
                    return accumulatedContext;
                }
                return prev;
            });
        }

    }, [messages, activeTool, showArtifacts]);

    useEffect(() => {
        if (initialChatId) setSelectedId(initialChatId)
    }, [initialChatId])

    // Derived conversations for Sidebar display
    const conversations = useMemo(() => {
        return dbChats.map(c => ({
            id: c.id,
            title: c.title || "Untitled Project",
            updatedAt: c.last_message_at || c.created_at,
            messageCount: 0,
            preview: "View conversation...",
            pinned: false,
            folder: "Work Projects",
            messages: []
        }))
    }, [dbChats])

    // Initial Prompt Handling
    const hasInitializedPrompt = useRef(false)
    useEffect(() => {
        if (initialPrompt && !hasInitializedPrompt.current && !initialChatId && !selectedId) {
            hasInitializedPrompt.current = true
            // Create chat immediately on mount with initialPrompt
            handleCreateNewChat(initialPrompt)
        }
    }, [initialPrompt, initialChatId, selectedId])

    useEffect(() => {
        if (initialPrompt || initialChatId) return
        if (!selectedId && conversations.length > 0) {
            // Optional auto-select logic
        }
    }, [conversations, selectedId, initialPrompt, initialChatId])

    // Filter Logic
    const filtered = useMemo(() => {
        if (!query.trim()) return conversations
        const q = query.toLowerCase()
        return conversations.filter((c) => c.title.toLowerCase().includes(q))
    }, [conversations, query])

    const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    const recent = filtered
        .filter((c) => !c.pinned)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 10)

    const folderCounts = React.useMemo(() => {
        const map = Object.fromEntries(folders.map((f) => [f.name, 0]))
        for (const c of conversations) if (map[c.folder] != null) map[c.folder] += 1
        return map
    }, [conversations, folders])

    // Actions
    async function handleCreateNewChat(promptText = "New Project") {
        try {
            const newChat = await ChatService.createChat(DEFAULT_USER_ID, promptText.slice(0, 30))

            // Update local state immediately so useChat can start loading
            setSelectedId(newChat.id)
            setSidebarOpen(false)

            // Send initial message before navigating, to avoid aborting the fetch
            if (promptText && promptText !== "New Project") {
                console.log('[AIAssistantUI] Sending initial message via streaming API...');
                const res = await fetch('/api/agents/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: promptText,
                        chatId: newChat.id,
                        userContext: userContext
                    })
                })

                if (!res.ok) {
                    // Try to get error message from non-streaming error response
                    try {
                        const errorData = await res.json();
                        throw new Error(errorData.error || `API error: ${res.status}`);
                    } catch {
                        throw new Error(`API error: ${res.status}`);
                    }
                }

                // Handle SSE stream - consume it but don't need to parse here
                // The useChat hook will update messages via realtime subscription
                const reader = res.body?.getReader();
                if (reader) {
                    console.log('[AIAssistantUI] Consuming stream for initial message...');
                    // Just consume the stream, the realtime subscription will update messages
                    while (true) {
                        const { done } = await reader.read();
                        if (done) break;
                    }
                    console.log('[AIAssistantUI] Stream consumed successfully');
                }
            }

            // After the message has been accepted, update the URL for deep-linking
            router.push(`/build/${newChat.id}`)
        } catch (e) {
            console.error("Failed to create chat or send initial message:", e)
            alert(`Could not create chat: ${e.message}`)
        }
    }

    function handleSelectChat(id) {
        setSelectedId(id)
        router.push(`/build/${id}`)
        setSidebarOpen(false)
    }

    function createFolder() {
        const name = prompt("Folder name")
        if (!name) return
        if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) return alert("Folder already exists.")
        setFolders((prev) => [...prev, { id: Math.random().toString(36).slice(2), name }])
    }

    function togglePin(id) {
        // TODO: Implement DB update
        console.log("Pin toggle not implemented in DB yet")
    }

    const composerRef = useRef(null)
    const selectedChat = conversations.find((c) => c.id === selectedId) || null

    return (
        <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex overflow-hidden">

            {/* Artifact Drawers - Absolute positioned or side-by-side? 
                Let's make them sit on the right side if open, shrinking ChatPane? 
                Or overlay? BuildInterface had them as siblings. 
            */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
                    <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">
                        <span className="inline-flex h-4 w-4 items-center justify-center">Ω</span> Ohm Assistant
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>

                <div className="mx-auto flex h-full w-full">
                    <Sidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        theme={theme}
                        setTheme={setTheme}
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                        sidebarCollapsed={sidebarCollapsed}
                        setSidebarCollapsed={setSidebarCollapsed}
                        conversations={conversations}
                        pinned={pinned}
                        recent={recent}
                        folders={folders}
                        folderCounts={folderCounts}
                        selectedId={selectedId}
                        onSelect={handleSelectChat}
                        togglePin={togglePin}
                        query={query}
                        setQuery={setQuery}
                        searchRef={searchRef}
                        createFolder={createFolder}
                        createNewChat={() => router.push('/build')}
                        templates={templates}
                        setTemplates={setTemplates}
                        onUseTemplate={(t) => composerRef.current?.insertTemplate(t.content)}
                        // Pass Artifact Data
                        contextData={contextData}
                        bomData={bomData}
                        codeData={codeData}
                    />

                    <main className="relative flex min-w-0 flex-1 flex-col h-full">
                        <Header
                            createNewChat={() => router.push('/build')}
                            sidebarCollapsed={sidebarCollapsed}
                            setSidebarOpen={setSidebarOpen}
                            currentAgent={currentAgent}
                            onAgentChange={(agentId) => {
                                // Manual agent selection
                                setForceAgent(agentId);
                                // Find agent data from agents list
                                const agents = [
                                    { id: "projectInitializer", name: "Project Initializer", icon: "🚀" },
                                    { id: "conversational", name: "Conversational Agent", icon: "💡" },
                                    { id: "orchestrator", name: "Orchestrator", icon: "🎯" },
                                    { id: "bomGenerator", name: "BOM Generator", icon: "📦" },
                                    { id: "codeGenerator", name: "Code Generator", icon: "⚡" },
                                    { id: "wiringDiagram", name: "Wiring Specialist", icon: "🔌" },
                                    { id: "circuitVerifier", name: "Circuit Inspector", icon: "👁️" },
                                    { id: "datasheetAnalyzer", name: "Datasheet Analyst", icon: "📄" },
                                    { id: "budgetOptimizer", name: "Budget Optimizer", icon: "💰" }
                                ];
                                const agentData = agents.find(a => a.id === agentId);
                                if (agentData) {
                                    setCurrentAgent({
                                        type: agentId,
                                        name: agentData.name,
                                        icon: agentData.icon,
                                        intent: 'MANUAL'
                                    });
                                    // Show toast for manual selection
                                    showAgentChangeToast(agentData.name, agentData.icon);
                                }
                            }}
                        />

                        {/* Always render ChatPane; internal logic handles empty state */}
                        <ChatPane
                            ref={composerRef}
                            chatId={selectedId}
                            onChatCreated={handleSelectChat}
                            initialPrompt={initialPrompt}
                            chat={selectedChat}
                            // Pass messages explicitly
                            messages={messages}
                            isLoading={chatLoading}
                            sendMessage={sendMessage}
                        />

                    </main>
                </div>
            </div>
        </div>
    )
}
