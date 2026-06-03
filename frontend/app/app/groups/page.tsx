"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopDashboard } from "@/components/app/desktop/DesktopDashboard";
import { MobileDashboard } from "@/components/app/mobile/MobileDashboard";

export default function GroupsPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
