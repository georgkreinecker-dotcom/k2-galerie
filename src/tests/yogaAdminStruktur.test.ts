import { describe, expect, it } from 'vitest'
import { YOGA_ADMIN_HUB_LINKS, YOGA_ADMIN_HUB_RECHTS } from '../config/yogaAdminStruktur'

describe('K2 YOGA Admin-Hub = K2-Struktur', () => {
  it('links dieselben Tabs wie K2: Werke, Gestalten, Einstellungen', () => {
    expect(YOGA_ADMIN_HUB_LINKS.map((k) => k.tab)).toEqual(['werke', 'design', 'einstellungen'])
  })

  it('rechts dieselben Tabs wie K2: Statistik, Eventplanung', () => {
    expect(YOGA_ADMIN_HUB_RECHTS.map((k) => k.tab)).toEqual(['statistik', 'eventplan'])
  })
})
