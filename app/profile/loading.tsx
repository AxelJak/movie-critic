import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar Skeleton */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse" />
              <div className="w-full mt-4 space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className="md:col-span-2">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <Card className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
