'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LottieLoader, CompactLottieLoader } from '@/components/ui/lottie-loader'

export default function LottieLoaderDemo() {
  const [showFull, setShowFull] = useState(false)
  const [showCompact, setShowCompact] = useState(false)

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Lottie Loader Demo</h2>
        <p className="text-neutral-400">
          High-performance JSON-based animation loader (no text, full-screen)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Version */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Full Screen Loader</h3>
          <p className="text-sm text-neutral-400">
            Used in ContextDrawer (fills entire content area)
          </p>
          <Button 
            onClick={() => setShowFull(!showFull)}
            variant={showFull ? "destructive" : "default"}
          >
            {showFull ? "Hide" : "Show"} Full Loader
          </Button>
          
          {showFull && (
            <div className="border border-neutral-700 rounded-lg p-8 bg-neutral-800/50 min-h-[300px] flex items-center justify-center">
              <LottieLoader />
            </div>
          )}
        </div>

        {/* Compact Version */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Compact Loader</h3>
          <p className="text-sm text-neutral-400">
            Small animation for inline use
          </p>
          <Button 
            onClick={() => setShowCompact(!showCompact)}
            variant={showCompact ? "destructive" : "default"}
          >
            {showCompact ? "Hide" : "Show"} Compact Loader
          </Button>
          
          {showCompact && (
            <div className="border border-neutral-700 rounded-lg p-8 bg-neutral-800/50 min-h-[200px] flex items-center justify-center">
              <CompactLottieLoader />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Features</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-neutral-400">
          <li>Ultra-lightweight JSON animation format</li>
          <li>Smooth 60fps performance</li>
          <li>Scales perfectly on any screen size</li>
          <li>No text overlay - pure animation</li>
          <li>Full-screen support for content areas</li>
          <li>Compact variant for inline use</li>
          <li>No external dependencies (just lottie-web)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Usage</h3>
        <div className="bg-neutral-900 rounded-lg p-4 text-sm text-neutral-300 font-mono overflow-x-auto">
          <pre>{`// Full screen version (ContextDrawer)
<LottieLoader 
  animationPath="/loader.json"
  speed={1}
/>

// Compact version (inline)
<CompactLottieLoader 
  animationPath="/loader.json"
/>`}</pre>
        </div>
      </div>
    </div>
  )
}
