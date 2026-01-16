"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Code2,
    FileCode,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Download,
    Copy,
    Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Get file extension icon and color
 */
const getFileInfo = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const iconMap = {
        'cpp': { icon: '⚡', color: 'text-blue-600 dark:text-blue-400', label: 'C++' },
        'c': { icon: '⚡', color: 'text-blue-600 dark:text-blue-400', label: 'C' },
        'h': { icon: '📋', color: 'text-purple-600 dark:text-purple-400', label: 'Header' },
        'hpp': { icon: '📋', color: 'text-purple-600 dark:text-purple-400', label: 'C++ Header' },
        'ino': { icon: '🔌', color: 'text-teal-600 dark:text-teal-400', label: 'Arduino' },
        'py': { icon: '🐍', color: 'text-yellow-600 dark:text-yellow-400', label: 'Python' },
        'js': { icon: '📜', color: 'text-yellow-500 dark:text-yellow-300', label: 'JavaScript' },
        'ts': { icon: '📘', color: 'text-blue-500 dark:text-blue-300', label: 'TypeScript' },
        'json': { icon: '📦', color: 'text-green-600 dark:text-green-400', label: 'JSON' },
        'md': { icon: '📝', color: 'text-gray-600 dark:text-gray-400', label: 'Markdown' },
        'txt': { icon: '📄', color: 'text-gray-500 dark:text-gray-400', label: 'Text' },
    }
    return iconMap[ext] || { icon: '📄', color: 'text-gray-600 dark:text-gray-400', label: ext.toUpperCase() }
}

/**
 * Download all files as a zip (simplified - downloads as individual files)
 */
const downloadFiles = (files, projectName) => {
    files.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", file.filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    })
}

export default function InlineCodeCard({ files, projectName = "Generated Code" }) {
    const [expandedFiles, setExpandedFiles] = useState(new Set())
    const [copiedFile, setCopiedFile] = useState(null)

    if (!files || files.length === 0) return null

    const toggleFile = (filename) => {
        const newExpanded = new Set(expandedFiles)
        if (newExpanded.has(filename)) {
            newExpanded.delete(filename)
        } else {
            newExpanded.add(filename)
        }
        setExpandedFiles(newExpanded)
    }

    const copyToClipboard = async (content, filename) => {
        try {
            await navigator.clipboard.writeText(content)
            setCopiedFile(filename)
            setTimeout(() => setCopiedFile(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="my-4 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {projectName}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {files.length} {files.length === 1 ? 'file' : 'files'} generated
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadFiles(files, projectName)}
                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:scale-95"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download All
                    </button>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-drawer', {
                                detail: { drawer: 'code' }
                            }))
                        }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View All Files
                    </button>
                </div>
            </div>

            {/* File List */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {files.map((file, idx) => {
                    const fileInfo = getFileInfo(file.filename)
                    const isExpanded = expandedFiles.has(file.filename)
                    const isCopied = copiedFile === file.filename

                    // Get first 15 lines for preview
                    const lines = file.content.split('\n')
                    const previewLines = lines.slice(0, 15)
                    const hasMore = lines.length > 15

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (idx * 0.05) }}
                            className="group"
                        >
                            {/* File Header */}
                            <div
                                className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleFile(file.filename)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                                        )}
                                    </div>
                                    <span className="text-lg flex-shrink-0">{fileInfo.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                            {file.filename}
                                        </div>
                                        <div className="text-[10px] text-zinc-500">
                                            {fileInfo.label} • {lines.length} lines
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(file.content, file.filename)
                                    }}
                                    className="flex-shrink-0 ml-2 p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-zinc-400" />
                                    )}
                                </button>
                            </div>

                            {/* File Content Preview */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-3">
                                            <div className="rounded-lg bg-popover p-4 overflow-x-auto">
                                                <pre className="text-xs font-mono text-popover-foreground">
                                                    <code>{previewLines.join('\n')}</code>
                                                </pre>
                                                {hasMore && (
                                                    <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-zinc-400 text-center">
                                                        {lines.length - 15} more lines... Click "View All Files" to see complete code
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted/30 px-5 py-3">
                <div className="text-[10px] text-muted-foreground">
                    Generated by Ohm Intelligence
                </div>
            </div>
        </motion.div>
    )
}
