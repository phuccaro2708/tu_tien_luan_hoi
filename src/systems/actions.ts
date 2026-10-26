import type {
  ActionDef,
  ActionId,
  Content,
  GameState,
  Result,
} from '../types/game'
import { own } from '../core/record'
import { describeCondition, firstUnmet } from './conditions'
import { effectiveActionId, resolveDay } from './economy'

/** Hành động có chọn được không; lỗi kèm lý do. */
export function checkAction(
  state: GameState,
  content: Content,
  id: ActionId,
): Result<ActionDef> {
  const action = own(content.actions, id)
  if (!action) return { ok: false, error: `unknown action "${id}"` }
  if (action.once && own(state.claimed, id))
    return { ok: false, error: `already claimed "${id}"` }
  const unmet = firstUnmet(state, content, action.requires)
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
  const id = effectiveActionId(state, content)
  // Không chọn gì: không có hiệu ứng, nhưng sinh hoạt phí vẫn tính nếu có dữ liệu kinh tế.
  if (id === null && !content.economy) return state
  const check = id === null ? null : checkAction(state, content, id)
  const applied =
    check && !check.ok
      ? check
      : resolveDay(state, content, check?.value.effects ?? [])
  if (!applied.ok)
    return {
      ...state,
      stop: { reason: 'actionBlocked', detail: `${id}: ${applied.error}` },
    }
  if (id === null || !check?.ok || !check.value.once) return applied.value
  return {
    ...applied.value,
    claimed: { ...applied.value.claimed, [id]: true },
    currentActionId: null,
    stop: { reason: 'actionCompleted', detail: id },
  }
}
