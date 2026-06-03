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
  scaleDuration?: number;
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<Element[]>([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%"))
      return (parseFloat(value) / 100) * containerHeight;
    return parseFloat(value as string);
  }, []);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) return { scrollTop: window.scrollY, containerHeight: window.innerHeight };
    const s = scrollerRef.current!;
    return { scrollTop: s.scrollTop, containerHeight: s.clientHeight };
  }, [useWindowScroll]);

  const getElementOffset = useCallback((el: Element) => {
    if (useWindowScroll) return el.getBoundingClientRect().top + window.scrollY;
    return (el as HTMLElement).offsetTop;
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPx = parsePercentage(scaleEndPosition, containerHeight);
    const endEl = useWindowScroll
      ? document.querySelector(".scroll-stack-end")
      : scrollerRef.current?.querySelector(".scroll-stack-end");
    const endTop = endEl ? getElementOffset(endEl) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPx;
      const pinStart = triggerStart;
      const pinEnd = endTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topIdx = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jTop = getElementOffset(cardsRef.current[j]) - stackPx - itemStackDistance * j;
          if (scrollTop >= jTop) topIdx = j;
        }
        if (i < topIdx) blur = Math.max(0, (topIdx - i) * blurAmount);
      }

      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      let translateY = 0;
      if (isPinned) translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
      else if (scrollTop > pinEnd) translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;

      const nt = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };
      const lt = lastTransformsRef.current.get(i);
      const changed = !lt
        || Math.abs(lt.translateY - nt.translateY) > 0.1
        || Math.abs(lt.scale - nt.scale) > 0.001
        || Math.abs(lt.rotation - nt.rotation) > 0.1
        || Math.abs(lt.blur - nt.blur) > 0.1;

      if (changed) {
        (card as HTMLElement).style.transform = `translate3d(0,${nt.translateY}px,0) scale(${nt.scale}) rotate(${nt.rotation}deg)`;
        (card as HTMLElement).style.filter = nt.blur > 0 ? `blur(${nt.blur}px)` : "";
        lastTransformsRef.current.set(i, nt);
      }

      if (i === cardsRef.current.length - 1) {
        const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (inView && !stackCompletedRef.current) { stackCompletedRef.current = true; onStackComplete?.(); }
        else if (!inView && stackCompletedRef.current) stackCompletedRef.current = false;
      }
    });
    isUpdatingRef.current = false;
  }, [itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete, calculateProgress, parsePercentage, getScrollData, getElementOffset]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : scroller.querySelectorAll(".scroll-stack-card")
    );
    cardsRef.current = cards;
    const tc = lastTransformsRef.current;

    cards.forEach((card, i) => {
      const el = card as HTMLElement;
      if (i < cards.length - 1) el.style.marginBottom = `${itemDistance}px`;
      el.style.willChange = "transform, filter";
      el.style.transformOrigin = "top center";
    });

    const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
    const lenis = useWindowScroll
      ? new Lenis({ duration: 1.2, easing, smoothWheel: true })
      : new Lenis({ wrapper: scroller, content: scroller.querySelector(".scroll-stack-inner") as HTMLElement, duration: 1.2, easing, smoothWheel: true });

    lenis.on("scroll", updateCardTransforms);
    const raf = (time: number) => { lenis.raf(time); animationFrameRef.current = requestAnimationFrame(raf); };
    animationFrameRef.current = requestAnimationFrame(raf);
    lenisRef.current = lenis;
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lenis.destroy();
      cardsRef.current = [];
      tc.clear();
      stackCompletedRef.current = false;
      isUpdatingRef.current = false;
    };
  }, [itemDistance, itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, rotationAmount, blurAmount, useWindowScroll, updateCardTransforms]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
