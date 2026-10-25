import type { Condition, GameState } from '../types/game'

export function evaluateCondition(
  state: GameState,
  condition: Condition,
): boolean {
  switch (condition.type) {
    case 'resourceAtLeast':
      return (state.resources[condition.resource] ?? 0) >= condition.amount
    case 'flag':
      return (state.flags[condition.flag] ?? false) === condition.value
  }
}

/** Điều kiện đầu tiên không thỏa (để hiển thị lý do), hoặc null nếu thỏa hết. */
export function firstUnmet(
  state: GameState,
  conditions: readonly Condition[],
): Condition | null {
  return conditions.find((c) => !evaluateCondition(state, c)) ?? null
}

export function describeCondition(condition: Condition): string {
  switch (condition.type) {
    case 'resourceAtLeast':
      return `${condition.resource} >= ${condition.amount}`
    case 'flag':
      return `${condition.flag} = ${condition.value}`
  }
}
