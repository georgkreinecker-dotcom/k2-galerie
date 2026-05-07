import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Dynamischer Lizenznehmer-Admin – keine K2-LocalStorage-Daten', () => {
  const source = readFileSync(join(process.cwd(), 'components/ScreenshotExportAdmin.tsx'), 'utf8')

  it('lädt bei ?tenantId=galerie-* keine lokalen K2-Werke als Fallback', () => {
    expect(source).toMatch(/async function loadArtworksWithResolvedImages[\s\S]*?if \(tenant\.dynamicTenantId\) return \[\]/)
    expect(source).toMatch(/function loadArtworksRaw[\s\S]*?if \(tenant\.dynamicTenantId\) return \[\]/)
    expect(source).toMatch(/function loadArtworks[\s\S]*?if \(tenant\.dynamicTenantId\) return \[\]/)
  })

  it('überspringt den lokalen Werke-Lader und Auto-Save für dynamische Mandanten', () => {
    expect(source).toContain('if (tenant.dynamicTenantId) {\n      setAllArtworksSafe([])\n      return\n    }')
    expect(source).toContain('if (tenant.dynamicTenantId) {\n      // Kein Auto-Save')
  })

  it('nutzt für Galerie ansehen den Mandanten-Link /g/:tenantId statt /galerie', () => {
    expect(source).toContain('function buildDynamicTenantGalleryPath')
    expect(source).toContain("tenant.dynamicTenantId ? dynamicTenantGalleryPath")
  })

  it('setzt neue Mandanten ohne echte K2-Stammdaten und mit Sparte aus der URL auf', () => {
    expect(source).toContain("function createDynamicTenantGalleryDefaults")
    expect(source).toContain("name: 'Meine Galerie'")
    expect(source).toContain("focusDirections: [focusDirection]")
    expect(source).toContain("setMartinaData(dynamicPersonDefaults as any)")
    expect(source).not.toMatch(/tenant\.dynamicTenantId[\s\S]{0,800}setMartinaData\(K2_STAMMDATEN_DEFAULTS\.martina/)
    expect(source).not.toMatch(/tenant\.dynamicTenantId[\s\S]{0,800}setGalleryData\(\{ \.\.\.K2_STAMMDATEN_DEFAULTS\.gallery/)
  })
})
