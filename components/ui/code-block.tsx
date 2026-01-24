"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon } from '@/components/ui/copy';
import { CheckIcon } from '@/components/ui/check';
import { FileCode, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CodeBlockProps {
    files: Array<{
        filename: string;
        language: string;
        content: string;
    }>;
    projectName?: string;
    onViewAll?: () => void;
}

export function CodeBlock({ files, projectName = "Generated Code", onViewAll }: CodeBlockProps) {
    if (!files || files.length === 0) return null;

    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const activeFile = files[activeFileIndex];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(activeFile.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e] my-4 shadow-xl">
            {/* Header */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Layers className="w-4 h-4" />
                        <span className="font-semibold">{projectName}</span>
                    </div>
                    <div className="flex gap-2">
                        {onViewAll && (
                            <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 text-xs text-gray-400 hover:text-white">
                                View All Files
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 text-xs text-gray-400 hover:text-white gap-1.5">
                            {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>

                {/* Tabs (if multiple files) */}
                {files.length > 1 && (
                    <div className="flex overflow-x-auto bg-[#252526] border-b border-[#404040]">
                        {files.map((file, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveFileIndex(index)}
                                className={`px-4 py-2 text-xs font-mono border-r border-[#404040] flex items-center gap-2 transition-colors ${activeFileIndex === index
                                        ? 'bg-[#1e1e1e] text-white'
                                        : 'text-gray-500 hover:bg-[#2d2d2d] hover:text-gray-300'
                                    }`}
                            >
                                <FileCode className="w-3 h-3" />
                                {file.filename}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Code Content */}
            <div className="relative group">
                {/* Filename label for single file mode */}
                {files.length === 1 && (
                    <div className="absolute top-0 left-0 right-0 px-4 py-1 text-xs text-gray-500 bg-[#1e1e1e] border-b border-[#2d2d2d] font-mono">
                        {activeFile.filename} ({activeFile.language})
                    </div>
                )}

                <div className={`max-h-[500px] overflow-y-auto custom-scrollbar ${files.length === 1 ? "pt-6" : ""}`}>
                    <SyntaxHighlighter
                        language={activeFile.language}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            background: 'transparent',
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: "2em", paddingRight: "1em", color: "#6e7681", textAlign: "right" }}
                        wrapLines={true}
                    >
                        {activeFile.content}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
