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
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				sidebar: {
					DEFAULT: 'var(--sidebar)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				},
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [
					'Space Grotesk',
					'ui-sans-serif',
					'sans-serif',
					'system-ui'
				],
				serif: [
					'Fraunces',
					'ui-serif',
					'serif'
				],
				mono: [
					'JetBrains Mono',
					'ui-monospace',
					'monospace'
				]
			}
		},
		keyframes: {
			'shape-shift': {
				'0%': {
					width: '40px',
					height: '20px'
				},
				'100%': {
					width: '500px',
					height: '300px'
				}
			},
			marquee: {
				from: {
					transform: 'translateX(0)'
				},
				to: {
					transform: 'translateX(calc(-100% - var(--gap)))'
				}
			},
			'marquee-vertical': {
				from: {
					transform: 'translateY(0)'
				},
				to: {
					transform: 'translateY(calc(-100% - var(--gap)))'
				}
			},
			'blink-cursor': {
				'0%, 49%': {
					opacity: '1'
				},
				'50%, 100%': {
					opacity: '0'
				}
			}
		},
		animation: {
			'shape-shift': 'shape-shift 8s ease-in-out infinite alternate',
			marquee: 'marquee var(--duration) infinite linear',
			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
			'blink-cursor': 'blink-cursor 1.2s step-end infinite'
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
