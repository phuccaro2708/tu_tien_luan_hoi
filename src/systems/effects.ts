import type { Content, Effect, GameState, Result } from '../types/game'
import { applyResourceDeltas } from './resources'

/**
 * Áp danh sách hiệu ứng nguyên khối: hoặc tất cả, hoặc không gì.
 * Các thay đổi tài nguyên được gộp thành một delta ròng trước khi kiểm tra,
 * nên thu nhập trong cùng danh sách được tính trước chi phí (D23).
 */
export function resolveEffects(
  state: GameState,
  content: Content,
  effects: readonly Effect[],
): Result<GameState> {
  const deltas: Record<string, number> = {}
  let flags = state.flags
  for (const effect of effects) {
    switch (effect.type) {
      case 'addResource':
        deltas[effect.resource] = (deltas[effect.resource] ?? 0) + effect.amount
        break
      case 'setFlag':
        if (flags === state.flags) flags = { ...flags }
        flags[effect.flag] = effect.value
        break
    }
  }
  const resources = applyResourceDeltas(
    state.resources,
    content.resources,
    deltas,
  )
  if (!resources.ok) return resources
  return { ok: true, value: { ...state, resources: resources.value, flags } }
}
