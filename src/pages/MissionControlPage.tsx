import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds } from '../config/navigation'

// Helper: Prüft localStorage direkt (ohne Hook)
function getPersistentBoolean(key: string): boolean {
  try {
    const value = localStorage.getItem(key)
    return value === 'true'
  } catch {
    return false
  }
}

export default function MissionControlPage() {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [showBackup, setShowBackup] = useState(false)

  const projects = useMemo(() => {
    return getAllProjectIds().map((id) => {
      const project = PROJECT_ROUTES[id]
      
      // Für k2-galerie: Berechne Status basierend auf gespeicherten Tasks
      if (id === 'k2-galerie') {
        const phaseKeys = [
          'k2-mission-phase1-1', 'k2-mission-phase1-2', 'k2-mission-phase1-3', 'k2-mission-phase1-4',
          'k2-mission-phase2-1', 'k2-mission-phase2-2', 'k2-mission-phase2-3', 'k2-mission-phase2-4', 'k2-mission-phase2-5',
          'k2-mission-phase3-1', 'k2-mission-phase3-2', 'k2-mission-phase3-3', 'k2-mission-phase3-4', 'k2-mission-phase3-5',
          'k2-mission-phase4-1', 'k2-mission-phase4-2', 'k2-mission-phase4-3', 'k2-mission-phase4-4',
          'k2-mission-phase5-1', 'k2-mission-phase5-2', 'k2-mission-phase5-3', 'k2-mission-phase5-4', 'k2-mission-phase5-5', 'k2-mission-phase5-6', 'k2-mission-phase5-7', 'k2-mission-phase5-8',
        ]
        
        const completed = phaseKeys.filter(key => getPersistentBoolean(key)).length
        const total = phaseKeys.length
        const percent = total ? Math.round((completed / total) * 100) : 0
        
        return {
          id,
          name: project.name,
          description: 'Kunst & Keramik Galerie – Hybrid-Eröffnung April 2026',
          status: percent === 100 ? 'completed' : percent > 0 ? 'in-progress' : 'planned',
          progress: percent,
          completed,
          total,
          color: '#5ffbf1',
          routes: project,
        }
      }
      
      // Für andere Projekte: Standard-Werte
      return {
        id,
        name: project.name,
        description: 'Projekt',
        status: 'planned' as const,
        progress: 0,
        completed: 0,
        total: 0,
        color: '#8b5cf6',
        routes: project,
      }
    })
  }, [])

  const totalCompleted = projects.reduce((sum, p) => sum + p.completed, 0)
  const totalTasks = projects.reduce((sum, p) => sum + p.total, 0)
  const overallProgress = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0
  const activeProjects = projects.filter(p => p.status === 'in-progress').length

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>🚀 Mission Control</h1>
            <div className="meta">Übergeordnete Übersicht aller Projekte</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#8fa0c9', opacity: 0.7 }}>💾 Auto-Save aktiv</div>
            <Link
              to="/k2team-handbuch"
              className="btn small-btn"
              style={{
                background: 'linear-gradient(120deg, #8b5cf6, #6366f1)',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="K2Team Handbuch öffnen"
            >
              <span style={{ fontSize: '1.1rem' }}>🧠⚙️</span>
              <span>Handbuch</span>
            </Link>
            <Link 
              to={PLATFORM_ROUTES.home} 
              className="btn small-btn"
              style={{ 
                background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                color: '#04111f',
                textDecoration: 'none'
              }}
            >
              ← Plattform
            </Link>
          </div>
        </header>

        <section className="stats">
          <div className="stat">
            <span>Gesamt-Status</span>
            <strong style={{ fontSize: '2rem' }}>{overallProgress}%</strong>
            <small className="muted">{totalCompleted}/{totalTasks} Aufgaben</small>
          </div>
          <div className="stat">
            <span>Aktive Projekte</span>
            <strong>{activeProjects}</strong>
            <small className="muted">von {projects.length} Projekten</small>
          </div>
          <div className="stat">
            <span>Abgeschlossen</span>
            <strong>{projects.filter(p => p.status === 'completed').length}</strong>
            <small className="muted">Projekte fertig</small>
          </div>
        </section>

        <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id)
            return (
              <div 
                key={project.id} 
                className="panel"
                style={{
                  border: `1px solid ${project.color}40`,
                  background: `linear-gradient(135deg, ${project.color}15, rgba(18, 22, 35, 0.95))`,
                }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: isExpanded ? '1rem' : '0'
                  }}
                  onClick={() => {
                    const newExpanded = new Set(expandedProjects)
                    if (newExpanded.has(project.id)) {
                      newExpanded.delete(project.id)
                    } else {
                      newExpanded.add(project.id)
                    }
                    setExpandedProjects(newExpanded)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: project.color,
                        boxShadow: `0 0 8px ${project.color}`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', color: project.color }}>
                        {project.name}
                      </h2>
                      <div style={{ fontSize: '0.75rem', color: '#8fa0c9', marginTop: '0.25rem' }}>
                        {project.description}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.2rem', color: '#8fa0c9', marginLeft: '1rem' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#8fa0c9' }}>Fortschritt</span>
                      <span style={{ color: project.color, fontWeight: '600' }}>{project.progress}%</span>
                    </div>
                    <div style={{ 
                      height: '6px', 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${project.progress}%`, 
                        background: `linear-gradient(90deg, ${project.color}, ${project.color}80)`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    background: project.status === 'completed' ? '#48bb7840' : project.status === 'in-progress' ? '#5ffbf140' : 'rgba(255, 255, 255, 0.1)',
                    color: project.status === 'completed' ? '#48bb78' : project.status === 'in-progress' ? '#5ffbf1' : '#8fa0c9'
                  }}>
                    {project.status === 'completed' && '✅'}
                    {project.status === 'in-progress' && '🟢'}
                    {project.status === 'planned' && '⚪'}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link
                        to={project.routes.plan}
                        className="btn small-btn"
                        style={{
                          background: `linear-gradient(120deg, ${project.color}, ${project.color}80)`,
                          color: '#04111f',
                          textDecoration: 'none',
                          textAlign: 'center',
                          fontSize: '0.85rem'
                        }}
                      >
                        📋 Projektplan öffnen
                      </Link>
                      <Link
                        to={project.routes.home}
                        className="btn small-btn"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#f4f7ff',
                          textDecoration: 'none',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        🏠 Projekt-Start
                      </Link>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#8fa0c9' }}>
                      {project.completed}/{project.total} Aufgaben erledigt
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* AI Memory Backup Tool */}
        <section className="panel" style={{ marginTop: '2rem', background: 'rgba(95, 251, 241, 0.05)', border: '1px solid rgba(95, 251, 241, 0.2)' }}>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showBackup ? '1rem' : '0'
            }}
            onClick={() => setShowBackup(!showBackup)}
          >
            <h2 style={{ color: '#5ffbf1', margin: 0 }}>💾 AI Memory Backup</h2>
            <span style={{ fontSize: '1.2rem', color: '#8fa0c9' }}>
              {showBackup ? '▼' : '▶'}
            </span>
          </div>
          
          {showBackup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/backup/k2-ai-memory-backup.json')
                  if (!response.ok) {
                    throw new Error('Backup-Datei nicht gefunden')
                  }
                  const data = await response.json()
                  
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `k2-ai-memory-backup-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                  
                  alert('✅ Backup heruntergeladen!')
                } catch (error) {
                  alert(`❌ Fehler: ${error instanceof Error ? error.message : String(error)}`)
                }
              }}
              className="btn"
              style={{
                background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                color: '#0a0e27',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              📥 Backup herunterladen
            </button>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                📤 Backup hochladen:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  
                  try {
                    const text = await file.text()
                    const data = JSON.parse(text)
                    
                    if (!data.user || !data.project) {
                      throw new Error('Ungültiges Backup-Format')
                    }
                    
                    const response = await fetch('/api/write-backup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: text
                    })
                    
                    if (response.ok) {
                      alert('✅ Backup hochgeladen!')
                    } else {
                      throw new Error('Fehler beim Hochladen')
                    }
                  } catch (error) {
                    alert(`❌ Fehler: ${error instanceof Error ? error.message : String(error)}`)
                  }
                  
                  e.target.value = ''
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              💡 Backup → Speichern → Bei Neustart hochladen → "Lade Backup" sagen
            </div>
          </div>
          )}
        </section>

        <p className="save-hint" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1rem' }}>💾 Lokaler Speicher aktiv</p>
      </div>
    </main>
  )
}
