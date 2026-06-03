import { ResponsiveView } from "@/components/ui/ResponsiveView";
import { DesktopDashboard } from "@/components/app/desktop/DesktopDashboard";
import { MobileDashboard } from "@/components/app/mobile/MobileDashboard";

export default function DashboardPage() {
  return <ResponsiveView mobile={<MobileDashboard />} desktop={<DesktopDashboard />} />;
}
