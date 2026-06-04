"use client";

/**
 * Aurora — animated green gradient background (React Bits style, CSS-based).
 * Performant: pure CSS keyframes, no WebGL. On-brand Vespera greens.
 */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Deep base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 0%, #0b2a18 0%, #061a10 45%, #04120b 100%)" }} />

      {/* Drifting aurora blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Top sheen */}
      <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(to bottom, rgba(134,239,172,0.10), transparent)" }} />

      {/* Subtle grain/vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(100% 100% at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />

      <style>{`
        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.55;
          will-change: transform;
        }
        .aurora-blob-1 {
          width: 50vw; height: 50vw; max-width: 720px; max-height: 720px;
          left: -10%; top: -15%;
          background: radial-gradient(circle, #4ADE80 0%, rgba(74,222,128,0) 70%);
          animation: aurora-drift-1 18s ease-in-out infinite;
        }
        .aurora-blob-2 {
          width: 45vw; height: 45vw; max-width: 640px; max-height: 640px;
          right: -8%; top: 0%;
          background: radial-gradient(circle, #86EFAC 0%, rgba(134,239,172,0) 70%);
          animation: aurora-drift-2 22s ease-in-out infinite;
        }
        .aurora-blob-3 {
          width: 55vw; height: 55vw; max-width: 760px; max-height: 760px;
          left: 25%; bottom: -25%;
          background: radial-gradient(circle, #16A34A 0%, rgba(22,163,74,0) 70%);
          animation: aurora-drift-3 26s ease-in-out infinite;
        }
        @keyframes aurora-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(12%, 10%) scale(1.15); }
        }
        @keyframes aurora-drift-2 {
          0%,100% { transform: translate(0,0) scale(1.1); }
          50%     { transform: translate(-10%, 8%) scale(0.95); }
        }
        @keyframes aurora-drift-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-8%, -12%) scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
