import type { RawContent } from '../types/game'
import { characterData } from './character'
import { economyData } from './economy'
import { createContent } from './registry'

// Chỉ những giá trị đã duyệt: D02 (360 ngày/năm, khởi đầu 14 tuổi), Tinh lực tối đa 100 (BALANCE §3),
// dữ liệu nhân vật (character.ts) và kinh tế phàm nhân (economy.ts).
export const rawContent: RawContent = {
  calendar: { daysPerYear: 360, startAgeYears: 14 },
  resources: [
    { id: 'van', name: 'Văn', min: 0, max: 1e12, initial: 0 },
    // max = trần tuyệt đối; mức tối đa thật thay đổi theo nhân vật (D35, systems/stamina.ts).
    { id: 'tinhLuc', name: 'Tinh lực', min: 0, max: 140, initial: 100 },
    { id: 'no', name: 'Nợ', min: 0, max: 1e12, initial: 0 },
  ],
  ...economyData,
  ...characterData,
}

export const content = createContent(rawContent)
