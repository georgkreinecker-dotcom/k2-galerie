import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, getProjectRoutes, type ProjectId } from '../config/navigation'

type NavProps = {
  projectId?: ProjectId
  showPlatform?: boolean
  showProject?: boolean
}

/**
 * Zentrale Navigation-Komponente
 * Verwendet automatisch die Routen aus navigation.ts
 */
export function Navigation({ projectId, showPlatform = true, showProject = true }: NavProps) {
  const projectRoutes = projectId ? getProjectRoutes(projectId) : null

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {showPlatform && (
        <Link to={PLATFORM_ROUTES.home} className="meta">
          ← Plattform
        </Link>
      )}
      {showProject && projectRoutes && (
        <Link to={projectRoutes.home} className="meta">
          ← Projekt-Start
        </Link>
      )}
      {projectId && (
        <Link to={PLATFORM_ROUTES.projects} className="meta">
          ← Projekte
        </Link>
      )}
    </div>
  )
}

/**
 * Button für Projekt-Navigation
 */
export function ProjectNavButton({ projectId }: { projectId: ProjectId }) {
  const routes = getProjectRoutes(projectId)
  return (
    <Link className="btn small-btn" to={routes.home}>
      ← Projekt-Start
    </Link>
  )
}

/**
 * Button für DevView-Plattform (Arbeitsplattform mit Mobilansichten)
 */
export function DevViewNavButton({ defaultPage = 'mission' }: { defaultPage?: string }) {
  return (
    <Link 
      className="btn small-btn" 
      to={`/dev-view${defaultPage ? `?page=${defaultPage}` : ''}`}
      style={{ 
        background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
        color: '#04111f'
      }}
    >
      📱 APf
    </Link>
  )
}

/**
 * Button für Plattform-Navigation
 */
export function PlatformNavButton() {
  return (
    <Link className="btn small-btn" to={PLATFORM_ROUTES.home}>
      ← Plattform
    </Link>
  )
}
