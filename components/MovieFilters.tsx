"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type FilterType = "popular" | "now-playing" | "top-rated";

interface MovieFiltersProps {
  currentFilter: FilterType;
}

export default function MovieFilters({ currentFilter }: MovieFiltersProps) {
  return (
    <div className="flex w-full md:w-[50%] justify-between gap-2">
      <Button
        asChild
        variant={currentFilter === "popular" ? "default" : "outline"}
        className="flex-1"
      >
        <Link href="/movies?filter=popular">Popular</Link>
      </Button>
      <Button
        asChild
        variant={currentFilter === "now-playing" ? "default" : "outline"}
        className="flex-1"
      >
        <Link href="/movies?filter=now-playing">Now Playing</Link>
      </Button>
      <Button
        asChild
        variant={currentFilter === "top-rated" ? "default" : "outline"}
        className="flex-1"
      >
        <Link href="/movies?filter=top-rated">Top Rated</Link>
      </Button>
    </div>
  );
}
