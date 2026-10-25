import { describe, expect, it } from 'vitest'
import { MAX_AWAY_MS, MAX_AWAY_TICKS, TICK_MS } from '../../src/core/clock'
import { applyCommand, runTicks } from '../../src/core/engine'
import { hashState } from '../../src/core/hash'
import {
  awayTicks,
  simulateAway,
  spendTichThoi,
} from '../../src/systems/offline'
import type { GameState } from '../../src/types/game'
import {
  parseSave,
  readSave,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  serializeSave,
  writeSave,
  type SaveStorage,
} from '../../src/utils/save'
import { fixture, startGame } from '../fixtures/content'

const HOUR = 3_600_000

function memoryStorage(): SaveStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

function spending(van: number): GameState {
  const s = {
    ...startGame(fixture, 9),
    resources: { van, tinhLuc: 100, jar: 0 },
  }
  const r = applyCommand(s, fixture, { type: 'setAction', actionId: 'spend' })
  if (!r.ok) throw new Error(r.error)
  return r.value
}

describe('SaveManager', () => {
  it('round-trips state deeply equal', () => {
    const s = runTicks(spending(500), fixture, 123).state
    const text = serializeSave(s, fixture, 1_000)
    expect(text.ok).toBe(true)
    const back = text.ok && parseSave(text.value, fixture)
    expect(back).toEqual({
      ok: true,
      value: { state: s, savedAt: 1_000, speed: 1 },
    })
  })

  it('B09: speed is saved; missing or unknown speed loads as 1×', () => {
    const s = startGame(fixture, 1)
    const text = serializeSave(s, fixture, 0, 5)
    const back = text.ok && parseSave(text.value, fixture)
    expect(back && back.ok && back.value.speed).toBe(5)
    for (const speed of [undefined, 4, '5', null]) {
      const old = JSON.stringify({
        version: SAVE_VERSION,
        savedAt: 0,
        speed,
        state: s,
      })
      const r = parseSave(old, fixture)
      expect(r.ok && r.value.speed).toBe(1)
    }
  })

  it('refuses to serialize an invalid state (NaN would become null)', () => {
    const s = {
      ...startGame(fixture, 1),
      resources: { van: NaN, tinhLuc: 100, jar: 0 },
    }
    expect(serializeSave(s, fixture, 0).ok).toBe(false)
  })

  it.each([
    ['garbage', 'not json{'],
    ['null', 'null'],
    [
      'wrong version',
      JSON.stringify({
        version: 99,
        savedAt: 0,
        state: startGame(fixture, 1),
      }),
    ],
    ['missing state', JSON.stringify({ version: SAVE_VERSION, savedAt: 0 })],
    [
      'negative resource',
      JSON.stringify({
        version: SAVE_VERSION,
        savedAt: 0,
        state: {
          ...startGame(fixture, 1),
          resources: { van: -5, tinhLuc: 0, jar: 0 },
        },
      }),
    ],
    [
      'null resource (NaN)',
      JSON.stringify({
        version: SAVE_VERSION,
        savedAt: 0,
        state: {
          ...startGame(fixture, 1),
          resources: { van: null, tinhLuc: 0, jar: 0 },
        },
      }),
    ],
    [
      'bad savedAt',
      JSON.stringify({
        version: SAVE_VERSION,
        savedAt: 'x',
        state: startGame(fixture, 1),
      }),
    ],
  ])('rejects corrupted save: %s', (_, text) => {
    expect(parseSave(text, fixture).ok).toBe(false)
  })

  it('corrupted main save falls back to backup; a good save is never overwritten by a bad one', () => {
    const storage = memoryStorage()
    const a = startGame(fixture, 1)
    const b = { ...a, day: 50 }
    expect(writeSave(storage, a, fixture, 1).ok).toBe(true)
    expect(writeSave(storage, b, fixture, 2).ok).toBe(true)
    expect(
      parseSave(storage.data.get(SAVE_BACKUP_KEY) ?? null, fixture).ok,
    ).toBe(true)

    const bad = { ...b, resources: { van: Infinity, tinhLuc: 100, jar: 0 } }
    expect(writeSave(storage, bad, fixture, 3).ok).toBe(false)
    expect(readSave(storage, fixture)).toEqual({
      ok: true,
      value: { state: b, savedAt: 2, speed: 1 },
    })

    storage.data.set(SAVE_KEY, '{"truncated')
    expect(readSave(storage, fixture)).toEqual({
      ok: true,
      value: { state: a, savedAt: 1, speed: 1 },
    })
  })

  it('storage quota error leaves the existing save intact', () => {
    const storage = memoryStorage()
    const a = startGame(fixture, 1)
    writeSave(storage, a, fixture, 1)
    const before = storage.data.get(SAVE_KEY)
    const throwing: SaveStorage = {
      ...storage,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(writeSave(throwing, { ...a, day: 9 }, fixture, 2).ok).toBe(false)
    expect(storage.data.get(SAVE_KEY)).toBe(before)
  })

  it('no-duplicate reward survives save/load', () => {
    const s0 = applyCommand(startGame(fixture, 1), fixture, {
      type: 'setAction',
      actionId: 'treasure',
    })
    if (!s0.ok) throw new Error()
    const claimed = runTicks(s0.value, fixture, 1).state
    const text = serializeSave(claimed, fixture, 0)
    const loaded = text.ok && parseSave(text.value, fixture)
    if (!loaded || !loaded.ok) throw new Error()
    const resumed = applyCommand(loaded.value.state, fixture, {
      type: 'resume',
    })
    expect(
      resumed.ok &&
        applyCommand(resumed.value, fixture, {
          type: 'setAction',
          actionId: 'treasure',
        }).ok,
    ).toBe(false)
  })
})

describe('OfflineProgression', () => {
  it('away time: negative/NaN/Infinity → 0; capped at 8 hours', () => {
    expect(awayTicks(-5_000)).toBe(0)
    expect(awayTicks(NaN)).toBe(0)
    expect(awayTicks(Infinity)).toBe(0)
    expect(awayTicks(20 * HOUR)).toBe(MAX_AWAY_TICKS)
    expect(awayTicks(MAX_AWAY_MS)).toBe(57_600)
  })

  it('20 hours away → only 8 hours simulated, nothing extra to Tích Thời', () => {
    const r = simulateAway(spending(1_000_000), fixture, 20 * HOUR)
    expect(r.ticksRun).toBe(MAX_AWAY_TICKS)
    expect(r.state.tichThoiTicks).toBe(0)
  })

  it('offline N hours ≡ online N hours with the same seed', () => {
    const offline = simulateAway(spending(1_000_000), fixture, 2 * HOUR).state
    const online = runTicks(
      spending(1_000_000),
      fixture,
      (2 * HOUR) / TICK_MS,
    ).state
    expect(hashState(offline)).toBe(hashState(online))
  })

  it('stop point at hour 1 → stops, remaining 7 hours become Tích Thời', () => {
    const r = simulateAway(spending(7_200), fixture, 8 * HOUR)
    expect(r.ticksRun).toBe(7_200)
    expect(r.state.stop?.reason).toBe('actionBlocked')
    expect(r.state.tichThoiTicks).toBe(7 * 7_200)
  })

  it('using 7h Tích Thời with a stop after 2h leaves 5h and matches 2h online', () => {
    const start = { ...spending(14_400), tichThoiTicks: 7 * 7_200 }
    const r = spendTichThoi(start, fixture)
    expect(r.ticksRun).toBe(14_400)
    expect(r.state.tichThoiTicks).toBe(5 * 7_200)
    // Online cũng chạy tới điểm dừng (tick thứ 14 401 bị chặn, không tiêu ngày).
    const online = runTicks(start, fixture, 14_401).state
    expect(online.day).toBe(14_400)
    expect(hashState({ ...r.state, tichThoiTicks: 0 })).toBe(
      hashState({ ...online, tichThoiTicks: 0 }),
    )
  })

  it('Tích Thời never exceeds 8 hours', () => {
    const paused = {
      ...spending(0),
      stop: { reason: 'actionBlocked' as const, detail: 'x' },
      tichThoiTicks: 50_000,
    }
    expect(simulateAway(paused, fixture, 8 * HOUR).state.tichThoiTicks).toBe(
      MAX_AWAY_TICKS,
    )
  })
})
