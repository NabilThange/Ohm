'use client'

import ToolDrawer from './ToolDrawer'
import { ZoomIn, ZoomOut, Maximize, AlertTriangle } from 'lucide-react'

interface WiringDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export default function WiringDrawer({ isOpen, onClose }: WiringDrawerProps) {
    return (
        <ToolDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Wiring Diagram"
            description="Interactive connection guide."
        >
            <div className="space-y-6 h-full flex flex-col">
                {/* Canvas Toolbar */}
                <div className="flex gap-2 justify-end">
                    <button className="p-2 rounded hover:bg-accent text-muted-foreground"><ZoomIn className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-accent text-muted-foreground"><ZoomOut className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-accent text-muted-foreground"><Maximize className="w-4 h-4" /></button>
                </div>

                {/* Interactive SVG Placeholder */}
                <div className="flex-1 bg-grid-slate-800/20 dark:bg-grid-slate-200/5 rounded-xl border border-dashed-tech relative overflow-hidden group">
                    {/* Grid Pattern Background in CSS usually, but here mocking visual */}

                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" stroke="currentColor" fill="none">
                            <path d="M10 50 Q 25 25 50 50 T 90 50" strokeWidth="0.5" className="text-primary animate-pulse" />
                            <rect x="40" y="40" width="20" height="20" strokeWidth="1" />
                        </svg>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Schematic Render</p>
                        <div className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full font-mono">
                            ESP32 &lt;-&gt; DHT22
                        </div>
                    </div>

                    {/* Pin Info Overlay (Mock) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur border border-border rounded-lg p-3 text-xs font-mono space-y-1 transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pin 21 (SDA)</span>
                            <span>---&gt;</span>
                            <span className="text-primary">Display SDA</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pin 22 (SCL)</span>
                            <span>---&gt;</span>
                            <span className="text-primary">Display SCL</span>
                        </div>
                    </div>
                </div>

                {/* Netlist */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Netlist Warnings</h4>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs text-red-500 font-semibold">Voltage Mismatch</p>
                            <p className="text-xs text-red-400">
                                ESP32 is 3.3V logic, but Relay Module expects 5V. Level shifter required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ToolDrawer>
    )
}
