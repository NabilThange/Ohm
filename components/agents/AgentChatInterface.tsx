"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssemblyLineProgress, type AssemblyLineStep } from "./AssemblyLineProgress";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface AgentChatInterfaceProps {
    initialPrompt?: string;
}

export function AgentChatInterface({ initialPrompt }: AgentChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<AssemblyLineStep>("chat");
    const [completedSteps, setCompletedSteps] = useState<AssemblyLineStep[]>([]);
    const [showLockButton, setShowLockButton] = useState(false);
    const [sessionId] = useState(() => `session-${Date.now()}`);

    // Blueprint and Code storage
    const [blueprint, setBlueprint] = useState<any>(null);
    const [blueprintJson, setBlueprintJson] = useState<string>("");
    const [code, setCode] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [copiedBlueprint, setCopiedBlueprint] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send initial prompt
    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            handleSendMessage(initialPrompt);
        }
    }, [initialPrompt]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || input;
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Step 1: Chat with Visionary
            const response = await fetch("/api/agents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, sessionId })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Check if ready to lock
            if (data.isReadyToLock) {
                setShowLockButton(true);
            }

        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: `❌ Error: ${error.message}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLockDesign = async () => {
        setShowLockButton(false);
        setIsLoading(true);
        setCurrentStep("blueprint");

        try {
            // Step 2: Generate Blueprint
            const blueprintResponse = await fetch("/api/agents/blueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId })
            });

            const blueprintData = await blueprintResponse.json();

            if (blueprintData.error) {
                throw new Error(blueprintData.error);
            }

            setBlueprint(blueprintData.blueprint);
            setBlueprintJson(blueprintData.blueprintJson);
            setCompletedSteps(prev => [...prev, "blueprint"]);

            // Add blueprint message
            const blueprintMessage: Message = {
                role: "assistant",
                content: `✅ **Blueprint Generated!**\n\nProject: ${blueprintData.blueprint.project_name || "Your Project"}\n\nGenerating firmware code...`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, blueprintMessage]);

            // Step 3: Generate Code
            setCurrentStep("code");

            const codeResponse = await fetch("/api/agents/code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blueprintJson: blueprintData.blueprintJson, sessionId })
            });

            const codeData = await codeResponse.json();

            if (codeData.error) {
                throw new Error(codeData.error);
            }

            setCode(codeData.code);
            setCompletedSteps(prev => [...prev, "code"]);

            // Add code message
            const codeMessage: Message = {
                role: "assistant",
                content: `⚡ **Firmware Code Generated!**\n\nYour project is ready to build! Check the Blueprint and Code tabs below.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, codeMessage]);

        } catch (error: any) {
            console.error("Assembly line error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: `❌ Error in assembly line: ${error.message}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: "blueprint" | "code") => {
        navigator.clipboard.writeText(text);
        if (type === "blueprint") {
            setCopiedBlueprint(true);
            setTimeout(() => setCopiedBlueprint(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Assembly Line Progress */}
            <AssemblyLineProgress
                currentStep={currentStep}
                completedSteps={completedSteps}
                isProcessing={isLoading}
                onLockDesign={handleLockDesign}
                showLockButton={showLockButton}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-2xl px-4 py-3 rounded-lg font-mono text-sm ${message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground"
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                        <div className="text-xs opacity-50 mt-1">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-border p-4">
                        <div className="max-w-4xl mx-auto flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Describe your hardware project..."
                                disabled={isLoading || completedSteps.includes("code")}
                                className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !input.trim() || completedSteps.includes("code")}
                                className="px-6"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Blueprint & Code Panels */}
                {(blueprint || code) && (
                    <div className="w-1/2 border-l border-border flex flex-col">
                        <div className="flex border-b border-border">
                            <button className="flex-1 px-4 py-3 font-mono text-sm font-bold bg-muted">
                                Blueprint
                            </button>
                            <button className="flex-1 px-4 py-3 font-mono text-sm font-bold">
                                Code
                            </button>
                        </div>

                        {/* Blueprint View */}
                        {blueprint && (
                            <div className="flex-1 overflow-y-auto p-4 bg-black text-green-400 font-mono text-xs">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold">Golden Blueprint (JSON)</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(blueprintJson, "blueprint")}
                                        className="text-white"
                                    >
                                        {copiedBlueprint ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(blueprint, null, 2)}</pre>
                            </div>
                        )}

                        {/* Code View */}
                        {code && (
                            <div className="flex-1 overflow-y-auto p-4 bg-black text-cyan-400 font-mono text-xs">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold">Firmware Code (.ino)</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(code, "code")}
                                        className="text-white"
                                    >
                                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <pre className="whitespace-pre-wrap">{code}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
