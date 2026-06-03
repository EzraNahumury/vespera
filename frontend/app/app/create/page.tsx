import { ResponsiveView } from "@/components/ui/ResponsiveView";
import { DesktopCreateGroup } from "@/components/app/desktop/DesktopCreateGroup";
import { MobileCreateGroup } from "@/components/app/mobile/MobileCreateGroup";

export default function CreateGroupPage() {
  return <ResponsiveView mobile={<MobileCreateGroup />} desktop={<DesktopCreateGroup />} />;
}
