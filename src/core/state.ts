import { applyOrigin, parseIdentity, rollLife1 } from '../systems/character'
import { isValidAmount } from '../systems/resources'
import { staminaMax } from '../systems/stamina'
import type { Content, GameState, ResourceId } from '../types/game'
import { MAX_AWAY_TICKS } from './clock'
import { own } from './record'
import { seedRng } from './rng'

/**
 * Bắt đầu kiếp 1 từ trạng thái RNG và tài nguyên hiện có: tung nhân vật rồi cộng vốn xuất thân.
 * Kiếp mới dừng ở `chooseIdentity` cho tới khi người chơi chọn tên/giới tính (D32).
 * Dùng chung cho game mới và migrate save v1 (P0 chưa rút RNG nên `rng` của save v1 vẫn bằng seed).
 */
export function startLife1(
  content: Content,
  rng: number,
  resources: Readonly<Record<ResourceId, number>>,
): Pick<GameState, 'rng' | 'character' | 'resources' | 'skillXp' | 'stop'> {
  const rolled = rollLife1(content, rng)
  return {
    stop: { reason: 'chooseIdentity', detail: '' },
    rng: rolled.rng,
    character: rolled.character,
    ...applyOrigin(content, rolled.character.originId, resources),
  }
}

export function createInitialState(content: Content, seed: number): GameState {
  const base = Object.fromEntries(
    Object.values(content.resources).map((r) => [r.id, r.initial]),
  )
  const state: GameState = {
    seed: seed >>> 0,
    day: 0,
    flags: {},
    claimed: {},
    currentActionId: null,
    tichThoiTicks: 0,
    ...startLife1(content, seedRng(seed), base),
  }
  // Kiếp mới bắt đầu với Tinh lực đầy (BALANCE §3).
  const id = content.stamina.resource
  return {
    ...state,
    resources: { ...state.resources, [id]: staminaMax(state, content) },
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isUint32 = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 0xffffffff
const isTickCount = (v: unknown) =>
  Number.isSafeInteger(v) && (v as number) >= 0

/**
 * Kiểm tra mọi invariant của GameState với dữ liệu chưa tin cậy (save, import).
 * Trả về danh sách lỗi; rỗng = hợp lệ.
 */
export function validateState(value: unknown, content: Content): string[] {
  const errors = validateStateExceptStaminaCap(value, content)
  // Mức tối đa động chỉ tính được khi mọi trường khác đã hợp lệ.
  if (errors.length > 0) return errors
  const state = value as GameState
  const id = content.stamina.resource
  return (own(state.resources, id) ?? 0) > staminaMax(state, content)
    ? [`resource "${id}" above its current max`]
    : []
}

/** Như `validateState` nhưng bỏ qua trần Tinh lực động (migrate v1 kẹp Tinh lực đã lão hóa thay vì từ chối). */
export function validateStateExceptStaminaCap(
  value: unknown,
  content: Content,
): string[] {
  if (!isObj(value)) return ['state is not an object']
  const errors: string[] = []
  const s = value
  if (!isUint32(s.seed)) errors.push('seed must be uint32')
  if (!isUint32(s.rng)) errors.push('rng must be uint32')
  if (!isTickCount(s.day)) errors.push('day must be a non-negative integer')
  if (
    !isTickCount(s.tichThoiTicks) ||
    (s.tichThoiTicks as number) > MAX_AWAY_TICKS
  ) {
    errors.push('tichThoiTicks out of range')
  }

  if (!isObj(s.resources)) errors.push('resources must be an object')
  else {
    for (const def of Object.values(content.resources)) {
      if (!isValidAmount(own(s.resources, def.id), def))
        errors.push(`resource "${def.id}" invalid`)
    }
    for (const id of Object.keys(s.resources)) {
      if (!own(content.resources, id)) errors.push(`unknown resource "${id}"`)
    }
  }

  if (
    !isObj(s.flags) ||
    !Object.values(s.flags).every((v) => typeof v === 'boolean')
  ) {
    errors.push('flags must map to booleans')
  }
  if (!isObj(s.claimed) || !Object.values(s.claimed).every((v) => v === true)) {
    errors.push('claimed must map to true')
  }

  if (
    s.currentActionId !== null &&
    (typeof s.currentActionId !== 'string' ||
      !own(content.actions, s.currentActionId))
  ) {
    errors.push('currentActionId unknown')
  }

  if (s.stop !== null) {
    const stop = s.stop
    if (
      !isObj(stop) ||
      typeof stop.reason !== 'string' ||
      !STOP_REASONS.has(stop.reason) ||
      typeof stop.detail !== 'string'
    ) {
      errors.push('stop malformed')
    }
  }

  errors.push(...validateCharacter(s.character, content))
  const identity = isObj(s.character) ? s.character.identity : undefined
  const choosing = isObj(s.stop) && s.stop.reason === 'chooseIdentity'
  if ((identity === null) !== choosing)
    errors.push('identity must be null exactly while stop is chooseIdentity')

  const maxXp = content.xpTable[content.xpTable.length - 1]
  if (!isObj(s.skillXp)) errors.push('skillXp must be an object')
  else {
    for (const id of Object.keys(content.skills)) {
      const xp = own(s.skillXp, id)
      if (typeof xp !== 'number' || !(xp >= 0 && xp <= maxXp))
        errors.push(`skillXp "${id}" invalid`)
    }
    for (const id of Object.keys(s.skillXp))
      if (!own(content.skills, id)) errors.push(`unknown skill "${id}"`)
  }

  errors.push(...exactKeys(s, STATE_KEYS, 'field'))
  return errors
}

const STOP_REASONS = new Set<string>([
  'actionBlocked',
  'actionCompleted',
  'lifespanWarning',
  'death',
  'chooseIdentity',
])

const STATE_KEYS = [
  'seed',
  'rng',
  'day',
  'resources',
  'flags',
  'claimed',
  'currentActionId',
  'stop',
  'tichThoiTicks',
  'character',
  'skillXp',
]

/** Thiếu hoặc thừa khóa → lỗi; giữ save round-trip chính xác. */
function exactKeys(
  obj: Record<string, unknown>,
  keys: readonly string[],
  what: string,
): string[] {
  const errors: string[] = []
  for (const key of Object.keys(obj))
    if (!keys.includes(key)) errors.push(`unknown ${what} "${key}"`)
  for (const key of keys)
    if (!Object.hasOwn(obj, key)) errors.push(`missing ${what} "${key}"`)
  return errors
}

function validateCharacter(value: unknown, content: Content): string[] {
  if (!isObj(value)) return ['character must be an object']
  const errors = exactKeys(
    value,
    ['identity', 'linhCan', 'ngoTinh', 'originId', 'innateTrait'],
    'character field',
  )
  const { identity, linhCan, ngoTinh, originId, innateTrait } = value

  // Tên lưu phải đúng dạng đã chuẩn hóa (parseIdentity không đổi gì).
  if (identity !== null) {
    const parsed =
      isObj(identity) &&
      exactKeys(identity, ['name', 'gender'], '').length === 0
        ? parseIdentity(content, identity.name, identity.gender)
        : undefined
    if (!parsed?.ok || !isObj(identity) || parsed.value.name !== identity.name)
      errors.push('character.identity invalid')
  }

  const lcDef =
    isObj(linhCan) && typeof linhCan.id === 'string'
      ? own(content.linhCan, linhCan.id)
      : undefined
  const elements = isObj(linhCan) ? linhCan.elements : undefined
  const known = content.elements.map((e) => e.id)
  if (
    !lcDef ||
    !isObj(linhCan) ||
    exactKeys(linhCan, ['id', 'elements'], '').length > 0 ||
    !Array.isArray(elements) ||
    elements.length !== lcDef.elements ||
    new Set(elements).size !== elements.length ||
    !elements.every((e) => typeof e === 'string' && known.includes(e))
  )
    errors.push('character.linhCan invalid')

  const { min, max } = content.ngoTinh
  if (typeof ngoTinh !== 'number' || !(ngoTinh >= min && ngoTinh <= max))
    errors.push('character.ngoTinh out of range')

  if (typeof originId !== 'string' || !own(content.origins, originId))
    errors.push('character.originId unknown')

  const trait =
    isObj(innateTrait) && typeof innateTrait.id === 'string'
      ? own(content.traits, innateTrait.id)
      : undefined
  if (
    !trait ||
    !isObj(innateTrait) ||
    exactKeys(innateTrait, ['id', 'tier'], '').length > 0 ||
    !Number.isInteger(innateTrait.tier) ||
    (innateTrait.tier as number) < 1 ||
    (innateTrait.tier as number) > trait.tiers.length
  )
    errors.push('character.innateTrait invalid')
  return errors
}
