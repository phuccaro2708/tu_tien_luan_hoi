import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/core/state'
import { hashState } from '../../src/core/hash'
import { simulateAway } from '../../src/systems/offline'
import {
  bootSave,
  SAVE_BACKUP_KEY,
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

  it('N09: each script entry runs once; a blocked action ends the run at its stop', () => {
    const s = runScript(
      fixture,
      1,
      [
        { day: 0, command: { type: 'resume' } },
        { day: 0, command: { type: 'setAction', actionId: 'spend' } },
      ],
      1,
    )
    expect(s.day).toBe(0)
    expect(s.stop?.reason).toBe('actionBlocked')
  }, 2_000)

  it('runScript fails loudly when a stop leaves later commands unapplied', () => {
    const script = [
      { day: 0, command: { type: 'setAction', actionId: 'spend' } },
      { day: 3, command: { type: 'resume' } },
    ] as const
    expect(() => runScript(fixture, 1, script, 5)).toThrow(
      /day 3 never applied/,
    )
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
    // payFee ròng dương, không bao giờ bị chặn → đủ 10 000 tick có hành động.
    const s = runScript(
      fixture,
      1,
      [{ day: 0, command: { type: 'setAction', actionId: 'payFee' } }],
      10_000,
    )
    expect(s.day).toBe(10_000)
    expect(s.resources.van).toBe(70_000)
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

  it('boot never writes; offline is applied once because the next save carries the accounted time', () => {
    const { data, storage } = memory()
    writeSave(storage, createInitialState(fixture, 1), fixture, 0)
    const before = data.get(SAVE_KEY)
    const first = bootSave(storage, fixture, 3_600_000)
    expect(first.offlineTicks).toBe(7_200)
    expect(first.savedAt).toBe(3_600_000)
    expect(data.get(SAVE_KEY)).toBe(before)
    // Mở lại trước lần ghi kế tiếp: mô phỏng tất định → cùng kết quả.
    const again = bootSave(storage, fixture, 3_600_000)
    expect(hashState(again.state)).toBe(hashState(first.state))
    // Store ghi với mốc đã hạch toán → lần mở sau không cộng lại.
    if (!first.state) throw new Error('no state')
    writeSave(storage, first.state, fixture, first.savedAt)
    const second = bootSave(storage, fixture, 3_600_000)
    expect(second.offlineTicks).toBe(0)
    expect(hashState(second.state)).toBe(hashState(first.state))
  })

  it('boot after the clock went back keeps the later savedAt', () => {
    const { storage } = memory()
    writeSave(storage, createInitialState(fixture, 1), fixture, 10_000)
    const r = bootSave(storage, fixture, 0)
    expect(r.offlineTicks).toBe(0)
    expect(r.savedAt).toBe(10_000)
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
    expect(data.get(`${SAVE_QUARANTINE_PREFIX}${hashState(stale)}`)).toBe(stale)
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
    expect(
      data.get(`${SAVE_QUARANTINE_PREFIX}${hashState('{"truncated')}`),
    ).toBe('{"truncated')
  })

  it('N02: two different unreadable saves with the same hash are both kept', () => {
    const { data, storage } = memory()
    const a = 'invalid-82999-eer8cn'
    const b = 'invalid-140626-19zj9v6'
    expect(hashState(a)).toBe(hashState(b)) // va chạm FNV-1a thật (Codex audit)
    data.set(SAVE_KEY, a)
    data.set(SAVE_BACKUP_KEY, b)
    const r = bootSave(storage, fixture, 0)
    expect(r.canWrite).toBe(true)
    writeSave(storage, createInitialState(fixture, 2), fixture, 0)
    const kept = [...data]
      .filter(([k]) => k.startsWith(SAVE_QUARANTINE_PREFIX))
      .map(([, v]) => v)
    expect(kept.sort()).toEqual([a, b].sort())
    // Mở lại nhiều lần không sinh thêm bản sao.
    data.set(SAVE_KEY, a)
    bootSave(storage, fixture, 0)
    expect(
      [...data.keys()].filter((k) => k.startsWith(SAVE_QUARANTINE_PREFIX)),
    ).toHaveLength(2)
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
