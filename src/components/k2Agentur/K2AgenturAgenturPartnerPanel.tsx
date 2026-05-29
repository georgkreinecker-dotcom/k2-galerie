/**
 * K2 Agentur – Option B: Agentur-Partner Vorbereitung (5 Punkte Arno).
 */

import type { CSSProperties } from 'react'
import {
  ARNOS_FUENF_PUNKTE,
  K2_AGENTUR_ANGEBOT_PRUEFUNG,
  K2_AGENTUR_FEINSCHLIFF_SCHRITTE,
  K2_AGENTUR_MASTER_STRATEGIE_P1_URL,
  K2_AGENTUR_PARTNER_DRUCK_URL,
  K2_AGENTUR_PARTNER_MAIL_GESENDET_LABEL,
  K2_AGENTUR_PARTNER_RUECKMELDUNG_DRUCK_URL,
  K2_AGENTUR_PARTNER_RUECKMELDUNG_SCHRITTE,
  K2_AGENTUR_VERHANDLUNG_KERN,
} from '../../config/k2AgenturAgenturVorbereitung'
import {
  K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL,
  K2_AGENTUR_MASTER_STRATEGIE_P2_URL,
  K2_AGENTUR_MASTER_STRATEGIE_P3_URL,
} from '../../config/k2AgenturStrategieKeywordsRegistry'
import type { K2AgenturPlattformState } from '../../utils/k2AgenturPlattformStorage'
import {
  getPartnerAngebotProgress,
  getPartnerFeinschliffProgress,
  getPartnerRueckmeldungProgress,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onToggleFeinschliff: (stepId: string, checked: boolean) => void
  onToggleRueckmeldung: (stepId: string, checked: boolean) => void
  onToggleAngebot: (stepId: string, checked: boolean) => void
  onAngebotNotizen: (text: string) => void
}

function ampelStyle(ampel: 'gruen' | 'gelb'): CSSProperties {
  return ampel === 'gruen'
    ? { background: '#ecfdf5', border: '2px solid #16a34a', color: '#166534' }
    : { background: '#fff7ed', border: '2px solid #ea580c', color: '#9a3412' }
}

