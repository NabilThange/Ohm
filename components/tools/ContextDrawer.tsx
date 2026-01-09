'use client'

import { Dialog as Drawer } from '@ark-ui/react'
import { X, ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react'
import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ProjectContextData } from '@/lib/parsers'

interface ContextDrawerProps {
    isOpen: boolean
    onClose: () => void
    contextData: ProjectContextData | null
}

export default function ContextDrawer({ isOpen, onClose, contextData }: ContextDrawerProps) {
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['root'])
    const [selectedFile, setSelectedFile] = useState<string | null>('context')

    // Tree structure - rebuilt when data changes
    const treeData = useMemo(() => ({
        id: 'root',
        name: 'Project Files',
        type: 'folder' as const,
        children: [
            {
                id: 'context',
                name: 'Project Context',
                type: 'file' as const,
                content: contextData?.context || ''
            },
            {
                id: 'mvp',
                name: 'MVP',
                type: 'file' as const,
                content: contextData?.mvp || ''
            },
            {
                id: 'prd',
                name: 'PRD',
                type: 'file' as const,
                content: contextData?.prd || ''
            }
        ]
    }), [contextData])

    const activeContent = useMemo(() => {
        if (!selectedFile) return ''
        const file = treeData.children.find(f => f.id === selectedFile)
        return file?.content || ''
    }, [selectedFile, treeData])

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        )
    }

    const TreeNode = ({ node, level = 0 }: { node: typeof treeData | typeof treeData.children[0], level?: number }) => {
        if (node.type === 'folder' && 'children' in node) {
            const isExpanded = expandedFolders.includes(node.id)
            return (
                <div>
                    <button
                        onClick={() => toggleFolder(node.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors text-left"
                        style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{node.name}</span>
                    </button>
                    {isExpanded && node.children && (
                        <div>
                            {node.children.map(child => (
                                <TreeNode key={child.id} node={child} level={level + 1} />
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        // File node
        return (
            <button
                onClick={() => setSelectedFile(node.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors text-left ${selectedFile === node.id ? 'bg-accent' : ''
                    }`}
                style={{ paddingLeft: `${level * 1 + 2.5}rem` }}
            >
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{node.name}</span>
            </button>
        )
    }

    return (
        <Drawer.Root open={!!isOpen} onOpenChange={(details: { open: boolean }) => !details.open && onClose()}>
            <Drawer.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Drawer.Positioner className="fixed inset-0 z-[70] flex justify-end">
                {/* Wider drawer with max-w-2xl instead of max-w-md */}
                <Drawer.Content className="h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col gap-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <div className="space-y-1">
                            <Drawer.Title className="text-lg font-semibold leading-none">
                                Project Context
                            </Drawer.Title>
                            <Drawer.Description className="text-sm text-muted-foreground">
                                Manage your project documentation and specifications
                            </Drawer.Description>
                        </div>
                        <Drawer.CloseTrigger asChild>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </Drawer.CloseTrigger>
                    </div>

                    {/* Split layout: Tree on left, content on right */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Tree View - Left Side */}
                        <div className="w-64 border-r border-border overflow-y-auto p-4 bg-muted/10">
                            <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                                FILES
                            </div>
                            <TreeNode node={treeData} />
                        </div>

                        {/* Content Editor - Right Side */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedFile ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-semibold">
                                            {treeData.children.find(f => f.id === selectedFile)?.name}
                                        </h3>
                                    </div>
                                    <div className="flex-1 min-h-0 relative overflow-y-auto bg-background rounded-lg border border-border">
                                        <div className="p-6 prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground">
                                            {activeContent ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {activeContent}
                                                </ReactMarkdown>
                                            ) : (
                                                <span className="text-muted-foreground italic">
                                                    {contextData ? "File is empty" : "Waiting for generated content. Type 'lock the plan' to generate."}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Read-only mode for now as this is generated data */}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center p-8">
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent">
                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">No file selected</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Select a file from the tree to view contents
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Positioner>
        </Drawer.Root>
    )
}
