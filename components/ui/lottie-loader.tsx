'use client'

import React, { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface LottieLoaderProps {
  animationPath?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  animationPath = "/loader.json",
  loop = true,
  autoplay = true,
  speed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Lottie animation
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      path: animationPath,
    })

    // Set animation speed
    if (animationRef.current) {
      animationRef.current.setSpeed(speed)
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [animationPath, loop, autoplay, speed])

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}

// Compact version for drawers
export const CompactLottieLoader: React.FC<LottieLoaderProps> = ({
  animationPath = "/loader.json",
  loop = true,
  autoplay = true,
  speed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      path: animationPath,
    })

    if (animationRef.current) {
      animationRef.current.setSpeed(speed)
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [animationPath, loop, autoplay, speed])

  return (
    <div
      ref={containerRef}
      className="w-20 h-20 flex-shrink-0"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}
