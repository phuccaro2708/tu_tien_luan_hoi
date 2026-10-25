import { isValidAmount } from '../systems/resources'
import type { Content, GameState } from '../types/game'
import { MAX_AWAY_TICKS } from './clock'
import { own } from './record'
import { seedRng } from './rng'

export function createInitialState(content: Content, seed: number): GameState {
  return {
    seed: seed >>> 0,
    rng: seedRng(seed),
    day: 0,
    resources: Object.fromEntries(
      Object.values(content.resources).map((r) => [r.id, r.initial]),
    ),
    flags: {},
    claimed: {},
    currentActionId: null,
    stop: null,
    tichThoiTicks: 0,
  }
}

export function ageYears(state: GameState, content: Content): number {
  return (
    content.calendar.startAgeYears +
    Math.floor(state.day / content.calendar.daysPerYear)
  )
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
      (stop.reason !== 'actionBlocked' && stop.reason !== 'actionCompleted') ||
      typeof stop.detail !== 'string'
    ) {
      errors.push('stop malformed')
    }
  }

  const known = new Set([
    'seed',
    'rng',
    'day',
    'resources',
    'flags',
    'claimed',
    'currentActionId',
    'stop',
    'tichThoiTicks',
  ])
  for (const key of Object.keys(s))
    if (!known.has(key)) errors.push(`unknown field "${key}"`)
  for (const key of known)
    if (!Object.hasOwn(s, key)) errors.push(`missing field "${key}"`)
  return errors
}
