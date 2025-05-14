import {
  TMDBMovieDetails,
  TMDBSearchResult,
  TMDBCastMember,
  TMDBGenre,
} from "./types";

class TMDBApiService {
  private apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  private apiUrl = process.env.NEXT_PUBLIC_TMDB_API_URL;
  private imageUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

  constructor() {
    if (!this.apiKey || !this.apiUrl || !this.imageUrl) {
      console.error(
        "TMDB API configuration is missing. Please check your .env file.",
      );
    }
  }

  /**
   * Generic fetch method with error handling
   */
  private async fetchFromTMDB<T>(
    endpoint: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const queryParams = new URLSearchParams({
      ...params,
    });
    const url = `${this.apiUrl}${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      throw error;
    }
  }

  /**
   * Get the full image URL from a path
   */
  getImageUrl(path: string | null, size: string = "w500"): string | null {
    if (!path) return null;
    return `${this.imageUrl}/${size}${path}`;
  }

  /**
   * Search for movies
   */
  async searchMovies(
    query: string,
    page: number = 1,
  ): Promise<TMDBSearchResult> {
    return this.fetchFromTMDB<TMDBSearchResult>("/search/movie", {
      query,
      page: page.toString(),
      include_adult: "false",
    });
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchFromTMDB<TMDBSearchResult>("/movie/popular", {
      page: page.toString(),
    });
  }

  /**
   * Get now playing movies
   */
  async getNowPlayingMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchFromTMDB<TMDBSearchResult>("/movie/now_playing", {
      page: page.toString(),
    });
  }

  /**
   * Get top rated movies
   */
  async getTopRatedMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchFromTMDB<TMDBSearchResult>("/movie/top_rated", {
      page: page.toString(),
    });
  }

  /**
   * Get movie details
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    return this.fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
      append_to_response: "credits",
    });
  }

  /**
   * Get movie genres
   */
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.fetchFromTMDB<{ genres: TMDBGenre[] }>("/genre/movie/list");
  }

  /**
   * Get director for a movie from its credits
   */
  getDirector(movieDetails: TMDBMovieDetails): string {
    const director = movieDetails.credits.crew.find(
      (crew) => crew.job === "Director",
    );
    return director ? director.name : "Unknown";
  }

  /**
   * Get cast members for a movie
   */
  getCast(
    movieDetails: TMDBMovieDetails,
    limit: number = 10,
  ): TMDBCastMember[] {
    return movieDetails.credits.cast
      .sort((a, b) => a.order - b.order)
      .slice(0, limit);
  }
}

// Export a singleton instance
export const tmdbApi = new TMDBApiService();
