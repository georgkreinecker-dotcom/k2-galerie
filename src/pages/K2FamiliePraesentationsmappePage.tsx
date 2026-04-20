/**
 * K2 Familie – Kurzprospekt / Vertrieb (Lesefassung).
 * Inhalt: public/k2-familie-praesentation/ – eigenständig zur Galerie-Präsentationsmappe.
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_K2_FAMILIE_WERBELINIE_DECKBLATT } from '../config/tenantConfig'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  {
    id: '00-einstiegsadressen',
    name: 'Einstiegsadressen – Prospekte, Postings, QR',
    file: '00-EINSTIEGSADRESSEN.md',
  },
  {
    id: '01-kurzbotschaft-post-flyer',
    name: 'Kurzbotschaft Post/Flyer (ohne URLs)',
    file: '01-KURZBOTSCHAFT-POST-FLYER.md',
  },
  {
    id: '01-flyer-kurzprospekt',
    name: 'Flyer – Kurzprospekt Verkaufsargumentation',
    file: '01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md',
  },
  { id: '02-prospekt-produkt', name: 'Prospekt – Produktinformation', file: '02-PROSPEKT-PRODUKTINFORMATION.md' },
  {
    id: '03-produktfeatures',
    name: 'Produktfeatures – Überblick für Vertrieb',
    file: '03-K2-FAMILIE-PRODUKTFEATURES.md',
  },
  { id: '04-faq-einwaende', name: 'FAQ und Einwände', file: '04-FAQ-UND-EINWAENDE-VERTIEB.md' },
  {
    id: '05-lizenz-kuendigung',
    name: 'Lizenz, Kündigung, Daten',
    file: '05-LIZENZ-KUENDIGUNG-DATEN-VERTIEB.md',
  },
  {
    id: '06-nach-lizenz',
    name: 'Nach der Lizenz – erste Schritte',
    file: '06-NACH-DER-LIZENZ-ERSTE-SCHRITTE.md',
  },
  { id: '07-multiplikatoren', name: 'Multiplikatoren und B2B', file: '07-MULTIPLIKATOREN-B2B.md' },
  { id: '08-wettbewerb', name: 'Wettbewerb und Einordnung', file: '08-WETTBEWERB-EINORDNUNG.md' },
  { id: '09-medien', name: 'Medien und Erweiterung', file: '09-MEDIEN-UND-ERWEITERUNG.md' },
  {
    id: '10-huber-drehbuch',
    name: 'Huber-Muster-Rundgang – Drehbuch',
    file: '10-HUBER-MUSTER-RUNDGANG-DREHBUCH.md',
  },
] as const

const ROUTE_BACK = '/projects/k2-familie/praesentationsmappe'

export default function K2FamiliePraesentationsmappePage() {
  return (
    <BenutzerHandbuchViewer
      handbuchBase="/k2-familie-praesentation"
      documents={DOCUMENTS}
      fallbackRoute={PROJECT_ROUTES['k2-familie'].meineFamilie}
      routePathForBack={ROUTE_BACK}
      headerTitle="📄 K2 Familie – Vertriebsunterlagen"
      headerSubtitle="Vollständige Mappe: Flyer, Prospekt, Features, FAQ, Lizenz/Kündigung, erste Schritte, B2B, Wettbewerb, Medien-Rahmen. Lesen und Drucken."
      printHintFolder="public/k2-familie-praesentation/"
      deckblattTop="K2 Familie"
      deckblattSlogan={PRODUCT_K2_FAMILIE_WERBELINIE_DECKBLATT}
      deckblattMainTitle="Vertriebsunterlagen"
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind="Zwölf Kapitel · Inhaltsverzeichnis"
      deckblattFooterTagline="Flyer · Prospekt · Features · FAQ · Lizenz · Onboarding · B2B · Markt · Medien · Drehbuch"
      footerPreviewLine="K2 Familie – Vertriebsunterlagen · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Familie – Vertriebsunterlagen"
      defaultDocWhenNoParam="01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md"
    />
  )
}
