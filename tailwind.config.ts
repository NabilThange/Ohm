import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                card: {
                    DEFAULT: "rgb(var(--card) / <alpha-value>)",
                    foreground: "rgb(var(--card-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "rgb(var(--muted) / <alpha-value>)",
                    foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
                },
                primary: {
                    DEFAULT: "rgb(var(--primary) / <alpha-value>)",
                    foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent) / <alpha-value>)",
                    foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
                },
                border: "rgb(var(--border) / <alpha-value>)",
                input: "rgb(var(--input) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace'],
            },
        },
        keyframes: {
            "shape-shift": {
                "0%": {
                    width: "40px",
                    height: "20px",
                },
                "100%": {
                    width: "500px",
                    height: "300px",
                },
            },
            marquee: {
                from: { transform: "translateX(0)" },
                to: { transform: "translateX(calc(-100% - var(--gap)))" },
            },
            "marquee-vertical": {
                from: { transform: "translateY(0)" },
                to: { transform: "translateY(calc(-100% - var(--gap)))" },
            },
        },
        animation: {
            "shape-shift": "shape-shift 8s ease-in-out infinite alternate",
            marquee: "marquee var(--duration) infinite linear",
            "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography")
    ],
} satisfies Config;
