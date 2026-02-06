import { usePersistentBoolean, usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'
import { Link } from 'react-router-dom'
import DomainManager from '../components/DomainManager'
import LicenseManager from '../components/LicenseManager'

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
      { key: 'k2-mission-phase1-1', label: 'Technik & Dev-Umgebung laufen (Node, npm, „npm run dev“).' },
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

const MissionControlPage = () => {
  const phases = phaseDefinitions.map((phase) => {
    const tasks = phase.tasks.map((task) => {
      const [checked, setChecked] = usePersistentBoolean(task.key)
      return { ...task, checked, setChecked }
    })
    const [notes, setNotes] = usePersistentString(phase.noteKey)
    return { ...phase, tasks, notes, setNotes }
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
            <h1>K2 Mission Control</h1>
            <div className="meta">Hybrid-Launch · April 2026 · Projektstatus Live</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#8fa0c9' }}>Datenspeicher aktiv – Browser merkt sich deinen Fortschritt</div>
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
            <ProjectNavButton projectId="k2-galerie" />
          </div>
        </header>

        <section className="stats">
          <div className="stat">
            <span>Projektstatus</span>
            <strong>{percent}%</strong>
            <small className="muted">Automatisch berechnet (Häkchen)</small>
          </div>
          <div className="stat">
            <span>Nächster Meilenstein</span>
            <strong>{pendingPhase ? 'Launch-Sprint' : 'Erledigt'}</strong>
            <small className="muted">{nextMilestone}</small>
          </div>
          <div className="stat">
            <span>Heutiger Fokus</span>
            <strong>{focusArea}</strong>
            <small className="muted">passt sich an offene Aufgaben an</small>
          </div>
        </section>

        <section className="grid phases">
          {phases.map((phase) => (
            <div className="panel" key={phase.id} id={phase.id}>
              <h2>{phase.title}</h2>
              {phase.tasks.map((task) => (
                <label className="task" key={task.key}>
                  <input
                    type="checkbox"
                    checked={task.checked}
                    onChange={(event) => task.setChecked(event.target.checked)}
                  />
                  <span>{task.label}</span>
                </label>
              ))}
              <textarea
                className="notes"
                value={phase.notes}
                onChange={(event) => phase.setNotes(event.target.value)}
                placeholder="Notizen …"
              />
              {phase.id === 'phase2' && (
                <>
                  <DomainManager />
                  <div className="links" style={{ marginTop: '1.5rem' }}>
                    <strong>Anleitungen:</strong>
                    <ul>
                      <li>EINFACHES_DEPLOYMENT.md, VERCEL_ANLEITUNG_DEUTSCH.md, GITHUB_SETUP_ANLEITUNG.md</li>
                    </ul>
                  </div>
                </>
              )}
              {phase.id === 'phase3' && (
                <div className="links">
                  <strong>Anleitungen:</strong>
                  <ul>
                    <li>SOCIAL_MEDIA_ANLEITUNG.md</li>
                  </ul>
                </div>
              )}
              {phase.id === 'phase5' && (
                <>
                  <LicenseManager />
                  <div className="links" style={{ marginTop: '1.5rem' }}>
                    <strong>Lizenzierung:</strong>
                    <ul>
                      <li>Multi-Tenant-System bereits implementiert</li>
                      <li>Stripe/Payment-Integration geplant</li>
                      <li>Beta-Tester-Programm starten</li>
                    </ul>
                  </div>
                </>
              )}
              {phase.id === 'phase4' && (
                <div className="links">
                  <strong>Anleitungen:</strong>
                  <ul>
                    <li>SUMUP_KASSA_ANLEITUNG.md, MOBILE-PRINT-ANLEITUNG.md, BACKUP-ANLEITUNG.md, BILD_UPLOAD_ANLEITUNG.md</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
          <div className="panel timeline-panel">
            <h2>Mission Timeline</h2>
            <div className="timeline">
              <div>
                <strong>Woche 1</strong> – Inhalte finalisieren & QA<br />
                <small className="muted">Texte, Künstlerprofile, Bildqualität prüfen.</small>
              </div>
              <div>
                <strong>Woche 2</strong> – Technik Freeze & Pre-Launch Test<br />
                <small className="muted">Vercel + Mobile + QR streng testen.</small>
              </div>
              <div>
                <strong>Woche 3</strong> – Marketing Blast<br />
                <small className="muted">Social Media, Newsletter, Presse.</small>
              </div>
              <div>
                <strong>Launch Woche</strong> – Hybrid Event & Follow Up<br />
                <small className="muted">Vor Ort + Online Betreuung, Presseberichte.</small>
              </div>
            </div>
          </div>
        </section>

        <p className="save-hint">Status & Notizen werden lokal im Browser gespeichert (kein Login nötig).</p>
      </div>
    </main>
  )
}

export default MissionControlPage