export default function K2AgenturAgenturPartnerPanel({
  state,
  onToggleFeinschliff,
  onToggleRueckmeldung,
  onToggleAngebot,
  onAngebotNotizen,
}: Props) {
  const pv = state.partnerVorbereitung
  const feinProg = getPartnerFeinschliffProgress(state)
  const rueckProg = getPartnerRueckmeldungProgress(state)
  const angProg = getPartnerAngebotProgress(state)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <section
        style={{
          padding: '1rem 1.05rem',
          borderRadius: 12,
          border: '2px solid #7c3aed',
          background: 'linear-gradient(145deg, #faf5ff 0%, #f5f3ff 100%)',
        }}
      >
        <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', color: '#1c1a18' }}>
          🤝 Agentur-Partner – Vorbereitung
        </h2>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: '#5c5650', lineHeight: 1.5 }}>
          Entlang der <strong>5 Punkte</strong> präzise handeln: Bestand, Feinschliff bei uns,{' '}
          <strong>Verbesserungen aus Partner-Rückmeldung</strong> (eigene K2 Agentur), Angebot prüfen.{' '}
          {K2_AGENTUR_PARTNER_MAIL_GESENDET_LABEL}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <a href={K2_AGENTUR_MASTER_STRATEGIE_P1_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
            📋 Master P1
          </a>
          <a href={K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
            📋 Mein Weg (6 Sparten)
          </a>
          <a href={K2_AGENTUR_MASTER_STRATEGIE_P2_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
            📋 Master P2 VK2
          </a>
          <a href={K2_AGENTUR_MASTER_STRATEGIE_P3_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
            📋 Master P3 Familie
          </a>
          <a href={K2_AGENTUR_PARTNER_DRUCK_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
            📄 5-Punkte-Vorbereitung (Druck)
          </a>
          <a
            href={K2_AGENTUR_PARTNER_RUECKMELDUNG_DRUCK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={linkBtn}
          >
            📄 Verbesserungen P1 (Druck)
          </a>
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>Kurzfazit</h3>
        <p style={p}>{K2_AGENTUR_VERHANDLUNG_KERN.kurzfazit}</p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#1c1a18' }}>
          {K2_AGENTUR_VERHANDLUNG_KERN.leitplanken.map((line) => (
            <li key={line} style={{ marginBottom: '0.3rem' }}>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section style={card}>
        <h3 style={h3}>Die 5 Punkte – Bestand</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {ARNOS_FUENF_PUNKTE.map((punkt) => (
            <article
              key={punkt.nr}
              style={{
                padding: '0.75rem 0.85rem',
                borderRadius: 10,
                ...ampelStyle(punkt.ampel),
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                {punkt.nr}) {punkt.titel} — {punkt.statusKurz}
              </div>
              <div style={{ fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <strong>Vorhanden:</strong>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                  {punkt.vorhanden.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                <strong>Feinschliff:</strong>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                  {punkt.feinschliff.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>
          Feinschliff bei uns ({feinProg.done}/{feinProg.total})
        </h3>
        <p style={{ ...p, fontSize: '0.82rem' }}>
          Vor oder parallel zur Agentur – abhaken wenn erledigt.
        </p>
        <ul style={checkList}>
          {K2_AGENTUR_FEINSCHLIFF_SCHRITTE.map((step) => (
            <li key={step.id} style={checkItem}>
              <label style={checkLabel}>
                <input
                  type="checkbox"
                  checked={pv?.feinschliffErledigt[step.id] === true}
                  onChange={(e) => onToggleFeinschliff(step.id, e.target.checked)}
                />
                <span>
                  <strong>{step.label}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#5c5650', fontWeight: 400 }}>
                    {step.hint}
                    {step.druckUrl ? (
                      <>
                        {' '}
                        <a href={step.druckUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e' }}>
                          → Druck/PDF
                        </a>
                      </>
                    ) : null}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          ...card,
          border: '2px solid #0d9488',
          background: 'linear-gradient(145deg, #f0fdfa 0%, #ecfdf5 100%)',
        }}
      >
        <h3 style={h3}>
          Verbesserungen aus Rückmeldung ({rueckProg.done}/{rueckProg.total})
        </h3>
        <p style={{ ...p, fontSize: '0.82rem' }}>
          Agentur lehnt Kooperation ab – wir nutzen die Kritik (Conversion, Vertrauen, Angebot) selbst in K2
          Agentur. Erst Strecke &amp; Klarheit, dann Budget in Google.
        </p>
        <ul style={checkList}>
          {K2_AGENTUR_PARTNER_RUECKMELDUNG_SCHRITTE.map((step) => (
            <li key={step.id} style={checkItem}>
              <label style={checkLabel}>
                <input
                  type="checkbox"
                  checked={pv?.rueckmeldungErledigt[step.id] === true}
                  onChange={(e) => onToggleRueckmeldung(step.id, e.target.checked)}
                />
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#0f766e',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {step.kategorieLabel}
                  </span>
                  <strong style={{ display: 'block' }}>{step.label}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#5c5650', fontWeight: 400 }}>
                    {step.hint}
                    {step.testPath ? (
                      <>
                        {' '}
                        <a href={step.testPath} target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e' }}>
                          → testen
                        </a>
                      </>
                    ) : null}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          ...card,
          border: '2px solid #b45309',
          background: '#fffaf5',
        }}
      >
        <h3 style={h3}>
          Wenn das Agentur-Angebot kommt ({angProg.done}/{angProg.total})
        </h3>
        <p style={{ ...p, fontSize: '0.82rem' }}>
          Punkt für Punkt prüfen – erst Budget freigeben, wenn alles passt.
        </p>
        <ul style={checkList}>
          {K2_AGENTUR_ANGEBOT_PRUEFUNG.map((step) => (
            <li key={step.id} style={checkItem}>
              <label style={checkLabel}>
                <input
                  type="checkbox"
                  checked={pv?.angebotPruefungErledigt[step.id] === true}
                  onChange={(e) => onToggleAngebot(step.id, e.target.checked)}
                />
                <span>
                  <strong>{step.label}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#5c5650', fontWeight: 400 }}>
                    {step.hint}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <label style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.78rem', fontWeight: 600, color: '#5c5650' }}>
          Notizen zum Angebot
          <textarea
            value={pv?.angebotNotizen ?? ''}
            onChange={(e) => onAngebotNotizen(e.target.value)}
            rows={3}
            placeholder="Scope, Deckel, CPA-Vorschlag der Agentur …"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #c4b8a8',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </label>
      </section>

      <section style={card}>
        <h3 style={h3}>Vom Agentur-Angebot verlangen</h3>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', lineHeight: 1.55 }}>
          {K2_AGENTUR_VERHANDLUNG_KERN.angebotAnfordern.map((item) => (
            <li key={item} style={{ marginBottom: '0.25rem' }}>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

const card: CSSProperties = {
  padding: '1rem 1.05rem',
  borderRadius: 12,
  border: '1px solid #d4c8b8',
  background: '#fffefb',
}

const h3: CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: '1rem',
  color: '#1c1a18',
}

const p: CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: '0.88rem',
  color: '#1c1a18',
  lineHeight: 1.5,
}

const checkList: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const checkItem: CSSProperties = {
  marginBottom: '0.5rem',
}

const checkLabel: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'flex-start',
  cursor: 'pointer',
  fontSize: '0.88rem',
  color: '#1c1a18',
}

const linkBtn: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.75rem',
  borderRadius: 8,
  background: '#7c3aed',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  textDecoration: 'none',
}
