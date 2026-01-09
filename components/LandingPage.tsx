'use client'

import { ArrowRight, Zap, Cpu, Code, CircuitBoard } from 'lucide-react'
import { Button } from './ui/button'

interface LandingPageProps {
    onGetStarted: () => void
}

const features = [
    { icon: CircuitBoard, label: 'Component Selection', description: 'Smart BOM generation' },
    { icon: Zap, label: 'Wiring Guide', description: 'Visual digital twin' },
    { icon: Code, label: 'Code Generation', description: 'Arduino & MicroPython' },
    { icon: Cpu, label: 'Compatibility Check', description: 'Voltage & protocol validation' },
]

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
                                <Zap className="w-6 h-6 text-primary-foreground" />
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
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

                {/* Features Grid */}
                <section id="features" className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Everything you need to build hardware
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="glass rounded-lg p-6 border-dashed-tech hover:border-primary/50 hover:glow-amber transition-smooth group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.label}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="glass rounded-xl p-8 md:p-12 border-dashed-tech">
                        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-primary">
                                    1
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Describe Your Idea</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tell Ohm what you want to build - from smart sensors to robotics projects
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-primary">
                                    2
                                </div>
                                <h3 className="font-semibold text-lg mb-2">AI-Guided Planning</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get component recommendations, wiring diagrams, and compatibility checks
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-primary">
                                    3
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Build & Deploy</h3>
                                <p className="text-sm text-muted-foreground">
                                    Download code, order parts, and bring your hardware to life
                                </p>
                            </div>
                        </div>
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
