import { productLineFromLicenceType } from '../../api/lizenzProductLineShared.js'

export type LizenzProductLine = 'k2_galerie' | 'k2_familie'

/** Wenn product_line noch unbekannt (nur Session-ID, noch keine API-Antwort). */
export const LIZENZ_ERFOLG_LOADING_NEUTRAL =
  'Deine persönlichen Zugangslinks werden geladen… Das dauert meist ein paar Sekunden, bis die Zahlung am Server eingetroffen ist.'

export { productLineFromLicenceType }

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

export type LizenzErfolgCopy = {
  openPrimaryLabel: string
  adminButtonLabel: string
  /** Nach „Das sind **deine** “ im JSX */
  accessBlurbAfterDeine: string
  visitorUrlPrintLabel: string
  loadingLine: string
  /** Nach „Unten in der **Lizenzbestätigung zum Drucken** “ im Admin-QR-Intro */
  adminQrBodyUrlsClause: string
  optionalFooterTitle: string
  /** Druck: Hinweis wenn URLs noch fehlen */
  printMissingUrlsHint: string
}

export function getLizenzErfolgCopy(productLine: LizenzProductLine): LizenzErfolgCopy {
  if (productLine === 'k2_familie') {
    return {
      openPrimaryLabel: 'K2 Familie öffnen',
      adminButtonLabel: 'K2 Familie bearbeiten (Admin)',
      accessBlurbAfterDeine:
        'Seiten (Start für Besucher, Admin zum Bearbeiten) – nicht die allgemeine Lizenz-Übersicht oder die öffentliche Entdeckung.',
      visitorUrlPrintLabel: 'K2 Familie (Besucher)',
      loadingLine:
        'Deine persönlichen Links (K2 Familie + Admin) werden geladen… Das dauert meist ein paar Sekunden, bis die Zahlung am Server eingetroffen ist.',
      adminQrBodyUrlsClause:
        'stehen K2-Familie- und Admin-Adresse mit; den QR kannst du hier als Bild sichern oder den Link kopieren.',
      optionalFooterTitle: 'Optional – allgemeine Plattform (nicht dein K2-Familie-Bereich)',
      printMissingUrlsHint:
        'Sobald K2-Familie- und Admin-Adresse oben geladen sind, erscheinen sie in diesem Kasten.',
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
    printMissingUrlsHint:
      'Sobald Galerie- und Admin-Adresse oben geladen sind, erscheinen sie in diesem Kasten.',
  }
}
