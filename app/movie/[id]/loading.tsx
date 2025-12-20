import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="container relative z-10 flex flex-col sm:flex-row items-center gap-6 h-full pb-8">
          <div className="flex-shrink-0 md:w-48 aspect-[2/3] bg-gray-300 dark:bg-gray-700 mt-auto rounded-md" />
          <div className="flex flex-col mt-auto space-y-4 w-full max-w-md">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-4 h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <Card className="p-4 h-64 bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
