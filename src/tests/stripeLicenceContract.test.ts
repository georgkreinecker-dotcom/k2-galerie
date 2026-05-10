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
  buildRenewalGutschriftInsert,
  buildRenewalPaymentRow,
  isSubscriptionRenewalInvoice,
} from '../../api/stripeInvoiceRenewalShared.js'
import {
  buildAdminUrlForLicence,
  buildGalerieUrl,
  checkoutSessionEffectiveMetadata,
  computeEmpfehlerGutschrift,
  normalizeWebhookTenantId,
  parseFamilieTenantIdFromGalerieUrl,
  parseK2GalerieTenantIdFromGalerieUrl,
  resolveCheckoutLicenceType,
  rowsFromCheckoutSession,
} from '../../api/stripeWebhookLicenceShared.js'
import {
  productLineFromLicenceType,
  productLineFromStripeSession,
} from '../../api/lizenzProductLineShared.js'
import {
  normalizeProductLine,
  normalizeProductLineFromApi,
  parseTenantIdFromAdminUrl,
  resolveLizenzErfolgProductLine,
} from '../utils/lizenzErfolgCopy'
import {
  createStripeCheckoutSession,
  generateFamilieTenantId,
  generateTenantId,
  resolveGalleryOrVk2ProductLineForCheckout,
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

describe('resolveGalleryOrVk2ProductLineForCheckout (Manipulationsschutz)', () => {
  it('VK2 nur bei licenceType pro + productLine vk2', () => {
    expect(resolveGalleryOrVk2ProductLineForCheckout('pro', 'vk2')).toBe('vk2')
    expect(resolveGalleryOrVk2ProductLineForCheckout('pro', undefined)).toBe('k2_galerie')
  })
  it('basic/proplus + productLine vk2 → Galerie (kein günstiger VK2-Zugang)', () => {
    expect(resolveGalleryOrVk2ProductLineForCheckout('basic', 'vk2')).toBe('k2_galerie')
    expect(resolveGalleryOrVk2ProductLineForCheckout('proplus', 'vk2')).toBe('k2_galerie')
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

describe('productLineFromLicenceType (eine Quelle API + Erfolgsseite)', () => {
  it('K2 Familie Monat/Jahr → k2_familie', () => {
    expect(productLineFromLicenceType('familie_monat')).toBe('k2_familie')
    expect(productLineFromLicenceType('familie_jahr')).toBe('k2_familie')
  })
  it('Galerie-Stufen und Leer → k2_galerie', () => {
    expect(productLineFromLicenceType('basic')).toBe('k2_galerie')
    expect(productLineFromLicenceType('pro')).toBe('k2_galerie')
    expect(productLineFromLicenceType('')).toBe('k2_galerie')
  })
})

describe('normalizeProductLine (API-Felder + Fallback)', () => {
  it('bevorzugt product_line aus der Antwort', () => {
    expect(normalizeProductLine('k2_familie', 'basic')).toBe('k2_familie')
  })
  it('licence_type K2 Familie hat Vorrang vor widersprüchlichem product_line Galerie', () => {
    expect(normalizeProductLine('k2_galerie', 'familie_jahr')).toBe('k2_familie')
    expect(normalizeProductLine('k2_galerie', 'familie_monat')).toBe('k2_familie')
  })
  it('ohne product_line: ableiten aus licence_type', () => {
    expect(normalizeProductLine(undefined, 'familie_jahr')).toBe('k2_familie')
    expect(normalizeProductLine(null, 'pro')).toBe('k2_galerie')
  })
  it('VK2 product_line bleibt VK2, obwohl licence_type technisch Pro ist', () => {
    expect(normalizeProductLine('vk2', 'pro')).toBe('vk2')
  })
})

describe('normalizeProductLineFromApi (URLs / tenant schlagen product_line)', () => {
  it('widersprüchlich k2_galerie + meine-familie URL → k2_familie', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        galerie_url: 'https://x.app/projects/k2-familie/meine-familie',
        admin_url: 'https://x.app/admin?tenantId=x',
      }),
    ).toBe('k2_familie')
  })
  it('tenant_id familie-* → k2_familie trotz product_line Galerie', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        tenant_id: 'familie-georg-kreinecker-0gjans',
      }),
    ).toBe('k2_familie')
  })
  it('nur admin_url ?tenantId=familie-* (ohne tenant_id) → k2_familie', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        admin_url: 'https://x.app/admin?tenantId=familie-georg-kreinecker-yltune',
      }),
    ).toBe('k2_familie')
  })
  it('admin_url nur ?t=familie-* (K2-Familie-Mandant) → k2_familie', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        admin_url: 'https://x.app/admin?t=familie-georg-kreinecker-abc12',
      }),
    ).toBe('k2_familie')
  })
  it('galerie_url /g/familie-… → k2_familie', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        galerie_url: 'https://x.app/g/familie-test-1',
      }),
    ).toBe('k2_familie')
  })
  it('VK2 URLs und tenant_id schlagen Galerie-Fallback', () => {
    expect(
      normalizeProductLineFromApi({
        product_line: 'k2_galerie',
        licence_type: 'pro',
        tenant_id: 'vk2',
        galerie_url: 'https://x.app/projects/vk2/galerie',
        admin_url: 'https://x.app/admin?context=vk2',
      }),
    ).toBe('vk2')
  })
})

