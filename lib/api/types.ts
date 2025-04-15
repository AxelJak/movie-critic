/**
 * TMDB Types
 */
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  overview: string;
  vote_average: number;
  genres: TMDBGenre[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBMovieDetails extends TMDBMovie {
  credits: TMDBCredits;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * PocketBase Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created: string;
  updated: string;
}

export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  overview: string;
  tmdb_rating: number;
  director: string;
  genres: TMDBGenre[];
  last_synced: string;
  created: string;
  updated: string;
}

export interface CastMember {
  id: string;
  movie: string;
  tmdb_id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  created: string;
  updated: string;
}

export interface Review {
  id: string;
  user: string;
  movie: string;
  rating: number;
  title: string;
  content: string;
  contains_spoilers: boolean;
  created: string;
  updated: string;
}

export interface Watchlist {
  id: string;
  user: string;
  name: string;
  description: string;
  is_public: boolean;
  created: string;
  updated: string;
}

export interface WatchlistMovie {
  id: string;
  watchlist: string;
  movie: string;
  notes: string;
  created: string;
  updated: string;
}
