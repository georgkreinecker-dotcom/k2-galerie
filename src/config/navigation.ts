/**
 * Zentrale Navigation-Konfiguration
 * Änderungen hier werden automatisch auf allen Seiten übernommen
 */

import { PRODUCT_BRAND_NAME } from './tenantConfig'

/** Einstieg Vertriebs-Plattform (mök2) – eigener Bereich, nur indirekt mit App-Entwicklung verbunden */
export const MOK2_ROUTE = '/mok2'

/** Willkommensseite für Werbung/Flyer: Zugangsbereich (Anmelden / Zur Ansicht / Erster Entwurf) */
export const WILLKOMMEN_ROUTE = '/willkommen'

/** Allgemeine Geschäftsbedingungen – rechtliche Absicherung */
export const AGB_ROUTE = '/agb'

/** Landingpage – 3-Fragen-Flow für neue Künstler:innen */
export const ENTDECKEN_ROUTE = '/entdecken'

/**
 * Root `https://k2-galerie.vercel.app/` (Einladung, QR, Link ohne Pfad) = Besucher-Einstieg → Entdecken.
 * Localhost + Vite-Devserver: `/` bleibt APf (DevView) für Georgs Arbeitsstart am Mac.
 * Produktions-Build auf jeder anderen Origin: immer umleiten (keine Domain-Whitelist – vermeidet „falsche Seite“ bei Alias/Preview).
 */
export function shouldRedirectRootUrlToEntdecken(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const h = window.location.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1') return false
    // npm run dev: bewusst APf auf / (auch bei Zugriff über LAN-IP)
    if (import.meta.env.DEV) return false
    // npm run build (Vercel, Preview, kgm.at, …): Root → Eingangstor
    return true
  } catch {
    return false
  }
}

/**
 * `/projects/k2-galerie` ohne Kennzeichen: auf Vercel/kgm **öffentlicher Einstieg** → nicht APf und nicht direkt K2-Galerie.
 * **APf** nur: localhost (ohne Query → Grafiker-Tisch), oder Query `apf=1` / `dev=1`, siehe ProjectStartPage.
 */
export function shouldShowK2GalerieApfProjectHub(search?: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    const h = window.location.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1') return true
    const sp = new URLSearchParams(search ?? window.location.search)
    if (sp.get('apf') === '1' || sp.get('dev') === '1') return true
    return false
  } catch {
    return false
  }
}

/** Interne Links zur K2-Galerie-APf – immer mit ?apf=1 (sonst Besucher:innen landen auf Entdecken). */
export const K2_GALERIE_APF_EINSTIEG = '/projects/k2-galerie?apf=1' as const

/** SessionStorage-Keys von WillkommenPage: Name + Flag „Erster Entwurf“ (in GalerieVorschauPage musterOnly auslesen) */
export const WILLKOMMEN_NAME_KEY = 'k2-willkommen-name'
export const WILLKOMMEN_ENTWURF_KEY = 'k2-willkommen-entwurf'
/** SessionStorage: Besucher kommt von WillkommenPage oder EntdeckenPage → kein Redirect zur Willkommensseite (ök2/VK2) */
export const WILLKOMMEN_FROM_KEY = 'k2-from-willkommen'

/** Basis-URL der App (für QR/Links auf Flyern – immer Produktion) */
export const BASE_APP_URL = 'https://k2-galerie.vercel.app'

/** Künstler-Einstieg: eigener Zugang zum Admin (Besucher sehen keinen Admin-Button). Optional Passwort. */
export const MEIN_BEREICH_ROUTE = '/mein-bereich'

/** Nur Schreiben an Michael (Begleitschreiben + Einstiegscodes) – eine URL, eine Seite, nichts anderes */
export const PILOT_SCHREIBEN_ROUTE = '/schreiben-michael'

