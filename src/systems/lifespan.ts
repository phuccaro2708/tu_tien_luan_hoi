import type { Content, GameState } from '../types/game'
import { innateTraitTier, skillLevel } from './skills'

/**
 * ThọNguyên (năm) = base + min(trần, floor(Thể Phách / 5)) + thiên phú (PROGRESSION §6).
 * Phần `3 × tầng Luyện Khí` và `− thọ nguyên đã mất` thêm cùng S9 (P3/P4).
 */
export function lifespanYears(state: GameState, content: Content): number {
  const rules = content.lifespan
  const fromSkill = Math.min(
    rules.maxSkillYears,
    Math.floor(skillLevel(state, content, rules.skill) / rules.levelsPerYear),
  )
  return rules.base + fromSkill + innateTraitTier(state, content).lifespan
}

/** Số ngày còn lại tới khi tuổi ≥ thọ nguyên; ≤ 0 = đã tới lúc chết. */
export function daysLeft(state: GameState, content: Content): number {
  const { daysPerYear, startAgeYears } = content.calendar
  return (
    (lifespanYears(state, content) - startAgeYears) * daysPerYear - state.day
  )
}

/**
 * Bước cuối của tick (IMPLEMENTATION_PLAN §1, bước 8): so `before` (đầu tick) với `after`.
 * - Tuổi ≥ thọ nguyên → chết đúng tick đó (tất định); ghi đè mọi điểm dừng khác.
 * - Số năm còn lại vừa chạm một mốc cảnh báo → tạm dừng; ghi đè điểm dừng thường
 *   (VD hoàn thành hành động một lần) vì cảnh báo không được phép mất.
 */
export function checkLifespan(
  before: GameState,
  after: GameState,
  content: Content,
): GameState {
  const left = daysLeft(after, content)
  if (left <= 0)
    return {
      ...after,
      stop: { reason: 'death', detail: String(lifespanYears(after, content)) },
    }
  const prevLeft = daysLeft(before, content)
  const { daysPerYear } = content.calendar
  const crossed = content.lifespan.warnYears.filter(
    (y) => prevLeft > y * daysPerYear && left <= y * daysPerYear,
  )
  if (crossed.length === 0) return after
  return {
    ...after,
    stop: { reason: 'lifespanWarning', detail: String(Math.min(...crossed)) },
  }
}
