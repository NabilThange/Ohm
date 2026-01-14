import { cn as cls } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { parseMessageContent, splitMessageIntoSegments } from "@/lib/parsers"
import BOMCard from "./BOMCard"
import { CodeBlock } from "@/components/ui/code-block"

export default function Message({ role, children, metadata }) {
    const isUser = role === "user"

    // Convert children to string for parsing
    const rawContent = typeof children === 'string' ? children : String(children || '')

    // Extract tool calls from metadata
    const toolCalls = metadata?.toolCalls || []

    // Debug logging
    if (!isUser && toolCalls.length > 0) {
        console.log('[Message] 📦 Message has tool calls:', toolCalls.length, toolCalls);
    }

    // For user messages, we just render the text. 
    // For AI messages, we handle parsing inside the render method to support sequential segments.
    const cleanedText = isUser ? rawContent : null;


    return (
        <div className={cls("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    Ω
                </div>
            )}
            <div
                className={cls(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    isUser
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100 shadow-sm"
                        : "bg-transparent text-zinc-900 dark:text-zinc-100",
                )}
            >
                {isUser ? (
                    // User messages: render as plain text
                    cleanedText
                ) : (
                    // AI messages: render with Markdown + BOM Card (Sequential Rendering)
                    <div className="flex flex-col gap-2">
                        {(() => {
                            // 1. First parse artifacts (BOM, Context) and get cleaned text (removes XML containers)
                            // This preserves Markdown code blocks in the text for the next step.
                            const { cleanedText: textWithCode, bomData, isStreamingBOM } = parseMessageContent(rawContent);

                            // 2. Split the text into segments (Text vs Code CodeBlocks)
                            const segments = splitMessageIntoSegments(textWithCode);

                            return (
                                <>
                                    {segments.map((segment, index) => {
                                        if (segment.type === 'text') {
                                            return (
                                                <div key={index} className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            // Customize code blocks - inline only (since block code is handled by segment.type === 'code')
                                                            code({ node, inline, className, children, ...props }) {
                                                                // If it's a block code block that somehow survived slicing (shouldn't happen if regex matches), 
                                                                // or just inline code.
                                                                // Since splitMessageIntoSegments catches ```...```, mostly this will be inline `code`.
                                                                return (
                                                                    <code
                                                                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                                                                        {...props}
                                                                    >
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            a({ node, children, ...props }) {
                                                                return (
                                                                    <a
                                                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        {...props}
                                                                    >
                                                                        {children}
                                                                    </a>
                                                                )
                                                            },
                                                        }}
                                                    >
                                                        {segment.content}
                                                    </ReactMarkdown>
                                                </div>
                                            );
                                        } else if (segment.type === 'code' && segment.data) {
                                            return (
                                                <CodeBlock
                                                    key={index}
                                                    files={[segment.data]}
                                                    projectName="Generated Code"
                                                    onViewAll={() => {
                                                        window.dispatchEvent(new CustomEvent('open-code-drawer', {
                                                            detail: { files: [segment.data], projectName: "Generated Code" }
                                                        }));
                                                    }}
                                                />
                                            );
                                        }
                                        return null;
                                    })}

                                    {isStreamingBOM && (
                                        <div className="my-4 overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="relative h-10 w-10">
                                                    <div className="absolute inset-0 animate-ping rounded-full bg-zinc-900/10 dark:bg-white/10"></div>
                                                    <div className="relative flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                                        <div className="h-4 w-4 rounded-sm border-2 border-current border-t-transparent animate-spin"></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Building Bill of Materials...</p>
                                                    <p className="text-xs text-zinc-500">Analyzing components and estimating costs</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {bomData && <BOMCard data={bomData} />}

                                    {/* BOM Card - shown inline when update_bom tool call is present */}
                                    {toolCalls.length > 0 && (() => {
                                        const bomToolCall = toolCalls.find(tc =>
                                            (tc.function?.name || tc.name) === 'update_bom'
                                        );
                                        if (bomToolCall) {
                                            try {
                                                const bomArgs = bomToolCall.function?.arguments || bomToolCall.arguments;
                                                // Parse if it's a string (OpenAI format returns stringified JSON)
                                                const parsedBomData = typeof bomArgs === 'string' ? JSON.parse(bomArgs) : bomArgs;
                                                if (parsedBomData && parsedBomData.components) {
                                                    console.log('[Message] 📦 Rendering BOMCard from tool call:', parsedBomData.project_name);
                                                    return <BOMCard data={parsedBomData} />;
                                                }
                                            } catch (e) {
                                                console.error('[Message] Failed to parse BOM data from tool call:', e);
                                            }
                                        }
                                        return null;
                                    })()}

                                    {/* Drawer Link Buttons - shown after AI responses with tool calls */}
                                    {toolCalls.length > 0 && (() => {
                                        const renderedDrawers = new Set();
                                        return (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {toolCalls.map((toolCall, idx) => {
                                                    const toolName = toolCall.function?.name || toolCall.name;
                                                    const drawerMap = {
                                                        'update_context': { label: 'Open Context Drawer', drawer: 'context' },
                                                        'update_mvp': { label: 'Open Context Drawer', drawer: 'context' },
                                                        'update_prd': { label: 'Open Context Drawer', drawer: 'context' },
                                                        'update_bom': { label: 'Open BOM Drawer', drawer: 'bom' },
                                                        'add_code_file': { label: 'Open Code Drawer', drawer: 'code' },
                                                        'update_wiring': { label: 'Open Wiring Drawer', drawer: 'wiring' },
                                                        'update_budget': { label: 'Open Budget Drawer', drawer: 'budget' },
                                                    };

                                                    const config = drawerMap[toolName];
                                                    if (!config) return null;

                                                    // Deduplicate by drawer type
                                                    if (renderedDrawers.has(config.drawer)) return null;
                                                    renderedDrawers.add(config.drawer);

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                console.log('[Message] 💆 Button clicked! Opening drawer:', config.drawer, 'for tool:', toolName);
                                                                const event = new CustomEvent('open-drawer', {
                                                                    detail: { drawer: config.drawer }
                                                                });
                                                                console.log('[Message] 📤 Dispatching event:', event);
                                                                window.dispatchEvent(event);
                                                                console.log('[Message] ✅ Event dispatched successfully');
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
                                                        >
                                                            {config.label} →
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
            {isUser && (
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    U
                </div>
            )}
        </div>
    )
}
