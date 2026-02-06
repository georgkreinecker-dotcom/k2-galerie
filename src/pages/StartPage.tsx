import { Link } from 'react-router-dom'
import '../App.css'

const cards = [
  {
    title: 'Galerie',
    description: 'Öffentliche K2 Galerie – Kunst & Keramik, Eröffnung, Werke.',
    to: '/galerie',
    cta: 'Öffnen →',
  },
  {
    title: 'Control-Studio',
    description:
      'Komplettes Kommandozentrum inkl. KI-Agent, Launch-Plan und Aufgabenfeldern.',
    to: '/control-studio',
    cta: 'Starten →',
  },
  {
    title: 'Arbeitsplattform',
    description: 'Mission-Control-Checklisten mit Fortschritt, Fokus & Timeline.',
    to: '/mission-control',
    cta: 'Öffnen →',
  },
  {
    title: 'Mobile-Connect',
    description: 'QR-Hub für iPhone/iPad, damit die Galerie wie eine App läuft.',
    to: '/mobile-connect',
    cta: 'Zu Mobile →',
  },
]

const quickLinks = [
  { label: 'Phase 1', anchor: '/mission-control#phase1' },
  { label: 'Phase 2', anchor: '/mission-control#phase2' },
  { label: 'Phase 3', anchor: '/mission-control#phase3' },
  { label: 'Phase 4', anchor: '/mission-control#phase4' },
  { label: 'KI-Agent', anchor: '/control-studio' },
  { label: 'API-Key', anchor: '/key' },
  { label: 'Kosten', anchor: '/kosten' },
]

const StartPage = () => (
  <div className="mission-wrapper">
    <div className="viewport">
      <header>
        <div>
          <h1>K2 Mission Deck</h1>
          <div className="meta">Direkter Zugriff auf alle Systeme – Galerie · KI · Mobile</div>
        </div>
        <div className="meta">Desktop-Button „K2 Start“ öffnet genau diese Seite.</div>
      </header>

      <div className="grid">
        {cards.map((card) => (
          <div className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link className="btn" to={card.to}>
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

export default StartPage
