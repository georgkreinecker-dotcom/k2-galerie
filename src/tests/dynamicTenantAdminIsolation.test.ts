import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Dynamischer Lizenznehmer-Admin – keine K2-LocalStorage-Daten', () => {
  const source = readFileSync(join(process.cwd(), 'components/ScreenshotExportAdmin.tsx'), 'utf8')
  const tenantGallerySource = readFileSync(join(process.cwd(), 'src/pages/GalerieTenantPage.tsx'), 'utf8')

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
    expect(source).toContain("tenant.dynamicTenantId ? currentDynamicTenantGalleryPath")
  })

  it('setzt neue Mandanten ohne echte K2-Stammdaten und mit Sparte aus der URL auf', () => {
    expect(source).toContain("function createDynamicTenantGalleryDefaults")
    expect(source).toContain("function sanitizeDynamicTenantGalleryData")
    expect(source).toContain("function createDynamicTenantPageTexts")
    expect(source).toContain("function mergeDynamicTenantPageTexts")
    expect(source).toContain("name: 'Meine Galerie'")
    expect(source).toContain("heroTitle: 'Meine Galerie'")
    expect(source).toContain("focusDirections: [focusDirection]")
    expect(source).toContain("if (tenant.dynamicTenantId) return createDynamicTenantPersonDefaults() as any")
    expect(source).toContain("tenant.dynamicTenantId\n      ? createDynamicTenantGalleryDefaults(dynamicFocusDirectionFromUrl)")
    expect(source).toContain("setMartinaData(dynamicPersonDefaults as any)")
    expect(source).toContain("const initialFocusDirection = dynamicFocusDirectionFromUrl")
    expect(source).toContain("setPageTextsState(createDynamicTenantPageTexts(initialFocusDirection))")
    expect(source).toContain("setPageTextsState(mergeDynamicTenantPageTexts(data.pageTexts, effectiveFocus))")
    expect(source).toContain("}, [tenant.dynamicTenantId])")
    expect(source).not.toMatch(/tenant\.dynamicTenantId[\s\S]{0,800}setMartinaData\(K2_STAMMDATEN_DEFAULTS\.martina/)
    expect(source).not.toMatch(/tenant\.dynamicTenantId[\s\S]{0,800}setGalleryData\(\{ \.\.\.K2_STAMMDATEN_DEFAULTS\.gallery/)
  })

  it('nutzt in der Design-Vorschau für dynamische Mandanten keine K2-Fallback-Texte', () => {
    expect(source).toContain("const galleryName = tenant.dynamicTenantId")
    expect(source).toContain("const tagline = tenant.dynamicTenantId")
    expect(source).toContain("if (galerie.welcomeSubtext === defaultPageTexts.galerie.welcomeSubtext) galerie.welcomeSubtext = dynamicDefaults.galerie.welcomeSubtext")
    expect(source).toContain("if (galerie.welcomeIntroText === defaultPageTexts.galerie.welcomeIntroText) galerie.welcomeIntroText = dynamicDefaults.galerie.welcomeIntroText")
  })

  it('nutzt für Kategorie-Dropdowns bei Lizenznehmern die gewählte Sparte statt Kunst-Standard', () => {
    expect(source).toContain("if (categoryFilter !== 'alle' && !allowed.has(categoryFilter)) setCategoryFilter('alle')")
    expect(source).toContain('isFocusDirectionTenant\n                      ? getCategoriesForDirection')
    expect(source).toContain('const previewCategory = isFocusDirectionTenant')
    expect(source).toContain('const previewTypLabel = isFocusDirectionTenant')
  })

  it('speichert Lizenznehmer-Stammdaten nicht in K2-LocalStorage, sondern in den eigenen Mandanten-Blob', () => {
    expect(source).toContain("const saveDynamicTenantStateToServer")
    expect(source).toContain("function isSafeDynamicTenantSaveId")
    expect(source).toContain("return !['k2', 'oeffentlich', 'vk2'].includes(value)")
    expect(source).toContain("const dynamicTenantIdFromSearch = useMemo(() => getSafeDynamicTenantIdFromSearch(location.search), [location.search])")
    expect(source).toContain("const effectiveDynamicTenantId = tenant.dynamicTenantId ?? dynamicTenantIdFromSearch")
    expect(source).toContain("const buildDynamicTenantExportPayload = (overrides?: { martina?: any; georg?: any; gallery?: any; pageTexts?: PageTextsConfig; artworks?: any[]; tenantId?: string })")
    expect(source).toContain("const sourceMartina = overrides?.martina ?? martinaData")
    expect(source).toContain("const sourceGeorg = overrides?.georg ?? georgData")
    expect(source).toContain("const sourceGallery = overrides?.gallery ?? galleryData")
    expect(source).toContain("const targetTenantId = options?.tenantId ?? effectiveDynamicTenantId")
    expect(source).toContain("if (data.tenantId !== targetTenantId) return { success: false, error: 'Mandanten-Ziel stimmt nicht. Speichern abgebrochen.' }")
    expect(source).toMatch(/if \(tenant\.dynamicTenantId\) \{\s+saveDynamicTenantStateToServer\(\{[\s\S]*?martina: martinaData,[\s\S]*?georg: georgData,[\s\S]*?gallery: galleryData,/)
    expect(source).toContain("await saveDynamicTenantStateToServer({ silent: true })")
    expect(source).toContain("„Speichern“ und „Veröffentlichen“ schreiben in genau diesen Mandanten, nicht in K2.")
  })

  it('übergibt beim Stammdaten-Speichern den kompletten aktuellen Stammdaten-Snapshot', () => {
    expect(source).toContain("martina: martinaData")
    expect(source).toContain("georg: georgData")
    expect(source).toContain("gallery: galleryData")
    expect(source).toContain("pageTexts,")
  })

  it('schreibt Spartenwechsel sofort in Mandanten-Blob und URL, damit kein Rückfall auf Kunst passiert', () => {
    expect(source).toContain("params.set('focusDirection', nextFocus)")
    expect(source).toContain("window.history.replaceState(window.history.state, '', nextUrl)")
    expect(source).toContain("void saveDynamicTenantStateToServer({ silent: true, gallery: nextData, pageTexts: nextPageTexts })")
  })

  it('zeigt bei leerer Lizenznehmer-Galerie eine Muster-Erstgalerie statt leerer Seite', () => {
    expect(tenantGallerySource).toContain('MUSTER_ARTWORKS')
    expect(tenantGallerySource).toContain('const artworks: TenantGalleryArtwork[] = serverArtworks.length > 0 ? serverArtworks : MUSTER_ARTWORKS')
    expect(tenantGallerySource).toContain('Muster-Erstgalerie')
    expect(tenantGallerySource).not.toContain('Noch keine Inhalte – gestalte deine Galerie im Admin.')
  })
})
