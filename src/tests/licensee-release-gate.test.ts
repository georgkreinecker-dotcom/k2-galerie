import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relPath: string): string {
  return readFileSync(join(process.cwd(), relPath), 'utf8')
}

describe('Lizenznehmer Release Gate', () => {
  it('erzwingt öffentliche QR-Basis für Lizenz-Homepage (kein localhost)', () => {
    const src = read('src/pages/GalerieTenantPage.tsx')
    expect(src).toContain("import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'")
    expect(src).toContain("const shareBaseUrl = APP_BASE_URL_SHAREABLE.replace(/\\/$/, '')")
    expect(src).toContain("const shareUrl = `${shareBaseUrl}/g/${encodeURIComponent(tenantId || '')}?focusDirection=${encodeURIComponent(focusDirection)}`")
  })

  it('erzwingt Hook-Reihenfolge: QR-Effect vor frühen Returns', () => {
    const src = read('src/pages/GalerieTenantPage.tsx')
    const effectIdx = src.indexOf('useEffect(() => {')
    const invalidReturnIdx = src.indexOf('if (!tenantId || !SAFE_TENANT_ID.test(tenantId)) {')
    expect(effectIdx).toBeGreaterThan(-1)
    expect(invalidReturnIdx).toBeGreaterThan(-1)
    expect(effectIdx).toBeLessThan(invalidReturnIdx)
  })

  it('erzwingt Impressum-Sync aus Stammdaten inkl. Name/Kontaktfelder', () => {
    const src = read('src/pages/GalerieTenantPage.tsx')
    expect(src).toContain('const impressumName = String(galleryStamm.name || title || \'Meine Galerie\').trim()')
    expect(src).toContain('const contactName1 = String(martinaStamm.name || \'\').trim()')
    expect(src).toContain('const contactName2 = String(georgStamm.name || \'\').trim()')
    expect(src).toContain('impressumName={impressumName}')
    expect(src).toContain('contactName1={contactName1}')
    expect(src).toContain('contactName2={contactName2}')
  })

  it('erzwingt ök2-nahes Impressum-Layout im Lizenz-Template inkl. QR', () => {
    const src = read('src/components/TenantHomepageTemplate.tsx')
    expect(src).toContain('Routenplaner (Google)')
    expect(src).toContain('qrDataUrl?: string')
    expect(src).toContain('props.qrDataUrl ? (')
    expect(src).toContain('props.openingHours ? (')
  })

  it('verbietet Admin-QR im Lizenz-Admin-Kontext', () => {
    const src = read('components/ScreenshotExportAdmin.tsx')
    expect(src).toContain('!isPlatformInstance() && !tenant.isOeffentlich && !effectiveDynamicTenantId')
    expect(src).toContain('!tenant.isOeffentlich && !tenant.isVk2 && isPlatformInstance() && !effectiveDynamicTenantId')
  })
})
