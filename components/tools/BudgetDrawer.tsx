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
}

export default function BudgetDrawer({ isOpen, onClose }: BudgetDrawerProps) {
    const [budget, setBudget] = useState([50])
    const [estimatedCost, setEstimatedCost] = useState(35.50)

    return (
        <ToolDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Budget Management"
            description="Set your project budget and track estimated costs."
        >
            <div className="space-y-8">
                {/* Budget Overview Card */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Target Budget</span>
                        <span className="text-2xl font-bold font-mono text-primary">${budget[0]}</span>
                    </div>

                    <RadixSlider.Root
                        className="relative flex items-center select-none touch-none w-full h-5"
                        value={budget}
                        onValueChange={setBudget}
                        max={200}
                        step={1}
                    >
                        <RadixSlider.Track className="bg-muted relative grow rounded-full h-[3px]">
                            <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb
                            className="block w-5 h-5 bg-background border-2 border-primary shadow-[0_2px_10px] shadow-black/20 rounded-[10px] hover:bg-violet-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-transform hover:scale-110"
                            aria-label="Budget"
                        />
                    </RadixSlider.Root>
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>$0</span>
                        <span>$200+</span>
                    </div>
                </div>

                {/* Cost Analysis */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Cost Analysis
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-accent/50 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Estimated</div>
                            <div className={`text-lg font-mono font-semibold ${estimatedCost > budget[0] ? 'text-red-500' : 'text-green-500'}`}>
                                ${estimatedCost.toFixed(2)}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-accent/50 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                            <div className="text-lg font-mono font-semibold">
                                ${(budget[0] - estimatedCost).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-primary" />
                        Breakdown
                    </h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Microcontroller', cost: 12.00, percent: 34 },
                            { name: 'Sensors', cost: 15.50, percent: 43 },
                            { name: 'Power', cost: 8.00, percent: 23 },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center text-sm">
                                <div className="w-24 text-muted-foreground">{item.name}</div>
                                <div className="flex-1 mx-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/60" style={{ width: `${item.percent}%` }} />
                                </div>
                                <div className="w-16 text-right font-mono">${item.cost.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ToolDrawer>
    )
}
