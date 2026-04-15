import { describe, expect, it } from 'vitest'
import {
  STRIPE_API_PATHS,
  STRIPE_LICENCE_PRODUCTION_HOST,
  STRIPE_WEBHOOK_PATH,
  getStripeWebhookUrlProduction,
} from '../../api/stripeLicenceChainConstants.js'
import { K2_FAMILIE_LIZENZPREISE, LIZENZPREISE } from '../config/licencePricing'
import {
  STRIPE_CHECKOUT_LICENCE_TYPES,
  STRIPE_FAMILIE_CHECKOUT_TYPES,
  STRIPE_FAMILIE_LICENCE_PRICE_CENTS,
  STRIPE_LICENCE_PRICE_CENTS,
} from '../../api/stripePriceCents.js'
import {
  buildGalerieUrl,
  computeEmpfehlerGutschrift,
  normalizeWebhookTenantId,
  rowsFromCheckoutSession,
} from '../../api/stripeWebhookLicenceShared.js'
import {
  createStripeCheckoutSession,
  generateFamilieTenantId,
  generateTenantId,
} from '../../api/createCheckoutShared.js'

describe('Stripe Lizenz – Kette: Konstanten = eine Quelle (bombensicher)', () => {
  it('Production-Webhook-URL und Pfade stabil (Doku/Stripe Dashboard)', () => {
    expect(STRIPE_LICENCE_PRODUCTION_HOST).toBe('https://k2-galerie.vercel.app')
    expect(STRIPE_WEBHOOK_PATH).toBe('/api/webhook-stripe')
    expect(getStripeWebhookUrlProduction()).toBe('https://k2-galerie.vercel.app/api/webhook-stripe')
    expect(STRIPE_API_PATHS.webhook).toBe('/api/webhook-stripe')
    expect(STRIPE_API_PATHS.licenceData).toBe('/api/licence-data')
    expect(STRIPE_API_PATHS.getLicenceBySession).toBe('/api/get-licence-by-session')
    expect(STRIPE_API_PATHS.createCheckout).toBe('/api/create-checkout')
  })
})

describe('Stripe Lizenz – Preise = eine Quelle mit licencePricing', () => {
  it('jede Checkout-Stufe: Cent = priceEur * 100', () => {
    for (const key of STRIPE_CHECKOUT_LICENCE_TYPES) {
      const euro = LIZENZPREISE[key as keyof typeof LIZENZPREISE]?.priceEur
      expect(typeof euro).toBe('number')
      expect(STRIPE_LICENCE_PRICE_CENTS[key as keyof typeof STRIPE_LICENCE_PRICE_CENTS]).toBe(
        (euro as number) * 100,
      )
    }
  })

  it('K2 Familie: Cent = K2_FAMILIE_LIZENZPREISE.priceEur * 100', () => {
    expect(STRIPE_FAMILIE_CHECKOUT_TYPES).toEqual(['familie_monat', 'familie_jahr'])
    for (const key of STRIPE_FAMILIE_CHECKOUT_TYPES) {
      const euro = K2_FAMILIE_LIZENZPREISE[key as keyof typeof K2_FAMILIE_LIZENZPREISE]?.priceEur
      expect(typeof euro).toBe('number')
      expect(STRIPE_FAMILIE_LICENCE_PRICE_CENTS[key as keyof typeof STRIPE_FAMILIE_LICENCE_PRICE_CENTS]).toBe(
        (euro as number) * 100,
      )
    }
  })
})

