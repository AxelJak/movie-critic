import { tmdbApi } from '@/lib/api/tmdb'
import { TMDBSearchResult, TMDBMovieDetails } from '@/lib/api/types'

// Mock environment variables
const originalEnv = process.env

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_TMDB_API_KEY: 'test-api-key',
    NEXT_PUBLIC_TMDB_API_URL: 'https://api.themoviedb.org/3',
    NEXT_PUBLIC_TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('TMDBApiService', () => {
  describe('getImageUrl', () => {
    test('returns full image URL with default size', () => {
      const path = '/abc123.jpg'
      const result = tmdbApi.getImageUrl(path)
      // Check that result contains the path and size
      expect(result).toContain('w500')
      expect(result).toContain('/abc123.jpg')
    })

    test('returns full image URL with custom size', () => {
      const path = '/abc123.jpg'
      const result = tmdbApi.getImageUrl(path, 'w200')
      expect(result).toContain('w200')
      expect(result).toContain('/abc123.jpg')
    })

    test('returns null for null path', () => {
      const result = tmdbApi.getImageUrl(null)
      expect(result).toBeNull()
    })

    test('returns null for empty path', () => {
      const result = tmdbApi.getImageUrl('')
      expect(result).toBeNull()
    })
  })

  describe('searchMovies', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('searches for movies successfully', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 1,
        results: [
          {
            id: 123,
            title: 'Test Movie',
            original_title: 'Test Movie',
            poster_path: '/test.jpg',
            backdrop_path: '/backdrop.jpg',
            release_date: '2025-01-01',
            runtime: 120,
            overview: 'A test movie',
            vote_average: 8.5,
            genres: [],
          },
        ],
        total_pages: 1,
        total_results: 1,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await tmdbApi.searchMovies('Test')

      expect(global.fetch).toHaveBeenCalled()
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('/search/movie')
      expect(result).toEqual(mockResponse)
    })

    test('includes query parameter in search', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.searchMovies('Inception')

      expect(global.fetch).toHaveBeenCalled()
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('query=Inception')
    })

    test('handles pagination', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 2,
        results: [],
        total_pages: 5,
        total_results: 100,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.searchMovies('Test', 2)

      expect(global.fetch).toHaveBeenCalled()
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('page=2')
    })

    test('throws error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(tmdbApi.searchMovies('Test')).rejects.toThrow(
        'TMDB API error: 404 Not Found'
      )
    })

    test('throws error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(tmdbApi.searchMovies('Test')).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('getPopularMovies', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('fetches popular movies', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 1,
        results: [],
        total_pages: 10,
        total_results: 200,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.getPopularMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/popular'),
        expect.any(Object)
      )
    })

    test('handles pagination for popular movies', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 3,
        results: [],
        total_pages: 10,
        total_results: 200,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.getPopularMovies(3)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=3'),
        expect.any(Object)
      )
    })
  })

  describe('getNowPlayingMovies', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('fetches now playing movies', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 1,
        results: [],
        total_pages: 5,
        total_results: 100,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.getNowPlayingMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/now_playing'),
        expect.any(Object)
      )
    })
  })

  describe('getTopRatedMovies', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('fetches top rated movies', async () => {
      const mockResponse: TMDBSearchResult = {
        page: 1,
        results: [],
        total_pages: 5,
        total_results: 100,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await tmdbApi.getTopRatedMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/top_rated'),
        expect.any(Object)
      )
    })
  })

  describe('getMovieDetails', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('fetches movie details with credits', async () => {
      const mockResponse: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [{ id: 1, name: 'Action' }],
        credits: {
          cast: [
            {
              id: 1,
              name: 'Actor Name',
              character: 'Character Name',
              profile_path: '/actor.jpg',
              order: 0,
            },
          ],
          crew: [
            {
              id: 2,
              name: 'Director Name',
              job: 'Director',
              department: 'Directing',
              profile_path: '/director.jpg',
            },
          ],
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await tmdbApi.getMovieDetails(123)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/123'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('append_to_response=credits'),
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getGenres', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('fetches movie genres', async () => {
      const mockResponse = {
        genres: [
          { id: 28, name: 'Action' },
          { id: 35, name: 'Comedy' },
          { id: 18, name: 'Drama' },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await tmdbApi.getGenres()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/genre/movie/list'),
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getDirector', () => {
    test('returns director name from credits', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: [],
          crew: [
            {
              id: 1,
              name: 'Christopher Nolan',
              job: 'Director',
              department: 'Directing',
              profile_path: '/nolan.jpg',
            },
            {
              id: 2,
              name: 'Producer Name',
              job: 'Producer',
              department: 'Production',
              profile_path: '/producer.jpg',
            },
          ],
        },
      }

      const director = tmdbApi.getDirector(movieDetails)
      expect(director).toBe('Christopher Nolan')
    })

    test('returns "Unknown" when no director found', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: [],
          crew: [
            {
              id: 2,
              name: 'Producer Name',
              job: 'Producer',
              department: 'Production',
              profile_path: '/producer.jpg',
            },
          ],
        },
      }

      const director = tmdbApi.getDirector(movieDetails)
      expect(director).toBe('Unknown')
    })

    test('returns first director when multiple directors exist', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: [],
          crew: [
            {
              id: 1,
              name: 'Director One',
              job: 'Director',
              department: 'Directing',
              profile_path: '/d1.jpg',
            },
            {
              id: 2,
              name: 'Director Two',
              job: 'Director',
              department: 'Directing',
              profile_path: '/d2.jpg',
            },
          ],
        },
      }

      const director = tmdbApi.getDirector(movieDetails)
      expect(director).toBe('Director One')
    })
  })

  describe('getCast', () => {
    test('returns sorted cast members by order', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: [
            {
              id: 3,
              name: 'Actor Three',
              character: 'Character C',
              profile_path: '/actor3.jpg',
              order: 2,
            },
            {
              id: 1,
              name: 'Actor One',
              character: 'Character A',
              profile_path: '/actor1.jpg',
              order: 0,
            },
            {
              id: 2,
              name: 'Actor Two',
              character: 'Character B',
              profile_path: '/actor2.jpg',
              order: 1,
            },
          ],
          crew: [],
        },
      }

      const cast = tmdbApi.getCast(movieDetails)
      expect(cast).toHaveLength(3)
      expect(cast[0].name).toBe('Actor One')
      expect(cast[1].name).toBe('Actor Two')
      expect(cast[2].name).toBe('Actor Three')
    })

    test('limits cast to specified number', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: Array.from({ length: 20 }, (_, i) => ({
            id: i,
            name: `Actor ${i}`,
            character: `Character ${i}`,
            profile_path: `/actor${i}.jpg`,
            order: i,
          })),
          crew: [],
        },
      }

      const cast = tmdbApi.getCast(movieDetails, 5)
      expect(cast).toHaveLength(5)
    })

    test('returns empty array when no cast available', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: [],
          crew: [],
        },
      }

      const cast = tmdbApi.getCast(movieDetails)
      expect(cast).toHaveLength(0)
    })

    test('uses default limit of 10', () => {
      const movieDetails: TMDBMovieDetails = {
        id: 123,
        title: 'Test Movie',
        original_title: 'Test Movie',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A test movie',
        vote_average: 8.5,
        genres: [],
        credits: {
          cast: Array.from({ length: 20 }, (_, i) => ({
            id: i,
            name: `Actor ${i}`,
            character: `Character ${i}`,
            profile_path: `/actor${i}.jpg`,
            order: i,
          })),
          crew: [],
        },
      }

      const cast = tmdbApi.getCast(movieDetails)
      expect(cast).toHaveLength(10)
    })
  })
})
