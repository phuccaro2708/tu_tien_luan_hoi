import { create } from 'zustand'
import {
  advanceClock,
  createClock,
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
const MAX_TICKS_PER_FRAME = 20
const MAX_BACKLOG_TICKS = 600 // tồn đọng lớn hơn (tab bị ẩn lâu) → đường offline có trần 8 giờ

const storage: SaveStorage | null =
  typeof localStorage === 'undefined' ? null : localStorage

interface GameStore {
  game: GameState
  speed: Speed
  /** Tick đã chạy khi vắng mặt lúc mở game (báo cáo offline). */
  offlineTicks: number
  error: string | null
  frame: (frameNow: number, wallNow: number) => void
  setSpeed: (speed: Speed, frameNow: number) => void
  dispatch: (command: Command) => void
  spendTichThoi: () => void
  save: (wallNow: number) => void
}

// Tải + offline chạy đúng một lần khi nạp module (không trong useEffect, tránh StrictMode chạy đôi).
function boot(wallNow: number): {
  game: GameState
  offlineTicks: number
  error: string | null
} {
  const r = storage
    ? bootSave(storage, content, wallNow)
    : { state: null, offlineTicks: 0, error: null }
  // ponytail: seed từ đồng hồ khi chơi mới; khởi tạo kiếp 1 theo seed thuộc P1.
  return {
    game: r.state ?? createInitialState(content, wallNow >>> 0),
    offlineTicks: r.offlineTicks,
    error: r.error,
  }
}

const booted = boot(Date.now())
let clock: ClockState | null = null
let lastSaveWall = Date.now()

export const useGameStore = create<GameStore>((set, get) => ({
  ...booted,
  speed: 1,

  frame(frameNow, wallNow) {
    clock ??= createClock(frameNow, get().speed)
    let game = get().game
    const adv = advanceClock(clock, frameNow, {
      paused: game.stop !== null,
      maxTicksPerFrame: MAX_TICKS_PER_FRAME,
      maxBacklogTicks: MAX_BACKLOG_TICKS,
    })
    clock = adv.clock
    if (adv.ticks > 0) game = runTicks(game, content, adv.ticks).state
    if (adv.droppedMs > 0)
      game = simulateAway(game, content, adv.droppedMs).state
    if (game !== get().game) set({ game })
    if (wallNow - lastSaveWall >= AUTOSAVE_MS) get().save(wallNow)
  },

  setSpeed(speed, frameNow) {
    clock = createClock(frameNow, speed)
    set({ speed })
  },

  dispatch(command) {
    const r = applyCommand(get().game, content, command)
    set(r.ok ? { game: r.value, error: null } : { error: r.error })
  },

  spendTichThoi() {
    set({ game: spendTichThoi(get().game, content).state })
  },

  save(wallNow) {
    lastSaveWall = wallNow
    if (!storage) return
    const r = writeSave(storage, get().game, content, wallNow)
    if (!r.ok) set({ error: r.error })
  },
}))
