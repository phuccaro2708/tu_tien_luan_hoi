import type {
  Condition,
  Content,
  Effect,
  RawContent,
  SkillRules,
} from '../types/game'

const isNum = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n)

/** XP cộng dồn để đạt từng cấp. Làm tròn từng bước để kết quả không phụ thuộc sai số của Math.pow. */
export function buildXpTable(rules: SkillRules): number[] {
  const table = [0]
  for (let level = 0; level < rules.maxLevel; level++) {
    const step = Math.round(
      rules.xpBase * Math.max(1, level) ** rules.xpExponent,
    )
    table.push(table[level] + step)
  }
  return table
}

/** Kiểm tra dữ liệu nội dung; trả về danh sách lỗi (rỗng = hợp lệ). */
export function validateContent(raw: RawContent): string[] {
  const errors: string[] = []
  const { calendar } = raw
  if (!Number.isInteger(calendar.daysPerYear) || calendar.daysPerYear <= 0) {
    errors.push('calendar.daysPerYear must be a positive integer')
  }
  if (!isNum(calendar.startAgeYears) || calendar.startAgeYears < 0) {
    errors.push('calendar.startAgeYears must be >= 0')
  }

  /** Id khác rỗng và không trùng trong một danh sách. */
  const idsOf = (kind: string, items: readonly { id: string }[]) => {
    const ids = new Set<string>()
    for (const item of items) {
      if (!item.id) errors.push(`${kind} with empty id`)
      if (ids.has(item.id)) errors.push(`duplicate ${kind} "${item.id}"`)
      ids.add(item.id)
    }
    return ids
  }

  const { nameMaxLength, genders } = raw.identity
  if (!Number.isInteger(nameMaxLength) || nameMaxLength < 1)
    errors.push('identity.nameMaxLength must be a positive integer')
  idsOf('gender', genders)
  if (genders.length === 0) errors.push('need at least one gender')

  const resourceIds = idsOf('resource', raw.resources)
  for (const r of raw.resources) {
    if (![r.min, r.max, r.initial].every(isNum))
      errors.push(`resource "${r.id}": non-finite bounds`)
    else if (!(r.min <= r.initial && r.initial <= r.max)) {
      errors.push(`resource "${r.id}": need min <= initial <= max`)
    }
  }

  const { maxLevel, xpBase, xpExponent } = raw.skillRules
  if (!Number.isInteger(maxLevel) || maxLevel < 1)
    errors.push('skillRules.maxLevel must be a positive integer')
  else if (!isNum(xpBase) || !isNum(xpExponent) || xpExponent < 0)
    errors.push('skillRules: non-finite xp formula')
  else {
    const table = buildXpTable(raw.skillRules)
    if (!table.every((xp, l) => l === 0 || xp > table[l - 1]))
      errors.push('skillRules: every level must cost at least 1 XP')
  }
  const skillIds = idsOf('skill', raw.skills)
  const isLevel = (n: unknown) =>
    Number.isInteger(n) && (n as number) >= 0 && (n as number) <= maxLevel

  const checkRef = (where: string, item: Condition | Effect) => {
    switch (item.type) {
      case 'resourceAtLeast':
      case 'addResource':
        if (!resourceIds.has(item.resource))
          errors.push(`${where}: unknown resource "${item.resource}"`)
        if (!isNum(item.amount)) errors.push(`${where}: non-finite amount`)
        if (item.type === 'addResource' && item.scale) {
          if (!skillIds.has(item.scale.skill))
            errors.push(`${where}: unknown scale skill "${item.scale.skill}"`)
          if (!isNum(item.scale.perLevel) || item.scale.perLevel < 0)
            errors.push(`${where}: scale.perLevel must be finite and >= 0`)
        }
        break
      case 'flag':
      case 'setFlag':
        if (!item.flag) errors.push(`${where}: empty flag`)
        break
      case 'skillAtLeast':
        if (!skillIds.has(item.skill))
          errors.push(`${where}: unknown skill "${item.skill}"`)
        if (!isLevel(item.level)) errors.push(`${where}: bad level`)
        break
      case 'addSkillXp':
        if (!skillIds.has(item.skill))
          errors.push(`${where}: unknown skill "${item.skill}"`)
        if (!isNum(item.amount) || item.amount < 0)
          errors.push(`${where}: xp must be finite and >= 0`)
        break
    }
  }

  idsOf('action', raw.actions)
  for (const a of raw.actions) {
    a.requires.forEach((c) => checkRef(`action "${a.id}" requires`, c))
    a.effects.forEach((e) => checkRef(`action "${a.id}" effects`, e))
  }

  const ls = raw.lifespan
  if (!skillIds.has(ls.skill))
    errors.push(`lifespan: unknown skill "${ls.skill}"`)
  if (
    !isNum(ls.base) ||
    !Number.isInteger(ls.levelsPerYear) ||
    ls.levelsPerYear < 1 ||
    !isNum(ls.maxSkillYears) ||
    !ls.warnYears.every((y) => Number.isInteger(y) && y > 0)
  )
    errors.push('lifespan: bad rules')

  const elementIds = idsOf('element', raw.elements)
  idsOf('linhCan', raw.linhCan)
  for (const lc of raw.linhCan) {
    if (
      !Number.isInteger(lc.elements) ||
      lc.elements < 1 ||
      lc.elements > elementIds.size
    )
      errors.push(`linhCan "${lc.id}": bad element count`)
    if (!isNum(lc.weightLife1) || lc.weightLife1 < 0)
      errors.push(`linhCan "${lc.id}": bad weight`)
  }
  if (!(raw.linhCan.reduce((sum, lc) => sum + lc.weightLife1, 0) > 0))
    errors.push('linhCan: total life-1 weight must be > 0')

  const { min, max } = raw.ngoTinh
  if (!isNum(min) || !isNum(max) || min <= 0 || min > max)
    errors.push('ngoTinh: need 0 < min <= max')

  idsOf('origin', raw.origins)
  if (raw.origins.length === 0) errors.push('need at least one origin')
  for (const o of raw.origins) {
    for (const [id, amount] of Object.entries(o.resources))
      if (!resourceIds.has(id) || !isNum(amount) || amount < 0)
        errors.push(`origin "${o.id}": bad resource "${id}"`)
    for (const [id, level] of Object.entries(o.skills))
      if (!skillIds.has(id) || !isLevel(level))
        errors.push(`origin "${o.id}": bad skill "${id}"`)
  }

  idsOf('trait', raw.traits)
  if (raw.traits.length === 0) errors.push('need at least one trait')
  for (const t of raw.traits) {
    if (t.tiers.length === 0) errors.push(`trait "${t.id}": no tiers`)
    for (const tier of t.tiers) {
      if (!isNum(tier.lifespan))
        errors.push(`trait "${t.id}": non-finite lifespan`)
      if (tier.stamina !== undefined && !isNum(tier.stamina))
        errors.push(`trait "${t.id}": non-finite stamina`)
      for (const [id, mult] of Object.entries(tier.xp))
        if (!skillIds.has(id) || !isNum(mult) || mult <= 0)
          errors.push(`trait "${t.id}": bad xp multiplier "${id}"`)
    }
  }

  if (raw.economy) errors.push(...validateEconomy(raw, resourceIds))

  const st = raw.stamina
  const stRes = raw.resources.find((r) => r.id === st.resource)
  const topTrait = Math.max(
    0,
    ...raw.traits.flatMap((t) => t.tiers.map((tier) => tier.stamina ?? 0)),
  )
  if (!stRes) errors.push(`stamina: unknown resource "${st.resource}"`)
  if (!skillIds.has(st.skill))
    errors.push(`stamina: unknown skill "${st.skill}"`)
  if (
    ![st.base, st.perLevel, st.maxSkillBonus, st.agingPerYear].every(
      (n) => isNum(n) && n >= 0,
    ) ||
    !Number.isInteger(st.agingFromPercent) ||
    st.agingFromPercent < 0 ||
    st.agingFromPercent > 100
  )
    errors.push('stamina: bad rules')
  // Trần tuyệt đối của tài nguyên phải chứa được mức tối đa cao nhất có thể, nếu không save hợp lệ bị từ chối.
  else if (stRes && stRes.max < st.base + st.maxSkillBonus + topTrait)
    errors.push('stamina: resource max below the highest stamina max')
  return errors
}

