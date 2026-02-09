import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds } from '../config/navigation'

const projects = getAllProjectIds().map((id) => ({
  id,
  title: PROJECT_ROUTES[id].name,
  description: 'Kunst & Keramik Galerie – Hybrid-Eröffnung April 2026', // TODO: aus Config
  status: 'in-progress' as 'in-progress' | 'planned',
  color: '#5ffbf1', // TODO: aus Config
  to: PROJECT_ROUTES[id].home,
}))

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
      </div>
    </div>
  )
}
