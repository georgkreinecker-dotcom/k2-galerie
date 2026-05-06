import { productLineFromLicenceType } from '../../api/lizenzProductLineShared.js'

export type LizenzProductLine = 'k2_galerie' | 'k2_familie'

/** Wenn product_line noch unbekannt (nur Session-ID, noch keine API-Antwort). */
export const LIZENZ_ERFOLG_LOADING_NEUTRAL =
  'Deine persönlichen Zugangslinks werden geladen… Das dauert meist ein paar Sekunden, bis die Zahlung am Server eingetroffen ist.'

export { productLineFromLicenceType }

/** tenantId / tenant_id aus Admin-Link (?tenantId= / ?tenant_id=) – für Erfolgsseite wenn DB nur /admin liefert. */
export function parseTenantIdFromAdminUrl(adminUrl: string | null | undefined): string {
  const s = String(adminUrl || '').trim()
  if (!s) return ''
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://k2-galerie.vercel.app'
    const u = new URL(s, base)
    return (u.searchParams.get('tenantId') || u.searchParams.get('tenant_id') || '').trim()
  } catch {
    const q = s.includes('?') ? s.slice(s.indexOf('?') + 1) : ''
    try {
      const p = new URLSearchParams(q)
      return (p.get('tenantId') || p.get('tenant_id') || '').trim()
    } catch {
      return ''
    }
  }
}

export function normalizeProductLine(
  raw: string | null | undefined,
  licenceTypeFallback?: string | null,
): LizenzProductLine {
  const fromLicenceType = productLineFromLicenceType(licenceTypeFallback) as LizenzProductLine
  if (fromLicenceType === 'k2_familie') return 'k2_familie'
  if (raw === 'k2_familie') return 'k2_familie'
  if (raw === 'k2_galerie') return 'k2_galerie'
  return fromLicenceType
}

/** Erfolgsseite: URLs / Mandant schlagen widersprüchliches product_line (z. B. Stripe-Metadaten). */
export function normalizeProductLineFromApi(payload: {
  product_line?: string | null
  licence_type?: string | null
  galerie_url?: string | null
  admin_url?: string | null
  tenant_id?: string | null
}): LizenzProductLine {
  const tidRaw = String(payload.tenant_id || '').trim()
  const tidFromAdmin = parseTenantIdFromAdminUrl(payload.admin_url)
  const tid = (tidRaw || tidFromAdmin).trim().toLowerCase()
  if (tid.startsWith('familie-')) return 'k2_familie'
  const gu = String(payload.galerie_url || '').toLowerCase()
  if (
    gu.includes('k2-familie') ||
    gu.includes('meine-familie') ||
    gu.includes('/g/familie-')
  ) {
    return 'k2_familie'
  }
  const au = String(payload.admin_url || '').toLowerCase()
  if (au.includes('/projects/k2-familie/') || au.includes('meine-familie')) return 'k2_familie'
  /** Query ?tenantId=familie-… (auch wenn Pfad noch /admin) */
  if (/\btenantid=familie-/.test(au) || /\btenant_id=familie-/.test(au)) return 'k2_familie'
  return normalizeProductLine(payload.product_line, payload.licence_type)
}

/** API sagt manchmal „Galerie“, URLs/Mandant sagen K2 Familie – immer Familie gewinnen. */
export function resolveLizenzErfolgProductLine(payload: {
  product_line?: string | null
  licence_type?: string | null
  galerie_url?: string | null
  admin_url?: string | null
  tenant_id?: string | null
}): LizenzProductLine {
  const fromFields = normalizeProductLineFromApi(payload)
  const fromAnchorsOnly = normalizeProductLineFromApi({
    product_line: 'k2_galerie',
    licence_type: 'basic',
    galerie_url: payload.galerie_url,
    admin_url: payload.admin_url,
    tenant_id: payload.tenant_id,
  })
  return fromFields === 'k2_familie' || fromAnchorsOnly === 'k2_familie' ? 'k2_familie' : 'k2_galerie'
}

