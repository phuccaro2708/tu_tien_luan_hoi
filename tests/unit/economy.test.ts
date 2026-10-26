// Kinh tế phàm nhân P1b: thu nhập trước phí (D23), Đói, nghỉ theo ngưỡng, nợ, save v3 (BALANCE §3, SYSTEMS S2).
import { describe, expect, it } from 'vitest'
import { hashState } from '../../src/core/hash'
import { applyCommand, runTicks, step } from '../../src/core/engine'
import { createInitialState, validateState } from '../../src/core/state'
import { content as real, rawContent } from '../../src/data/content'
import { createContent } from '../../src/data/registry'
import { updateResting } from '../../src/systems/economy'
import { staminaMax } from '../../src/systems/stamina'
import type { GameState } from '../../src/types/game'
import { parseSave, serializeSave } from '../../src/utils/save'
import { named } from '../fixtures/content'

const van = (s: GameState) => s.resources.van
const stamina = (s: GameState) => s.resources.tinhLuc

/** Game mới của đúng xuất thân (tìm seed đầu tiên ra xuất thân đó), đã đặt tên. */
function lifeOf(originId: string): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const s = createInitialState(real, seed)
    if (s.character.originId === originId) return named(real, s)
  }
  throw new Error(`no seed rolls ${originId}`)
}

const withAction = (s: GameState, actionId: string): GameState => {
  const r = applyCommand(s, real, { type: 'setAction', actionId })
  if (!r.ok) throw new Error(r.error)
  return r.value
}

describe('thanh toán thu nhập trước phí (D23)', () => {
  it('đủ trả: cộng thu nhập rồi trừ phí, không Đói', () => {
    // 0 văn < phí 8, nhưng 15 thu nhập cộng trước nên đủ trả.
    const s = withAction(lifeOf('haiThuoc'), 'lamThue')
    expect(van(s)).toBe(0)
    const next = step(s, real)
    expect(van(next)).toBe(15 - 8)
    expect(next.hungry).toBe(false)
  })

  it('không đủ trả: không trừ, không nợ, Đói đúng ngày đó', () => {
    const s = withAction(lifeOf('haiThuoc'), 'hocViecThuoc') // thu 5 < phí 8
    const next = step(s, real)
    expect(van(next)).toBe(5)
    expect(next.resources.no).toBe(s.resources.no)
    expect(next.hungry).toBe(true)
  })

  it('Đói giảm một nửa XP của ngày đó; ngày sau đủ tiền thì hết Đói', () => {
    const base = withAction(lifeOf('haiThuoc'), 'hocViecThuoc')
    const rich = { ...base, resources: { ...base.resources, van: 100 } }
    const full = step(rich, real)
    const hungry = step(base, real)
    const gain = (s: GameState) => s.skillXp.thaoDuoc - base.skillXp.thaoDuoc
    expect(full.hungry).toBe(false)
    expect(gain(hungry)).toBeCloseTo(gain(full) / 2, 9)
    // 5 văn thu nhập + 5 đang có = 10 ≥ 8: ngày thứ hai đủ trả.
    expect(step(hungry, real).hungry).toBe(false)
  })

  it('Nghỉ ngơi lúc Đói chỉ hồi một nửa Tinh lực', () => {
    const s0 = withAction(lifeOf('haiThuoc'), 'nghiNgoi')
    const s = { ...s0, resources: { ...s0.resources, tinhLuc: 10 } }
    const next = step(s, real)
    expect(next.hungry).toBe(true)
    expect(stamina(next)).toBe(10 + 15)
  })

  it('không chọn hành động: phí vẫn tính, hết tiền thì Đói', () => {
    const s = lifeOf('haiThuoc')
    expect(step(s, real).hungry).toBe(true)
    const rich = { ...s, resources: { ...s.resources, van: 20 } }
    expect(van(step(rich, real))).toBe(12)
  })
})

describe('nghỉ theo ngưỡng Tinh lực', () => {
  it('nghỉ khi < 20, làm lại khi ≥ 90 (có trễ)', () => {
    let s = withAction(lifeOf('banHangRong'), 'lamThue')
    s = { ...s, resources: { ...s.resources, tinhLuc: 19, van: 1000 } }
    const trace: [boolean, number][] = []
    for (let i = 0; i < 4; i++) {
      s = step(s, real)
      trace.push([s.resting, stamina(s)])
    }
    // 19 → nghỉ (+30) 49 → 79 → 109 kẹp max; ngày thứ 3 chạm 109 ≥ 90 nên ngày thứ 4 làm lại.
    expect(trace[0]).toEqual([true, 49])
    expect(trace[1]).toEqual([true, 79])
    expect(trace[2][0]).toBe(true)
    expect(step(s, real).resting).toBe(false)
  })

  it('nghỉ thay hành động đã chọn nhưng không bỏ chọn', () => {
    let s = withAction(lifeOf('banHangRong'), 'lamThue')
    s = { ...s, resources: { ...s.resources, tinhLuc: 5, van: 1000 } }
    const next = step(s, real)
    expect(next.currentActionId).toBe('lamThue')
    expect(van(next)).toBe(1000 - 8) // nghỉ không có thu nhập
  })
})

