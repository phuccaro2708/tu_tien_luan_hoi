import { create } from 'zustand'
import {
  advanceClock,
  createClock,
  setClockSpeed,
  type ClockState,
  type Speed,
} from '../core/clock'
import { applyCommand, runTicks } from '../core/engine'
import { createInitialState } from '../core/state'
import { content } from '../data/content'
import { spendTichThoi } from '../systems/offline'
import type { Command, GameState } from '../types/game'
import { bootSave, writeSave, type SaveStorage } from '../utils/save'

// Store chỉ giữ GameState và gọi engine; không chứa luật chơi.
const AUTOSAVE_MS = 30_000 // SYSTEMS S14
const MAX_TICKS_PER_FRAME = 20 // phần còn nợ dồn sang frame sau (SYSTEMS S1)
const SAVE_LOCK = 'ttlh.save'
const OTHER_TAB =
  'Game đang mở ở tab khác; tab này tạm dừng và sẽ tiếp tục từ save mới nhất khi tab kia đóng.'
// Web Locks chỉ có trong secure context: trang HTTP (VD preview qua IP LAN) cũng không có.
const NO_LOCKS =
  globalThis.isSecureContext === false
    ? 'Trang không chạy qua HTTPS hoặc localhost nên trình duyệt tắt Web Locks; tab này không lưu được (tránh hai tab ghi đè nhau).'
    : 'Trình duyệt không hỗ trợ Web Locks nên không lưu được (tránh hai tab ghi đè nhau). Hãy cập nhật trình duyệt.'

const storage: SaveStorage | null =
  typeof localStorage === 'undefined' ? null : localStorage

interface GameStore {
  game: GameState
  speed: Speed
  /** Tick đã chạy khi vắng mặt (lúc mở game). */
  offlineTicks: number
  error: string | null
  /** Lần ghi save gần nhất thất bại (VD hết quota); ghi được thì xóa. Tách khỏi `error` để lệnh chơi không xóa nó. */
  saveError: string | null
  /** Khác null = tab này không được ghi save (save hỏng chưa cách ly được, hoặc tab khác đang giữ). */
  saveBlocked: string | null
  frame: (frameNow: number, wallNow: number) => void
  setSpeed: (speed: Speed, frameNow: number) => void
  /** Lệnh áp tại `frameNow`: thời gian trước đó được hạch toán trước (đang dừng thì bỏ). */
  dispatch: (command: Command, frameNow: number) => void
  spendTichThoi: (frameNow: number) => void
  /** Hạch toán hết thời gian online tới `frameNow` rồi ghi với mốc `wallNow`. */
  save: (frameNow: number, wallNow: number) => void
}

// Hạch toán thời gian nằm ngoài React state.
// `savedAt`: mốc thời gian thực mà `game` đã được hạch toán tới; chỉ tăng (đồng hồ lùi không cấp lại thời gian).
let savedAt = 0
// Mốc clock (đơn điệu) của lần lưu gần nhất: đồng hồ hệ thống lùi không làm ngừng autosave.
let lastSaveMs = 0
// null = chưa boot. Một writer cho một save: chỉ đọc, cách ly và ghi save sau khi giữ khóa (N01).
let clock: ClockState | null = null
let behind = false // frame gần nhất chạm MAX_TICKS_PER_FRAME, còn tick nợ
const locks = typeof navigator === 'undefined' ? undefined : navigator.locks

/**
 * Đọc save + mô phỏng vắng mặt. Writer (giữ khóa) còn cách ly bản hỏng;
 * `readOnly` (không có Web Locks): chơi được nhưng không ghi gì vào storage.
 */
