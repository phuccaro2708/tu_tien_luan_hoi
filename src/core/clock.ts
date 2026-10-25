// Clock mô phỏng: biến thời gian thực (ms, do UI inject) thành số tick.
// Engine không bao giờ đọc tốc độ; chỉ clock dùng nó (SYSTEMS S1, D14).

export const TICK_MS = 500 // 2 tick/giây ở 1× (D02)
export const MAX_AWAY_MS = 8 * 60 * 60 * 1000 // trần offline & Tích Thời (D06)
export const MAX_AWAY_TICKS = MAX_AWAY_MS / TICK_MS // 57 600

export type Speed = 1 | 2 | 3 | 5
export const SPEEDS: readonly Speed[] = [1, 2, 3, 5]

export interface ClockState {
  speed: Speed
  /** Mốc thời gian thực; số tick tính từ tổng thời gian kể từ mốc để không trôi số thực. */
  anchorMs: number
  ticksSinceAnchor: number
}

export interface ClockAdvance {
  clock: ClockState
  ticks: number
  /** Thời gian bị cắt vì vượt `maxBacklogTicks` (VD tab bị ẩn lâu); UI đưa vào đường offline. */
  droppedMs: number
}

/** Cũng dùng khi đổi tốc độ: neo lại tại `nowMs`, phần lẻ chưa đủ một tick bị bỏ. */
export function createClock(nowMs: number, speed: Speed = 1): ClockState {
  return { speed, anchorMs: nowMs, ticksSinceAnchor: 0 }
}

/**
 * Số tick đến hạn tại `nowMs`, tối đa `maxTicksPerFrame` (phần dư dồn sang khung sau).
 * Nếu tồn đọng vượt `maxBacklogTicks`, clock neo lại và trả phần thời gian bị cắt.
 * `paused`: bỏ tồn đọng để không bùng tick khi tiếp tục.
 */
export function advanceClock(
  clock: ClockState,
  nowMs: number,
  opts: { paused: boolean; maxTicksPerFrame: number; maxBacklogTicks: number },
): ClockAdvance {
  if (opts.paused || !Number.isFinite(nowMs) || nowMs < clock.anchorMs) {
    return { clock: createClock(nowMs, clock.speed), ticks: 0, droppedMs: 0 }
  }
  const due =
    Math.floor(((nowMs - clock.anchorMs) * clock.speed) / TICK_MS) -
    clock.ticksSinceAnchor
  if (due > opts.maxBacklogTicks) {
    // Trả thời gian thực bị cắt; đường offline tính nó theo nhịp 1× (BALANCE §7).
    return {
      clock: createClock(nowMs, clock.speed),
      ticks: 0,
      droppedMs: (due * TICK_MS) / clock.speed,
    }
  }
  const ticks = Math.min(due, opts.maxTicksPerFrame)
  return {
    clock: { ...clock, ticksSinceAnchor: clock.ticksSinceAnchor + ticks },
    ticks,
    droppedMs: 0,
  }
}
