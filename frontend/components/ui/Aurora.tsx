/**
 * Aurora — animated green gradient background (React Bits style, CSS-based).
 * Keyframes live in globals.css for reliable animation. On-brand Vespera greens.
 */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Deep base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 0%, #0d3320 0%, #07210f 48%, #04140a 100%)" }} />

      {/* Drifting aurora blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Top sheen */}
      <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(to bottom, rgba(134,239,172,0.12), transparent)" }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(100% 100% at 50% 35%, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
    </div>
  );
}
