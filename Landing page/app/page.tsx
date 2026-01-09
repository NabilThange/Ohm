'use client'

import { ArrowRight, Paperclip, Send, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { label: 'Customer Outreach' },
  { label: 'Internal Workflows' },
  { label: 'Knowledge Hub' },
  { label: 'Deal Tracker' },
  { label: 'Growth Agent' },
  { label: 'CRM Assistant' },
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
      <div className="relative w-full max-w-4xl border-x border-dotted border-border">
        {/* Header */}
        <header className="border-b border-dotted border-border">
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <div className="w-4 h-4 bg-white" />
              </div>
            </div>
            <nav className="flex items-center gap-8">
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
              <Button className="bg-white text-black hover:bg-white/90 text-sm font-mono rounded-full px-6 py-2">
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-full border border-dashed border-border px-8 py-12">
            {/* Badge */}
            <div className="mb-8 flex items-center gap-3 justify-center">
              <div className="bg-muted px-3 py-1">
                <span className="text-sm font-mono text-foreground">Introducing Gorren</span>
              </div>
              <button className="bg-black text-white px-3 py-1 flex items-center gap-2 hover:bg-black/90 transition text-sm font-mono">
                Try now <ArrowRight size={14} />
              </button>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-mono font-bold text-center mb-6 max-w-3xl text-pretty">
              Meet your first autonomous builder.
            </h1>

            {/* Subheading */}
            <p className="text-center text-foreground/70 max-w-2xl mx-auto mb-12 text-sm md:text-base font-mono">
              Gorren helps teams deploy AI operators that plan, execute, and scale workflows — from sales to support — with a single prompt.
            </p>

            {/* Input Box */}
            <div className="bg-black p-6 mb-12 w-full">
              <div className="text-gray-400 text-sm font-mono mb-6">
                I Automate my client onboarding flow and send progress reports weekly.
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
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20 justify-center">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="border border-border px-4 py-3 flex items-center justify-center text-sm font-mono text-foreground hover:border-foreground/50 transition"
                >
                  <span className="font-bold">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Social Proof Section */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-mono font-bold text-foreground mb-8">
                Trusted by the teams redefining productivity
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
      </div>
    </div>
  )
}
