/**
 * Phase A – Steuerzentrale: Attribution + Regeln + manuelle Kosten (Reichweite halbautomatisch).
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG,
  K2_AGENTUR_PHASE_A_PILOT,
  K2_AGENTUR_STEUER_SCHWELLEN,
  STEUER_AMPEL_STYLE,
  STEUER_EMPFEHLUNG_LABEL,
  evaluateKanalSteuerung,
} from '../../config/k2AgenturSteuerRegeln'
import { K2_AGENTUR_PLATTFORM_CONSOLE_URL } from '../../config/k2AgenturLaunchCheckliste'
import { listMarketingKanalUrls } from '../../config/marketingKanalP1P2P3'
import {
  buildAttributionMapForKanaele,
  fetchMarketingAttributionSummary,
} from '../../utils/k2AgenturAttributionClient'
import {
  kanalStorageKey,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onPatchKanal: (key: string, patch: Partial<K2AgenturPlattformState['kanaele'][string]>) => void
  /** Nur Pilot (P1 Google) oder alle Kanäle mit Status live/pausiert */
  mode?: 'pilot' | 'alle_live'
}

export default function K2AgenturSteuerzentralePanel({
  state,
  onPatchKanal,
  mode = 'pilot',
}: Props) {
  const [loading, setLoading] = useState(true)
  const [attrError, setAttrError] = useState<string | undefined>()
  const [attrConfigured, setAttrConfigured] = useState(false)
  const [summary, setSummary] = useState<ReturnType<typeof buildAttributionMapForKanaele>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMarketingAttributionSummary(7).then((res) => {
      if (cancelled) return
      setAttrConfigured(res.configured)
      setAttrError(res.error)
      setSummary(
        buildAttributionMapForKanaele(res.summary, res.configured),
      )
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const pilotKey = kanalStorageKey(K2_AGENTUR_PHASE_A_PILOT.produkt, K2_AGENTUR_PHASE_A_PILOT.kanal)

  useEffect(() => {
    if (mode !== 'pilot') return
    const row = state.kanaele[pilotKey]
    if (!row || row.kostenEur7Tage.trim()) return
    const flag = 'k2-agentur-kosten-abrechnung-2026-06-12'
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(flag) === '1') return
    onPatchKanal(pilotKey, { kostenEur7Tage: K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG })
    try {
      sessionStorage.setItem(flag, '1')
    } catch {
      /* optional */
    }
  }, [mode, pilotKey, state.kanaele, onPatchKanal])

  const slots = useMemo(() => {
    const katalog = listMarketingKanalUrls()
    if (mode === 'pilot') {
      const p = K2_AGENTUR_PHASE_A_PILOT
      const meta = katalog.find((r) => r.produkt === p.produkt && r.kanal === p.kanal)
      if (!meta) return []
      return [{ key: kanalStorageKey(p.produkt, p.kanal), meta }]
    }
    return katalog
      .map((meta) => ({ key: kanalStorageKey(meta.produkt, meta.kanal), meta }))
      .filter(({ key }) => {
        const st = state.kanaele[key]?.status
        return st === 'live' || st === 'pausiert'
      })
  }, [mode, state.kanaele])

  return (
    <section
      style={{
        padding: '1rem 1.1rem',
        borderRadius: 12,
        border: '2px solid #1d4ed8',
        background: 'linear-gradient(145deg, #eff6ff 0%, #f8fafc 100%)',
      }}
    >
      <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.12rem', color: '#1e3a8a' }}>
        Steuerzentrale · Phase A
      </h2>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.55 }}>
        <strong>Mächtigstes Start-Instrument:</strong> {K2_AGENTUR_PHASE_A_PILOT.label} – Suche mit
        Kaufabsicht. Reichweite stellst du im Ads-Konto (Budget/Zielgruppe); K2 wertet{' '}
        <strong>Landings + Lizenzen</strong> aus und empfiehlt Pause, Prüfen oder Weiter.
      </p>
      <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
        Schwelle Pause ohne Lizenz: ≥ {K2_AGENTUR_STEUER_SCHWELLEN.kostenOhneConversionPauseEur} €
        (7 Tage). Kosten aus Google Ads → hier eintragen.
      </p>

      {loading && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>⏳ Lade Messung (7 Tage)…</p>
      )}
      {!loading && attrError && (
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.85rem', color: '#b91c1c' }}>⚠️ {attrError}</p>
      )}
      {!loading && !attrConfigured && (
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.85rem', color: '#92400e' }}>
          ⚠️ Attribution nicht konfiguriert – Ampel nur über manuelle Kosten.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {slots.map(({ key, meta }) => (
          <KanalSteuerKarte
            key={key}
            produktLabel={meta.produktLabel}
            kanalLabel={meta.kanalLabel}
            campaignKey={meta.campaignKey}
            row={state.kanaele[key]}
            attribution={
              summary[key] ?? { landings: 0, conversions: 0, configured: attrConfigured }
            }
            onPatch={(patch) => onPatchKanal(key, patch)}
          />
        ))}
        {slots.length === 0 && mode === 'alle_live' && (
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Noch kein Kanal auf „Live“ – zuerst schalten, dann erscheint die Steuerung hier.
          </p>
        )}
      </div>

      <details style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#475569' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Die 3 Hebel (wo du steuerst)</summary>
        <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.55 }}>
          <li>
            <strong>Budget</strong> – Google Ads → Tagesbudget (Reichweite)
          </li>
          <li>
            <strong>Zielgruppe/Keywords</strong> – Google Ads → Suchbegriffe
          </li>
          <li>
            <strong>Aktiv/Pause</strong> – Google Ads → Kampagnenstatus
          </li>
        </ol>
      </details>
    </section>
  )
}

