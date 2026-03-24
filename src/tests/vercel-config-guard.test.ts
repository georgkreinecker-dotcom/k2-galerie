import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Vercel-Konfigurations-Schranken', () => {
  it('vercel.json ist valides JSON', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')
    expect(() => JSON.parse(raw)).not.toThrow()
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

