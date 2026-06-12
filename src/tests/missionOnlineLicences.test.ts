import { describe, expect, it } from 'vitest'
import {
  formatLicenceTypeLabel,
  latestLicencePerTenant,
  missionLicenceDisplayName,
  parseMissionLicenceDataPayload,
  resolveMissionLicenceGalerieUrl,
  uniqueTenantIdsFromLicences,
} from '../utils/missionOnlineLicences'
import { getMissionVisitLicenseeProducts } from '../config/missionVisitZeitleiste'

describe('missionOnlineLicences', () => {
  it('parseMissionLicenceDataPayload liest licences und empty_online_hint', () => {
    const parsed = parseMissionLicenceDataPayload({
      licences: [
        {
          id: 'a1',
          email: 'a@b.at',
          name: 'Galerie Test',
          licence_type: 'pro',
          status: 'active',
          tenant_id: 'galerie-test',
          galerie_url: 'https://example.at/g/galerie-test',
          created_at: '2026-06-01T10:00:00Z',
        },
      ],
      stripe_chain: { empty_online_hint: 'Webhook prüfen' },
    })
    expect(parsed.licences).toHaveLength(1)
    expect(parsed.emptyOnlineHint).toBe('Webhook prüfen')
    expect(missionLicenceDisplayName(parsed.licences[0])).toBe('Galerie Test')
    expect(formatLicenceTypeLabel('pro')).toBe('Pro')
    expect(uniqueTenantIdsFromLicences(parsed.licences)).toEqual(['galerie-test'])
    expect(resolveMissionLicenceGalerieUrl(parsed.licences[0])).toBe('https://example.at/g/galerie-test')
  })

  it('latestLicencePerTenant behält neuesten Kauf pro Mandant', () => {
    const licences = [
      {
        id: '1',
        email: '',
        name: 'Alt',
        licence_type: 'basic',
        status: 'active',
        tenant_id: 'galerie-eferding',
        created_at: '2026-05-01',
      },
      {
        id: '2',
        email: '',
        name: 'Neu',
        licence_type: 'pro',
        status: 'active',
        tenant_id: 'galerie-eferding',
        created_at: '2026-06-01',
      },
    ]
    const latest = latestLicencePerTenant(licences)
    expect(latest.get('galerie-eferding')?.name).toBe('Neu')
    const products = getMissionVisitLicenseeProducts(licences)
    expect(products).toHaveLength(1)
    expect(products[0].label).toBe('Neu')
    expect(products[0].id).toBe('lizenz-galerie-eferding')
  })
})
