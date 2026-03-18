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
import { loadEinstellungen, saveEinstellungen, loadPersonen } from '../utils/familieStorage'
import type { K2FamilieStartpunktTyp } from '../types/k2Familie'
import { getFamilieTenantDisplayName, seedFamilieHuber, FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { useMemo, useState, useEffect } from 'react'

const C = {
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.78)',
  accent: '#14b8a6',
  accentHover: '#2dd4bf',
  border: 'rgba(13,148,136,0.35)',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(15,20,25,0.6) 50%, rgba(15,20,25,0.96) 100%)',
  /* Bunte Buttons wie Spielplatz */
  btnStammbaum: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  btnEvents: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
  btnKalender: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
}

const STARTPUNKT_LABELS: Record<K2FamilieStartpunktTyp, string> = {
  ich: 'Bei mir',
  eltern: 'Bei meinen Eltern',
  grosseltern: 'Bei meinen Großeltern',
}

export default function K2FamilieHomePage() {
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant, refreshFromStorage } = useFamilieTenant()
  const [musterLoaded, setMusterLoaded] = useState(false)
  const [startpunkt, setStartpunkt] = useState<K2FamilieStartpunktTyp | undefined>(undefined)
  const [partnerHerkunftId, setPartnerHerkunftId] = useState<string>('')
  const [ichBinPersonId, setIchBinPersonIdState] = useState<string>('')
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])
  const content = useMemo(() => getFamilyPageContent(currentTenantId), [currentTenantId])
  const texts = useMemo(() => getFamilyPageTexts(currentTenantId), [currentTenantId])
  const welcomeImage = content.welcomeImage || ''

  useEffect(() => {
    const einst = loadEinstellungen(currentTenantId)
    setStartpunkt(einst.startpunktTyp)
    setPartnerHerkunftId(einst.partnerHerkunftPersonId ?? '')
  }, [currentTenantId])

  const setStartpunktTyp = (typ: K2FamilieStartpunktTyp) => {
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, startpunktTyp: typ })) {
      setStartpunkt(typ)
    }
  }

  const setPartnerHerkunft = (personId: string) => {
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, partnerHerkunftPersonId: nextId })) {
      setPartnerHerkunftId(personId)
    }
  }

  const setIchBinPerson = (personId: string) => {
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: nextId })) {
      setIchBinPersonIdState(personId)
    }
  }

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

        {/* Hero: lebendig, mit sanftem Verlauf */}
        <div className="k2-familie-hero" style={{ position: 'relative', width: '100%', height: 'clamp(260px, 44vh, 420px)', overflow: 'hidden', borderRadius: '0 0 28px 28px' }}>
          {welcomeImage ? (
            <img src={welcomeImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, rgba(13,148,136,0.5) 0%, rgba(234,88,12,0.15) 40%, rgba(15,20,25,0.92) 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
          <div className="k2-familie-hero-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.04) 45%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1.25rem, 5vw, 2.5rem)' }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>
              {texts.welcomeSubtitle}
            </p>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.85rem, 5vw, 2.9rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {texts.welcomeTitle}
            </h1>
          </div>
        </div>

        {/* Intro + bunte Aktionen (Spielplatz) */}
        <div style={{ padding: '1.75rem 1.25rem', maxWidth: 760, margin: '0 auto' }}>
          <p style={{ margin: '0 0 1.5rem', fontSize: '1.05rem', lineHeight: 1.65, color: C.textSoft }}>
            {texts.introText}
          </p>

          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid rgba(20,184,166,0.5)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Wo beginnt deine Familie?</h2>
            {startpunkt ? (
              <p style={{ margin: 0, color: C.textSoft }}>
                <strong>{STARTPUNKT_LABELS[startpunkt]}</strong>
                <button type="button" className="btn-outline" onClick={() => setStartpunkt(undefined)} style={{ marginLeft: '0.75rem', fontSize: '0.85rem', borderColor: C.border, color: C.accent }}>Ändern</button>
              </p>
            ) : (
              <>
                <p className="meta" style={{ margin: '0 0 0.75rem' }}>Wähle den Anker für Stammbaum und Übersicht.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(['ich', 'eltern', 'grosseltern'] as const).map((typ) => (
                    <button key={typ} type="button" className="btn" onClick={() => setStartpunktTyp(typ)} style={{ background: 'rgba(20,184,166,0.25)', border: `1px solid ${C.border}`, color: C.accent }}>
                      {STARTPUNKT_LABELS[typ]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid rgba(234,88,12,0.5)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Familie des Partners gleichrangig?</h2>
            <p className="meta" style={{ margin: '0 0 0.5rem' }}>Optional: Partner für zweiten Herkunfts-Zweig wählen – „Meine Herkunft“ und „Herkunft [Partner]“ werden gleichwertig dargestellt.</p>
            <select
              value={partnerHerkunftId ?? ''}
              onChange={(e) => setPartnerHerkunft(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                padding: '0.4rem 0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                minWidth: 200,
              }}
            >
              <option value="">Keiner (nur ein Zweig)</option>
              {personen.map((p) => (
                <option key={p.id} value={p.id}>Herkunft {p.name}</option>
              ))}
            </select>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid rgba(5,150,105,0.6)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Dein Platz im Stammbaum</h2>
            <p className="meta" style={{ margin: '0 0 0.5rem' }}>Wer bist du in dieser Familie? Im Stammbaum wird diese Person als „Du“ hervorgehoben (z. B. Stefan in Familie Hube).</p>
            <select
              value={ichBinPersonId ?? ''}
              onChange={(e) => setIchBinPerson(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                padding: '0.4rem 0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                minWidth: 200,
              }}
            >
              <option value="">Nicht festgelegt</option>
              {personen.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="k2-familie-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link
              to={PROJECT_ROUTES['k2-familie'].stammbaum}
              className="btn k2-familie-action-btn"
              style={{
                padding: '1.1rem 1.25rem',
                background: C.btnStammbaum,
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 8px 28px rgba(5, 150, 105, 0.4)',
              }}
            >
              🌳 {texts.buttonStammbaum}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].events}
              className="btn k2-familie-action-btn"
              style={{
                padding: '1.1rem 1.25rem',
                background: C.btnEvents,
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 8px 28px rgba(234, 88, 12, 0.35)',
              }}
            >
              🎉 {texts.buttonEvents}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].kalender}
              className="btn k2-familie-action-btn"
              style={{
                padding: '1.1rem 1.25rem',
                background: C.btnKalender,
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 8px 28px rgba(13, 148, 136, 0.4)',
              }}
            >
              📆 {texts.buttonKalender}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].gedenkort}
              className="btn k2-familie-action-btn"
              style={{
                padding: '1.1rem 1.25rem',
                background: 'rgba(100,116,139,0.5)',
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 8px 28px rgba(71,85,105,0.35)',
              }}
            >
              🕯️ Gedenkort
            </Link>
          </div>

          {!tenantList.includes(FAMILIE_HUBER_TENANT_ID) && (
            <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid rgba(20,184,166,0.6)' }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Musterfamilie Huber</h2>
              <p className="meta" style={{ margin: 0 }}>Demo-Familie mit 16 Personen, Stammbaum und Events – zum Anschauen und Ausprobieren.</p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (seedFamilieHuber()) {
                    refreshFromStorage()
                    setCurrentTenantId(FAMILIE_HUBER_TENANT_ID)
                    setMusterLoaded(true)
                  }
                }}
                style={{ marginTop: '0.75rem', background: 'rgba(20,184,166,0.25)', border: `1px solid ${C.border}`, color: C.accent }}
              >
                → Musterfamilie laden und anzeigen
              </button>
              {musterLoaded && <p className="meta" style={{ marginTop: '0.5rem', color: C.accent }}>Familie Huber geladen. Im Dropdown oben kannst du sie auswählen.</p>}
            </div>
          )}

          <p className="meta" style={{ marginTop: '1.5rem' }}>
            <Link to={PROJECT_ROUTES['k2-familie'].uebersicht} style={{ color: C.textSoft, textDecoration: 'none', transition: 'color 0.2s' }}>Leitbild & Vision →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
