import { validateState } from '../core/state'
import { simulateAway } from '../systems/offline'
import type { Content, GameState, Result } from '../types/game'

export const SAVE_VERSION = 1
export const SAVE_KEY = 'ttlh.save'
export const SAVE_BACKUP_KEY = 'ttlh.save.bak'
export const SAVE_TEMP_KEY = 'ttlh.save.tmp'

export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface LoadedSave {
  state: GameState
  savedAt: number
}

/** Chuỗi save `{ version, savedAt, state }`. Từ chối state không hợp lệ (VD NaN thành null khi stringify). */
export function serializeSave(
  state: GameState,
  content: Content,
  savedAt: number,
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
    value: JSON.stringify({ version: SAVE_VERSION, savedAt, state }),
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
  const { version, savedAt, state } = data as Record<string, unknown>
  // ponytail: chỉ có v1; thêm bảng migrate vN → vN+1 khi có v2.
  if (version !== SAVE_VERSION)
    return { ok: false, error: `unsupported save version ${String(version)}` }
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt))
    return { ok: false, error: 'bad savedAt' }
  const errors = validateState(state, content)
  if (errors.length > 0)
    return { ok: false, error: `invalid state: ${errors.join('; ')}` }
  return { ok: true, value: { state: state as GameState, savedAt } }
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
): Result<void> {
  const text = serializeSave(state, content, now)
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

export const SAVE_QUARANTINE_PREFIX = 'ttlh.save.corrupt.'

export interface BootResult {
  /** null = không có save dùng được; người gọi tạo game mới. */
  state: GameState | null
  offlineTicks: number
  error: string | null
}

/**
 * Mở game: đọc save, mô phỏng thời gian vắng mặt đúng một lần, ghi lại với `savedAt = now`.
 * Save chính hoặc backup không đọc được thì được chép nguyên văn sang khóa cách ly
 * trước mọi lần ghi, để autosave về sau không xóa mất nó (VD dữ liệu đổi giữa các phase).
 */
export function bootSave(
  storage: SaveStorage,
  content: Content,
  now: number,
): BootResult {
  let quarantineError: string | null = null
  try {
    for (const key of [SAVE_KEY, SAVE_BACKUP_KEY]) {
      const text = storage.getItem(key)
      if (text !== null && !parseSave(text, content).ok) {
        storage.setItem(`${SAVE_QUARANTINE_PREFIX}${key}.${now}`, text)
      }
    }
  } catch (e) {
    quarantineError = `could not quarantine bad save: ${String(e)}`
  }

  const loaded = readSave(storage, content)
  if (!loaded.ok) {
    const error = loaded.error === 'no save' ? quarantineError : loaded.error
    return { state: null, offlineTicks: 0, error }
  }
  const away = simulateAway(
    loaded.value.state,
    content,
    now - loaded.value.savedAt,
  )
  const written = writeSave(storage, away.state, content, now)
  return {
    state: away.state,
    offlineTicks: away.ticksRun,
    error: quarantineError ?? (written.ok ? null : written.error),
  }
}
