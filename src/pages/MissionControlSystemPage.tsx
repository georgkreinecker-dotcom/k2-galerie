/**
 * Mission Control – System & Kontext (nicht die tägliche Steuerung).
 * Projektkarten mit Beschreibung/Roadmap-Hinweis, Chat-Kontext-JSON (AI Memory).
 */
import { useState, useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds, MOK2_ROUTE, type ProjectId } from '../config/navigation'

function getPersistentBoolean(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

type PanelProject = {
  id: ProjectId
  name: string
  description: string
  color: string
  tags: { label: string; style: 'live' | 'demo' | 'intern' }[]
  routes: (typeof PROJECT_ROUTES)[ProjectId]
  roadmapHint: string | null
}

const TAG_STYLES: Record<string, CSSProperties> = {
  live: { background: 'rgba(72, 187, 120, 0.25)', color: '#86efac', border: '1px solid rgba(72,187,120,0.45)' },
  demo: { background: 'rgba(251, 191, 36, 0.2)', color: '#fcd34d', border: '1px solid rgba(251,191,36,0.45)' },
  intern: { background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.35)' },
}

export default function MissionControlSystemPage() {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [showBackup, setShowBackup] = useState(false)

  const projects = useMemo((): PanelProject[] => {
    return getAllProjectIds().map((id) => {
      const project = PROJECT_ROUTES[id]
      if (id === 'k2-galerie') {
        const phaseKeys = [
          'k2-mission-phase1-1', 'k2-mission-phase1-2', 'k2-mission-phase1-3', 'k2-mission-phase1-4',
          'k2-mission-phase2-1', 'k2-mission-phase2-2', 'k2-mission-phase2-3', 'k2-mission-phase2-4', 'k2-mission-phase2-5',
          'k2-mission-phase3-1', 'k2-mission-phase3-2', 'k2-mission-phase3-3', 'k2-mission-phase3-4', 'k2-mission-phase3-5',
          'k2-mission-phase4-1', 'k2-mission-phase4-2', 'k2-mission-phase4-3', 'k2-mission-phase4-4',
          'k2-mission-phase5-1', 'k2-mission-phase5-2', 'k2-mission-phase5-3', 'k2-mission-phase5-4', 'k2-mission-phase5-5',
          'k2-mission-phase5-6', 'k2-mission-phase5-7', 'k2-mission-phase5-8',
        ]
        const completed = phaseKeys.filter((key) => getPersistentBoolean(key)).length
        const total = phaseKeys.length
        const roadmapHint =
          completed > 0 ? `Frühere Roadmap-Checkliste: ${completed}/${total} Häkchen (lokal)` : null
        return {
          id,
          name: project.name,
          description: 'Galerie & Shop – echte K2, ök2-Demo, VK2 – Betrieb und Verfeinerung',
          color: '#5ffbf1',
          tags: [
            { label: 'Live', style: 'live' },
            { label: 'Produkt', style: 'live' },
            { label: 'Testphase', style: 'demo' },
          ],
          routes: project,
          roadmapHint,
        }
      }
      if (id === 'k2-markt') {
        return {
          id,
          name: project.name,
          description: 'Kreativwerkstatt – weiter ausbauen und verfeinern',
          color: '#a78bfa',
          tags: [{ label: 'Intern', style: 'intern' }, { label: 'Ausbau', style: 'intern' }],
          routes: project,
          roadmapHint: null,
        }
      }
      if (id === 'vk2') {
        return {
          id,
          name: project.name,
          description: 'Vereinsplattform – Demo und echte Nutzung',
          color: '#8b5cf6',
          tags: [{ label: 'Live', style: 'live' }, { label: 'Demo', style: 'demo' }],
          routes: project,
          roadmapHint: null,
        }
      }
      return {
        id,
        name: project.name,
        description: 'Familienraum – Musterfamilie Huber + echte Familien',
        color: '#34d399',
        tags: [{ label: 'Live', style: 'live' }, { label: 'Muster-Demo', style: 'demo' }],
        routes: project,
        roadmapHint: null,
      }
    })
  }, [])

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
          Hier liegen Kontext-Texte, optionale Roadmap-Hinweise und der Chat-Kontext-JSON. Für den täglichen Betrieb:{' '}
          <Link to={PLATFORM_ROUTES.missionControl} style={{ color: '#5ffbf1' }}>
            Mission Control – Steuerung
          </Link>
          .
        </p>
        <nav
          aria-label="Navigation"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem 0.85rem',
            marginBottom: '1.35rem',
            fontSize: '0.82rem',
          }}
        >
          <Link to={PLATFORM_ROUTES.missionControl} style={{ color: '#5ffbf1', textDecoration: 'none', fontWeight: 600 }}>
            ← Steuerung
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to={PLATFORM_ROUTES.home} style={{ color: '#a5b4fc', textDecoration: 'none' }}>
            Plattform
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to="/k2team-handbuch" style={{ color: '#a5b4fc', textDecoration: 'none' }}>
            Handbuch
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to={MOK2_ROUTE} style={{ color: '#fcd34d', textDecoration: 'none' }}>
            mök2
          </Link>
        </nav>

        <h1 style={{ margin: '0 0 1rem', fontSize: '1.25rem', color: '#e0e7ff' }}>System & Kontext</h1>

        <section style={{ marginTop: '0.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#f0f6ff', margin: '0 0 0.5rem' }}>Projekte – Übersicht & Geschichten</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#8fa0c9' }}>
            Status und Beschreibungen – nicht die Kurz-Steuerung. Ausklappen für Projekt-Start und optionale Roadmap.
          </p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id)
              return (
                <div
                  key={project.id}
                  className="panel"
                  style={{
                    border: `1px solid ${project.color}40`,
                    background: `linear-gradient(135deg, ${project.color}12, rgba(18, 22, 35, 0.95))`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      marginBottom: isExpanded ? '1rem' : '0',
                    }}
                    onClick={() => {
                      const next = new Set(expandedProjects)
                      if (next.has(project.id)) next.delete(project.id)
                      else next.add(project.id)
                      setExpandedProjects(next)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: project.color,
                          boxShadow: `0 0 8px ${project.color}`,
                          marginTop: '0.35rem',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: project.color }}>{project.name}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {project.tags.map((t) => (
                            <span
                              key={t.label}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                ...TAG_STYLES[t.style],
                              }}
                            >
                              {t.label}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.5rem' }}>{project.description}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: '#8fa0c9', marginLeft: '0.5rem' }}>{isExpanded ? '▼' : '▶'}</span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {project.roadmapHint && (
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'rgba(148,163,184,0.95)' }}>{project.roadmapHint}</p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {'plan' in project.routes && (
                          <Link
                            to={project.routes.plan}
                            className="btn small-btn"
                            style={{
                              background: `linear-gradient(120deg, ${project.color}, ${project.color}80)`,
                              color: '#04111f',
                              textDecoration: 'none',
                              textAlign: 'center',
                              fontSize: '0.85rem',
                            }}
                          >
                            📋 Roadmap / Projektplan (optional)
                          </Link>
                        )}
                        <Link
                          to={project.routes.home}
                          className="btn small-btn"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#f4f7ff',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          🏠 Projekt-Start
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel" style={{ marginTop: '2rem', background: 'rgba(95, 251, 241, 0.05)', border: '1px solid rgba(95, 251, 241, 0.2)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showBackup ? '1rem' : '0',
            }}
            onClick={() => setShowBackup(!showBackup)}
          >
            <h2 style={{ color: '#5ffbf1', margin: 0 }}>💾 Chat-Kontext JSON (AI Memory Backup)</h2>
            <span style={{ fontSize: '1.2rem', color: '#8fa0c9' }}>{showBackup ? '▼' : '▶'}</span>
          </div>

          {showBackup && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#8fa0c9' }}>
                Strukturierte Infos für den In-App-Chat: Stil, Projektstand –{' '}
                <strong style={{ color: '#e0e7ff' }}>nicht</strong> Galerie-Vollbackup. Entwicklung: Schreiben nur lokal via{' '}
                <code style={{ fontSize: '0.75rem' }}>/api/write-backup</code>.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/backup/k2-ai-memory-backup.json')
                    if (!response.ok) throw new Error('Backup-Datei nicht gefunden')
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
                  fontSize: '0.9rem',
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
                      if (!data.user || !data.project) throw new Error('Ungültiges Backup-Format')
                      const response = await fetch('/api/write-backup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: text,
                      })
                      if (response.ok) alert('✅ Backup hochgeladen!')
                      else throw new Error('Fehler beim Hochladen')
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
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                💡 Backup → Speichern → Bei Neustart hochladen → im Chat „Lade Backup“ sagen
              </div>
            </div>
          )}
        </section>

        <p className="save-hint" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1rem' }}>
          💾 Lokaler Speicher aktiv (Browser / Entwicklung)
        </p>
      </div>
    </main>
  )
}
