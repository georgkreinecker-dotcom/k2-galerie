/**
 * Zentrale Navigation-Konfiguration
 * Änderungen hier werden automatisch auf allen Seiten übernommen
 */

export const PLATFORM_ROUTES = {
  home: '/',
  projects: '/projects',
  missionControl: '/mission-control',
  key: '/platform/key',
  kosten: '/platform/kosten',
  dialog: '/platform/dialog',
} as const

export const PROJECT_ROUTES = {
  'k2-galerie': {
    id: 'k2-galerie',
    name: 'K2 Galerie',
    home: '/projects/k2-galerie',
    galerie: '/projects/k2-galerie/galerie',
    galerieVorschau: '/projects/k2-galerie/galerie-vorschau',
    shop: '/projects/k2-galerie/shop',
    virtuellerRundgang: '/projects/k2-galerie/virtueller-rundgang',
    controlStudio: '/projects/k2-galerie/control-studio',
    plan: '/projects/k2-galerie/plan',
    mobileConnect: '/projects/k2-galerie/mobile-connect',
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
