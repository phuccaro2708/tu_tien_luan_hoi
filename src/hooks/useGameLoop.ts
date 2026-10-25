import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * rAF chỉ đẩy thời gian vào clock; số tick không phụ thuộc FPS.
 * Tab ẩn = vắng mặt (đường offline); đóng tab = lưu tới thời điểm đã hạch toán.
 */
export function useGameLoop(): void {
  useEffect(() => {
    let id = 0
    const loop = (t: number) => {
      useGameStore.getState().frame(t, Date.now())
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    const saveNow = () =>
      useGameStore.getState().save(performance.now(), Date.now())
    const onVisibility = () => {
      const store = useGameStore.getState()
      const toggle = document.hidden ? store.hide : store.show
      toggle(performance.now(), Date.now())
    }
    window.addEventListener('pagehide', saveNow)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('pagehide', saveNow)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
