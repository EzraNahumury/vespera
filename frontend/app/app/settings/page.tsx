"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopSettings } from "@/components/app/desktop/DesktopSettings";
import { MobileSettings } from "@/components/app/mobile/MobileSettings";

export default function SettingsPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSettings /> : <DesktopSettings />;
}
