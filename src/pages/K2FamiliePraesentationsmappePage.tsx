/**
 * K2 Familie – Kurzprospekt / Vertrieb (Lesefassung).
 * Inhalt: public/k2-familie-praesentation/ – eigenständig zur Galerie-Präsentationsmappe.
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  {
    id: '01-flyer-kurzprospekt',
    name: 'Flyer – Kurzprospekt Verkaufsargumentation',
    file: '01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md',
  },
  { id: '02-prospekt-produkt', name: 'Prospekt – Produktinformation', file: '02-PROSPEKT-PRODUKTINFORMATION.md' },
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
      headerSubtitle="Kurzprospekt (Flyer) und Produktprospekt – Verkaufsargumentation, Module, Vertrauen. Lesen und Drucken."
      printHintFolder="public/k2-familie-praesentation/"
      deckblattTop="K2 Familie"
      deckblattSlogan="Privater Familienraum – Daten bei euch, Respekt in der Form."
      deckblattMainTitle="Vertriebsunterlagen"
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind="Kurzprospekt & Prospekt"
      deckblattFooterTagline="Werbetext · Produktinformation · getrennt von Galerie-Werbung"
      footerPreviewLine="K2 Familie – Vertriebsunterlagen · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Familie – Vertriebsunterlagen"
      defaultDocWhenNoParam="01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md"
    />
  )
}
