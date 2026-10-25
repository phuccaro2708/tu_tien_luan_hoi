import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/core/state'
import { hashState } from '../../src/core/hash'
import { simulateAway } from '../../src/systems/offline'
import {
  bootSave,
  SAVE_KEY,
  SAVE_QUARANTINE_PREFIX,
  writeSave,
  type SaveStorage,
} from '../../src/utils/save'
import { fixture } from '../fixtures/content'
import { runRealtime, runScript, type ScriptEntry } from './harness'

const script: ScriptEntry[] = [
  { day: 0, command: { type: 'setAction', actionId: 'work' } },
  { day: 9, command: { type: 'setAction', actionId: 'treasure' } },
  { day: 10, command: { type: 'resume' } },
  { day: 10, command: { type: 'setAction', actionId: 'payFee' } },
  { day: 40, command: { type: 'setAction', actionId: 'idle' } },
]

describe('deterministic simulation (replay)', () => {
  it('same seed + command log → same state hash', () => {
    const a = runScript(fixture, 5, script, 400)
    const b = runScript(fixture, 5, script, 400)
    expect(a.day).toBe(400)
    expect(a.claimed).toEqual({ treasure: true })
    expect(a.resources.van).toBe(9 * 10 + 100 + 30 * 7)
    expect(hashState(a)).toBe(hashState(b))
  })

  it('1× / 2× / 3× / 5× and different frame splits → same hash as headless replay', () => {
    const expected = hashState(runScript(fixture, 5, script, 200))
    const runs = [
      [1, 16],
      [1, 100],
      [2, 33.3],
      [3, 16.6667],
      [5, 1000],
    ] as const
    for (const [speed, frameMs] of runs) {
      const s = runRealtime(fixture, 5, script, {
        speed,
        frameMs,
        untilDay: 200,
        maxTicksPerFrame: 7,
      })
      expect(s.day).toBe(200)
      expect(hashState(s)).toBe(expected)
    }
  })

  it('harness runs 10 000 ticks in under 1 second; 8h offline (57 600 ticks) too', () => {
    const t0 = performance.now()
    const s = runScript(
      fixture,
      1,
      [{ day: 0, command: { type: 'setAction', actionId: 'work' } }],
      10_000,
    )
    expect(s.day).toBeGreaterThan(0)
    const empty = runScript(fixture, 1, [], 10_000)
    expect(empty.day).toBe(10_000)
    const off = simulateAway(
      createInitialState(fixture, 1),
      fixture,
      8 * 3_600_000,
    )
    expect(off.ticksRun).toBe(57_600)
    expect(performance.now() - t0).toBeLessThan(1000)
  })
})

describe('boot (load + offline)', () => {
  const memory = () => {
    const data = new Map<string, string>()
    const storage: SaveStorage = {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
    }
    return { data, storage }
  }

  it('applies offline once: boot twice at the same now → no extra ticks or Tích Thời', () => {
    const { storage } = memory()
    writeSave(storage, createInitialState(fixture, 1), fixture, 0)
    const first = bootSave(storage, fixture, 3_600_000)
    expect(first.offlineTicks).toBe(7_200)
    const second = bootSave(storage, fixture, 3_600_000)
    expect(second.offlineTicks).toBe(0)
    expect(second.state?.tichThoiTicks).toBe(0)
    expect(hashState(second.state)).toBe(hashState(first.state))
  })

  it('an unloadable save is quarantined before a new game autosaves over it', () => {
    const { data, storage } = memory()
    // VD save cũ thiếu tài nguyên mà dữ liệu mới yêu cầu.
    const stale = JSON.stringify({
      version: 1,
      savedAt: 0,
      state: { ...createInitialState(fixture, 1), resources: { van: 5 } },
    })
    data.set(SAVE_KEY, stale)
    const r = bootSave(storage, fixture, 1_000)
    expect(r.state).toBeNull()
    expect(r.error).toMatch(/invalid state/)
    // Store tạo game mới và autosave:
    writeSave(storage, createInitialState(fixture, 2), fixture, 2_000)
    expect(data.get(`${SAVE_QUARANTINE_PREFIX}${SAVE_KEY}.1000`)).toBe(stale)
  })

  it('a bad main save with a good backup loads the backup and keeps the bad text', () => {
    const { data, storage } = memory()
    writeSave(storage, createInitialState(fixture, 1), fixture, 0)
    writeSave(
      storage,
      { ...createInitialState(fixture, 1), day: 5 },
      fixture,
      0,
    )
    data.set(SAVE_KEY, '{"truncated')
    const r = bootSave(storage, fixture, 0)
    expect(r.state?.day).toBe(0)
    expect(data.get(`${SAVE_QUARANTINE_PREFIX}${SAVE_KEY}.0`)).toBe(
      '{"truncated',
    )
  })
})

describe('architecture guard', () => {
  it('ESLint rejects React/Zustand imports and nondeterminism inside the engine', async () => {
    const eslint = new ESLint()
    const [react] = await eslint.lintText(
      "import { useState } from 'react'\nexport const x = useState\n",
      {
        filePath: 'src/core/x.ts',
      },
    )
    const [rand] = await eslint.lintText(
      'export const r = Math.random() + Date.now()\n',
      {
        filePath: 'src/systems/x.ts',
      },
    )
    const [ui] = await eslint.lintText(
      "import { useState } from 'react'\nexport const x = useState\n",
      {
        filePath: 'src/stores/x.ts',
      },
    )
    expect(react.messages.map((m) => m.ruleId)).toContain(
      'no-restricted-imports',
    )
    expect(
      rand.messages.filter((m) => m.ruleId === 'no-restricted-properties'),
    ).toHaveLength(2)
    expect(ui.errorCount).toBe(0)
  }, 30_000)
})
