import { SPEEDS, type Speed } from '../core/clock'
import { hashState } from '../core/hash'
import {
  startLife1,
  validateState,
  validateStateExceptStaminaCap,
} from '../core/state'
import { simulateAway } from '../systems/offline'
import { clampStamina } from '../systems/stamina'
import type { Content, GameState, Result } from '../types/game'

export const SAVE_VERSION = 2
export const SAVE_KEY = 'ttlh.save'
export const SAVE_BACKUP_KEY = 'ttlh.save.bak'
export const SAVE_TEMP_KEY = 'ttlh.save.tmp'
export const SAVE_QUARANTINE_PREFIX = 'ttlh.save.corrupt.'

export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface LoadedSave {
  state: GameState
  /** Mốc thời gian thực mà `state` đã được hạch toán tới. */
  savedAt: number
  /** Tùy chọn giao diện, ngoài GameState (SYSTEMS S1). Thiếu hoặc sai → 1×. */
  speed: Speed
}

/** Chuỗi save `{ version, savedAt, speed, state }`. Từ chối state không hợp lệ (VD NaN thành null khi stringify). */
export function serializeSave(
  state: GameState,
  content: Content,
  savedAt: number,
  speed: Speed = 1,
): Result<string> {
  const errors = validateState(state, content)
  if (errors.length > 0)
    return {
      ok: false,
      error: `refusing to save invalid state: ${errors.join('; ')}`,
    }
  if (!Number.isFinite(savedAt))
    return { ok: false, error: 'savedAt must be finite' }
  return {
    ok: true,
    value: JSON.stringify({ version: SAVE_VERSION, savedAt, speed, state }),
  }
}

/**
 * v1 (P0) → v2: thêm nhân vật kiếp 1 và kỹ năng; dừng ở `chooseIdentity` để người chơi đặt tên (D32).
 * `stop` cũ bị bỏ: bản P0 phát hành không có hành động nào nên không có điểm dừng thật.
 * P0 chưa rút RNG nên `rng` của save v1 vẫn bằng seed: tung từ đó cho đúng kiếp 1 của game mới cùng seed.
 * Kiểm mọi trường v1 (nguyên trạng, chưa dùng hay biến đổi gì) trước khi migrate: v2 chỉ thêm trường,
 * nên trường v1 phải hợp lệ theo luật v2, cộng giới hạn riêng của v1. Ngoại lệ duy nhất là trần Tinh lực
 * đã lão hóa (D35): Tinh lực v1 hợp lệ mà vượt trần thì kẹp, không từ chối.
 */
function migrateV1(state: unknown, content: Content): Result<unknown> {
  if (typeof state !== 'object' || state === null || Array.isArray(state))
    return { ok: false, error: 'v1 state is not an object' }
  const v1 = state as Record<string, unknown>
  if (Object.hasOwn(v1, 'character') || Object.hasOwn(v1, 'skillXp'))
    return { ok: false, error: 'v1 state has v2 fields' }
  // Trường v2 lấy từ một nhân vật giả (RNG 0) chỉ để kiểm trường v1; `stop` của v1 bị thay bằng
  // `chooseIdentity` nên không cần kiểm.
  const trial = {
    ...v1,
    ...startLife1(content, 0, {}),
    rng: v1.rng,
    resources: v1.resources,
  }
  const errors = validateStateExceptStaminaCap(trial, content)
  if (errors.length > 0)
    return { ok: false, error: `invalid v1 state: ${errors.join('; ')}` }
  const resources = v1.resources as Record<string, number>
  const id = content.stamina.resource
  if ((resources[id] ?? 0) > V1_STAMINA_MAX)
    return { ok: false, error: `invalid v1 state: resource "${id}" invalid` }
  const migrated = {
    ...v1,
    ...startLife1(content, v1.rng as number, resources),
  }
  return { ok: true, value: clampStamina(migrated as GameState, content) }
}

/** Trần Tinh lực của bản P0 (save v1); v2 nâng trần tuyệt đối lên 140 (D35). */
const V1_STAMINA_MAX = 100

/** Bảng migrate tuần tự: MIGRATIONS[n] đưa state vN lên vN+1. Kết quả cuối được validate đầy đủ. */
const MIGRATIONS: Record<
  number,
  (state: unknown, content: Content) => Result<unknown>
> = { 1: migrateV1 }

/**
 * Đọc chuỗi save chưa tin cậy (localStorage hoặc import), migrate lên bản hiện tại. Không chạm storage.
 * Không bao giờ throw: dữ liệu hỏng kiểu gì cũng thành lỗi, để người gọi còn thử backup.
 */
export function parseSave(
  text: string | null,
  content: Content,
): Result<LoadedSave> {
  try {
    return parseSaveText(text, content)
  } catch (e) {
    return { ok: false, error: `save could not be read: ${String(e)}` }
  }
}

