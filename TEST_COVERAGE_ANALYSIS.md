# Test Coverage Analysis - Movie Critic App

## Current State

**Test Coverage: 0%**

The codebase currently has:
- ❌ No test files
- ❌ No testing framework configured
- ❌ No test scripts in package.json
- ❌ No testing dependencies installed

## Recommended Testing Infrastructure

### 1. Testing Framework: Jest

**Why Jest for Next.js?**
- ✅ Officially recommended by Next.js team
- ✅ Next.js provides `next/jest` helper for easy configuration
- ✅ Better documentation and examples for Next.js app router
- ✅ Established patterns for testing Server Components
- ✅ Larger community support for Next.js-specific issues

While Vitest is faster and more modern, Jest is the safer choice for Next.js projects due to better ecosystem support and official integration.

### 2. Install Dependencies

```bash
# Core testing dependencies
pnpm add -D jest jest-environment-jsdom @types/jest

# React testing utilities
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# API mocking
pnpm add -D msw@latest

# Optional: React hooks testing (if needed)
pnpm add -D @testing-library/react-hooks
```

### 3. Configuration Files Needed

Create the following files:

**jest.config.js:**
```javascript
const nextJest = require('next/jest')

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
})

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js:**
```javascript
import '@testing-library/jest-dom'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

**.env.test:**
```bash
NEXT_PUBLIC_TMDB_API_KEY=test_api_key
NEXT_PUBLIC_TMDB_API_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_URL=https://image.tmdb.org/t/p
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

Additional optional files:
- `.github/workflows/test.yml` - CI/CD pipeline

### 4. API Mocking with MSW (Mock Service Worker)

For realistic API testing, set up MSW:

**lib/test/mocks/handlers.ts:**
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock TMDB API
  http.get('https://api.themoviedb.org/3/movie/:id', () => {
    return HttpResponse.json({
      id: 123,
      title: 'Test Movie',
      overview: 'A test movie',
      vote_average: 7.5,
      // ... other fields
    })
  }),

  // Mock PocketBase API
  http.post('http://localhost:8090/api/collections/users/auth-with-password', () => {
    return HttpResponse.json({
      token: 'test-token',
      record: { id: 'user123', email: 'test@example.com' },
    })
  }),
]
```

**lib/test/mocks/server.ts:**
```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

Update **jest.setup.js** to include MSW:
```javascript
import '@testing-library/jest-dom'
import { server } from './lib/test/mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that are declared in tests
afterEach(() => server.resetHandlers())

// Clean up after tests finish
afterAll(() => server.close())

// ... (existing mocks)
```

### 5. Jest vs Vitest Comparison

| Feature | Jest | Vitest |
|---------|------|--------|
| **Next.js Integration** | ✅ Official support with `next/jest` | ⚠️ Requires manual config |
| **Speed** | ⚠️ Slower | ✅ Significantly faster |
| **Documentation** | ✅ Extensive Next.js examples | ⚠️ Limited Next.js docs |
| **Community** | ✅ Large Next.js community | ⚠️ Smaller for Next.js |
| **ESM Support** | ⚠️ Can be tricky | ✅ Native ESM support |
| **Configuration** | ✅ Simple with Next.js | ⚠️ More manual work |
| **Maturity** | ✅ Battle-tested | ⚠️ Newer tool |

**Recommendation:** Use Jest for this project due to better Next.js integration and community support.

## Priority Test Areas

### 🔴 **CRITICAL - High Priority**

These areas contain core business logic and should be tested first:

#### 1. Utility Functions (`lib/utils.ts`)
**Risk:** Low complexity but used throughout the app
**Current Functions:**
- `formatDate()` - Date formatting
- `formatRuntime()` - Runtime conversion (minutes to hours)
- `debounce()` - Debounce utility

**Recommended Tests:**
```typescript
// __tests__/lib/utils.test.ts
import { formatDate, formatRuntime, debounce } from '@/lib/utils'

