import { ResponsiveView } from "@/components/ui/ResponsiveView";
import { DesktopDashboard } from "@/components/app/desktop/DesktopDashboard";
import { MobileDashboard } from "@/components/app/mobile/MobileDashboard";

export default function GroupsPage() {
  return <ResponsiveView mobile={<MobileDashboard />} desktop={<DesktopDashboard />} />;
}
