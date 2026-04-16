/**
 * K2 Familie – Einstieg B (gestaltbar, eigene Speicher-Keys).
 * Nur **Musterfamilie Huber** (Umschauen). Mit anderem Mandanten → Redirect „Meine Familie“ (tägliches Erlebnis).
 */

import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useLayoutEffect, useMemo, useState } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { getFamilieEinstiegContent, getFamilieEinstiegTexts } from '../config/einstiegContentFamilie'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { isFamilieNurMusterSession, setFamilieNurMusterSession } from '../utils/familieMusterSession'
import '../App.css'
import { K2_FAMILIE_UI } from '../config/k2FamilieUiColors'

const C = {
  ...K2_FAMILIE_UI,
  accentHover: '#2dd4bf',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,20,25,0.75) 55%, rgba(15,20,25,0.96) 100%)',
}

export default function K2FamilieEinstiegPage() {
  const [searchParams] = useSearchParams()
  const { currentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()
  /** Flyer/Sidebar: `?t=huber` = explizit Musterfamilie – nie sofort nach „Meine Familie“ schicken, nur weil zuvor Kreinecker aktiv war. */
  const tParam = searchParams.get('t')?.trim().toLowerCase() ?? ''
  const huberDemoFromUrl = tParam === FAMILIE_HUBER_TENANT_ID
  /** Nach Layout: Demo-Sitzung gesetzt – kein zweites „großes“ Betreten, wenn du schon in der Huber-Umschau bist. */
  const [demoUmschauAktiv, setDemoUmschauAktiv] = useState(() => isFamilieNurMusterSession())
  useLayoutEffect(() => {
    /** Ohne diese Abfrage: Redirect zu „Meine Familie“ würde trotzdem Nur-Muster setzen → Enforcer zwingt huber, echte Familie (persönlicher QR) wirkt „weg“. */
    if (!huberDemoFromUrl && currentTenantId !== FAMILIE_HUBER_TENANT_ID) return
    setFamilieNurMusterSession(true)
    setDemoUmschauAktiv(true)
    if (huberDemoFromUrl) {
      ensureTenantInListAndSelect(FAMILIE_HUBER_TENANT_ID)
    }
  }, [huberDemoFromUrl, currentTenantId, ensureTenantInListAndSelect])
  const zeigeKompaktenZurUebersicht = huberDemoFromUrl && demoUmschauAktiv
  const tenantForContent = huberDemoFromUrl ? FAMILIE_HUBER_TENANT_ID : currentTenantId
  const texts = useMemo(() => getFamilieEinstiegTexts(tenantForContent), [tenantForContent])
  const content = useMemo(() => getFamilieEinstiegContent(tenantForContent), [tenantForContent])
  const R = PROJECT_ROUTES['k2-familie']
  /** Ohne Huber-URL: wer eine andere Familie gewählt hat, kommt ins tägliche Erlebnis (Meine Familie). */
  if (!huberDemoFromUrl && currentTenantId !== FAMILIE_HUBER_TENANT_ID) {
    return <Navigate to={R.meineFamilie} replace />
  }
  const hero = content.heroImage?.trim() || ''

  return (
    <div className="viewport k2-familie-page" style={{ padding: 0, maxWidth: '100%' }}>
      <div className="k2-familie-hero" style={{ position: 'relative', width: '100%', height: 'clamp(220px, 38vh, 360px)', overflow: 'hidden', borderRadius: '0 0 28px 28px' }}>
        {hero ? (
          <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(145deg, #0f766e 0%, #134e4a 45%, #0f172a 100%)',
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.35rem 1.25rem 1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.45rem, 3.5vw, 2rem)', fontWeight: 800, color: C.text, textShadow: '0 2px 16px rgba(0,0,0,0.45)' }}>
            {texts.title}
          </h1>
          <p style={{ margin: '0.45rem 0 0', fontSize: '1.05rem', color: C.textSoft, maxWidth: 640 }}>{texts.subtitle}</p>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.25rem 2rem', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ color: C.textSoft, lineHeight: 1.65, marginBottom: '1.5rem', fontSize: '1.02rem' }}>{texts.body}</p>
        {zeigeKompaktenZurUebersicht ? (
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: C.text }}>
            <span style={{ color: C.textSoft }}>Du bist in der Musterfamilie-Umschau. </span>
            <Link
              to={`${R.meineFamilie}?t=huber`}
              style={{
                color: C.accent,
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Zur Familien-Übersicht
            </Link>
          </p>
        ) : (
          <Link
            to={`${R.meineFamilie}?t=huber`}
            className="btn"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '1rem 1.25rem',
              borderRadius: 18,
              background: `linear-gradient(135deg, #0d9488 0%, ${C.accent} 100%)`,
              color: '#042f2e',
              fontWeight: 800,
              textDecoration: 'none',
              fontSize: '1.05rem',
              border: `1px solid ${C.border}`,
            }}
          >
            {texts.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
