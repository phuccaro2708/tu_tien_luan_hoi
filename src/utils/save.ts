import { SPEEDS, type Speed } from '../core/clock'
import { hashState } from '../core/hash'
import { validateState } from '../core/state'
import { simulateAway } from '../systems/offline'
import type { Content, GameState, Result } from '../types/game'

export const SAVE_VERSION = 1
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

/** Đọc chuỗi save chưa tin cậy (localStorage hoặc import). Không chạm storage. */
export function parseSave(
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
  const { version, savedAt, speed, state } = data as Record<string, unknown>
  // ponytail: chỉ có v1; thêm bảng migrate vN → vN+1 khi có v2.
  if (version !== SAVE_VERSION)
    return { ok: false, error: `unsupported save version ${String(version)}` }
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt))
    return { ok: false, error: 'bad savedAt' }
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
 */
export function bootSave(
  storage: SaveStorage,
  content: Content,
  now: number,
): BootResult {
  const errors: string[] = []
  let canWrite = true
  try {
    for (const key of [SAVE_KEY, SAVE_BACKUP_KEY]) {
      const text = storage.getItem(key)
      if (text !== null && !parseSave(text, content).ok) {
        storage.setItem(`${SAVE_QUARANTINE_PREFIX}${hashState(text)}`, text)
      }
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
