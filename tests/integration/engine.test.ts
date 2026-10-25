import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/core/state'
import { hashState } from '../../src/core/hash'
import { simulateAway } from '../../src/systems/offline'
import { readSave, writeSave, type SaveStorage } from '../../src/utils/save'
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

describe('offline is applied once', () => {
  it('load → offline → save → load at the same now → no extra ticks or Tích Thời', () => {
    const data = new Map<string, string>()
    const storage: SaveStorage = {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
    }
    const boot = (now: number) => {
      const loaded = readSave(storage, fixture)
      if (!loaded.ok) throw new Error(loaded.error)
      const r = simulateAway(
        loaded.value.state,
        fixture,
        now - loaded.value.savedAt,
      )
      writeSave(storage, r.state, fixture, now)
      return r
    }
    writeSave(storage, createInitialState(fixture, 1), fixture, 0)
    const first = boot(3_600_000)
    expect(first.ticksRun).toBe(7_200)
    const second = boot(3_600_000)
    expect(second.ticksRun).toBe(0)
    expect(second.tichThoiAdded).toBe(0)
    expect(hashState(second.state)).toBe(hashState(first.state))
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
