import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function makeId(prefix = "") {
    return prefix + Math.random().toString(36).substring(2, 9);
}

export function timeAgo(date: string | number | Date) {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return Math.floor(diff / 60) + "m"
    if (diff < 86400) return Math.floor(diff / 3600) + "h"
    if (diff < 604800) return Math.floor(diff / 86400) + "d"
    return d.toLocaleDateString()
}
