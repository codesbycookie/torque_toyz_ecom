import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}