/** Benutzerhandbuch für ök2 (Lizenznehmer:innen, Piloten) – Erste Schritte, Galerie gestalten, Admin, FAQ */
export const BENUTZER_HANDBUCH_ROUTE = '/benutzer-handbuch'
/** Eigenes Handbuch für Vereine (VK2) – Mitglieder, Galerie optional, Kassa, Druck */
export const VK2_HANDBUCH_ROUTE = '/vk2-handbuch'

/** Kreativwerkstatt = K2-Markt-Arbeitsoberfläche (Leitvision, Ablauf, Studio, Tor) – kurze URL für Homepage/Link */
export const KREATIVWERKSTATT_ROUTE = '/kreativwerkstatt'

export const PLATFORM_ROUTES = {
  home: '/',
  projects: '/projects',
  missionControl: '/mission-control',
  key: '/platform/key',
  kosten: '/platform/kosten',
  licences: '/platform/licences',
  dialog: '/platform/dialog',
  githubToken: '/platform/github-token',
} as const

export const PROJECT_ROUTES = {
  'k2-galerie': {
    id: 'k2-galerie',
    name: PRODUCT_BRAND_NAME,
    home: '/projects/k2-galerie',
    seitengestaltung: '/projects/k2-galerie/seitengestaltung',
    galerie: '/projects/k2-galerie/galerie',
    galerieOeffentlich: '/projects/k2-galerie/galerie-oeffentlich',
    galerieOeffentlichVorschau: '/projects/k2-galerie/galerie-oeffentlich-vorschau',
    galerieVorschau: '/projects/k2-galerie/galerie-vorschau',
    shop: '/projects/k2-galerie/shop',
    /** Kassa-Einstieg: Erhalten (Shop) oder Auszahlen (Kassabuch) */
    kassa: '/projects/k2-galerie/kassa',
    /** Kassabuch – Liste, Druck, Export für Steuerberater */
    kassabuch: '/projects/k2-galerie/kassabuch',
    /** Neuer Kassausgang: Bar privat, Bar an Bank, Bar mit Beleg */
    kassabuchAusgang: '/projects/k2-galerie/kassabuch/ausgang',
    /** Buchhaltung – alle buchhaltungsrelevanten Dateien, Zeitraum drucken/versenden */
    buchhaltung: '/projects/k2-galerie/buchhaltung',
    virtuellerRundgang: '/projects/k2-galerie/virtueller-rundgang',
    controlStudio: '/projects/k2-galerie/control-studio',
    kunden: '/projects/k2-galerie/kunden',
    plan: '/projects/k2-galerie/plan',
    /** Einstieg Mission Control / APf-Start (QR, Mobil verbinden) */
    platformStart: '/projects/k2-galerie/mobile-connect',
    mobileConnect: '/projects/k2-galerie/mobile-connect',
    platzanordnung: '/projects/k2-galerie/platzanordnung',
    produktVorschau: '/projects/k2-galerie/produkt-vorschau',
    marketingOek2: '/projects/k2-galerie/marketing-oek2',
    /**
     * Präsentationsmappe (Kurz-URL für Flyer, mök2, Werbeunterlagen).
     * **Standard:** App leitet ohne `?view=kurz` auf `praesentationsmappeVollversion` um → **letztgültige Mappe** = Vollversion (`public/praesentationsmappe-vollversion/`).
     * Nur mit **`?view=kurz`** bleibt die alte einseitige Kurzform (Teal).
     */
    praesentationsmappe: '/projects/k2-galerie/praesentationsmappe',
    /** Präsentationsmappe Vollversion – dieselbe letztgültige Mappe; direkter Einstieg ohne Redirect. */
    praesentationsmappeVollversion: '/projects/k2-galerie/praesentationsmappe-vollversion',
    /** Promo A4 „Essenz“ – eigenständiger Flyer, nicht in der Präsentationsmappe */
    flyerOek2PromoA4: '/projects/k2-galerie/flyer-oek2-promo-a4',
    /** Prospekt K2 Kunst und Keramik – Galerieeröffnung (1 Seite, druckbar) */
    prospektGalerieeroeffnung: '/projects/k2-galerie/prospekt-galerieeroeffnung',
    /** Alias: leitet auf Flyer-Event-Bogen A3-Ableitung (ein Master, keine zweite Plakat-Seite). */
    plakatGalerieeroeffnung: '/projects/k2-galerie/plakat-galerieeroeffnung',
    /** Event-Bogen (Neuaufbau): zwei Flyer pro A4-Seite – K2 Vorderseite + Eingangstor Rückseite */
    flyerEventBogenNeu: '/projects/k2-galerie/flyer-event-bogen-neu',
    /** Nur Schreiben an Michael – gleicher Inhalt wie PILOT_SCHREIBEN_ROUTE, Redirect dorthin */
    pilotStart: '/projects/k2-galerie/pilot-start',
    softwareentwicklung: '/projects/k2-galerie/softwareentwicklung',
    /**
     * APf-only: Promo-Video-Produktion (Arbeitsplatz, Daten aus Mappe, fertiges Video in Stammdaten ök2).
     * Nicht in der öffentlichen Galerie-App eingebunden – Zugriff nur localhost / ?apf=1 / ?dev=1.
     */
    promoVideoProduktion: '/projects/k2-galerie/promo-video-produktion',
    /** APf-only: Runway-Paket ~2 Min – Texte + englische Prompts zum Kopieren */
    promoRunwayPack: '/projects/k2-galerie/promo-runway-pack',
    werbeunterlagen: '/projects/k2-galerie/werbeunterlagen',
    licences: '/projects/k2-galerie/licences',
    /** E-Mail-Einladung Testpilot – Token in URL, vereinfachter Einstieg */
    pilotEinladung: '/projects/k2-galerie/pilot-einladung',
    lizenzKaufen: '/projects/k2-galerie/lizenz-kaufen',
    empfehlungstool: '/projects/k2-galerie/empfehlungstool',
    verguetung: '/projects/k2-galerie/verguetung',
    vitaMartina: '/projects/k2-galerie/vita/martina',
    vitaGeorg: '/projects/k2-galerie/vita/georg',
    /** Große Arbeitsfläche: Texte wie auf dem Schreibtisch (Bereiche + Zettel, kein Listen-Navi) */
    texteSchreibtisch: '/projects/k2-galerie/texte-schreibtisch',
    /** Nur Board-Mitte – eigenes Fenster für 2. Monitor */
    texteSchreibtischBoard: '/projects/k2-galerie/texte-schreibtisch-board',
    /** Georgs persönliche Notizen (Diverses, Briefe, Vermächtnis) – One-Click aus Smart Panel */
    notizen: '/projects/k2-galerie/notizen',
    /** Schreiben an August (technischer Softwarestand, Profi-Blick) */
    notizenAugustSoftwarestand: '/projects/k2-galerie/notizen/schreiben-august-softwarestand',
    notizenBriefAugust: '/projects/k2-galerie/notizen/brief-an-august',
    notizenBriefAndreas: '/projects/k2-galerie/notizen/brief-an-andreas',
    /** Einladung Freunde – Galerieeröffnung 24.–26.04.2026 (Markdown aus public/notizen-georg) */
    notizenEinladungEroeffnung24: '/projects/k2-galerie/notizen/einladung-eroeffnung-24-04',
    /** Board: Lizenznehmer, Empfehler, Abrechnung auf einen Blick (ein Klick zu Details) */
    uebersicht: '/projects/k2-galerie/uebersicht',
    /** Kampagne Marketing-Strategie – eigene Mappe (Zwischenergebnisse, Auftrag, Strategie) */
    kampagneMarketingStrategie: '/projects/k2-galerie/kampagne-marketing-strategie',
    /** K2 Markt – Verweise auf eigenständiges Projekt (siehe PROJECT_ROUTES['k2-markt']) */
    k2Markt: '/projects/k2-markt/mappe',
    k2MarktOberflaeche: '/projects/k2-markt',
    k2MarktTor: '/projects/k2-markt/tor',
  },
  /** K2 Markt – von Beginn an eigenständiges Projekt definiert (wie K2 Familie), nicht Teil von K2 Galerie. Datenquelle: ök2 (mök2, Muster). Homepage = Arbeitsoberfläche; netzfähig wie ök2 und K2 Familie. */
  'k2-markt': {
    id: 'k2-markt',
    name: 'K2 Markt',
    /** Einstieg = Schicht (Quellen → Erzeugen → Tor). Beim Klick auf K2 Markt sofort diese Maske. */
    home: '/projects/k2-markt',
    mappe: '/projects/k2-markt/mappe',
    tor: '/projects/k2-markt/tor',
    /** Die neue Schicht – funktionierend; home zeigt diese Seite. */
    schicht: '/projects/k2-markt/schicht',
    /** Übersicht mit Kacheln (Mappe, Tor, Studio, mök2, …) – von Schicht aus verlinkt */
    uebersicht: '/projects/k2-markt/uebersicht',
  },
  vk2: {
    id: 'vk2',
    name: 'VK2 Vereinsplattform',
    home: '/projects/vk2',
    galerie: '/projects/vk2/galerie',
    galerieVorschau: '/projects/vk2/galerie-vorschau',
    mitgliedLogin: '/vk2-login',
    katalog: '/projects/vk2/katalog',
    kunden: '/projects/vk2/kunden',
    /** Vollversion = Admin-Zugang für Verein; leitet auf Admin mit context=vk2 */
    vollversion: '/projects/vk2/vollversion',
    // Rest: für TypeScript-Kompatibilität (getProjectRoutes); VK2 nutzt nur galerie, galerieVorschau, kunden, vollversion
    galerieOeffentlich: '/projects/k2-galerie/galerie-oeffentlich',
    galerieOeffentlichVorschau: '/projects/k2-galerie/galerie-oeffentlich-vorschau',
    shop: '/projects/k2-galerie/shop',
    virtuellerRundgang: '/projects/k2-galerie/virtueller-rundgang',
    controlStudio: '/projects/k2-galerie/control-studio',
    plan: '/projects/k2-galerie/plan',
    mobileConnect: '/projects/k2-galerie/mobile-connect',
    platzanordnung: '/projects/k2-galerie/platzanordnung',
    produktVorschau: '/projects/k2-galerie/produkt-vorschau',
    marketingOek2: '/projects/k2-galerie/marketing-oek2',
    praesentationsmappe: '/projects/k2-galerie/praesentationsmappe',
    praesentationsmappeVollversion: '/projects/k2-galerie/praesentationsmappe-vollversion',
    /** Promo A4 „Essenz“ – eigenständiger Flyer, nicht in der Präsentationsmappe */
    flyerOek2PromoA4: '/projects/k2-galerie/flyer-oek2-promo-a4',
    prospektGalerieeroeffnung: '/projects/k2-galerie/prospekt-galerieeroeffnung',
    plakatGalerieeroeffnung: '/projects/k2-galerie/plakat-galerieeroeffnung',
    flyerEventBogenNeu: '/projects/k2-galerie/flyer-event-bogen-neu',
    werbeunterlagen: '/projects/k2-galerie/werbeunterlagen',
    promoVideoProduktion: '/projects/k2-galerie/promo-video-produktion',
    promoRunwayPack: '/projects/k2-galerie/promo-runway-pack',
    licences: '/projects/k2-galerie/licences',
    /** E-Mail-Einladung Testpilot – Token in URL, vereinfachter Einstieg */
    pilotEinladung: '/projects/k2-galerie/pilot-einladung',
    lizenzKaufen: '/projects/k2-galerie/lizenz-kaufen',
    empfehlungstool: '/projects/k2-galerie/empfehlungstool',
    verguetung: '/projects/k2-galerie/verguetung',
    vitaMartina: '/projects/k2-galerie/vita/martina',
    vitaGeorg: '/projects/k2-galerie/vita/georg',
    notizen: '/projects/k2-galerie/notizen',
    uebersicht: '/projects/k2-galerie/uebersicht',
    kampagneMarketingStrategie: '/projects/k2-galerie/kampagne-marketing-strategie',
    k2Markt: '/projects/k2-markt/mappe',
  },
  'k2-familie': {
    id: 'k2-familie',
    name: 'K2 Familie',
    home: '/projects/k2-familie',
    uebersicht: '/projects/k2-familie/uebersicht',
    stammbaum: '/projects/k2-familie/stammbaum',
    grundstruktur: '/projects/k2-familie/grundstruktur',
    personen: '/projects/k2-familie/personen',
    events: '/projects/k2-familie/events',
    kalender: '/projects/k2-familie/kalender',
    geschichte: '/projects/k2-familie/geschichte',
    gedenkort: '/projects/k2-familie/gedenkort',
    handbuch: '/projects/k2-familie/handbuch',
    sicherung: '/projects/k2-familie/sicherung',
    galerie: '/projects/k2-familie',
    galerieOeffentlich: '/projects/k2-galerie/galerie-oeffentlich',
    galerieOeffentlichVorschau: '/projects/k2-galerie/galerie-oeffentlich-vorschau',
    galerieVorschau: '/projects/k2-galerie/galerie-vorschau',
    shop: '/projects/k2-galerie/shop',
    virtuellerRundgang: '/projects/k2-galerie/virtueller-rundgang',
    controlStudio: '/projects/k2-galerie/control-studio',
    plan: '/projects/k2-galerie/plan',
    mobileConnect: '/projects/k2-galerie/mobile-connect',
    platzanordnung: '/projects/k2-galerie/platzanordnung',
    produktVorschau: '/projects/k2-galerie/produkt-vorschau',
    marketingOek2: '/projects/k2-galerie/marketing-oek2',
    praesentationsmappe: '/projects/k2-galerie/praesentationsmappe',
    praesentationsmappeVollversion: '/projects/k2-galerie/praesentationsmappe-vollversion',
    /** Promo A4 „Essenz“ – eigenständiger Flyer, nicht in der Präsentationsmappe */
    flyerOek2PromoA4: '/projects/k2-galerie/flyer-oek2-promo-a4',
    prospektGalerieeroeffnung: '/projects/k2-galerie/prospekt-galerieeroeffnung',
    plakatGalerieeroeffnung: '/projects/k2-galerie/plakat-galerieeroeffnung',
    flyerEventBogenNeu: '/projects/k2-galerie/flyer-event-bogen-neu',
    pilotStart: '/projects/k2-galerie/pilot-start',
    softwareentwicklung: '/projects/k2-galerie/softwareentwicklung',
    werbeunterlagen: '/projects/k2-galerie/werbeunterlagen',
    promoVideoProduktion: '/projects/k2-galerie/promo-video-produktion',
    promoRunwayPack: '/projects/k2-galerie/promo-runway-pack',
    licences: '/projects/k2-galerie/licences',
    /** E-Mail-Einladung Testpilot – Token in URL, vereinfachter Einstieg */
    pilotEinladung: '/projects/k2-galerie/pilot-einladung',
    lizenzKaufen: '/projects/k2-galerie/lizenz-kaufen',
    empfehlungstool: '/projects/k2-galerie/empfehlungstool',
    verguetung: '/projects/k2-galerie/verguetung',
    vitaMartina: '/projects/k2-galerie/vita/martina',
    vitaGeorg: '/projects/k2-galerie/vita/georg',
    notizen: '/projects/k2-galerie/notizen',
    seitengestaltung: '/projects/k2-galerie/seitengestaltung',
    kunden: '/projects/k2-galerie/kunden',
    kampagneMarketingStrategie: '/projects/k2-galerie/kampagne-marketing-strategie',
    k2Markt: '/projects/k2-markt/mappe',
    k2MarktOberflaeche: '/projects/k2-markt',
    k2MarktTor: '/projects/k2-markt/tor',
  },
} as const

