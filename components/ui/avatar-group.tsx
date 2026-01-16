"use client"

import * as React from "react"
import { motion, Transition } from "framer-motion"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ')
}

export interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "translate"> {
    children: React.ReactElement[]
    invertOverlap?: boolean
    translate?: string | number
    transition?: Transition
    tooltipTransition?: Transition
    openDelay?: number
    closeDelay?: number
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
    align?: "start" | "center" | "end"
    alignOffset?: number
}

export interface AvatarGroupTooltipProps {
    children: React.ReactNode
    layout?: boolean | "position" | "size" | "preserve-aspect"
}

const AvatarGroupContext = React.createContext<{
    invertOverlap: boolean
    translate: string | number
    transition: Transition
    tooltipTransition: Transition
    side: "top" | "bottom" | "left" | "right"
    sideOffset: number
    align: "start" | "center" | "end"
    alignOffset: number
}>({
    invertOverlap: true,
    translate: "-30%",
    transition: { type: "spring", stiffness: 300, damping: 17 },
    tooltipTransition: { type: "spring", stiffness: 300, damping: 35 },
    side: "top",
    sideOffset: 25,
    align: "center",
    alignOffset: 0,
})

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
    (
        {
            children,
            className,
            invertOverlap = true,
            translate = "-30%",
            transition = { type: "spring", stiffness: 300, damping: 17 },
            tooltipTransition = { type: "spring", stiffness: 300, damping: 35 },
            openDelay = 0,
            closeDelay = 0,
            side = "top",
            sideOffset = 25,
            align = "center",
            alignOffset = 0,
            ...props
        },
        ref
    ) => {
        const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

        const contextValue = React.useMemo(
            () => ({
                invertOverlap,
                translate,
                transition,
                tooltipTransition,
                side,
                sideOffset,
                align,
                alignOffset,
            }),
            [invertOverlap, translate, transition, tooltipTransition, side, sideOffset, align, alignOffset]
        )

        return (
            <AvatarGroupContext.Provider value={contextValue}>
                <TooltipPrimitive.Provider delayDuration={openDelay} skipDelayDuration={closeDelay}>
                    <div ref={ref} className={cn("flex items-center", className)} {...props}>
                        {React.Children.map(children, (child, index) => {
                            if (!React.isValidElement(child)) return null

                            const isHovered = hoveredIndex === index
                            const direction = invertOverlap ? 1 : -1
                            const offset = hoveredIndex !== null && hoveredIndex < index ? direction : 0

                            // Extract tooltip and other children
                            let tooltip = null
                            let otherChildren: React.ReactNode[] = []

                            const childProps = (child as React.ReactElement).props as any
                            React.Children.forEach(childProps.children, (c: any) => {
                                if (React.isValidElement(c) && c.type === AvatarGroupTooltip) {
                                    tooltip = c
                                } else {
                                    otherChildren.push(c)
                                }
                            })

                            // Clone the child without the tooltip
                            const childWithoutTooltip = React.cloneElement(child, {
                                ...(childProps as any),
                                children: otherChildren
                            })

                            return (
                                <motion.div
                                    key={index}
                                    className="relative"
                                    style={{
                                        marginLeft: index === 0 ? 0 : translate,
                                        zIndex: isHovered ? 10 : children.length - index,
                                    }}
                                    animate={{
                                        x: offset !== 0 ? (typeof translate === "string" ? offset * 30 : offset * translate) : 0,
                                    }}
                                    transition={transition}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <TooltipPrimitive.Root>
                                        <TooltipPrimitive.Trigger asChild>
                                            {childWithoutTooltip}
                                        </TooltipPrimitive.Trigger>
                                        {tooltip}
                                    </TooltipPrimitive.Root>
                                </motion.div>
                            )
                        })}
                    </div>
                </TooltipPrimitive.Provider>
            </AvatarGroupContext.Provider>
        )
    }
)
AvatarGroup.displayName = "AvatarGroup"

const AvatarGroupTooltip = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    AvatarGroupTooltipProps & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ children, layout = "preserve-aspect", className, ...props }, ref) => {
    const context = React.useContext(AvatarGroupContext)

    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                ref={ref}
                side={context.side}
                sideOffset={context.sideOffset}
                align={context.align}
                alignOffset={context.alignOffset}
                className={cn(
                    "z-50 overflow-hidden rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50 animate-in fade-in-0 zoom-in-95",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    className
                )}
                {...props}
            >
                {layout && layout !== "preserve-aspect" ? (
                    <motion.div layout={layout === true ? true : layout} transition={context.tooltipTransition}>
                        {children}
                    </motion.div>
                ) : (
                    children
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    )
})
AvatarGroupTooltip.displayName = "AvatarGroupTooltip"

// Export the main components
export { AvatarGroup, AvatarGroupTooltip }

// Demo Component
const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-100", className)}>
        {children}
    </div>
)

const AvatarImage = ({ src, alt = "Avatar" }: { src: string, alt?: string }) => (
    <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
)

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-sm font-medium text-zinc-700">
        {children}
    </div>
)

// Demo
const AVATARS = [
    { src: "https://i.pravatar.cc/150?img=1", fallback: "JD", tooltip: "John Doe" },
    { src: "https://i.pravatar.cc/150?img=2", fallback: "AS", tooltip: "Alice Smith" },
    { src: "https://i.pravatar.cc/150?img=3", fallback: "BJ", tooltip: "Bob Johnson" },
    { src: "https://i.pravatar.cc/150?img=4", fallback: "EW", tooltip: "Emma Wilson" },
    { src: "https://i.pravatar.cc/150?img=5", fallback: "MD", tooltip: "Michael Davis" },
]

export default function AvatarGroupDemo() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-8">
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-zinc-900 mb-2">Avatar Group Component</h1>
                    <p className="text-zinc-600">Hover over avatars to see the animation effect</p>
                </div>

                <AvatarGroup>
                    {AVATARS.map((avatar, index) => (
                        <Avatar key={index}>
                            <AvatarImage src={avatar.src} />
                            <AvatarFallback>{avatar.fallback}</AvatarFallback>
                            <AvatarGroupTooltip>{avatar.tooltip}</AvatarGroupTooltip>
                        </Avatar>
                    ))}
                </AvatarGroup>
            </div>
        </div>
    )
}