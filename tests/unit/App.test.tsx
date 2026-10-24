import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../../src/App'

describe('development setup', () => {
  it('renders the setup heading', () => {
    expect(renderToStaticMarkup(<App />)).toContain(
      'Cultivation RPG – Development Setup',
    )
  })
})