describe('formatDate', () => {
  test('formats ISO date correctly', () => {
    const result = formatDate('2025-04-15')
    expect(result).toBe('April 15, 2025')
  })

  test('handles different date formats', () => {
    const result = formatDate('2025-01-01T00:00:00Z')
    expect(result).toContain('January')
  })
})

describe('formatRuntime', () => {
  test('converts minutes to hours and minutes', () => {
    expect(formatRuntime(150)).toBe('2h 30m')
  })

  test('handles only hours', () => {
    expect(formatRuntime(120)).toBe('2h')
  })

  test('handles only minutes', () => {
    expect(formatRuntime(45)).toBe('45m')
  })

  test('handles zero runtime', () => {
    expect(formatRuntime(0)).toBe('')
  })
})

describe('debounce', () => {
  jest.useFakeTimers()

  test('delays function execution', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('cancels previous calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1) // Only last call executes
  })
})
```

**Why start here?**
- ✅ No external dependencies
- ✅ Pure functions, easy to test
- ✅ Quick validation of test setup
- ✅ Builds confidence before tackling complex tests

#### 2. TMDB API Service (`lib/api/tmdb.ts`)
**Risk:** External API dependency, network failures
**Key Methods:**
- `searchMovies()` - Search functionality
- `getMovieDetails()` - Movie detail fetching
- `getPopularMovies()`, `getNowPlayingMovies()`, `getTopRatedMovies()`
- `getImageUrl()` - Image URL construction
- `getDirector()`, `getCast()` - Data extraction

**Recommended Tests:**
```typescript
// lib/api/tmdb.test.ts
describe('TMDBApiService', () => {
  describe('searchMovies', () => {
    test('returns search results for valid query')
    test('handles API errors gracefully')
    test('includes API key in headers')
    test('respects pagination parameters')
  })

  describe('getMovieDetails', () => {
    test('fetches movie with credits')
    test('handles non-existent movie ID')
    test('handles network timeout')
  })

  describe('getImageUrl', () => {
    test('constructs correct URL with size')
    test('returns null for null path')
    test('uses default size when not specified')
  })

  describe('getDirector', () => {
    test('extracts director from credits')
    test('returns "Unknown" when no director found')
  })

  describe('getCast', () => {
    test('returns cast sorted by order')
    test('limits results to specified count')
    test('defaults to 10 cast members')
  })
})
```

#### 3. PocketBase Service (`lib/api/pocketbase.ts`)
**Risk:** HIGH - Core business logic, authentication, data persistence
**Key Areas:**
- Authentication (login, register, OAuth, logout)
- Movie syncing from TMDB
- Reviews CRUD operations
- User profile management
- Watchlist management

**Recommended Tests:**
```typescript
// lib/api/pocketbase.test.ts
describe('PocketBaseService', () => {
  describe('Authentication', () => {
    test('registers new user successfully')
    test('logs in with valid credentials')
    test('handles invalid credentials')
    test('auto-logs in after registration')
    test('logs out and clears auth state')
    test('OAuth login flow')
    test('completes OAuth callback')
  })

  describe('Movie Syncing', () => {
    test('syncs new movie from TMDB')
    test('returns existing movie if already synced')
    test('updates movie if older than 7 days')
    test('syncs cast members correctly')
    test('handles TMDB API failures')
  })

  describe('Reviews', () => {
    test('creates review when authenticated')
    test('throws error when not authenticated')
    test('updates existing review')
    test('deletes own review')
    test('prevents deleting others reviews')
    test('fetches reviews for movie')
    test('fetches user specific review for movie')
  })

  describe('User Profile', () => {
    test('updates profile when authenticated')
    test('updates avatar with file upload')
    test('throws error when not authenticated')
  })

  describe('Watchlist', () => {
    test('creates watchlist')
    test('adds movie to watchlist')
    test('removes movie from watchlist')
    test('checks if movie in watchlist')
    test('fetches user watchlists')
  })
})
```

### 🟡 **MODERATE - Medium Priority**

#### 4. Authentication Hook (`lib/hooks/use-auth.tsx`)
**Risk:** Critical user-facing functionality
**Key Features:**
- Auth state management
- Login/logout flows
- Profile updates
- OAuth integration

**Recommended Tests:**
```typescript
// lib/hooks/use-auth.test.tsx
describe('useAuth', () => {
  test('provides initial auth state')
  test('updates state on login')
  test('updates state on logout')
  test('throws error when used outside provider')
  test('handles registration flow')
  test('updates user on profile change')
  test('handles OAuth redirect flow')
})
```

#### 5. API Routes
**Files:**
- `app/api/reviews/route.ts`
- `app/api/reviews/[id]/route.ts`

**Recommended Tests:**
```typescript
// app/api/reviews/route.test.ts
describe('POST /api/reviews', () => {
  test('creates review when authenticated')
  test('returns 401 when not authenticated')
  test('validates required fields')
  test('returns 400 for missing fields')
})

