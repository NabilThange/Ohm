"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useSmoothNavigation() {
    const router = useRouter()

    const navigate = useCallback((url: string, options?: { scroll?: boolean }) => {
        // Check if View Transitions API is supported
        if ('startViewTransition' in document) {
            // @ts-ignore
            document.startViewTransition(() => {
                router.push(url)
                if (options?.scroll !== false) {
                    window.scrollTo(0, 0)
                }
            })
        } else {
            // Fallback for browsers that don't support View Transitions
            router.push(url)
            if (options?.scroll !== false) {
                window.scrollTo(0, 0)
            }
        }
    }, [router])

    return { navigate }
}
