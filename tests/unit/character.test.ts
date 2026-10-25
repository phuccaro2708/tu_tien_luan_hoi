// Nhân vật kiếp 1, danh tính, kỹ năng/XP, thọ nguyên và save v2 (PROGRESSION §3, §5, §6; D04, D32).
import { describe, expect, it } from 'vitest'
import { applyCommand, runTicks, step } from '../../src/core/engine'
import { seedRng } from '../../src/core/rng'
import { createInitialState, validateState } from '../../src/core/state'
import { applyOrigin, rollLife1 } from '../../src/systems/character'
import {
  checkLifespan,
  daysLeft,
  lifespanYears,
} from '../../src/systems/lifespan'
import { simulateAway, spendTichThoi } from '../../src/systems/offline'
import { staminaMax } from '../../src/systems/stamina'
import { gainSkillXp, levelForXp, skillLevel } from '../../src/systems/skills'
import type { Character, GameState } from '../../src/types/game'
import { parseSave, SAVE_VERSION, serializeSave } from '../../src/utils/save'
import { fixture, lifeFixture, named, startGame } from '../fixtures/content'

/** Nhân vật cố định để số liệu không phụ thuộc kết quả tung. */
const plain: Character = {
  identity: { name: 'Thử', gender: 'nam' },
  linhCan: { id: 'tam', elements: ['kim', 'thuy', 'tho'] },
  ngoTinh: 1,
  originId: 'tieuPhu',
  innateTrait: { id: 'cuongTrang', tier: 1 },
}
const zeroXp = Object.fromEntries(
  Object.keys(fixture.skills).map((id) => [id, 0]),
)
const make = (
  patch: Partial<GameState> = {},
  character: Partial<Character> = {},
  content = fixture,
): GameState => ({
  ...createInitialState(content, 1),
  stop: null,
  skillXp: zeroXp,
  ...patch,
  character: { ...plain, ...character },
})
const ok = <T>(r: { ok: true; value: T } | { ok: false; error: string }): T => {
  if (!r.ok) throw new Error(r.error)
  return r.value
}

describe('rollLife1 (D04)', () => {
  it('same seed → same character; state starts valid', () => {
    for (const seed of [0, 1, 42, 0xffffffff]) {
      const a = createInitialState(fixture, seed)
      expect(createInitialState(fixture, seed)).toEqual(a)
      expect(validateState(a, fixture)).toEqual([])
    }
  })

  it('golden: seed 1 rolls the same life forever (changing draw order breaks this)', () => {
    expect(createInitialState(fixture, 1).character).toMatchInlineSnapshot(`
      {
        "identity": null,
        "innateTrait": {
          "id": "theNhuoc",
          "tier": 1,
        },
        "linhCan": {
          "elements": [
            "kim",
            "thuy",
            "hoa",
            "tho",
          ],
          "id": "tu",
        },
        "ngoTinh": 0.9343310508877039,
        "originId": "haiThuoc",
      }
    `)
  })

  it('distribution over 10 000 seeds matches the life-1 weights; never Song/Thiên', () => {
    const N = 10_000
    const count = (key: (c: Character) => string) => {
      const m: Record<string, number> = {}
      for (let seed = 0; seed < N; seed++) {
        const k = key(rollLife1(fixture, seedRng(seed)).character)
        m[k] = (m[k] ?? 0) + 1
      }
      return m
    }
    const lc = count((c) => c.linhCan.id)
    expect(Object.keys(lc).sort()).toEqual(['ngu', 'tam', 'tu'])
    expect(lc.ngu / N).toBeCloseTo(0.35, 1)
    expect(lc.tu / N).toBeCloseTo(0.5, 1)
    expect(lc.tam / N).toBeCloseTo(0.15, 1)
    for (const n of Object.values(count((c) => c.originId)))
      expect(Math.abs(n / N - 1 / 3)).toBeLessThan(0.02)
    const traits = count((c) => c.innateTrait.id)
    expect(Object.keys(traits)).toHaveLength(6)
    for (const n of Object.values(traits))
      expect(Math.abs(n / N - 1 / 6)).toBeLessThan(0.02)
    // Mỗi hệ có mặt với xác suất như nhau.
    const el: Record<string, number> = {}
    for (let seed = 0; seed < N; seed++)
      for (const e of rollLife1(fixture, seedRng(seed)).character.linhCan
        .elements)
        el[e] = (el[e] ?? 0) + 1
    const mean = Object.values(el).reduce((a, b) => a + b, 0) / 5
    for (const n of Object.values(el))
      expect(Math.abs(n / mean - 1)).toBeLessThan(0.05)
  })

  it('elements: right count, distinct, in data order; ngộ in [0.85, 1.15); tier 1', () => {
    const order = fixture.elements.map((e) => e.id)
    for (let seed = 0; seed < 500; seed++) {
      const { character: c } = rollLife1(fixture, seedRng(seed))
      const els = c.linhCan.elements
      expect(els).toHaveLength(fixture.linhCan[c.linhCan.id].elements)
      expect(
        [...els].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
      ).toEqual(els)
      expect(new Set(els).size).toBe(els.length)
      expect(c.ngoTinh).toBeGreaterThanOrEqual(0.85)
      expect(c.ngoTinh).toBeLessThan(1.15)
      expect(c.innateTrait.tier).toBe(1)
    }
  })

  it('advances the RNG so later draws differ from the roll', () => {
    expect(rollLife1(fixture, seedRng(1)).rng).not.toBe(seedRng(1))
  })
})

