import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from '../config/navigation'

// Helper: Lese persistent Boolean ohne Hook
function getPersistentBoolean(key: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(key) === '1'
}

interface SmartPanelProps {
  currentPage?: string
  onGitPush?: () => void
}

export default function SmartPanel({ currentPage, onGitPush }: SmartPanelProps) {
  const [vercelStatus, setVercelStatus] = useState<'checking' | 'deployed' | 'pending' | 'error' | null>(null)
  
  // Projekt-Status berechnen
  const projectStatus = useMemo(() => {
    const projectId = 'k2-galerie'
    const project = PROJECT_ROUTES[projectId]
    
    const phaseKeys = [
      'k2-mission-phase1-1', 'k2-mission-phase1-2', 'k2-mission-phase1-3', 'k2-mission-phase1-4',
      'k2-mission-phase2-1', 'k2-mission-phase2-2', 'k2-mission-phase2-3', 'k2-mission-phase2-4', 'k2-mission-phase2-5',
      'k2-mission-phase3-1', 'k2-mission-phase3-2', 'k2-mission-phase3-3', 'k2-mission-phase3-4', 'k2-mission-phase3-5',
      'k2-mission-phase4-1', 'k2-mission-phase4-2', 'k2-mission-phase4-3', 'k2-mission-phase4-4',
      'k2-mission-phase5-1', 'k2-mission-phase5-2', 'k2-mission-phase5-3', 'k2-mission-phase5-4', 'k2-mission-phase5-5', 'k2-mission-phase5-6', 'k2-mission-phase5-7', 'k2-mission-phase5-8',
    ]
    
    const completed = phaseKeys.filter(key => getPersistentBoolean(key)).length
    const total = phaseKeys.length
    const progress = total ? Math.round((completed / total) * 100) : 0
    
    return {
      name: project.name,
      progress,
      completed,
      total
    }
  }, [])

  // Vercel Status prüfen
  const checkVercelStatus = async () => {
    setVercelStatus('checking')
    try {
      const response = await fetch('/api/vercel-status?' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Vercel Status:', data)
        // Status: 'ready', 'pending', oder 'error'
        if (data.status === 'ready') {
          setVercelStatus('deployed')
        } else if (data.status === 'pending') {
          setVercelStatus('pending')
        } else {
          setVercelStatus('error')
        }
      } else {
        console.warn('⚠️ Vercel Status Fehler:', response.status, response.statusText)
        setVercelStatus('error')
      }
    } catch (error) {
      console.error('❌ Vercel Status Check Fehler:', error)
      setVercelStatus('error')
    }
  }

  useEffect(() => {
    checkVercelStatus()
    const interval = setInterval(checkVercelStatus, 30000) // Alle 30 Sekunden
    return () => clearInterval(interval)
  }, [])

  const quickActions = [
    {
      label: '📦 Git Push',
      action: () => {
        // Verwende handleGitPush von DevViewPage wenn verfügbar
        if (onGitPush) {
          onGitPush()
        } else {
          // Fallback: Zeige Anleitung (sollte nicht mehr vorkommen)
          const commands = [
            'cd /Users/georgkreinecker/k2Galerie',
            'git add public/gallery-data.json',
            'git commit -m "Update gallery-data.json"',
            'git push origin main'
          ]
          alert(`📦 Git Push:\n\n💡 Option 1: Script ausführen\n   ./scripts/git-push-gallery-data.sh\n\n💡 Option 2: Manuell im Terminal\n   ${commands.join('\n   ')}\n\n✅ Nach Git Push:\n⏳ Vercel Deployment startet automatisch (1-2 Minuten)`)
        }
      },
      hint: 'Git Push starten'
    },
    {
      label: '🚀 Vercel',
      action: () => {
        window.open('https://vercel.com/dashboard', '_blank')
      },
      hint: 'Vercel Dashboard'
    },
    {
      label: '📊 Mission Control',
      action: () => {
        window.location.href = PLATFORM_ROUTES.missionControl
      },
      hint: 'Projekt-Übersicht'
    },
    {
      label: '📁 Projekte',
      action: () => {
        window.location.href = PLATFORM_ROUTES.projects
      },
      hint: 'Alle Projekte'
    }
  ]

  const nextSteps = useMemo(() => {
    const steps: string[] = []
    
    // Prüfe Phase 1
    const phase1Complete = ['k2-mission-phase1-1', 'k2-mission-phase1-2', 'k2-mission-phase1-3', 'k2-mission-phase1-4']
      .every(key => getPersistentBoolean(key))
    
    if (!phase1Complete) {
      steps.push('Phase 1 abschließen')
    }
    
    // Prüfe Phase 2
    const phase2Complete = ['k2-mission-phase2-1', 'k2-mission-phase2-2', 'k2-mission-phase2-3', 'k2-mission-phase2-4', 'k2-mission-phase2-5']
      .every(key => getPersistentBoolean(key))
    
    if (phase1Complete && !phase2Complete) {
      steps.push('Phase 2: Online bringen')
    }
    
    if (steps.length === 0) {
      steps.push('Projekt läuft gut!')
    }
    
    return steps
  }, [])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(95, 251, 241, 0.2)',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#5ffbf1' }}>
            Smart Panel
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8fa0c9' }}>
          Projekt-Status & Schnellzugriff
        </p>
      </div>

      {/* Projekt-Status */}
      <div style={{
        background: 'rgba(95, 251, 241, 0.05)',
        border: '1px solid rgba(95, 251, 241, 0.15)',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#8fa0c9' }}>📁 {projectStatus.name}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#5ffbf1' }}>
            {projectStatus.progress}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(95, 251, 241, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${projectStatus.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #5ffbf1, #33a1ff)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#8fa0c9',
          marginTop: '0.5rem'
        }}>
          {projectStatus.completed} von {projectStatus.total} Tasks erledigt
        </div>
      </div>

      {/* Nächste Schritte */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#5ffbf1',
          fontWeight: 600
        }}>
          🎯 Nächste Schritte
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {nextSteps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: '0.75rem',
                background: 'rgba(95, 251, 241, 0.05)',
                border: '1px solid rgba(95, 251, 241, 0.1)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#c4b5fd'
              }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Schnellzugriff */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#5ffbf1',
          fontWeight: 600
        }}>
          ⚡ Schnellzugriff
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              style={{
                padding: '0.75rem',
                background: 'rgba(95, 251, 241, 0.1)',
                border: '1px solid rgba(95, 251, 241, 0.2)',
                borderRadius: '6px',
                color: '#5ffbf1',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(95, 251, 241, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.2)'
              }}
              title={action.hint}
            >
              <span>{action.label}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vercel Status */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#5ffbf1',
          fontWeight: 600
        }}>
          🚀 Deployment Status
        </h4>
        <div style={{
          padding: '0.75rem',
          background: vercelStatus === 'deployed' 
            ? 'rgba(34, 197, 94, 0.1)' 
            : vercelStatus === 'pending'
            ? 'rgba(251, 191, 36, 0.1)'
            : vercelStatus === 'error'
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(95, 251, 241, 0.05)',
          border: `1px solid ${
            vercelStatus === 'deployed' 
              ? 'rgba(34, 197, 94, 0.3)' 
              : vercelStatus === 'pending'
              ? 'rgba(251, 191, 36, 0.3)'
              : vercelStatus === 'error'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(95, 251, 241, 0.15)'
          }`,
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: vercelStatus === 'deployed' ? '#86efac' : vercelStatus === 'pending' ? '#fcd34d' : vercelStatus === 'error' ? '#fca5a5' : '#8fa0c9',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: vercelStatus === 'error' ? 'pointer' : 'default'
        }}
        onClick={vercelStatus === 'error' ? checkVercelStatus : undefined}
        title={vercelStatus === 'error' ? 'Klicken zum erneuten Prüfen' : ''}
        >
          <span>
            {vercelStatus === 'checking' && '⏳ Prüfe...'}
            {vercelStatus === 'deployed' && '✅ Online'}
            {vercelStatus === 'pending' && '🔄 Wird deployed...'}
            {vercelStatus === 'error' && '❌ Fehler - Klicken zum Prüfen'}
            {!vercelStatus && '⏳ Prüfe...'}
          </span>
        </div>
      </div>

      {/* Links */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(95, 251, 241, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <Link
            to={PLATFORM_ROUTES.missionControl}
            style={{
              fontSize: '0.85rem',
              color: '#8fa0c9',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.05)'
              e.currentTarget.style.color = '#5ffbf1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#8fa0c9'
            }}
          >
            📊 Mission Control →
          </Link>
          <Link
            to={PLATFORM_ROUTES.projects}
            style={{
              fontSize: '0.85rem',
              color: '#8fa0c9',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.05)'
              e.currentTarget.style.color = '#5ffbf1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#8fa0c9'
            }}
          >
            📁 Alle Projekte →
          </Link>
        </div>
      </div>
    </div>
  )
}
