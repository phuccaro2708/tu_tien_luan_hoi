import { own } from '../core/record'
import type { Content, GameState } from '../types/game'
import { ageYears, lifespanYears } from './lifespan'
import { innateTraitTier, skillLevel } from './skills'

/** Tinh lực tối đa hiện tại (PROGRESSION §6, D35). Mốc lão hóa tính bằng phần trăm nguyên để không lệch số thực. */
export function staminaMax(state: GameState, content: Content): number {
  const r = content.stamina
  const fromSkill = Math.min(
    r.maxSkillBonus,
    skillLevel(state, content, r.skill) * r.perLevel,
  )
  const agingFrom = Math.floor(
    (r.agingFromPercent * lifespanYears(state, content)) / 100,
  )
  const aged = Math.max(0, ageYears(state, content) - agingFrom)
  const trait = innateTraitTier(state, content).stamina ?? 0
  return Math.max(0, r.base + fromSkill + trait - r.agingPerYear * aged)
}

/** Kẹp Tinh lực đang có về mức tối đa (mức tối đa giảm khi già đi). */
export function clampStamina(state: GameState, content: Content): GameState {
  const id = content.stamina.resource
  const max = staminaMax(state, content)
  return (own(state.resources, id) ?? 0) > max
    ? { ...state, resources: { ...state.resources, [id]: max } }
    : state
}
