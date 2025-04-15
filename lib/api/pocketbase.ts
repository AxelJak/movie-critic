import PocketBase, { Record } from 'pocketbase';
import { 
  User, 
  Movie, 
  CastMember, 
  Review, 
  Watchlist, 
  WatchlistMovie,
  TMDBMovie,
  TMDBCastMember
} from './types';
import { tmdbApi } from './tmdb';

// Type for expand params
type ExpandParams = {
  [key: string]: boolean | string[];
};

class PocketBaseService {
  private pb: PocketBase;
  private static instance: PocketBaseService;

  constructor() {
    this.pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    
    // Load auth data from localStorage when in browser
    if (typeof window !== 'undefined') {
      this.pb.authStore.loadFromCookie(document.cookie);
      
      // Add auth state change listener
      this.pb.authStore.onChange(() => {
        document.cookie = this.pb.authStore.exportToCookie({ httpOnly: false });
      });
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
    return this.isAuthenticated ? this.pb.authStore.model as unknown as User : null;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<User> {
    const user = await this.pb.collection('users').create<User>({
      email,
      password,
      passwordConfirm: password,
      name
    });
    
    // Auto login after registration
    await this.login(email, password);
    
    return user;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<User> {
    await this.pb.collection('users').authWithPassword(email, password);
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
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    const userId = this.currentUser?.id;
    const user = await this.pb.collection('users').update<User>(userId!, data);
    
    return user;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(file: File): Promise<User> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const userId = this.currentUser?.id;
    const user = await this.pb.collection('users').update<User>(userId!, formData);
    
    return user;
  }

  /**
   * Sync movie from TMDB to our database
   */
  async syncMovieFromTMDB(tmdbId: number): Promise<Movie> {
    // First, check if movie already exists
    try {
      const existingMovie = await this.pb.collection('movies').getFirstListItem<Movie>(`tmdb_id=${tmdbId}`);
      
      // If it exists but was last synced more than 7 days ago, update it
      const lastSynced = new Date(existingMovie.last_synced);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (lastSynced < sevenDaysAgo) {
        return this.updateMovieFromTMDB(tmdbId, existingMovie.id);
      }
      
      return existingMovie;
    } catch (error) {
      // Movie doesn't exist, fetch and create it
      const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
      const director = tmdbApi.getDirector(tmdbMovie);
      
      // Create movie in PocketBase
      const movie = await this.pb.collection('movies').create<Movie>({
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
        last_synced: new Date().toISOString()
      });
      
      // Sync cast members
      await this.syncCastMembers(movie.id, tmdbMovie.id, tmdbApi.getCast(tmdbMovie));
      
      return movie;
    }
  }

  /**
   * Update movie data from TMDB
   */
  private async updateMovieFromTMDB(tmdbId: number, movieId: string): Promise<Movie> {
    const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
    const director = tmdbApi.getDirector(tmdbMovie);
    
    // Update movie in PocketBase
    const movie = await this.pb.collection('movies').update<Movie>(movieId, {
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
      last_synced: new Date().toISOString()
    });
    
    // Sync cast members (delete old ones and create new ones)
    await this.pb.collection('cast_members').deleteMany(`movie="${movieId}"`);
    await this.syncCastMembers(movie.id, tmdbMovie.id, tmdbApi.getCast(tmdbMovie));
    
    return movie;
  }

  /**
   * Sync cast members for a movie
   */
  private async syncCastMembers(movieId: string, tmdbId: number, cast: TMDBCastMember[]): Promise<void> {
    const promises = cast.map(member => {
      return this.pb.collection('cast_members').create<CastMember>({
        movie: movieId,
        tmdb_id: member.id,
        name: member.name,
        character: member.character,
        profile_path: member.profile_path,
        order: member.order
      });
    });
    
    await Promise.all(promises);
  }

  /**
   * Get movie by ID with optional expanded relations
   */
  async getMovie(id: string, expand?: ExpandParams): Promise<Movie> {
    return this.pb.collection('movies').getOne<Movie>(id, { expand });
  }

  /**
   * Get movie by TMDB ID
   */
  async getMovieByTmdbId(tmdbId: number, expand?: ExpandParams): Promise<Movie> {
    try {
      return await this.pb.collection('movies').getFirstListItem<Movie>(`tmdb_id=${tmdbId}`, { expand });
    } catch (error) {
      // If movie doesn't exist, sync it from TMDB
      return this.syncMovieFromTMDB(tmdbId);
    }
  }

  /**
   * Search movies
   */
  async searchMovies(query: string, page: number = 1, perPage: number = 20): Promise<Record[]> {
    return this.pb.collection('movies').getList(page, perPage, {
      filter: `title ~ "${query}" || original_title ~ "${query}"`,
      sort: '-created'
    });
  }

  /**
   * Get recent movies
   */
  async getRecentMovies(page: number = 1, perPage: number = 20): Promise<Record[]> {
    return this.pb.collection('movies').getList(page, perPage, {
      sort: '-created'
    });
  }

  /**
   * Get cast for a movie
   */
  async getMovieCast(movieId: string): Promise<CastMember[]> {
    const result = await this.pb.collection('cast_members').getList<CastMember>(1, 50, {
      filter: `movie="${movieId}"`,
      sort: 'order'
    });
    
    return result.items;
  }

  /**
   * Create a review
   */
  async createReview(movieId: string, rating: number, title?: string, content?: string, containsSpoilers: boolean = false): Promise<Review> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    return this.pb.collection('reviews').create<Review>({
      user: this.currentUser?.id,
      movie: movieId,
      rating,
      title: title || '',
      content: content || '',
      contains_spoilers: containsSpoilers
    });
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, data: Partial<Review>): Promise<Review> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    return this.pb.collection('reviews').update<Review>(reviewId, data);
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    await this.pb.collection('reviews').delete(reviewId);
    return true;
  }

  /**
   * Get reviews for a movie
   */
  async getMovieReviews(movieId: string, page: number = 1, perPage: number = 20): Promise<Record[]> {
    return this.pb.collection('reviews').getList(page, perPage, {
      filter: `movie="${movieId}"`,
      sort: '-created',
      expand: 'user'
    });
  }

  /**
   * Get user's review for a movie
   */
  async getUserReviewForMovie(movieId: string): Promise<Review | null> {
    if (!this.isAuthenticated) return null;
    
    try {
      return await this.pb.collection('reviews').getFirstListItem<Review>(
        `movie="${movieId}" && user="${this.currentUser?.id}"`
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Get average rating for a movie
   */
  async getMovieAverageRating(movieId: string): Promise<number> {
    const result = await this.pb.send<{ avg: number }>('/api/custom/avg_movie_rating', {
      method: 'GET',
      params: { movieId }
    });
    
    return result.avg || 0;
  }

  /**
   * Create a watchlist
   */
  async createWatchlist(name: string, description: string = '', isPublic: boolean = false): Promise<Watchlist> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    return this.pb.collection('watchlists').create<Watchlist>({
      user: this.currentUser?.id,
      name,
      description,
      is_public: isPublic
    });
  }

  /**
   * Update a watchlist
   */
  async updateWatchlist(watchlistId: string, data: Partial<Watchlist>): Promise<Watchlist> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    return this.pb.collection('watchlists').update<Watchlist>(watchlistId, data);
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(watchlistId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    await this.pb.collection('watchlists').delete(watchlistId);
    return true;
  }

  /**
   * Get user's watchlists
   */
  async getUserWatchlists(): Promise<Watchlist[]> {
    if (!this.isAuthenticated) return [];
    
    const result = await this.pb.collection('watchlists').getList<Watchlist>(1, 100, {
      filter: `user="${this.currentUser?.id}"`,
      sort: 'name'
    });
    
    return result.items;
  }

  /**
   * Add movie to watchlist
   */
  async addMovieToWatchlist(watchlistId: string, movieId: string, notes: string = ''): Promise<WatchlistMovie> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    return this.pb.collection('watchlist_movies').create<WatchlistMovie>({
      watchlist: watchlistId,
      movie: movieId,
      notes
    });
  }

  /**
   * Remove movie from watchlist
   */
  async removeMovieFromWatchlist(watchlistMovieId: string): Promise<boolean> {
    if (!this.isAuthenticated) throw new Error('User not authenticated');
    
    await this.pb.collection('watchlist_movies').delete(watchlistMovieId);
    return true;
  }

  /**
   * Get movies in a watchlist
   */
  async getWatchlistMovies(watchlistId: string, page: number = 1, perPage: number = 20): Promise<Record[]> {
    return this.pb.collection('watchlist_movies').getList(page, perPage, {
      filter: `watchlist="${watchlistId}"`,
      sort: '-created',
      expand: 'movie'
    });
  }

  /**
   * Check if a movie is in a user's watchlist
   */
  async isMovieInWatchlist(movieId: string, watchlistId: string): Promise<WatchlistMovie | null> {
    if (!this.isAuthenticated) return null;
    
    try {
      return await this.pb.collection('watchlist_movies').getFirstListItem<WatchlistMovie>(
        `movie="${movieId}" && watchlist="${watchlistId}"`
      );
    } catch (error) {
      return null;
    }
  }
}

// Export a singleton instance
export const pbApi = PocketBaseService.getInstance();
