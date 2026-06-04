import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="px-4 md:px-6 py-8 max-w-[88rem] mx-auto">
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}
