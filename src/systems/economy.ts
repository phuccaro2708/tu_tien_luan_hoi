import { own } from '../core/record'
import type {
  ActionId,
  Content,
  Effect,
  GameState,
  Result,
} from '../types/game'
import { resolveEffects } from './effects'
import { applyResourceDeltas } from './resources'
import { staminaMax } from './stamina'

/** Vào/ra trạng thái nghỉ theo ngưỡng Tinh lực (có trễ: nghỉ khi < restBelow, làm lại khi ≥ restUntil). */
export function updateResting(state: GameState, content: Content): GameState {
  const eco = content.economy
  if (!eco) return state
  const stamina = own(state.resources, content.stamina.resource) ?? 0
  const until = Math.min(eco.restUntil, staminaMax(state, content))
  const resting =
    stamina < eco.restBelow ? true : stamina >= until ? false : state.resting
  return resting === state.resting ? state : { ...state, resting }
}

/** Hành động thật sự chạy hôm nay: đang nghỉ thì Nghỉ ngơi thay hành động đã chọn. Không chọn gì → không chạy gì. */
export function effectiveActionId(
  state: GameState,
  content: Content,
): ActionId | null {
  if (state.currentActionId === null) return null
  return state.resting && content.economy
    ? content.economy.restAction
    : state.currentActionId
}

/** Đói: XP và Tinh lực hồi nhân hệ số; thu nhập và chi phí giữ nguyên. */
function hungerScaled(
  effects: readonly Effect[],
  content: Content,
  factor: number,
): Effect[] {
  return effects.map((e) => {
    if (e.type === 'addSkillXp') return { ...e, amount: e.amount * factor }
    if (
      e.type === 'addResource' &&
      e.resource === content.stamina.resource &&
      e.amount > 0
    )
      return { ...e, amount: e.amount * factor }
    return e
  })
}

/**
 * Áp hiệu ứng của một ngày rồi hạch toán sinh hoạt phí (D23): thu nhập cộng trước, phí trừ sau.
 * Đủ trả → trừ phí. Không đủ → không trừ, không nợ, Đói đúng ngày đó (XP và hồi Tinh lực ×hệ số).
 * Không có dữ liệu kinh tế → chỉ áp hiệu ứng.
 */
export function resolveDay(
  state: GameState,
  content: Content,
  effects: readonly Effect[],
): Result<GameState> {
  const eco = content.economy
  if (!eco) return resolveEffects(state, content, effects)
  const full = resolveEffects(state, content, effects)
  if (!full.ok) return full
  const money = own(full.value.resources, eco.moneyResource) ?? 0
  if (money >= eco.livingCost) {
    return {
      ok: true,
      value: {
        ...full.value,
        resources: {
          ...full.value.resources,
          [eco.moneyResource]: money - eco.livingCost,
        },
        hungry: false,
      },
    }
  }
  const scaled = resolveEffects(
    state,
    content,
    hungerScaled(effects, content, eco.hungerMultiplier),
  )
  return scaled.ok
    ? { ok: true, value: { ...scaled.value, hungry: true } }
    : scaled
}

/** Khởi tạo phần kinh tế của kiếp: nợ, cờ khởi đầu và hạn nợ theo xuất thân. Không dữ liệu → giữ nguyên. */
export function startEconomy(content: Content, state: GameState): GameState {
  const eco = content.economy
  const origin = eco && own(eco.origins, state.character.originId)
  if (!eco || !origin) return state
  return {
    ...state,
    resources: { ...state.resources, [eco.debtResource]: origin.debt },
    flags: {
      ...state.flags,
      ...Object.fromEntries(origin.flags.map((f) => [f, true])),
    },
    hanNo: origin.debt > 0 ? state.day + eco.debtDueDays : null,
  }
}

/** Trả nợ bằng văn. Số lượng phải dương, hữu hạn, không vượt văn đang có hay nợ còn lại. */
export function repayDebt(
  state: GameState,
  content: Content,
  amount: number,
): Result<GameState> {
  const eco = content.economy
  if (!eco) return { ok: false, error: 'no debt in this game' }
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, error: 'amount must be positive' }
  const paid = applyResourceDeltas(state.resources, content.resources, {
    [eco.moneyResource]: -amount,
    [eco.debtResource]: -amount,
  })
  return paid.ok
    ? { ok: true, value: { ...state, resources: paid.value } }
    : { ok: false, error: `cannot repay: ${paid.error}` }
}
