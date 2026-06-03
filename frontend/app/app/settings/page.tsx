import { ResponsiveView } from "@/components/ui/ResponsiveView";
import { DesktopSettings } from "@/components/app/desktop/DesktopSettings";
import { MobileSettings } from "@/components/app/mobile/MobileSettings";

export default function SettingsPage() {
  return <ResponsiveView mobile={<MobileSettings />} desktop={<DesktopSettings />} />;
}
