"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { flushSync } from "react-dom"
import { Send, Loader2, Plus, Mic, X } from "lucide-react"
import ComposerActionsPopover from "./ComposerActionsPopover"
import { cn as cls } from "@/lib/utils"

const COMMANDS = [
    { command: "/update-context", description: "Refresh MVP, PRD, and Context from chat history" },
]

const Composer = forwardRef(function Composer({ onSend, busy }, ref) {
    const [value, setValue] = useState("")
    const [sending, setSending] = useState(false)
    const [lineCount, setLineCount] = useState(1)
    const [showCommands, setShowCommands] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const inputRef = useRef(null)

    const filteredCommands = COMMANDS.filter(c =>
        c.command.toLowerCase().startsWith(value.trim().toLowerCase())
    )

    useEffect(() => {
        const isCommand = value.trim().startsWith("/")
        if (isCommand && filteredCommands.length > 0 && inputRef.current) {
            const coords = getCaretCoordinates(inputRef.current, inputRef.current.selectionEnd)
            setMenuPosition({
                top: coords.top,
                left: coords.left
            })
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
        <div className="border-t border-zinc-200/60 p-4 dark:border-zinc-800 relative">
            {/* Command Menu / Tooltip */}
            {showCommands && (
                <div
                    className="absolute w-72 overflow-hidden rounded-lg border border-red-300 shadow-xl animate-in fade-in zoom-in-95 origin-bottom-left z-50 transition-all duration-75"
                    style={{
                        top: menuPosition.top,
                        left: menuPosition.left + 150, // Add left padding offset
                        transform: 'translateY(-100%) translateY(-12px)', // Move above line
                        backgroundColor: 'tomato'
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={() => setHelpOpen(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Command Guide</h3>
                            <button onClick={() => setHelpOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {COMMANDS.map(cmd => (
                                <div key={cmd.command} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                    <code className="text-sm font-bold text-tomato dark:text-red-400">{cmd.command}</code>
                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{cmd.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setHelpOpen(false)}
                                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-3xl">
                {/* Textarea with direct border styling - no wrapper */}
                <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="How can Ohm help you today? (Type / for commands)"
                            rows={1}
                            className={cls(
                                "w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200",
                                "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                                "focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:focus:border-zinc-600 dark:focus:ring-zinc-800",
                                "shadow-sm hover:shadow-md focus:shadow-md",
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
                    </div>

                    {/* Action buttons beside textarea */}
                    <div className="flex items-center gap-1 shrink-0 mb-1">
                        <ComposerActionsPopover>
                            <button
                                className="inline-flex shrink-0 items-center justify-center rounded-full p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                                title="Add attachment"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </ComposerActionsPopover>

                        <button
                            className="inline-flex items-center justify-center rounded-full p-2.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                            title="Voice input"
                        >
                            <Mic className="h-5 w-5" />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={sending || busy || !hasContent}
                            className={cls(
                                "inline-flex shrink-0 items-center justify-center rounded-full p-2.5 transition-all shadow-sm",
                                hasContent
                                    ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed",
                            )}
                        >
                            {sending || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="mt-2 px-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                    AI can make mistakes. Check important info.
                </div>
            </div>
        </div>
    )
})

export default Composer

// Helper to find caret coordinates
function getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);

    // Copy all font properties and sizing
    ['direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
        'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize']
        .forEach(prop => {
            div.style[prop] = style[prop];
        });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.top = '0';
    div.style.left = '-9999px';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    // Mirror text content
    div.textContent = element.value.substring(0, position);

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);

    const coordinates = {
        top: span.offsetTop + parseInt(style.borderTopWidth),
        left: span.offsetLeft + parseInt(style.borderLeftWidth),
        height: parseInt(style.lineHeight)
    };

    document.body.removeChild(div);

    return coordinates;
}
