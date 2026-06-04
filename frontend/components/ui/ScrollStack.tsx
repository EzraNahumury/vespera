"use client";

import { useLayoutEffect, useRef, useCallback, ReactNode } from "react";
import Lenis from "lenis";
import "./ScrollStack.css";

export function ScrollStackItem({ children, itemClassName = "" }: { children: ReactNode; itemClassName?: string }) {
  return <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;
}

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef  = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);
  const lenisRef     = useRef<Lenis | null>(null);
  const cardsRef     = useRef<HTMLElement[]>([]);
  // ── KEY FIX: cache natural document offsets at init time ──
  // getBoundingClientRect() is affected by transform, so we read offsets
  // BEFORE any transform is applied, then reuse the same values every frame.
  const cardOffsetsRef = useRef<number[]>([]);
  const endOffsetRef   = useRef<number>(0);
  const stackCompletedRef = useRef(false);

  const propsRef = useRef({ itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete });
  propsRef.current = { itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete };

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%"))
      return (parseFloat(value) / 100) * containerHeight;
    return parseFloat(value as string);
  }, []);

  // Recalculate cached offsets (call on init + resize)
  const cacheOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    if (useWindowScroll) {
      // Temporarily clear all transforms so getBoundingClientRect returns natural position
      cards.forEach(el => { el.style.transform = "none"; });
      cardOffsetsRef.current = cards.map(el => el.getBoundingClientRect().top + window.scrollY);
      // Cache end element offset too
      const endEl = document.querySelector<HTMLElement>(".scroll-stack-end");
      endOffsetRef.current = endEl ? endEl.getBoundingClientRect().top + window.scrollY : 0;
      // Restore GPU layer
      cards.forEach(el => { el.style.transform = "translate3d(0,0,0)"; });
    } else {
      // offsetTop is not affected by CSS transforms — safe to use directly
      const scroller = scrollerRef.current;
      cardOffsetsRef.current = cards.map(el => el.offsetTop);
      const endEl = scroller?.querySelector<HTMLElement>(".scroll-stack-end");
      endOffsetRef.current = endEl ? endEl.offsetTop : 0;
    }
  }, [useWindowScroll]);

  const applyTransforms = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length || !cardOffsetsRef.current.length) return;

    const { itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, blurAmount, onStackComplete } = propsRef.current;

    const scrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0);
    const containerHeight = useWindowScroll ? window.innerHeight : (scrollerRef.current?.clientHeight ?? 0);

    const stackPx    = parsePercentage(stackPosition, containerHeight);
    const scaleEndPx = parsePercentage(scaleEndPosition, containerHeight);
    const endTop     = endOffsetRef.current;

    cards.forEach((card, i) => {
      // Use CACHED natural offset — not getBoundingClientRect()
      const cardTop    = cardOffsetsRef.current[i];
      const pinStart   = cardTop - stackPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPx;
      const pinEnd     = endTop - containerHeight / 2;

      // Scale: 0 when not yet stacking → 1 when fully stacked
      const sp = scrollTop < pinStart ? 0 : scrollTop > triggerEnd ? 1 : (scrollTop - pinStart) / (triggerEnd - pinStart);
      const scale    = 1 - sp * (1 - (baseScale + i * itemScale));
      const rotation = rotationAmount ? i * rotationAmount * sp : 0;

      // Blur for cards behind the top-most active card
      let blur = 0;
      if (blurAmount) {
        let topIdx = 0;
        for (let j = 0; j < cards.length; j++) {
          if (scrollTop >= cardOffsetsRef.current[j] - stackPx - itemStackDistance * j) topIdx = j;
        }
        if (i < topIdx) blur = Math.max(0, (topIdx - i) * blurAmount);
      }

      // Pin: stick card at its stacked position while scrolling
      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;
      }

      card.style.transform = `translate3d(0,${translateY}px,0) scale(${scale})${rotation ? ` rotate(${rotation}deg)` : ""}`;
      if (blurAmount) card.style.filter = blur > 0 ? `blur(${blur}px)` : "";

      if (i === cards.length - 1) {
        const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (inView && !stackCompletedRef.current) { stackCompletedRef.current = true; onStackComplete?.(); }
        else if (!inView) stackCompletedRef.current = false;
      }
    });
  }, [useWindowScroll, parsePercentage]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const root = useWindowScroll ? document : scroller;
    const selector = ".scroll-stack-card";
    const cards = Array.from(root.querySelectorAll<HTMLElement>(selector));
    cardsRef.current = cards;

    // Init cards — clear transforms FIRST before caching offsets
    cards.forEach(el => {
      el.style.transform = "none";
      el.style.willChange = "transform";
      el.style.transformOrigin = "top center";
      el.style.zIndex = "1"; // same z-index; DOM order handles stacking
    });

    cards.forEach((el, i) => {
      if (i < cards.length - 1) el.style.marginBottom = `${itemDistance}px`;
    });

    // Cache natural offsets (transforms are "none" right now)
    cacheOffsets();

    // Re-cache on resize since card positions change
    const onResize = () => cacheOffsets();
    window.addEventListener("resize", onResize, { passive: true });

    if (useWindowScroll) {
      // RAF loop — reads window.scrollY every frame, always current
      const loop = () => {
        applyTransforms();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", onResize);
        cardsRef.current = [];
        cardOffsetsRef.current = [];
        stackCompletedRef.current = false;
      };
    } else {
      const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector<HTMLElement>(".scroll-stack-inner")!,
        duration: 1.2,
        easing,
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      const loop = (time: number) => {
        lenis.raf(time);
        applyTransforms();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", onResize);
        lenis.destroy();
        lenisRef.current = null;
        cardsRef.current = [];
        cardOffsetsRef.current = [];
        stackCompletedRef.current = false;
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDistance, useWindowScroll, applyTransforms, cacheOffsets]);

  const modeClass = useWindowScroll ? "scroll-stack-scroller--window" : "scroll-stack-scroller--internal";

  return (
    <div className={`scroll-stack-scroller ${modeClass} ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