describe('applyOrigin', () => {
  it('bán hàng rong: +100 văn, Giao Tế cấp 3, other skills 0', () => {
    const r = applyOrigin(fixture, 'banHangRong', {
      van: 5,
      tinhLuc: 100,
      jar: 0,
    })
    expect(r.resources).toEqual({ van: 105, tinhLuc: 100, jar: 0 })
    expect(levelForXp(fixture, r.skillXp.giaoTe)).toBe(3)
    expect(r.skillXp.giaoTe).toBe(fixture.xpTable[3])
    expect(Object.keys(r.skillXp).sort()).toEqual(
      Object.keys(fixture.skills).sort(),
    )
    expect(r.skillXp.thePhach).toBe(0)
  })

  it('tiều phu: Thể Phách 2; hái thuốc: Thảo Dược 3; resources clamp at max', () => {
    expect(applyOrigin(fixture, 'tieuPhu', {}).skillXp.thePhach).toBe(
      fixture.xpTable[2],
    )
    expect(applyOrigin(fixture, 'haiThuoc', {}).skillXp.thaoDuoc).toBe(
      fixture.xpTable[3],
    )
    const max = fixture.resources.van.max
    expect(
      applyOrigin(fixture, 'banHangRong', { van: max - 1 }).resources.van,
    ).toBe(max)
  })
})

