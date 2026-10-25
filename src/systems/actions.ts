import type {
  ActionDef,
  ActionId,
  Content,
  GameState,
  Result,
} from '../types/game'
import { describeCondition, firstUnmet } from './conditions'
import { resolveEffects } from './effects'

/** Hành động có chọn được không; lỗi kèm lý do. */
export function checkAction(
  state: GameState,
  content: Content,
  id: ActionId,
): Result<ActionDef> {
  const action = content.actions[id]
  if (!action) return { ok: false, error: `unknown action "${id}"` }
  if (action.once && state.claimed[id])
    return { ok: false, error: `already claimed "${id}"` }
  const unmet = firstUnmet(state, action.requires)
  if (unmet) return { ok: false, error: `requires ${describeCondition(unmet)}` }
  return { ok: true, value: action }
}

/**
 * Chạy hành động hiện tại cho một tick.
 * Không chạy được → đặt điểm dừng, state khác giữ nguyên.
 * Hành động `once`: phần thưởng và dấu đã nhận được ghi trong cùng một bước.
 */
export function runCurrentAction(
  state: GameState,
  content: Content,
): GameState {
  const id = state.currentActionId
  if (id === null) return state
  const check = checkAction(state, content, id)
  const applied = check.ok
    ? resolveEffects(state, content, check.value.effects)
    : check
  if (!applied.ok)
    return {
      ...state,
      stop: { reason: 'actionBlocked', detail: `${id}: ${applied.error}` },
    }
  if (!check.ok || !check.value.once) return applied.value
  return {
    ...applied.value,
    claimed: { ...applied.value.claimed, [id]: true },
    currentActionId: null,
    stop: { reason: 'actionCompleted', detail: id },
  }
}
