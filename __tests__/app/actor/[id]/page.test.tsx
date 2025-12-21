import { render, screen } from '@testing-library/react'
import { tmdbApi } from '@/lib/api/tmdb'
import ActorDetailsPage from '@/app/actor/[id]/page'

// Mock the tmdbApi
jest.mock('@/lib/api/tmdb', () => ({
  tmdbApi: {
    getPersonDetails: jest.fn(),
    getPersonMovieCredits: jest.fn(),
    getImageUrl: jest.fn((path: string | null) => {
      if (!path) return null
      return `https://image.tmdb.org/t/p/w500${path}`
    }),
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('Not Found')
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('Actor Detail Page', () => {
  const mockPerson = {
    id: 123,
    name: 'John Doe',
    biography: 'A talented actor with a long career in Hollywood.',
    birthday: '1980-01-15',
    deathday: null,
    place_of_birth: 'Los Angeles, California, USA',
    profile_path: '/profile123.jpg',
    popularity: 85.5,
    known_for_department: 'Acting',
  }

  const mockCredits = {
    id: 123,
    cast: [
      {
        id: 1,
        title: 'Movie One',
        original_title: 'Movie One',
        poster_path: '/poster1.jpg',
        backdrop_path: '/backdrop1.jpg',
        release_date: '2024-06-15',
        overview: 'First movie',
        vote_average: 8.5,
        character: 'Main Character',
        credit_id: 'credit1',
        order: 0,
      },
      {
        id: 2,
        title: 'Movie Two',
        original_title: 'Movie Two',
        poster_path: '/poster2.jpg',
        backdrop_path: '/backdrop2.jpg',
        release_date: '2023-03-20',
        overview: 'Second movie',
        vote_average: 7.8,
        character: 'Supporting Role',
        credit_id: 'credit2',
        order: 1,
      },
      {
        id: 3,
        title: 'Movie Three',
        original_title: 'Movie Three',
        poster_path: '/poster3.jpg',
        backdrop_path: '/backdrop3.jpg',
        release_date: '2022-12-01',
        overview: 'Third movie',
        vote_average: 9.0,
        character: 'Villain',
        credit_id: 'credit3',
        order: 0,
      },
    ],
    crew: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(tmdbApi.getPersonDetails as jest.Mock).mockResolvedValue(mockPerson)
    ;(tmdbApi.getPersonMovieCredits as jest.Mock).mockResolvedValue(mockCredits)
  })

  test('renders actor name and basic info', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    const actingElements = screen.getAllByText('Acting')
    expect(actingElements.length).toBeGreaterThan(0)
  })

  test('displays biography section', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText('Biography')).toBeInTheDocument()
    expect(
      screen.getByText('A talented actor with a long career in Hollywood.')
    ).toBeInTheDocument()
  })

  test('shows filmography with correct movies', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText(/Filmography/)).toBeInTheDocument()
    expect(screen.getByText('Movie One')).toBeInTheDocument()
    expect(screen.getByText('Movie Two')).toBeInTheDocument()
    expect(screen.getByText('Movie Three')).toBeInTheDocument()
  })

  test('displays character names in filmography', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText('as Main Character')).toBeInTheDocument()
    expect(screen.getByText('as Supporting Role')).toBeInTheDocument()
    expect(screen.getByText('as Villain')).toBeInTheDocument()
  })

  test('shows release years for movies', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    // Check for release years
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('2022')).toBeInTheDocument()
  })

  test('displays quick facts section', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText('Quick Facts')).toBeInTheDocument()
    expect(screen.getByText('Known For')).toBeInTheDocument()
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('Place of Birth')).toBeInTheDocument()
  })

  test('shows place of birth', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    const placeOfBirth = screen.getAllByText('Los Angeles, California, USA')
    expect(placeOfBirth.length).toBeGreaterThan(0)
  })

  test('sorts filmography by release date (newest first)', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    const movieTitles = screen.getAllByText(/Movie (One|Two|Three)/)

    // Verify order: Movie One (2024), Movie Two (2023), Movie Three (2022)
    expect(movieTitles[0]).toHaveTextContent('Movie One')
    expect(movieTitles[1]).toHaveTextContent('Movie Two')
    expect(movieTitles[2]).toHaveTextContent('Movie Three')
  })

  test('limits filmography to 20 movies', async () => {
    const largeCast = {
      id: 123,
      cast: Array.from({ length: 30 }, (_, i) => ({
        id: i,
        title: `Movie ${i + 1}`,
        original_title: `Movie ${i + 1}`,
        poster_path: `/poster${i}.jpg`,
        backdrop_path: `/backdrop${i}.jpg`,
        release_date: `202${i % 5}-01-01`,
        overview: `Movie ${i + 1}`,
        vote_average: 8.0,
        character: `Character ${i + 1}`,
        credit_id: `credit${i}`,
        order: i,
      })),
      crew: [],
    }

    ;(tmdbApi.getPersonMovieCredits as jest.Mock).mockResolvedValue(largeCast)

    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    // Should show "20 most recent" in the heading
    expect(screen.getByText(/20 most recent/)).toBeInTheDocument()
  })

  test('handles missing biography gracefully', async () => {
    const personWithoutBio = {
      ...mockPerson,
      biography: '',
    }

    ;(tmdbApi.getPersonDetails as jest.Mock).mockResolvedValue(personWithoutBio)

    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    // Biography section should not be rendered
    expect(screen.queryByText('Biography')).not.toBeInTheDocument()
  })

  test('handles missing profile image', async () => {
    const personWithoutImage = {
      ...mockPerson,
      profile_path: null,
    }

    ;(tmdbApi.getPersonDetails as jest.Mock).mockResolvedValue(
      personWithoutImage
    )

    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    // Should still render without throwing error
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  test('calls TMDB API with correct person ID', async () => {
    const params = Promise.resolve({ id: '456' })
    await ActorDetailsPage({ params })

    expect(tmdbApi.getPersonDetails).toHaveBeenCalledWith(456)
    expect(tmdbApi.getPersonMovieCredits).toHaveBeenCalledWith(456)
  })

  test('filters out movies without release dates', async () => {
    const creditsWithInvalidDates = {
      id: 123,
      cast: [
        {
          ...mockCredits.cast[0],
          release_date: '2024-01-01',
        },
        {
          ...mockCredits.cast[1],
          release_date: '', // Empty release date
        },
      ],
      crew: [],
    }

    ;(tmdbApi.getPersonMovieCredits as jest.Mock).mockResolvedValue(
      creditsWithInvalidDates
    )

    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    // Should only show the movie with a valid release date
    expect(screen.getByText('Movie One')).toBeInTheDocument()
    expect(screen.queryByText('Movie Two')).not.toBeInTheDocument()
  })

  test('displays film count in quick facts', async () => {
    const params = Promise.resolve({ id: '123' })
    const page = await ActorDetailsPage({ params })

    render(page)

    expect(screen.getByText('Films Featured')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // 3 films in mock data
  })
})
