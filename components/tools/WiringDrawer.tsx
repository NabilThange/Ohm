'use client'

import ToolDrawer from './ToolDrawer'
import { ZoomIn, ZoomOut, Maximize, AlertTriangle } from 'lucide-react'

interface WiringDrawerProps {
    isOpen: boolean
    onClose: () => void
    wiringData?: {
        connections: Array<{
            from_component: string
            from_pin: string
            to_component: string
            to_pin: string
            wire_color?: string
            notes?: string
        }>
        instructions: string
        warnings?: string[]
    } | null
}

export default function WiringDrawer({ isOpen, onClose, wiringData }: WiringDrawerProps) {
    return (
        <ToolDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Wiring Diagram"
            description="Interactive connection guide."
        >
            <div className="space-y-6 h-full flex flex-col">
                {!wiringData && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">No wiring diagram generated yet.</p>
                            <p className="text-xs text-muted-foreground">Ask the agent to create wiring instructions.</p>
                        </div>
                    </div>
                )}

                {wiringData && (
                    <>
                        {/* Connection Table */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">🔌 Connections ({wiringData.connections?.length || 0})</h4>
                            <div className="rounded-lg border border-border overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-3 py-2 text-left">From</th>
                                            <th className="px-3 py-2 text-left">To</th>
                                            <th className="px-3 py-2 text-center">Wire</th>
                                            <th className="px-3 py-2 text-left">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {wiringData.connections?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                                                    No connections defined
                                                </td>
                                            </tr>
                                        )}
                                        {wiringData.connections?.map((conn, idx) => (
                                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-3 py-2">
                                                    <div className="font-medium">{conn.from_component}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">{conn.from_pin}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="font-medium">{conn.to_component}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">{conn.to_pin}</div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {conn.wire_color && (
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium" style={{
                                                            backgroundColor: conn.wire_color.toLowerCase() === 'red' ? '#ef444420' : conn.wire_color.toLowerCase() === 'black' ? '#00000020' : '#3b82f620',
                                                            color: conn.wire_color.toLowerCase() === 'red' ? '#ef4444' : conn.wire_color.toLowerCase() === 'black' ? '#000000' : '#3b82f6'
                                                        }}>
                                                            {conn.wire_color}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-[10px] text-muted-foreground">{conn.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Instructions */}
                        {wiringData.instructions && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">🔧 Instructions</h4>
                                <div className="p-4 bg-muted/30 border border-border rounded-lg text-sm whitespace-pre-wrap">
                                    {wiringData.instructions}
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {wiringData.warnings && wiringData.warnings.length > 0 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-red-500">⚠️ Safety Warnings</h4>
                                        <ul className="text-xs text-red-500/80 list-disc list-inside space-y-1">
                                            {wiringData.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ToolDrawer>
    )
}
