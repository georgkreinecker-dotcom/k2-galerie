import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { isApfPwaPath } from '../utils/apfPwaBranding'

describe('apfPwaBranding', () => {
  it('erkennt APf-PWA-Routen', () => {
    expect(isApfPwaPath('/dev-view')).toBe(true)
    expect(isApfPwaPath('/dev-view/')).toBe(true)
    expect(isApfPwaPath('/apf')).toBe(true)
    expect(isApfPwaPath('/mobile-connect')).toBe(true)
  })

  it('schließt Galerie und Familie aus', () => {
    expect(isApfPwaPath('/galerie')).toBe(false)
    expect(isApfPwaPath('/familie')).toBe(false)
    expect(isApfPwaPath('/admin')).toBe(false)
    expect(isApfPwaPath('/')).toBe(false)
  })
})

describe('manifest-apf.json', () => {
  it('eigene id, start_url /dev-view, Icons vorhanden', () => {
    const raw = readFileSync(join(process.cwd(), 'public/manifest-apf.json'), 'utf8')
    const m = JSON.parse(raw) as {
      id?: string
      start_url?: string
      scope?: string
      short_name?: string
      icons?: Array<{ src?: string }>
    }
    expect(m.id).toBe('k2-apf-pwa')
    expect(m.short_name).toBe('APf')
    expect(m.start_url).toContain('/dev-view')
    expect(m.scope).toBe('/dev-view')
    expect(existsSync(join(process.cwd(), 'public/apf-icon-192.png'))).toBe(true)
    expect(existsSync(join(process.cwd(), 'public/apf-icon-512.png'))).toBe(true)
    expect(m.icons?.some((i) => i.src === '/apf-icon-192.png')).toBe(true)
  })

  it('boot-manifest.js schaltet APf-Manifest auf /dev-view', () => {
    const boot = readFileSync(join(process.cwd(), 'public/boot/boot-manifest.js'), 'utf8')
    expect(boot).toContain('manifest-apf.json')
    expect(boot).toContain('/dev-view')
    expect(boot).toContain('apf-icon-192.png')
  })
})
