import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'src/data/**',
    'api/_disabled/**',
  ]),
  {
    files: [
      'api/**/*.js',
      'scripts/**/*.js',
      'tests/**/*.js',
      'e2e/**/*.js',
      '*.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: {
      'no-redeclare': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['api/**', 'scripts/**', 'tests/**', 'e2e/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': 'off',
      // Legacy patterns across the app; tighten incrementally per file.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/refs': 'off',
    },
  },
])
