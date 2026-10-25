import type { ResourceDef, ResourceId, Result } from '../types/game'

/** Một giá trị tài nguyên hợp lệ: hữu hạn và nằm trong [min, max]. */
export function isValidAmount(
  value: unknown,
  def: ResourceDef,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= def.min &&
    value <= def.max
  )
}

/**
 * Áp các delta tài nguyên nguyên khối.
 * - Delta không hữu hạn hoặc tài nguyên lạ → từ chối.
 * - Kết quả dưới min → từ chối (không đủ trả), không đổi gì.
 * - Kết quả trên max → kẹp về max (chống tràn).
 */
export function applyResourceDeltas(
  resources: Readonly<Record<ResourceId, number>>,
  defs: Readonly<Record<ResourceId, ResourceDef>>,
  deltas: Readonly<Record<ResourceId, number>>,
): Result<Record<ResourceId, number>> {
  const next = { ...resources }
  for (const [id, delta] of Object.entries(deltas)) {
    const def = defs[id]
    if (!def) return { ok: false, error: `unknown resource "${id}"` }
    if (!Number.isFinite(delta))
      return { ok: false, error: `non-finite delta for "${id}"` }
    const value = (next[id] ?? def.initial) + delta
    if (!Number.isFinite(value))
      return { ok: false, error: `non-finite result for "${id}"` }
    if (value < def.min) return { ok: false, error: `insufficient ${id}` }
    next[id] = Math.min(value, def.max)
  }
  return { ok: true, value: next }
}
