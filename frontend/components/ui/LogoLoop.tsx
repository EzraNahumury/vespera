"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo, ReactNode } from "react";
import "./LogoLoop.css";

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };
const toCssLength = (value: number | string | undefined) =>
  typeof value === "number" ? `${value}px` : (value ?? undefined);

type NodeLogoItem = { node: ReactNode; title?: string; href?: string; ariaLabel?: string };
type ImgLogoItem = { src: string; alt?: string; title?: string; href?: string; srcSet?: string; sizes?: string; width?: number; height?: number };
export type LogoItem = NodeLogoItem | ImgLogoItem;

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLoop = memo(({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}: LogoLoopProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === "up" || direction === "down";

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    return undefined;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const mag = Math.abs(speed);
    const dir = isVertical ? (direction === "up" ? 1 : -1) : (direction === "left" ? 1 : -1);
    return mag * dir * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect();
    const sw = rect?.width ?? 0;
    const sh = rect?.height ?? 0;
    if (!isVertical && sw > 0) {
      setSeqWidth(Math.ceil(sw));
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(containerWidth / sw) + ANIMATION_CONFIG.COPY_HEADROOM));
    }
    if (isVertical && sh > 0) {
      setSeqHeight(Math.ceil(sh));
      const vh = containerRef.current?.clientHeight ?? sh;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(vh / sh) + ANIMATION_CONFIG.COPY_HEADROOM));
    }
  }, [isVertical]);

  useEffect(() => {
    const els = [containerRef.current, seqRef.current].filter(Boolean) as Element[];
    if (!window.ResizeObserver) { updateDimensions(); return; }
    const observers = els.map(el => { const o = new ResizeObserver(updateDimensions); o.observe(el); return o; });
    updateDimensions();
    return () => observers.forEach(o => o.disconnect());
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const seqSize = isVertical ? seqHeight : seqWidth;

    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.max(0, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const target = isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      velocityRef.current += (target - velocityRef.current) * (1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU));
      if (seqSize > 0) {
        offsetRef.current = (((offsetRef.current + velocityRef.current * dt) % seqSize) + seqSize) % seqSize;
        track.style.transform = isVertical
          ? `translate3d(0,${-offsetRef.current}px,0)`
          : `translate3d(${-offsetRef.current}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical]);

  const cssVars = useMemo(() => ({
    "--logoloop-gap": `${gap}px`,
    "--logoloop-logoHeight": `${logoHeight}px`,
    ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
  }), [gap, logoHeight, fadeOutColor]);

  const rootClass = [
    "logoloop",
    isVertical ? "logoloop--vertical" : "logoloop--horizontal",
    fadeOut && "logoloop--fade",
    scaleOnHover && "logoloop--scale-hover",
    className,
  ].filter(Boolean).join(" ");

  const renderLogoItem = useCallback((item: LogoItem, key: React.Key) => {
    if (renderItem) return <li className="logoloop__item" key={key}>{renderItem(item, key)}</li>;
    const isNode = "node" in item;
    const content = isNode
      ? <span className="logoloop__node">{(item as NodeLogoItem).node}</span>
      : <img src={(item as ImgLogoItem).src} alt={(item as ImgLogoItem).alt ?? ""} loading="lazy" decoding="async" draggable={false} />;
    const label = isNode ? (item as NodeLogoItem).title : (item as ImgLogoItem).alt;
    const wrapped = item.href
      ? <a className="logoloop__link" href={item.href} aria-label={label ?? "logo"} target="_blank" rel="noreferrer noopener">{content}</a>
      : content;
    return <li className="logoloop__item" key={key}>{wrapped}</li>;
  }, [renderItem]);

  const lists = useMemo(() =>
    Array.from({ length: copyCount }, (_, ci) => (
      <ul className="logoloop__list" key={`c-${ci}`} aria-hidden={ci > 0} ref={ci === 0 ? seqRef : undefined}>
        {logos.map((item, ii) => renderLogoItem(item, `${ci}-${ii}`))}
      </ul>
    )), [copyCount, logos, renderLogoItem]);

  const containerStyle = useMemo(() => ({
    width: isVertical ? (toCssLength(width) === "100%" ? undefined : toCssLength(width)) : (toCssLength(width) ?? "100%"),
    ...cssVars,
    ...style,
  }), [width, cssVars, style, isVertical]);

  return (
    <div ref={containerRef} className={rootClass} style={containerStyle as React.CSSProperties} role="region" aria-label={ariaLabel}>
      <div className="logoloop__track" ref={trackRef}
        onMouseEnter={() => effectiveHoverSpeed !== undefined && setIsHovered(true)}
        onMouseLeave={() => effectiveHoverSpeed !== undefined && setIsHovered(false)}>
        {lists}
      </div>
    </div>
  );
});

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
