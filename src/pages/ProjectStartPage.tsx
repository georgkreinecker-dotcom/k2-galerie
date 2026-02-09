import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getProjectRoutes, type ProjectId } from '../config/navigation'
import DevViewPage from './DevViewPage'

const projectCards: Record<ProjectId, Array<{ title: string; description: string; routeKey: keyof typeof PROJECT_ROUTES['k2-galerie']; cta: string }>> = {
  'k2-galerie': [
    {
      title: 'Galerie',
      description: 'Öffentliche K2 Galerie – Kunst & Keramik, Eröffnung, Werke.',
      routeKey: 'galerie',
      cta: 'Öffnen →',
    },
    {
      title: 'Control-Studio',
      description: 'Komplettes Kommandozentrum inkl. KI-Agent, Launch-Plan und Aufgabenfeldern.',
      routeKey: 'controlStudio',
      cta: 'Starten →',
    },
    {
      title: 'Projektplan',
      description: 'Projekt-spezifische Planung mit Phasen, Aufgaben & Timeline.',
      routeKey: 'plan',
      cta: 'Öffnen →',
    },
    {
      title: 'Mobile-Connect',
      description: 'QR-Hub für iPhone/iPad, damit die Galerie wie eine App läuft.',
      routeKey: 'mobileConnect',
      cta: 'Zu Mobile →',
    },
  ],
}

export default function ProjectStartPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const routes = projectId && projectId in PROJECT_ROUTES ? getProjectRoutes(projectId as ProjectId) : null
  const cards = projectId && projectId in projectCards ? projectCards[projectId as ProjectId] : null
  const [showDevView, setShowDevView] = useState(true)

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

  // Dev-View Tool ist Standardansicht für Projektbearbeitung
  if (showDevView) {
    return <DevViewPage defaultPage="galerie" />
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
            <h1>{routes.name} – Mission Deck</h1>
            <div className="meta">Direkter Zugriff auf alle Projekt-Systeme</div>
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
              <Link className="btn" to={routes[card.routeKey]}>
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