describe('skills and XP (PROGRESSION §5)', () => {
  it('XP(L→L+1) = round(10 × max(1, L)^1.6), cumulative, 50 levels', () => {
    const t = fixture.xpTable
    expect(t).toHaveLength(51)
    expect(t[0]).toBe(0)
    for (let L = 0; L < 50; L++)
      expect(t[L + 1] - t[L]).toBe(Math.round(10 * Math.max(1, L) ** 1.6))
    expect([1, 5, 10, 30].map((L) => t[L + 1] - t[L])).toEqual([
      10, 131, 398, 2309,
    ])
  })

  it('levelForXp: boundaries', () => {
    const t = fixture.xpTable
    expect(levelForXp(fixture, 0)).toBe(0)
    expect(levelForXp(fixture, t[1] - 0.001)).toBe(0)
    expect(levelForXp(fixture, t[1])).toBe(1)
    expect(levelForXp(fixture, t[50])).toBe(50)
    expect(levelForXp(fixture, t[50] * 10)).toBe(50)
  })

  it('ngộ multiplies only intellect skills (not Giao Tế, not body)', () => {
    const s = make({}, { ngoTinh: 1.1 })
    expect(gainSkillXp(s, fixture, 'vanTu', 100).skillXp.vanTu).toBeCloseTo(110)
    expect(
      gainSkillXp(s, fixture, 'thaoDuoc', 100).skillXp.thaoDuoc,
    ).toBeCloseTo(110)
    expect(gainSkillXp(s, fixture, 'thoNap', 100).skillXp.thoNap).toBeCloseTo(
      110,
    )
    expect(gainSkillXp(s, fixture, 'giaoTe', 100).skillXp.giaoTe).toBe(100)
    expect(gainSkillXp(s, fixture, 'thePhach', 100).skillXp.thePhach).toBe(100)
  })

  it('innate trait XP factor stacks with ngộ', () => {
    const s = make(
      {},
      { ngoTinh: 1.1, innateTrait: { id: 'theNhuoc', tier: 1 } },
    )
    expect(gainSkillXp(s, fixture, 'vanTu', 100).skillXp.vanTu).toBeCloseTo(132)
    const k = make({}, { innateTrait: { id: 'kheoMieng', tier: 1 } })
    expect(
      gainSkillXp(k, fixture, 'thePhach', 100).skillXp.thePhach,
    ).toBeCloseTo(90)
    expect(gainSkillXp(k, fixture, 'giaoTe', 100).skillXp.giaoTe).toBeCloseTo(
      120,
    )
  })

  it('one gain can jump several levels; caps at level 50; no-op returns same state', () => {
    const s = gainSkillXp(make(), fixture, 'thePhach', fixture.xpTable[5])
    expect(skillLevel(s, fixture, 'thePhach')).toBe(5)
    const capped = gainSkillXp(s, fixture, 'thePhach', 1e15)
    expect(capped.skillXp.thePhach).toBe(fixture.xpTable[50])
    expect(gainSkillXp(capped, fixture, 'thePhach', 1)).toBe(capped)
    expect(gainSkillXp(s, fixture, 'thePhach', 0)).toBe(s)
    expect(gainSkillXp(s, fixture, 'thePhach', -5)).toBe(s)
    expect(gainSkillXp(s, fixture, 'nope', 5)).toBe(s)
  })
})

describe('skill unlock through actions', () => {
  it('skillAtLeast gates an action until addSkillXp effects reach the level', () => {
    let s = make({ resources: { van: 10, tinhLuc: 100, jar: 0 } })
    const denied = applyCommand(s, fixture, {
      type: 'setAction',
      actionId: 'haul',
    })
    expect(denied).toEqual({ ok: false, error: 'requires thePhach >= 5' })
    s = ok(applyCommand(s, fixture, { type: 'setAction', actionId: 'train' }))
    s = runTicks(s, fixture, 3).state // 150 XP < 200 (cấp 5)
    expect(skillLevel(s, fixture, 'thePhach')).toBe(4)
    expect(
      applyCommand(s, fixture, { type: 'setAction', actionId: 'haul' }).ok,
    ).toBe(false)
    s = runTicks(s, fixture, 1).state
    expect(skillLevel(s, fixture, 'thePhach')).toBe(5)
    expect(s.resources.van).toBe(6)
    expect(
      applyCommand(s, fixture, { type: 'setAction', actionId: 'haul' }).ok,
    ).toBe(true)
  })

  it('a blocked cost grants no XP (effects are atomic)', () => {
    let s = make({ resources: { van: 0, tinhLuc: 100, jar: 0 } })
    s = ok(applyCommand(s, fixture, { type: 'setAction', actionId: 'train' }))
    const after = step(s, fixture)
    expect(after.stop?.reason).toBe('actionBlocked')
    expect(after.skillXp).toBe(s.skillXp)
    expect(after.day).toBe(s.day)
  })
})

