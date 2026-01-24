'use client'

import { Tour, useTour } from '@ark-ui/react/tour'
import { XIcon } from '@/components/ui/x'
import { ChevronRightIcon } from '@/components/ui/chevron-right'
import { ChevronLeftIcon } from '@/components/ui/chevron-left'
import { useEffect, useState } from 'react'

interface TourGuideProps {
    start: boolean
}

export default function TourGuide({ start }: TourGuideProps) {
    const [hasSeenTour, setHasSeenTour] = useState(true)

    useEffect(() => {
        const seen = localStorage.getItem('ohm_tour_seen')
        setHasSeenTour(!!seen)
    }, [])

    const tour = useTour({
        id: 'ohm-main-tour',
        steps: [
            {
                id: 'welcome',
                type: 'dialog',
                title: 'Welcome to Ohm! 👋',
                description: 'Your intelligent hardware workspace. Let me give you a quick tour of the features.',
                actions: [{ label: 'Start Tour', action: 'next' as any }],
            },
            {
                id: 'tools-section',
                type: 'tooltip',
                title: 'Project Tools',
                description: 'This sidebar gives you access to all your project artifacts. It unlocks automatically as you chat.',
                target: () => document.querySelector('#tools-sidebar'),
                placement: 'right-start',
            },
            {
                id: 'tool-context',
                type: 'tooltip',
                title: 'Context & Requirements',
                description: 'View your Project Context, MVP definitions, and Product Requirements Document (PRD) here.',
                target: () => document.querySelector('#tool-btn-context'),
                placement: 'right',
            },
            {
                id: 'tool-budget',
                type: 'tooltip',
                title: 'Budget Manager',
                description: 'Track costs and manage your project budget constraints.',
                target: () => document.querySelector('#tool-btn-budget'),
                placement: 'right',
            },
            {
                id: 'tool-parts',
                type: 'tooltip',
                title: 'Components',
                description: 'Select and manage the hardware components for your build.',
                target: () => document.querySelector('#tool-btn-components'),
                placement: 'right',
            },
            {
                id: 'tool-bom',
                type: 'tooltip',
                title: 'Bill of Materials',
                description: 'Auto-generated BOM with pricing and suppliers.',
                target: () => document.querySelector('#tool-btn-bom'),
                placement: 'right',
            },
            {
                id: 'tool-wiring',
                type: 'tooltip',
                title: 'Wiring Diagrams',
                description: 'Visual connections and pinout guides for your circuit.',
                target: () => document.querySelector('#tool-btn-wiring'),
                placement: 'right',
            },
            {
                id: 'tool-code',
                type: 'tooltip',
                title: 'Firmware Code',
                description: 'Generated firmware code (Arduino/C++) ready for your device.',
                target: () => document.querySelector('#tool-btn-code'),
                placement: 'right',
            },
            {
                id: 'top-nav',
                type: 'tooltip',
                title: 'Control Center',
                description: 'Switch between Agent Types (Architect, Coder, etc.) and manage project settings here.',
                target: () => document.querySelector('#build-top-nav'),
                placement: 'bottom',
            }
        ],
    })

    // Persist seen state when tour is closed/finished
    const handleExit = () => {
        localStorage.setItem('ohm_tour_seen', 'true')
        setHasSeenTour(true)
    }

    // Start tour when 'start' prop is true and hasn't seen tour
    useEffect(() => {
        if (start && !hasSeenTour && !tour.open) {
            tour.start()
        }
    }, [start, hasSeenTour, tour])

    if (hasSeenTour) return null

    return (
        <Tour.Root tour={tour} onExitComplete={handleExit}>
            <Tour.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
            <Tour.Positioner className="fixed z-[110] drop-shadow-2xl">
                <Tour.Content className="bg-popover text-popover-foreground border border-border rounded-lg p-4 w-[320px] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <Tour.Arrow>
                        <Tour.ArrowTip className="border-t border-l border-border bg-popover w-3 h-3 rotate-45" />
                    </Tour.Arrow>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <Tour.Title className="font-semibold text-lg" />
                            <Tour.CloseTrigger className="text-muted-foreground hover:text-foreground">
                                <XIcon className="w-4 h-4" />
                            </Tour.CloseTrigger>
                        </div>

                        <Tour.Description className="text-sm text-muted-foreground leading-relaxed" />

                        <div className="flex items-center justify-between pt-2">
                            <Tour.ProgressText className="text-xs text-muted-foreground font-mono" />

                            <div className="flex gap-2">
                                <Tour.Control>
                                    <Tour.ActionTrigger action={'prev' as any} className="p-2 hover:bg-accent rounded-md disabled:opacity-50">
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </Tour.ActionTrigger>

                                    <Tour.ActionTrigger action={'next' as any} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1">
                                        <span>Next</span>
                                        <ChevronRightIcon className="w-3 h-3" />
                                    </Tour.ActionTrigger>
                                </Tour.Control>
                            </div>
                        </div>
                    </div>
                </Tour.Content>
            </Tour.Positioner>
        </Tour.Root>
    )
}
