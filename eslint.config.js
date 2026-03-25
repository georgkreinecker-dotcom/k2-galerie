import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/** Nur echte Quell-Dateien – nicht Figma-HTML mit .tsx-Endung (Root components/, App.tsx, …). Sonst schlägt CI bei `npm run lint` mit tausenden Parsing-Fehlern fehl. */
const lintTsFiles = [
  'src/**/*.{ts,tsx}',
  'components/ScreenshotExportAdmin.tsx',
  'components/ScreenshotExportK2.tsx',
  'components/ScreenshotExportSaaS.tsx',
  'components/SafeMode.tsx',
  'components/tabs/**/*.{ts,tsx}',
  'middleware.ts',
  'vite.config.ts',
  'vitest.config.ts',
  'supabase/functions/familie/**/*.ts',
  'supabase/functions/artworks/**/*.ts',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: lintTsFiles,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
