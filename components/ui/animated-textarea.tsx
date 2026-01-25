"use client"

import { useState, useEffect, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    placeholderExamples?: string[]
    typeSpeed?: number
    deleteSpeed?: number
    pauseDelay?: number
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
    (
        {
            placeholderExamples = [
                "I want to build a smart weather station with ESP32 and e-ink display.",
            ],
            typeSpeed = 50,
            deleteSpeed = 30,
            pauseDelay = 2000,
            className,
            value,
            ...props
        },
        ref
    ) => {
        const [animatedPlaceholder, setAnimatedPlaceholder] = useState("")
        const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
        const [charIndex, setCharIndex] = useState(0)
        const [isDeleting, setIsDeleting] = useState(false)
        const [isPaused, setIsPaused] = useState(false)
        const [showCursor, setShowCursor] = useState(true)

        // Cursor blinking effect when paused
        useEffect(() => {
            if (!isPaused) {
                setShowCursor(true)
                return
            }
            const timer = setInterval(() => {
                setShowCursor((prev) => !prev)
            }, 500)
            return () => clearInterval(timer)
        }, [isPaused])

        // Typing animation effect for placeholder
        useEffect(() => {
            // Don't animate if user has typed something
            if (value && String(value).length > 0) {
                setAnimatedPlaceholder("")
                return
            }

            // Ensure we have examples to animate
            if (!placeholderExamples || placeholderExamples.length === 0) {
                setAnimatedPlaceholder("")
                return
            }

            const currentExample = placeholderExamples[currentExampleIndex]
            if (!currentExample) {
                return
            }

            const cursorChar = showCursor ? "│" : ""

            const tick = () => {
                if (isPaused) return

                if (!isDeleting) {
                    // Typing phase
                    if (charIndex < currentExample.length) {
                        setAnimatedPlaceholder(currentExample.slice(0, charIndex + 1) + cursorChar)
                        setCharIndex((prev) => prev + 1)
                    } else {
                        // Finished typing, pause before deleting
                        setIsPaused(true)
                        const pauseTimer = setTimeout(() => {
                            setIsPaused(false)
                            setIsDeleting(true)
                        }, pauseDelay)
                        return () => clearTimeout(pauseTimer)
                    }
                } else {
                    // Deleting phase
                    if (charIndex > 0) {
                        setAnimatedPlaceholder(currentExample.slice(0, charIndex - 1) + cursorChar)
                        setCharIndex((prev) => prev - 1)
                    } else {
                        // Finished deleting, move to next example
                        setIsDeleting(false)
                        setCurrentExampleIndex((prev) => (prev + 1) % placeholderExamples.length)
                    }
                }
            }

            const speed = isDeleting ? deleteSpeed : typeSpeed
            const timer = setTimeout(tick, speed)
            return () => clearTimeout(timer)
        }, [
            value,
            charIndex,
            isDeleting,
            isPaused,
            currentExampleIndex,
            placeholderExamples,
            typeSpeed,
            deleteSpeed,
            pauseDelay,
            showCursor,
        ])

        return (
            <textarea
                ref={ref}
                value={value}
                className={cn(
                    "w-full bg-transparent text-foreground placeholder:text-foreground/60 text-sm font-mono resize-none outline-none border-none focus:outline-none focus:ring-0",
                    className
                )}
                style={{
                    ...((props.style || {}) as React.CSSProperties),
                }}
                {...props}
                placeholder={value ? "" : animatedPlaceholder}
            />
        )
    }
)

AnimatedTextarea.displayName = "AnimatedTextarea"
