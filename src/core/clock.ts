// Clock mô phỏng: biến thời gian thực (ms, do UI inject) thành số tick.
// Engine không bao giờ đọc tốc độ; chỉ clock dùng nó (SYSTEMS S1, D14).

export const TICK_MS = 500 // 2 tick/giây ở 1× (D02)
export const MAX_AWAY_MS = 8 * 60 * 60 * 1000 // trần offline & Tích Thời (D06)
export const MAX_AWAY_TICKS = MAX_AWAY_MS / TICK_MS // 57 600

export type Speed = 1 | 2 | 3 | 5
export const SPEEDS: readonly Speed[] = [1, 2, 3, 5]

export interface ClockState {
  speed: Speed
  /** Mốc neo của tốc độ hiện tại; tick đến hạn tính từ tổng thời gian kể từ mốc để không trôi số thực. */
  anchorMs: number
  /** Thời gian game (ms ở 1×) đã trôi trước mốc neo mà chưa thành tick (đổi tốc độ giữa tick). */
  carryMs: number
  ticksSinceAnchor: number
  /** Thời điểm lớn nhất đã thấy. Thời gian lùi hoặc NaN = chưa có thời gian trôi qua. */
  lastMs: number
}

export function createClock(nowMs: number, speed: Speed = 1): ClockState {
  const t = Number.isFinite(nowMs) ? nowMs : 0
  return { speed, anchorMs: t, carryMs: 0, ticksSinceAnchor: 0, lastMs: t }
}

/** Thời điểm hợp lệ không lùi so với những gì clock đã thấy. */
const seen = (clock: ClockState, nowMs: number) =>
  Number.isFinite(nowMs) ? Math.max(nowMs, clock.lastMs) : clock.lastMs

/** Thời gian game (ms ở 1×) đã trôi kể từ mốc neo, gồm phần mang sang. */
const elapsedMs = (clock: ClockState, t: number) =>
  clock.carryMs + (t - clock.anchorMs) * clock.speed

/**
 * Số tick đến hạn tại `nowMs`, tối đa `maxTicks` (phần còn nợ được giữ cho lần sau).
 * `paused`: bỏ thời gian đã trôi để không bùng tick khi tiếp tục.
 */
export function advanceClock(
  clock: ClockState,
  nowMs: number,
  opts: { paused: boolean; maxTicks: number },
): { clock: ClockState; ticks: number } {
  const t = seen(clock, nowMs)
  if (opts.paused) return { clock: createClock(t, clock.speed), ticks: 0 }
  const due = Math.floor(elapsedMs(clock, t) / TICK_MS) - clock.ticksSinceAnchor
  const limit = Math.max(0, Math.floor(opts.maxTicks) || 0)
  const ticks = Math.max(0, Math.min(due, limit))
  return {
    clock: {
      ...clock,
      ticksSinceAnchor: clock.ticksSinceAnchor + ticks,
      lastMs: t,
    },
    ticks,
  }
}

/** Đổi tốc độ tại `nowMs`, giữ nguyên phần thời gian đã trôi chưa thành tick. */
export function setClockSpeed(
  clock: ClockState,
  nowMs: number,
  speed: Speed,
): ClockState {
  if (speed === clock.speed) return clock
  const t = seen(clock, nowMs)
  return {
    speed,
    anchorMs: t,
    carryMs: elapsedMs(clock, t) - clock.ticksSinceAnchor * TICK_MS,
    ticksSinceAnchor: 0,
    lastMs: t,
  }
}
