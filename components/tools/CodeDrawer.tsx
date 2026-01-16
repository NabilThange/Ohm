'use client'

import { Dialog as Drawer, Splitter, Clipboard } from '@ark-ui/react'
import {
    X, ChevronRight, ChevronDown, FileCode, Folder, FolderOpen,
    Search, Copy, Check, Hash
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import type { CodeData } from '@/lib/parsers'

interface CodeDrawerProps {
    isOpen: boolean
    onClose: () => void
    codeData: CodeData | null
}

// Helper to build tree from paths
const buildFileTree = (files: { path: string }[]) => {
    const root: any = { id: 'root', name: 'Project', type: 'folder', children: [] }

    files.forEach(file => {
        const parts = file.path.split('/')
        let currentLevel = root.children

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1
            const existingNode = currentLevel.find((node: any) => node.name === part)

            if (existingNode) {
                if (!isFile) {
                    currentLevel = existingNode.children
                }
            } else {
                const newNode: any = {
                    id: file.path, // Use full path as ID for files
                    name: part,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : []
                }
                currentLevel.push(newNode)
                if (!isFile) {
                    currentLevel = newNode.children
                }
            }
        })
    })

    return root
}

export default function CodeDrawer({ isOpen, onClose, codeData }: CodeDrawerProps) {
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['root', 'src'])
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fileTree = useMemo(() => {
        if (!codeData || !codeData.files.length) return { id: 'root', name: 'Project', type: 'folder', children: [] }
        return buildFileTree(codeData.files)
    }, [codeData])

    // Select first file by default if none selected
    useEffect(() => {
        if (codeData && codeData.files.length > 0 && !selectedFile) {
            setSelectedFile(codeData.files[0].path)
        }
    }, [codeData, selectedFile])

    const activeFileContent = useMemo(() => {
        if (!codeData || !selectedFile) return '// Select a file to view code'
        const file = codeData.files.find(f => f.path === selectedFile)
        return file ? file.content : '// File not found'
    }, [codeData, selectedFile])

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        )
    }

    const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
        const isFolder = node.type === 'folder'
        // Simple search filter
        if (searchQuery && !isFolder && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null
        }

        if (isFolder) {
            // Using name as ID for folders since we build it dynamically
            const toggleId = node.id === 'root' ? 'root' : node.name
            const isExpanded = expandedFolders.includes(toggleId)

            return (
                <div>
                    <button
                        onClick={() => toggleFolder(toggleId)}
                        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-muted/50 rounded-sm transition-colors text-left select-none"
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        {isExpanded ? (
                            <FolderOpen className="w-4 h-4 text-blue-400/80 flex-shrink-0" />
                        ) : (
                            <Folder className="w-4 h-4 text-blue-400/80 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground/80 truncate">{node.name}</span>
                    </button>
                    {(isExpanded || node.id === 'root') && node.children && (
                        <div>
                            {node.children.map((child: any, idx: number) => (
                                <TreeNode key={idx} node={child} level={level + 1} />
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
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm transition-colors text-left group
                            ${selectedFile === node.id ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-muted-foreground hover:text-foreground'}`}
                style={{ paddingLeft: `${level * 12 + 20}px` }}
            >
                <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${selectedFile === node.id ? 'text-blue-400' : ''}`} />
                <span className="text-sm truncate">{node.name}</span>
            </button>
        )
    }

    return (
        <Drawer.Root open={!!isOpen} onOpenChange={(details: { open: boolean }) => !details.open && onClose()}>
            <Drawer.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Drawer.Positioner className="fixed inset-0 z-[70] flex justify-end">
                <Drawer.Content className="h-full w-full max-w-[90vw] md:max-w-5xl bg-card border-l border-border shadow-2xl flex flex-col gap-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-500/10 rounded-md">
                                <Hash className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <Drawer.Title className="text-base font-semibold text-white leading-none mb-1">
                                    Code Generation
                                </Drawer.Title>
                                <Drawer.Description className="text-xs text-zinc-400">
                                    Generated firmware and configuration files.
                                </Drawer.Description>
                            </div>
                        </div>
                        <Drawer.CloseTrigger asChild>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </Drawer.CloseTrigger>
                    </div>

                    {/* Splitter Layout */}
                    <Splitter.Root
                        className="flex-1 flex overflow-hidden"
                        defaultSize={[25, 75]}
                        panels={[{ id: 'tree', minSize: 15 }, { id: 'code', minSize: 30 }]}
                    >
                        {/* Left: Tree View */}
                        <Splitter.Panel id="tree" className="bg-muted flex flex-col min-w-[200px]">
                            {/* Search Bar */}
                            <div className="p-3 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-muted text-foreground text-xs rounded-md pl-8 pr-3 py-1.5 border border-transparent focus:border-primary/50 focus:outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-2">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Explorer</div>
                                {codeData && codeData.files.length > 0 ? (
                                    <TreeNode node={fileTree} />
                                ) : (
                                    <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                        <span className="text-zinc-500 text-xs italic">
                                            Code files will appear here when generated...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Splitter.Panel>

                        {/* Splitter Handle */}
                        <Splitter.ResizeTrigger id="tree:code" className="w-[1px] bg-[#1e1e1e] hover:bg-blue-500 transition-colors relative z-10 flex items-center justify-center group outline-none focus-visible:bg-blue-500">
                            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
                        </Splitter.ResizeTrigger>

                        {/* Right: Code View */}
                        <Splitter.Panel id="code" className="bg-[#1e1e1e] flex flex-col relative min-w-[300px]">
                            {/* Tab Bar */}
                            <div className="flex items-center justify-between bg-[#1e1e1e] border-b border-white/5 h-9 px-4 select-none">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <FileCode className="w-4 h-4 text-blue-400" />
                                    <span className="text-zinc-100">{selectedFile || 'No file selected'}</span>
                                </div>

                                {selectedFile && (
                                    <Clipboard.Root value={activeFileContent} timeout={1500}>
                                        <Clipboard.Control>
                                            <Clipboard.Trigger asChild>
                                                <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs text-zinc-400 hover:text-white transition-colors">
                                                    <Clipboard.Indicator copied={<Check className="w-3.5 h-3.5 text-green-500" />}>
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </Clipboard.Indicator>
                                                    <span>Copy Code</span>
                                                </button>
                                            </Clipboard.Trigger>
                                        </Clipboard.Control>
                                    </Clipboard.Root>
                                )}
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600">
                                <div className="flex min-h-full">
                                    {/* Line Numbers */}
                                    <div className="flex-none w-12 bg-[#1e1e1e] text-zinc-600 text-right pr-3 pt-4 select-none text-xs font-mono border-r border-white/5">
                                        {activeFileContent.split('\n').map((_, i) => (
                                            <div key={i} className="leading-6">{i + 1}</div>
                                        ))}
                                    </div>
                                    {/* Code Text */}
                                    <div className="flex-1 pt-4 pl-4">
                                        <pre className="font-mono text-sm leading-6 text-zinc-300 tab-4">
                                            <code>{activeFileContent}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="h-6 bg-[#0071e3] text-white flex items-center px-3 text-[10px] gap-4 select-none">
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3" />
                                    <span>Ready</span>
                                </div>
                                <div className="flex-1" />
                                <div>UTF-8</div>
                                <div>C++</div>
                            </div>
                        </Splitter.Panel>
                    </Splitter.Root>

                </Drawer.Content>
            </Drawer.Positioner>
        </Drawer.Root>
    )
}
