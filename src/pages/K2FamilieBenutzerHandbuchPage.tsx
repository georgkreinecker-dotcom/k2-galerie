/** Benutzerhandbuch K2 Familie – Inhalte unter public/k2-familie-handbuch/ */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '01-erste-schritte', name: 'Erste Schritte', file: '01-ERSTE-SCHRITTE.md' },
  { id: '02-personenkarte', name: 'Die Personenkarte', file: '02-DIE-PERSONENKARTE.md' },
  { id: '03-k2-familie-inhaber', name: 'K2 Familie – Rolle Inhaber:in', file: '03-K2-FAMILIE-INHABER-ROLLE.md' },
  { id: '04-k2-familie-bearbeiter-leser', name: 'K2 Familie – Bearbeiter und Leser', file: '04-K2-FAMILIE-BEARBEITER-UND-LESER.md' },
  { id: '05-stammbaum-funktionen', name: 'Stammbaum – Funktionen', file: '05-STAMMBAUM-FUNKTIONEN.md' },
  {
    id: '06-events-geschichte-gedenkort-einstellungen',
    name: 'Events, Geschichte, Gedenkort, Einstellungen',
    file: '06-EVENTS-GESCHICHTE-GEDENKORT-EINSTELLUNGEN.md',
  },
  { id: '07-grafik-und-druck', name: 'Grafik und Druck', file: '07-GRAFIK-UND-DRUCK.md' },
  { id: '08-lizenz-kuendigung', name: 'Lizenz und Kündigung', file: '08-LIZENZ-UND-KUENDIGUNG.md' },
] as const

export default function K2FamilieBenutzerHandbuchPage() {
  return (
    <BenutzerHandbuchViewer
      handbuchBase="/k2-familie-handbuch"
      documents={DOCUMENTS}
      fallbackRoute={PROJECT_ROUTES['k2-familie'].meineFamilie}
      routePathForBack="/k2-familie-handbuch"
      headerTitle="📖 Benutzerhandbuch K2 Familie"
      headerSubtitle="Personenkarte, Stammbaum, Grafik, Druck, Events, Geschichte, Gedenkort, Einstellungen, Rollen."
      printHintFolder="public/k2-familie-handbuch/"
      deckblattTop="K2 Familie"
      deckblattSlogan="Ein Raum für eure Geschichte – vernetzt, respektvoll, bei euch."
      deckblattMainTitle="Familie sichtbar machen"
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind="Benutzerhandbuch"
      deckblattFooterTagline="Zum Lesen und Drucken · Daten bleiben in eurem Mandantenraum"
      footerPreviewLine="K2 Familie – Benutzerhandbuch · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Familie – Benutzerhandbuch"
      defaultDocWhenNoParam="02-DIE-PERSONENKARTE.md"
    />
  )
}
