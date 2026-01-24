'use client'

import { ArrowRightIcon } from '@/components/ui/arrow-right'
import { ZapIcon } from '@/components/ui/zap'
import { Button } from './ui/button'

interface LandingPageProps {
    onGetStarted: () => void
}

const useCases = [
    { label: 'IoT Sensors' },
    { label: 'Robotics' },
    { label: 'Smart Home' },
    { label: 'Wearables' },
    { label: 'Environmental Monitors' },
    { label: 'Automation' },
]

export default function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"
                    style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-16 border-b border-dashed border-border pb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                                <ZapIcon className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Ohm</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-mono text-muted-foreground hover:text-foreground transition">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-sm font-mono text-muted-foreground hover:text-foreground transition">
                                How It Works
                            </a>
                            <a href="#use-cases" className="text-sm font-mono text-muted-foreground hover:text-foreground transition">
                                Use Cases
                            </a>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="text-center mb-20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-block mb-6">
                        <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                Hardware Lifecycle Orchestrator
                            </span>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                        The path of
                        <br />
                        <span className="text-gradient">least resistance</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                        An intelligent workspace that bridges the gap between software and silicon.
                        Go from <span className="text-foreground font-semibold">vague IoT idea</span> to{' '}
                        <span className="text-foreground font-semibold">working prototype</span> faster than ever.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button
                            onClick={onGetStarted}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-8 py-6 text-base group"
                        >
                            Start Building
                            <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-lg px-8 py-6 text-base border-dashed"
                        >
                            View Demo Project
                        </Button>
                    </div>

                    {/* Quick Use Cases */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {useCases.map((useCase, idx) => (
                            <div
                                key={idx}
                                className="glass rounded-md px-3 py-1.5 text-xs font-mono border-dashed-tech hover:border-primary/50 transition"
                            >
                                {useCase.label}
                            </div>
                        ))}
                    </div>
                </section>



                {/* Footer */}
                <footer className="text-center text-sm text-muted-foreground border-t border-dashed border-border pt-8">
                    <p className="font-mono">
                        Built for Microsoft Imagine Cup 2026 •{' '}
                        <span className="text-foreground">Powered by Azure AI</span>
                    </p>
                </footer>
            </div>
        </div>
    )
}