// app/api/reviews/[id]/route.test.ts
describe('PATCH /api/reviews/:id', () => {
  test('updates own review')
  test('returns 403 for other users review')
  test('returns 401 when not authenticated')
})

describe('DELETE /api/reviews/:id', () => {
  test('deletes own review')
  test('returns 403 for other users review')
  test('returns 401 when not authenticated')
})
```

### 🟢 **LOW - Lower Priority (But Still Important)**

#### 6. React Components

**Complex Components to Test:**
- `MovieReviewFormImpl.tsx` - Form state management, validation
- `MovieCard.tsx` - Rating calculations, rendering
- `login-form.tsx`, `signup-form.tsx` - Form validation
- `SearchBar.tsx` - Debounced search
- `ProfileEditor.tsx` - Profile updates

**Recommended Tests:**
```typescript
// components/MovieReviewFormImpl.test.tsx
describe('MovieReviewFormImpl', () => {
  test('renders form when authenticated')
  test('shows login prompt when not authenticated')
  test('validates rating range (1-10)')
  test('submits new review')
  test('updates existing review')
  test('handles submission errors')
  test('syncs movie from TMDB if needed')
  test('toggles spoiler checkbox')
  test('previews review content')
})

// components/MovieCard.test.tsx
describe('MovieCard', () => {
  test('calculates average site rating correctly')
  test('displays TMDB rating')
  test('renders movie poster with correct image URL')
  test('links to movie detail page')
  test('displays reviews in tabs')
  test('handles movies with no reviews')
})
```

#### 7. Server Components & Pages

While server components are harder to test, you should focus on:
- Data fetching logic
- Error boundaries
- Loading states

**Recommended Integration Tests:**
```typescript
// app/movie/[id]/page.test.tsx
describe('Movie Detail Page', () => {
  test('fetches and displays movie details')
  test('shows error boundary on failure')
  test('displays loading state initially')
  test('syncs movie from TMDB if not in DB')
})
```

## Test Coverage Goals

### Phase 1 (Immediate - Sprint 1)
- ✅ Set up testing infrastructure
- ✅ Test all utility functions (100% coverage)
- ✅ Test TMDB API service core methods (80%+ coverage)
- ✅ Test PocketBase authentication (80%+ coverage)

### Phase 2 (Short-term - Sprint 2-3)
- ✅ Test PocketBase review operations (80%+ coverage)
- ✅ Test API routes (100% coverage)
- ✅ Test useAuth hook (90%+ coverage)
- ✅ Test MovieReviewFormImpl (80%+ coverage)

### Phase 3 (Medium-term - Sprint 4-6)
- ✅ Test remaining PocketBase methods (watchlist, profiles)
- ✅ Test all form components
- ✅ Test MovieCard and display components
- ✅ Integration tests for critical user flows

### Phase 4 (Long-term - Ongoing)
- ✅ E2E tests with Playwright/Cypress
- ✅ Visual regression tests
- ✅ Performance tests
- ✅ Accessibility tests

## Specific Testing Challenges & Solutions

### Challenge 1: PocketBase Singleton
**Problem:** PocketBase uses singleton pattern making it hard to mock
**Solution:** Use Jest module mocking with `jest.mock()` to mock the entire module

**Example:**
```typescript
// __tests__/lib/api/pocketbase.test.ts
jest.mock('@/lib/api/pocketbase', () => ({
  pbApi: {
    login: jest.fn(),
    register: jest.fn(),
    isAuthenticated: false,
    currentUser: null,
  },
}))
```

### Challenge 2: Server Components
**Problem:** Server components can't be tested with traditional React testing
**Solution:** Extract data fetching logic into testable functions, use integration tests

### Challenge 3: Next.js Image Component
**Problem:** Next.js Image requires special setup in tests
**Solution:** Mock Next.js Image component in test setup

### Challenge 4: Environment Variables
**Problem:** Tests need TMDB API keys and PocketBase URL
**Solution:** Use `.env.test` file with test credentials or mock API calls

### Challenge 5: OAuth Flows
**Problem:** OAuth requires browser redirects
**Solution:** Mock OAuth methods, test state management separately

## Code Coverage Metrics to Track

- **Statements:** Target 80%+
- **Branches:** Target 75%+
- **Functions:** Target 85%+
- **Lines:** Target 80%+

**Critical Paths (100% coverage required):**
- Authentication flows
- Review creation/update/delete
- Payment processing (if added)
- Data validation functions

## Testing Best Practices for This Project

1. **Mock External APIs:** Always mock TMDB and PocketBase in unit tests
2. **Test Error Cases:** Every API call should test success AND failure
3. **Test Edge Cases:** Empty states, null values, extreme ratings (0, 11)
4. **Test User Permissions:** Verify users can only modify their own data
5. **Test Validation:** Rating ranges, required fields, email formats
6. **Snapshot Testing:** Use sparingly, only for stable UI components
7. **Integration Tests:** Test complete flows (register → login → create review)

## Example Test Files to Create

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── api/
│   │   │   ├── tmdb.test.ts
│   │   │   ├── pocketbase.test.ts
│   │   │   └── pocketbase-server.test.ts
│   │   └── hooks/
│   │       └── use-auth.test.tsx
│   └── components/
│       ├── MovieReviewFormImpl.test.tsx
│       ├── MovieCard.test.tsx
│       ├── login-form.test.tsx
│       └── signup-form.test.tsx
├── integration/
│   ├── review-flow.test.tsx
│   ├── auth-flow.test.tsx
│   └── movie-detail.test.tsx
└── api/
    ├── reviews.test.ts
    └── reviews-[id].test.ts
```

## Recommended npm Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

## Next Steps

1. **Install testing dependencies** (see section above)
2. **Create jest.config.js, jest.setup.js, and .env.test**
3. **Add test scripts to package.json**
4. **Start with utility functions** - easiest wins, quick validation
5. **Move to API services** - highest risk areas (TMDB, PocketBase)
6. **Add component tests** - user-facing functionality
7. **Set up CI/CD** - automate testing on every commit/PR
8. **Track coverage metrics** - aim for 80%+ overall coverage

### Quick Start Command

```bash
# Install dependencies
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest

# Create config files (copy from examples above)
touch jest.config.js jest.setup.js .env.test

# Add test scripts to package.json (see Recommended npm Scripts section)

# Run tests
pnpm test
```

## Conclusion

The Movie Critic app currently has **zero test coverage**, which presents significant risk for:
- Regression bugs when adding features
- Breaking changes going unnoticed
- Difficulty refactoring code safely
- Lower code quality and maintainability

**Priority Recommendation:** Start with testing the API layer (TMDB and PocketBase services) and utility functions, as these contain the most critical business logic and are used throughout the application.
