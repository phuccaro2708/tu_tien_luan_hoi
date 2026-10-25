// Kiểm tra hạch toán thời gian/save qua store thật (Codex audit B01–B03, B06, B08, B09, R01).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { hashState } from '../../src/core/hash'
import { createInitialState } from '../../src/core/state'
import type { GameState } from '../../src/types/game'
import {
  readSave,
  SAVE_KEY,
  writeSave,
  type SaveStorage,
} from '../../src/utils/save'
import { fixture } from '../fixtures/content'

vi.mock('../../src/data/content', async () => ({
  content: (await import('../fixtures/content')).fixture,
}))

const HOUR = 3_600_000

function memory(data = new Map<string, string>()): SaveStorage {
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

/**
 * Nạp lại module store như mở game mới tại `now`.
 * Mặc định không có Web Locks (tab là writer); Node có `navigator.locks` thật giữ khóa cả tiến trình.
 */
async function open(storage: SaveStorage, now: number, nav: object = {}) {
  vi.resetModules()
  vi.useFakeTimers({ now })
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('navigator', nav)
  const { useGameStore } = await import('../../src/stores/gameStore')
  return useGameStore
}

const withAction = (s: GameState, actionId: string): GameState => ({
  ...s,
  currentActionId: actionId,
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('store time accounting', () => {
  it('B01: setting the clock back and forward again grants no extra time', async () => {
    const data = new Map<string, string>()
    const storage = memory(data)
    const start = withAction(createInitialState(fixture, 1), 'payFee')
    writeSave(storage, start, fixture, 10_000)
    for (let i = 0; i < 2; i++) {
      ;(await open(storage, 0)).getState().save(0, 0)
      const s = await open(storage, 10_000)
      s.getState().save(0, 10_000)
    }
    const loaded = readSave(storage, fixture)
    expect(loaded.ok && loaded.value.state.day).toBe(0)
    expect(loaded.ok && loaded.value.state.resources.van).toBe(0)
  })

  it('B02: autosave with an unprocessed backlog keeps the backlog', async () => {
    const storage = memory()
    const s = await open(storage, 0)
    s.getState().dispatch({ type: 'setAction', actionId: 'payFee' })
    s.getState().frame(0, 0)
    s.getState().frame(60_000, 60_000) // 120 tick đến hạn, autosave
    const again = await open(storage, 60_000)
    expect(again.getState().game.day).toBe(120)
  })

  it('B02: pagehide after a long gap without frames saves the elapsed days', async () => {
    const storage = memory()
    const s = await open(storage, 0)
    s.getState().frame(0, 0)
    s.getState().save(HOUR, HOUR)
    const again = await open(storage, HOUR)
    expect(again.getState().game.day).toBe(7_200)
  })

  it('hidden tab is offline: pagehide while hidden ≡ showing the tab again', async () => {
    const seed = (storage: SaveStorage) =>
      writeSave(
        storage,
        {
          ...withAction(createInitialState(fixture, 1), 'spend'),
          resources: { van: 3_600, tinhLuc: 100, jar: 0 },
        },
        fixture,
        0,
      )

    const a = memory()
    seed(a)
    const sa = await open(a, 0)
    sa.getState().frame(0, 0)
    sa.getState().hide(0, 0)
    sa.getState().save(HOUR, HOUR) // pagehide khi đang ẩn
    const closed = (await open(a, HOUR)).getState().game

    const b = memory()
    seed(b)
    const sb = await open(b, 0)
    sb.getState().frame(0, 0)
    sb.getState().hide(0, 0)
    sb.getState().show(HOUR, HOUR)
    sb.getState().frame(HOUR + 16, HOUR + 16)
    const shown = sb.getState().game

    expect(shown.day).toBe(3_600)
    expect(shown.tichThoiTicks).toBe(3_600)
    expect(hashState(closed)).toBe(hashState(shown))
  })

  it('B06: re-selecting the current speed does not lose accumulated time', async () => {
    const s = await open(memory(), 0)
    s.getState().frame(0, 0)
    s.getState().setSpeed(1, 400)
    s.getState().frame(500, 500)
    s.getState().setSpeed(1, 900)
    s.getState().frame(1_000, 1_000)
    expect(s.getState().game.day).toBe(2)
  })

  it('B06: changing speed mid-tick keeps the partial tick', async () => {
    const s = await open(memory(), 0)
    s.getState().frame(0, 0)
    s.getState().frame(250, 250) // nửa tick ở 1×
    s.getState().setSpeed(2, 250)
    s.getState().frame(375, 375) // +125 ms × 2 = nửa tick còn lại
    expect(s.getState().game.day).toBe(1)
  })

  it('B08: same online time and speed → same days regardless of frame split', async () => {
    const run = async (frames: number[]) => {
      const s = await open(memory(), 0)
      s.getState().frame(0, 0)
      s.getState().setSpeed(5, 0)
      for (const t of frames) s.getState().frame(t, t)
      return s.getState().game.day
    }
    const everySecond = Array.from({ length: 61 }, (_, i) => (i + 1) * 1_000)
    const oneStall = Array.from({ length: 40 }, () => 61_000)
    expect(await run(everySecond)).toBe(610)
    expect(await run(oneStall)).toBe(610)
  })

  it('B09: speed survives save and reload', async () => {
    const storage = memory()
    const s = await open(storage, 0)
    s.getState().setSpeed(5, 0)
    s.getState().save(0, 0)
    expect((await open(storage, 0)).getState().speed).toBe(5)
  })
})

describe('store write protection', () => {
  it('B03: a failed quarantine blocks autosave from replacing the unreadable save', async () => {
    const data = new Map<string, string>([[SAVE_KEY, '{"truncated']])
    const base = memory(data)
    const storage: SaveStorage = {
      ...base,
      setItem: (k, v) => {
        if (k.startsWith('ttlh.save.corrupt.')) throw new Error('quota')
        base.setItem(k, v)
      },
    }
    const s = await open(storage, 0)
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    expect(data.get(SAVE_KEY)).toBe('{"truncated')
    expect(s.getState().saveBlocked).toMatch(/quarantine/)
    // Lỗi gameplay sau đó không xóa cảnh báo chặn ghi.
    s.getState().dispatch({ type: 'setAction', actionId: null })
    expect(s.getState().saveBlocked).toMatch(/quarantine/)
  })

  it('R01: a second tab that cannot take the save lock never writes', async () => {
    const denied = {
      locks: {
        request: (_name: string, _opts: unknown, cb: (lock: null) => unknown) =>
          Promise.resolve().then(() => cb(null)),
      },
    }
    const data = new Map<string, string>()
    const s = await open(memory(data), 0, denied)
    await vi.waitFor(() => expect(s.getState().saveBlocked).toMatch(/tab khác/))
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    expect(data.has(SAVE_KEY)).toBe(false)
  })

  it('R01: the tab holding the lock writes', async () => {
    let grant = () => {}
    const granted = {
      locks: {
        request: (
          _name: string,
          _opts: unknown,
          cb: (lock: object) => unknown,
        ) => {
          grant = () => void cb({})
          return new Promise(() => {})
        },
      },
    }
    const data = new Map<string, string>()
    const s = await open(memory(data), 0, granted)
    s.getState().save(0, 0)
    expect(data.has(SAVE_KEY)).toBe(false) // khóa chưa được cấp → chưa ghi
    grant()
    s.getState().save(0, 0)
    expect(data.has(SAVE_KEY)).toBe(true)
  })
})
