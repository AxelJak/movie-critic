# Test Coverage Analysis - Movie Critic App

## Current State

**Test Coverage: 0%**

The codebase currently has:
- ❌ No test files
- ❌ No testing framework configured
- ❌ No test scripts in package.json
- ❌ No testing dependencies installed

## Recommended Testing Infrastructure

### 1. Testing Framework Setup

Install the following dependencies:

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @testing-library/react-hooks
pnpm add -D msw@latest  # For API mocking
```

### 2. Configuration Files Needed

- `vitest.config.ts` - Vitest configuration
- `setupTests.ts` - Global test setup
- `.github/workflows/test.yml` - CI/CD pipeline (optional)

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
// lib/utils.test.ts
describe('formatDate', () => {
  test('formats ISO date correctly')
  test('handles invalid dates')
})

describe('formatRuntime', () => {
  test('converts minutes to hours and minutes')
  test('handles zero and edge cases')
  test('handles only hours or only minutes')
})

describe('debounce', () => {
  test('delays function execution')
  test('cancels previous calls')
})
```

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
**Solution:** Use dependency injection or module mocking with Vitest

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
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:ci": "vitest run --coverage"
  }
}
```

## Next Steps

1. **Install testing dependencies** (see section above)
2. **Create vitest.config.ts** and **setupTests.ts**
3. **Start with utility functions** - easiest wins
4. **Move to API services** - highest risk areas
5. **Add component tests** - user-facing functionality
6. **Set up CI/CD** - automate testing on every commit
7. **Track coverage** - aim for 80%+ overall

## Conclusion

The Movie Critic app currently has **zero test coverage**, which presents significant risk for:
- Regression bugs when adding features
- Breaking changes going unnoticed
- Difficulty refactoring code safely
- Lower code quality and maintainability

**Priority Recommendation:** Start with testing the API layer (TMDB and PocketBase services) and utility functions, as these contain the most critical business logic and are used throughout the application.
