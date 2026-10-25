import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../../src/App'

describe('App shell', () => {
  it('renders age 14 on a new game, speed buttons, and no locked keywords', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('Tuổi 14')
    expect(html).toContain('5×')
    // Game mới chờ chọn danh tính (D32): có form, chưa có "Tạm dừng".
    expect(html).toContain('name="name"')
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
})
