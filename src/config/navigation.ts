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

/** SessionStorage-Keys von WillkommenPage: Name + Flag „Erster Entwurf“ (in GalerieVorschauPage musterOnly auslesen) */
export const WILLKOMMEN_NAME_KEY = 'k2-willkommen-name'
export const WILLKOMMEN_ENTWURF_KEY = 'k2-willkommen-entwurf'

/** Basis-URL der App (für QR/Links auf Flyern – immer Produktion) */
export const BASE_APP_URL = 'https://k2-galerie.vercel.app'

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
    virtuellerRundgang: '/projects/k2-galerie/virtueller-rundgang',
    controlStudio: '/projects/k2-galerie/control-studio',
    kunden: '/projects/k2-galerie/kunden',
    plan: '/projects/k2-galerie/plan',
    mobileConnect: '/projects/k2-galerie/mobile-connect',
    platzanordnung: '/projects/k2-galerie/platzanordnung',
    produktVorschau: '/projects/k2-galerie/produkt-vorschau',
    marketingOek2: '/projects/k2-galerie/marketing-oek2',
    werbeunterlagen: '/projects/k2-galerie/werbeunterlagen',
    licences: '/projects/k2-galerie/licences',
    empfehlungstool: '/projects/k2-galerie/empfehlungstool',
    verguetung: '/projects/k2-galerie/verguetung',
    vitaMartina: '/projects/k2-galerie/vita/martina',
    vitaGeorg: '/projects/k2-galerie/vita/georg',
  },
  vk2: {
    id: 'vk2',
    name: 'VK2 Vereinsplattform',
    home: '/projects/vk2',
    galerie: '/projects/vk2/galerie',
    galerieVorschau: '/projects/vk2/galerie-vorschau',
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
    werbeunterlagen: '/projects/k2-galerie/werbeunterlagen',
    licences: '/projects/k2-galerie/licences',
    empfehlungstool: '/projects/k2-galerie/empfehlungstool',
    verguetung: '/projects/k2-galerie/verguetung',
    vitaMartina: '/projects/k2-galerie/vita/martina',
    vitaGeorg: '/projects/k2-galerie/vita/georg',
  },
  // Weitere Projekte hier hinzufügen:
  // 'projekt-2': {
  //   id: 'projekt-2',
  //   name: 'Projekt 2',
  //   home: '/projects/projekt-2',
  //   ...
  // },
} as const

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