/** Tổng các addResource dương/âm của một tài nguyên trong hành động, không tính `scale` (cấp 0). */
const sumResource = (
  actions: RawContent['actions'],
  id: string,
  resource: string,
) =>
  (actions.find((a) => a.id === id)?.effects ?? []).reduce(
    (sum, e) =>
      e.type === 'addResource' && e.resource === resource
        ? sum + e.amount
        : sum,
    0,
  )

/** Kiểm dữ liệu kinh tế (BALANCE §3), gồm ràng buộc D23: Làm thuê ròng > 0. */
function validateEconomy(
  raw: RawContent,
  resourceIds: ReadonlySet<string>,
): string[] {
  const eco = raw.economy
  if (!eco) return []
  const errors: string[] = []
  for (const [what, id] of [
    ['moneyResource', eco.moneyResource],
    ['debtResource', eco.debtResource],
  ] as const)
    if (!resourceIds.has(id)) errors.push(`economy.${what}: unknown "${id}"`)
  for (const [what, id] of [
    ['restAction', eco.restAction],
    ['wageAction', eco.wageAction],
  ] as const)
    if (!raw.actions.some((a) => a.id === id))
      errors.push(`economy.${what}: unknown action "${id}"`)
  // Nghỉ ngơi được ép chạy khi Tinh lực thấp: phải luôn chọn được, nếu không tick nào cũng bị chặn.
  const restDef = raw.actions.find((a) => a.id === eco.restAction)
  if (restDef && (restDef.requires.length > 0 || restDef.once))
    errors.push('economy.restAction: must have no requires and not be once')
  if (
    ![eco.debtDueDays, eco.livingCost, eco.restBelow, eco.restUntil].every(
      (n) => isNum(n) && n >= 0,
    ) ||
    !Number.isInteger(eco.debtDueDays) ||
    !(eco.restBelow < eco.restUntil) ||
    !isNum(eco.hungerMultiplier) ||
    !(eco.hungerMultiplier > 0 && eco.hungerMultiplier <= 1)
  )
    errors.push('economy: bad numbers')
  const originIds = new Set(raw.origins.map((o) => o.id))
  for (const id of originIds)
    if (!Object.hasOwn(eco.origins, id))
      errors.push(`economy.origins: missing origin "${id}"`)
  for (const [id, o] of Object.entries(eco.origins)) {
    if (!originIds.has(id)) errors.push(`economy.origins: unknown "${id}"`)
    if (!isNum(o.debt) || o.debt < 0)
      errors.push(`economy.origins "${id}": bad debt`)
    if (o.flags.some((f) => !f))
      errors.push(`economy.origins "${id}": empty flag`)
    const def = raw.resources.find((r) => r.id === eco.debtResource)
    if (def && o.debt > def.max)
      errors.push(`economy.origins "${id}": debt above resource max`)
  }
  // Ràng buộc D23: ở mọi khu dân cư, thu Làm thuê × tỉ lệ làm − sinh hoạt phí > 0.
  // Tỉ lệ làm = hồi/ngày ÷ (hồi/ngày + chi phí Tinh lực) (BALANCE §3). Hiện chỉ có làng.
  const rest = sumResource(raw.actions, eco.restAction, raw.stamina.resource)
  const cost = -sumResource(raw.actions, eco.wageAction, raw.stamina.resource)
  const wage = sumResource(raw.actions, eco.wageAction, eco.moneyResource)
  if (
    rest > 0 &&
    cost >= 0 &&
    (wage * rest) / (rest + cost) - eco.livingCost <= 0
  )
    errors.push('economy: wage action nets <= 0 per day')
  return errors
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

const byId = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]))

/**
 * Tải nội dung: chép sâu, validate, lập chỉ mục theo id rồi đóng băng toàn bộ.
 * Sửa `raw` sau đó không ảnh hưởng nội dung đã nạp. Ném lỗi nếu dữ liệu sai.
 */
export function createContent(raw: RawContent): Content {
  const copy = structuredClone(raw)
  const errors = validateContent(copy)
  if (errors.length > 0)
    throw new Error(`Invalid content:\n${errors.join('\n')}`)
  return deepFreeze({
    calendar: copy.calendar,
    identity: copy.identity,
    resources: byId(copy.resources),
    actions: byId(copy.actions),
    skillRules: copy.skillRules,
    skills: byId(copy.skills),
    xpTable: buildXpTable(copy.skillRules),
    lifespan: copy.lifespan,
    stamina: copy.stamina,
    elements: copy.elements,
    linhCan: byId(copy.linhCan),
    ngoTinh: copy.ngoTinh,
    origins: byId(copy.origins),
    traits: byId(copy.traits),
    economy: copy.economy ?? null,
  })
}
