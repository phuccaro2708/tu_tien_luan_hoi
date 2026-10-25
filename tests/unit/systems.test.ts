import { describe, expect, it } from 'vitest'
import { applyCommand, runTicks } from '../../src/core/engine'
import { createInitialState } from '../../src/core/state'
import { checkAction } from '../../src/systems/actions'
import { evaluateCondition, firstUnmet } from '../../src/systems/conditions'
import { resolveEffects } from '../../src/systems/effects'
import { applyResourceDeltas } from '../../src/systems/resources'
import type { GameState } from '../../src/types/game'
import { fixture } from '../fixtures/content'

const fresh = (patch: Partial<GameState> = {}): GameState => ({
  ...createInitialState(fixture, 1),
  ...patch,
})
const withAction = (s: GameState, id: string): GameState => {
  const r = applyCommand(s, fixture, { type: 'setAction', actionId: id })
  if (!r.ok) throw new Error(r.error)
  return r.value
}

describe('ResourceSystem invariants', () => {
  const res = { van: 5, tinhLuc: 100, jar: 0 }

  it('rejects going below min and leaves input untouched', () => {
    expect(applyResourceDeltas(res, fixture.resources, { van: -6 }).ok).toBe(
      false,
    )
    expect(res.van).toBe(5)
  })

  it.each([NaN, Infinity, -Infinity])('rejects non-finite delta %s', (d) => {
    expect(applyResourceDeltas(res, fixture.resources, { van: d }).ok).toBe(
      false,
    )
  })

  it('clamps overflow to max, including huge finite deltas', () => {
    const r = applyResourceDeltas(res, fixture.resources, {
      tinhLuc: 50,
      van: Number.MAX_VALUE,
    })
    expect(r).toEqual({
      ok: true,
      value: { van: 1_000_000, tinhLuc: 100, jar: 0 },
    })
  })

  it('rejects overflow to Infinity', () => {
    const big = { ...res, van: Number.MAX_VALUE }
    const defs = {
      ...fixture.resources,
      van: { ...fixture.resources.van, max: Infinity },
    }
    expect(applyResourceDeltas(big, defs, { van: Number.MAX_VALUE }).ok).toBe(
      false,
    )
  })

  it('allows fractional amounts and rejects unknown resources', () => {
    expect(applyResourceDeltas(res, fixture.resources, { van: 0.04 })).toEqual({
      ok: true,
      value: { van: 5.04, tinhLuc: 100, jar: 0 },
    })
    expect(applyResourceDeltas(res, fixture.resources, { gold: 1 }).ok).toBe(
      false,
    )
  })
})

describe('ConditionEvaluator', () => {
  it('evaluates resource and flag conditions, missing flag = false', () => {
    const s = fresh({
      resources: { van: 5, tinhLuc: 100, jar: 0 },
      flags: { a: true },
    })
    expect(
      evaluateCondition(s, fixture, {
        type: 'resourceAtLeast',
        resource: 'van',
        amount: 5,
      }),
    ).toBe(true)
    expect(
      evaluateCondition(s, fixture, {
        type: 'resourceAtLeast',
        resource: 'van',
        amount: 5.01,
      }),
    ).toBe(false)
    expect(
      evaluateCondition(s, fixture, { type: 'flag', flag: 'a', value: true }),
    ).toBe(true)
    expect(
      evaluateCondition(s, fixture, { type: 'flag', flag: 'b', value: false }),
    ).toBe(true)
  })

  it('reports the first unmet condition', () => {
    const conds = fixture.actions.study.requires
    expect(firstUnmet(fresh(), fixture, conds)).toEqual(conds[0])
    expect(
      firstUnmet(fresh({ flags: { canStudy: true } }), fixture, conds),
    ).toEqual(conds[1])
  })
})

describe('EffectResolver', () => {
  it('is all-or-nothing: a failing resource change also discards flag changes', () => {
    const s = fresh()
    const r = resolveEffects(s, fixture, [
      { type: 'setFlag', flag: 'x', value: true },
      { type: 'addResource', resource: 'van', amount: -1 },
    ])
    expect(r.ok).toBe(false)
    expect(s.flags).toEqual({})
  })

  it('nets income before cost within one effect list (D23)', () => {
    const r = resolveEffects(fresh(), fixture, fixture.actions.payFee.effects)
    expect(r.ok && r.value.resources.van).toBe(7)
  })

  it('does not mutate the input state', () => {
    const s = fresh()
    const snapshot = structuredClone(s)
    resolveEffects(s, fixture, fixture.actions.treasure.effects)
    expect(s).toEqual(snapshot)
  })
})

describe('ActionSystem preconditions', () => {
  it('refuses unknown actions and unmet requirements with a reason', () => {
    expect(
      applyCommand(fresh(), fixture, { type: 'setAction', actionId: 'nope' }),
    ).toEqual({
      ok: false,
      error: 'unknown action "nope"',
    })
    const r = checkAction(
      fresh({ flags: { canStudy: true } }),
      fixture,
      'study',
    )
    expect(r).toEqual({ ok: false, error: 'requires van >= 5' })
  })

  it('stops without consuming a day when the action becomes unaffordable', () => {
    const s = withAction(
      fresh({ resources: { van: 2, tinhLuc: 100, jar: 0 } }),
      'spend',
    )
    const r = runTicks(s, fixture, 10)
    expect(r.ticksRun).toBe(2)
    expect(r.state.day).toBe(2)
    expect(r.state.resources.van).toBe(0)
    expect(r.state.stop).toEqual({
      reason: 'actionBlocked',
      detail: 'spend: insufficient van',
    })
    // Đang dừng: không chạy thêm cho tới khi resume.
    expect(runTicks(r.state, fixture, 10).ticksRun).toBe(0)
  })

  it('stops when a requirement stops holding mid-run', () => {
    const s = withAction(
      fresh({
        resources: { van: 12, tinhLuc: 100, jar: 0 },
        flags: { canStudy: true },
      }),
      'study',
    )
    const r = runTicks(s, fixture, 10)
    expect(r.ticksRun).toBe(2)
    expect(r.state.stop?.detail).toBe('study: requires van >= 5')
  })

  it('clamps per-tick overflow at the resource max', () => {
    const r = runTicks(withAction(fresh(), 'fill'), fixture, 5)
    expect(r.state.resources.jar).toBe(10)
  })
})

describe('one-time rewards', () => {
  it('pays exactly once, records the claim atomically, and cannot be re-selected', () => {
    const r = runTicks(withAction(fresh(), 'treasure'), fixture, 100)
    expect(r.ticksRun).toBe(1)
    expect(r.state.resources.van).toBe(100)
    expect(r.state.claimed).toEqual({ treasure: true })
    expect(r.state.currentActionId).toBeNull()
    expect(r.state.stop).toEqual({
      reason: 'actionCompleted',
      detail: 'treasure',
    })

    const resumed = applyCommand(r.state, fixture, { type: 'resume' })
    expect(
      resumed.ok &&
        applyCommand(resumed.value, fixture, {
          type: 'setAction',
          actionId: 'treasure',
        }),
    ).toEqual({
      ok: false,
      error: 'already claimed "treasure"',
    })
  })

  it('a claimed reward forced back into currentActionId is blocked, not paid', () => {
    const s = fresh({
      claimed: { treasure: true },
      currentActionId: 'treasure',
    })
    const r = runTicks(s, fixture, 5)
    expect(r.state.resources.van).toBe(0)
    expect(r.state.stop?.reason).toBe('actionBlocked')
  })
})
