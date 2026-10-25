import js from '@eslint/js'
import tseslint from 'typescript-eslint'

const engineDirs = [
  'src/core/**',
  'src/systems/**',
  'src/data/**',
  'src/types/**',
]

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Engine độc lập UI và tất định (IMPLEMENTATION_PLAN §1).
    files: engineDirs,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom', 'react-dom/client', 'zustand'],
          patterns: [
            'react/*',
            'react-dom/*',
            'zustand/*',
            '**/stores/**',
            '**/components/**',
            '**/pages/**',
            '**/hooks/**',
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Dùng core/rng (seed trong GameState).',
        },
        {
          object: 'Date',
          property: 'now',
          message: 'Thời gian được inject từ ngoài engine.',
        },
        {
          object: 'performance',
          property: 'now',
          message: 'Thời gian được inject từ ngoài engine.',
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage'],
    },
  },
)
