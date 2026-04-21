/**
 * K2 Familie – Präsentationsmappe für Kund:innen (Lesefassung, Druck, Übergeben).
 * Inhalt: public/k2-familie-praesentation-mappe/ – ohne interne Vertriebs-Repo-Verweise.
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'

/** QR im Kontakt-Kapitel: Einstieg Musterfamilie Huber (wie Capture-Skript, Demo). */
const MUSTERFAMILIE_EINSTIEG_QR_URL = `${BASE_APP_URL}/projects/k2-familie/einstieg?t=huber`
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
    name: 'Kontakt',
    file: '06-KONTAKT-UND-NAECHSTER-SCHRITT.md',
  },
  {
    id: '07-technik',
    name: 'Technik in Kürze',
    file: '07-TECHNIK-IN-KUERZE.md',
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
      headerSubtitle="Versprechen, Produktüberblick, Nutzen, Vertrauen, Beispielansichten, Kontakt, Technik in Kürze."
      printHintFolder="public/k2-familie-praesentation-mappe/"
      deckblattTop="K2 Familie"
      deckblattKernsatz={PRODUCT_K2_FAMILIE_WERBESLOGAN_ZUSATZ}
      deckblattSlogan={PRODUCT_K2_FAMILIE_WERBESLOGAN}
      deckblattMainTitle=""
      deckblattFooterProduct="K2 Familie"
      deckblattFooterKind=""
      deckblattFooterTagline=""
      footerPreviewLine="K2 Familie – Präsentationsmappe"
      printCurrentDocPrefix="K2 Familie – Präsentationsmappe"
      defaultDocWhenNoParam="01-DECKBLATT-UND-VERSPRECHEN.md"
      deckblattTealCover
      deckblattCoverImageSrc="/img/k2-familie/pm-deckblatt-musterfamilie-home.png"
      deckblattCoverAlt="K2 Familie Startseite, Musterfamilie Huber – Navigation, Willkommensbereich und Kacheln Was möchtest du tun"
      deckblattCoverCaption="Musterfamilie Huber – Startseite (Demo, keine echten Kundendaten)."
      prominentEingangstorQr
      kontaktChapterQrAbsUrl={MUSTERFAMILIE_EINSTIEG_QR_URL}
    />
  )
}
