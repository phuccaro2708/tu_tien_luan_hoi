import { own } from '../core/record'
import type { Condition, Content, GameState } from '../types/game'
import { skillLevel } from './skills'

export function evaluateCondition(
  state: GameState,
  content: Content,
  condition: Condition,
): boolean {
  switch (condition.type) {
    case 'resourceAtLeast':
      return (own(state.resources, condition.resource) ?? 0) >= condition.amount
    case 'flag':
      return (own(state.flags, condition.flag) ?? false) === condition.value
    case 'skillAtLeast':
      return skillLevel(state, content, condition.skill) >= condition.level
  }
}

/** Điều kiện đầu tiên không thỏa (để hiển thị lý do), hoặc null nếu thỏa hết. */
export function firstUnmet(
  state: GameState,
  content: Content,
  conditions: readonly Condition[],
): Condition | null {
  return conditions.find((c) => !evaluateCondition(state, content, c)) ?? null
}

export function describeCondition(condition: Condition): string {
  switch (condition.type) {
    case 'resourceAtLeast':
      return `${condition.resource} >= ${condition.amount}`
    case 'flag':
      return `${condition.flag} = ${condition.value}`
    case 'skillAtLeast':
      return `${condition.skill} >= ${condition.level}`
  }
}
