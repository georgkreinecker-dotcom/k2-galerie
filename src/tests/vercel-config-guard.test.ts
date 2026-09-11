import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

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

  it('package-lock.json: npm ci --omit=dev --dry-run muss grün sein (sonst Vercel Install Failed)', () => {
    // Ursache 11.09.26: Lockfile unvollständig → „Missing: … from lock file“ → alle Deployments rot.
    const r = spawnSync(
      'npm',
      ['ci', '--omit=dev', '--dry-run'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
          ELECTRON_SKIP_BINARY_DOWNLOAD: '1',
        },
      }
    )
    const out = `${r.stdout || ''}\n${r.stderr || ''}`
    expect(r.status, `npm ci --omit=dev --dry-run fehlgeschlagen:\n${out.slice(-800)}`).toBe(0)
    expect(out.includes('Missing:'), 'Lockfile darf keine „Missing: … from lock file“-Fehler haben').toBe(false)
  })

  it('Catch-all-Headers enthalten Content-Security-Policy (Phishing/Schutzstandard)', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as {
      headers?: Array<{ source?: string; headers?: Array<{ key?: string; value?: string }> }>
    }
    const catchAll = cfg.headers?.find((h) => h.source === '/(.*)')
    const csp = catchAll?.headers?.find((x) => x.key === 'Content-Security-Policy')?.value ?? ''
    expect(csp.length).toBeGreaterThan(40)
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('frame-ancestors')
  })

  it('SPA-Rewrite schließt /boot/ aus (Boot-Skripte sind echte Dateien)', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as { rewrites?: Array<{ source?: string; destination?: string }> }
    const spa = cfg.rewrites?.find((r) => r.destination === '/index.html' && r.source?.includes('(?!boot/)'))
    expect(spa?.source).toContain('(?!boot/)')
  })

  it('APf-Handy-Einstieg: Redirect /apf.html → /dev-view', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    const cfg = JSON.parse(raw) as {
      redirects?: Array<{ source?: string; destination?: string }>
    }
    const apf = cfg.redirects?.find((r) => r.source === '/apf.html')
    expect(apf?.destination).toBe('/dev-view')
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

