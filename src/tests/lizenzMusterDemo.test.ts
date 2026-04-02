import { describe, expect, it } from 'vitest'
import {
  buildLizenzMusterErfolgLinks,
  LIZENZ_MUSTER_EMAIL,
  LIZENZ_MUSTER_NAME,
  LIZENZ_MUSTER_TENANT_ID,
} from '../utils/lizenzMusterDemo'

describe('lizenzMusterDemo', () => {
  it('baut Links mit Mandanten-ID und Beispielperson', () => {
    const o = buildLizenzMusterErfolgLinks('https://k2-galerie.vercel.app')
    expect(o.name).toBe(LIZENZ_MUSTER_NAME)
    expect(o.email).toBe(LIZENZ_MUSTER_EMAIL)
    expect(o.galerie_url).toContain(`/g/${LIZENZ_MUSTER_TENANT_ID}`)
    expect(o.admin_url).toContain('tenantId=')
    expect(o.admin_url).toContain(encodeURIComponent(LIZENZ_MUSTER_TENANT_ID))
  })

  it('normalisiert trailing slash auf Origin', () => {
    const o = buildLizenzMusterErfolgLinks('https://example.com/')
    expect(o.galerie_url).toBe(`https://example.com/g/${LIZENZ_MUSTER_TENANT_ID}`)
  })
})