describe('lifespan and death (PROGRESSION §6)', () => {
  const dpy = 360
  // Mặc định Thiết cốt (không cộng/trừ thọ nguyên): thọ nguyên 60, khởi đầu 14 tuổi → chết ở ngày 46 × 360.
  const life = (patch: Partial<GameState> = {}, c: Partial<Character> = {}) =>
    make(patch, { innateTrait: { id: 'thietCot', tier: 1 }, ...c }, lifeFixture)
  const deathDay = 46 * dpy

  it('formula: base + min(6, floor(Thể Phách / 5)) + trait', () => {
    expect(lifespanYears(life(), lifeFixture)).toBe(60)
    const tp = (L: number) => ({ ...zeroXp, thePhach: lifeFixture.xpTable[L] })
    expect(lifespanYears(life({ skillXp: tp(4) }), lifeFixture)).toBe(60)
    expect(lifespanYears(life({ skillXp: tp(5) }), lifeFixture)).toBe(61)
    expect(lifespanYears(life({ skillXp: tp(30) }), lifeFixture)).toBe(66)
    expect(lifespanYears(life({ skillXp: tp(50) }), lifeFixture)).toBe(66)
    const weak = { innateTrait: { id: 'theNhuoc', tier: 1 } }
    expect(lifespanYears(life({}, weak), lifeFixture)).toBe(56)
    const strong = { innateTrait: { id: 'cuongTrang', tier: 1 } }
    expect(lifespanYears(life({}, strong), lifeFixture)).toBe(63)
    expect(
      daysLeft(
        life({}, { innateTrait: { id: 'thietCot', tier: 1 } }),
        lifeFixture,
      ),
    ).toBe(deathDay)
  })

  it('pauses at 10 / 5 / 1 years left, then dies on the exact tick', () => {
    let s = life({}, { innateTrait: { id: 'thietCot', tier: 1 } })
    const stops: [string, string, number][] = []
    while (s.stop?.reason !== 'death') {
      s = runTicks(s, lifeFixture, 1e9).state
      stops.push([s.stop!.reason, s.stop!.detail, s.day])
      if (s.stop?.reason !== 'death')
        s = ok(applyCommand(s, lifeFixture, { type: 'resume' }))
    }
    expect(stops).toEqual([
      ['lifespanWarning', '10', deathDay - 10 * dpy],
      ['lifespanWarning', '5', deathDay - 5 * dpy],
      ['lifespanWarning', '1', deathDay - dpy],
      ['death', '60', deathDay],
    ])
  })

  it('after death no command applies and no tick runs', () => {
    const dead = runTicks(
      life({ day: deathDay - 1 }, { innateTrait: { id: 'thietCot', tier: 1 } }),
      lifeFixture,
      5,
    ).state
    expect(dead.stop?.reason).toBe('death')
    for (const cmd of [
      { type: 'resume' as const },
      { type: 'setAction' as const, actionId: 'idle' },
    ])
      expect(applyCommand(dead, lifeFixture, cmd).ok).toBe(false)
    expect(step(dead, lifeFixture)).toBe(dead)
    expect(
      spendTichThoi({ ...dead, tichThoiTicks: 100 }, lifeFixture).ticksRun,
    ).toBe(0)
  })

  it('death overrides a once-action completion on the same tick; a warning does too', () => {
    const at = (day: number) =>
      step(
        life(
          { day, currentActionId: 'treasure' },
          { innateTrait: { id: 'thietCot', tier: 1 } },
        ),
        lifeFixture,
      )
    const dying = at(deathDay - 1)
    expect(dying.stop?.reason).toBe('death')
    expect(dying.claimed).toEqual({ treasure: true })
    expect(at(deathDay - 10 * dpy - 1).stop).toEqual({
      reason: 'lifespanWarning',
      detail: '10',
    })
  })

  it('checkLifespan: a drop that crosses several marks in one tick reports the nearest one', () => {
    // Hiện thọ nguyên chỉ tăng trong một tick (Thể Phách); thọ nguyên giảm (S9, P3/P4) có thể vượt nhiều mốc.
    const cuong = { innateTrait: { id: 'cuongTrang', tier: 1 } } // 63 năm
    const before = life({ day: 38 * dpy }, cuong) // còn 11 năm
    const after = life(
      { day: 38 * dpy + 1 },
      { innateTrait: { id: 'theNhuoc', tier: 1 } },
    ) // 56 năm → còn < 4
    expect(checkLifespan(before, after, lifeFixture).stop).toEqual({
      reason: 'lifespanWarning',
      detail: '5',
    })
    // Không vượt mốc nào → giữ nguyên state.
    expect(checkLifespan(before, before, lifeFixture)).toBe(before)
  })

  it('offline stops at death; the remainder becomes Tích Thời and cannot be spent', () => {
    const s = life(
      { day: deathDay - dpy + 1 },
      { innateTrait: { id: 'thietCot', tier: 1 } },
    )
    const away = simulateAway(s, lifeFixture, 8 * 3_600_000)
    expect(away.state.stop?.reason).toBe('death')
    expect(away.state.day).toBe(deathDay)
    expect(away.ticksRun).toBe(dpy - 1)
    expect(away.tichThoiAdded).toBe(57_600 - (dpy - 1))
  })
})

