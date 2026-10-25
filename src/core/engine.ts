import { checkAction, runCurrentAction } from '../systems/actions'
import type { Command, Content, GameState, Result } from '../types/game'

/** Mọi thay đổi state từ người chơi đi qua đây. */
export function applyCommand(
  state: GameState,
  content: Content,
  command: Command,
): Result<GameState> {
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
 * P0 chỉ có: hành động hiện tại → ngày +1. Đang ở điểm dừng → không chạy.
 */
export function step(state: GameState, content: Content): GameState {
  if (state.stop) return state
  const next = runCurrentAction(state, content)
  // Bị chặn trước khi làm gì → ngày chưa trôi.
  if (next.stop?.reason === 'actionBlocked') return next
  return { ...next, day: next.day + 1 }
}

/** Chạy tối đa `ticks` tick, dừng ở điểm dừng đầu tiên. `ticksRun` = số ngày đã trôi. */
export function runTicks(
  state: GameState,
  content: Content,
  ticks: number,
): { state: GameState; ticksRun: number } {
  let s = state
  while (s.day - state.day < ticks && !s.stop) s = step(s, content)
  return { state: s, ticksRun: s.day - state.day }
}
