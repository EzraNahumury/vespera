import { ResponsiveView } from "@/components/ui/ResponsiveView";
import { DesktopGroupDetail } from "@/components/app/desktop/DesktopGroupDetail";
import { MobileGroupDetail } from "@/components/app/mobile/MobileGroupDetail";
import { use } from "react";

export default function GroupDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const addr = address as `0x${string}`;
  return (
    <ResponsiveView
      mobile={<MobileGroupDetail address={addr} />}
      desktop={<DesktopGroupDetail address={addr} />}
    />
  );
}
