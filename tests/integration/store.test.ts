// Kiểm tra hạch toán thời gian/save qua store thật (Codex audit B01–B03, B06–B09, N01, N03–N05, R01).
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../../src/types/game'
import {
  readSave,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  SAVE_QUARANTINE_PREFIX,
  serializeSave,
  writeSave,
  type SaveStorage,
} from '../../src/utils/save'
import { fixture, named, startGame } from '../fixtures/content'

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

/** Web Locks giả cấp khóa ngay (đồng bộ) để test không phải chờ. */
const grantedNow = {
  locks: {
    request: (_n: string, _o: unknown, cb: (lock: object) => unknown) =>
      Promise.resolve(cb({})),
  },
}

/**
 * Nạp lại module store như mở game mới tại `now`.
 * Mặc định tab nhận khóa ngay; Node có `navigator.locks` thật giữ khóa cả tiến trình nên luôn stub.
 * Game mới (chưa có save) được đặt danh tính ngay lúc boot để thời gian chạy được.
 */
async function open(
  storage: SaveStorage,
  now: number,
  nav: object = grantedNow,
) {
  vi.resetModules()
  vi.useFakeTimers({ now })
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('navigator', nav)
  const { useGameStore } = await import('../../src/stores/gameStore')
  const { game } = useGameStore.getState()
  if (game.character.identity === null)
    useGameStore.setState({ game: named(fixture, game) })
  return useGameStore
}

const withAction = (s: GameState, actionId: string): GameState => ({
  ...s,
  currentActionId: actionId,
})

