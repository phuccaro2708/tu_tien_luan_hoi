import { MAX_AWAY_TICKS, TICK_MS } from '../core/clock'
import { runTicks } from '../core/engine'
import type { Content, GameState } from '../types/game'

export interface OfflineReport {
  state: GameState
  ticksRun: number
  /** Tick vắng mặt chưa chạy (do gặp điểm dừng) được cộng vào Tích Thời. */
  tichThoiAdded: number
}

/** Số tick vắng mặt: thời gian âm, NaN hoặc Infinity → 0; trần 8 giờ (BALANCE §7). */
export function awayTicks(awayMs: number): number {
  if (!Number.isFinite(awayMs) || awayMs <= 0) return 0
  return Math.min(Math.floor(awayMs / TICK_MS), MAX_AWAY_TICKS)
}

/** Mô phỏng thời gian vắng mặt bằng chính engine; phần còn lại thành Tích Thời. */
export function simulateAway(
  state: GameState,
  content: Content,
  awayMs: number,
): OfflineReport {
  const ticks = awayTicks(awayMs)
  const run = runTicks(state, content, ticks)
  const tichThoiTicks = Math.min(
    MAX_AWAY_TICKS,
    run.state.tichThoiTicks + (ticks - run.ticksRun),
  )
  return {
    state: { ...run.state, tichThoiTicks },
    ticksRun: run.ticksRun,
    tichThoiAdded: tichThoiTicks - run.state.tichThoiTicks,
  }
}

/** "Dùng Tích Thời": tua nhanh tức thì tới điểm dừng đầu tiên, giữ phần chưa dùng (D06). */
export function spendTichThoi(
  state: GameState,
  content: Content,
): { state: GameState; ticksRun: number } {
  const run = runTicks(state, content, state.tichThoiTicks)
  return {
    state: { ...run.state, tichThoiTicks: state.tichThoiTicks - run.ticksRun },
    ticksRun: run.ticksRun,
  }
}
