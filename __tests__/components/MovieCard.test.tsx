import { render, screen } from '@testing-library/react'
import MovieCard from '@/components/MovieCard'
import { tmdbApi } from '@/lib/api/tmdb'
import {
  MoviesResponse,
  ReviewsResponse,
  MoviesRecord,
  UsersResponse,
} from '@/lib/api/pocketbase-types'

// Mock TMDB API
jest.mock('@/lib/api/tmdb', () => ({
  tmdbApi: {
    getImageUrl: jest.fn(),
  },
}))

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[]
}
interface UserExpand {
  user: UsersResponse
}

describe('MovieCard', () => {
  beforeEach(() => {
    ; (tmdbApi.getImageUrl as jest.Mock).mockImplementation(
      (path, size) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null)
    )
  })

  test('renders movie title and overview', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'This is a test movie overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('This is a test movie overview')).toBeInTheDocument()
  })

  test('displays TMDB rating', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.547,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    // Should round to one decimal place
    expect(screen.getByText(/TMDB rating: 8.5/)).toBeInTheDocument()
  })

  test('calculates and displays site rating with reviews', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [
          {
            id: 'review1',
            user: 'user1',
            movie: 'movie1',
            rating: 8,
            title: 'Great movie',
            content: 'I loved it',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user1',
                email: 'user1@test.com',
                name: 'User One',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
          {
            id: 'review2',
            user: 'user2',
            movie: 'movie1',
            rating: 6,
            title: 'Okay movie',
            content: 'It was fine',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user2',
                email: 'user2@test.com',
                name: 'User Two',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
        ],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    // Average of 8 and 6 is 7
    expect(screen.getByText(/Our rating: 7/)).toBeInTheDocument()
  })

  test('displays 0 for site rating when no reviews', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    expect(screen.getByText(/Our rating: 0/)).toBeInTheDocument()
  })

  test('renders review tabs when reviews exist', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [
          {
            id: 'review1',
            user: 'user1',
            movie: 'movie1',
            rating: 9,
            title: 'Amazing!',
            content: 'Best movie ever!',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user1',
                email: 'user1@test.com',
                name: 'John Doe',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
        ],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    // Check for overview tab
    expect(screen.getByText('Overview')).toBeInTheDocument()

    // Check for review tab with user name and rating
    expect(screen.getByText(/John Doe 9/)).toBeInTheDocument()
  })

  test('renders multiple review tabs', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [
          {
            id: 'review1',
            user: 'user1',
            movie: 'movie1',
            rating: 9,
            title: 'Great',
            content: 'First review',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user1',
                email: 'user1@test.com',
                name: 'Alice',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
          {
            id: 'review2',
            user: 'user2',
            movie: 'movie1',
            rating: 7,
            title: 'Good',
            content: 'Second review',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user2',
                email: 'user2@test.com',
                name: 'Bob',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
        ],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    // Check that both review tabs are rendered with user names and ratings
    expect(screen.getByText(/Alice 9/)).toBeInTheDocument()
    expect(screen.getByText(/Bob 7/)).toBeInTheDocument()
  })

  test('generates correct image URL', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test-poster.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    expect(tmdbApi.getImageUrl).toHaveBeenCalledWith('/test-poster.jpg', 'w500')
  })

  test('renders link to movie details page', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 456,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/movie/456')
  })

  test('rounds ratings to one decimal place', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.567,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      expand: {
        reviews_via_movie: [
          {
            id: 'review1',
            user: 'user1',
            movie: 'movie1',
            rating: 8.333,
            title: 'Test',
            content: 'Test',
            contains_spoilers: false,
            created: '2025-01-01',
            updated: '2025-01-01',
            collectionId: 'reviews',
            collectionName: 'reviews',
            expand: {
              user: {
                id: 'user1',
                email: 'user1@test.com',
                name: 'User',
                avatar: '',
                created: '2025-01-01',
                updated: '2025-01-01',
                collectionId: 'users',
                collectionName: 'users',
              },
            },
          },
        ],
      },
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    // 8.567 rounded to one decimal = 8.6
    expect(screen.getByText(/TMDB rating: 8.6/)).toBeInTheDocument()
    // 8.333 rounded to one decimal = 8.3
    expect(screen.getByText(/Our rating: 8.3/)).toBeInTheDocument()
  })

  test('renders safely when expand or reviews_via_movie is missing', async () => {
    const mockMovie: MoviesResponse<MoviesRecord, Expand> = {
      id: 'movie1',
      tmdb_id: 123,
      title: 'Test Movie',
      original_title: 'Test Movie',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      overview: 'Test overview',
      tmdb_rating: 8.5,
      director: 'Test Director',
      genres: [],
      last_synced: '2025-01-01',
      created: '2025-01-01',
      updated: '2025-01-01',
      collectionId: 'movies',
      collectionName: 'movies',
      // @ts-ignore - testing runtime safety for missing optional property
      expand: undefined,
    }

    const MovieCardComponent = await MovieCard({ movie: mockMovie })
    render(MovieCardComponent)

    expect(screen.getByText(/Our rating: 0/)).toBeInTheDocument()
  })
})
