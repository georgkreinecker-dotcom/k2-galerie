/**
 * K2 Familie – Fertige Homepage (nutzerorientiert).
 * Route: /projects/k2-familie (Index).
 * Willkommen + Bild + erste Aktionen (Stammbaum, Events, Kalender). Pro Tenant Texte/Bilder.
 */

import { Link, useSearchParams } from 'react-router-dom'
import FamilieBackButton from '../components/FamilieBackButton'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { getFamilyPageContent } from '../config/pageContentFamilie'
import { getFamilyPageTexts } from '../config/pageTextsFamilie'
import { loadEinstellungen, saveEinstellungen, loadPersonen } from '../utils/familieStorage'
import type { K2FamilieStartpunktTyp } from '../types/k2Familie'
import QRCode from 'qrcode'
import { getFamilieTenantDisplayName, seedFamilieHuber, FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { useMemo, useState, useEffect, useRef, type CSSProperties } from 'react'

const C = {
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.78)',
  accent: '#14b8a6',
  accentHover: '#2dd4bf',
  border: 'rgba(13,148,136,0.35)',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(15,20,25,0.6) 50%, rgba(15,20,25,0.96) 100%)',
  /* Bunte Buttons wie Spielplatz */
  btnStammdaten: 'linear-gradient(135deg, #0e7490 0%, #14b8a6 100%)',
  btnStammbaum: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  btnEvents: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
  btnKalender: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
}

