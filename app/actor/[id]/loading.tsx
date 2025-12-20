import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActorLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative w-full bg-gradient-to-b from-gray-900 to-background">
        <div className="container relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 py-8 sm:py-12 px-4 sm:px-6">
          <Skeleton className="flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-square rounded-full" />
          <div className="flex flex-col text-center sm:text-left gap-2">
            <Skeleton className="h-8 sm:h-10 md:h-12 w-48 sm:w-64 md:w-80" />
            <Skeleton className="h-4 sm:h-5 w-32 sm:w-48" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Biography Skeleton */}
            <div>
              <Skeleton className="h-7 w-32 mb-3 sm:mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Filmography Skeleton */}
            <div>
              <Skeleton className="h-7 w-48 mb-3 sm:mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-2 sm:p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
              <Skeleton className="h-7 w-32" />
              <Card className="p-4 sm:p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
