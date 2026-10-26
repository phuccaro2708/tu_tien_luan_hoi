import type { RawContent } from '../types/game'

// Kinh tế phàm nhân P1b: BALANCE §3 (đã duyệt D23, A/F/G duyệt 2026-10-25 qua docs/technical/P1B_DESIGN.md).
// Chỉ hành động ở làng; trấn/rừng/Hắc Thạch Cốc thêm cùng địa điểm (S5, P2). Học chữ, Bổ củi đổi chữ cần Tô (S7, P3).
// Đốn củi cần rìu: cờ `coRiu` là stub của S10 (P5), do xuất thân tiều phu đặt.
export const economyData: Pick<RawContent, 'actions' | 'economy'> = {
  actions: [
    {
      id: 'lamThue',
      name: 'Làm thuê',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: 15 },
        { type: 'addResource', resource: 'tinhLuc', amount: -10 },
        { type: 'addSkillXp', skill: 'thePhach', amount: 1.5 },
      ],
      once: false,
    },
    {
      id: 'donCui',
      name: 'Đốn củi',
      requires: [{ type: 'flag', flag: 'coRiu', value: true }],
      effects: [
        {
          type: 'addResource',
          resource: 'van',
          amount: 20,
          scale: { skill: 'thePhach', perLevel: 0.005 },
        },
        { type: 'addResource', resource: 'tinhLuc', amount: -12 },
        { type: 'addSkillXp', skill: 'thePhach', amount: 2.5 },
      ],
      once: false,
    },
    {
      id: 'hocViecThuoc',
      name: 'Học việc hiệu thuốc',
      requires: [],
      effects: [
        { type: 'addResource', resource: 'van', amount: 5 },
        { type: 'addResource', resource: 'tinhLuc', amount: -6 },
        { type: 'addSkillXp', skill: 'thaoDuoc', amount: 3 },
      ],
      once: false,
    },
    {
      id: 'nghiNgoi',
      name: 'Nghỉ ngơi',
      requires: [],
      effects: [{ type: 'addResource', resource: 'tinhLuc', amount: 30 }],
      once: false,
    },
  ],
  economy: {
    moneyResource: 'van',
    debtResource: 'no',
    debtDueDays: 360,
    livingCost: 8,
    restAction: 'nghiNgoi',
    wageAction: 'lamThue',
    restBelow: 20,
    restUntil: 90,
    hungerMultiplier: 0.5,
    origins: {
      tieuPhu: { debt: 800, flags: ['coRiu'] },
      haiThuoc: { debt: 800, flags: [] },
      banHangRong: { debt: 600, flags: [] },
    },
  },
}