describe('save v2', () => {
  const v1Of = (s: GameState) => {
    const rest: Partial<GameState> = { ...s }
    delete rest.character
    delete rest.skillXp
    return { ...rest, stop: null, rng: seedRng(s.seed) }
  }
  const text = (version: unknown, state: unknown) =>
    JSON.stringify({ version, savedAt: 123, speed: 2, state })

  it('round-trips a v2 save', () => {
    const s = runTicks(make({ currentActionId: 'work' }), fixture, 50).state
    const loaded = ok(parseSave(ok(serializeSave(s, fixture, 9, 3)), fixture))
    expect(loaded.state).toEqual(s)
    expect(SAVE_VERSION).toBe(2)
  })

  it('migrates v1 → v2: rolls the same life a new game with that seed gets', () => {
    for (const seed of [1, 7, 99]) {
      const fresh = createInitialState(fixture, seed)
      const base = {
        ...v1Of(fresh),
        resources: { van: 0, tinhLuc: 100, jar: 0 },
      }
      const loaded = ok(parseSave(text(1, base), fixture))
      // Tinh lực v1 giữ nguyên (100), game mới bắt đầu đầy (D35).
      expect(loaded.state).toEqual({
        ...fresh,
        resources: { ...fresh.resources, tinhLuc: 100 },
      })
      expect(loaded.savedAt).toBe(123)
    }
  })

  it('v1 progress (day, resources, flags) is kept; origin money is added on top', () => {
    const fresh = createInitialState(fixture, 7)
    const v1 = {
      ...v1Of(fresh),
      day: 500,
      resources: { van: 7, tinhLuc: 40, jar: 2 },
      flags: { a: true },
    }
    const s = ok(parseSave(text(1, v1), fixture)).state
    const bonus = fixture.origins[s.character.originId].resources.van ?? 0
    expect(s.day).toBe(500)
    expect(s.flags).toEqual({ a: true })
    expect(s.resources).toEqual({ van: 7 + bonus, tinhLuc: 40, jar: 2 })
    expect(s.character).toEqual(fresh.character)
  })

  it('a v1 save already past the rolled lifespan asks for a name, then dies on its first tick', () => {
    // Save P0 không có thọ nguyên: chơi lâu (≥ 46 năm game) rồi migrate → chết ngay khi tick; chơi lại bằng kiếp mới (D31).
    const v1 = { ...v1Of(createInitialState(lifeFixture, 3)), day: 30_000 }
    const loaded = ok(parseSave(text(1, v1), lifeFixture)).state
    expect(loaded.stop?.reason).toBe('chooseIdentity')
    const away = simulateAway(
      named(lifeFixture, loaded),
      lifeFixture,
      3_600_000,
    )
    expect(away.state.stop?.reason).toBe('death')
    expect(away.state.day).toBe(30_001)
    expect(away.ticksRun).toBe(1)
  })

  it('an aged v1 save loads with Tinh lực clamped to the aged max, not rejected', () => {
    const v1 = { ...v1Of(createInitialState(lifeFixture, 3)), day: 45 * 360 }
    const s = ok(parseSave(text(1, v1), lifeFixture)).state
    expect(s.resources.tinhLuc).toBeLessThan(100)
    expect(s.resources.tinhLuc).toBe(staminaMax(s, lifeFixture))
  })

  it.each([
    ['v1 with v2 fields', text(1, createInitialState(fixture, 1))],
    [
      'broken v1 field',
      text(1, { ...v1Of(createInitialState(fixture, 1)), day: -1 }),
    ],
    ['v1 not an object', text(1, [1])],
    ['v2 missing character', text(2, v1Of(createInitialState(fixture, 1)))],
    ['version 0', text(0, createInitialState(fixture, 1))],
    ['version 3', text(3, createInitialState(fixture, 1))],
    ['version "2"', text('2', createInitialState(fixture, 1))],
    ['version 1.5', text(1.5, createInitialState(fixture, 1))],
  ])('rejects %s', (_name, saveText) => {
    expect(parseSave(saveText, fixture).ok).toBe(false)
  })
})