/** Kontext für Flyer-Event-Bogen: ein Weg – Master A5 + Ableitungen nur aus demselben Muster. */
export type FlyerEventBogenTenantContext = 'k2' | 'oeffentlich' | 'vk2'

/**
 * Einheitliche URL zum Event-Flyer (Master A5 auf einer A4-Übersicht, Variant 2) und zu Ableitungen A3/A6/Karte.
 * Nicht mit mök2-Werbetexten mischen – Inhalte kommen aus Muster-Galerie / Event / Stammdaten je Kontext.
 */
export function flyerEventBogenUrl(params: {
  mode?: 'a3' | 'a6' | 'card'
  tenant?: FlyerEventBogenTenantContext
  /** Aus Admin/Marketing: gleiches Event wie auf der Karte (sonst nur Eröffnungs-Heuristik). */
  eventId?: string | number | null | undefined
  /**
   * Von Galerie „Aktuelles“ (öffentlich): bleibt in URL für A3/A6/Karte; Flyer-Seite nutzt ihn für
   * „Zurück zur Galerie“ statt Werbeunterlagen, und bei blockiertem Pop-up: gleicher Tab.
   */
  fromPublicGalerie?: boolean
  /**
   * Aus Admin (Eventplan, Öffentlichkeitsarbeit): A3/A6/Karte = dieselbe schlanke Ableitungs-Vorschau
   * wie von der Galerie (ohne Flyer-Master-Werkzeugleiste). Kein k2PlakatEmbed (nur Galerie-iframe).
   */
  fromAdminDerivation?: boolean
}): string {
  const base = PROJECT_ROUTES['k2-galerie'].flyerEventBogenNeu
  const q = new URLSearchParams()
  const t = params.tenant ?? 'k2'
  if (t === 'oeffentlich') q.set('context', 'oeffentlich')
  else if (t === 'vk2') q.set('context', 'vk2')
  else q.set('context', 'k2')
  q.set('layout', 'variant2')
  if (params.mode) q.set('mode', params.mode)
  const eid = params.eventId != null ? String(params.eventId).trim() : ''
  if (eid) q.set('eventId', eid)
  if (params.fromPublicGalerie) {
    q.set('from', 'publicGalerie')
    /** Gleiche Origin im iframe (Galerie-Overlay): main.tsx lädt sonst nur den Vorschau-Hinweis. */
    q.set('k2PlakatEmbed', '1')
  } else if (params.fromAdminDerivation && params.mode) {
    q.set('from', 'adminFlyerDerivation')
  }
  return `${base}?${q.toString()}`
}

