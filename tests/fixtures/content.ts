import { applyCommand } from '../../src/core/engine'
import { createInitialState } from '../../src/core/state'
import { characterData } from '../../src/data/character'
import { createContent } from '../../src/data/registry'
import type { Content, GameState, RawContent } from '../../src/types/game'

// Nội dung giả chỉ dùng cho test; không phải số liệu gameplay.
// Kỹ năng, linh căn, xuất thân, thiên phú lấy từ dữ liệu thật. Thọ nguyên đặt rất dài để test
// không liên quan (offline 8 giờ = 160 năm game) không chạm cảnh báo/chết; test thọ nguyên dùng `lifeFixture`.
export const rawFixture: RawContent = {
  ...characterData,
  lifespan: { ...characterData.lifespan, base: 1_000 },
  calendar: { daysPerYear: 360, startAgeYears: 14 },
  resources: [
    { id: 'van', name: 'Văn', min: 0, max: 1_000_000, initial: 0 },
    { id: 'tinhLuc', name: 'Tinh lực', min: 0, max: 100, initial: 100 },
    { id: 'jar', name: 'Hũ', min: 0, max: 10, initial: 0 },
  ],
  actions: [
    {
      id: 'work',
      name: 'Làm',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: 10 },
        { type: 'addResource', resource: 'tinhLuc', amount: -10 },
      ],
      once: false,
    },
    {
      id: 'payFee',
      name: 'Thu trước phí sau',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: 15 },
        { type: 'addResource', resource: 'van', amount: -8 },
      ],
      once: false,
    },
    {
      id: 'spend',
      name: 'Tiêu',
      requires: [],
      effects: [{ type: 'addResource', resource: 'van', amount: -1 }],
      once: false,
    },
    {
      id: 'study',
      name: 'Học',
      requires: [
        { type: 'flag', flag: 'canStudy', value: true },
        { type: 'resourceAtLeast', resource: 'van', amount: 5 },
      ],
      effects: [{ type: 'addResource', resource: 'van', amount: -5 }],
      once: false,
    },
    {
      id: 'treasure',
      name: 'Kho báu',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: 100 },
        { type: 'setFlag', flag: 'found', value: true },
      ],
      once: true,
    },
    {
      id: 'fill',
      name: 'Đổ đầy',
      requires: [],
      effects: [{ type: 'addResource', resource: 'jar', amount: 7 }],
      once: false,
    },
    { id: 'idle', name: 'Ngồi', requires: [], effects: [], once: false },
    {
      id: 'train',
      name: 'Rèn thân',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: -1 },
        { type: 'addSkillXp', skill: 'thePhach', amount: 50 },
      ],
      once: false,
    },
    {
      id: 'haul',
      name: 'Khuân vác',
      requires: [{ type: 'skillAtLeast', skill: 'thePhach', level: 5 }],
      effects: [],
      once: false,
    },
  ],
}

export const fixture = createContent(rawFixture)

/** Như fixture nhưng thọ nguyên theo dữ liệu thật (PROGRESSION §6). */
export const lifeFixture = createContent({
  ...rawFixture,
  lifespan: characterData.lifespan,
})

/** Chọn danh tính mặc định cho state đang chờ `chooseIdentity` (D32). */
export function named(content: Content, state: GameState): GameState {
  const r = applyCommand(state, content, {
    type: 'setIdentity',
    name: 'Thử',
    gender: 'nam',
  })
  if (!r.ok) throw new Error(r.error)
  return r.value
}

/** Game mới đã chọn danh tính: thời gian chạy được ngay. */
export const startGame = (content: Content, seed: number): GameState =>
  named(content, createInitialState(content, seed))