describe('validateState: character and skills', () => {
  const good = startGame(fixture, 1)
  const withChar = (c: object) => ({
    ...good,
    character: { ...good.character, ...c },
  })

  it.each<[string, unknown]>([
    ['no character', { ...good, character: undefined }],
    [
      'linhCan unknown',
      withChar({ linhCan: { id: 'thien', elements: ['kim'] } }),
    ],
    [
      'linhCan proto key',
      withChar({ linhCan: { id: 'constructor', elements: [] } }),
    ],
    [
      'too few elements',
      withChar({ linhCan: { id: 'tam', elements: ['kim', 'moc'] } }),
    ],
    [
      'duplicate elements',
      withChar({ linhCan: { id: 'tam', elements: ['kim', 'kim', 'moc'] } }),
    ],
    [
      'unknown element',
      withChar({ linhCan: { id: 'tam', elements: ['kim', 'moc', 'loi'] } }),
    ],
    [
      'extra linhCan key',
      withChar({
        linhCan: { id: 'tam', elements: ['kim', 'moc', 'tho'], x: 1 },
      }),
    ],
    ['ngộ too high', withChar({ ngoTinh: 1.5 })],
    ['ngộ NaN', withChar({ ngoTinh: NaN })],
    ['origin unknown', withChar({ originId: 'vua' })],
    ['trait unknown', withChar({ innateTrait: { id: 'x', tier: 1 } })],
    ['trait tier 0', withChar({ innateTrait: { id: 'thietCot', tier: 0 } })],
    [
      'trait tier 2 (not in data yet)',
      withChar({ innateTrait: { id: 'thietCot', tier: 2 } }),
    ],
    [
      'trait tier 1.5',
      withChar({ innateTrait: { id: 'thietCot', tier: 1.5 } }),
    ],
    ['extra character key', withChar({ name: 'A' })],
    ['identity missing', withChar({ identity: undefined })],
    ['identity null while running', withChar({ identity: null })],
    [
      'identity name empty',
      withChar({ identity: { name: '', gender: 'nam' } }),
    ],
    [
      'identity name not trimmed',
      withChar({ identity: { name: ' A', gender: 'nam' } }),
    ],
    [
      'identity name too long',
      withChar({ identity: { name: 'a'.repeat(17), gender: 'nam' } }),
    ],
    [
      'identity gender unknown',
      withChar({ identity: { name: 'A', gender: 'x' } }),
    ],
    [
      'identity extra key',
      withChar({ identity: { name: 'A', gender: 'nam', age: 1 } }),
    ],
    [
      'chooseIdentity with an identity',
      { ...good, stop: { reason: 'chooseIdentity', detail: '' } },
    ],
    ['skillXp missing skill', { ...good, skillXp: { thePhach: 0 } }],
    ['skillXp negative', { ...good, skillXp: { ...good.skillXp, vanTu: -1 } }],
    [
      'skillXp over max',
      { ...good, skillXp: { ...good.skillXp, vanTu: fixture.xpTable[50] + 1 } },
    ],
    ['skillXp string', { ...good, skillXp: { ...good.skillXp, vanTu: '5' } }],
    [
      'skillXp unknown skill',
      { ...good, skillXp: { ...good.skillXp, bay: 0 } },
    ],
    ['stop reason unknown', { ...good, stop: { reason: 'nap', detail: '' } }],
  ])('rejects %s', (_name, state) => {
    expect(validateState(state, fixture)).not.toEqual([])
  })

  it('accepts the new stop reasons', () => {
    for (const reason of ['lifespanWarning', 'death'])
      expect(
        validateState({ ...good, stop: { reason, detail: '1' } }, fixture),
      ).toEqual([])
  })
})

