"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Download,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Info,
    ShoppingCart,
    CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Creates and downloads a CSV file from BOM data
 */
const exportToCSV = (data) => {
    if (!data || !data.components) return

    const headers = ["Name", "Quantity", "Price", "Part Number", "Supplier", "Link", "Notes"]
    const rows = data.components.map(c => [
        c.name,
        c.quantity,
        c.estimatedCost || 0,
        c.partNumber || "",
        c.supplier || "",
        c.link || "",
        c.notes || ""
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${(data.project_name || 'BOM').replace(/\s+/g, '_')}_Bill_of_Materials.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export default function BOMCard({ data }) {
    if (!data) return null

    const totalCost = data.totalCost || data.components.reduce((sum, c) => sum + (Number(c.estimatedCost || 0) * Number(c.quantity || 1)), 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="my-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {data.project_name || "Bill of Materials"}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Professional Hardware Manifest
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1.5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        <CreditCard className="h-4 w-4 text-zinc-400" />
                        ${totalCost.toFixed(2)}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Estimated Total</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/30 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/20">
                                <th className="px-5 py-3 font-medium">Component</th>
                                <th className="px-3 py-3 text-center font-medium">Qty</th>
                                <th className="px-3 py-3 text-right font-medium">Price</th>
                                <th className="px-5 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {data.components.map((component, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05) }}
                                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                                >
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{component.name}</div>
                                        <div className="text-[10px] text-zinc-500">{component.partNumber || "Generic"}</div>
                                    </td>
                                    <td className="px-3 py-3 text-center text-zinc-600 dark:text-zinc-400">
                                        {component.quantity}x
                                    </td>
                                    <td className="px-3 py-3 text-right text-zinc-900 dark:text-zinc-100 font-mono">
                                        ${(component.estimatedCost || 0).toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {component.link ? (
                                            <a
                                                href={component.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-white dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900"
                                            >
                                                <ShoppingCart className="h-3.5 w-3.5" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700">
                                                <ShoppingCart className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Warnings */}
                {data.warnings && data.warnings.length > 0 && (
                    <div className="border-t border-zinc-100 bg-red-50/30 px-5 py-4 dark:border-zinc-800 dark:bg-red-900/10">
                        <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <span className="font-semibold uppercase tracking-wider">Safety Warnings:</span>
                                <ul className="list-disc pl-4 space-y-1">
                                    {data.warnings.map((warning, i) => (
                                        <li key={i}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary / Analysis */}
                {data.powerAnalysis && (
                    <div className="border-t border-zinc-100 bg-blue-50/30 px-5 py-3 dark:border-zinc-800 dark:bg-blue-900/10">
                        <div className="flex items-center gap-2 text-[10px] text-blue-700 dark:text-blue-300">
                            <Info className="h-3 w-3" />
                            <span>Recommended Power: {data.powerAnalysis.recommendedSupply}</span>
                            <span className="mx-1 opacity-30">|</span>
                            <span>Est. Current Draw: {data.powerAnalysis.totalCurrent}</span>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <div className="text-[10px] text-zinc-500">
                        Generated by Ohm Intelligence
                    </div>
                    <button
                        onClick={() => exportToCSV(data)}
                        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
