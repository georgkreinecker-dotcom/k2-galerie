import { Link } from 'react-router-dom'
import '../App.css'
import { PLATFORM_ROUTES, MOK2_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { getProjectCards } from '../config/projectsDisplay'

const projects = getProjectCards()

export default function ProjectsPage() {
  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>Projekte</h1>
            <div className="meta">Alle deine Projekte an einem Ort</div>
          </div>
          <Link to={PLATFORM_ROUTES.home} className="meta">← Zur Plattform</Link>
        </header>

        {/* K2 Markt – schöner Zugangsbutton zur Kreativwerkstatt */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem 1.75rem',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', color: '#86efac', fontWeight: 600 }}>K2 Markt – Kreativwerkstatt</h2>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                Eigenständiges Projekt. Arbeitsoberfläche: Leitvision, Ablauf, Studio, Tor – heute etwas auf den Markt bringen.
              </p>
            </div>
            <Link
              to={PROJECT_ROUTES['k2-markt'].home}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: '1.05rem',
                textDecoration: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 12px rgba(34, 197, 94, 0.35)',
              }}
            >
              Zugang zur Kreativwerkstatt →
            </Link>
          </div>
        </div>

        <div className="grid">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: project.color,
                    boxShadow: `0 0 8px ${project.color}`,
                  }}
                />
                <h2 style={{ margin: 0 }}>{project.title}</h2>
              </div>
              <p>{project.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link className="btn" to={project.to}>
                  Öffnen →
                </Link>
                <span className="meta" style={{ fontSize: '0.85rem' }}>
                  {project.status === 'in-progress' && '🟢 In Arbeit'}
                  {project.status === 'planned' && '⚪ Geplant'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="card">
            <p className="meta">Noch keine Projekte. Erstelle dein erstes Projekt!</p>
          </div>
        )}

        {/* Eigener Bereich – strukturell getrennt von Projekt/Entwicklung */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(95, 251, 241, 0.3)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>Eigener Bereich</h2>
          <p className="meta" style={{ marginBottom: '1rem', maxWidth: '560px' }}>
            Vertrieb & Promotion für ök2 – nur indirekt mit der App-Entwicklung verbunden.
          </p>
          <div className="card" style={{ borderLeft: '4px solid #5ffbf1', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem' }}>mök2 – Vertrieb & Promotion</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Marketing K2 Galerie, Werbeunterlagen, USPs, Empfehlungs-Programm. Eigenständige Arbeitsplattform.</p>
            <Link className="btn" to={MOK2_ROUTE} style={{ marginTop: '0.75rem', display: 'inline-block' }}>
              mök2 öffnen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
