import type { RawContent } from '../types/game'
import { characterData } from './character'
import { createContent } from './registry'

// Chỉ những giá trị đã duyệt ở v0.1: D02 (360 ngày/năm, khởi đầu 14 tuổi), Tinh lực tối đa 100 (BALANCE §3),
// dữ liệu nhân vật (character.ts). Hành động thuộc P1 phần kinh tế (chờ D23).
export const rawContent: RawContent = {
  calendar: { daysPerYear: 360, startAgeYears: 14 },
  resources: [
    { id: 'van', name: 'Văn', min: 0, max: 1e12, initial: 0 },
    { id: 'tinhLuc', name: 'Tinh lực', min: 0, max: 100, initial: 100 },
  ],
  actions: [],
  ...characterData,
}

export const content = createContent(rawContent)
