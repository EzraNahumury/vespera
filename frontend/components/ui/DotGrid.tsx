"use client";

/**
 * DotGrid — subtle dotted texture overlay (React Bits style).
 * Use over dark backgrounds for depth.
 */
export function DotGrid({ className = "", color = "rgba(134,239,172,0.12)", size = 22 }: { className?: string; color?: string; size?: number }) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage: "radial-gradient(100% 100% at 50% 0%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(100% 100% at 50% 0%, black 30%, transparent 80%)",
      }}
    />
  );
}
