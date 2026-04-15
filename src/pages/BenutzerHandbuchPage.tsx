/**
 * Benutzerhandbuch für ök2 und VK2 – für unsere User (Lizenznehmer:innen, Piloten, Vereine).
 * Quelle: public/benutzer-handbuch/*.md
 */

import BenutzerHandbuchViewer from '../components/BenutzerHandbuchViewer'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '01-erste-schritte', name: 'Erste Schritte', file: '01-ERSTE-SCHRITTE.md' },
  { id: '03-admin', name: 'Admin im Überblick', file: '03-ADMIN-UEBERBLICK.md' },
  { id: '02-galerie', name: 'Galerie gestalten, Werke anlegen', file: '02-GALERIE-GESTALTEN.md' },
  { id: '07-eventplanung', name: 'Eventplanung & Öffentlichkeitsarbeit', file: '07-EVENTPLANUNG-WERBUNG-OEFFENTLICHKEITSARBEIT.md' },
  { id: '05-vk2', name: 'Vereinsplattform', file: '05-VK2-VEREINSPLATTFORM.md' },
  { id: '06-oek2', name: 'Demo und Lizenz', file: '06-OEK2-DEMO-LIZENZ.md' },
  { id: '11-statistik-werkkatalog', name: 'Statistik und Werkkatalog', file: '11-STATISTIK-WERKKATALOG.md' },
  { id: '08-kassa-buchhaltung', name: 'Kassa und Buchhaltung', file: '08-KASSA-BUCHHALTUNG.md' },
  { id: '12-shop-internet', name: 'Shop und Internetbestellung', file: '12-SHOP-INTERNET-BESTELLUNG.md' },
  { id: '10-einstellungen', name: 'Einstellungen', file: '10-EINSTELLUNGEN.md' },
  { id: '13-k2-familie-inhaber', name: 'K2 Familie – Rolle Inhaber:in', file: '13-K2-FAMILIE-INHABER-ROLLE.md' },
  { id: '14-k2-familie-bearbeiter-leser', name: 'K2 Familie – Bearbeiter und Leser', file: '14-K2-FAMILIE-BEARBEITER-UND-LESER.md' },
  { id: '15-k2-familie-lizenz', name: 'K2 Familie – Lizenz und Kündigung', file: '15-K2-FAMILIE-LIZENZ.md' },
  { id: '04-faq', name: 'Häufige Fragen', file: '04-HAEUFIGE-FRAGEN.md' },
] as const

export default function BenutzerHandbuchPage() {
  return (
    <BenutzerHandbuchViewer
      handbuchBase="/benutzer-handbuch"
      documents={DOCUMENTS}
      fallbackRoute={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich}
      routePathForBack="/benutzer-handbuch"
      headerTitle="📖 Benutzerhandbuch"
      headerSubtitle="K2 Galerie – für Galerien und Vereine. Leicht verständlich, zum Lesen und Drucken."
      printHintFolder="public/benutzer-handbuch/"
      deckblattTop="K2 Galerie"
      deckblattSlogan={PRODUCT_WERBESLOGAN}
      deckblattMainTitle={PRODUCT_WERBESLOGAN_2}
      deckblattFooterProduct="K2 Galerie"
      deckblattFooterKind="Benutzerhandbuch"
      deckblattFooterTagline="Für Galerien und Vereine · Leicht verständlich, zum Lesen und Drucken"
      footerPreviewLine="K2 Galerie – Benutzerhandbuch · (Seitenzahlen beim Drucken)"
      printCurrentDocPrefix="K2 Galerie – Benutzerhandbuch"
    />
  )
}