/**
 * **Eingangstor** für neue User / Fremde (Georg): immer **`/entdecken`** (EntdeckenPage –
 * Hero mit Werbelinie, „Jetzt entdecken“, Tor-Bild, 3-Fragen-Flow → ök2-Demo).
 * Technisch: **Basis-URL** ohne Pfad (`/`) leitet auf `ENTDECKEN_ROUTE` (gleiche Seite).
 * In fremden Galerien nur sanfter Hinweis über **kgm solution** (Link); Ziel = diese Route, nicht direkt `galerie-oeffentlich`.
 */
export const OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE = ENTDECKEN_ROUTE

export type ProjectId = keyof typeof PROJECT_ROUTES

/**
 * Helper: Gibt die Routen für ein Projekt zurück
 */
export function getProjectRoutes(projectId: ProjectId) {
  return PROJECT_ROUTES[projectId]
}

/**
 * Helper: Gibt alle Projekt-IDs zurück
 */
export function getAllProjectIds(): ProjectId[] {
  return Object.keys(PROJECT_ROUTES) as ProjectId[]
}

/**
 * Navigation-Labels für Breadcrumbs/Back-Links
 */
export const NAV_LABELS = {
  platform: 'Plattform',
  projects: 'Projekte',
  projectStart: 'Projekt-Start',
  back: '← Zurück',
} as const
