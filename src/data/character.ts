import type { RawContent } from '../types/game'

// Dữ liệu nhân vật đã duyệt: D04 + PROGRESSION §3 (kiếp 1), §5 (kỹ năng), §6 (thọ nguyên); D32 (danh tính).
// Tách khỏi content.ts để fixture test dùng chung mà không import module content (store test mock nó).
export const characterData: Pick<
  RawContent,
  | 'identity'
  | 'skillRules'
  | 'skills'
  | 'lifespan'
  | 'elements'
  | 'linhCan'
  | 'ngoTinh'
  | 'origins'
  | 'traits'
> = {
  identity: {
    nameMaxLength: 16,
    genders: [
      { id: 'nam', name: 'Nam' },
      { id: 'nu', name: 'Nữ' },
    ],
  },
  skillRules: { maxLevel: 50, xpBase: 10, xpExponent: 1.6 },
  skills: [
    { id: 'thePhach', name: 'Thể Phách', ngo: false },
    { id: 'vanTu', name: 'Văn Tự', ngo: true },
    { id: 'thaoDuoc', name: 'Thảo Dược', ngo: true },
    { id: 'quyenCuoc', name: 'Quyền Cước', ngo: false },
    { id: 'giaoTe', name: 'Giao Tế', ngo: false },
    // Ẩn với người chơi tới khi cảm ứng linh khí (S3, S4).
    { id: 'thoNap', name: 'Thổ Nạp', ngo: true },
  ],
  lifespan: {
    base: 60,
    skill: 'thePhach',
    levelsPerYear: 5,
    maxSkillYears: 6,
    warnYears: [10, 5, 1],
  },

  elements: [
    { id: 'kim', name: 'Kim' },
    { id: 'moc', name: 'Mộc' },
    { id: 'thuy', name: 'Thủy' },
    { id: 'hoa', name: 'Hỏa' },
    { id: 'tho', name: 'Thổ' },
  ],
  // Kiếp 1 không bao giờ ra Song/Thiên linh căn (D04); hai loại đó thêm cùng luân hồi (P6).
  linhCan: [
    { id: 'ngu', name: 'Ngũ linh căn', elements: 5, weightLife1: 35 },
    { id: 'tu', name: 'Tứ linh căn', elements: 4, weightLife1: 50 },
    { id: 'tam', name: 'Tam linh căn', elements: 3, weightLife1: 15 },
  ],
  ngoTinh: { min: 0.85, max: 1.15 },
  // Xuất thân kiếp 1. Còn thiếu: rìu/giỏ thuốc (S10) và nợ Hồ chưởng quỹ (kinh tế P1, chờ D23).
  origins: [
    {
      id: 'tieuPhu',
      name: 'Nhà tiều phu',
      resources: {},
      skills: { thePhach: 2 },
    },
    {
      id: 'haiThuoc',
      name: 'Nhà hái thuốc',
      resources: {},
      skills: { thaoDuoc: 3 },
    },
    {
      id: 'banHangRong',
      name: 'Nhà bán hàng rong',
      resources: { van: 100 },
      skills: { giaoTe: 3 },
    },
  ],
  // Chỉ bậc I (kiếp 1). Bậc II/III thêm cùng nâng bậc ở Vong Xuyên (P6).
  // Chưa áp: Tinh lực tối đa của Cường tráng (cần Tinh lực tối đa động), thiện cảm của Chất phác (S7).
  traits: [
    {
      id: 'thietCot',
      name: 'Thiết cốt',
      tiers: [{ xp: { thePhach: 1.2 }, lifespan: 0 }],
    },
    {
      id: 'kheoMieng',
      name: 'Khéo miệng',
      tiers: [{ xp: { giaoTe: 1.2, thePhach: 0.9 }, lifespan: 0 }],
    },
    {
      id: 'nhanhNhen',
      name: 'Nhanh nhẹn',
      tiers: [{ xp: { quyenCuoc: 1.2 }, lifespan: 0 }],
    },
    {
      id: 'chatPhac',
      name: 'Chất phác',
      tiers: [{ xp: { giaoTe: 0.9 }, lifespan: 0 }],
    },
    {
      id: 'theNhuoc',
      name: 'Thể nhược',
      tiers: [{ xp: { vanTu: 1.2 }, lifespan: -4 }],
    },
    { id: 'cuongTrang', name: 'Cường tráng', tiers: [{ xp: {}, lifespan: 3 }] },
  ],
}
