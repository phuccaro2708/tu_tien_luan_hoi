import { describe, expect, it } from 'vitest'
import {
  advanceClock,
  createClock,
  MAX_AWAY_TICKS,
  setClockSpeed,
  type ClockState,
} from '../../src/core/clock'
import { hashState } from '../../src/core/hash'
import { nextFloat, seedRng } from '../../src/core/rng'
import {
  ageYears,
  createInitialState,
  validateState,
} from '../../src/core/state'
import { content } from '../../src/data/content'
import { createContent, validateContent } from '../../src/data/registry'
import { fixture, rawFixture } from '../fixtures/content'

const opts = {
  paused: false,
  maxTicks: 1_000_000,
}

function ticksFor(
  frames: number[],
  speed: 1 | 2 | 3 | 5 = 1,
  o = opts,
): number {
  let clock: ClockState = createClock(0, speed)
  let now = 0
  let total = 0
  for (const f of frames) {
    now += f
    const a = advanceClock(clock, now, o)
    clock = a.clock
    total += a.ticks
  }
  return total
}

const repeat = (ms: number, totalMs: number) =>
  Array.from({ length: Math.round(totalMs / ms) }, () => ms)

describe('rng', () => {
  it('same seed → same 1000 numbers; different seeds differ; values in [0,1)', () => {
    const seq = (seed: number) => {
      let r = seedRng(seed)
      return Array.from({ length: 1000 }, () => {
        const [v, n] = nextFloat(r)
        r = n
        return v
      })
    }
    const a = seq(42)
    expect(seq(42)).toEqual(a)
    expect(seq(43)).not.toEqual(a)
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('SimulationClock', () => {
  it('different frame splits (incl. fractional rAF deltas) → same tick count', () => {
    const totalMs = 60_000
    const expected = 120
    expect(ticksFor(repeat(16, totalMs))).toBe(expected)
    expect(ticksFor(repeat(100, totalMs))).toBe(expected)
    expect(ticksFor(repeat(1000, totalMs))).toBe(expected)
    expect(ticksFor(Array.from({ length: 3600 }, () => 16.6667))).toBe(
      Math.floor((3600 * 16.6667) / 500),
    )
  })

  it('speed scales ticks: 2/4/6/10 per second; 5× = 5 × 1×', () => {
    for (const [speed, perSec] of [
      [1, 2],
      [2, 4],
      [3, 6],
      [5, 10],
    ] as const) {
      expect(ticksFor(repeat(16, 10_000), speed)).toBe(perSec * 10)
    }
    expect(ticksFor(repeat(7, 7_000), 3)).toBe(42) // 166,67 ms/tick không trôi số thực
  })

  it('caps ticks per frame and carries the rest to later frames', () => {
    const o = { ...opts, maxTicks: 3 }
    let clock = createClock(0)
    const a = advanceClock(clock, 5_000, o) // 10 tick đến hạn
    expect(a.ticks).toBe(3)
    clock = a.clock
    let total = a.ticks
    for (let i = 0; i < 5; i++) {
      const b = advanceClock(clock, 5_000, o)
      clock = b.clock
      total += b.ticks
    }
    expect(total).toBe(10)
  })

  it('paused drops backlog so ticks do not burst after resume', () => {
    let clock = createClock(0)
    clock = advanceClock(clock, 10_000, { ...opts, paused: true }).clock
    expect(advanceClock(clock, 10_500, opts).ticks).toBe(1)
  })

  it('backlog is kept across capped frames', () => {
    let clock = createClock(0, 2)
    const a = advanceClock(clock, 3_600_000, { ...opts, maxTicks: 10 })
    expect(a.ticks).toBe(10)
    clock = a.clock
    const rest = advanceClock(clock, 3_600_000, opts)
    expect(a.ticks + rest.ticks).toBe(14_400)
  })

  it('N06: a long online gap is not cut: same 9 hours → same ticks however split', () => {
    const HOUR = 3_600_000
    expect(ticksFor([4 * HOUR, 4 * HOUR, HOUR])).toBe(64_800)
    expect(ticksFor([9 * HOUR])).toBe(64_800)
  })

  it('N07: speed change at a tick boundary is exact, whatever the time origin', () => {
    // 2 ms × 1 + 166 ms × 3 = 500 ms = đúng 1 tick.
    for (const origin of [0, 1_000, 123_457, 1e12]) {
      let clock = createClock(origin, 1)
      clock = setClockSpeed(clock, origin + 2, 3)
      expect(advanceClock(clock, origin + 168, opts).ticks).toBe(1)
    }
    // 100 ms × 1 rồi 2×/3×/5×: tick đầu đúng tại 500 ms thời gian game.
    for (const speed of [2, 3, 5] as const) {
      const ms = 400 / speed
      if (!Number.isInteger(ms)) continue
      for (const origin of [0, 7_777, 1e12]) {
        let clock = createClock(origin, 1)
        clock = setClockSpeed(clock, origin + 100, speed)
        const before = advanceClock(clock, origin + 100 + ms - 1, opts)
        expect(before.ticks).toBe(0)
        expect(advanceClock(before.clock, origin + 100 + ms, opts).ticks).toBe(
          1,
        )
      }
    }
  })

  it('B07: clock going backwards or NaN grants no time and loses none', () => {
    let clock = createClock(0)
    let total = 0
    for (const t of [5_000, 4_000, 5_000, NaN, 5_500]) {
      const a = advanceClock(clock, t, opts)
      clock = a.clock
      total += a.ticks
    }
    expect(total).toBe(11)
    expect(advanceClock(createClock(NaN), NaN, opts).ticks).toBe(0)
  })

  it('maxTicks NaN/negative → no ticks; Infinity → all due', () => {
    for (const maxTicks of [NaN, -5])
      expect(
        advanceClock(createClock(0), 5_000, { ...opts, maxTicks }).ticks,
      ).toBe(0)
    expect(
      advanceClock(createClock(0), 5_000, { ...opts, maxTicks: Infinity })
        .ticks,
    ).toBe(10)
  })

  it('B06: setClockSpeed keeps partial time; same speed is a no-op', () => {
    let clock = createClock(0)
    clock = advanceClock(clock, 250, opts).clock // nửa tick ở 1×
    expect(setClockSpeed(clock, 250, 1)).toBe(clock)
    clock = setClockSpeed(clock, 250, 2)
    expect(advanceClock(clock, 375, opts).ticks).toBe(1)
    // Thời gian lùi khi đổi tốc độ không cấp thêm tick.
    const back = setClockSpeed(createClock(1_000), 0, 5)
    expect(advanceClock(back, 1_000, opts).ticks).toBe(0)
  })
})

describe('GameState', () => {
  it('starts at age 14 and ages one year per 360 ticks', () => {
    const s = createInitialState(content, 7)
    expect(ageYears(s, content)).toBe(14)
    expect(ageYears({ ...s, day: 359 }, content)).toBe(14)
    expect(ageYears({ ...s, day: 360 }, content)).toBe(15)
  })

  it('initial state is valid and JSON round-trips exactly', () => {
    const s = createInitialState(fixture, 123)
    expect(validateState(s, fixture)).toEqual([])
    expect(JSON.parse(JSON.stringify(s))).toEqual(s)
  })

  it.each([
    ['negative resource', { resources: { van: -1, tinhLuc: 100, jar: 0 } }],
    ['NaN resource', { resources: { van: NaN, tinhLuc: 100, jar: 0 } }],
    ['over max', { resources: { van: 0, tinhLuc: 101, jar: 0 } }],
    ['missing resource', { resources: { van: 0, tinhLuc: 100 } }],
    [
      'unknown resource',
      { resources: { van: 0, tinhLuc: 100, jar: 0, gold: 1 } },
    ],
    ['fractional day', { day: 1.5 }],
    ['unknown action', { currentActionId: 'nope' }],
    ['tich thoi over cap', { tichThoiTicks: MAX_AWAY_TICKS + 1 }],
    ['bad rng', { rng: -1 }],
    ['bad stop', { stop: { reason: 'x', detail: '' } }],
    ['extra field', { hack: 1 }],
  ])('rejects %s', (_, patch) => {
    expect(
      validateState({ ...createInitialState(fixture, 1), ...patch }, fixture),
    ).not.toEqual([])
  })

  it('rejects a missing field', () => {
    const s: Record<string, unknown> = { ...createInitialState(fixture, 1) }
    delete s.claimed
    expect(validateState(s, fixture)).toContain('missing field "claimed"')
  })

  it('hash is stable regardless of key order', () => {
    expect(hashState({ a: 1, b: { c: 2, d: 3 } })).toBe(
      hashState({ b: { d: 3, c: 2 }, a: 1 }),
    )
    expect(hashState({ a: 1 })).not.toBe(hashState({ a: 2 }))
  })
})

describe('ContentRegistry', () => {
  it('shipped content and fixture are valid', () => {
    expect(content.resources.tinhLuc.max).toBe(100)
    expect(validateContent(rawFixture)).toEqual([])
  })

  it('reports duplicates, broken references, bad numbers', () => {
    const bad = {
      ...rawFixture,
      resources: [
        ...rawFixture.resources,
        { id: 'van', name: 'x', min: 0, max: 1, initial: 2 },
      ],
      actions: [
        ...rawFixture.actions,
        {
          id: 'work',
          name: 'x',
          requires: [
            { type: 'resourceAtLeast' as const, resource: 'gold', amount: 1 },
          ],
          effects: [
            { type: 'addResource' as const, resource: 'van', amount: NaN },
          ],
          once: false,
        },
      ],
    }
    const errors = validateContent(bad)
    expect(errors).toEqual(
      expect.arrayContaining([
        'duplicate resource "van"',
        'resource "van": need min <= initial <= max',
        'duplicate action "work"',
        'action "work" requires: unknown resource "gold"',
        'action "work" effects: non-finite amount',
      ]),
    )
    expect(() => createContent(bad)).toThrow(/Invalid content/)
  })

  it('content is frozen', () => {
    expect(Object.isFrozen(fixture.actions)).toBe(true)
    expect(Object.isFrozen(fixture.xpTable)).toBe(true)
    expect(Object.isFrozen(fixture.origins.tieuPhu.skills)).toBe(true)
  })

  it.each<[string, Partial<typeof rawFixture>]>([
    [
      'unknown skill in condition',
      {
        actions: [
          {
            id: 'a',
            name: 'a',
            requires: [{ type: 'skillAtLeast', skill: 'bay', level: 1 }],
            effects: [],
            once: false,
          },
        ],
      },
    ],
    [
      'skill level above max',
      {
        actions: [
          {
            id: 'a',
            name: 'a',
            requires: [{ type: 'skillAtLeast', skill: 'vanTu', level: 51 }],
            effects: [],
            once: false,
          },
        ],
      },
    ],
    [
      'negative XP effect',
      {
        actions: [
          {
            id: 'a',
            name: 'a',
            requires: [],
            effects: [{ type: 'addSkillXp', skill: 'vanTu', amount: -1 }],
            once: false,
          },
        ],
      },
    ],
    [
      'duplicate skill',
      { skills: [...rawFixture.skills, { id: 'vanTu', name: 'x', ngo: true }] },
    ],
    [
      'lifespan skill unknown',
      { lifespan: { ...rawFixture.lifespan, skill: 'bay' } },
    ],
    [
      'linh căn with more elements than exist',
      { linhCan: [{ id: 'x', name: 'x', elements: 6, weightLife1: 1 }] },
    ],
    [
      'all life-1 weights zero',
      { linhCan: [{ id: 'x', name: 'x', elements: 3, weightLife1: 0 }] },
    ],
    ['ngộ min > max', { ngoTinh: { min: 1.2, max: 1 } }],
    [
      'origin gives unknown skill',
      { origins: [{ id: 'o', name: 'o', resources: {}, skills: { bay: 1 } }] },
    ],
    [
      'origin gives unknown resource',
      { origins: [{ id: 'o', name: 'o', resources: { gold: 1 }, skills: {} }] },
    ],
    ['no origins', { origins: [] }],
    [
      'trait XP factor 0',
      {
        traits: [
          { id: 't', name: 't', tiers: [{ xp: { vanTu: 0 }, lifespan: 0 }] },
        ],
      },
    ],
    ['trait without tiers', { traits: [{ id: 't', name: 't', tiers: [] }] }],
    [
      'name length 0',
      { identity: { ...rawFixture.identity, nameMaxLength: 0 } },
    ],
    [
      'name length 1.5',
      { identity: { ...rawFixture.identity, nameMaxLength: 1.5 } },
    ],
    ['no genders', { identity: { nameMaxLength: 16, genders: [] } }],
    [
      'duplicate gender',
      {
        identity: {
          nameMaxLength: 16,
          genders: [
            { id: 'nam', name: 'Nam' },
            { id: 'nam', name: 'Nam' },
          ],
        },
      },
    ],
  ])('rejects content: %s', (_name, patch) => {
    expect(validateContent({ ...rawFixture, ...patch })).not.toEqual([])
  })
})