describe('parseTenantIdFromAdminUrl', () => {
  it('liest tenantId aus Query', () => {
    expect(parseTenantIdFromAdminUrl('https://x.app/admin?tenantId=familie-x-1')).toBe('familie-x-1')
  })
  it('liest t=familie-* wenn kein tenantId', () => {
    expect(parseTenantIdFromAdminUrl('https://x.app/meine-familie?t=familie-georg-8d5lu8')).toBe(
      'familie-georg-8d5lu8',
    )
  })
})

describe('parseK2GalerieTenantIdFromGalerieUrl', () => {
  const base = 'https://k2-galerie.vercel.app'
  it('liest Mandant aus /g/galerie-* (DB tenant_id leer)', () => {
    expect(parseK2GalerieTenantIdFromGalerieUrl(`${base}/g/galerie-max-m-abc12?focusDirection=kunst`, base)).toBe(
      'galerie-max-m-abc12',
    )
  })
  it('leer bei /g/familie-* (Familie nicht hier)', () => {
    expect(parseK2GalerieTenantIdFromGalerieUrl(`${base}/g/familie-x-y1`, base)).toBe('')
  })
  it('leer ohne /g/-Pfad', () => {
    expect(parseK2GalerieTenantIdFromGalerieUrl(`${base}/projects/k2-galerie/lizenz-kaufen`, base)).toBe('')
  })
  it('Mandant auch mit trailing slash am Pfad', () => {
    expect(parseK2GalerieTenantIdFromGalerieUrl(`${base}/g/galerie-max-m-abc12/`, base)).toBe('galerie-max-m-abc12')
  })
})

describe('parseFamilieTenantIdFromGalerieUrl', () => {
  const base = 'https://k2-galerie.vercel.app'
  it('liest ?t=familie-* aus meine-familie-URL', () => {
    expect(
      parseFamilieTenantIdFromGalerieUrl(
        `${base}/projects/k2-familie/meine-familie?t=familie-anna-abc123`,
        base,
      ),
    ).toBe('familie-anna-abc123')
  })
  it('leer wenn kein t=', () => {
    expect(parseFamilieTenantIdFromGalerieUrl(`${base}/projects/k2-familie/meine-familie`, base)).toBe('')
  })
})

