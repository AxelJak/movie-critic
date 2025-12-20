import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Movies</h1>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="flex w-full md:w-[50%] justify-between gap-2 mb-8">
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5 w-full max-w-7xl">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="h-full p-0 gap-0 overflow-hidden">
            <div className="w-full h-[375px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
