/**
 * Schalt-Checkliste + Schalt-Paket (Sportwagen: eine Schritt-Liste, Automatisierung beim Kopieren).
 */

import { useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  K2_AGENTUR_GLOBAL_LAUNCH_STEPS,
  K2_AGENTUR_KANAL_LAUNCH_STEPS,
  K2_AGENTUR_PLATTFORM_CONSOLE_URL,
  formatSchaltPaketText,
  getSchaltPaket,
  countLaunchStepsTotal,
} from '../../config/k2AgenturLaunchCheckliste'
import { formatFertigeAnzeigeText, getAnzeigenPaket } from '../../config/k2AgenturAnzeigenTexte'
import { formatAuswertungPaketText } from '../../config/k2AgenturAuswertungPaket'
import { formatCreativeSpecText } from '../../config/k2AgenturCreativeSpec'
import { listMarketingKanalUrls, type MarketingProduktId } from '../../config/marketingKanalP1P2P3'
import {
  applySuggestedStatusToAllKanaele,
  appendKanalNotizBlock,
  getGlobalChecklistProgress,
  getKanalChecklistProgress,
  kanalStorageKey,
  markAnzeigenPaketKopiert,
  markAuswertungPaketKopiert,
  markPaketKopiert,
  suggestKanalStatusFromChecklist,
  toggleGlobalSchritt,
  toggleKanalSchritt,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onPersist: (next: K2AgenturPlattformState) => void
  filter: 'alle' | MarketingProduktId
  onCopyFeedback: (msg: string) => void
  copyText: (text: string) => Promise<boolean>
  openKanal: string | null
  setOpenKanal: (key: string | null) => void
}