describe('R03: tick bị chặn không làm ngày trôi', () => {
  it('hành động hết điều kiện giữa chừng → dừng, ngày và state giữ nguyên', () => {
    const s = withAction(lifeOf('tieuPhu'), 'donCui')
    const broken = { ...s, flags: { ...s.flags, coRiu: false } }
    const next = step(broken, real)
    expect(next.stop?.reason).toBe('actionBlocked')
    expect(next.day).toBe(broken.day)
    expect(next.resources).toEqual(broken.resources)
  })
})

describe('nợ (G)', () => {
  it.each([
    ['tieuPhu', 800, true],
    ['haiThuoc', 800, false],
    ['banHangRong', 600, false],
  ])('xuất thân %s: nợ %i, rìu %s, hạn 360 ngày', (origin, debt, axe) => {
    const s = lifeOf(origin)
    expect(s.resources.no).toBe(debt)
    expect(s.hanNo).toBe(360)
    expect(s.flags.coRiu === true).toBe(axe)
  })

  it('Đốn củi cần rìu', () => {
    const r = applyCommand(lifeOf('haiThuoc'), real, {
      type: 'setAction',
      actionId: 'donCui',
    })
    expect(r.ok).toBe(false)
  })

  it('trả nợ chuyển văn sang nợ; từ chối số không hợp lệ hoặc vượt văn/nợ', () => {
    const s0 = lifeOf('banHangRong')
    const s = { ...s0, resources: { ...s0.resources, van: 150 } }
    const pay = (amount: number) =>
      applyCommand(s, real, { type: 'repayDebt', amount })
    const ok = pay(100)
    expect(ok.ok && [van(ok.value), ok.value.resources.no]).toEqual([
      150 - 100,
      600 - 100,
    ])
    for (const bad of [0, -5, NaN, Infinity, 151])
      expect(pay(bad).ok).toBe(false)
    const rich = { ...s, resources: { ...s.resources, van: 9999 } }
    const over = applyCommand(rich, real, { type: 'repayDebt', amount: 601 })
    expect(over.ok).toBe(false)
  })

  it('trả nợ khi đã chết bị từ chối', () => {
    const s = lifeOf('banHangRong')
    const dead = { ...s, stop: { reason: 'death' as const, detail: '' } }
    expect(applyCommand(dead, real, { type: 'repayDebt', amount: 1 }).ok).toBe(
      false,
    )
  })
})

describe('tiêu chí thoát P1b', () => {
  it('hồi phục từ tay trắng: sau 60 ngày chỉ Làm thuê, văn > 0 và hết Đói ở ngày làm', () => {
    for (const origin of ['tieuPhu', 'haiThuoc']) {
      let s = withAction(lifeOf(origin), 'lamThue')
      s = {
        ...s,
        resources: { ...s.resources, van: 0, tinhLuc: 0 },
        hungry: true,
      }
      s = runTicks(s, real, 60).state
      expect(van(s)).toBeGreaterThan(0)
      // Ngày làm việc kế tiếp (không nghỉ) không Đói.
      while (s.resting) s = step(s, real)
      expect(step(s, real).hungry).toBe(false)
    }
  })

  it('Làm thuê ròng ≈ +3,3 văn/ngày ở làng (BALANCE §3)', () => {
    let s = withAction(lifeOf('haiThuoc'), 'lamThue')
    s = { ...s, resources: { ...s.resources, van: 500 } }
    const after = runTicks(s, real, 360).state
    expect((van(after) - 500) / 360).toBeGreaterThan(2.5)
    expect((van(after) - 500) / 360).toBeLessThan(4.5)
  })

  // Tiêu chí thoát P1b (2): trả nợ 800 bằng Đốn củi trong ±10% mốc ~127 ngày của BALANCE §3.
  // Chính sách chuẩn: người chơi cẩn thận giữ dự trữ 5 ngày phí (40 văn) và chỉ trả phần dư. Trả sạch mỗi ngày
  // là mẹo (ngày nghỉ hết tiền → Đói → không bị trừ phí) nên không dùng làm chuẩn.
  it('đốn củi trả nợ 800 văn trong ±10% của 127 ngày (BALANCE §3), nhiều seed tiêu phu', () => {
    const reserve = 5 * real.economy!.livingCost
    const results: number[] = []
    for (let seed = 1; seed < 300 && results.length < 12; seed++) {
      let s = createInitialState(real, seed)
      if (s.character.originId !== 'tieuPhu') continue
      s = withAction(named(real, s), 'donCui')
      let paidDay = -1
      for (let i = 0; i < 360 && paidDay < 0; i++) {
        s = step(s, real)
        // Đủ văn trả hết nợ thì trả hết; không thì chỉ trả phần vượt dự trữ.
        const debt = s.resources.no
        const pay = van(s) >= debt ? debt : van(s) - reserve
        if (pay > 0) {
          const r = applyCommand(s, real, { type: 'repayDebt', amount: pay })
          if (r.ok) s = r.value
        }
        if (s.resources.no === 0) paidDay = s.day
      }
      results.push(paidDay)
    }
    expect(results.length).toBe(12)
    for (const d of results) {
      expect(d).toBeGreaterThanOrEqual(127 * 0.9)
      expect(d).toBeLessThanOrEqual(127 * 1.1)
    }
  })

  it('cùng seed + cùng lệnh → cùng hash', () => {
    const run = () =>
      runTicks(withAction(lifeOf('tieuPhu'), 'donCui'), real, 500).state
    expect(hashState(run())).toBe(hashState(run()))
  })
})