function parseSaveText(
  text: string | null,
  content: Content,
): Result<LoadedSave> {
  if (text === null) return { ok: false, error: 'no save' }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'save is not valid JSON' }
  }
  if (typeof data !== 'object' || data === null)
    return { ok: false, error: 'save is not an object' }
  const {
    version,
    savedAt,
    speed,
    state: raw,
  } = data as Record<string, unknown>
  if (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version < 1 ||
    version > SAVE_VERSION
  )
    return { ok: false, error: `unsupported save version ${String(version)}` }
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt))
    return { ok: false, error: 'bad savedAt' }
  let state = raw
  for (let v = version; v < SAVE_VERSION; v++) {
    const migrated = MIGRATIONS[v](state, content)
    if (!migrated.ok) return migrated
    state = migrated.value
  }
  const errors = validateState(state, content)
  if (errors.length > 0)
    return { ok: false, error: `invalid state: ${errors.join('; ')}` }
  return {
    ok: true,
    value: {
      state: state as GameState,
      savedAt,
      speed: SPEEDS.find((s) => s === speed) ?? 1,
    },
  }
}

/**
 * Ghi an toàn: khóa tạm → đọc lại & validate → chép save tốt hiện tại sang backup → ghi khóa chính.
 * Bất kỳ bước nào lỗi (kể cả quota) thì save chính không bị đổi.
 */
export function writeSave(
  storage: SaveStorage,
  state: GameState,
  content: Content,
  now: number,
  speed: Speed = 1,
): Result<void> {
  const text = serializeSave(state, content, now, speed)
  if (!text.ok) return text
  try {
    storage.setItem(SAVE_TEMP_KEY, text.value)
    const check = parseSave(storage.getItem(SAVE_TEMP_KEY), content)
    if (!check.ok)
      return {
        ok: false,
        error: `temp save failed verification: ${check.error}`,
      }
    const current = storage.getItem(SAVE_KEY)
    if (current !== null && parseSave(current, content).ok)
      storage.setItem(SAVE_BACKUP_KEY, current)
    storage.setItem(SAVE_KEY, text.value)
    storage.removeItem(SAVE_TEMP_KEY)
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `storage error: ${String(e)}` }
  }
}

/** Đọc save chính; hỏng thì thử backup. Không bao giờ ghi đè. */
export function readSave(
  storage: SaveStorage,
  content: Content,
): Result<LoadedSave> {
  try {
    const main = parseSave(storage.getItem(SAVE_KEY), content)
    if (main.ok) return main
    const backup = parseSave(storage.getItem(SAVE_BACKUP_KEY), content)
    return backup.ok ? backup : main
  } catch (e) {
    return { ok: false, error: `storage error: ${String(e)}` }
  }
}

/** Cất `text` dưới tên theo hash; khóa đã giữ nội dung khác (va chạm hash) thì thêm hậu tố, không ghi đè. */
function quarantine(storage: SaveStorage, text: string) {
  const base = `${SAVE_QUARANTINE_PREFIX}${hashState(text)}`
  let key = base
  for (let i = 1; ; i++) {
    const existing = storage.getItem(key)
    if (existing === text) return
    if (existing === null) break
    key = `${base}.${i}`
  }
  storage.setItem(key, text)
}

export interface BootResult {
  /** null = không có save dùng được; người gọi tạo game mới. */
  state: GameState | null
  speed: Speed
  /** Mốc đã hạch toán: không bao giờ nhỏ hơn `savedAt` cũ, kể cả khi đồng hồ lùi. */
  savedAt: number
  offlineTicks: number
  /** false = có save không đọc được mà chưa cách ly được; phải chặn mọi lần ghi để không mất nó. */
  canWrite: boolean
  error: string | null
}

/**
 * Mở game: cách ly save không đọc được, đọc save, mô phỏng thời gian vắng mặt.
 * Không ghi save: mô phỏng tất định nên mở lại trước lần ghi kế tiếp cho cùng kết quả.
 * Bản cách ly đặt tên theo hash nội dung, mở lại nhiều lần không sinh thêm bản sao.
 * `readOnly`: tab không được ghi storage (kể cả bản cách ly); người gọi phải chặn mọi lần ghi.
 */
export function bootSave(
  storage: SaveStorage,
  content: Content,
  now: number,
  readOnly = false,
): BootResult {
  const errors: string[] = []
  let canWrite = !readOnly
  try {
    if (!readOnly)
      for (const key of [SAVE_KEY, SAVE_BACKUP_KEY]) {
        const text = storage.getItem(key)
        if (text !== null && !parseSave(text, content).ok)
          quarantine(storage, text)
      }
  } catch (e) {
    canWrite = false
    errors.push(`could not quarantine unreadable save: ${String(e)}`)
  }

  const loaded = readSave(storage, content)
  if (!loaded.ok) {
    if (loaded.error !== 'no save') errors.unshift(loaded.error)
    return {
      state: null,
      speed: 1,
      savedAt: now,
      offlineTicks: 0,
      canWrite,
      error: errors.join('; ') || null,
    }
  }
  const { state, savedAt, speed } = loaded.value
  const away = simulateAway(state, content, now - savedAt)
  return {
    state: away.state,
    speed,
    savedAt: Math.max(savedAt, now),
    offlineTicks: away.ticksRun,
    canWrite,
    error: errors.join('; ') || null,
  }
}
