'use client'

import ResizableDrawer from './ResizableDrawer'
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
        <ResizableDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            defaultSize={40}
            minSize={25}
            maxSize={70}
        >
            <div className="p-6 h-full overflow-y-auto">
                {children}
            </div>
        </ResizableDrawer>
    )
}