describe('buildAdminUrlForLicence', () => {
  const base = 'https://k2-galerie.vercel.app'
  it('K2 Familie ohne tenant_id → meine-familie, nicht k2-galerie-Hub', () => {
    expect(buildAdminUrlForLicence(base, '', 'familie_monat', 'k2_familie', 'kunst')).toBe(
      `${base}/projects/k2-familie/meine-familie`,
    )
  })
  it('K2 Familie mit Mandant → ?t=', () => {
    expect(
      buildAdminUrlForLicence(base, 'familie-x-y1', 'familie_jahr', 'k2_familie', 'kunst'),
    ).toBe(`${base}/projects/k2-familie/meine-familie?t=familie-x-y1`)
  })
  it('product_line k2_familie reicht (ohne licenceType)', () => {
    expect(buildAdminUrlForLicence(base, '', 'basic', 'k2_familie', 'kunst')).toBe(
      `${base}/projects/k2-familie/meine-familie`,
    )
  })
  it('Galerie ohne Mandant (LK2) → ök2-Admin context=oeffentlich (nicht APf, nicht nacktes /admin)', () => {
    expect(buildAdminUrlForLicence(base, '', 'basic', 'k2_galerie', 'kunst')).toBe(
      `${base}/admin?context=oeffentlich&focusDirection=kunst`,
    )
  })
  it('Galerie mit Mandant nur in galerie_url (/g/…) → Admin mit tenantId', () => {
    const tid = parseK2GalerieTenantIdFromGalerieUrl(`${base}/g/galerie-test-xy42`, base)
    expect(tid).toBe('galerie-test-xy42')
    expect(buildAdminUrlForLicence(base, tid, 'basic', 'k2_galerie', 'handwerk')).toBe(
      `${base}/admin?tenantId=galerie-test-xy42&focusDirection=handwerk`,
    )
  })
})

describe('resolveLizenzErfolgProductLine', () => {
  it('API product_line Galerie + meine-familie URL → k2_familie', () => {
    expect(
      resolveLizenzErfolgProductLine({
        product_line: 'k2_galerie',
        licence_type: 'basic',
        galerie_url: 'https://x.app/projects/k2-familie/meine-familie?t=x',
        admin_url: 'https://x.app/admin',
      }),
    ).toBe('k2_familie')
  })
  it('API product_line Galerie + VK2 URL/Admin → vk2', () => {
    expect(
      resolveLizenzErfolgProductLine({
        product_line: 'k2_galerie',
        licence_type: 'pro',
        galerie_url: 'https://x.app/projects/vk2/galerie',
        admin_url: 'https://x.app/admin?context=vk2',
      }),
    ).toBe('vk2')
  })
})

describe('productLineFromStripeSession', () => {
  it('licence_type Familie hat Vorrang vor metadata productLine k2_galerie', () => {
    expect(
      productLineFromStripeSession(
        { metadata: { productLine: 'k2_galerie', tenantId: 'familie-x' } },
        'familie_monat',
        'familie-x',
      ),
    ).toBe('k2_familie')
  })
  it('nur tenant familie-* reicht (licence basic + falsches meta)', () => {
    expect(
      productLineFromStripeSession(
        { metadata: { productLine: 'k2_galerie' } },
        'basic',
        'familie-georg-kreinecker-0gjans',
      ),
    ).toBe('k2_familie')
  })
  it('VK2 metadata oder tenant reicht trotz licence_type pro', () => {
    expect(
      productLineFromStripeSession(
        { metadata: { productLine: 'vk2' } },
        'pro',
        'vk2',
      ),
    ).toBe('vk2')
    expect(productLineFromStripeSession({ metadata: {} }, 'pro', 'vk2')).toBe('vk2')
  })
})

describe('resolveCheckoutLicenceType (Metadaten-Lücken vs. K2 Familie)', () => {
  it('nur productLine k2_familie + Betrag Monat → familie_monat', () => {
    expect(
      resolveCheckoutLicenceType({
        amount_total: STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_monat,
        metadata: { productLine: 'k2_familie' },
      }),
    ).toBe('familie_monat')
  })

  it('nur tenantId familie-* ohne licenceType + Betrag Jahr → familie_jahr', () => {
    expect(
      resolveCheckoutLicenceType({
        amount_total: STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_jahr,
        metadata: { tenantId: 'familie-test-abc12' },
      }),
    ).toBe('familie_jahr')
  })

  it('Galerie-tenant ohne licenceType → basic (kein Familie-Fallback)', () => {
    expect(
      resolveCheckoutLicenceType({
        amount_total: 3500,
        metadata: { tenantId: 'galerie-test-abc12' },
      }),
    ).toBe('basic')
  })

  it('leere Session-Metadaten aber K2-Familie-cancel_url + Betrag → Familie-Typ', () => {
    expect(
      resolveCheckoutLicenceType({
        amount_total: STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_monat,
        metadata: {},
        cancel_url: 'https://k2-galerie.vercel.app/projects/k2-familie/lizenz-erwerben',
      }),
    ).toBe('familie_monat')
  })

  it('Metadaten nur auf expandierter subscription → licenceType übernommen', () => {
    expect(
      resolveCheckoutLicenceType({
        metadata: {},
        subscription: {
          metadata: {
            licenceType: 'familie_jahr',
            tenantId: 'familie-test-abc12',
            productLine: 'k2_familie',
          },
        },
        amount_total: 10000,
      }),
    ).toBe('familie_jahr')
  })

  it('line_items recurring month wenn Betrag nicht gemappt', () => {
    expect(
      resolveCheckoutLicenceType({
        metadata: {},
        cancel_url: 'https://x.app/projects/k2-familie/lizenz-erwerben',
        amount_total: 999,
        line_items: {
          data: [{ price: { recurring: { interval: 'month' } } }],
        },
      }),
    ).toBe('familie_monat')
  })
})