describe('identity (D05, D32)', () => {
  const fresh = () => createInitialState(fixture, 1)
  const setId = (s: GameState, name: unknown, gender: unknown = 'nam') =>
    applyCommand(s, fixture, {
      type: 'setIdentity',
      name: name as string,
      gender: gender as string,
    })

  it('a new game waits at chooseIdentity: no tick runs, other commands are refused', () => {
    const s = fresh()
    expect(s.character.identity).toBeNull()
    expect(s.stop).toEqual({ reason: 'chooseIdentity', detail: '' })
    expect(runTicks(s, fixture, 100).ticksRun).toBe(0)
    for (const cmd of [
      { type: 'resume' as const },
      { type: 'setAction' as const, actionId: 'idle' },
    ])
      expect(applyCommand(s, fixture, cmd)).toEqual({
        ok: false,
        error: 'choose a name and gender first',
      })
  })

  it('setIdentity stores the trimmed NFC name, clears the stop, and lets time run', () => {
    const s = ok(setId(fresh(), '  Lý Thanh  ', 'nu'))
    expect(s.character.identity).toEqual({ name: 'Lý Thanh', gender: 'nu' })
    expect(s.stop).toBeNull()
    expect(runTicks(s, fixture, 3).ticksRun).toBe(3)
    expect(validateState(s, fixture)).toEqual([])
    // Tổ hợp (NFD) được chuẩn hóa về NFC.
    const nfd = ok(setId(fresh(), 'Lý'.normalize('NFD')))
    expect(nfd.character.identity?.name).toBe('Lý')
  })

  it('names: 1 and 16 characters (Vietnamese counted per character) are accepted', () => {
    expect(setId(fresh(), 'A').ok).toBe(true)
    const sixteen = 'Nguyễn Thị Hương' // 16 ký tự
    expect([...sixteen]).toHaveLength(16)
    expect(setId(fresh(), sixteen).ok).toBe(true)
  })

  it.each<[string, unknown]>([
    ['empty', ''],
    ['only spaces', '   '],
    ['17 characters', 'a'.repeat(17)],
    ['control character', 'A\u0007B'],
    ['newline', 'A\nB'],
    ['not a string', 5],
  ])('rejects a name: %s', (_n, name) => {
    expect(setId(fresh(), name).ok).toBe(false)
  })

  it('rejects an unknown gender and a second setIdentity', () => {
    expect(setId(fresh(), 'A', 'x').ok).toBe(false)
    const s = ok(setId(fresh(), 'A'))
    expect(setId(s, 'B')).toEqual({
      ok: false,
      error: 'identity already chosen',
    })
  })

  it('time away before choosing grants no Tích Thời', () => {
    const away = simulateAway(fresh(), fixture, 8 * 3_600_000)
    expect(away.ticksRun).toBe(0)
    expect(away.tichThoiAdded).toBe(0)
    expect(away.state.tichThoiTicks).toBe(0)
  })

  it('a v1 save migrates to chooseIdentity', () => {
    const v1: Partial<GameState> = { ...fresh(), stop: null }
    delete v1.character
    delete v1.skillXp
    const loaded = ok(
      parseSave(JSON.stringify({ version: 1, savedAt: 0, state: v1 }), fixture),
    )
    expect(loaded.state.stop?.reason).toBe('chooseIdentity')
    expect(loaded.state.character.identity).toBeNull()
  })
})

