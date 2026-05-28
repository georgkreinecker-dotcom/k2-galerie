/**
 * K2 Agentur E2E – Phase 3: Auswertung nach Live-Schaltung.
 */

import { useMemo } from 'react'
import { formatAuswertungPaketText } from '../../config/k2AgenturAuswertungPaket'
import { getK2AgenturAuswertungOffen } from '../../config/k2AgenturEndToEndFlow'
import { listMarketingKanalUrls } from '../../config/marketingKanalP1P2P3'
import {
  appendKanalNotizBlock,
  kanalStorageKey,
  markAuswertungPaketKopiert,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onPersist: (next: K2AgenturPlattformState) => void
  onCopyFeedback: (msg: string) => void
  copyText: (text: string) => Promise<boolean>
  auswertenComplete: boolean
}

export default function K2AgenturAuswertenPhasePanel({
  state,
  onPersist,
  onCopyFeedback,
  copyText,
  auswertenComplete,
}: Props) {
  const katalog = useMemo(() => listMarketingKanalUrls(), [])
  const offenKeys = getK2AgenturAuswertungOffen(state)

  const handleAuswertung = async (produkt: (typeof katalog)[0]['produkt'], kanal: (typeof katalog)[0]['kanal']) => {
    const key = kanalStorageKey(produkt, kanal)
    const text = formatAuswertungPaketText(produkt, kanal)
    if (!text) return
    const ok = await copyText(text)
    if (ok) {
      let next = markAuswertungPaketKopiert(state, key)
      next = appendKanalNotizBlock(next, key, text)
      onPersist(next)
      onCopyFeedback('✅ Auswertungs-Vorlage kopiert')
    } else {
      onCopyFeedback('⚠️ Kopieren fehlgeschlagen')
    }
  }

  if (auswertenComplete) {
    return (
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          border: '2px solid #16a34a',
          background: '#ecfdf5',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>✅</div>
        <strong style={{ color: '#166534', fontSize: '1.05rem' }}>End-to-End durch</strong>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: '#14532d', lineHeight: 1.5 }}>
          Konten bereit, Kanäle geschaltet, Auswertung eingeplant. Notizen findest du unter Werkzeuge → Kanäle.
        </p>
      </section>
    )
  }

  if (offenKeys.length === 0) {
    return (
      <section style={{ padding: '1rem', borderRadius: 12, border: '1px solid #c4b8a8', background: '#fffefb' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#5c5650', lineHeight: 1.5 }}>
          Noch kein Kanal auf <strong>live</strong>. Zuerst Phase 2 abschließen – dann hier die 7-Tage-Auswertung
          kopieren.
        </p>
      </section>
    )
  }

  return (
    <section
      style={{
        padding: '1rem 1.1rem',
        borderRadius: 12,
        border: '2px solid #0d9488',
        background: '#fffefb',
      }}
    >
      <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#5c5650', lineHeight: 1.5 }}>
        <strong>End-to-End Schritt 3:</strong> Für jeden live-Kanal die Auswertungs-Vorlage kopieren → in Notizen
        eintragen → nach 7 Tagen Entscheidung (weiter/pausieren).
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {offenKeys.map((key) => {
          const meta = katalog.find((r) => kanalStorageKey(r.produkt, r.kanal) === key)
          if (!meta) return null
          return (
            <li
              key={key}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 10,
                border: '1px solid #d4c8b8',
                background: '#faf8f5',
              }}
            >
              <span style={{ flex: 1, fontWeight: 700, color: '#1c1a18' }}>
                {meta.produkt.toUpperCase()} · {meta.kanalLabel}
              </span>
              <button
                type="button"
                onClick={() => handleAuswertung(meta.produkt, meta.kanal)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 8,
                  border: 'none',
                  background: '#0d9488',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                📊 Auswertung kopieren
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
