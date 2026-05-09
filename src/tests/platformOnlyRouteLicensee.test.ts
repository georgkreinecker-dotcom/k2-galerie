/**
 * Lizenz-Host: PlatformOnlyRoute leitet geschützte UI weg (ök2/VK2/K2 Familie).
 * Ergänzt tenantContextLicenseeInstance.test.ts (TenantContext).
 */
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../config/tenantConfig', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../config/tenantConfig')>()
  return { ...mod, isPlatformInstance: () => false }
})

import { PlatformOnlyRoute } from '../components/PlatformOnlyRoute'

describe('PlatformOnlyRoute – simulierter Lizenznehmer-Host', () => {
  it('redirectet /familie-Schutz auf / (kein Familien-UI)', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/familie'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/familie',
            element: createElement(
              PlatformOnlyRoute,
              null,
              createElement('span', null, 'INSIDE_K2_FAMILIE'),
            ),
          }),
          createElement(Route, {
            path: '/',
            element: createElement('span', null, 'ROOT_FALLBACK'),
          }),
        ),
      ),
    )
    await new Promise<void>((r) => setTimeout(r, 50))
    expect(container.textContent).toContain('ROOT_FALLBACK')
    expect(container.textContent).not.toContain('INSIDE_K2_FAMILIE')
    root.unmount()
  })
})
