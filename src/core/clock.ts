// Clock mô phỏng: biến thời gian thực (ms, do UI inject) thành số tick.
// Engine không bao giờ đọc tốc độ; chỉ clock dùng nó (SYSTEMS S1, D14).

export const TICK_MS = 500 // 2 tick/giây ở 1× (D02)
export const MAX_AWAY_MS = 8 * 60 * 60 * 1000 // trần offline & Tích Thời (D06)
export const MAX_AWAY_TICKS = MAX_AWAY_MS / TICK_MS // 57 600

export type Speed = 1 | 2 | 3 | 5
export const SPEEDS: readonly Speed[] = [1, 2, 3, 5]

export interface ClockState {
  speed: Speed
  /** Mốc neo; tick đến hạn tính từ tổng thời gian kể từ mốc để không trôi số thực. */
  anchorMs: number
  ticksSinceAnchor: number
  /** Thời điểm lớn nhất đã thấy. Thời gian lùi hoặc NaN = chưa có thời gian trôi qua. */
  lastMs: number
}

export function createClock(nowMs: number, speed: Speed = 1): ClockState {
  const t = Number.isFinite(nowMs) ? nowMs : 0
  return { speed, anchorMs: t, ticksSinceAnchor: 0, lastMs: t }
}

/** Thời điểm hợp lệ không lùi so với những gì clock đã thấy. */
const seen = (clock: ClockState, nowMs: number) =>
  Number.isFinite(nowMs) ? Math.max(nowMs, clock.lastMs) : clock.lastMs

/** Thời gian game (ms ở 1×) đã trôi nhưng chưa phát thành tick, gồm cả phần lẻ. */
const remainderMs = (clock: ClockState, t: number) =>
  (t - clock.anchorMs) * clock.speed - clock.ticksSinceAnchor * TICK_MS

/**
 * Số tick đến hạn tại `nowMs`, tối đa `maxTicks` (phần còn nợ được giữ cho lần sau).
 * Nợ quá 8 giờ thực (VD máy ngủ khi tab vẫn hiện) bị cắt, cùng trần với offline.
 * `paused`: bỏ thời gian đã trôi để không bùng tick khi tiếp tục.
 */
export function advanceClock(
  clock: ClockState,
  nowMs: number,
  opts: { paused: boolean; maxTicks: number },
): { clock: ClockState; ticks: number } {
  const t = seen(clock, nowMs)
  if (opts.paused) return { clock: createClock(t, clock.speed), ticks: 0 }
  const capMs = MAX_AWAY_MS * clock.speed
  const anchored =
    remainderMs(clock, t) > capMs
      ? { ...clock, anchorMs: t - MAX_AWAY_MS, ticksSinceAnchor: 0 }
      : clock
  const due =
    Math.floor(((t - anchored.anchorMs) * anchored.speed) / TICK_MS) -
    anchored.ticksSinceAnchor
  const limit = Math.max(0, Math.floor(opts.maxTicks) || 0)
  const ticks = Math.max(0, Math.min(due, limit))
  return {
    clock: {
      ...anchored,
      ticksSinceAnchor: anchored.ticksSinceAnchor + ticks,
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
    anchorMs: t - remainderMs(clock, t) / speed,
    ticksSinceAnchor: 0,
    lastMs: t,
  }
}
