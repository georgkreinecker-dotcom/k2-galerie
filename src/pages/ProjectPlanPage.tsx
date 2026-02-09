import { useState } from 'react'
import { usePersistentBoolean, usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'
import { Link, useParams } from 'react-router-dom'
import DomainManager from '../components/DomainManager'
import LicenseManager from '../components/LicenseManager'
import { PROJECT_ROUTES } from '../config/navigation'

type PhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'

const phaseDefinitions: Array<{
  id: PhaseId
  title: string
  noteKey: string
  tasks: Array<{ key: string; label: string }>
}> = [
  {
    id: 'phase1',
    title: 'Phase 1 · Vorbereitung',
    noteKey: 'k2-mission-notes-phase1',
    tasks: [
      { key: 'k2-mission-phase1-1', label: 'Technik & Dev-Umgebung laufen (Node, npm, „npm run dev").' },
      { key: 'k2-mission-phase1-2', label: 'Supabase eingerichtet + .env gepflegt.' },
      { key: 'k2-mission-phase1-3', label: 'Inhalte: Texte, Künstler, Werke vorbereitet.' },
      { key: 'k2-mission-phase1-4', label: 'Brand/Domain-Entscheidung final.' },
    ],
  },
  {
    id: 'phase2',
    title: 'Phase 2 · Online',
    noteKey: 'k2-mission-notes-phase2',
    tasks: [
      { key: 'k2-mission-phase2-1', label: 'Repo auf GitHub + Zugang geteilt.' },
      { key: 'k2-mission-phase2-2', label: 'Vercel Deployment verknüpft.' },
      { key: 'k2-mission-phase2-3', label: 'Supabase Keys in Vercel gesetzt.' },
      { key: 'k2-mission-phase2-4', label: 'Live-URL getestet inkl. Inhalte.' },
      { key: 'k2-mission-phase2-5', label: 'Optional: Eigene Domain verbunden.' },
    ],
  },
  {
    id: 'phase3',
    title: 'Phase 3 · Marketing',
    noteKey: 'k2-mission-notes-phase3',
    tasks: [
      { key: 'k2-mission-phase3-1', label: 'Slogan & Story formuliert.' },
      { key: 'k2-mission-phase3-2', label: 'Social Accounts aktiv & verlinkt.' },
      { key: 'k2-mission-phase3-3', label: 'Content Plan (Posts/Stories/Woche).' },
      { key: 'k2-mission-phase3-4', label: 'Einladungs-/Mailingliste gepflegt.' },
      { key: 'k2-mission-phase3-5', label: 'Pressepartner & Multiplikatoren adressiert.' },
    ],
  },
  {
    id: 'phase4',
    title: 'Phase 4 · Betrieb',
    noteKey: 'k2-mission-notes-phase4',
    tasks: [
      { key: 'k2-mission-phase4-1', label: 'Preislisten + SumUp konfiguriert.' },
      { key: 'k2-mission-phase4-2', label: 'Druck/Print-Bridge getestet.' },
      { key: 'k2-mission-phase4-3', label: 'Backup & Restore Plan verstanden.' },
      { key: 'k2-mission-phase4-4', label: 'Supportkontakt definiert.' },
    ],
  },
  {
    id: 'phase5',
    title: 'Phase 5 · Lizenzierung & Vermarktung',
    noteKey: 'k2-mission-notes-phase5',
    tasks: [
      { key: 'k2-mission-phase5-1', label: 'Lizenz-Modell definiert (SaaS, Einmalzahlung, Abo).' },
      { key: 'k2-mission-phase5-2', label: 'Pricing-Pläne erstellt (Basic, Pro, Enterprise).' },
      { key: 'k2-mission-phase5-3', label: 'Feature-Vergleichstabelle erstellt.' },
      { key: 'k2-mission-phase5-4', label: 'Lizenz-Verwaltungssystem implementiert.' },
      { key: 'k2-mission-phase5-5', label: 'Multi-Tenant-Funktionalität getestet.' },
      { key: 'k2-mission-phase5-6', label: 'Vermarktungsmaterialien erstellt (Landingpage, Demo-Video).' },
      { key: 'k2-mission-phase5-7', label: 'Beta-Tester-Programm gestartet.' },
      { key: 'k2-mission-phase5-8', label: 'Partner-Programm & Empfehlungs-System aktiv.' },
    ],
  },
]

const milestoneMap: Record<PhaseId, string> = {
  phase1: 'Woche 1 – Inhalte finalisieren',
  phase2: 'Woche 2 – Technik Freeze',
  phase3: 'Woche 3 – Marketing Blast',
  phase4: 'Launch Woche – Hybrid Event',
  phase5: 'Post-Launch – SaaS-Vermarktung',
}

export default function ProjectPlanPage() {
  // Für jetzt: K2 Galerie als Standard (später aus URL-Parameter oder useParams)
  const project = PROJECT_ROUTES['k2-galerie']
  
  const [expandedPhases, setExpandedPhases] = useState<Set<PhaseId>>(new Set(['phase2']))

  const phases = phaseDefinitions.map((phase) => {
    const tasks = phase.tasks.map((task) => {
      const [checked, setChecked] = usePersistentBoolean(task.key)
      return { ...task, checked, setChecked }
    })
    const [notes, setNotes] = usePersistentString(phase.noteKey)
    const isExpanded = expandedPhases.has(phase.id)
    const completedTasks = tasks.filter(t => t.checked).length
    const totalTasks = tasks.length
    return { ...phase, tasks, notes, setNotes, isExpanded, completedTasks, totalTasks }
  })

  const flatTasks = phases.flatMap((phase) => phase.tasks)
  const completed = flatTasks.filter((task) => task.checked).length
  const total = flatTasks.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  const pendingPhase = phases.find((phase) => phase.tasks.some((task) => !task.checked))
  const focusArea = pendingPhase ? pendingPhase.title : 'Feierabend'
  const nextMilestone = pendingPhase ? milestoneMap[pendingPhase.id] : 'Launch erreicht 🎉'


  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>{project.name} · Projektplan</h1>
            <div className="meta">Projekt-spezifische Planung & Phasen</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link 
              to="/mission-control"
              className="btn small-btn"
              style={{ 
                background: 'linear-gradient(120deg, #8b5cf6, #6366f1)',
                color: '#ffffff',
                textDecoration: 'none'
              }}
            >
              ← Mission Control
            </Link>
            <Link 
              to="/dev-view?page=mission" 
              className="btn small-btn"
              style={{ 
                background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                color: '#04111f',
                textDecoration: 'none'
              }}
            >
              📱 Arbeitsplattform
            </Link>
            <ProjectNavButton projectId={project.id} />
          </div>
        </header>

        <section className="stats">
          <div className="stat">
            <span>Status</span>
            <strong style={{ fontSize: '2rem' }}>{percent}%</strong>
            <small className="muted">{completed}/{total} Aufgaben</small>
          </div>
          <div className="stat">
            <span>Nächster Schritt</span>
            <strong>{pendingPhase ? pendingPhase.title : '🎉 Fertig'}</strong>
            <small className="muted">{nextMilestone}</small>
          </div>
          <div className="stat">
            <span>Fokus</span>
            <strong>{focusArea}</strong>
            <small className="muted">{pendingPhase ? `${pendingPhase.completedTasks}/${pendingPhase.totalTasks} erledigt` : 'Alles erledigt'}</small>
          </div>
        </section>

        <section className="grid phases">
          {phases.map((phase) => (
            <div className="panel" key={phase.id} id={phase.id} style={{ position: 'relative' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginBottom: phase.isExpanded ? '1rem' : '0'
                }}
                onClick={() => {
                  const newExpanded = new Set(expandedPhases)
                  if (newExpanded.has(phase.id)) {
                    newExpanded.delete(phase.id)
                  } else {
                    newExpanded.add(phase.id)
                  }
                  setExpandedPhases(newExpanded)
                }}
              >
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {phase.title}
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'normal', 
                    color: phase.completedTasks === phase.totalTasks ? '#48bb78' : '#8fa0c9',
                    opacity: 0.8
                  }}>
                    ({phase.completedTasks}/{phase.totalTasks})
                  </span>
                </h2>
                <span style={{ fontSize: '1.2rem', color: '#8fa0c9' }}>
                  {phase.isExpanded ? '▼' : '▶'}
                </span>
              </div>
              
              {phase.isExpanded && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {phase.tasks.map((task) => (
                      <label className="task" key={task.key} style={{ fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={task.checked}
                          onChange={(event) => task.setChecked(event.target.checked)}
                        />
                        <span>{task.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {phase.notes && (
                    <details style={{ marginBottom: '1rem' }}>
                      <summary style={{ cursor: 'pointer', color: '#8fa0c9', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        📝 Notizen ({phase.notes.length} Zeichen)
                      </summary>
                      <textarea
                        className="notes"
                        value={phase.notes}
                        onChange={(event) => phase.setNotes(event.target.value)}
                        placeholder="Notizen …"
                        style={{ marginTop: '0.5rem', minHeight: '60px' }}
                      />
                    </details>
                  )}
                  
                  {!phase.notes && (
                    <textarea
                      className="notes"
                      value={phase.notes}
                      onChange={(event) => phase.setNotes(event.target.value)}
                      placeholder="📝 Notizen …"
                      style={{ marginBottom: '1rem', minHeight: '60px' }}
                    />
                  )}

                  {phase.id === 'phase2' && (
                    <div style={{ marginTop: '1rem' }}>
                      <DomainManager />
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
                        📚 <strong style={{ color: '#5ffbf1' }}>Docs:</strong> Deployment, Vercel, GitHub
                      </div>
                    </div>
                  )}
                  
                  {phase.id === 'phase3' && (
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
                      📚 <strong style={{ color: '#5ffbf1' }}>Docs:</strong> Social Media
                    </div>
                  )}
                  
                  {phase.id === 'phase5' && (
                    <div style={{ marginTop: '1rem' }}>
                      <LicenseManager />
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
                        ✅ Multi-Tenant aktiv · 🔄 Payment geplant
                      </div>
                    </div>
                  )}
                  
                  {phase.id === 'phase4' && (
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
                      📚 <strong style={{ color: '#5ffbf1' }}>Docs:</strong> SumUp, Print, Backup, Upload
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="panel timeline-panel">
            <h2 style={{ marginBottom: '1rem' }}>📅 Timeline</h2>
            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(95, 251, 241, 0.05)', borderRadius: '8px' }}>
                <strong style={{ color: '#5ffbf1' }}>Woche 1</strong>
                <div style={{ fontSize: '0.85rem', color: '#8fa0c9', marginTop: '0.25rem' }}>Inhalte & QA</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(95, 251, 241, 0.05)', borderRadius: '8px' }}>
                <strong style={{ color: '#5ffbf1' }}>Woche 2</strong>
                <div style={{ fontSize: '0.85rem', color: '#8fa0c9', marginTop: '0.25rem' }}>Technik Freeze</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(95, 251, 241, 0.05)', borderRadius: '8px' }}>
                <strong style={{ color: '#5ffbf1' }}>Woche 3</strong>
                <div style={{ fontSize: '0.85rem', color: '#8fa0c9', marginTop: '0.25rem' }}>Marketing</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(95, 251, 241, 0.05)', borderRadius: '8px' }}>
                <strong style={{ color: '#5ffbf1' }}>Launch</strong>
                <div style={{ fontSize: '0.85rem', color: '#8fa0c9', marginTop: '0.25rem' }}>Hybrid Event</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
