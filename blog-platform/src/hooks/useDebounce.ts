import { useEffect, useState } from 'react'

// Returns `value`, but only after it has not changed for `delay` ms.
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // the value changed again: start waiting from zero
  }, [value, delay])

  return debounced
}
