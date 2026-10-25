// Kiểu dùng chung cho engine. GameState phải JSON round-trip chính xác:
// chỉ dùng number/string/boolean/null, object thường và mảng; không undefined, Set, Map.

export type ResourceId = string
export type ActionId = string
export type FlagId = string

export type Condition =
  | { type: 'resourceAtLeast'; resource: ResourceId; amount: number }
  | { type: 'flag'; flag: FlagId; value: boolean }

export type Effect =
  | { type: 'addResource'; resource: ResourceId; amount: number }
  | { type: 'setFlag'; flag: FlagId; value: boolean }

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
  requires: Condition[]
  /** Áp dụng nguyên khối mỗi tick (thu nhập và chi phí trong cùng một delta). */
  effects: Effect[]
  /** Chỉ nhận một lần mỗi save; xong thì tự bỏ chọn. */
  once: boolean
}

export interface Calendar {
  daysPerYear: number
  startAgeYears: number
}

export interface RawContent {
  calendar: Calendar
  resources: ResourceDef[]
  actions: ActionDef[]
}

export interface Content {
  calendar: Calendar
  resources: Readonly<Record<ResourceId, ResourceDef>>
  actions: Readonly<Record<ActionId, ActionDef>>
}

export type StopReason = 'actionBlocked' | 'actionCompleted'

export interface StopPoint {
  reason: StopReason
  detail: string
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
}

export type Command =
  { type: 'setAction'; actionId: ActionId | null } | { type: 'resume' }

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