describe('stamina max (PROGRESSION §6, D35)', () => {
  const dpy = 360
  // lifeFixture: thọ nguyên thật. Thiết cốt: thọ nguyên 60 → lão hóa từ tuổi floor(0,8 × 60) = 48.
  const thiet = { innateTrait: { id: 'thietCot', tier: 1 } }
  const at = (age: number, patch: Partial<GameState> = {}) =>
    make({ day: (age - 14) * dpy, ...patch }, thiet, lifeFixture)
  const tp = (L: number) => ({ ...zeroXp, thePhach: lifeFixture.xpTable[L] })
  const withTinhLuc = (s: GameState, tinhLuc: number) => ({
    ...s,
    resources: { ...s.resources, tinhLuc },
  })

  it('100 + min(30, Thể Phách) + trait', () => {
    expect(staminaMax(at(14), lifeFixture)).toBe(100)
    expect(staminaMax(at(14, { skillXp: tp(10) }), lifeFixture)).toBe(110)
    expect(staminaMax(at(14, { skillXp: tp(40) }), lifeFixture)).toBe(130)
    expect(staminaMax(make({}, {}, lifeFixture), lifeFixture)).toBe(110) // Cường tráng
  })

  it('ages: −2 per full year past 80% of lifespan; never below 0', () => {
    expect([47, 48, 49, 55].map((a) => staminaMax(at(a), lifeFixture))).toEqual(
      [100, 100, 98, 86],
    )
    const weak = make(
      { day: 500 * dpy },
      { innateTrait: { id: 'theNhuoc', tier: 1 } },
      lifeFixture,
    )
    expect(staminaMax(weak, lifeFixture)).toBe(0)
  })

  it('the birthday tick past the mark clamps current Tinh lực', () => {
    const s = withTinhLuc(at(48, { day: 35 * dpy - 1 }), 100)
    const next = step(s, lifeFixture)
    expect(next.day).toBe(35 * dpy)
    expect(next.resources.tinhLuc).toBe(98)
  })

  it('effects cannot push Tinh lực above the current max', () => {
    let s = withTinhLuc(at(14), 90)
    s = ok(
      applyCommand(s, lifeFixture, { type: 'setAction', actionId: 'rest' }),
    )
    expect(step(s, lifeFixture).resources.tinhLuc).toBe(100)
  })

  it('validateState rejects Tinh lực above the current max', () => {
    expect(validateState(withTinhLuc(at(14), 100), lifeFixture)).toEqual([])
    expect(validateState(withTinhLuc(at(14), 101), lifeFixture)).toEqual([
      'resource "tinhLuc" above its current max',
    ])
  })

  it('a new game starts full; a fresh Cường tráng character round-trips its save', () => {
    const seeds = [...Array(60).keys()]
    for (const seed of seeds) {
      const s = createInitialState(lifeFixture, seed)
      expect(s.resources.tinhLuc).toBe(staminaMax(s, lifeFixture))
    }
    const seed = seeds.find(
      (sd) =>
        createInitialState(lifeFixture, sd).character.innateTrait.id ===
        'cuongTrang',
    )
    expect(seed).toBeDefined()
    const s = startGame(lifeFixture, seed!)
    expect(s.resources.tinhLuc).toBeGreaterThanOrEqual(110)
    expect(
      ok(parseSave(ok(serializeSave(s, lifeFixture, 0)), lifeFixture)).state,
    ).toEqual(s)
  })
})
