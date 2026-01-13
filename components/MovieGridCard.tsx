import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  MoviesResponse,
  ReviewsResponse,
  MoviesRecord,
  UsersResponse,
} from "@/lib/api/pocketbase-types";
import { tmdbApi } from "@/lib/api/tmdb";

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[];
}
interface UserExpand {
  user: UsersResponse;
}

interface MovieGridCardProps {
  movie: MoviesResponse<MoviesRecord, Expand>;
}

// Shimmer effect for loading placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function MovieGridCard({ movie }: MovieGridCardProps) {
  const siteRating =
    movie.expand.reviews_via_movie.length > 0
      ? movie.expand.reviews_via_movie.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / movie.expand.reviews_via_movie.length
      : 0;

  return (
    <Card className="overflow-hidden gap-2 h-full flex flex-col hover:shadow-lg transition-shadow p-0">
      <Link href={`/movie/${movie.tmdb_id}`} className="cursor-pointer">
        <div className="relative w-full aspect-[2/3]">
          <Image
            src={tmdbApi.getImageUrl(movie.poster_path, "w500") ?? ""}
            alt={movie.title}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(333, 500))}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>
      <CardFooter className="flex flex-col gap-1 px-2 py-1 pb-2 sm:px-2.5 sm:pb-2 text-xs">
        <div className="flex justify-between w-full">
          <span className="text-muted-foreground">TMDB:</span>
          <span className="font-semibold">{Math.round(movie.tmdb_rating * 10) / 10}</span>
        </div>
        <div className="flex justify-between w-full">
          <span className="text-muted-foreground">Our:</span>
          <span className="font-semibold">{Math.round(siteRating * 10) / 10}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
