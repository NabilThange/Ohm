"use client";

import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

interface WaveRevealProps {
    text: string;
    className?: string;
    direction?: "up" | "down";
    delay?: number;
    duration?: string;
    blur?: boolean;
}

export default function WaveReveal({
    text,
    className,
    direction = "up",
    delay = 0,
    blur = false,
}: WaveRevealProps) {
    const letters = text.split("");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: delay / 1000 },
        },
    };

    const child: Variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 20 : -20,
            filter: blur ? "blur(8px)" : "none",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("flex flex-wrap", className)}
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    );
}
