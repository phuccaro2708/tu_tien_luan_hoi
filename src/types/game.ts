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
  | {
      type: 'addResource'
      resource: ResourceId
      amount: number
      /** Nhân `amount` với (1 + perLevel × cấp kỹ năng), VD Đốn củi +0,5%/Thể Phách (BALANCE §3, D41). */
      scale?: { skill: SkillId; perLevel: number }
    }
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

/**
 * Tinh lực tối đa (PROGRESSION §6, D35), không âm:
 * base + min(maxSkillBonus, cấp `skill` × perLevel) + thiên phú
 * − agingPerYear × số năm tuổi tròn vượt floor(agingFromPercent × ThọNguyên / 100).
 */
export interface StaminaRules {
  resource: ResourceId
  base: number
  skill: SkillId
  perLevel: number
  maxSkillBonus: number
  agingFromPercent: number
  agingPerYear: number
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
  /** Tinh lực tối đa cộng thêm; thiếu = 0. */
  stamina?: number
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

/**
 * Kinh tế phàm nhân (SYSTEMS S2, BALANCE §3, D23). Chưa có địa điểm (S5, P2) nên chỉ một mức sinh hoạt phí (làng).
 * Chưa có tự làm thuê khi hết tiền: hành động P1b nào cũng chạy được với 0 văn, nên chưa có ca cần nó.
 */
export interface EconomyRules {
  moneyResource: ResourceId
  debtResource: ResourceId
  /** Hạn trả nợ tính từ đầu kiếp; hậu quả quá hạn thuộc P2 (`hoi0_no`). */
  debtDueDays: number
  /** Sinh hoạt phí mỗi ngày, trừ sau khi cộng thu nhập. */
  livingCost: number
  /** Hành động tự chạy thay hành động đang chọn khi Tinh lực thấp. */
  restAction: ActionId
  /** Hành động dùng để kiểm tra Làm thuê ròng > 0 (validator). */
  wageAction: ActionId
  /** Vào nghỉ khi Tinh lực < restBelow, làm lại khi ≥ restUntil (hoặc mức tối đa nếu thấp hơn). */
  restBelow: number
  restUntil: number
  /** Đói: nhân XP và Tinh lực hồi của ngày đó. */
  hungerMultiplier: number
  /** Nợ và cờ khởi đầu theo xuất thân; thiếu = không có. */
  origins: Record<string, { debt: number; flags: FlagId[] }>
}

export interface RawContent {
  calendar: Calendar
  identity: IdentityRules
  resources: ResourceDef[]
  actions: ActionDef[]
  skillRules: SkillRules
  skills: SkillDef[]
  lifespan: LifespanRules
  stamina: StaminaRules
  elements: ElementDef[]
  linhCan: LinhCanDef[]
  ngoTinh: { min: number; max: number }
  origins: OriginDef[]
  traits: TraitDef[]
  economy?: EconomyRules
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
  readonly stamina: Readonly<StaminaRules>
  /** Mảng: thứ tự cố định cho phép tung RNG tất định. */
  readonly elements: readonly Readonly<ElementDef>[]
  readonly linhCan: Readonly<Record<string, Readonly<LinhCanDef>>>
  readonly ngoTinh: Readonly<{ min: number; max: number }>
  readonly origins: Readonly<Record<string, Readonly<OriginDef>>>
  readonly traits: Readonly<Record<string, Readonly<TraitDef>>>
  readonly economy: Readonly<EconomyRules> | null
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
  /** Đang nghỉ theo ngưỡng Tinh lực (có trễ nên không suy ra được từ Tinh lực). */
  resting: boolean
  /** Ngày vừa rồi không đủ trả sinh hoạt phí. */
  hungry: boolean
  /** Ngày hết hạn trả nợ; null = không có nợ. */
  hanNo: number | null
}

export type Command =
  | { type: 'setAction'; actionId: ActionId | null }
  | { type: 'resume' }
  | { type: 'setIdentity'; name: string; gender: string }
  /** Chuyển `amount` văn trả bớt nợ. */
  | { type: 'repayDebt'; amount: number }

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
