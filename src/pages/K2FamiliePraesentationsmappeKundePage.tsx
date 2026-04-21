/**
 * K2 Familie – Präsentationsmappe für Kund:innen (Lesefassung, Druck, Übergeben).
 * Inhalt: public/k2-familie-praesentation-mappe/ – ohne interne Vertriebs-Repo-Verweise.
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  PRODUCT_K2_FAMILIE_WERBESLOGAN,
  PRODUCT_K2_FAMILIE_WERBESLOGAN_ZUSATZ,
} from '../config/tenantConfig'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  {
    id: '01-deckblatt',
    name: 'Versprechen',
    file: '01-DECKBLATT-UND-VERSPRECHEN.md',
  },
  { id: '02-was-ist', name: 'Was ist K2 Familie?', file: '02-WAS-IST-K2-FAMILIE.md' },
  { id: '03-nutzen', name: 'Ihr Nutzen', file: '03-IHR-NUTZEN.md' },
  {
    id: '04-vertrauen',
    name: 'Vertrauen und Abgrenzung',
    file: '04-VERTRAUEN-UND-ABGRENZUNG.md',
  },
  {
    id: '05-bilder',
    name: 'So sieht es aus',
    file: '05-SO-SIEHT-DAS-AUS-BILDER.md',
  },
  {
    id: '06-kontakt',
    name: 'Kontakt und nächster Schritt',
    file: '06-KONTAKT-UND-NAECHSTER-SCHRITT.md',
  },
] as const

const ROUTE_BACK = '/projects/k2-familie/praesentationsmappe-kunde'

export default function K2FamiliePraesentationsmappeKundePage() {
  return (
    <BenutzerHandbuchViewer
      handbuchBase="/k2-familie-praesentation-mappe"
      documents={DOCUMENTS}
      fallbackRoute={PROJECT_ROUTES['k2-familie'].willkommen}
      routePathForBack={ROUTE_BACK}
      headerTitle="📘 K2 Familie – Präsentationsmappe"
      headerSubtitle="Zum Lesen, Drucken und Übergeben – Versprechen, Nutzen, Vertrauen, Screenshots aus der Musterfamilie, Kontakt."
      printHintFolder="public/k2-familie-praesentation-mappe/"
      deckblattTop="K2 Familie"
      deckblattKernsatz={PRODUCT_K2_FAMILIE_WERBESLOGAN_ZUSATZ}
      deckblattSlogan={PRODUCT_K2_FAMILIE_WERBESLOGAN}
      deckblattMainTitle="Präsentationsmappe"
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind="Sieben Kapitel · Inhaltsverzeichnis"
      deckblattFooterTagline="Versprechen · Produkt · Nutzen · Vertrauen · Bilder · Kontakt"
      footerPreviewLine="K2 Familie – Präsentationsmappe · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Familie – Präsentationsmappe"
      defaultDocWhenNoParam="01-DECKBLATT-UND-VERSPRECHEN.md"
      deckblattCoverImageSrc="/img/k2-familie/pm-familie-einstieg.png"
      deckblattCoverAlt="Eingang K2 Familie – Musterfamilie Huber, Übersicht"
      deckblattCoverCaption="Deckblatt: Eingangsseite in der App (Musterfamilie Huber) – eine Druckseite im Format A4."
    />
  )
}
