"use client";
import { ReactNode, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  mobile: ReactNode;
  desktop: ReactNode;
}

export function ResponsiveView({ mobile, desktop }: Props) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render desktop by default until mounted (matches SSR)
  if (!mounted) return <>{desktop}</>;
  return <>{isMobile ? mobile : desktop}</>;
}