const savedDay = (storage: SaveStorage) => {
  const loaded = readSave(storage, fixture)
  return loaded.ok ? loaded.value.state.day : null
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('store time accounting', () => {
  it('B01: setting the clock back and forward again grants no extra time', async () => {
    const data = new Map<string, string>()
    const storage = memory(data)
    const start = withAction(startGame(fixture, 1), 'payFee')
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

  it('B02/S1: autosave waits for the frame backlog to clear, then keeps all of it', async () => {
    const data = new Map<string, string>()
    const storage = memory(data)
    const s = await open(storage, 0)
    s.getState().dispatch({ type: 'setAction', actionId: 'payFee' }, 0)
    s.getState().frame(0, 0)
    s.getState().frame(60_000, 60_000) // 120 tick đến hạn, frame chỉ chạy 20
    expect(s.getState().game.day).toBe(20)
    expect(data.has(SAVE_KEY)).toBe(false)
    for (let i = 0; i < 6; i++) s.getState().frame(60_000, 60_000) // bù xong → autosave
    expect(data.has(SAVE_KEY)).toBe(true)
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

  it('N03: a hidden tab runs at the chosen speed, same as a visible one', async () => {
    const visible = await open(memory(), 0)
    visible.getState().frame(0, 0)
    visible.getState().setSpeed(5, 0)
    for (let t = 1_000; t <= 61_000; t += 1_000) visible.getState().frame(t, t)

    // Ẩn = chỉ lưu (useGameLoop); rAF ngừng, các frame sau khi hiện lại chạy bù tối đa 20 tick mỗi frame.
    const hidden = await open(memory(), 0)
    hidden.getState().frame(0, 0)
    hidden.getState().setSpeed(5, 0)
    hidden.getState().save(0, 0)
    hidden.getState().frame(60_000, 60_000)
    for (let i = 0; i < 40; i++) hidden.getState().frame(61_000, 61_000)

    expect(visible.getState().game.day).toBe(610)
    expect(hidden.getState().game.day).toBe(610)
  })

  it('N03: closing a hidden tab saves the hidden time at the chosen speed', async () => {
    const storage = memory()
    const s = await open(storage, 0)
    s.getState().frame(0, 0)
    s.getState().setSpeed(5, 0)
    s.getState().save(0, 0) // ẩn
    s.getState().save(60_000, 60_000) // pagehide khi đang ẩn
    expect((await open(storage, 60_000)).getState().game.day).toBe(600)
  })

  it('N04: hiding and showing in sub-tick slices loses no time at 1×', async () => {
    const s = await open(memory(), 0)
    s.getState().frame(0, 0)
    s.getState().save(250, 250) // ẩn
    s.getState().frame(500, 500) // hiện
    s.getState().save(750, 750) // ẩn
    s.getState().frame(1_000, 1_000) // hiện
    expect(s.getState().game.day).toBe(2)
  })

  it('N05: resume after a frameless pause does not count the paused time', async () => {
    const storage = memory()
    writeSave(
      storage,
      {
        ...startGame(fixture, 1),
        day: 1,
        stop: { reason: 'actionCompleted', detail: 'treasure' },
      },
      fixture,
      0,
    )
    const s = await open(storage, 0)
    s.getState().frame(0, 0)
    // Đổi tốc độ khi đang dừng cũng không được mang thời gian dừng theo.
    s.getState().setSpeed(5, 10_000)
    s.getState().dispatch({ type: 'resume' }, 10_000)
    s.getState().frame(10_000, 10_000)
    expect(s.getState().game.day).toBe(1)
    s.getState().frame(10_100, 10_100) // 100 ms ở 5× = 1 tick
    expect(s.getState().game.day).toBe(2)
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

  it('B07: frame time going backwards or NaN grants no time and loses none', async () => {
    const s = await open(memory(), 0)
    s.getState().frame(0, 0)
    for (const t of [5_000, 4_000, 5_000, NaN, 5_500]) s.getState().frame(t, t)
    expect(s.getState().game.day).toBe(11)
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
        if (k.startsWith(SAVE_QUARANTINE_PREFIX)) throw new Error('quota')
        base.setItem(k, v)
      },
    }
    const s = await open(storage, 0)
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    expect(data.get(SAVE_KEY)).toBe('{"truncated')
    expect(s.getState().saveBlocked).toMatch(/quarantine/)
    // Lỗi gameplay sau đó không xóa cảnh báo chặn ghi.
    s.getState().dispatch({ type: 'setAction', actionId: null }, 60_000)
    expect(s.getState().saveBlocked).toMatch(/quarantine/)
  })

  it('N01: a tab reads and quarantines saves only once it holds the lock', async () => {
    let grant = () => {}
    const deferred = {
      locks: {
        request: (_n: string, _o: unknown, cb: (lock: object) => unknown) =>
          new Promise((done) => (grant = () => done(cb({})))),
      },
    }
    const data = new Map<string, string>([[SAVE_BACKUP_KEY, '{"bad']])
    const storage = memory(data)
    writeSave(storage, startGame(fixture, 1), fixture, 0)
    const s = await open(storage, 0, deferred)
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    // Chưa có khóa: không ghi gì, kể cả bản cách ly.
    expect([...data.keys()].sort()).toEqual([SAVE_KEY, SAVE_BACKUP_KEY])

    // Writer cũ lưu day 100 (backup hỏng vẫn còn) rồi nhả khóa.
    const day100 = serializeSave(
      { ...startGame(fixture, 1), day: 100 },
      fixture,
      0,
    )
    if (day100.ok) data.set(SAVE_KEY, day100.value)
    grant()
    await vi.waitFor(() => expect(s.getState().game.day).toBe(100))
    s.getState().save(0, 0)
    expect(savedDay(storage)).toBe(100)
    expect(
      [...data.keys()].some((k) => k.startsWith(SAVE_QUARANTINE_PREFIX)),
    ).toBe(true)
  })

  it('R01: a second tab waits, never writes, then takes over the latest save', async () => {
    const queue: (() => void)[] = []
    const busy = {
      locks: {
        request: (
          _n: string,
          o: { ifAvailable?: boolean },
          cb: (lock: object | null) => unknown,
        ) =>
          o.ifAvailable
            ? Promise.resolve().then(() => cb(null))
            : new Promise((done) => queue.push(() => done(cb({})))),
      },
    }
    const data = new Map<string, string>()
    const storage = memory(data)
    const s = await open(storage, 0, busy)
    await vi.waitFor(() => expect(s.getState().saveBlocked).toMatch(/tab khác/))
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    expect(data.has(SAVE_KEY)).toBe(false)

    writeSave(storage, { ...startGame(fixture, 1), day: 50 }, fixture, 0)
    await vi.waitFor(() => expect(queue).toHaveLength(1))
    queue[0]() // tab kia đóng
    await vi.waitFor(() => expect(s.getState().saveBlocked).toBeNull())
    expect(s.getState().game.day).toBe(50)
    s.getState().save(0, 0)
    expect(savedDay(storage)).toBe(50)
  })

  it('R01: without Web Locks the tab plays but never writes, not even a quarantine', async () => {
    const data = new Map<string, string>([[SAVE_BACKUP_KEY, '{"bad']])
    const storage = memory(data)
    writeSave(storage, startGame(fixture, 1), fixture, 0)
    const before = [...data]
    const s = await open(storage, 0, {})
    expect(s.getState().saveBlocked).toMatch(/Web Locks/)
    s.getState().frame(0, 0)
    s.getState().save(60_000, 60_000)
    expect(s.getState().game.day).toBe(120)
    expect([...data]).toEqual(before)
  })

  it('R01: on plain HTTP the no-Web-Locks warning blames the origin, not the browser', async () => {
    vi.stubGlobal('isSecureContext', false)
    const s = await open(memory(), 0, {})
    expect(s.getState().saveBlocked).toMatch(/HTTPS/)
  })

  it('a tab booted while hidden counts the time before its first frame', async () => {
    const storage = memory()
    const s = await open(storage, 0)
    s.getState().frame(3 * HOUR, 3 * HOUR) // frame đầu sau 3 giờ ẩn
    s.getState().save(3 * HOUR, 3 * HOUR)
    expect(s.getState().game.day).toBe(21_600)
    expect(savedDay(storage)).toBe(21_600)
  })

  it('sleep that pauses the frame clock counts as offline (capped at 8 h)', async () => {
    const s = await open(memory(), 0)
    s.getState().frame(0, 0)
    s.getState().frame(1_000, HOUR) // performance.now() đứng yên gần hết 1 giờ
    expect(s.getState().game.day).toBe(7_200)
    s.getState().frame(2_000, HOUR + 9 * HOUR + 1_000) // ngủ 9 giờ → chỉ 8 giờ
    expect(s.getState().game.day).toBe(7_200 + 57_600 + 2)
    s.getState().frame(3_000, HOUR + 9 * HOUR + 4_000) // lệch 2 giây: sai số đo
    expect(s.getState().game.day).toBe(7_200 + 57_600 + 4)
  })

  it('autosave during a long catch-up is deferred at most 5 autosave intervals', async () => {
    const data = new Map<string, string>()
    const s = await open(memory(data), 0)
    s.getState().frame(0, 0)
    s.getState().frame(HOUR, HOUR)
    expect(data.has(SAVE_KEY)).toBe(false)
    s.getState().frame(HOUR + 149_000, HOUR + 149_000)
    expect(data.has(SAVE_KEY)).toBe(false)
    s.getState().frame(HOUR + 150_000, HOUR + 150_000)
    expect(savedDay(memory(data))).toBe((HOUR + 150_000) / 500)
  })

  it('autosave keeps running when the system clock is set back', async () => {
    const data = new Map<string, string>()
    const s = await open(memory(data), 0)
    s.getState().frame(0, 0)
    for (let t = 1_000; t <= 31_000; t += 1_000)
      s.getState().frame(t, -24 * HOUR)
    expect(data.has(SAVE_KEY)).toBe(true)
  })

  it('a failed write stays reported after a successful command', async () => {
    const storage = {
      ...memory(),
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const s = await open(storage, 0)
    s.getState().save(1_000, 1_000)
    s.getState().dispatch({ type: 'setAction', actionId: 'payFee' }, 1_000)
    expect(s.getState().error).toBeNull()
    expect(s.getState().saveError).toMatch(/QuotaExceededError/)
  })

  it('R01: a failed lock request blocks saving with a reason', async () => {
    const broken = {
      locks: { request: () => Promise.reject(new Error('SecurityError')) },
    }
    const data = new Map<string, string>()
    const s = await open(memory(data), 0, broken)
    await vi.waitFor(() =>
      expect(s.getState().saveBlocked).toMatch(/SecurityError/),
    )
    s.getState().save(0, 0)
    expect(data.has(SAVE_KEY)).toBe(false)
  })
})

describe('new life after death (D31)', () => {
  const dead = (): GameState => ({
    ...startGame(fixture, 1),
    day: 77,
    tichThoiTicks: 500,
    stop: { reason: 'death', detail: '60' },
  })

  it('does nothing while the character is alive', async () => {
    const storage = memory()
    writeSave(storage, startGame(fixture, 1), fixture, 0)
    const s = await open(storage, 0)
    const before = s.getState().game
    s.getState().newLife(0, 0)
    expect(s.getState().game).toBe(before)
  })

  it('replaces the dead life with a new seeded life and saves it at once', async () => {
    const data = new Map<string, string>()
    const storage = memory(data)
    writeSave(storage, dead(), fixture, 1_000)
    const s = await open(storage, 1_000)
    expect(s.getState().game.stop?.reason).toBe('death')
    s.getState().newLife(5, 123_456)
    const game = s.getState().game
    expect(game.seed).toBe(123_456)
    expect(game.day).toBe(0)
    expect(game.tichThoiTicks).toBe(0)
    expect(game.stop?.reason).toBe('chooseIdentity')
    const saved = readSave(storage, fixture)
    expect(saved.ok && saved.value.state).toEqual(game)
  })
})