describe('createStripeCheckoutSession – Validierung', () => {
  it('unbekannter licenceType: kein Stripe-Aufruf nötig (VALIDATION)', async () => {
    await expect(
      createStripeCheckoutSession({
        licenceType: 'enterprise',
        email: 'k@k.at',
        name: 'K',
        secretKey: 'sk_test_würde_sonst_api_rufen',
        baseUrl: 'https://k2-galerie.vercel.app',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('generateTenantId', () => {
  it('liefert Präfix galerie- und nur Kleinbuchstaben/Ziffern/Bindestrich im Slug-Teil', () => {
    const id = generateTenantId('  Max.Mustermann@Beispiel.de  ')
    expect(id).toMatch(/^galerie-[a-z0-9-]+-[a-z0-9]+$/)
    expect(id).toContain('max-mustermann')
  })

  it('ohne @: nutzt Fallback galerie', () => {
    const id = generateTenantId('keinemail')
    expect(id.startsWith('galerie-')).toBe(true)
  })
})

describe('generateFamilieTenantId', () => {
  it('liefert Präfix familie- und Slug aus E-Mail', () => {
    const id = generateFamilieTenantId('  Anna.Test@Familie.de  ')
    expect(id).toMatch(/^familie-[a-z0-9-]+-[a-z0-9]+$/)
    expect(id).toContain('anna-test')
  })
})

describe('Webhook-Zeilen aus Session', () => {
  it('tenantId unsicher → keine galerie_url, licence ohne tenant_id', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_test_1',
        amount_total: 3500,
        customer_email: 'a@b.de',
        metadata: {
          licenceType: 'pro',
          customerName: 'Anna',
          tenantId: 'Galerie_<script>', // ungültig
        },
      },
      base,
    )
    expect(pack.licenceInsert.tenant_id).toBeUndefined()
    expect(pack.licenceInsert.galerie_url).toBeUndefined()
    expect(pack.licenceInsert.licence_type).toBe('pro')
  })

  it('gültiger tenantId → galerie_url /g/…', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_x',
        amount_total: 1500,
        customer_email: 'x@y.z',
        metadata: {
          licenceType: 'basic',
          customerName: 'B',
          tenantId: 'galerie-test-abc12',
        },
      },
      base,
    )
    expect(pack.licenceInsert.tenant_id).toBe('galerie-test-abc12')
    expect(pack.licenceInsert.galerie_url).toBe(
      'https://k2-galerie.vercel.app/g/galerie-test-abc12',
    )
  })

  it('K2 Familie Jahreslizenz → galerie_url Meine Familie', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_fam',
        amount_total: 10000,
        customer_email: 'k@fam.de',
        metadata: {
          licenceType: 'familie_jahr',
          customerName: 'K',
          tenantId: 'familie-test-abc12',
        },
      },
      base,
    )
    expect(pack.licenceInsert.tenant_id).toBe('familie-test-abc12')
    expect(pack.licenceInsert.galerie_url).toBe(
      'https://k2-galerie.vercel.app/projects/k2-familie/meine-familie',
    )
  })

  it('Empfehler: 10 % Gutschrift in Cent/Euro', () => {
    expect(computeEmpfehlerGutschrift(3500, 'emp-1')).toEqual({ cents: 350, eur: '3.50' })
    expect(computeEmpfehlerGutschrift(3500, '')).toEqual({ cents: 0, eur: '0.00' })
    const gut = rowsFromCheckoutSession(
      {
        id: 'cs_g',
        amount_total: 10000,
        customer_email: 'c@d.e',
        metadata: {
          licenceType: 'pro',
          customerName: 'C',
          tenantId: 'galerie-a-abc12',
          empfehlerId: 'ref12',
        },
      },
      'https://x.app',
    ).buildGutschriftInsert('pay-uuid', 'lic-uuid')
    expect(gut).toEqual({
      empfehler_id: 'ref12',
      amount_eur: '10.00',
      payment_id: 'pay-uuid',
      licence_id: 'lic-uuid',
    })
  })
})

describe('normalizeWebhookTenantId / buildGalerieUrl', () => {
  it('leer und ungültig → null', () => {
    expect(normalizeWebhookTenantId('')).toBeNull()
    expect(normalizeWebhookTenantId('K2_GROSS')).toBeNull()
    expect(normalizeWebhookTenantId('a'.repeat(70))).toBeNull()
  })

  it('buildGalerieUrl ohne Slash am Ende', () => {
    expect(buildGalerieUrl('https://host/', 't1')).toBe('https://host/g/t1')
  })
})

