// Kiểu dùng chung cho engine. GameState phải JSON round-trip chính xác:
// chỉ dùng number/string/boolean/null, object thường và mảng; không undefined, Set, Map.

export type ResourceId = string
export type ActionId = string
export type FlagId = string
export type SkillId = string

export type Condition =
  | { type: 'resourceAtLeast'; resource: ResourceId; amount: number }
  | { type: 'flag'; flag: FlagId; value: boolean }
  | { type: 'skillAtLeast'; skill: SkillId; level: number }

export type Effect =
  | { type: 'addResource'; resource: ResourceId; amount: number }
  | { type: 'setFlag'; flag: FlagId; value: boolean }
  /** XP gốc; nhân hệ số của nhân vật (PROGRESSION §5). */
  | { type: 'addSkillXp'; skill: SkillId; amount: number }

export interface ResourceDef {
  id: ResourceId
  name: string
  min: number
  max: number
  initial: number
}

export interface ActionDef {
  id: ActionId
  name: string
  /** Kiểm tra khi chọn và mỗi tick. */
  requires: readonly Readonly<Condition>[]
  /** Áp dụng nguyên khối mỗi tick (thu nhập và chi phí trong cùng một delta). */
  effects: readonly Readonly<Effect>[]
  /** Chỉ nhận một lần mỗi save; xong thì tự bỏ chọn. */
  once: boolean
}

export interface Calendar {
  daysPerYear: number
  startAgeYears: number
}

export interface SkillDef {
  id: SkillId
  name: string
  /** Nhân Ngộ tính (kỹ năng trí, trừ Giao Tế). */
  ngo: boolean
}

/** XP(L → L+1) = xpBase × max(1, L)^xpExponent, làm tròn; cấp 0..maxLevel. */
export interface SkillRules {
  maxLevel: number
  xpBase: number
  xpExponent: number
}

/** ThọNguyên = base + min(maxSkillYears, floor(cấp `skill` / levelsPerYear)) + thiên phú (PROGRESSION §6). */
export interface LifespanRules {
  base: number
  skill: SkillId
  levelsPerYear: number
  maxSkillYears: number
  /** Tạm dừng khi số năm còn lại chạm các mốc này (CORE_LOOP §3). */
  warnYears: number[]
}

export interface ElementDef {
  id: string
  name: string
}

export interface LinhCanDef {
  id: string
  name: string
  /** Số hệ; các hệ cụ thể chọn đều trong `elements`. */
  elements: number
  /** Trọng số khi tung kiếp 1 (D04). */
  weightLife1: number
}

export interface OriginDef {
  id: string
  name: string
  /** Cộng vào tài nguyên khởi đầu. */
  resources: Record<ResourceId, number>
  /** Cấp kỹ năng khởi đầu. */
  skills: Record<SkillId, number>
}

export interface TraitTier {
  /** Hệ số XP theo kỹ năng; thiếu = 1. */
  xp: Record<SkillId, number>
  /** Năm thọ nguyên cộng thêm (âm = trừ). */
  lifespan: number
}

export interface TraitDef {
  id: string
  name: string
  /** tiers[0] = bậc I. */
  tiers: TraitTier[]
}

/** Danh tính do người chơi chọn (D05, D32). */
export interface IdentityRules {
  /** Số ký tự tối đa của tên, sau khi cắt khoảng trắng hai đầu. */
  nameMaxLength: number
  genders: { id: string; name: string }[]
}

export interface RawContent {
  calendar: Calendar
  identity: IdentityRules
  resources: ResourceDef[]
  actions: ActionDef[]
  skillRules: SkillRules
  skills: SkillDef[]
  lifespan: LifespanRules
  elements: ElementDef[]
  linhCan: LinhCanDef[]
  ngoTinh: { min: number; max: number }
  origins: OriginDef[]
  traits: TraitDef[]
}

/** Nội dung đã nạp: bất biến sâu (createContent đóng băng mọi cấp). */
export interface Content {
  readonly calendar: Readonly<Calendar>
  readonly identity: Readonly<IdentityRules>
  readonly resources: Readonly<Record<ResourceId, Readonly<ResourceDef>>>
  readonly actions: Readonly<Record<ActionId, Readonly<ActionDef>>>
  readonly skillRules: Readonly<SkillRules>
  readonly skills: Readonly<Record<SkillId, Readonly<SkillDef>>>
  /** xpTable[L] = XP cộng dồn để đạt cấp L; xpTable[0] = 0. */
  readonly xpTable: readonly number[]
  readonly lifespan: Readonly<LifespanRules>
  /** Mảng: thứ tự cố định cho phép tung RNG tất định. */
  readonly elements: readonly Readonly<ElementDef>[]
  readonly linhCan: Readonly<Record<string, Readonly<LinhCanDef>>>
  readonly ngoTinh: Readonly<{ min: number; max: number }>
  readonly origins: Readonly<Record<string, Readonly<OriginDef>>>
  readonly traits: Readonly<Record<string, Readonly<TraitDef>>>
}

export type StopReason =
  | 'actionBlocked'
  | 'actionCompleted'
  /** detail = số năm thọ nguyên còn lại. */
  | 'lifespanWarning'
  /** Hết kiếp: engine không chạy tiếp, mọi lệnh bị từ chối (Vong Xuyên thuộc P4). */
  | 'death'
  /** Kiếp mới chưa có tên/giới tính: thời gian chưa chạy, chỉ nhận lệnh `setIdentity` (D32). */
  | 'chooseIdentity'

export interface StopPoint {
  reason: StopReason
  detail: string
}

/** Thuộc tính của kiếp, tung theo seed (PROGRESSION §3, D04). Linh căn và ngộ tính là thông tin ẩn với người chơi. */
export interface Identity {
  name: string
  gender: string
}

export interface Character {
  /** null ⇔ stop là `chooseIdentity`. */
  identity: Identity | null
  linhCan: { id: string; elements: string[] }
  ngoTinh: number
  originId: string
  innateTrait: { id: string; tier: number }
}

export interface GameState {
  seed: number
  /** Trạng thái PRNG (uint32); chỉ đổi qua core/rng. */
  rng: number
  /** Số tick đã chạy; 1 tick = 1 ngày. */
  day: number
  resources: Record<ResourceId, number>
  flags: Record<FlagId, boolean>
  /** Phần thưởng một lần đã nhận, khóa = id hành động. */
  claimed: Record<ActionId, true>
  currentActionId: ActionId | null
  /** Khác null = engine tạm dừng, chờ lệnh `resume`. */
  stop: StopPoint | null
  /** Tích Thời tính bằng tick, trần 8 giờ thực ở 1×. */
  tichThoiTicks: number
  character: Character
  /** XP cộng dồn của mỗi kỹ năng; cấp suy ra từ Content.xpTable. */
  skillXp: Record<SkillId, number>
}

export type Command =
  | { type: 'setAction'; actionId: ActionId | null }
  | { type: 'resume' }
  | { type: 'setIdentity'; name: string; gender: string }

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