export default function K2AgenturLaunchChecklistePanel({
  state,
  onPersist,
  filter,
  onCopyFeedback,
  copyText,
  openKanal,
  setOpenKanal,
}: Props) {
  const katalog = useMemo(() => listMarketingKanalUrls(), [])
  const rows = katalog.filter((r) => filter === 'alle' || r.produkt === filter)
  const globalProg = getGlobalChecklistProgress(state)
  const totals = countLaunchStepsTotal()

  const handlePaketKopieren = async (produkt: MarketingProduktId, kanal: typeof rows[0]['kanal']) => {
    const key = kanalStorageKey(produkt, kanal)
    const paket = getSchaltPaket(produkt, kanal)
    if (!paket) return
    const text = formatSchaltPaketText(paket)
    const ok = await copyText(text)
    if (ok) {
      onPersist(markPaketKopiert(state, key))
      onCopyFeedback(`✅ Schalt-Paket kopiert – Ziel-URL-Schritt abgehakt (${paket.campaignKey})`)
    } else {
      onCopyFeedback('⚠️ Kopieren fehlgeschlagen')
    }
  }

  const handleFertigeAnzeigeKopieren = async (produkt: MarketingProduktId, kanal: typeof rows[0]['kanal']) => {
    const key = kanalStorageKey(produkt, kanal)
    const paket = getAnzeigenPaket(produkt, kanal)
    if (!paket) return
    const ok = await copyText(formatFertigeAnzeigeText(paket))
    if (ok) {
      onPersist(markAnzeigenPaketKopiert(state, key))
      onCopyFeedback('✅ Fertige Anzeige kopiert – Texte + Ziel-URL abgehakt')
    } else {
      onCopyFeedback('⚠️ Kopieren fehlgeschlagen')
    }
  }

  const handleAuswertungKopieren = async (produkt: MarketingProduktId, kanal: typeof rows[0]['kanal']) => {
    const key = kanalStorageKey(produkt, kanal)
    const text = formatAuswertungPaketText(produkt, kanal)
    if (!text) return
    const ok = await copyText(text)
    if (ok) {
      let next = markAuswertungPaketKopiert(state, key)
      next = appendKanalNotizBlock(next, key, text)
      onPersist(next)
      onCopyFeedback('✅ Auswertungs-Vorlage kopiert – in Notizen + Schritt abgehakt')
    } else {
      onCopyFeedback('⚠️ Kopieren fehlgeschlagen')
    }
  }

  const handleCreativeSpecKopieren = async () => {
    const ok = await copyText(formatCreativeSpecText())
    onCopyFeedback(ok ? '✅ Creative-Spez kopiert' : '⚠️ Kopieren fehlgeschlagen')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <section
        style={{
          padding: '1rem 1.1rem',
          borderRadius: 12,
          border: '1px solid #0d9488',
          background: 'linear-gradient(145deg, #ecfdf5 0%, #f0fdfa 100%)',
        }}
      >
        <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', color: '#134e4a' }}>Sportwagen-Standard</h2>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', color: '#115e59', lineHeight: 1.55 }}>
          <strong>Pro Kanal:</strong> fertige Anzeige zum Kopieren (URL, Headlines, Beschreibungen) – direkt ins
          Ads-Konto. Auswertung und Creative-Maße global. Schalten in den Konten bleibt manuell.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <ProgressChip label="Einmal (3 Konten)" done={globalProg.done} total={globalProg.total} />
          <button type="button" onClick={handleCreativeSpecKopieren} style={secondaryBtn}>
            🎨 Creative-Spez kopieren
          </button>
          <button
            type="button"
            onClick={() => onPersist(applySuggestedStatusToAllKanaele(state))}
            style={primaryBtn}
          >
            ⚡ Ampel-Status aus Checkliste übernehmen
          </button>
        </div>
      </section>

      <section
        style={{
          padding: '1rem 1.05rem',
          borderRadius: 12,
          border: '1px solid #c4b8a8',
          background: '#fffefb',
        }}
      >
        <h3 style={{ margin: '0 0 0.65rem', fontSize: '1rem', color: '#1c1a18' }}>
          Einmal für alle Kanäle ({globalProg.done}/{globalProg.total})
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {K2_AGENTUR_GLOBAL_LAUNCH_STEPS.map((step) => (
            <li key={step.id} style={{ listStyle: 'none', marginLeft: '-1.25rem' }}>
              <CheckRow
                checked={state.globalSchritte[step.id] === true}
                label={step.label}
                hint={step.hint}
                onChange={(c) => onPersist(toggleGlobalSchritt(state, step.id, c))}
              />
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#1c1a18' }}>
          Pro Kanal ({totals.perKanal} Schritte × {rows.length} Kanäle)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {rows.map((meta) => {
            const key = kanalStorageKey(meta.produkt, meta.kanal)
            const prog = getKanalChecklistProgress(state, key)
            const suggested = suggestKanalStatusFromChecklist(state, key)
            const isOpen = openKanal === key
            const schalt = getSchaltPaket(meta.produkt, meta.kanal)
            const fertigeAnzeige = getAnzeigenPaket(meta.produkt, meta.kanal)
            return (
              <article
                key={key}
                style={{
                  borderRadius: 12,
                  border: '1px solid #d4c8b8',
                  background: '#fffefb',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenKanal(isOpen ? null : key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: isOpen ? '#f6f4f0' : '#fffefb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{isOpen ? '▼' : '▶'}</span>
                  <span style={{ flex: 1, fontWeight: 700, color: '#1c1a18', fontSize: '0.92rem' }}>
                    {meta.produktLabel} · {meta.kanalLabel}
                  </span>
                  <ProgressChip done={prog.done} total={prog.total} />
                  <span style={{ fontSize: '0.75rem', color: '#5c5650' }}>
                    Vorschlag: <strong>{suggested}</strong>
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 0 1rem 1rem', borderTop: '1px solid #ebe8e2' }}>
                    {fertigeAnzeige && (
                      <FertigeAnzeigeVorschau paket={fertigeAnzeige} />
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', margin: '0.75rem 0 0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => handleFertigeAnzeigeKopieren(meta.produkt, meta.kanal)}
                        style={{ ...primaryBtn, fontSize: '0.95rem', padding: '0.55rem 1rem' }}
                      >
                        📋 Fertige Anzeige kopieren
                      </button>
                      <button type="button" onClick={() => handlePaketKopieren(meta.produkt, meta.kanal)} style={secondaryBtn}>
                        Nur URL + Kampagne
                      </button>
                      <button type="button" onClick={() => handleAuswertungKopieren(meta.produkt, meta.kanal)} style={secondaryBtn}>
                        📊 Auswertung (7 Tage)
                      </button>
                      <a
                        href={K2_AGENTUR_PLATTFORM_CONSOLE_URL[meta.kanal]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={secondaryLink}
                      >
                        ↗ {meta.kanal === 'google' ? 'Google Ads' : meta.kanal === 'meta' ? 'Meta' : 'LinkedIn'}{' '}
                        öffnen
                      </a>
                      <a
                        href={meta.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={secondaryLink}
                      >
                        Landing testen
                      </a>
                      {schalt && (
                        <Link to={schalt.checkoutPath} style={secondaryLink}>
                          Checkout testen
                        </Link>
                      )}
                    </div>
                    <ol style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {K2_AGENTUR_KANAL_LAUNCH_STEPS.map((step) => (
                        <li key={step.id} style={{ listStyle: 'none' }}>
                          <CheckRow
                            checked={state.kanalSchritte[key]?.[step.id] === true}
                            label={step.label}
                            hint={step.hint}
                            onChange={(c) => onPersist(toggleKanalSchritt(state, key, step.id, c))}
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function FertigeAnzeigeVorschau({ paket }: { paket: NonNullable<ReturnType<typeof getAnzeigenPaket>> }) {
  const s = paket.schalt
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 10,
        border: '2px solid #b54a1e',
        background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
      }}
    >
      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1c1a18', marginBottom: '0.5rem' }}>
        Fertige Anzeige – so landet sie im Kanal
      </div>
      <div style={{ fontSize: '0.78rem', color: '#5c5650', marginBottom: '0.65rem', lineHeight: 1.45 }}>
        Kampagne: <strong>{s.campaignKey}</strong>
        <br />
        Finale URL:{' '}
        <a href={s.landingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#b54a1e', wordBreak: 'break-all' }}>
          {s.landingUrl}
        </a>
      </div>
      <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#b54a1e', fontSize: '0.75rem', marginBottom: '0.2rem' }}>HEADLINES</div>
          {paket.headlines.map((h, i) => (
            <div key={i} style={{ color: '#1c1a18', fontWeight: 600 }}>
              {i + 1}. {h}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#b54a1e', fontSize: '0.75rem', marginBottom: '0.2rem' }}>BESCHREIBUNGEN</div>
          {paket.descriptions.map((d, i) => (
            <div key={i} style={{ color: '#1c1a18' }}>
              {i + 1}. {d}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#5c5650' }}>
          Button: <strong>{paket.cta}</strong> · {s.zielgruppeHint}
        </div>
      </div>
    </div>
  )
}

function CheckRow({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean
  label: string
  hint: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        gap: '0.55rem',
        alignItems: 'flex-start',
        padding: '0.45rem 0.55rem',
        borderRadius: 8,
        background: checked ? '#ecfdf5' : 'transparent',
        border: checked ? '1px solid #6ee7b7' : '1px solid transparent',
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: '0.2rem', width: 18, height: 18, flexShrink: 0 }}
      />
      <span>
        <span style={{ display: 'block', fontWeight: 600, color: '#1c1a18', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ display: 'block', fontSize: '0.78rem', color: '#5c5650', lineHeight: 1.45, marginTop: '0.15rem' }}>
          {hint}
        </span>
      </span>
    </label>
  )
}

function ProgressChip({ label, done, total }: { label?: string; done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const complete = done === total && total > 0
  return (
    <span
      style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        padding: '0.2rem 0.5rem',
        borderRadius: 6,
        background: complete ? '#dcfce7' : '#fef3c7',
        color: complete ? '#166534' : '#92400e',
        border: `1px solid ${complete ? '#86efac' : '#fcd34d'}`,
      }}
    >
      {label ? `${label}: ` : ''}
      {done}/{total} ({pct}%)
    </span>
  )
}

const primaryBtn: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: 8,
  border: 'none',
  background: '#b54a1e',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const secondaryLink: CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 600,
  fontSize: '0.85rem',
  textDecoration: 'none',
}

const secondaryBtn: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}
