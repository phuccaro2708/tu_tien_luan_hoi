import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

/** rAF chỉ đẩy thời gian vào clock; số tick không phụ thuộc FPS. */
export function useGameLoop(): void {
  useEffect(() => {
    let id = 0
    const loop = (t: number) => {
      useGameStore.getState().frame(t, Date.now())
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    const saveNow = () => useGameStore.getState().save(Date.now())
    window.addEventListener('pagehide', saveNow)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('pagehide', saveNow)
    }
  }, [])
}