export type LizenzErfolgCopy = {
  openPrimaryLabel: string
  adminButtonLabel: string
  /** Nach „Das sind **deine** “ im JSX */
  accessBlurbAfterDeine: string
  /** Kurz: K2 Familie ≠ Galerie (nur Lizenz/Abrechnung gemeinsam) – optional unter Zugangs-Block */
  accessProductNote?: string
  visitorUrlPrintLabel: string
  loadingLine: string
  /** Nach „Unten in der **Lizenzbestätigung zum Drucken** “ im Admin-QR-Intro */
  adminQrBodyUrlsClause: string
  optionalFooterTitle: string
  /** Footer: Link zur öffentlichen Entdecken-Seite (nicht „Galerie“ bei K2 Familie) */
  entdeckenFooterLabel: string
  /** Druck: Hinweis wenn URLs noch fehlen */
  printMissingUrlsHint: string
}

export function getLizenzErfolgCopy(productLine: LizenzProductLine): LizenzErfolgCopy {
  if (productLine === 'k2_familie') {
    return {
      openPrimaryLabel: 'K2 Familie öffnen',
      adminButtonLabel: 'K2 Familie bearbeiten (Admin)',
      accessBlurbAfterDeine:
        'Zugangsseiten für K2 Familie (Start für Gäste, Bereich zum Bearbeiten) – nicht die Künstler-Galerie, nicht die allgemeine Lizenz-Übersicht und nicht die öffentliche Entdeckung.',
      accessProductNote:
        'K2 Familie und die Künstler-Galerie sind zwei getrennte Produkte. Über Stripe nutzt ihr dieselbe Lizenz-Abrechnung; die Links hier führen nur in deinen K2-Familie-Bereich.',
      visitorUrlPrintLabel: 'K2 Familie – Link für Gäste',
      loadingLine:
        'Deine persönlichen Links (K2 Familie + Bearbeiten) werden geladen… Das dauert meist ein paar Sekunden, bis die Zahlung am Server eingetroffen ist.',
      adminQrBodyUrlsClause:
        'stehen der Gäste-Link und die Adresse zum Bearbeiten mit; den QR kannst du hier als Bild sichern oder den Link kopieren.',
      optionalFooterTitle: 'Optional – allgemeine Plattform (nicht dein K2-Familie-Bereich)',
      entdeckenFooterLabel: 'Öffentliche Entdeckung (Plattform, nicht K2 Familie) →',
      printMissingUrlsHint:
        'Sobald K2-Familie- und Bearbeiten-Adresse oben geladen sind, erscheinen sie in diesem Kasten.',
    }
  }
  return {
    openPrimaryLabel: 'Meine Galerie öffnen',
    adminButtonLabel: 'Galerie bearbeiten (Admin)',
    accessBlurbAfterDeine:
      'Seiten (Galerie für Besucher, Admin zum Bearbeiten) – nicht die allgemeine Lizenz-Übersicht oder die öffentliche Entdeckung.',
    visitorUrlPrintLabel: 'Galerie (Besucher)',
    loadingLine:
      'Deine persönlichen Links (Galerie + Admin) werden geladen… Das dauert meist ein paar Sekunden, bis die Zahlung am Server eingetroffen ist.',
    adminQrBodyUrlsClause:
      'stehen Galerie- und Admin-Adresse mit; den QR kannst du hier als Bild sichern oder den Link kopieren.',
    optionalFooterTitle: 'Optional – allgemeine Plattform (nicht deine persönliche Galerie)',
    entdeckenFooterLabel: 'Öffentliche Galerie-Entdeckung →',
    printMissingUrlsHint:
      'Sobald Galerie- und Admin-Adresse oben geladen sind, erscheinen sie in diesem Kasten.',
  }
}
