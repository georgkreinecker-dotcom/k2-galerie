import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relPath: string): string {
  const abs = path.join(process.cwd(), relPath)
  return fs.readFileSync(abs, 'utf-8')
}

describe('Homepage Template Contract (oek2 <-> Lizenz)', () => {
  it('erzwingt Pflicht-Sektionen in Lizenz-Galerie', () => {
    const pageSrc = read('src/pages/GalerieTenantPage.tsx')
    const templateSrc = read('src/components/TenantHomepageTemplate.tsx')
    const src = `${pageSrc}\n${templateSrc}`
    const requiredIds = ['start', 'kunstschaffende', 'willkommen', 'rundgang', 'werke', 'admin', 'impressum']
    for (const id of requiredIds) {
      expect(src).toContain(`id="${id}"`)
    }
    expect(pageSrc).toContain('<TenantHomepageTemplate')
  })

  it('erzwingt Kernbausteine der oek2-Referenzseite', () => {
    const src = read('src/pages/GaleriePage.tsx')
    const requiredBlocks = [
      'Willkommen bei',
      'Virtueller Rundgang',
      'In die Galerie',
      'Impressum',
      'Galerie teilen',
      'Admin',
    ]
    for (const token of requiredBlocks) {
      expect(src).toContain(token)
    }
  })

  it('erzwingt VK2-Strukturanker für gleiche Homepage-Navigation', () => {
    const src = read('src/pages/Vk2GaleriePage.tsx')
    const requiredIds = ['start', 'willkommen', 'rundgang', 'werke', 'admin', 'impressum']
    for (const id of requiredIds) {
      expect(src).toContain(`id="${id}"`)
    }
  })

  it('erzwingt K2-Familie-Trennung von Lizenznehmer-Template und tenantId-Query', () => {
    const familieSrc = read('src/pages/K2FamilieHomePage.tsx')
    expect(familieSrc).toContain('getPublicK2FamilieMeineFamilieUrl')
    expect(familieSrc).not.toContain('TenantHomepageTemplate')
    expect(familieSrc).not.toContain('tenantId=')
  })

  it('erzwingt Sportwagen-Baustein für Lizenz-Eingang (Galerie + Rundgang + Shop-Hinweis)', () => {
    const src = read('src/components/TenantHomepageTemplate.tsx')
    const requiredTokens = [
      'In die Galerie',
      'Virtueller Rundgang',
      'Herzlich willkommen - Galerie betreten',
      'In der Galerie findest du auch unseren Shop.',
      'Galerie & Shop',
      'Künstler:in',
    ]
    for (const token of requiredTokens) {
      expect(src).toContain(token)
    }
  })

  it('erzwingt Live-Template-Route im Admin ohne Alt-Preview-Pfad', () => {
    const src = read('components/ScreenshotExportAdmin.tsx')
    expect(src).toContain('liveTemplate=1')
    expect(src).toContain('k2DocViewer=1')
    expect(src).not.toContain('vorschau=1&liveTemplate=1')
  })

  it('erzwingt Dynamic-Mode-Only-Live-Editor im Farben-Subtab', () => {
    const src = read('components/ScreenshotExportAdmin.tsx')
    expect(src).toContain('const isDynamicTenantDesignMode = !!effectiveDynamicTenantId || hasTenantIdQuery')
    expect(src).toContain("if (isDynamicTenantDesignMode || isVk2DesignMode) {")
  })
})

