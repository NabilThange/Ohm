'use client';

import * as React from 'react';
import { motion, type Transition } from 'framer-motion';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// Avatar Container - handles individual avatar with tooltip
type AvatarProps = Omit<React.ComponentProps<typeof motion.div>, 'translate'> & {
    children: React.ReactNode;
    zIndex: number;
    translate?: string | number;
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    transition?: Transition;
};

function AvatarContainer({
    zIndex,
    translate,
    side,
    sideOffset,
    align,
    alignOffset,
    transition,
    children,
    ...props
}: AvatarProps) {
    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
                <motion.div
                    data-slot="avatar-container"
                    initial="initial"
                    whileHover="hover"
                    whileTap="hover"
                    style={{ position: 'relative', zIndex }}
                    transition={transition}
                >
                    <motion.div
                        variants={{
                            initial: { y: 0 },
                            hover: { y: translate },
                        }}
                        {...props}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            </TooltipPrimitive.Trigger>
        </TooltipPrimitive.Root>
    );
}

// Main AvatarGroup component
export interface AvatarGroupProps extends Omit<React.ComponentProps<'div'>, 'translate'> {
    children: React.ReactElement[];
    invertOverlap?: boolean;
    translate?: string | number;
    transition?: Transition;
    tooltipTransition?: Transition;
    openDelay?: number;
    closeDelay?: number;
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
    (
        {
            children,
            className,
            invertOverlap = true,
            translate = '-30%',
            transition = { type: 'spring', stiffness: 300, damping: 17 },
            tooltipTransition = { type: 'spring', stiffness: 300, damping: 35 },
            openDelay = 0,
            closeDelay = 0,
            side = 'top',
            sideOffset = 25,
            align = 'center',
            alignOffset = 0,
            style,
            ...props
        },
        ref
    ) => {
        return (
            <TooltipPrimitive.Provider delayDuration={openDelay} skipDelayDuration={closeDelay}>
                <div
                    ref={ref}
                    data-slot="avatar-group"
                    className={cn('flex items-center h-12 -space-x-3', className)}
                    style={style}
                    {...props}
                >
                    {children?.map((child, index) => (
                        <AvatarContainer
                            key={index}
                            zIndex={invertOverlap ? React.Children.count(children) - index : index}
                            transition={transition}
                            translate={translate}
                            side={side}
                            sideOffset={sideOffset}
                            align={align}
                            alignOffset={alignOffset}
                        >
                            {child}
                        </AvatarContainer>
                    ))}
                </div>
            </TooltipPrimitive.Provider>
        );
    }
);

AvatarGroup.displayName = 'AvatarGroup';

// AvatarGroupTooltip component
export interface AvatarGroupTooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    children: React.ReactNode;
    layout?: boolean | 'position' | 'size' | 'preserve-aspect';
}

const AvatarGroupTooltip = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    AvatarGroupTooltipProps
>(({ className, children, layout = 'preserve-aspect', ...props }, ref) => {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                ref={ref}
                className={cn(
                    'z-50 rounded-md bg-white px-3 py-1.5 text-xs text-black font-medium',
                    'animate-in fade-in-0 zoom-in-95',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                    className
                )}
                {...props}
            >
                {layout && layout !== 'preserve-aspect' ? (
                    <motion.div layout={layout === true ? true : layout} className="overflow-hidden">
                        {children}
                    </motion.div>
                ) : (
                    children
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
});

AvatarGroupTooltip.displayName = 'AvatarGroupTooltip';

export { AvatarGroup, AvatarGroupTooltip };
