'use client'

import { Dialog as Drawer } from '@ark-ui/react'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ToolDrawerProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
}

export default function ToolDrawer({
    isOpen,
    onClose,
    title,
    description,
    children,
}: ToolDrawerProps) {
    return (
        <Drawer.Root open={!!isOpen} onOpenChange={(details: { open: boolean }) => !details.open && onClose()}>
            <Drawer.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Drawer.Positioner className="fixed inset-0 z-[70] flex justify-end">
                <Drawer.Content className="h-full w-full max-w-md bg-background border-l border-border shadow-2xl p-6 flex flex-col gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="space-y-1">
                            <Drawer.Title className="text-lg font-semibold leading-none">
                                {title}
                            </Drawer.Title>
                            {description && (
                                <Drawer.Description className="text-sm text-muted-foreground">
                                    {description}
                                </Drawer.Description>
                            )}
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
                    <div className="flex-1 overflow-y-auto -mx-6 px-6">
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Positioner>
        </Drawer.Root>
    )
}
