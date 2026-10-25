import { checkAction, runCurrentAction } from '../systems/actions'
import { checkLifespan } from '../systems/lifespan'
import type { Command, Content, GameState, Result } from '../types/game'

/** Mọi thay đổi state từ người chơi đi qua đây. Hết kiếp thì không lệnh nào áp được (chờ Vong Xuyên, P4). */
export function applyCommand(
  state: GameState,
  content: Content,
  command: Command,
): Result<GameState> {
  if (state.stop?.reason === 'death')
    return { ok: false, error: 'this life has ended' }
  switch (command.type) {
    case 'setAction': {
      if (command.actionId === null)
        return { ok: true, value: { ...state, currentActionId: null } }
      const check = checkAction(state, content, command.actionId)
      if (!check.ok) return check
      return {
        ok: true,
        value: { ...state, currentActionId: command.actionId },
      }
    }
    case 'resume':
      return { ok: true, value: { ...state, stop: null } }
  }
}

/**
 * Một tick = một ngày. Thứ tự pipeline cố định (IMPLEMENTATION_PLAN §1);
 * hiện có: hành động hiện tại → ngày +1 → cảnh báo thọ nguyên / chết. Đang ở điểm dừng → không chạy.
 */
export function step(state: GameState, content: Content): GameState {
  // Ngày cuối biểu diễn được (thực tế không thể chạm tới): không chạy gì để 1 tick luôn = 1 ngày.
  if (state.stop || state.day >= Number.MAX_SAFE_INTEGER) return state
  const next = runCurrentAction(state, content)
  // Bị chặn trước khi làm gì → ngày chưa trôi.
  if (next.stop?.reason === 'actionBlocked') return next
  return checkLifespan(state, { ...next, day: next.day + 1 }, content)
}

/**
 * Chạy tối đa `ticks` tick, dừng ở điểm dừng đầu tiên. `ticksRun` = số tick đã tiêu
 * (tick bị chặn không tính). Vòng lặp kết thúc theo bộ đếm, điểm dừng hoặc ngày cuối.
 * `ticks` âm, NaN hoặc Infinity → 0; số lẻ làm tròn xuống.
 */
export function runTicks(
  state: GameState,
  content: Content,
  ticks: number,
): { state: GameState; ticksRun: number } {
  const budget = Number.isFinite(ticks) ? Math.max(0, Math.floor(ticks)) : 0
  let s = state
  let ticksRun = 0
  while (ticksRun < budget && !s.stop && s.day < Number.MAX_SAFE_INTEGER) {
    s = step(s, content)
    if (s.stop?.reason !== 'actionBlocked') ticksRun++
  }
  return { state: s, ticksRun }
}
