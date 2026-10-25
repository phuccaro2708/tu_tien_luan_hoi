// mulberry32: PRNG 32-bit có seed. State là một uint32 nằm trong GameState.

export function seedRng(seed: number): number {
  return seed >>> 0
}

/** Trả về [số trong [0, 1), state mới]. Hàm thuần. */
export function nextFloat(rng: number): [number, number] {
  const next = (rng + 0x6d2b79f5) >>> 0
  let t = next
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next]
}
