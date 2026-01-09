"use client";

import React, { useState, useRef } from "react";
import maskSvg from "@/public/mask.svg";

// Utility function for combining classnames
const cn = (...classes: (string | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
};

// MaskContainer Component
const MaskContainer = ({
    children,
    revealText,
    size = 10,
    revealSize = 600,
    className
}: {
    children?: React.ReactNode;
    revealText?: React.ReactNode;
    size?: number;
    revealSize?: number;
    className?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const updateMousePosition = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const maskSize = isHovered ? revealSize : size;

    return (
        <div
            ref={containerRef}
            className={cn("relative h-screen transition-colors duration-300", className)}
            style={{
                backgroundColor: isHovered ? "var(--slate-900)" : "#000000",
            }}
            onMouseMove={updateMousePosition}
        >
            <div
                className="absolute flex h-full w-full items-center justify-center bg-black text-6xl dark:bg-white"
                style={{
                    maskImage: `url(${maskSvg.src})`,
                    maskRepeat: "no-repeat",
                    maskSize: `${maskSize}px`,
                    WebkitMaskImage: `url(${maskSvg.src})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskSize: `${maskSize}px`,
                    maskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
                    WebkitMaskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
                    transition: "mask-size 0.3s ease-in-out, -webkit-mask-size 0.3s ease-in-out",
                }}
            >
                <div className="absolute inset-0 z-0 h-full w-full bg-black opacity-50 dark:bg-white" />
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative z-20 mx-auto w-full px-10 text-center text-4xl font-bold"
                >
                    {children}
                </div>
            </div>
            <div className="flex h-full w-full items-center justify-center">
                {revealText}
            </div>
        </div>
    );
};

// Main component that uses the MaskContainer
const SVGMaskEffectDemo = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden">
            <MaskContainer
                revealText={
                    <p className="mx-auto w-full px-10 text-center text-4xl font-bold text-slate-800 dark:text-white">
                        Stop reading datasheets. Stop debugging connections. Stop worrying about compatibility. Start Building.
                    </p>
                }
                className="h-screen rounded-none border-none text-white"
            >
                Orchestrate <span className="text-blue-500">Component Selection</span>, <span className="text-blue-500">PCB Design</span>, and <span className="text-blue-500">Firmware Generation</span> in one place.
            </MaskContainer>
        </div >
    );
};

// Export the page component
export default function MaskEffectPage() {
    return (
        <div className="min-h-screen w-full bg-black">
            <SVGMaskEffectDemo />
        </div>
    );
}
