'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, FileText, Zap, CheckCircle } from 'lucide-react'
import {
  DynamicIsland,
  DynamicIslandProvider,
  DynamicContainer,
  DynamicDescription,
  DynamicTitle,
  useDynamicIslandSize,
  type SizePresets,
} from '@/components/ui/dynamic-island'

interface DynamicLoaderProps {
  title?: string
  description?: string
  className?: string
}

const LoaderContent: React.FC<DynamicLoaderProps> = ({
  title = "Generating Content...",
  description = "The AI is creating your content"
}) => {
  const { state, setSize } = useDynamicIslandSize()
  const [loadingPhase, setLoadingPhase] = useState(0)

  // Cycle through different loading phases
  useEffect(() => {
    const phases: SizePresets[] = ['compact', 'large', 'medium']
    let currentPhase = 0

    const interval = setInterval(() => {
      setSize(phases[currentPhase])
      setLoadingPhase(currentPhase)
      currentPhase = (currentPhase + 1) % phases.length
    }, 2000)

    return () => clearInterval(interval)
  }, [setSize])

  // Compact state - minimal loading indicator
  const renderCompactState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative w-full flex items-center justify-between px-4">
        <DynamicDescription className="flex items-center gap-2 text-white">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-medium">Loading</span>
        </DynamicDescription>
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      </div>
    </DynamicContainer>
  )

  // Large state - full loading experience
  const renderLargeState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative flex w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
            <Loader2 className="relative w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <div className="flex flex-col">
            <DynamicTitle className="text-sm font-bold tracking-tight text-white">
              {title}
            </DynamicTitle>
            <DynamicDescription className="text-xs text-white/70">
              {description}
            </DynamicDescription>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </DynamicContainer>
  )

  // Medium state - balanced view
  const renderMediumState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/30" />
          <FileText className="relative w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <DynamicDescription className="text-center text-white">
          <div className="text-xs font-medium">Processing...</div>
          <div className="text-xs text-white/60">Please wait</div>
        </DynamicDescription>
      </div>
    </DynamicContainer>
  )

  // Render based on current state
  const renderCurrentState = () => {
    switch (state.size) {
      case 'compact':
        return renderCompactState()
      case 'large':
        return renderLargeState()
      case 'medium':
        return renderMediumState()
      default:
        return renderLargeState()
    }
  }

  return <DynamicIsland id="dynamic-loader">{renderCurrentState()}</DynamicIsland>
}

export const DynamicLoader: React.FC<DynamicLoaderProps> = (props) => {
  return (
    <DynamicIslandProvider initialSize="large">
      <div className="flex items-center justify-center min-h-[200px] w-full">
        <LoaderContent {...props} />
      </div>
    </DynamicIslandProvider>
  )
}

// Static version for simpler use cases (deprecated - use DynamicLoader instead)
export const StaticDynamicLoader: React.FC<DynamicLoaderProps> = (props) => {
  // Just use the animated version - it's much better!
  return <DynamicLoader {...props} />
}