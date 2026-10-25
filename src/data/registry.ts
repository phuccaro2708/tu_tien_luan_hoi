import type { Condition, Content, Effect, RawContent } from '../types/game'

const isNum = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n)

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

  const resourceIds = new Set<string>()
  for (const r of raw.resources) {
    if (!r.id) errors.push('resource with empty id')
    if (resourceIds.has(r.id)) errors.push(`duplicate resource "${r.id}"`)
    resourceIds.add(r.id)
    if (![r.min, r.max, r.initial].every(isNum))
      errors.push(`resource "${r.id}": non-finite bounds`)
    else if (!(r.min <= r.initial && r.initial <= r.max)) {
      errors.push(`resource "${r.id}": need min <= initial <= max`)
    }
  }

  const checkRef = (where: string, item: Condition | Effect) => {
    if (item.type === 'resourceAtLeast' || item.type === 'addResource') {
      if (!resourceIds.has(item.resource))
        errors.push(`${where}: unknown resource "${item.resource}"`)
      if (!isNum(item.amount)) errors.push(`${where}: non-finite amount`)
    } else if (!item.flag) errors.push(`${where}: empty flag`)
  }

  const actionIds = new Set<string>()
  for (const a of raw.actions) {
    if (!a.id) errors.push('action with empty id')
    if (actionIds.has(a.id)) errors.push(`duplicate action "${a.id}"`)
    actionIds.add(a.id)
    a.requires.forEach((c) => checkRef(`action "${a.id}" requires`, c))
    a.effects.forEach((e) => checkRef(`action "${a.id}" effects`, e))
  }
  return errors
}

/** Tải nội dung: validate rồi lập chỉ mục theo id. Ném lỗi nếu dữ liệu sai. */
export function createContent(raw: RawContent): Content {
  const errors = validateContent(raw)
  if (errors.length > 0)
    throw new Error(`Invalid content:\n${errors.join('\n')}`)
  return Object.freeze({
    calendar: Object.freeze({ ...raw.calendar }),
    resources: Object.freeze(
      Object.fromEntries(raw.resources.map((r) => [r.id, r])),
    ),
    actions: Object.freeze(
      Object.fromEntries(raw.actions.map((a) => [a.id, a])),
    ),
  })
}
