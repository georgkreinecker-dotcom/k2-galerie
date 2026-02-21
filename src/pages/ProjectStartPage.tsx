import { Link, useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getProjectRoutes, type ProjectId } from '../config/navigation'
import { getPageTexts, defaultPageTexts } from '../config/pageTexts'
import DevViewPage from './DevViewPage'

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (window.innerWidth <= 768 && (('ontouchstart' in window) || (navigator.maxTouchPoints ?? 0) > 0))
}

const ROUTE_KEYS: (keyof typeof PROJECT_ROUTES['k2-galerie'])[] = ['galerie', 'controlStudio', 'plan', 'mobileConnect']

function getProjectCards(projectId: ProjectId): Array<{ title: string; description: string; routeKey: keyof typeof PROJECT_ROUTES['k2-galerie']; cta: string }> | null {
  if (projectId !== 'k2-galerie') return null
  let ps = defaultPageTexts.projectStart
  try {
    const config = getPageTexts()
    if (config?.projectStart && Array.isArray(config.projectStart.cards)) ps = config.projectStart
  } catch (_) {}
  return (ps.cards || []).slice(0, 4).map((card, i) => ({
    ...card,
    routeKey: ROUTE_KEYS[i] ?? 'galerie',
  }))
}

export default function ProjectStartPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const routes = projectId && projectId in PROJECT_ROUTES ? getProjectRoutes(projectId as ProjectId) : null
  const cards = projectId ? getProjectCards(projectId as ProjectId) : null
  const [showDevView, setShowDevView] = useState(true)
  let projectTexts = defaultPageTexts.projectStart
  try {
    const config = getPageTexts()
    if (config?.projectStart) projectTexts = config.projectStart
  } catch (_) {}

  // Auf Handy/Tablet: Sofort zur Galerie (niemals Dev-Ansicht/Smart Panel, auch beim Wiederöffnen)
  if (projectId === 'k2-galerie' && routes && isMobileDevice()) {
    return <Navigate to={routes.galerie} replace />
  }

  if (!routes || !cards) {
    return (
      <div className="mission-wrapper">
        <div className="viewport">
          <header>
            <h1>Projekt nicht gefunden</h1>
            <Link to={PLATFORM_ROUTES.projects} className="meta">← Zur Projekt-Übersicht</Link>
          </header>
        </div>
      </div>
    )
  }

  // Auf Mobile: nichts rendern (Redirect läuft); auf Desktop: Dev-View
  if (showDevView && !isMobileDevice()) {
    return <DevViewPage defaultPage="galerie" />
  }
  if (showDevView && isMobileDevice()) {
    return null
  }

  // Fallback: Alte Ansicht (falls benötigt)
  const quickLinks = [
    { label: 'Phase 1', anchor: `${routes.plan}#phase1` },
    { label: 'Phase 2', anchor: `${routes.plan}#phase2` },
    { label: 'Phase 3', anchor: `${routes.plan}#phase3` },
    { label: 'Phase 4', anchor: `${routes.plan}#phase4` },
    { label: 'KI-Agent', anchor: routes.controlStudio },
  ]

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>{routes.name} – {projectTexts.headerTitle}</h1>
            <div className="meta">{projectTexts.headerSubtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={PLATFORM_ROUTES.projects} className="meta">← Projekte</Link>
            <Link to={PLATFORM_ROUTES.home} className="meta">Plattform</Link>
          </div>
        </header>

        <div className="grid">
          {cards.map((card) => (
            <div className="card" key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link className="btn" to={(routes as Record<string, string>)[card.routeKey] ?? routes.galerie}>
                {card.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="quick">
          {quickLinks.map((link) => (
            <Link className="chip" to={link.anchor} key={link.label}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
