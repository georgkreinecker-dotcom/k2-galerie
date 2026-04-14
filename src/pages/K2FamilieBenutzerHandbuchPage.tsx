/**
 * Benutzerhandbuch nur für K2 Familie (eine Quelle: public/k2-familie-handbuch/).
 * Kein Bezug zu anderen Produkten – Inhalte ausschließlich K2 Familie.
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '01-erste-schritte', name: 'Erste Schritte', file: '01-ERSTE-SCHRITTE.md' },
  { id: '02-k2-familie-inhaber', name: 'K2 Familie – Rolle Inhaber:in', file: '02-K2-FAMILIE-INHABER-ROLLE.md' },
  { id: '03-k2-familie-bearbeiter-leser', name: 'K2 Familie – Bearbeiter und Leser', file: '03-K2-FAMILIE-BEARBEITER-UND-LESER.md' },
] as const

export default function K2FamilieBenutzerHandbuchPage() {
  return (
    <BenutzerHandbuchViewer
      handbuchBase="/k2-familie-handbuch"
      documents={DOCUMENTS}
      fallbackRoute={PROJECT_ROUTES['k2-familie'].meineFamilie}
      routePathForBack="/k2-familie-handbuch"
      headerTitle="📖 Benutzerhandbuch K2 Familie"
      headerSubtitle="Eigenständiges Handbuch – Familie, Stammbaum, Rollen, Momente. Kapitel Inhaber:in sowie Bearbeiter und Leser."
      printHintFolder="public/k2-familie-handbuch/"
      deckblattTop="K2 Familie"
      deckblattSlogan="Ein Raum für eure Geschichte – vernetzt, respektvoll, bei euch."
      deckblattMainTitle="Familie sichtbar machen"
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind="Benutzerhandbuch"
      deckblattFooterTagline="Zum Lesen und Drucken · Daten bleiben in eurem Mandantenraum"
      footerPreviewLine="K2 Familie – Benutzerhandbuch · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Familie – Benutzerhandbuch"
      defaultDocWhenNoParam="02-K2-FAMILIE-INHABER-ROLLE.md"
    />
  )
}
