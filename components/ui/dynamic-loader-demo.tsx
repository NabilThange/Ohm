'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader, Sparkles, CheckCircle2 } from 'lucide-react'
import {
  DynamicContainer,
  DynamicDescription,
  DynamicDiv,
  DynamicIsland,
  DynamicIslandProvider,
  DynamicTitle,
  useDynamicIslandSize,
  useScheduledAnimations,
} from '@/components/ui/dynamic-island'

// Animated Loader Component
const AnimatedDynamicLoader = ({ title, description }: { title: string; description: string }) => {
  const { state: blobState } = useDynamicIslandSize()

  useScheduledAnimations([
    { size: "compact", delay: 1000 },
    { size: "large", delay: 2000 },
    { size: "medium", delay: 3000 },
    { size: "compact", delay: 4000 },
  ])

  const renderCompactState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative w-full flex items-center justify-center">
        <Loader className="h-4 w-4 animate-spin text-cyan-400" />
      </div>
    </DynamicContainer>
  )

  const renderLargeState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative flex w-full items-center justify-between gap-6 px-4">
        <Loader className="animate-spin h-12 w-12 text-cyan-400" />
        <DynamicTitle className="my-auto text-2xl font-black tracking-tighter text-white">
          {title}
        </DynamicTitle>
      </div>
    </DynamicContainer>
  )

  const renderMediumState = () => (
    <DynamicContainer className="flex flex-col justify-between px-4 pt-4 text-left text-white h-full">
      <DynamicTitle className="text-xl font-black tracking-tighter">
        {title}
      </DynamicTitle>
      <DynamicDescription className="leading-5 text-neutral-300 mb-4">
        {description}
      </DynamicDescription>
      <DynamicDiv className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
      </DynamicDiv>
    </DynamicContainer>
  )

  function renderState() {
    switch (blobState.size) {
      case "compact":
        return renderCompactState()
      case "large":
        return renderLargeState()
      case "medium":
        return renderMediumState()
      default:
        return renderCompactState()
    }
  }

  return <DynamicIsland id="animated-loader">{renderState()}</DynamicIsland>
}

// Static Loader Component (stays in large state)
const StaticDynamicLoader = ({ title, description }: { title: string; description: string }) => {
  const { setSize } = useDynamicIslandSize()

  React.useEffect(() => {
    setSize("large")
  }, [setSize])

  return (
    <DynamicIsland id="static-loader">
      <DynamicContainer className="flex items-center justify-center h-full w-full">
        <div className="relative flex w-full items-center justify-between gap-6 px-4">
          <div className="relative">
            <Loader className="animate-spin h-10 w-10 text-cyan-400" />
            <span className="absolute top-0 right-0 h-3 w-3 animate-ping rounded-full bg-cyan-400 opacity-75" />
          </div>
          <div className="flex flex-col text-left">
            <DynamicTitle className="text-xl font-bold tracking-tight text-white">
              {title}
            </DynamicTitle>
            <DynamicDescription className="text-sm text-neutral-300">
              {description}
            </DynamicDescription>
          </div>
        </div>
      </DynamicContainer>
    </DynamicIsland>
  )
}