const actionBtnBase: CSSProperties = {
  padding: '1.1rem 1.25rem',
  border: 'none',
  borderRadius: 20,
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const STARTPUNKT_LABELS: Record<K2FamilieStartpunktTyp, string> = {
  ich: 'Bei mir',
  eltern: 'Bei meinen Eltern',
  grosseltern: 'Bei meinen Großeltern',
}

export default function K2FamilieHomePage() {
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant, refreshFromStorage } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannBearbeiten = capabilities.canEditFamiliendaten
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz
  const [searchParams, setSearchParams] = useSearchParams()
  const [musterLoaded, setMusterLoaded] = useState(false)
  const [startpunkt, setStartpunkt] = useState<K2FamilieStartpunktTyp | undefined>(undefined)
  const [partnerHerkunftId, setPartnerHerkunftId] = useState<string>('')
  const [ichBinPersonId, setIchBinPersonIdState] = useState<string>('')
  const [mitgliedsNummer, setMitgliedsNummer] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [ansichtEinstellungenOpen, setAnsichtEinstellungenOpen] = useState(false)
  const ansichtEinstellungenRef = useRef<HTMLDetailsElement>(null)
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])
  const content = useMemo(() => getFamilyPageContent(currentTenantId), [currentTenantId])
  const texts = useMemo(() => getFamilyPageTexts(currentTenantId), [currentTenantId])
  const welcomeImage = content.welcomeImage || ''

  useEffect(() => {
    const einst = loadEinstellungen(currentTenantId)
    setStartpunkt(einst.startpunktTyp)
    setPartnerHerkunftId(einst.partnerHerkunftPersonId ?? '')
    setIchBinPersonIdState(einst.ichBinPersonId ?? '')
    setMitgliedsNummer(einst.mitgliedsNummerAdmin ?? '')
  }, [currentTenantId])

  /** QR-Link (?t=tenant&z=nummer): Familie wählen und Zugangsnummer übernehmen. */
  useEffect(() => {
    const t = searchParams.get('t')?.trim()
    const z = searchParams.get('z')?.trim()
    if (!t && !z) return
    const strip = () => {
      const next = new URLSearchParams(searchParams)
      next.delete('t')
      next.delete('z')
      setSearchParams(next, { replace: true })
    }
    if (t && tenantList.includes(t)) {
      setCurrentTenantId(t)
      if (z && kannInstanz) {
        const einst = loadEinstellungen(t)
        if (saveEinstellungen(t, { ...einst, mitgliedsNummerAdmin: z })) {
          setMitgliedsNummer(z)
        }
      }
      strip()
      return
    }
    if (!t && z) {
      if (kannInstanz) {
        const einst = loadEinstellungen(currentTenantId)
        if (saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: z })) {
          setMitgliedsNummer(z)
        }
      }
      strip()
    }
  }, [searchParams, tenantList, setCurrentTenantId, setSearchParams, currentTenantId, kannInstanz])

  const ichName = useMemo(() => {
    const id = ichBinPersonId?.trim()
    if (!id) return ''
    return personen.find((p) => p.id === id)?.name?.trim() ?? ''
  }, [personen, ichBinPersonId])

  useEffect(() => {
    const z = mitgliedsNummer.trim()
    if (!z) {
      setQrDataUrl('')
      return
    }
    const url = new URL(`${window.location.origin}${PROJECT_ROUTES['k2-familie'].home}`)
    url.searchParams.set('t', currentTenantId)
    url.searchParams.set('z', z)
    let cancelled = false
    QRCode.toDataURL(url.toString(), { width: 168, margin: 1, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [mitgliedsNummer, currentTenantId])

  const setStartpunktTyp = (typ: K2FamilieStartpunktTyp) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, startpunktTyp: typ })) {
      setStartpunkt(typ)
    }
  }

  const setPartnerHerkunft = (personId: string) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, partnerHerkunftPersonId: nextId })) {
      setPartnerHerkunftId(personId)
    }
  }

  const setIchBinPerson = (personId: string) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: nextId })) {
      setIchBinPersonIdState(personId)
    }
  }

  const persistMitgliedsNummer = (raw: string) => {
    if (!kannInstanz) return
    const einst = loadEinstellungen(currentTenantId)
    const next = raw.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: next })) {
      setMitgliedsNummer(raw.trim())
    }
  }

  const openAnsichtEinstellungen = () => {
    setAnsichtEinstellungenOpen(true)
    requestAnimationFrame(() => {
      ansichtEinstellungenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const stammdatenLinkTo =
    ichBinPersonId?.trim() ? `${PROJECT_ROUTES['k2-familie'].personen}/${ichBinPersonId.trim()}` : null

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
          <FamilieBackButton className="meta" style={{ color: C.textSoft }} />
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
          {kannInstanz && (
            <button type="button" className="btn-outline" onClick={() => addTenant()} style={{ borderColor: C.border, color: C.accent }}>Neue Familie</button>
          )}
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

        {/* Hauptaktionen zuerst – Stammbaum-Ansicht nur unter „mehr“ */}
        <div style={{ padding: '1.75rem 1.25rem', maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 0.85rem', fontSize: '1.12rem', fontWeight: 700, color: C.accent }}>Was möchtest du tun?</h2>

          <div className="k2-familie-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.35rem' }}>
            {stammdatenLinkTo ? (
              <Link
                to={stammdatenLinkTo}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnStammdaten,
                  boxShadow: '0 8px 28px rgba(14, 116, 144, 0.45)',
                }}
              >
                👤 Meine Stammdaten
              </Link>
            ) : (
              <button
                type="button"
                className="btn k2-familie-action-btn"
                disabled={!kannStruktur}
                onClick={kannStruktur ? openAnsichtEinstellungen : undefined}
                style={{
                  ...actionBtnBase,
                  background: C.btnStammdaten,
                  boxShadow: '0 8px 28px rgba(14, 116, 144, 0.35)',
                  opacity: kannStruktur ? 1 : 0.55,
                  cursor: kannStruktur ? 'pointer' : 'not-allowed',
                }}
              >
                👤 Stammdaten – zuerst „Du“ festlegen
              </button>
            )}
            <Link
              to={PROJECT_ROUTES['k2-familie'].stammbaum}
              className="btn k2-familie-action-btn"
              style={{
                ...actionBtnBase,
                background: C.btnStammbaum,
                boxShadow: '0 8px 28px rgba(5, 150, 105, 0.4)',
              }}
            >
              🌳 {texts.buttonStammbaum}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].events}
              className="btn k2-familie-action-btn"
              style={{
                ...actionBtnBase,
                background: C.btnEvents,
                boxShadow: '0 8px 28px rgba(234, 88, 12, 0.35)',
              }}
            >
              🎉 {texts.buttonEvents}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].kalender}
              className="btn k2-familie-action-btn"
              style={{
                ...actionBtnBase,
                background: C.btnKalender,
                boxShadow: '0 8px 28px rgba(13, 148, 136, 0.4)',
              }}
            >
              📆 {texts.buttonKalender}
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-familie'].gedenkort}
              className="btn k2-familie-action-btn"
              style={{
                ...actionBtnBase,
                background: 'rgba(100,116,139,0.5)',
                boxShadow: '0 8px 28px rgba(71,85,105,0.35)',
              }}
            >
              🕯️ Gedenkort
            </Link>
          </div>

          <p style={{ margin: '0 0 1.35rem', fontSize: '0.95rem', lineHeight: 1.55, color: C.textSoft }}>
            {texts.introText}
          </p>

          <div
            className="card"
            style={{
              marginBottom: '1.25rem',
              borderLeft: '4px solid rgba(45,212,191,0.75)',
              background: 'rgba(13,148,136,0.08)',
            }}
          >
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: C.accent }}>Zugang & Name</h2>
            <p className="meta" style={{ margin: '0 0 0.85rem', lineHeight: 1.45 }}>
              Nummer vom Administrator; QR öffnet dieselbe Familie mit Zugangscode. Anzeigename kommt aus der Person „Du“ (siehe Stammbaum-Ansicht einstellen).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div>
                <div className="meta" style={{ marginBottom: 6 }}>Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.text }}>
                  {ichName || '— sobald „Du“ gesetzt ist'}
                </div>
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 180 }}>
                <label className="meta" htmlFor="k2fam-mitgliedsnummer" style={{ display: 'block', marginBottom: 6 }}>
                  Zugangsnummer (vom Administrator)
                </label>
                <input
                  id="k2fam-mitgliedsnummer"
                  type="text"
                  autoComplete="off"
                  readOnly={!kannInstanz}
                  value={mitgliedsNummer}
                  onChange={(e) => setMitgliedsNummer(e.target.value)}
                  onBlur={() => persistMitgliedsNummer(mitgliedsNummer)}
                  placeholder="z. B. KF-2026-0042"
                  title={!kannInstanz ? 'Nur Inhaber:in kann die Zugangsnummer ändern.' : undefined}
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    padding: '0.45rem 0.6rem',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    opacity: kannInstanz ? 1 : 0.85,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="meta" style={{ marginBottom: 6 }}>QR zum Einstieg</div>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="" width={168} height={168} style={{ display: 'block', borderRadius: 12, border: `1px solid ${C.border}` }} />
                ) : (
                  <div
                    style={{
                      width: 168,
                      height: 168,
                      borderRadius: 12,
                      border: `1px dashed ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: C.textSoft,
                      fontSize: '0.82rem',
                      padding: '0 0.5rem',
                      lineHeight: 1.35,
                    }}
                  >
                    Nummer eintragen, dann erscheint der Code
                  </div>
                )}
              </div>
            </div>
          </div>

          <details
            ref={ansichtEinstellungenRef}
            id="k2-familie-ansicht-einstellungen"
            open={ansichtEinstellungenOpen}
            onToggle={(e) => setAnsichtEinstellungenOpen((e.target as HTMLDetailsElement).open)}
            className="card"
            style={{ marginBottom: '1.5rem', border: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.12)' }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.98rem',
                color: C.accent,
              }}
            >
              Stammbaum-Ansicht einstellen (Startpunkt, Partner-Zweig, wer „Du“ bist)
            </summary>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ margin: 0, borderLeft: '4px solid rgba(20,184,166,0.5)' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Wo beginnt deine Familie?</h2>
                {startpunkt ? (
                  <p style={{ margin: 0, color: C.textSoft }}>
                    <strong>{STARTPUNKT_LABELS[startpunkt]}</strong>
                    <button type="button" className="btn-outline" disabled={!kannStruktur} onClick={() => setStartpunkt(undefined)} style={{ marginLeft: '0.75rem', fontSize: '0.85rem', borderColor: C.border, color: C.accent, opacity: kannStruktur ? 1 : 0.55 }}>Ändern</button>
                  </p>
                ) : (
                  <>
                    <p className="meta" style={{ margin: '0 0 0.75rem' }}>Anker für Stammbaum und Übersicht.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(['ich', 'eltern', 'grosseltern'] as const).map((typ) => (
                        <button key={typ} type="button" className="btn" disabled={!kannBearbeiten} onClick={() => setStartpunktTyp(typ)} style={{ background: 'rgba(20,184,166,0.25)', border: `1px solid ${C.border}`, color: C.accent, opacity: kannBearbeiten ? 1 : 0.55 }}>
                          {STARTPUNKT_LABELS[typ]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="card" style={{ margin: 0, borderLeft: '4px solid rgba(234,88,12,0.5)' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Familie des Partners gleichrangig?</h2>
                <p className="meta" style={{ margin: '0 0 0.5rem' }}>Optional: zweiter Herkunfts-Zweig – „Meine Herkunft“ und „Herkunft [Partner]“ gleichwertig.</p>
                <select
                  value={partnerHerkunftId ?? ''}
                  disabled={!kannStruktur}
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
                    opacity: kannStruktur ? 1 : 0.75,
                  }}
                >
                  <option value="">Keiner (nur ein Zweig)</option>
                  {personen.map((p) => (
                    <option key={p.id} value={p.id}>Herkunft {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="card" style={{ margin: 0, borderLeft: '4px solid rgba(5,150,105,0.6)' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: C.accent }}>Dein Platz im Stammbaum („Du“)</h2>
                <p className="meta" style={{ margin: '0 0 0.5rem' }}>Diese Person wird im Stammbaum hervorgehoben; von hier aus gelangst du zu „Meine Stammdaten“.</p>
                <select
                  value={ichBinPersonId ?? ''}
                  disabled={!kannStruktur}
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
                    opacity: kannStruktur ? 1 : 0.75,
                  }}
                >
                  <option value="">Nicht festgelegt</option>
                  {personen.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          {!tenantList.includes(FAMILIE_HUBER_TENANT_ID) && kannInstanz && (
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
