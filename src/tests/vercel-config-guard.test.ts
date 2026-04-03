import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Vercel-Konfigurations-Schranken', () => {
  it('vercel.json ist valides JSON', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it('Build auf Vercel: typescript, vite und @vitejs/plugin-react liegen in dependencies (NODE_ENV=production installiert sonst keine devDependencies)', () => {
    const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string> }
    const dep = pkg.dependencies ?? {}
    for (const name of ['typescript', 'vite', '@vitejs/plugin-react'] as const) {
      expect(dep[name], `${name} muss in dependencies stehen, damit Vercel-Build ohne devDependencies zuverlässig ist`).toBeDefined()
    }
  })

  it('installCommand: weiterhin devDependencies einplanen (Tests/Lint lokal; npm ci --include=dev)', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as { installCommand?: string }
    const cmd = cfg.installCommand ?? ''
    expect(
      cmd.includes('--include=dev') || cmd.includes('NODE_ENV=development'),
      'installCommand soll devDependencies nicht weglassen (zusätzliche Absicherung neben dependencies-Buildtools)'
    ).toBe(true)
  })

  it('functions.*.includeFiles bleibt ein String (Schema-Schranke)', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as { functions?: Record<string, { includeFiles?: unknown }> }
    const functions = cfg.functions ?? {}
    for (const [fnName, fnCfg] of Object.entries(functions)) {
      if (fnCfg.includeFiles !== undefined) {
        expect(
          typeof fnCfg.includeFiles,
          `functions.${fnName}.includeFiles muss string sein`
        ).toBe('string')
      }
    }
  })
})

