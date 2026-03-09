/**
 * Anzeige der Projekte im Projektordner (Projekte-Seite).
 *
 * Regel: Alle neuen Projekte hier ablegen, jedes mit einer anderen Farbe.
 * - Neue Projekte: in navigation.ts PROJECT_ROUTES eintragen, hier in PROJECT_COLORS eine Farbe vergeben.
 * - Zusatzeinträge (z. B. „Öffentliche K2 Galerie“): in extraCards in getProjectCards() ergänzen.
 */

import { PROJECT_ROUTES, getAllProjectIds, type ProjectId } from './navigation'

/** Farben pro Projekt – jedes Projekt eindeutig */
export const PROJECT_COLORS: Record<string, string> = {
  'k2-galerie': '#5ffbf1',
  'k2-galerie-oeffentlich': '#b8b8ff',
  vk2: '#e67a2a', // K2-Familie: Orange (Hausherr) – VK2 = Mieter nutzt K2-Design
  'k2-familie': '#0d9488', // Türkis/Grün – Familie, Wachstum, Verbindung
  'k2-markt': '#22c55e', // Grün – K2 Markt (eigenständig, Datenquelle ök2)
}

/** Fallback-Palette für Projekte ohne Eintrag in PROJECT_COLORS */
const PROJECT_PALETTE = [
  '#5ffbf1', // Cyan
  '#b8b8ff', // Lavender
  '#22c55e', // Grün
  '#eab308', // Gelb
  '#f5576c', // Pink
  '#33a1ff', // Blau
  '#a855f7', // Violett
]

export interface ProjectCard {
  id: string
  title: string
  description: string
  to: string
  color: string
  status: 'in-progress' | 'planned'
}

/** Alle Projekt-Karten für die Projekte-Seite (aus Navigation + feste Zusatzeinträge) */
export function getProjectCards(): ProjectCard[] {
  const ids = getAllProjectIds()
  const cards: ProjectCard[] = ids.map((id, index) => {
    const route = PROJECT_ROUTES[id]
    const color = PROJECT_COLORS[id] ?? PROJECT_PALETTE[index % PROJECT_PALETTE.length]
    // VK2: direkt zur Galerie (nicht home), damit man nicht auf K2 landet. K2-Markt hat nur home.
    const to = id === 'vk2' && 'galerie' in route ? route.galerie : route.home
    return {
      id: `${id}-projekt`,
      title: route.name,
      description: getDefaultDescription(id),
      to,
      color,
      status: 'in-progress',
    }
  })

  // Zusatzeinträge
  const extraCards: ProjectCard[] = [
    {
      id: 'k2-galerie-seitengestaltung',
      title: '🎨 Seitengestaltung',
      description: 'Live-Vorschau: Galerie-Seiten direkt ansehen und besprechen.',
      to: PROJECT_ROUTES['k2-galerie'].seitengestaltung,
      color: '#ff8c42',
      status: 'in-progress',
    },
    {
      id: 'k2-galerie-oeffentlich',
      title: 'Öffentliche Galerie K2',
      description: 'Öffentliche Ansicht der K2 Galerie.',
      to: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich,
      color: PROJECT_COLORS['k2-galerie-oeffentlich'] ?? PROJECT_PALETTE[1],
      status: 'in-progress',
    },
  ]

  return [...cards, ...extraCards]
}

function getDefaultDescription(projectId: ProjectId): string {
  const descriptions: Partial<Record<ProjectId, string>> = {
    'k2-galerie': 'Projekt-Start, Control-Studio, Plan, Mobile-Connect – Steuerung und Inhalte.',
    vk2: 'Vereinsplattform – Künstler:innen, Mitglieder, Admin.',
    'k2-familie': 'Familienstammbaum modern – jeder sichtbar, vernetzt, mit eigener Seite. Raumschiff.',
    'k2-markt': 'Eigenständiges Projekt. Datenquelle: ök2. Homepage = Arbeitsoberfläche (Leitvision, Ablauf, Studio, Tor) – manuell arbeiten; netzfähig.',
  }
  return descriptions[projectId] ?? 'Projekt öffnen.'
}
