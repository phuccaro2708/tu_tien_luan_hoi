// Regression cho Codex audit P0: B04 (khóa prototype), B05 (runTicks dừng), R02 (nội dung bất biến).
import { describe, expect, it } from 'vitest'
import { applyCommand, runTicks } from '../../src/core/engine'
import { createInitialState, validateState } from '../../src/core/state'
import { createContent } from '../../src/data/registry'
import { evaluateCondition } from '../../src/systems/conditions'
import { resolveEffects } from '../../src/systems/effects'
import { applyResourceDeltas } from '../../src/systems/resources'
import type { GameState, RawContent } from '../../src/types/game'
import { fixture, rawFixture } from '../fixtures/content'

const PROTO_KEYS = ['toString', 'constructor', '__proto__', 'hasOwnProperty']

describe('B04: ids that collide with Object.prototype', () => {
  const fresh = () => createInitialState(fixture, 1)

  it.each(PROTO_KEYS)('"%s" is unknown everywhere', (id) => {
    const s = fresh()
    expect(
      applyCommand(s, fixture, { type: 'setAction', actionId: id }).ok,
    ).toBe(false)
    expect(
      evaluateCondition(s, {
        type: 'resourceAtLeast',
        resource: id,
        amount: 1,
      }),
    ).toBe(false)
    expect(evaluateCondition(s, { type: 'flag', flag: id, value: false })).toBe(
      true,
    )
    expect(
      applyResourceDeltas(
        s.resources,
        fixture.resources,
        JSON.parse(`{"${id}":1}`) as Record<string, number>,
      ).ok,
    ).toBe(false)

    // Save ngoài (JSON.parse tạo khóa riêng, kể cả "__proto__").
    const json = JSON.stringify(s)
    const extraResource = JSON.parse(
      json.replace('"resources":{', `"resources":{"${id}":1,`),
    ) as unknown
    expect(validateState(extraResource, fixture)).toContain(
      `unknown resource "${id}"`,
    )
    const badAction = { ...s, currentActionId: id }
    expect(validateState(badAction, fixture).length).toBeGreaterThan(0)
  })

  it.each(PROTO_KEYS)('setFlag "%s" stays an own data flag', (id) => {
    const r = resolveEffects(fresh(), fixture, [
      { type: 'setFlag', flag: id, value: true },
    ])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(Object.getPrototypeOf(r.value.flags)).toBe(Object.prototype)
    expect(Object.hasOwn(r.value.flags, id)).toBe(true)
    expect(
      evaluateCondition(r.value, { type: 'flag', flag: id, value: true }),
    ).toBe(true)
  })
})

describe('B05: runTicks always terminates', () => {
  const working = (): GameState => ({
    ...createInitialState(fixture, 1),
    currentActionId: 'payFee',
  })

  it.each([NaN, Infinity, -Infinity, -3, 0])('ticks=%s runs nothing', (n) => {
    const r = runTicks(working(), fixture, n)
    expect(r.ticksRun).toBe(0)
    expect(r.state.day).toBe(0)
  })

  it('fractional ticks round down', () => {
    expect(runTicks(working(), fixture, 2.7).ticksRun).toBe(2)
  })

  it('N08: at the last representable day no tick runs and no income is paid', () => {
    const s = { ...working(), day: Number.MAX_SAFE_INTEGER - 1 }
    const r = runTicks(s, fixture, 5)
    expect(r.ticksRun).toBe(1)
    expect(r.state.day).toBe(Number.MAX_SAFE_INTEGER)
    expect(r.state.resources.van).toBe(7) // đúng một ngày payFee
    expect(validateState(r.state, fixture)).toEqual([])
    expect(runTicks(r.state, fixture, 5).state).toBe(r.state)
  })
})

describe('R02: loaded content is isolated and deeply frozen', () => {
  it('mutating raw after load changes nothing', () => {
    const raw = structuredClone(rawFixture) as RawContent
    const c = createContent(raw)
    const effect = raw.actions[0].effects[0]
    if (effect.type === 'addResource') effect.amount = 999
    raw.resources[0].max = 1
    expect(c.actions.work.effects[0]).toEqual(rawFixture.actions[0].effects[0])
    expect(c.resources.van.max).toBe(rawFixture.resources[0].max)
  })

  it('nested definitions cannot be mutated', () => {
    expect(Object.isFrozen(fixture.calendar)).toBe(true)
    expect(Object.isFrozen(fixture.resources.van)).toBe(true)
    expect(Object.isFrozen(fixture.actions.work.effects)).toBe(true)
    expect(Object.isFrozen(fixture.actions.work.effects[0])).toBe(true)
    expect(Object.isFrozen(fixture.actions.study.requires[0])).toBe(true)
  })
})
