import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/SearchBar'
import { tmdbApi } from '@/lib/api/tmdb'
import { useRouter } from 'next/navigation'

// Mock TMDB API
jest.mock('@/lib/api/tmdb', () => ({
  tmdbApi: {
    searchMovies: jest.fn(),
    getImageUrl: jest.fn(),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('SearchBar', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(tmdbApi.getImageUrl as jest.Mock).mockImplementation(
      (path, size) => path ? `https://image.tmdb.org/t/p/${size}${path}` : null
    )
  })

  const openSearchDialog = async () => {
    const searchButton = screen.getByLabelText('Search movies')
    await userEvent.click(searchButton)
  }

  test('renders search button', () => {
    render(<SearchBar />)
    const searchButton = screen.getByLabelText('Search movies')
    expect(searchButton).toBeInTheDocument()
  })

  test('opens search dialog when button is clicked', async () => {
    render(<SearchBar />)
    await openSearchDialog()

    const input = screen.getByPlaceholderText('Search movies...')
    expect(input).toBeInTheDocument()
  })

  test('opens search dialog with keyboard shortcut', async () => {
    render(<SearchBar />)

    fireEvent.keyDown(document, { key: 'k', metaKey: true })

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search movies...')
      expect(input).toBeInTheDocument()
    })
  })

  test('displays loading state while searching', async () => {
    ;(tmdbApi.searchMovies as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                results: [],
                page: 1,
                total_pages: 0,
                total_results: 0,
              }),
            1000
          )
        })
    )

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Inception')

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  test('displays search results', async () => {
    const mockResults = {
      results: [
        {
          id: 1,
          title: 'Inception',
          original_title: 'Inception',
          poster_path: '/inception.jpg',
          backdrop_path: null,
          release_date: '2010-07-16',
          runtime: 148,
          overview: 'A thief who steals corporate secrets',
          vote_average: 8.8,
          genres: [],
        },
        {
          id: 2,
          title: 'Interstellar',
          original_title: 'Interstellar',
          poster_path: '/interstellar.jpg',
          backdrop_path: null,
          release_date: '2014-11-07',
          runtime: 169,
          overview: 'A team of explorers travel through a wormhole',
          vote_average: 8.6,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 2,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Inc')

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
      expect(screen.getByText('Interstellar')).toBeInTheDocument()
    })

    expect(screen.getByText('2010')).toBeInTheDocument()
    expect(screen.getByText('2014')).toBeInTheDocument()
  })

  test('limits results to 10 items', async () => {
    const mockResults = {
      results: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        original_title: `Movie ${i + 1}`,
        poster_path: `/movie${i + 1}.jpg`,
        backdrop_path: null,
        release_date: '2025-01-01',
        runtime: 120,
        overview: 'A movie',
        vote_average: 7.5,
        genres: [],
      })),
      page: 1,
      total_pages: 1,
      total_results: 20,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Movie')

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument()
    })

    // Should only show first 10 results
    expect(screen.getByText('Movie 10')).toBeInTheDocument()
    expect(screen.queryByText('Movie 11')).not.toBeInTheDocument()
  })

  test('navigates to movie page when result is clicked', async () => {
    const mockResults = {
      results: [
        {
          id: 123,
          title: 'Test Movie',
          original_title: 'Test Movie',
          poster_path: '/test.jpg',
          backdrop_path: null,
          release_date: '2025-01-01',
          runtime: 120,
          overview: 'A test movie',
          vote_average: 8.0,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Test')

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })

    const movieResult = screen.getByText('Test Movie')
    fireEvent.click(movieResult)

    expect(mockPush).toHaveBeenCalledWith('/movie/123')
  })

  test('clears search after selecting a movie', async () => {
    const mockResults = {
      results: [
        {
          id: 123,
          title: 'Test Movie',
          original_title: 'Test Movie',
          poster_path: '/test.jpg',
          backdrop_path: null,
          release_date: '2025-01-01',
          runtime: 120,
          overview: 'A test movie',
          vote_average: 8.0,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search movies...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Search movies...') as HTMLInputElement
    await userEvent.type(input, 'Test')

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })

    const movieResult = screen.getByText('Test Movie')
    fireEvent.click(movieResult)

    // After clicking, dialog closes and input is no longer in the document
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search movies...')).not.toBeInTheDocument()
    })
  })

  test('hides results when input is cleared', async () => {
    const mockResults = {
      results: [
        {
          id: 123,
          title: 'Test Movie',
          original_title: 'Test Movie',
          poster_path: '/test.jpg',
          backdrop_path: null,
          release_date: '2025-01-01',
          runtime: 120,
          overview: 'A test movie',
          vote_average: 8.0,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Test')

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })

    await userEvent.clear(input)

    await waitFor(() => {
      expect(screen.queryByText('Test Movie')).not.toBeInTheDocument()
    })
  })

  test('debounces search requests', async () => {
    const mockResults = {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValue(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    // Type quickly
    await userEvent.type(input, 'Inc')

    // Should eventually call the API after debounce
    await waitFor(() => {
      expect(tmdbApi.searchMovies).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  test('displays "Unknown year" when release date is missing', async () => {
    const mockResults = {
      results: [
        {
          id: 123,
          title: 'No Date Movie',
          original_title: 'No Date Movie',
          poster_path: '/test.jpg',
          backdrop_path: null,
          release_date: '',
          runtime: 120,
          overview: 'A movie with no release date',
          vote_average: 7.0,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'No Date')

    await waitFor(() => {
      expect(screen.getByText('No Date Movie')).toBeInTheDocument()
      expect(screen.getByText('Unknown year')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('displays placeholder when poster is missing', async () => {
    const mockResults = {
      results: [
        {
          id: 123,
          title: 'No Poster Movie',
          original_title: 'No Poster Movie',
          poster_path: null,
          backdrop_path: null,
          release_date: '2025-01-01',
          runtime: 120,
          overview: 'A movie with no poster',
          vote_average: 7.0,
          genres: [],
        },
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
    }

    ;(tmdbApi.searchMovies as jest.Mock).mockResolvedValueOnce(mockResults)

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'No Poster')

    await waitFor(() => {
      expect(screen.getByText('No Poster Movie')).toBeInTheDocument()
      expect(screen.getByText('No img')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    ;(tmdbApi.searchMovies as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, 'Error')

    await waitFor(() => {
      expect(tmdbApi.searchMovies).toHaveBeenCalled()
    }, { timeout: 2000 })

    // Component should not crash
    expect(input).toBeInTheDocument()

    consoleError.mockRestore()
  })

  test('does not search with empty query', async () => {
    render(<SearchBar />)
    await openSearchDialog()
    const input = screen.getByPlaceholderText('Search movies...')

    await userEvent.type(input, '   ')

    // Wait a bit and ensure no search was triggered
    await new Promise(resolve => setTimeout(resolve, 500))
    expect(tmdbApi.searchMovies).not.toHaveBeenCalled()
  })

  test('closes dialog when Escape is pressed', async () => {
    render(<SearchBar />)
    await openSearchDialog()

    const input = screen.getByPlaceholderText('Search movies...')
    expect(input).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search movies...')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
