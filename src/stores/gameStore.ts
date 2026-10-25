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
import { simulateAway, spendTichThoi } from '../systems/offline'
import type { Command, GameState } from '../types/game'
import { bootSave, writeSave, type SaveStorage } from '../utils/save'

// Store chỉ giữ GameState và gọi engine; không chứa luật chơi.
const AUTOSAVE_MS = 30_000 // SYSTEMS S14
const MAX_TICKS_PER_FRAME = 20 // phần còn nợ dồn sang frame sau (SYSTEMS S1)
const SAVE_LOCK = 'ttlh.save'

const storage: SaveStorage | null =
  typeof localStorage === 'undefined' ? null : localStorage

interface GameStore {
  game: GameState
  speed: Speed
  /** Tick đã chạy khi vắng mặt (mở game hoặc quay lại tab). */
  offlineTicks: number
  error: string | null
  /** Khác null = tab này không được ghi save (save hỏng chưa cách ly được, hoặc tab khác đang giữ). */
  saveBlocked: string | null
  frame: (frameNow: number, wallNow: number) => void
  setSpeed: (speed: Speed, frameNow: number) => void
  dispatch: (command: Command) => void
  spendTichThoi: () => void
  /** Hạch toán hết thời gian online tới `frameNow` rồi ghi với mốc `wallNow`. */
  save: (frameNow: number, wallNow: number) => void
  /** Tab bị ẩn: hạch toán tới lúc ẩn, ghi; thời gian ẩn tính như offline. */
  hide: (frameNow: number, wallNow: number) => void
  /** Tab hiện lại: mô phỏng thời gian ẩn qua đường offline, neo clock lại. */
  show: (frameNow: number, wallNow: number) => void
}

// Tải + offline chạy đúng một lần khi nạp module (không trong useEffect, tránh StrictMode chạy đôi).
const bootNow = Date.now()
const booted = storage ? bootSave(storage, content, bootNow) : null

// Hạch toán thời gian nằm ngoài React state.
// `savedAt`: mốc thời gian thực mà `game` đã được hạch toán tới; chỉ tăng (đồng hồ lùi không cấp lại thời gian).
let savedAt = booted?.savedAt ?? bootNow
let lastSaveWall = bootNow
let clock: ClockState | null = null // null = chưa có frame, hoặc tab đang ẩn
let hidden =
  typeof document !== 'undefined' && document.visibilityState === 'hidden'
const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
let holdsLock = !locks // trình duyệt không có Web Locks: coi tab này là writer

/** Chạy tick online đến hạn (tối đa `maxTicks`). */
function settle(game: GameState, frameNow: number, maxTicks: number) {
  if (hidden || !clock) return game
  const adv = advanceClock(clock, frameNow, {
    paused: game.stop !== null,
    maxTicks,
  })
  clock = adv.clock
  return adv.ticks > 0 ? runTicks(game, content, adv.ticks).state : game
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: booted?.state ?? createInitialState(content, bootNow >>> 0),
  speed: booted?.speed ?? 1,
  offlineTicks: booted?.offlineTicks ?? 0,
  error: booted?.error ?? null,
  saveBlocked: booted && !booted.canWrite ? booted.error : null,

  frame(frameNow, wallNow) {
    if (hidden) return
    clock ??= createClock(frameNow, get().speed)
    const game = settle(get().game, frameNow, MAX_TICKS_PER_FRAME)
    if (game !== get().game) set({ game })
    if (wallNow - lastSaveWall >= AUTOSAVE_MS) get().save(frameNow, wallNow)
  },

  setSpeed(speed, frameNow) {
    if (clock) clock = setClockSpeed(clock, frameNow, speed)
    set({ speed })
  },

  dispatch(command) {
    const r = applyCommand(get().game, content, command)
    set(r.ok ? { game: r.value, error: null } : { error: r.error })
  },

  spendTichThoi() {
    set({ game: spendTichThoi(get().game, content).state })
  },

  save(frameNow, wallNow) {
    lastSaveWall = wallNow
    if (clock && !hidden) {
      set({ game: settle(get().game, frameNow, Infinity) })
      savedAt = Math.max(savedAt, wallNow)
    }
    if (!storage || !holdsLock || get().saveBlocked) return
    const r = writeSave(storage, get().game, content, savedAt, get().speed)
    if (!r.ok) set({ error: r.error })
  },

  hide(frameNow, wallNow) {
    if (hidden) return
    get().save(frameNow, wallNow)
    hidden = true
    clock = null
  },

  show(frameNow, wallNow) {
    if (!hidden) return
    hidden = false
    const away = simulateAway(get().game, content, wallNow - savedAt)
    savedAt = Math.max(savedAt, wallNow)
    clock = createClock(frameNow, get().speed)
    set({ game: away.state, offlineTicks: away.ticksRun })
    get().save(frameNow, wallNow)
  },
}))

// Một writer cho một save: tab không lấy được khóa thì không bao giờ ghi (tránh ghi đè tiến trình của nhau).
void locks?.request(SAVE_LOCK, { ifAvailable: true }, (lock) => {
  if (!lock) {
    useGameStore.setState({
      saveBlocked: 'Game đang mở ở tab khác; tab này không lưu.',
    })
    return
  }
  holdsLock = true
  return new Promise<never>(() => {}) // giữ khóa tới khi đóng tab
})