describe('checkoutSessionEffectiveMetadata', () => {
  it('übernimmt fehlende Keys von subscription.metadata', () => {
    expect(
      checkoutSessionEffectiveMetadata({
        metadata: { customerName: 'A' },
        subscription: { metadata: { licenceType: 'familie_jahr', tenantId: 'familie-x-y' } },
      }),
    ).toMatchObject({
      customerName: 'A',
      licenceType: 'familie_jahr',
      tenantId: 'familie-x-y',
    })
  })

  it('setzt tenantId aus client_reference_id wenn metadata.tenantId leer', () => {
    expect(
      checkoutSessionEffectiveMetadata({
        metadata: { licenceType: 'basic', productLine: 'k2_galerie', customerName: 'X' },
        client_reference_id: 'galerie-from-cr-99',
      }),
    ).toMatchObject({
      licenceType: 'basic',
      tenantId: 'galerie-from-cr-99',
    })
  })

  it('übernimmt fehlende tenantId von payment_intent.metadata (mode payment)', () => {
    expect(
      checkoutSessionEffectiveMetadata({
        metadata: { licenceType: 'pro', productLine: 'k2_galerie', customerName: 'Y' },
        payment_intent: {
          metadata: { tenantId: 'galerie-pi-meta-1', focusDirection: 'handwerk' },
        },
      }),
    ).toMatchObject({
      tenantId: 'galerie-pi-meta-1',
      focusDirection: 'handwerk',
    })
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
      'https://k2-galerie.vercel.app/g/galerie-test-abc12?focusDirection=kunst',
    )
  })

  it('tenantId nur in client_reference_id → gleiche galerie_url wie bei metadata.tenantId', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_cr',
        amount_total: 1500,
        customer_email: 'x@y.z',
        client_reference_id: 'galerie-only-cr-88',
        metadata: {
          licenceType: 'basic',
          customerName: 'B',
          productLine: 'k2_galerie',
        },
      },
      base,
    )
    expect(pack.licenceInsert.tenant_id).toBe('galerie-only-cr-88')
    expect(pack.licenceInsert.galerie_url).toBe(
      `${base}/g/galerie-only-cr-88?focusDirection=kunst`,
    )
  })

  it('gewählte Sparte wird in die Lizenz-Galerie-URL übernommen', () => {
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_focus',
        amount_total: 3500,
        customer_email: 'x@y.z',
        metadata: {
          licenceType: 'pro',
          customerName: 'Handwerk',
          tenantId: 'galerie-handwerk-abc12',
          focusDirection: 'handwerk',
        },
      },
      'https://k2-galerie.vercel.app',
    )
    expect(pack.focusDirection).toBe('handwerk')
    expect(pack.licenceInsert.galerie_url).toBe(
      'https://k2-galerie.vercel.app/g/galerie-handwerk-abc12?focusDirection=handwerk',
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
      'https://k2-galerie.vercel.app/projects/k2-familie/meine-familie?t=familie-test-abc12&fn=K',
    )
  })

  it('tenantId familie-* + licenceType basic → trotzdem Meine Familie URL mit t=', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_fam_mis',
        amount_total: 10000,
        customer_email: 'k@fam.de',
        metadata: {
          licenceType: 'basic',
          customerName: 'K',
          tenantId: 'familie-test-abc12',
        },
      },
      base,
    )
    expect(pack.licenceInsert.licence_type).toMatch(/^familie_/)
    expect(pack.licenceInsert.galerie_url).toBe(
      'https://k2-galerie.vercel.app/projects/k2-familie/meine-familie?t=familie-test-abc12&fn=K',
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

  it('K2 Familie: Empfehler in Metadaten wird ignoriert (kein Empfehlungsprogramm)', () => {
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_fam_ref',
        amount_total: 10000,
        customer_email: 'c@fam.de',
        metadata: {
          licenceType: 'familie_jahr',
          customerName: 'C',
          tenantId: 'familie-test-abc12',
          empfehlerId: 'ref-fam-1',
        },
      },
      'https://k2-galerie.vercel.app',
    )
    expect(pack.licenceInsert.empfehler_id).toBeNull()
    expect(pack.buildGutschriftInsert('pay-f', 'lic-f')).toBeNull()
    expect(pack.gutschriftCents).toBe(0)
  })

  it('VK2 Vereinslizenz → VK2-Produktlinie und VK2-Galerie statt normaler Galerie', () => {
    const base = 'https://k2-galerie.vercel.app'
    const pack = rowsFromCheckoutSession(
      {
        id: 'cs_vk2',
        amount_total: 3500,
        customer_email: 'verein@vk2.at',
        metadata: {
          licenceType: 'pro',
          productLine: 'vk2',
          customerName: 'Kunstverein',
          tenantId: 'vk2',
        },
      },
      base,
    )
    expect(pack.productLine).toBe('vk2')
    expect(pack.licenceInsert.tenant_id).toBe('vk2')
    expect(pack.licenceInsert.licence_type).toBe('pro')
    expect(pack.licenceInsert.galerie_url).toBe('https://k2-galerie.vercel.app/projects/vk2/galerie')
  })
})

