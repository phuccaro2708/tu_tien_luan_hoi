import type { RawContent } from '../types/game'
import { createContent } from './registry'

// Nội dung P0: chỉ những giá trị đã duyệt ở v0.1 (D02: 360 ngày/năm; khởi đầu 14 tuổi;
// Tinh lực tối đa 100 – BALANCE §3). Hành động, xuất thân và tiền khởi đầu thuộc P1.
export const rawContent: RawContent = {
  calendar: { daysPerYear: 360, startAgeYears: 14 },
  resources: [
    { id: 'van', name: 'Văn', min: 0, max: 1e12, initial: 0 },
    { id: 'tinhLuc', name: 'Tinh lực', min: 0, max: 100, initial: 100 },
  ],
  actions: [],
}

export const content = createContent(rawContent)
