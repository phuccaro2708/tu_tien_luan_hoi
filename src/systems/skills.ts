import { own } from '../core/record'
import type { Content, GameState, SkillId, TraitTier } from '../types/game'

/** Cấp ứng với XP cộng dồn: cấp lớn nhất có xpTable[cấp] ≤ xp. */
export function levelForXp(content: Content, xp: number): number {
  const table = content.xpTable
  let level = 0
  while (level + 1 < table.length && table[level + 1] <= xp) level++
  return level
}

export function skillLevel(
  state: GameState,
  content: Content,
  skill: SkillId,
): number {
  return levelForXp(content, own(state.skillXp, skill) ?? 0)
}

/** Bậc đang có của thiên phú bẩm sinh. */
export function innateTraitTier(state: GameState, content: Content): TraitTier {
  const { id, tier } = state.character.innateTrait
  return content.traits[id].tiers[tier - 1]
}

/**
 * Hệ số XP của nhân vật cho một kỹ năng (PROGRESSION §5): Ngộ (kỹ năng trí trừ Giao Tế) × Thiên phú.
 * Hệ số Ký ức (luân hồi, P4/P6) và Trạng thái (Đói, chờ D23) chưa có nên bằng 1.
 */
export function xpMultiplier(
  state: GameState,
  content: Content,
  skill: SkillId,
): number {
  const ngo = own(content.skills, skill)?.ngo ? state.character.ngoTinh : 1
  return ngo * (own(innateTraitTier(state, content).xp, skill) ?? 1)
}

/** Cộng XP gốc × hệ số; dừng ở cấp tối đa. Một lần cộng có thể nhảy nhiều cấp. */
export function gainSkillXp(
  state: GameState,
  content: Content,
  skill: SkillId,
  baseXp: number,
): GameState {
  if (!own(content.skills, skill) || !(baseXp > 0)) return state
  const maxXp = content.xpTable[content.xpTable.length - 1]
  const current = own(state.skillXp, skill) ?? 0
  const xp = Math.min(
    maxXp,
    current + baseXp * xpMultiplier(state, content, skill),
  )
  return xp === current
    ? state
    : { ...state, skillXp: { ...state.skillXp, [skill]: xp } }
}
