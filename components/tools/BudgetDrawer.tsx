'use client'

import ToolDrawer from './ToolDrawer'
import { Slider } from '@ark-ui/react'
// Actually user installed radix-ui/react-slider, let's stick to what I asked (Radix for slider)
// But I can use Ark if I want. Let's use Radix for Slider as specifically requested in install command.
import * as RadixSlider from '@radix-ui/react-slider'
import { useState } from 'react'
import { DollarSign, PieChart, TrendingUp } from 'lucide-react'

interface BudgetDrawerProps {
    isOpen: boolean
    onClose: () => void
    budgetData?: {
        originalCost: number
        optimizedCost: number
        savings?: string
        recommendations: Array<{
            component: string
            original: string
            alternative: string
            costSavings: number
            reasoning: string
            tradeoff: string
        }>
        bulkOpportunities?: string[]
        qualityWarnings?: string[]
    } | null
}

export default function BudgetDrawer({ isOpen, onClose, budgetData }: BudgetDrawerProps) {
    const [budget, setBudget] = useState([budgetData?.originalCost || 50])
    const estimatedCost = budgetData?.optimizedCost || 35.50
    const originalCost = budgetData?.originalCost || 50

    return (
        <ToolDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Budget Management"
            description="Set your project budget and track estimated costs."
        >
            <div className="space-y-8">
                {!budgetData && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">No budget optimization generated yet.</p>
                            <p className="text-xs text-muted-foreground">Ask the agent to optimize your BOM costs.</p>
                        </div>
                    </div>
                )}

                {budgetData && (
                    <>
                        {/* Cost Comparison Card */}
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground">Original Cost</span>
                                    <div className="text-2xl font-bold font-mono text-zinc-500">${originalCost.toFixed(2)}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Optimized Cost</span>
                                    <div className="text-2xl font-bold font-mono text-green-600">${estimatedCost.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-border">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm font-medium">Total Savings</span>
                                    <span className="text-lg font-bold text-green-600">{budgetData.savings || `$${(originalCost - estimatedCost).toFixed(2)}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Optimization Recommendations ({budgetData.recommendations?.length || 0})
                            </h3>
                            {budgetData.recommendations?.map((rec, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="font-medium text-sm">{rec.component}</div>
                                        <div className="text-sm font-bold text-green-600">-${rec.costSavings.toFixed(2)}</div>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div><span className="text-muted-foreground">Original:</span> {rec.original}</div>
                                        <div><span className="text-muted-foreground">Alternative:</span> {rec.alternative}</div>
                                        <div className="text-muted-foreground">{rec.reasoning}</div>
                                        <div className="mt-2">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                                rec.tradeoff.toUpperCase().includes('LOW') ? 'bg-green-500/10 text-green-600' :
                                                rec.tradeoff.toUpperCase().includes('MEDIUM') ? 'bg-yellow-500/10 text-yellow-600' :
                                                'bg-red-500/10 text-red-600'
                                            }`}>
                                                Risk: {rec.tradeoff}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bulk Opportunities */}
                        {budgetData.bulkOpportunities && budgetData.bulkOpportunities.length > 0 && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-600 mb-2">📦 Bulk Purchase Opportunities</h4>
                                <ul className="text-xs text-blue-600/80 space-y-1">
                                    {budgetData.bulkOpportunities.map((opp, i) => <li key={i}>• {opp}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Quality Warnings */}
                        {budgetData.qualityWarnings && budgetData.qualityWarnings.length > 0 && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <h4 className="text-sm font-semibold text-yellow-600 mb-2">⚠️ Don't Cheap Out On</h4>
                                <ul className="text-xs text-yellow-600/80 space-y-1">
                                    {budgetData.qualityWarnings.map((warn, i) => <li key={i}>• {warn}</li>)}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ToolDrawer>
    )
}