// Advanced Multi-State Loader
const AdvancedDynamicLoader = () => {
  const { state: blobState } = useDynamicIslandSize()

  useScheduledAnimations([
    { size: "compact", delay: 1000 },
    { size: "large", delay: 2000 },
    { size: "tall", delay: 3500 },
    { size: "long", delay: 5000 },
    { size: "medium", delay: 6500 },
  ])

  const renderCompactState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative w-full flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
      </div>
    </DynamicContainer>
  )

  const renderLargeState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative flex w-full items-center justify-between gap-6 px-4">
        <Loader className="animate-spin h-12 w-12 text-yellow-300" />
        <DynamicTitle className="my-auto text-2xl font-black tracking-tighter text-white">
          Processing...
        </DynamicTitle>
      </div>
    </DynamicContainer>
  )

  const renderTallState = () => (
    <DynamicContainer className="flex flex-col mt-6 w-full items-start gap-1 px-8 font-semibold">
      <DynamicDescription className="bg-cyan-300 rounded-2xl tracking-tight leading-5 p-2">
        Analyzing your request
      </DynamicDescription>
      <DynamicDescription className="bg-cyan-300 rounded-2xl tracking-tight leading-5 p-2 text-left">
        AI is working through multiple steps to give you the best results
      </DynamicDescription>
      <DynamicTitle className="text-4xl font-black tracking-tighter text-cyan-100">
        AI at work
      </DynamicTitle>
    </DynamicContainer>
  )

  const renderLongState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <DynamicDiv className="relative flex w-full items-center justify-between gap-6 px-4">
        <div className="relative">
          <CheckCircle2 className="text-green-400 h-8 w-8" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-ping" />
        </div>
        <DynamicTitle className="my-auto text-xl font-black tracking-tighter text-white">
          Almost there! Finalizing...
        </DynamicTitle>
      </DynamicDiv>
    </DynamicContainer>
  )

  const renderMediumState = () => (
    <DynamicContainer className="flex flex-col justify-between px-2 pt-4 text-left text-white h-full">
      <DynamicTitle className="text-2xl pl-3 font-black tracking-tighter">
        Task Complete!
      </DynamicTitle>
      <DynamicDescription className="leading-5 text-neutral-300 pl-3">
        Your AI-powered task has finished processing
      </DynamicDescription>
      <DynamicDiv className="flex items-center gap-2 mt-auto mb-2 pl-3">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-sm text-green-400">Success</span>
      </DynamicDiv>
    </DynamicContainer>
  )

  function renderState() {
    switch (blobState.size) {
      case "compact":
        return renderCompactState()
      case "large":
        return renderLargeState()
      case "tall":
        return renderTallState()
      case "medium":
        return renderMediumState()
      case "long":
        return renderLongState()
      default:
        return renderCompactState()
    }
  }

  return <DynamicIsland id="advanced-loader">{renderState()}</DynamicIsland>
}

export default function DynamicLoaderDemo() {
  const [showAnimated, setShowAnimated] = useState(false)
  const [showStatic, setShowStatic] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Dynamic Island Loader Demo</h2>
        <p className="text-neutral-400">
          Apple Dynamic Island inspired loaders with smooth morphing animations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Animated Version */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Basic Animated</h3>
          <p className="text-sm text-neutral-400">
            Cycles: compact → large → medium
          </p>
          <Button 
            onClick={() => setShowAnimated(!showAnimated)}
            variant={showAnimated ? "destructive" : "default"}
          >
            {showAnimated ? "Hide" : "Show"} Basic Loader
          </Button>
          
          {showAnimated && (
            <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50 min-h-[200px] flex items-center justify-center">
              <DynamicIslandProvider initialSize="default">
                <AnimatedDynamicLoader 
                  title="Processing..."
                  description="AI is working on your project"
                />
              </DynamicIslandProvider>
            </div>
          )}
        </div>

        {/* Static Version (Now just uses animated) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Production Version</h3>
          <p className="text-sm text-neutral-400">
            Used in ContextDrawer & WiringDrawer (animated for better UX!)
          </p>
          <Button 
            onClick={() => setShowStatic(!showStatic)}
            variant={showStatic ? "destructive" : "default"}
          >
            {showStatic ? "Hide" : "Show"} Production Loader
          </Button>
          
          {showStatic && (
            <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50 min-h-[200px] flex items-center justify-center">
              <DynamicIslandProvider initialSize="default">
                <StaticDynamicLoader 
                  title="Generating Content..."
                  description="The AI is creating your context"
                />
              </DynamicIslandProvider>
            </div>
          )}
        </div>

        {/* Advanced Version */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Advanced Multi-State</h3>
          <p className="text-sm text-neutral-400">
            All states: compact → large → tall → long → medium
          </p>
          <Button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant={showAdvanced ? "destructive" : "default"}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Loader
          </Button>
          
          {showAdvanced && (
            <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50 min-h-[250px] flex items-center justify-center">
              <DynamicIslandProvider initialSize="default">
                <AdvancedDynamicLoader />
              </DynamicIslandProvider>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Features</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-neutral-400">
          <li>Smooth morphing animations between different sizes (compact, large, medium, tall, long)</li>
          <li>Apple Dynamic Island inspired design with rounded corners and backdrop blur</li>
          <li>Customizable title and description text for each state</li>
          <li>Automatic state cycling with useScheduledAnimations hook</li>
          <li>Built with Framer Motion for buttery smooth transitions</li>
          <li>Dark theme with glassmorphism effects</li>
          <li>Bouncing dots progress indicator in medium state</li>
          <li>Spinning loader icons with ping effects</li>
          <li>Multiple loader variants: basic animated, static, and advanced multi-state</li>
        </ul>
      </div>
    </div>
  )
}