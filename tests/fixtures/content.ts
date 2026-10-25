import { createContent } from '../../src/data/registry'
import type { RawContent } from '../../src/types/game'

// Nội dung giả chỉ dùng cho test; không phải số liệu gameplay.
export const rawFixture: RawContent = {
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
  ],
}

export const fixture = createContent(rawFixture)
