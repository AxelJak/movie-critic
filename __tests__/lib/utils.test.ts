import { formatDate, formatRuntime, debounce, cn } from '@/lib/utils'

describe('formatDate', () => {
  test('formats ISO date correctly', () => {
    const result = formatDate('2025-04-15')
    expect(result).toBe('April 15, 2025')
  })

  test('formats date with time component', () => {
    const result = formatDate('2025-01-01T00:00:00Z')
    expect(result).toContain('January')
    expect(result).toContain('2025')
  })

  test('formats date with different months', () => {
    expect(formatDate('2025-12-25')).toBe('December 25, 2025')
    expect(formatDate('2025-07-04')).toBe('July 4, 2025')
  })

  test('handles single digit days', () => {
    const result = formatDate('2025-03-05')
    expect(result).toBe('March 5, 2025')
  })

  test('handles different years', () => {
    expect(formatDate('2020-01-01')).toContain('2020')
    expect(formatDate('2030-12-31')).toContain('2030')
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

  test('handles single hour', () => {
    expect(formatRuntime(60)).toBe('1h')
  })

  test('handles single minute', () => {
    expect(formatRuntime(1)).toBe('1m')
  })

  test('handles large runtimes', () => {
    expect(formatRuntime(300)).toBe('5h')
    expect(formatRuntime(301)).toBe('5h 1m')
  })

  test('handles typical movie runtimes', () => {
    expect(formatRuntime(90)).toBe('1h 30m') // Short movie
    expect(formatRuntime(142)).toBe('2h 22m') // Average movie
    expect(formatRuntime(181)).toBe('3h 1m')  // Long movie
  })
})

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

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

  test('passes arguments correctly', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('arg1', 'arg2', 123)

    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  test('handles multiple separate calls after delay', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    // First call
    debouncedFn('first')
    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')

    // Second call after delay
    debouncedFn('second')
    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenCalledWith('second')
  })

  test('resets timer on each call', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn()
    jest.advanceTimersByTime(200)
    expect(mockFn).not.toHaveBeenCalled()

    debouncedFn()
    jest.advanceTimersByTime(200)
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('works with different delay times', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 500)

    debouncedFn()
    jest.advanceTimersByTime(499)
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})

describe('cn (className utility)', () => {
  test('merges class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  test('handles conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-class')
    expect(result).not.toContain('hidden-class')
  })

  test('handles empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  test('handles tailwind conflict resolution', () => {
    // twMerge should resolve conflicting tailwind classes
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  test('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
    expect(result).toContain('class3')
  })

  test('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
  })
})
