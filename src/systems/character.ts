import { own } from '../core/record'
import { nextFloat } from '../core/rng'
import type { Character, Content, ResourceId, SkillId } from '../types/game'

/** Chọn theo trọng số với số ngẫu nhiên `u` ∈ [0, 1). Trọng số 0 không bao giờ được chọn. */
function pickWeighted<T>(
  u: number,
  items: readonly T[],
  weight: (item: T) => number,
): T {
  const candidates = items.filter((item) => weight(item) > 0)
  let r = u * candidates.reduce((sum, item) => sum + weight(item), 0)
  for (const item of candidates) {
    if (r < weight(item)) return item
    r -= weight(item)
  }
  return candidates[candidates.length - 1] // sai số làm tròn đẩy r ra cuối
}

/**
 * Tung kiếp 1 (PROGRESSION §3, D04). Thứ tự rút cố định: linh căn → các hệ → ngộ tính → xuất thân → thiên phú.
 * Đổi thứ tự này làm đổi kiếp 1 của mọi seed (test golden sẽ báo).
 */
export function rollLife1(
  content: Content,
  rng: number,
): { character: Character; rng: number } {
  let r = rng
  const draw = () => {
    const [u, next] = nextFloat(r)
    r = next
    return u
  }

  const linhCan = pickWeighted(
    draw(),
    Object.values(content.linhCan),
    (lc) => lc.weightLife1,
  )

  // [GIẢ ĐỊNH] Các hệ chọn đều theo tổ hợp (Fisher–Yates từng phần), lưu theo thứ tự trong dữ liệu.
  const order = content.elements.map((e) => e.id)
  const pool = [...order]
  for (let i = 0; i < linhCan.elements; i++) {
    const j = i + Math.floor(draw() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const elements = pool
    .slice(0, linhCan.elements)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))

  const { min, max } = content.ngoTinh
  const ngoTinh = min + draw() * (max - min)
  const origin = pickWeighted(draw(), Object.values(content.origins), () => 1)
  const trait = pickWeighted(draw(), Object.values(content.traits), () => 1)

  return {
    character: {
      linhCan: { id: linhCan.id, elements },
      ngoTinh,
      originId: origin.id,
      innateTrait: { id: trait.id, tier: 1 },
    },
    rng: r,
  }
}

/** Vốn khởi đầu của xuất thân: tài nguyên cộng thêm (kẹp ở max) và XP ứng với cấp kỹ năng khởi đầu. */
export function applyOrigin(
  content: Content,
  originId: string,
  resources: Readonly<Record<ResourceId, number>>,
): {
  resources: Record<ResourceId, number>
  skillXp: Record<SkillId, number>
} {
  const origin = content.origins[originId]
  let next = { ...resources }
  for (const [id, amount] of Object.entries(origin.resources)) {
    const def = content.resources[id]
    const value = Math.min(def.max, (own(next, id) ?? def.initial) + amount)
    next = { ...next, [id]: value }
  }
  const skillXp = Object.fromEntries(
    Object.keys(content.skills).map((id) => [
      id,
      content.xpTable[own(origin.skills, id) ?? 0],
    ]),
  )
  return { resources: next, skillXp }
}
