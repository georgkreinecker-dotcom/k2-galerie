/**
 * Lizenz-Host: PlatformOnlyRoute leitet geschützte UI weg (ök2/VK2/K2 Familie).
 * Ergänzt tenantContextLicenseeInstance.test.ts (TenantContext).
 */
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../config/tenantConfig', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../config/tenantConfig')>()
  return { ...mod, isPlatformInstance: () => false }
})

import { PlatformOnlyRoute } from '../components/PlatformOnlyRoute'

describe('PlatformOnlyRoute – simulierter Lizenznehmer-Host', () => {
  it('redirectet /familie-Schutz auf / (kein Familien-UI)', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/familie',
          element: createElement(
            PlatformOnlyRoute,
            null,
            createElement('span', null, 'INSIDE_K2_FAMILIE'),
          ),
        },
        {
          path: '/',
          element: createElement('span', null, 'ROOT_FALLBACK'),
        },
      ],
      { initialEntries: ['/familie'] },
    )

    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(createElement(RouterProvider, { router }))

    await vi.waitFor(
      () => {
        expect(container.textContent).toContain('ROOT_FALLBACK')
      },
      { timeout: 2000 },
    )
    expect(container.textContent).not.toContain('INSIDE_K2_FAMILIE')
    root.unmount()
  })
})
