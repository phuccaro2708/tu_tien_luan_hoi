import type { Content, Effect, GameState, Result } from '../types/game'
import { own } from '../core/record'
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
  let deltas: Record<string, number> = {}
  let flags = state.flags
  for (const effect of effects) {
    switch (effect.type) {
      case 'addResource': {
        const sum = (own(deltas, effect.resource) ?? 0) + effect.amount
        deltas = { ...deltas, [effect.resource]: sum }
        break
      }
      case 'setFlag':
        flags = { ...flags, [effect.flag]: effect.value }
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