function KanalSteuerKarte({
  produktLabel,
  kanalLabel,
  campaignKey,
  row,
  attribution,
  onPatch,
}: {
  produktLabel: string
  kanalLabel: string
  campaignKey: string
  row: K2AgenturPlattformState['kanaele'][string] | undefined
  attribution: { landings: number; conversions: number; configured: boolean }
  onPatch: (patch: Partial<K2AgenturPlattformState['kanaele'][string]>) => void
}) {
  if (!row) return null

  const ergebnis = evaluateKanalSteuerung({
    status: row.status,
    budgetEurMonat: row.budgetEurMonat,
    kostenEur7Tage: row.kostenEur7Tage,
    attribution,
  })
  const style = STEUER_AMPEL_STYLE[ergebnis.ampel]
  const consoleUrl = K2_AGENTUR_PLATTFORM_CONSOLE_URL[row.kanal]

  return (
    <article
      style={{
        padding: '0.85rem 1rem',
        borderRadius: 10,
        border: `2px solid ${style.border}`,
        background: style.bg,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 800, color: '#1c1a18', fontSize: '0.95rem' }}>
          {produktLabel} · {kanalLabel}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: 6,
            background: '#fff',
            border: `1px solid ${style.border}`,
            color: style.text,
          }}
        >
          {style.emoji} {STEUER_EMPFEHLUNG_LABEL[ergebnis.empfehlung]}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#5c5650' }}>{campaignKey}</span>
      </div>

      <div style={{ fontWeight: 700, color: style.text, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
        {ergebnis.titel}
      </div>
      <p style={{ margin: '0 0 0.65rem', fontSize: '0.84rem', color: '#1c1a18', lineHeight: 1.5 }}>
        {ergebnis.detail}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.65rem',
          fontSize: '0.82rem',
        }}
      >
        <Metric label="Landings (7 T.)" value={String(attribution.landings)} />
        <Metric label="Lizenzen (7 T.)" value={String(attribution.conversions)} />
        <Metric label="Status" value={row.status} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end' }}>
        <label style={fieldLabel}>
          Kosten 7 T. (€)
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 12"
            value={row.kostenEur7Tage}
            onChange={(e) => onPatch({ kostenEur7Tage: e.target.value.slice(0, 16) })}
            style={inputStyle}
          />
        </label>
        {row.kostenEur7Tage.trim() !== K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG && (
          <button
            type="button"
            onClick={() => onPatch({ kostenEur7Tage: K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG })}
            style={{
              ...linkBtn,
              border: '1px solid #b54a1e',
              color: '#b54a1e',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Abrechnung 6.–12.6.: {K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG} €
          </button>
        )}
        <label style={fieldLabel}>
          Budget/Monat (€)
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 150"
            value={row.budgetEurMonat}
            onChange={(e) => onPatch({ budgetEurMonat: e.target.value.slice(0, 32) })}
            style={inputStyle}
          />
        </label>
        <a href={consoleUrl} target="_blank" rel="noopener noreferrer" style={linkBtn}>
          ↗ {ergebnis.aktionLabel} (Ads)
        </a>
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
      <div style={{ fontSize: '0.72rem', color: '#5c5650' }}>{label}</div>
      <div style={{ fontWeight: 800, color: '#1c1a18' }}>{value}</div>
    </div>
  )
}

const fieldLabel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#1c1a18',
}

const inputStyle: CSSProperties = {
  padding: '0.4rem 0.55rem',
  borderRadius: 6,
  border: '1px solid #c4b8a8',
  fontSize: '0.88rem',
  minWidth: '5.5rem',
  fontFamily: 'inherit',
}

const linkBtn: CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #1d4ed8',
  background: '#fff',
  color: '#1d4ed8',
  fontWeight: 700,
  fontSize: '0.85rem',
  textDecoration: 'none',
}
