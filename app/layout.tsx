import type { Metadata } from 'next'
import './globals.css'
import '@/components/toast.css'
import { ToastProvider } from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'Ohm - Hardware Lifecycle Orchestrator',
  description: 'The path of least resistance. An intelligent workspace that bridges the gap between software and silicon.',
  icons: {
    icon: '/omega.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
