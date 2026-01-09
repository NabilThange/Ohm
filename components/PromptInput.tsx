'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface PromptInputProps {
    onSubmit: (prompt: string, style: string) => void
    onBack: () => void
}

const projectStyles = [
    {
        value: 'sensor',
        label: 'Sensor Project',
        description: 'Environmental monitoring, data collection',
        examples: 'Temperature, humidity, air quality sensors'
    },
    {
        value: 'automation',
        label: 'Automation',
        description: 'Smart control systems',
        examples: 'Automated irrigation, smart lighting'
    },
    {
        value: 'robotics',
        label: 'Robotics',
        description: 'Mobile and autonomous systems',
        examples: 'Line followers, obstacle avoiders, drones'
    },
    {
        value: 'communication',
        label: 'Communication',
        description: 'Wireless data transmission',
        examples: 'IoT gateways, remote monitoring'
    },
    {
        value: 'display',
        label: 'Display & UI',
        description: 'Visual feedback systems',
        examples: 'Weather stations, smart dashboards'
    },
]

const samplePrompts = [
    'Build a radar speed detector for school zones',
    'Create a smart plant watering system with soil sensors',
    'Make an air quality monitor with OLED display',
    'Design a line-following robot with obstacle detection',
]

export default function PromptInput({ onSubmit, onBack }: PromptInputProps) {
    const [prompt, setPrompt] = useState('')
    const [selectedStyle, setSelectedStyle] = useState('')
    const [isAnimating, setIsAnimating] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        // Focus textarea on mount
        textareaRef.current?.focus()
    }, [])

    const handleSubmit = () => {
        if (!prompt.trim() || !selectedStyle) return

        setIsAnimating(true)
        // Short delay before transitioning to build interface
        setTimeout(() => {
            onSubmit(prompt, selectedStyle)
        }, 400)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleSampleClick = (sample: string) => {
        setPrompt(sample)
        textareaRef.current?.focus()
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"
                    style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            Start Your Hardware Journey
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                        What do you want
                        <br />
                        to <span className="text-gradient">build</span>?
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Describe your IoT project idea and let Ohm guide you through component selection,
                        wiring, and code generation
                    </p>
                </div>

                {/* Main Input Area */}
                <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {/* Prompt Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">
                            Project Description
                        </label>
                        <Textarea
                            ref={textareaRef}
                            placeholder="e.g., Build a radar speed detector for monitoring vehicles in school zones with an ESP32 and display"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={4}
                            className="resize-none glass text-base focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground text-right font-mono">
                            Press ⌘+Enter to continue
                        </p>
                    </div>

                    {/* Sample Prompts */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">
                            Or try an example
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {samplePrompts.map((sample, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSampleClick(sample)}
                                    className="text-left glass rounded-lg px-4 py-3 text-sm hover:border-primary/50 hover:glow-amber transition-smooth border-dashed-tech"
                                >
                                    <span className="text-muted-foreground">"{sample}"</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project Style Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">
                            Project Category
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {projectStyles.map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => setSelectedStyle(style.value)}
                                    className={`group text-left glass rounded-lg p-4 transition-all border-dashed-tech ${selectedStyle === style.value
                                            ? 'border-primary bg-primary/5 glow-amber'
                                            : 'hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-sm">{style.label}</h3>
                                        {selectedStyle === style.value && (
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{style.description}</p>
                                    <p className="text-xs text-muted-foreground/70 font-mono">{style.examples}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={!prompt.trim() || !selectedStyle}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-12 py-6 text-base group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Building
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-xs text-muted-foreground font-mono">
                        Ohm will analyze your requirements and guide you through a step-by-step process:
                        <br />
                        <span className="text-foreground">
                            Ideation → Parts → Wiring → Code → Testing → Deployment
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}
