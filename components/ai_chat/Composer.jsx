"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { flushSync } from "react-dom"
import { Send, Loader2, Plus, Mic, X, Paperclip } from "lucide-react"
import ComposerActionsPopover from "./ComposerActionsPopover"
import { cn as cls } from "@/lib/utils"

const COMMANDS = [
    { command: "/update-context", description: "Refresh MVP, PRD, and Context from chat history" },
    { command: "/update-bom", description: "Regenerate the Bill of Materials from current design" },
    { command: "/recheck-wiring", description: "Validate and update wiring connections" },
    { command: "/update-code", description: "Regenerate code based on latest specifications" },
]

const Composer = forwardRef(function Composer({ onSend, busy }, ref) {
    const [value, setValue] = useState("")
    const [sending, setSending] = useState(false)
    const [lineCount, setLineCount] = useState(1)
    const [showCommands, setShowCommands] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef(null)

    const filteredCommands = COMMANDS.filter(c =>
        c.command.toLowerCase().startsWith(value.trim().toLowerCase())
    )

    useEffect(() => {
        const isCommand = value.trim().startsWith("/")
        if (isCommand && filteredCommands.length > 0) {
            setShowCommands(true)
        } else {
            setShowCommands(false)
        }
        setActiveIndex(0)
    }, [value])

    useEffect(() => {
        if (inputRef.current) {
            const textarea = inputRef.current
            const lineHeight = 24
            const minHeight = 24

            textarea.style.height = "auto"
            const scrollHeight = textarea.scrollHeight
            const calculatedLines = Math.max(1, Math.ceil(scrollHeight / lineHeight))

            setLineCount(calculatedLines)

            if (calculatedLines <= 12) {
                textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
                textarea.style.overflowY = "hidden"
            } else {
                textarea.style.height = `${12 * lineHeight}px`
                textarea.style.overflowY = "auto"
            }
        }
    }, [value])

    useImperativeHandle(
        ref,
        () => ({
            insertTemplate: (templateContent) => {
                setValue((prev) => {
                    const newValue = prev ? `${prev}\n\n${templateContent}` : templateContent
                    setTimeout(() => {
                        inputRef.current?.focus()
                        const length = newValue.length
                        inputRef.current?.setSelectionRange(length, length)
                    }, 0)
                    return newValue
                })
            },
            focus: () => {
                inputRef.current?.focus()
            },
        }),
        [],
    )

    async function handleSend() {
        if (!value.trim() || sending) return

        // Capture the message before clearing
        const messageToSend = value.trim()

        // Clear input IMMEDIATELY for better UX (before async operations)
        flushSync(() => {
            setValue("")
        })

        // Ensure the textarea DOM element is also cleared (fallback)
        if (inputRef.current) {
            inputRef.current.value = ''
        }

        setSending(true)

        try {
            // Call onSend AFTER clearing the input
            await onSend?.(messageToSend)
            inputRef.current?.focus()
        } catch (err) {
            console.error('Composer handleSend error:', err)
            // Don't restore text on error - user can use undo or retype
        } finally {
            setSending(false)
        }
    }

    const selectCommand = (cmd) => {
        setValue(cmd + " ")
        setShowCommands(false)
        inputRef.current?.focus()
    }

    const hasContent = value.trim().length > 0

    return (
        <div className="border-t border-border bg-background">
            <div className="mx-auto max-w-3xl p-4 relative">
                {/* Command Menu / Tooltip */}
                {showCommands && (
                    <div
                        className="absolute w-72 overflow-hidden rounded-lg border shadow-xl animate-in fade-in zoom-in-95 z-50 transition-all duration-75 bg-[#4a4a4a] border-[#6b6b6b]"
                        style={{
                            bottom: '100%',
                            left: '1rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <div className="p-1">
                            {filteredCommands.map((cmd, i) => (
                                <button
                                    key={cmd.command}
                                    onClick={() => selectCommand(cmd.command)}
                                    className={cls(
                                        "flex w-full flex-col px-3 py-2 text-left text-sm rounded-md transition-colors",
                                        i === activeIndex
                                            ? "bg-white/20 text-white"
                                            : "hover:bg-white/10 text-white/90"
                                    )}
                                >
                                    <span className="font-semibold">{cmd.command}</span>
                                    <span className="text-xs text-white/70">{cmd.description}</span>
                                </button>
                            ))}
                            <div className="mt-1 border-t border-white/20 pt-1 text-right px-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setHelpOpen(true)
                                        setShowCommands(false)
                                    }}
                                    className="text-[10px] text-white/80 hover:text-white underline cursor-pointer"
                                >
                                    More about commands
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {helpOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4 animate-in fade-in" onClick={() => setHelpOpen(false)}>
                        <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-card-foreground">Command Guide</h3>
                                <button onClick={() => setHelpOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {COMMANDS.map(cmd => (
                                    <div key={cmd.command} className="rounded-lg bg-muted p-3">
                                        <code className="text-sm font-bold text-foreground">{cmd.command}</code>
                                        <p className="mt-1 text-sm text-muted-foreground">{cmd.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setHelpOpen(false)}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modern Prompt Input Container */}
                <div className="relative rounded-2xl border border-input bg-background shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary focus-within:ring-2 focus-within:ring-ring transition-all">
                    {/* Textarea */}
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="How can Ohm help you today? (Type / for commands)"
                        rows={1}
                        className={cls(
                            "w-full resize-none bg-transparent px-4 py-3 text-sm outline-none",
                            "placeholder:text-muted-foreground",
                            "min-h-[48px] leading-6",
                        )}
                        onKeyDown={(e) => {
                            if (showCommands) {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault()
                                    setActiveIndex(i => (i + 1) % filteredCommands.length)
                                    return
                                }
                                if (e.key === "ArrowUp") {
                                    e.preventDefault()
                                    setActiveIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length)
                                    return
                                }
                                if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault()
                                    selectCommand(filteredCommands[activeIndex].command)
                                    return
                                }
                                if (e.key === "Escape") {
                                    e.preventDefault()
                                    setShowCommands(false)
                                    return
                                }
                            }

                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />

                    {/* Footer with Tools and Submit */}
                    <div className="flex items-center justify-between gap-2 px-3 pb-2">
                        {/* Left side tools */}
                        <div className="flex items-center gap-1">
                            <ComposerActionsPopover>
                                <button
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    title="Add attachment"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </button>
                            </ComposerActionsPopover>

                            <button
                                className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                title="Voice input"
                            >
                                <Mic className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Right side submit */}
                        <button
                            onClick={handleSend}
                            disabled={sending || busy || !hasContent}
                            className={cls(
                                "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                                hasContent
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed",
                            )}
                        >
                            {sending || busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-1.5" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer text */}
                <div className="mt-2 px-1 text-center text-[11px] text-muted-foreground">
                    AI can make mistakes. Check important info.
                </div>
            </div>
        </div>
    )
})

export default Composer
