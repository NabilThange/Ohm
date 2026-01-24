"use client"

import { LayoutGroup } from "framer-motion"

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    return <LayoutGroup>{children}</LayoutGroup>
}