function boot(now: number, readOnly = false) {
  const booted = storage ? bootSave(storage, content, now, readOnly) : null
  const speed = booted?.speed ?? 1
  savedAt = booted?.savedAt ?? now
  // Clock chạy từ lúc boot, không đợi frame đầu: tab tải (hoặc nhận khóa) khi đang ẩn vẫn tính giờ ẩn là online.
  clock = createClock(performance.now(), speed)
  lastSaveMs = clock.lastMs
  behind = false
  return {
    game: booted?.state ?? createInitialState(content, now >>> 0),
    speed,
    offlineTicks: booted?.offlineTicks ?? 0,
    error: booted?.error ?? null,
    saveError: null,
    saveBlocked: readOnly
      ? NO_LOCKS
      : booted && !booted.canWrite
        ? booted.error
        : null,
  }
}

/** Chạy tick online đến hạn (tối đa `maxTicks`). */
function settle(game: GameState, frameNow: number, maxTicks: number) {
  if (!clock) return game
  const adv = advanceClock(clock, frameNow, {
    paused: game.stop !== null,
    maxTicks,
  })
  clock = adv.clock
  behind = adv.ticks >= maxTicks
  return adv.ticks > 0 ? runTicks(game, content, adv.ticks).state : game
}

// Trình duyệt không có Web Locks: tải ngay, chơi được nhưng không lưu (không phân biệt được tab nào là writer).
// Có Web Locks: hiển thị game mới tạm thời, chưa chạy gì cho tới khi nhận khóa.
const initial = locks
  ? {
      game: createInitialState(content, Date.now() >>> 0),
      speed: 1 as Speed,
      offlineTicks: 0,
      error: null,
      saveError: null,
      saveBlocked: null,
    }
  : boot(Date.now(), true)

export const useGameStore = create<GameStore>((set, get) => ({
  ...initial,

  frame(frameNow, wallNow) {
    if (!clock) return
    const game = settle(get().game, frameNow, MAX_TICKS_PER_FRAME)
    if (game !== get().game) set({ game })
    // Đang chạy bù thì hoãn autosave: save hạch toán hết nợ trong một lần, vượt trần mỗi frame (SYSTEMS S1).
    if (!behind && clock.lastMs - lastSaveMs >= AUTOSAVE_MS)
      get().save(frameNow, wallNow)
  },

  setSpeed(speed, frameNow) {
    if (!clock) return
    set({ game: settle(get().game, frameNow, Infinity), speed })
    clock = setClockSpeed(clock, frameNow, speed)
  },

  dispatch(command, frameNow) {
    if (!clock) return
    const game = settle(get().game, frameNow, Infinity)
    const r = applyCommand(game, content, command)
    set(r.ok ? { game: r.value, error: null } : { game, error: r.error })
  },

  spendTichThoi(frameNow) {
    if (!clock) return
    const game = settle(get().game, frameNow, Infinity)
    set({ game: spendTichThoi(game, content).state })
  },

  save(frameNow, wallNow) {
    if (!clock) return
    set({ game: settle(get().game, frameNow, Infinity) })
    savedAt = Math.max(savedAt, wallNow)
    lastSaveMs = clock.lastMs
    if (!storage || get().saveBlocked) return
    const r = writeSave(storage, get().game, content, savedAt, get().speed)
    set({ saveError: r.ok ? null : r.error })
  },
}))

/**
 * Thử lấy khóa ngay; tab khác đang giữ thì báo và xếp hàng chờ.
 * Nhận khóa lúc nào cũng đọc lại save mới nhất, rồi giữ khóa tới khi đóng tab.
 * ponytail: dev HMR nạp lại module sẽ xếp hàng sau khóa của bản cũ; tải lại trang để nhận khóa.
 */
function claimSaveLock(lockManager: LockManager, ifAvailable: boolean) {
  lockManager
    .request(SAVE_LOCK, { ifAvailable }, (lock) => {
      if (!lock) {
        useGameStore.setState({ saveBlocked: OTHER_TAB })
        claimSaveLock(lockManager, false)
        return
      }
      useGameStore.setState(boot(Date.now()))
      return new Promise<never>(() => {})
    })
    .catch((e: unknown) =>
      useGameStore.setState({
        saveBlocked: `Không lấy được khóa save: ${String(e)}`,
      }),
    )
}
if (locks) claimSaveLock(locks, true)
