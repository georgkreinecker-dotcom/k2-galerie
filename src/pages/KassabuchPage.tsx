/**
 * Kassabuch – Liste aller Buchungen, separat druckbar, Export für Steuerberater.
 * Bereich „Kassa, Lager & Listen“ – im Ordner extra gekennzeichnet, übermittelbar.
 */

import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  getKassabuchMitEingaengen,
  getKassabuchArtLabel,
  exportKassabuchCsv,
  hasKassa,
  hasKassabuchVoll,
  isKassabuchAktiv,
  setKassabuchAktiv,
  type KassabuchEintrag,
} from '../utils/kassabuchStorage'

const s = {
  bg: '#f8f7f5',
  card: '#ffffff',
  accent: '#7a3b1e',
  text: '#1c1a17',
  muted: '#7a6f66',
  radius: '14px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}

function getTenant(location: ReturnType<typeof useLocation>): 'k2' | 'oeffentlich' {
  const state = location.state as { fromOeffentlich?: boolean } | null
  if (state?.fromOeffentlich === true) return 'oeffentlich'
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich') return 'oeffentlich'
  return 'k2'
}

export default function KassabuchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const tenant = getTenant(location)
  const kassaVerfuegbar = hasKassa(tenant)
  const kassabuchVoll = hasKassabuchVoll(tenant)
  const [aktiv, setAktiv] = useState(() => isKassabuchAktiv(tenant))
  const [entries, setEntries] = useState<KassabuchEintrag[]>(() => getKassabuchMitEingaengen(tenant))
  const [von, setVon] = useState('')
  const [bis, setBis] = useState('')

  const sortedEntries = useMemo(() => {
    let list = [...entries]
    if (!kassabuchVoll || !aktiv) list = list.filter(e => e.art === 'eingang')
    return list.sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  }, [entries, aktiv, kassabuchVoll])

  /** Gefilterte Einträge nach Zeitraum (wie in der Tabelle). */
  const filteredByPeriod = useMemo(() => {
    return sortedEntries.filter(e => (!von || e.datum >= von) && (!bis || e.datum <= bis))
  }, [sortedEntries, von, bis])

  /** Einfache Summen – Einnahmen, Ausgaben, Saldo für den gewählten Zeitraum. */
  const { summeEinnahmen, summeAusgaben, saldo } = useMemo(() => {
    const einnahmen = filteredByPeriod.filter(e => e.art === 'eingang' || e.art === 'bank_an_kassa').reduce((s, e) => s + e.betrag, 0)
    const ausgaben = filteredByPeriod.filter(e => ['ausgang', 'bar_privat', 'bar_beleg', 'kassa_an_bank'].includes(e.art)).reduce((s, e) => s + e.betrag, 0)
    return { summeEinnahmen: einnahmen, summeAusgaben: ausgaben, saldo: einnahmen - ausgaben }
  }, [filteredByPeriod])

  const refresh = () => {
    setEntries(getKassabuchMitEingaengen(tenant))
    setAktiv(isKassabuchAktiv(tenant))
  }
  const toggleAktiv = () => {
    const next = !aktiv
    setKassabuchAktiv(tenant, next)
    setAktiv(next)
  }

  const handleExportCsv = () => {
    const toExport = (kassabuchVoll && aktiv) ? entries : entries.filter(e => e.art === 'eingang')
    const csv = exportKassabuchCsv(toExport, von || undefined, bis || undefined)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Kassabuch_${tenant}_${von || 'alle'}_${bis || 'alle'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  /** PDF = gleiche Druckansicht, Nutzer wählt „Als PDF speichern“. */
  const handleExportPdf = () => {
    window.print()
  }

  if (!kassaVerfuegbar) {
    return (
      <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: s.text, marginBottom: '0.5rem' }}>📒 Kassabuch</h1>
          <p style={{ color: s.muted, marginBottom: '1rem' }}>
            Kassa und Kassabuch sind ab der Lizenzstufe <strong>Pro</strong> verfügbar. Basic enthält keine Kassa.
          </p>
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', borderRadius: s.radius, textDecoration: 'none', fontWeight: 600 }}>
            Lizenz ansehen
          </Link>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/admin" style={{ fontSize: '0.9rem', color: s.muted, textDecoration: 'none' }}>← Admin</Link>
          </div>
        </div>
      </div>
    )
  }

  const navLinks = (
    <div className="kassabuch-nav no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <Link to={PROJECT_ROUTES['k2-galerie'].kassa} style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}>
        ← Kassa
      </Link>
      <Link to={PROJECT_ROUTES['k2-galerie'].buchhaltung} state={{ fromOeffentlich: tenant === 'oeffentlich' }} style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}>
        Buchhaltung
      </Link>
      <Link to="/admin" style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}>
        Admin
      </Link>
    </div>
  )

  return (
    <div className="kassabuch-page" style={{ minHeight: '100vh', background: s.bg, padding: '0.75rem', paddingTop: 'max(0.75rem, env(safe-area-inset-top))', boxSizing: 'border-box', overflowX: 'hidden', minWidth: 0 }}>
      <div className="no-print kassabuch-content" style={{ maxWidth: 900, margin: '0 auto', width: '100%', minWidth: 0, paddingLeft: '0.25rem', paddingRight: '0.25rem', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '1.5rem' }}>{navLinks}</div>

        <h1 style={{ fontSize: '1.5rem', color: s.text, marginBottom: '0.25rem' }}>📒 Kassabuch</h1>
        <p style={{ color: s.muted, marginBottom: '1rem', fontSize: '0.95rem' }}>
          {kassabuchVoll ? 'Chronologische Buchungen – steuerberatergeeignet, separat druckbar und übermittelbar.' : 'Pro: Nur Verkäufe (Eingänge). Volles Kassabuch (Ausgänge, Bar privat, Belege) mit Pro+.'}
        </p>

        {kassabuchVoll && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ color: s.text, fontSize: '0.95rem', fontWeight: 500 }}>Kassabuch führen:</label>
          <button
            type="button"
            onClick={toggleAktiv}
            style={{
              padding: '0.35rem 0.75rem',
              background: aktiv ? '#2d7a3a' : s.muted,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {aktiv ? 'Ja' : 'Nein'}
          </button>
          <span style={{ color: s.muted, fontSize: '0.85rem' }}>
            {aktiv ? 'Eingänge + Ausgänge' : 'Nur Verkäufe (Eingänge)'}
          </span>
        </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {kassabuchVoll && aktiv && (
            <button
              type="button"
              onClick={() => navigate(PROJECT_ROUTES['k2-galerie'].kassabuchAusgang, { state: { fromOeffentlich: tenant === 'oeffentlich' } })}
              style={{
                padding: '0.75rem 1.25rem',
                background: s.accent,
                color: '#fff',
                border: 'none',
                borderRadius: s.radius,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Neuer Kassausgang
            </button>
          )}
          <button type="button" onClick={refresh} style={{ padding: '0.75rem 1.25rem', background: s.card, color: s.text, border: `1px solid ${s.muted}`, borderRadius: s.radius, cursor: 'pointer' }}>
            Aktualisieren
          </button>
          <button type="button" onClick={handlePrint} style={{ padding: '0.75rem 1.25rem', background: s.card, color: s.text, border: `1px solid ${s.muted}`, borderRadius: s.radius, cursor: 'pointer' }}>
            Drucken
          </button>
          <button type="button" onClick={handleExportPdf} style={{ padding: '0.75rem 1.25rem', background: '#1a5f7a', color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
            Export PDF (Steuerberater)
          </button>
          <button type="button" onClick={handleExportCsv} style={{ padding: '0.75rem 1.25rem', background: '#2d7a3a', color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
            Export CSV (Steuerberater)
          </button>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Von</label>
          <input type="date" value={von} onChange={e => setVon(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Bis</label>
          <input type="date" value={bis} onChange={e => setBis(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
        </div>

        {/* Summen für den Zeitraum – einfach, für jeden verständlich */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: s.radius, border: '1px solid #2d7a3a33', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Einnahmen</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1b5e20' }}>{summeEinnahmen.toFixed(2)} €</div>
          </div>
          <div style={{ background: '#ffebee', padding: '1rem', borderRadius: s.radius, border: '1px solid #c6282833', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Ausgaben</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#b71c1c' }}>{summeAusgaben.toFixed(2)} €</div>
          </div>
          <div style={{ background: saldo >= 0 ? '#e3f2fd' : '#fff3e0', padding: '1rem', borderRadius: s.radius, border: `1px solid ${saldo >= 0 ? '#1565c033' : '#e6510033'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Saldo</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: saldo >= 0 ? '#0d47a1' : '#e65100' }}>{saldo.toFixed(2)} €</div>
          </div>
        </div>

        <div style={{ background: s.card, borderRadius: s.radius, boxShadow: s.shadow, overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', maxWidth: '100%' }}>
          <table className="kassabuch-table" style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f4f2', color: s.text }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Datum</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Art</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Betrag</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Verwendungszweck</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Beleg</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries
                .filter(e => (!von || e.datum >= von) && (!bis || e.datum <= bis))
                .map(e => (
                  <tr key={e.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', color: s.text }}>{e.datum}</td>
                    <td style={{ padding: '0.75rem', color: s.text }}>{getKassabuchArtLabel(e.art)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: s.text }}>{e.betrag.toFixed(2)} €</td>
                    <td style={{ padding: '0.75rem', color: '#5c5650' }}>{(e.verwendungszweck || '').slice(0, 40)}{(e.verwendungszweck?.length || 0) > 40 ? '…' : ''}</td>
                    <td style={{ padding: '0.75rem', color: s.text }}>
                      {e.belegImage ? <span title="Belegfoto">📷</span> : null}
                      {e.belegQrText ? <span title={e.belegQrText.slice(0, 100)}>📄</span> : null}
                      {!e.belegImage && !e.belegQrText ? '–' : null}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {sortedEntries.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: s.muted }}>Noch keine Buchungen. „Neuer Kassausgang“ für Bar privat, Bar an Bank oder Bar mit Beleg.</div>
          )}
        </div>
      </div>

      {/* Mobile: Retour-Kassa/Admin fixiert unten, gut erreichbar; Tabelle lesbar (dunkle Schrift) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
        @media (max-width: 768px) {
          .kassabuch-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: ${s.card};
            box-shadow: 0 -2px 12px rgba(0,0,0,0.12);
            padding: 0.75rem 1rem;
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
            z-index: 50;
            justify-content: center;
            gap: 1rem;
          }
          .kassabuch-content { padding-bottom: 5rem !important; }
          .kassabuch-table { font-size: 0.95rem !important; }
          .kassabuch-table td { color: #1c1a17 !important; }
          .kassabuch-table th { color: #1c1a17 !important; }
        }
      `}</style>
    </div>
  )
}
