/**
 * K2 Familie – Fertige Homepage (nutzerorientiert).
 * Route: /projects/k2-familie (Index).
 * Willkommen + Bild + erste Aktionen (Stammbaum, Events, Kalender). Pro Tenant Texte/Bilder.
 */

import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { getFamilyPageContent } from '../config/pageContentFamilie'
import { getFamilyPageTexts } from '../config/pageTextsFamilie'
import { K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useMemo } from 'react'

const C = {
  bg: '#0f1419',
  bgCard: 'rgba(20,26,32,0.85)',
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.7)',
  accent: '#14b8a6',
  accentHover: '#2dd4bf',
  accentSoft: 'rgba(13,148,136,0.2)',
  border: 'rgba(13,148,136,0.35)',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,20,25,0.75) 60%, rgba(15,20,25,0.98) 100%)',
}

export default function K2FamilieHomePage() {
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()
  const content = useMemo(() => getFamilyPageContent(currentTenantId), [currentTenantId])
  const texts = useMemo(() => getFamilyPageTexts(currentTenantId), [currentTenantId])
  const welcomeImage = content.welcomeImage || ''

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: 0, maxWidth: '100%' }}>
        {/* Toolbar: Projekte, Familie wählen (APf-Kontext) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.6rem 1rem',
          background: 'rgba(13,148,136,0.12)',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <Link to={PLATFORM_ROUTES.projects} className="meta" style={{ color: C.textSoft }}>← Projekte</Link>
          <span className="meta" style={{ color: C.textSoft }}>Familie:</span>
          <select
            value={currentTenantId}
            onChange={(e) => setCurrentTenantId(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              padding: '0.35rem 0.6rem',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
            }}
          >
            {tenantList.map((id) => (
              <option key={id} value={id}>{getFamilieTenantDisplayName(id, 'Standard')}</option>
            ))}
          </select>
          <button type="button" className="btn-outline" onClick={() => addTenant()} style={{ borderColor: C.border, color: C.accent }}>Neue Familie</button>
        </div>

        {/* Hero: Willkommensbild oder Verlauf */}
        <div style={{ position: 'relative', width: '100%', height: 'clamp(240px, 42vh, 400px)', overflow: 'hidden' }}>
          {welcomeImage ? (
            <img src={welcomeImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(13,148,136,0.4) 0%, rgba(20,184,166,0.25) 50%, rgba(15,20,25,0.9) 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1.25rem, 5vw, 2.5rem)' }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {texts.welcomeSubtitle}
            </p>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              {texts.welcomeTitle}
            </h1>
          </div>
        </div>

        {/* Intro + Aktionen */}
        <div style={{ padding: '1.5rem 1.25rem', maxWidth: 720, margin: '0 auto' }}>
          <p style={{ margin: '0 0 1.25rem', fontSize: '1rem', lineHeight: 1.6, color: C.textSoft }}>
            {texts.introText}
          </p>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <Link
              to={PROJECT_ROUTES['k2-familie'].stammbaum}
              className="btn"
              style={{
                padding: '0.9rem 1rem',
                background: C.accentSoft,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.accent,
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              🌳 {texts.buttonStammbaum}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].events}
              className="btn"
              style={{
                padding: '0.9rem 1rem',
                background: C.accentSoft,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.accent,
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              📅 {texts.buttonEvents}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].kalender}
              className="btn"
              style={{
                padding: '0.9rem 1rem',
                background: C.accentSoft,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.accent,
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              📆 {texts.buttonKalender}
            </Link>
          </div>
          <p className="meta" style={{ marginTop: '1.25rem' }}>
            <Link to={PROJECT_ROUTES['k2-familie'].uebersicht} style={{ color: C.textSoft, textDecoration: 'none' }}>Leitbild & Vision →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
