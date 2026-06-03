"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopGroupDetail } from "@/components/app/desktop/DesktopGroupDetail";
import { MobileGroupDetail } from "@/components/app/mobile/MobileGroupDetail";
import { use } from "react";

export default function GroupDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const isMobile = useIsMobile();
  const addr = address as `0x${string}`;
  return isMobile ? <MobileGroupDetail address={addr} /> : <DesktopGroupDetail address={addr} />;
}
