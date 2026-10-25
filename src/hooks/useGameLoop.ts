import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * rAF chỉ đẩy thời gian vào clock; số tick không phụ thuộc FPS.
 * Tab ẩn vẫn là online ở tốc độ đã chọn (AGENTS.md §4): rAF ngừng, frame đầu khi hiện lại chạy bù.
 * Ẩn hoặc đóng tab = lưu tới thời điểm đó.
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
      if (document.hidden) saveNow()
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
