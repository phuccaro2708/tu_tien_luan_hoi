import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { applyCommand } from '../../src/core/engine'
import { createInitialState } from '../../src/core/state'
import { content } from '../../src/data/content'
import type { GameState } from '../../src/types/game'
import { writeSave, type SaveStorage } from '../../src/utils/save'

function memory(): SaveStorage {
  const data = new Map<string, string>()
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

/**
 * Nạp lại App với `navigator`/`localStorage` giả. Render phía server đọc state lúc tạo store,
 * nên trạng thái cần test phải đến từ lúc boot.
 */
async function render(nav: object, storage: SaveStorage = memory()) {
  vi.resetModules()
  vi.stubGlobal('navigator', nav)
  vi.stubGlobal('localStorage', storage)
  const { default: App } = await import('../../src/App')
  return renderToStaticMarkup(<App />)
}

afterEach(() => vi.unstubAllGlobals())

describe('App shell', () => {
  it('renders age 14 on a new game, speed buttons, and no locked keywords', async () => {
    // Không có Web Locks → boot ngay (chỉ đọc).
    const html = await render({})
    expect(html).toContain('Tuổi 14')
    expect(html).toContain('5×')
    // Game mới chờ chọn danh tính (D32): có form, chưa có "Tạm dừng".
    expect(html).toContain('name="name"')
    // Độ dài tên do engine kiểm (đếm code point sau NFC), không để trình duyệt cắt.
    expect(html).not.toContain('maxlength')
    expect(html).toContain('Nữ')
    expect(html).not.toContain('Tạm dừng')
    for (const word of [
      'linh khí',
      'linh căn',
      'tu vi',
      'Luyện Khí',
      'linh thạch',
    ]) {
      expect(html.toLowerCase()).not.toContain(word.toLowerCase())
    }
  })

  it('hides the identity form until the save lock is granted', async () => {
    const waiting = { locks: { request: () => new Promise(() => {}) } }
    const html = await render(waiting)
    expect(html).not.toContain('name="name"')
    expect(html).toContain('Đang mở save')
  })

  it('shows the years left on a lifespan warning', async () => {
    const named = applyCommand(createInitialState(content, 1), content, {
      type: 'setIdentity',
      name: 'Thử',
      gender: 'nam',
    })
    if (!named.ok) throw new Error(named.error)
    const warned: GameState = {
      ...named.value,
      stop: { reason: 'lifespanWarning', detail: '5' },
    }
    const storage = memory()
    writeSave(storage, warned, content, Date.now())
    const html = await render({}, storage)
    expect(html).toContain('Còn 5 năm thọ nguyên.')
    expect(html).not.toContain('lifespanWarning')
  })

  // QA UX-P1b-01..03: hiện Tinh lực, giải thích nút bị khóa, chọn mức trả nợ.
  it('shows stamina, explains disabled actions and offers debt presets', async () => {
    let s = createInitialState(content, 1)
    // Chọn kiếp không có rìu để nút Đốn củi bị khóa.
    for (let seed = 1; s.character.originId === 'tieuPhu'; seed++)
      s = createInitialState(content, seed)
    const named = applyCommand(s, content, {
      type: 'setIdentity',
      name: 'Thử',
      gender: 'nam',
    })
    if (!named.ok) throw new Error(named.error)
    const storage = memory()
    writeSave(storage, named.value, content, Date.now())
    const html = await render({}, storage)
    expect(html).toMatch(/Tinh lực \d+\/\d+/)
    expect(html).toContain('Chưa chọn được: requires')
    expect(html).toContain('Trả hết')
    expect(html).toContain('Trả, giữ 40 văn')
    expect(html).toContain('Trả 50%')
    // Tay trắng (0 văn): mọi mức trả đều khóa và nói lý do.
    expect(html).toContain('Chưa đủ văn để trả mức này')
  })
})
