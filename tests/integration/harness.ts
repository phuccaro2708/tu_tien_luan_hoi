// Harness headless: chạy engine thật với seed + nhật ký lệnh, không React.
import { advanceClock, createClock, type Speed } from '../../src/core/clock'
import { applyCommand, runTicks, step } from '../../src/core/engine'
import { createInitialState } from '../../src/core/state'
import type { Command, Content, GameState } from '../../src/types/game'

export interface ScriptEntry {
  day: number
  command: Command
}

function applyDue(
  state: GameState,
  content: Content,
  script: readonly ScriptEntry[],
): GameState {
  let s = state
  for (const e of script) {
    if (e.day !== s.day) continue
    const r = applyCommand(s, content, e.command)
    if (!r.ok) throw new Error(`day ${e.day}: ${r.error}`)
    s = r.value
  }
  return s
}

/** Chạy tới `totalDays` hoặc điểm dừng không có lệnh `resume` theo sau. */
export function runScript(
  content: Content,
  seed: number,
  script: readonly ScriptEntry[],
  totalDays: number,
  initial: GameState = createInitialState(content, seed),
): GameState {
  let s = initial
  while (s.day < totalDays) {
    s = applyDue(s, content, script)
    if (s.stop) break
    const nextCmd = Math.min(
      totalDays,
      ...script.filter((e) => e.day > s.day).map((e) => e.day),
    )
    s = runTicks(s, content, nextCmd - s.day).state
  }
  return s
}

/**
 * Giống store: mỗi frame, clock theo thời gian thực đẩy tick vào engine; lệnh của ngày hiện tại
 * được áp đúng một lần (kể cả `resume` khi đang dừng). Dừng khi tới `untilDay`.
 */
export function runRealtime(
  content: Content,
  seed: number,
  script: readonly ScriptEntry[],
  opts: {
    speed: Speed
    frameMs: number
    untilDay: number
    maxTicksPerFrame: number
  },
): GameState {
  let s = createInitialState(content, seed)
  let appliedDay = -1
  const due = () => {
    if (s.day === appliedDay) return
    appliedDay = s.day
    s = applyDue(s, content, script)
  }
  let now = 1_000
  let clock = createClock(now, opts.speed)
  for (let frame = 0; s.day < opts.untilDay; frame++) {
    if (frame > 1_000_000)
      throw new Error('realtime run did not reach untilDay')
    now += opts.frameMs
    due()
    const adv = advanceClock(clock, now, {
      paused: s.stop !== null,
      maxTicks: opts.maxTicksPerFrame,
    })
    clock = adv.clock
    for (let i = 0; i < adv.ticks && !s.stop && s.day < opts.untilDay; i++) {
      due()
      s = step(s, content)
    }
  }
  return s
}
