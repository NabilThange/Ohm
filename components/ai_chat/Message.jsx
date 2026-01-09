import { cn as cls } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default function Message({ role, children }) {
    const isUser = role === "user"

    // Convert children to string for ReactMarkdown
    const content = typeof children === 'string' ? children : String(children || '')

    return (
        <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    Ω
                </div>
            )}
            <div
                className={cls(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    isUser
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100 shadow-sm"
                        : "bg-transparent text-zinc-900 dark:text-zinc-100",
                )}
            >
                {isUser ? (
                    // User messages: render as plain text
                    content
                ) : (
                    // AI messages: render with Markdown
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                // Customize code blocks
                                code({ node, inline, className, children, ...props }) {
                                    return inline ? (
                                        <code
                                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <code
                                            className="block px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs overflow-x-auto"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    )
                                },
                                // Customize links
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
                                // Customize blockquotes
                                blockquote({ node, children, ...props }) {
                                    return (
                                        <blockquote
                                            className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-3 italic my-2"
                                            {...props}
                                        >
                                            {children}
                                        </blockquote>
                                    )
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    U
                </div>
            )}
        </div>
    )
}
