import { Shield } from "lucide-react";

export function ReputationBadge({ label, earned }: { label: string; earned: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        earned
          ? "bg-[#86EFAC] text-black border-[#4ADE80]"
          : "bg-white text-black/30 border-black/10"
      }`}
    >
      <Shield className={`w-4 h-4 ${earned ? "text-black" : "text-black/20"}`} />
      {label}
    </div>
  );
}
