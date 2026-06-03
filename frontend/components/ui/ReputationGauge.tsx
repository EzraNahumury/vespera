"use client";

import { useMemo } from "react";

const TIER_CONFIG = [
  {
    label: "Bronze",
    color: "#CD7F32",
    glow: "#CD7F32",
    bg: "#1A0F00",
    textColor: "#E8A855",
    range: "0 – 250",
  },
  {
    label: "Silver",
    color: "#C0C0C0",
    glow: "#C0C0C0",
    bg: "#111318",
    textColor: "#D4D4D8",
    range: "251 – 500",
  },
  {
    label: "Gold",
    color: "#FFD700",
    glow: "#FFD700",
    bg: "#1A1400",
    textColor: "#FCD34D",
    range: "501 – 750",
  },
  {
    label: "Platinum",
    color: "#86EFAC",
    glow: "#4ADE80",
    bg: "#001A0A",
    textColor: "#86EFAC",
    range: "751 – 1000",
  },
];

function getTier(score: number) {
  if (score > 750) return 3;
  if (score > 500) return 2;
  if (score > 250) return 1;
  return 0;
}

// cx, cy = center of the full circle; arc goes from left to right through top
function arcPoint(cx: number, cy: number, r: number, progress: number) {
  const angle = Math.PI * (1 - progress);
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
}

function buildArcPath(cx: number, cy: number, r: number, progress: number): string {
  const p = Math.max(0.001, Math.min(0.999, progress));
  const sx = cx - r;
  const sy = cy;
  const end = arcPoint(cx, cy, r, p);
  const large = p > 0.5 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 0 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

interface Props {
  score: number;
  size?: number;
}

export function ReputationGauge({ score, size = 320 }: Props) {
  const tier = getTier(score);
  const cfg = TIER_CONFIG[tier];
  const progress = score / 1000;

  // SVG geometry
  const W = 240;
  const H = 145;
  const cx = 120;
  const cy = 128;
  const R_TRACK = 95;
  const R_FILL = 95;
  const STROKE = 12;

  const filledPath = useMemo(() => buildArcPath(cx, cy, R_FILL, progress), [progress]);
  const trackPath = useMemo(() => buildArcPath(cx, cy, R_TRACK, 1), []);
  const dotPos = useMemo(() => arcPoint(cx, cy, R_FILL, Math.max(0.001, Math.min(0.999, progress))), [progress]);

  const filterId = `glow-${tier}`;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        width: size,
        maxWidth: "100%",
        backgroundColor: cfg.bg,
        padding: "20px 20px 16px",
        boxShadow: `0 0 40px ${cfg.glow}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Top row: tier badge + score info */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-white/40 text-xs mb-0.5">Reputation Tier</p>
          <p className="font-medium text-sm" style={{ color: cfg.textColor }}>{cfg.label}</p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs mb-0.5">Score Range</p>
          <p className="font-medium text-sm" style={{ color: cfg.textColor }}>{cfg.range}</p>
        </div>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={size - 40}
          style={{ maxWidth: "100%", overflow: "visible" }}
        >
          <defs>
            {/* Glow filter */}
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Gradient for fill arc */}
            <linearGradient id={`grad-${tier}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Filled arc with glow */}
          {score > 0 && (
            <path
              d={filledPath}
              fill="none"
              stroke={`url(#grad-${tier})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
            />
          )}

          {/* Indicator dot */}
          {score > 0 && (
            <g filter={`url(#${filterId})`}>
              <circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={8}
                fill={cfg.bg}
                stroke={cfg.color}
                strokeWidth={3}
              />
              <circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={3}
                fill={cfg.color}
              />
            </g>
          )}

          {/* Score number */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize="40"
            fontWeight="700"
            letterSpacing="-2"
            fill="white"
            style={{ fontFamily: "inherit" }}
          >
            {score}
          </text>

          {/* /1000 label */}
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize="11"
            fill="rgba(255,255,255,0.4)"
            style={{ fontFamily: "inherit" }}
          >
            out of 1000
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="mt-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/40">Progress to next tier</span>
          <span className="text-xs font-medium" style={{ color: cfg.textColor }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: cfg.color,
              boxShadow: `0 0 8px ${cfg.glow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
