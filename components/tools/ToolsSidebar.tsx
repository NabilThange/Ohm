'use client'

import {
    DollarSign,
    Cpu,
    ScrollText,
    Cable,
    Code2,
    Settings2,
    FolderTree
} from 'lucide-react'

export type ToolType = 'budget' | 'components' | 'bom' | 'wiring' | 'code' | 'context' | null

interface ToolsSidebarProps {
    activeTool: ToolType
    onSelectTool: (tool: ToolType) => void
}

export default function ToolsSidebar({ activeTool, onSelectTool }: ToolsSidebarProps) {
    const tools = [
        { id: 'context', label: 'Context', icon: FolderTree },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'components', label: 'Parts', icon: Cpu },
        { id: 'bom', label: 'BOM', icon: ScrollText },
        { id: 'wiring', label: 'Wiring', icon: Cable },
        { id: 'code', label: 'Code', icon: Code2 },
    ] as const

    return (
        <div id="tools-sidebar" className="w-14 bg-card/50 backdrop-blur-sm border-l border-border flex flex-col items-center py-4 gap-4 z-30">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    id={`tool-btn-${tool.id}`}
                    onClick={() => onSelectTool(activeTool === tool.id ? null : tool.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative
                    ${activeTool === tool.id
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                    title={tool.label}
                >
                    <tool.icon className="w-5 h-5" />

                    {/* Tooltip-ish label on hover */}
                    <div className="absolute right-full mr-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border">
                        {tool.label}
                    </div>

                    {/* Active Indicator */}
                    {activeTool === tool.id && (
                        <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                    )}
                </button>
            ))}

            <div className="mt-auto border-t border-border pt-4 w-full flex justify-center">
                <button
                    id="settings-btn"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                    title="Settings"
                >
                    <Settings2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