describe('Stripe invoice.paid – Verlängerung', () => {
  it('nur subscription_cycle zählt als Verlängerung', () => {
    expect(isSubscriptionRenewalInvoice({ billing_reason: 'subscription_cycle' })).toBe(true)
    expect(isSubscriptionRenewalInvoice({ billing_reason: 'subscription_create' })).toBe(false)
  })

  it('buildRenewalPaymentRow nutzt invoice.id als stripe_session_id', () => {
    const row = buildRenewalPaymentRow(
      { id: 'in_1abc', amount_paid: 9900, currency: 'eur' },
      { id: 'lic-1', empfehler_id: 'e1' },
    )
    expect(row.stripe_session_id).toBe('in_1abc')
    expect(row.amount_cents).toBe(9900)
    expect(row.licence_id).toBe('lic-1')
  })

  it('buildRenewalGutschriftInsert: 10 % wie bei erster Zahlung', () => {
    const gut = buildRenewalGutschriftInsert(
      { amount_paid: 10000 },
      { id: 'lic-1', empfehler_id: 'ref12' },
      'pay-renew',
    )
    expect(gut).toEqual({
      empfehler_id: 'ref12',
      amount_eur: '10.00',
      payment_id: 'pay-renew',
      licence_id: 'lic-1',
    })
  })

  it('buildRenewalPaymentRow: K2 Familie → empfehler_id immer null', () => {
    const row = buildRenewalPaymentRow(
      { id: 'in_1abc', amount_paid: 9900, currency: 'eur' },
      { id: 'lic-1', empfehler_id: 'e1', licence_type: 'familie_jahr' },
    )
    expect(row.empfehler_id).toBeNull()
  })

  it('buildRenewalGutschriftInsert: K2 Familie trotz alter empfehler_id → keine Gutschrift', () => {
    expect(
      buildRenewalGutschriftInsert(
        { amount_paid: 10000 },
        { id: 'lic-1', empfehler_id: 'ref12', licence_type: 'familie_monat' },
        'pay-renew',
      ),
    ).toBeNull()
  })
})

describe('normalizeWebhookTenantId / buildGalerieUrl', () => {
  it('leer und ungültig → null', () => {
    expect(normalizeWebhookTenantId('')).toBeNull()
    expect(normalizeWebhookTenantId('K2_GROSS')).toBeNull()
    expect(normalizeWebhookTenantId('a'.repeat(70))).toBeNull()
  })

  it('buildGalerieUrl ohne Slash am Ende', () => {
    expect(buildGalerieUrl('https://host/', 't1')).toBe('https://host/g/t1?focusDirection=kunst')
  })
})

