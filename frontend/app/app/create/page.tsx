"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopCreateGroup } from "@/components/app/desktop/DesktopCreateGroup";
import { MobileCreateGroup } from "@/components/app/mobile/MobileCreateGroup";

export default function CreateGroupPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileCreateGroup /> : <DesktopCreateGroup />;
}
