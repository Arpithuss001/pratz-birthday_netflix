import { useCallback } from 'react'

export function useSound() {
  const playPop = useCallback(() => {
    // All clicks are handled with zero-latency sync by GlobalClickSound on pointerdown
  }, [])

  return { playPop }
}