describe('validator dữ liệu kinh tế', () => {
  it('Làm thuê ròng ≤ 0 bị từ chối', () => {
    expect(() =>
      createContent({
        ...rawContent,
        economy: { ...rawContent.economy!, livingCost: 12 },
      }),
    ).toThrow(/nets <= 0/)
  })

  it('thiếu xuất thân hoặc nghỉ sai ngưỡng bị từ chối', () => {
    const eco = rawContent.economy!
    expect(() =>
      createContent({
        ...rawContent,
        economy: { ...eco, origins: { tieuPhu: eco.origins.tieuPhu } },
      }),
    ).toThrow(/missing origin/)
    expect(() =>
      createContent({ ...rawContent, economy: { ...eco, restBelow: 95 } }),
    ).toThrow(/bad numbers/)
  })

  it('hành động nghỉ có requires hoặc once bị từ chối', () => {
    for (const patch of [
      { once: true },
      { requires: [{ type: 'flag' as const, flag: 'coRiu', value: true }] },
    ])
      expect(() =>
        createContent({
          ...rawContent,
          actions: rawContent.actions.map((a) =>
            a.id === 'nghiNgoi' ? { ...a, ...patch } : a,
          ),
        }),
      ).toThrow(/restAction/)
  })

  it('Tinh lực tối đa thấp hơn ngưỡng nghỉ không kẹt ở trạng thái nghỉ', () => {
    const s = lifeOf('tieuPhu')
    const max = staminaMax(s, real)
    // Tinh lực đúng bằng mức tối đa (< restBelow giả định): không được ép nghỉ.
    const low = { ...real.economy!, restBelow: max + 10 }
    const c = { ...real, economy: low }
    const full = { ...s, resources: { ...s.resources, tinhLuc: max } }
    expect(updateResting(full, c).resting).toBe(false)
  })
})

describe('save v3', () => {
  it('round-trip giữ nguyên trạng thái kinh tế', () => {
    const s = runTicks(withAction(lifeOf('tieuPhu'), 'donCui'), real, 40).state
    const text = serializeSave(s, real, 5)
    expect(text.ok).toBe(true)
    if (!text.ok) return
    const loaded = parseSave(text.value, real)
    expect(loaded.ok && loaded.value.state).toEqual(s)
  })

  it('migrate v2 → v3: thêm nợ, cờ rìu và hạn nợ theo xuất thân', () => {
    const s = lifeOf('tieuPhu')
    const v2: Partial<GameState> = { ...s }
    delete v2.resting
    delete v2.hungry
    delete v2.hanNo
    const { no: _no, ...resources } = s.resources
    void _no
    const text = JSON.stringify({
      version: 2,
      savedAt: 0,
      state: { ...v2, resources, flags: {} },
    })
    const loaded = parseSave(text, real)
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(loaded.value.state).toEqual(s)
    expect(validateState(loaded.value.state, real)).toEqual([])
  })

  it('từ chối v2 đã có trường v3 và trạng thái v3 thiếu trường', () => {
    const s = lifeOf('tieuPhu')
    const bad = JSON.stringify({ version: 2, savedAt: 0, state: s })
    expect(parseSave(bad, real).ok).toBe(false)
    const missing: Partial<GameState> = { ...s }
    delete missing.hungry
    const v3 = JSON.stringify({ version: 3, savedAt: 0, state: missing })
    expect(parseSave(v3, real).ok).toBe(false)
    const badNo = JSON.stringify({
      version: 3,
      savedAt: 0,
      state: { ...s, hanNo: -1 },
    })
    expect(parseSave(badNo, real).ok).toBe(false)
  })
})
