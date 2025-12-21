import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/hooks/use-auth'
import { pbApi } from '@/lib/api/pocketbase'
import { User } from '@/lib/api/types'
import { ReactNode } from 'react'

// Mock pocketbase API
jest.mock('@/lib/api/pocketbase', () => ({
  pbApi: {
    isAuthenticated: false,
    currentUser: null,
    register: jest.fn(),
    login: jest.fn(),
    loginWithOAuth: jest.fn(),
    completeOAuthLogin: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    updateAvatar: jest.fn(),
    client: {
      authStore: {
        onChange: jest.fn(),
      },
    },
  },
}))

describe('useAuth', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(pbApi as any).isAuthenticated = false
    ;(pbApi as any).currentUser = null
  })

  test('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleError.mockRestore()
  })

  test('provides initial unauthenticated state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('provides authenticated user state', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi as any).isAuthenticated = true
    ;(pbApi as any).currentUser = mockUser

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  test('registers a new user', async () => {
    const mockUser: User = {
      id: '123',
      email: 'newuser@example.com',
      name: 'New User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi.register as jest.Mock).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let registeredUser: User | undefined

    await act(async () => {
      registeredUser = await result.current.register(
        'newuser@example.com',
        'password123',
        'New User'
      )
    })

    expect(pbApi.register).toHaveBeenCalledWith(
      'newuser@example.com',
      'password123',
      'New User'
    )
    expect(registeredUser).toEqual(mockUser)
    expect(result.current.user).toEqual(mockUser)
  })

  test('logs in an existing user', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi.login as jest.Mock).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let loggedInUser: User | undefined

    await act(async () => {
      loggedInUser = await result.current.login('test@example.com', 'password123')
    })

    expect(pbApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(loggedInUser).toEqual(mockUser)
    expect(result.current.user).toEqual(mockUser)
  })

  test('handles login with OAuth', async () => {
    ;(pbApi.loginWithOAuth as jest.Mock).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.loginWithOAuth('google')
    })

    expect(pbApi.loginWithOAuth).toHaveBeenCalledWith('google')
  })

  test('handles OAuth login error', async () => {
    ;(pbApi.loginWithOAuth as jest.Mock).mockRejectedValueOnce(
      new Error('OAuth error')
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.loginWithOAuth('google')
      })
    ).rejects.toThrow('OAuth error')

    expect(result.current.isLoading).toBe(false)
  })

  test('completes OAuth login', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi.completeOAuthLogin as jest.Mock).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let completedUser: User | undefined

    await act(async () => {
      completedUser = await result.current.completeOAuthLogin('auth-code-123')
    })

    expect(pbApi.completeOAuthLogin).toHaveBeenCalledWith('auth-code-123')
    expect(completedUser).toEqual(mockUser)
    expect(result.current.user).toEqual(mockUser)
  })

  test('logs out user', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi as any).isAuthenticated = true
    ;(pbApi as any).currentUser = mockUser

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.logout()
    })

    expect(pbApi.logout).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  test('updates user profile', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    const updatedUser: User = {
      ...mockUser,
      name: 'Updated Name',
      updated: '2025-01-02',
    }

    ;(pbApi as any).isAuthenticated = true
    ;(pbApi as any).currentUser = mockUser
    ;(pbApi.updateProfile as jest.Mock).mockResolvedValueOnce(updatedUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let profileUpdatedUser: User | undefined

    await act(async () => {
      profileUpdatedUser = await result.current.updateProfile({
        name: 'Updated Name',
      })
    })

    expect(pbApi.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' })
    expect(profileUpdatedUser).toEqual(updatedUser)
    expect(result.current.user).toEqual(updatedUser)
  })

  test('updates user avatar', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    const updatedUser: User = {
      ...mockUser,
      avatar: 'new-avatar.jpg',
      updated: '2025-01-02',
    }

    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })

    ;(pbApi as any).isAuthenticated = true
    ;(pbApi as any).currentUser = mockUser
    ;(pbApi.updateAvatar as jest.Mock).mockResolvedValueOnce(updatedUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let avatarUpdatedUser: User | undefined

    await act(async () => {
      avatarUpdatedUser = await result.current.updateAvatar(mockFile)
    })

    expect(pbApi.updateAvatar).toHaveBeenCalledWith(mockFile)
    expect(avatarUpdatedUser).toEqual(updatedUser)
    expect(result.current.user).toEqual(updatedUser)
  })

  test('sets loading state during async operations', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    let resolveLogin: (value: User) => void
    const loginPromise = new Promise<User>((resolve) => {
      resolveLogin = resolve
    })

    ;(pbApi.login as jest.Mock).mockReturnValueOnce(loginPromise)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Start login
    act(() => {
      result.current.login('test@example.com', 'password123')
    })

    // Should be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    // Complete login
    await act(async () => {
      resolveLogin!(mockUser)
      await loginPromise
    })

    // Should not be loading anymore
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  test('handles error during registration', async () => {
    ;(pbApi.register as jest.Mock).mockRejectedValueOnce(
      new Error('Registration failed')
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.register('test@example.com', 'pass', 'Test')
      })
    ).rejects.toThrow('Registration failed')

    // Loading should be false after error
    expect(result.current.isLoading).toBe(false)
  })

  test('handles error during profile update', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      created: '2025-01-01',
      updated: '2025-01-01',
    }

    ;(pbApi as any).isAuthenticated = true
    ;(pbApi as any).currentUser = mockUser
    ;(pbApi.updateProfile as jest.Mock).mockRejectedValueOnce(
      new Error('Update failed')
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.updateProfile({ name: 'New Name' })
      })
    ).rejects.toThrow('Update failed')

    // Loading should be false after error
    expect(result.current.isLoading).toBe(false)
  })
})
