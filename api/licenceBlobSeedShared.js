/**
 * Einmaliges Seeding des Vercel-Blobs für neue Galerie-Lizenzen (k2_galerie).
 * Stripe/Webhook schreibt Supabase; der Galerie-Admin liest aber gallery-data-<tenant>.json.
 * Ohne Seeding wirkt die Anmeldung „leer“ – Nutzer findet Name/Sparte nicht wieder.
 */
import { get, put } from '@vercel/blob'
import { normalizeFocusDirection, normalizeWebhookTenantId } from './stripeWebhookLicenceShared.js'

const LEGACY_TENANTS = ['k2', 'oeffentlich', 'vk2']

function isSafeTenantId(id) {
  if (!id || typeof id !== 'string') return false
  return /^[a-z0-9-]{1,64}$/.test(id)
}

function getBlobPath(tenantId) {
  if (tenantId === 'k2') return 'gallery-data.json'
  if (tenantId === 'oeffentlich') return 'gallery-data-oeffentlich.json'
  if (tenantId === 'vk2') return 'gallery-data-vk2.json'
  if (isSafeTenantId(tenantId)) return `gallery-data-${tenantId}.json`
  return 'gallery-data.json'
}

/** Gleiche Labels wie FOCUS_DIRECTIONS in src/config/tenantConfig.ts */
const FD_LABEL = {
  kunst: 'Kunst & Galerie',
  handwerk: 'Handwerk & Manufaktur',
  design: 'Design & Möbel',
  mode: 'Mode & Kleinserien',
  food: 'Food & Genuss',
  dienstleister: 'Dienstleister & Portfolio',
}

/** Gleiche Texte wie FOCUS_DIRECTION_WELCOME_INTRO in tenantConfig.ts */
const FD_INTRO = {
  kunst:
    'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.',
  handwerk: 'Willkommen in meiner Werkstatt. Hier entstehen Unikate und Kleinserien mit Hand und Herz.',
  design: 'Willkommen in meinem Showroom. Design und Handwerk – Möbel, Leuchten und Objekte mit Charakter.',
  mode: 'Willkommen in meiner Welt. Kollektionen und Kleinserien – Mode mit Seele.',
  food: 'Willkommen bei Genuss von hier. Manufaktur und Direktvermarktung – ehrliche Produkte mit Geschichte.',
  dienstleister: 'Willkommen in meinem Portfolio. Referenzen, Projekte und Ideen – wofür ich stehe.',
}

function emptyPerson() {
  return {
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    vita: '',
  }
}

function baseGallery(fd) {
  return {
    name: 'Meine Galerie',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    internetadresse: '',
    openingHours: '',
    bankverbindung: '',
    iban: '',
    bic: '',
    firmenname: '',
    ustIdNr: '',
    rechnungAddress: '',
    rechnungCity: '',
    rechnungCountry: '',
    adminPassword: '',
    soldArtworksDisplayDays: 30,
    welcomeImage: '',
    virtualTourImage: '',
    galerieCardImage: '',
    internetShopNotSetUp: true,
    focusDirections: [fd],
    story: '',
    socialYoutubeUrl: '',
    socialInstagramUrl: '',
    socialFeaturedVideoUrl: '',
  }
}

/**
 * @param {{ tenantId: string, customerName: string, customerEmail: string, focusDirection?: string }} p
 * @returns {Promise<{ skipped: boolean, reason?: string, seeded?: boolean, pathname?: string }>}
 */
export async function seedGalerieLicenceBlobIfMissing(p) {
  const tid = normalizeWebhookTenantId(p.tenantId)
  if (!tid || LEGACY_TENANTS.includes(tid)) {
    return { skipped: true, reason: 'not-dynamic-tenant' }
  }

  const pathname = getBlobPath(tid)
  try {
    const result = await get(pathname, { access: 'public' })
    if (result && result.statusCode === 200 && result.stream) {
      return { skipped: true, reason: 'blob-exists' }
    }
  } catch {
    /* Blob fehlt → weiter mit Seed */
  }

  const fd = normalizeFocusDirection(p.focusDirection)
  const displayName = String(p.customerName || '').trim() || 'Meine Galerie'
  const email = String(p.customerEmail || '').trim()

  const martina = { ...emptyPerson(), name: displayName, email }
  const georg = emptyPerson()
  const gallery = { ...baseGallery(fd), name: displayName }

  const label = FD_LABEL[fd] || FD_LABEL.kunst
  const intro = FD_INTRO[fd] || FD_INTRO.kunst

  const payload = {
    martina,
    georg,
    gallery,
    artworks: [],
    events: [],
    documents: [],
    designSettings: {},
    pageTexts: {
      galerie: {
        pageTitle: displayName,
        heroTitle: displayName,
        welcomeHeading: 'Willkommen bei',
        welcomeSubtext: label,
        welcomeIntroText: intro,
        eventSectionHeading: 'Aktuelles',
        kunstschaffendeHeading: 'Meine Werke und Ideen',
        martinaBio: '',
        georgBio: '',
        gemeinsamText: '',
        galerieButtonText: 'Galerie ansehen',
        virtualTourButtonText: 'Rundgang ansehen',
      },
    },
    exportedAt: new Date().toISOString(),
    version: 1,
    buildId: `licence-seed-${Date.now()}`,
    tenantId: tid,
    _seededFromLicenceCheckout: true,
  }

  const body = JSON.stringify(payload)
  await put(pathname, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return { seeded: true, pathname }
}
