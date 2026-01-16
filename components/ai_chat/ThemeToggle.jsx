import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
    const [mounted, setMounted] = useState(false);

    // Only render theme-dependent content after client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR and initial hydration, render a neutral placeholder
    if (!mounted) {
        return (
            <button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle theme"
                title="Toggle theme"
                disabled
            >
                {/* Neutral placeholder - no icon */}
                <div className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
            </button>
        );
    }

    // After mount, render the actual theme toggle
    return (
        <button
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
    );
}
