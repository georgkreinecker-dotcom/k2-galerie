import { describe, expect, it } from 'vitest'
import {
  buildFamilieEinladungsUrlKurz,
  buildFamilieEinladungsUrlScan,
  buildPersoenlicheEinladungsUrlKurz,
  buildPersoenlicheEinladungsUrlScan,
  normalizeTenantIdForEinladungUrl,
} from '../utils/familieEinladungsUrls'

describe('familieEinladungsUrls (eine Quelle: t/z/m wie FamilieEinladungQuerySync)', () => {
  it('normalisiert Mandanten-ID klein', () => {
    expect(normalizeTenantIdForEinladungUrl('Familie-XY-ABC')).toBe('familie-xy-abc')
  })

  it('buildFamilieEinladungsUrlKurz: t klein, z + fn', () => {
    const u = buildFamilieEinladungsUrlKurz('Tenant-MIX', 'KF-1', 'Muster')
    expect(u).toContain('t=tenant-mix')
    expect(u).toContain('z=KF-1')
    expect(u).toMatch(/fn=/i)
    expect(u).toContain('Muster')
  })

  it('buildPersoenlicheEinladungsUrlKurz: m wie trimMitgliedsNummer (Bindestrich weg)', () => {
    const u = buildPersoenlicheEinladungsUrlKurz('familie-x', 'KF-2', 'AB–12')
    expect(u).toContain('t=familie-x')
    expect(u).toContain('z=KF-2')
    expect(u).toContain('m=AB12')
  })

  it('buildPersoenlicheEinladungsUrlKurz: optional fn wie Familien-Link', () => {
    const u = buildPersoenlicheEinladungsUrlKurz('T-Tenant', 'KF-1', 'M1', 'Unsere Familie')
    expect(new URL(u).searchParams.get('fn')).toBe('Unsere Familie')
  })

  it('buildPersoenlicheEinladungsUrlKurz: leer wenn z oder m fehlt', () => {
    expect(buildPersoenlicheEinladungsUrlKurz('t', '', 'AB12')).toBe('')
    expect(buildPersoenlicheEinladungsUrlKurz('t', 'KF', '')).toBe('')
  })

  it('buildPersoenlicheEinladungsUrlScan: hängt v= an (QR-Stand)', () => {
    const u = buildPersoenlicheEinladungsUrlScan('fam-a', 'Z1', 'AB12', 1_700_000_000_000)
    expect(u).toContain('m=AB12')
    expect(u).toContain('v=1700000000000')
  })

  it('buildFamilieEinladungsUrlScan: Familienlink mit v=', () => {
    const u = buildFamilieEinladungsUrlScan('fam-b', 'KF-9', 'Name', 42)
    expect(u).toContain('t=fam-b')
    expect(u).toContain('v=42')
  })
})
