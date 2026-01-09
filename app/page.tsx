'use client'

import { ArrowRight, Paperclip, Send, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ShapeShifter from '@/components/mage-ui/hero/shape-shifter'
import SlackIntro from '@/components/mage-ui/hero/slack-intro'
import MaskEffectPage from '@/components/mage-ui/hero/svg-mask-effect'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const features = [
    { label: 'Project Planning' },
    { label: 'Component Selection' },
    { label: 'Wiring Diagrams' },
    { label: 'Firmware Code' },
    { label: 'Cost Estimation' },
    { label: 'Build Guide' },
]

const companies = [
    {
        name: 'v0',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>'
    },
    {
        name: 'Vercel',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><polygon points="12,2 2,22 22,22" /></svg>'
    },
    {
        name: 'Resend',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2 4h20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2"/></svg>'
    },
    {
        name: 'Cursor',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M3.5 2.5L13 13l4-11 3.5 9-9 3.5L2 20.5z"/></svg>'
    },
    {
        name: 'Supermemory',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>'
    },
    {
        name: 'Next.js',
        svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M11.214 5.02c.857-1.289 2.515-1.289 3.372 0l8.102 12.15c.857 1.289.214 2.33-1.429 2.33H4.54c-1.643 0-2.286-.957-1.429-2.33l8.102-12.15zm.536 6.77h1.5v4.286h-1.5V11.79z" fillRule="evenodd"/></svg>'
    },
]

export default function Home() {
    return (
        <div className="min-h-screen bg-background flex justify-center">
            <div className="relative w-full">
                {/* Header */}
                <header className="">
                    <div className="px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold rounded">
                                Ω
                            </div>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Solutions
                            </a>
                            <a href="#" className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Use Cases
                            </a>
                            <a href="#" className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Developers
                            </a>
                            <a href="#" className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Resources
                            </a>
                            <a href="#" className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Pricing
                            </a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <button className="text-sm font-mono text-foreground hover:opacity-75 transition">
                                Login
                            </button>
                            <Link href="/build">
                                <Button className="bg-white text-black hover:bg-white/90 text-sm font-mono rounded-full px-6 py-2">
                                    Start Building
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center py-20 px-6">
                    <div className="w-full px-8 py-12">
                        {/* Badge */}
                        <div className="mb-8 flex items-center gap-3 justify-center">
                            <div className="bg-muted px-3 py-1">
                                <span className="text-sm font-mono text-foreground">Introducing Ohm</span>
                            </div>
                            <Link href="/build">
                                <button className="bg-black text-white px-3 py-1 flex items-center gap-2 hover:bg-black/90 transition text-sm font-mono">
                                    Try now <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>

                        {/* Headlines + ShapeShifter */}
                        <div className="flex flex-col xl:flex-row items-center justify-between w-full max-w-6xl gap-12 mb-12">
                            <div className="flex-1">
                                {/* Headline */}
                                <h1 className="text-5xl md:text-6xl font-mono font-bold text-left mb-6 text-pretty">
                                    Meet your first autonomous hardware engineer.
                                </h1>

                                {/* Subheading */}
                                <p className="text-left text-foreground/70 max-w-2xl mb-12 text-sm md:text-base font-mono">
                                    Ohm helps engineers plan, design, and build electronics projects — from simple circuits to complex IoT systems — with a single prompt.
                                </p>
                            </div>

                            <div className="flex-1 w-full flex justify-center xl:justify-end">
                                <ShapeShifter prefix="Automate" suffix="Everything" containerClassName="translate-x--50" />
                            </div>
                        </div>

                        {/* Input Box */}
                        <div className="bg-black p-6 mb-12 w-full cursor-pointer hover:ring-2 hover:ring-zinc-400 transition-all max-w-4xl mx-auto">
                            <Link href="/build" className="block w-full">
                                <div className="text-gray-400 text-sm font-mono mb-6 h-6 overflow-hidden relative">
                                    <TypingEffect text="I want to build a smart weather station with ESP32 and e-ink display." />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-500 hover:text-gray-400 transition">
                                            <Paperclip size={18} />
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-400 transition">
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-500 hover:text-gray-400 transition">
                                            <Info size={18} />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-200 transition">
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20 justify-center">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="border border-border px-4 py-3 flex items-center justify-center text-sm font-mono text-foreground hover:border-foreground/50 transition cursor-default"
                                >
                                    <span className="font-bold text-center">{feature.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof Section */}
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-mono font-bold text-foreground mb-8">
                                Trusted by hardware teams globally
                            </h2>
                        </div>

                        {/* Company Logos */}
                        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-center text-center">
                            {companies.map((company, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center gap-2 text-foreground/50 hover:text-foreground/70 transition">
                                    <div className="w-12 h-12" dangerouslySetInnerHTML={{ __html: company.svg }} />
                                    <span className="text-xs font-mono font-bold">{company.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Slack Intro Section */}
                <section className="w-full">
                    <SlackIntro animateOut={false} />
                </section>

                {/* Mask Effect Section */}
                <section className="w-full">
                    <MaskEffectPage />
                </section>
            </div>
        </div>
    )
}

function TypingEffect({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span>
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-2.5 h-4 bg-gray-400 ml-1 align-middle"
            />
        </span>
    );
}
