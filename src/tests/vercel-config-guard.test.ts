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

  it('engines.node: einfache Major-Angabe für Vercel (kein || – sonst warnt Vercel „will be ignored“)', () => {
    const pkgRaw = readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw) as { engines?: { node?: string } }
    const node = pkg.engines?.node ?? ''
    expect(node.includes('||'), 'Vercel unterstützt engines.node mit || nicht zuverlässig – Warnung „will be ignored“').toBe(
      false
    )
    expect(node, 'engines.node = 22.x (Dashboard + Vite 7 auf Vercel-22)').toBe('22.x')
  })

  it('installCommand: npm ci --omit=dev, beide SKIP-Env-Vars, niemals --include=dev', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as { installCommand?: string }
    const cmd = cfg.installCommand ?? ''
    expect(cmd.includes('npm ci'), 'installCommand muss npm ci nutzen').toBe(true)
    expect(cmd.includes('--omit=dev'), 'installCommand muss --omit=dev enthalten (keine devDependencies auf Vercel)').toBe(true)
    expect(
      !cmd.includes('--include=dev'),
      'Auf Vercel keine devDependencies erzwingen: typescript/vite liegen in dependencies; Electron/Playwright-Postinstall bricht auf Vercel-Linux oft ab'
    ).toBe(true)
    expect(cmd.includes('ELECTRON_SKIP_BINARY_DOWNLOAD=1'), 'ELECTRON_SKIP_BINARY_DOWNLOAD=1 muss gesetzt sein').toBe(true)
    expect(cmd.includes('PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1'), 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 muss gesetzt sein').toBe(true)
    expect(
      cmd.includes('NPM_CONFIG_omit=dev'),
      'NPM_CONFIG_omit=dev: selbst wenn Vercel npm ohne production-Modus startet, devDependencies weglassen'
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

