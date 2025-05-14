import PocketBase, { Record, ListResult } from "pocketbase";
import {
  User,
  Movie,
  CastMember,
  Review,
  Watchlist,
  WatchlistMovie,
  TMDBMovie,
  TMDBCastMember,
} from "./types";
import { tmdbApi } from "./tmdb";

// Type for expand params
type ExpandParams = {
  [key: string]: boolean | string[];
};

class PocketBaseService {
  private pb: PocketBase;
  private static instance: PocketBaseService;

  constructor() {
    if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
      console.error(
        "NEXT_PUBLIC_POCKETBASE_URL is not defined in environment variables",
      );
      throw new Error("PocketBase URL is missing in environment variables");
    }

    try {
      this.pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

      // Load auth data from localStorage when in browser
      if (typeof window !== "undefined") {
        this.pb.authStore.loadFromCookie(document.cookie);

        // Add auth state change listener
        this.pb.authStore.onChange(() => {
          document.cookie = this.pb.authStore.exportToCookie({
            httpOnly: false,
          });
        });
      }
    } catch (error) {
      console.error("Error initializing PocketBase:", error);
      throw new Error("Failed to initialize PocketBase client");
    }
  }

  /**
   * Get PocketBase instance
   */
  static getInstance(): PocketBaseService {
    if (!PocketBaseService.instance) {
      PocketBaseService.instance = new PocketBaseService();
    }
    return PocketBaseService.instance;
  }

  /**
   * Get PocketBase client
   */
  get client(): PocketBase {
    return this.pb;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.isAuthenticated
      ? (this.pb.authStore.model as unknown as User)
      : null;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<User> {
    const user = await this.pb.collection("users").create<User>({
      email,
      password,
      passwordConfirm: password,
      name,
    });

    // Auto login after registration
    await this.login(email, password);

    return user;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<User> {
    await this.pb.collection("users").authWithPassword(email, password);
    return this.currentUser as User;
  }

  /**
   * Login with OAuth (Google, Apple)
   */
  async loginWithOAuth(provider: "google" | "apple"): Promise<void> {
    // Get the authorization URL for the provider
    const authMethods = await this.pb.collection("users").listAuthMethods();

    // Find the auth method for the requested provider
    const authProvider = authMethods.authProviders.find(
      (p) => p.name === provider,
    );

    if (!authProvider) {
      throw new Error(`Auth provider ${provider} not found or not enabled.`);
    }

    // Prepare the redirect URL (current URL)
    const redirectUrl = window.location.origin + "/login";

    // Redirect to the provider's authorization page
    const url = new URL(authProvider.authUrl);

    // Add the redirect URL
    url.searchParams.set("redirect_uri", redirectUrl);

    // Store the provider info in localStorage for the callback to use
    localStorage.setItem(
      "oauthProvider",
      JSON.stringify({
        name: provider,
        state: authProvider.state,
        codeVerifier: authProvider.codeVerifier,
      }),
    );

    // Redirect to the authorization URL
    window.location.href = url.toString();
  }

  /**
   * Complete OAuth authentication after redirect
   */
  async completeOAuthLogin(code: string): Promise<User> {
    // Get the stored provider info
    const providerInfo = JSON.parse(
      localStorage.getItem("oauthProvider") || "{}",
    );

    if (!providerInfo.name) {
      throw new Error("No OAuth provider information found.");
    }

    // Prepare the redirect URL (should be the same as the one used in the authorization request)
    const redirectUrl = window.location.origin + "/login";

    // Complete the authentication
    await this.pb
      .collection("users")
      .authWithOAuth2(
        providerInfo.name,
        code,
        providerInfo.codeVerifier,
        redirectUrl,
      );

    // Clean up localStorage
    localStorage.removeItem("oauthProvider");

    return this.currentUser as User;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.pb.authStore.clear();
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    const userId = this.currentUser?.id;
    const user = await this.pb.collection("users").update<User>(userId!, data);

    return user;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(file: File): Promise<User> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append("avatar", file);

    const userId = this.currentUser?.id;
    const user = await this.pb
      .collection("users")
      .update<User>(userId!, formData);

    return user;
  }

  /**
   * Sync movie from TMDB to our database
   */
  async syncMovieFromTMDB(tmdbId: number): Promise<Movie> {
    // First, check if movie already exists
    try {
      const existingMovie = await this.pb
        .collection("movies")
        .getFirstListItem<Movie>(`tmdb_id=${tmdbId}`);

      // If it exists but was last synced more than 7 days ago, update it
      const lastSynced = new Date(existingMovie.last_synced);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (lastSynced < sevenDaysAgo) {
        return this.updateMovieFromTMDB(tmdbId, existingMovie.id);
      }

      return existingMovie;
    } catch (error) {
      console.log("Movie doesn't exist, creating it from TMDB:", tmdbId);

      try {
        // Movie doesn't exist, fetch and create it
        const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
        const director = tmdbApi.getDirector(tmdbMovie);

        console.log("Got TMDB movie details:", {
          id: tmdbMovie.id,
          title: tmdbMovie.title,
        });

        // Create movie in PocketBase
        const movie = await this.pb.collection("movies").create<Movie>({
          tmdb_id: tmdbMovie.id,
          title: tmdbMovie.title,
          original_title: tmdbMovie.original_title,
          poster_path: tmdbMovie.poster_path,
          backdrop_path: tmdbMovie.backdrop_path,
          release_date: tmdbMovie.release_date,
          runtime: tmdbMovie.runtime,
          overview: tmdbMovie.overview,
          tmdb_rating: tmdbMovie.vote_average,
          director,
          genres: tmdbMovie.genres,
          last_synced: new Date().toISOString(),
        });

        console.log("Created movie in PocketBase:", movie.id);

        // Sync cast members
        await this.syncCastMembers(
          movie.id,
          tmdbMovie.id,
          tmdbApi.getCast(tmdbMovie),
        );

        return movie;
      } catch (syncError) {
        console.error("Error syncing movie from TMDB:", syncError);
        throw new Error(`Failed to sync movie from TMDB: ${syncError.message}`);
      }
    }
  }

  /**
   * Update movie data from TMDB
   */
  private async updateMovieFromTMDB(
    tmdbId: number,
    movieId: string,
  ): Promise<Movie> {
    const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
    const director = tmdbApi.getDirector(tmdbMovie);

    // Update movie in PocketBase
    const movie = await this.pb.collection("movies").update<Movie>(movieId, {
      title: tmdbMovie.title,
      original_title: tmdbMovie.original_title,
      poster_path: tmdbMovie.poster_path,
      backdrop_path: tmdbMovie.backdrop_path,
      release_date: tmdbMovie.release_date,
      runtime: tmdbMovie.runtime,
      overview: tmdbMovie.overview,
      tmdb_rating: tmdbMovie.vote_average,
      director,
      genres: tmdbMovie.genres,
      last_synced: new Date().toISOString(),
    });

    // Sync cast members (delete old ones and create new ones)
    await this.pb.collection("cast_members").deleteMany(`movie="${movieId}"`);
    await this.syncCastMembers(
      movie.id,
      tmdbMovie.id,
      tmdbApi.getCast(tmdbMovie),
    );

    return movie;
  }

  /**
   * Sync cast members for a movie
   */
  private async syncCastMembers(
    movieId: string,
    tmdbId: number,
    cast: TMDBCastMember[],
  ): Promise<void> {
    const promises = cast.map((member) => {
      return this.pb.collection("cast_members").create<CastMember>({
        movie: movieId,
        tmdb_id: member.id,
        name: member.name,
        character: member.character,
        profile_path: member.profile_path,
        order: member.order,
      });
    });

    await Promise.all(promises);
  }

  /**
   * Get movie by ID with optional expanded relations
   */
  async getMovie(id: string, expand?: ExpandParams): Promise<Movie> {
    return this.pb.collection("movies").getOne<Movie>(id, { expand });
  }

  /**
   * Get movie by TMDB ID
   */
  async getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined> {
    try {
      return await this.pb
        .collection("movies")
        .getFirstListItem<Movie>(`tmdb_id=${tmdbId}`);
    } catch (error) {
      console.log(error);
      // Check if PocketBase is properly initialized
      if (!this.pb || !process.env.NEXT_PUBLIC_POCKETBASE_URL) {
        console.error("PocketBase not properly initialized:", {
          pb: !!this.pb,
          url: process.env.NEXT_PUBLIC_POCKETBASE_URL,
        });
        throw new Error("PocketBase connection failed");
      }
    }
  }

  /**
   * Search movies
   */
  async searchMovies(
    query: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<ListResult<Movie>> {
    return this.pb.collection("movies").getList(page, perPage, {
      filter: `title ~ "${query}" || original_title ~ "${query}"`,
      sort: "-created",
    });
  }

  /**
   * Get recent movies
   */
  async getRecentMovies(
    page: number = 1,
    perPage: number = 20,
  ): Promise<ListResult<Movie>> {
    return this.pb.collection("movies").getList(page, perPage, {
      sort: "-created",
    });
  }

  /**
   * Get cast for a movie
   */
  async getMovieCast(movieId: string): Promise<CastMember[]> {
    const result = await this.pb
      .collection("cast_members")
      .getList<CastMember>(1, 50, {
        filter: `movie="${movieId}"`,
        sort: "order",
      });

    return result.items;
  }

  /**
   * Create a review
   */
  async createReview(
    movieId: string,
    rating: number,
    title?: string,
    content?: string,
    containsSpoilers: boolean = false,
  ): Promise<Review> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");
    return this.pb.collection("reviews").create<Review>({
      user: this.currentUser?.id,
      movie: movieId,
      rating,
      title: title || "",
      content: content || "",
      contains_spoilers: containsSpoilers,
    });
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, data: Partial<Review>): Promise<Review> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    return this.pb.collection("reviews").update<Review>(reviewId, data);
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    await this.pb.collection("reviews").delete(reviewId);
    return true;
  }

  /**
   * Get all reviews with pagintion
   */
  async getAllMovieReviews(
    page: number = 1,
    perPage: number = 20,
  ): Promise<ListResult<Review>> {
    return this.pb.collection("reviews").getList(page, perPage, {
      sort: "-created",
      expand: "user",
    });
  }

  /**
   * Get reviews for a movie
   */
  async getMovieReviews(
    movieId: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<ListResult<Movie>> {
    return await this.pb.collection("reviews").getList(page, perPage, {
      expand: "user",
      filter: `movie="${movieId}"`,
      sort: "-created",
    });
  }

  /**
   * Get user's review for a movie
   */
  async getUserReviewForMovie(movieId: string): Promise<Review | null> {
    if (!this.isAuthenticated) return null;

    try {
      return await this.pb
        .collection("reviews")
        .getFirstListItem<Review>(
          `movie="${movieId}" && user="${this.currentUser?.id}"`,
        );
    } catch (error) {
      return null;
    }
  }

  /**
   * Get average rating for a movie
   */
  async getMovieAverageRating(movieId: string): Promise<number> {
    const result = await this.pb.send<{ avg: number }>(
      "/api/custom/avg_movie_rating",
      {
        method: "GET",
        params: { movieId },
      },
    );

    return result.avg || 0;
  }

  /**
   * Create a watchlist
   */
  async createWatchlist(
    name: string,
    description: string = "",
    isPublic: boolean = false,
  ): Promise<Watchlist> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    return this.pb.collection("watchlists").create<Watchlist>({
      user: this.currentUser?.id,
      name,
      description,
      is_public: isPublic,
    });
  }

  /**
   * Update a watchlist
   */
  async updateWatchlist(
    watchlistId: string,
    data: Partial<Watchlist>,
  ): Promise<Watchlist> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    return this.pb
      .collection("watchlists")
      .update<Watchlist>(watchlistId, data);
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(watchlistId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    await this.pb.collection("watchlists").delete(watchlistId);
    return true;
  }

  /**
   * Get user's watchlists
   */
  async getUserWatchlists(): Promise<Watchlist[]> {
    if (!this.isAuthenticated) return [];

    const result = await this.pb
      .collection("watchlists")
      .getList<Watchlist>(1, 100, {
        filter: `user="${this.currentUser?.id}"`,
        sort: "name",
      });

    return result.items;
  }

  /**
   * Add movie to watchlist
   */
  async addMovieToWatchlist(
    watchlistId: string,
    movieId: string,
    notes: string = "",
  ): Promise<WatchlistMovie> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    return this.pb.collection("watchlist_movies").create<WatchlistMovie>({
      watchlist: watchlistId,
      movie: movieId,
      notes,
    });
  }

  /**
   * Remove movie from watchlist
   */
  async removeMovieFromWatchlist(watchlistMovieId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error("User not authenticated");

    await this.pb.collection("watchlist_movies").delete(watchlistMovieId);
    return true;
  }

  /**
   * Get movies in a watchlist
   */
  async getWatchlistMovies(
    watchlistId: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<Record[]> {
    return this.pb.collection("watchlist_movies").getList(page, perPage, {
      filter: `watchlist="${watchlistId}"`,
      sort: "-created",
      expand: "movie",
    });
  }

  /**
   * Check if a movie is in a user's watchlist
   */
  async isMovieInWatchlist(
    movieId: string,
    watchlistId: string,
  ): Promise<WatchlistMovie | null> {
    if (!this.isAuthenticated) return null;

    try {
      return await this.pb
        .collection("watchlist_movies")
        .getFirstListItem<WatchlistMovie>(
          `movie="${movieId}" && watchlist="${watchlistId}"`,
        );
    } catch (error) {
      return null;
    }
  }
}

// Export a singleton instance
export const pbApi = PocketBaseService.getInstance();
