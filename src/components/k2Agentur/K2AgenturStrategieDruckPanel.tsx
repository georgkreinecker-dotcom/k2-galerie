/**
 * K2 Agentur – Master-Strategien & Keywords (Druck / Schreibtisch).
 */

import type { CSSProperties } from 'react'
import {
  K2_AGENTUR_KEYWORDS_DRUCK,
  K2_AGENTUR_MASTER_STRATEGIEN,
} from '../../config/k2AgenturStrategieKeywordsRegistry'

const linkBtn: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #0f766e',
  background: '#f0fdfa',
  color: '#0f766e',
  fontWeight: 700,
  fontSize: '0.82rem',
  textDecoration: 'none',
}

export default function K2AgenturStrategieDruckPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <section
        style={{
          padding: '1rem',
          borderRadius: 12,
          border: '2px solid #0f766e',
          background: 'linear-gradient(145deg, #f0fdfa 0%, #ecfdf5 100%)',
        }}
      >
        <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', color: '#1c1a18' }}>
          📋 Master-Strategien & Keywords
        </h2>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#5c5650', lineHeight: 1.5 }}>
          Eine Quelle pro Produkt und Sparte. Im <strong>Schalt-Paket</strong> (Checkliste) sind die Keywords für
          Google bereits im Kopierblock – P1 startet mit <strong>Kunst-Pilot</strong>.
        </p>
      </section>

      <section style={card}>
        <h3 style={h3}>Master-Strategie (1 Seite je Produkt)</h3>
        <div style={linkGrid}>
          {K2_AGENTUR_MASTER_STRATEGIEN.map((e) => (
            <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" style={linkBtn}>
              {e.label}
            </a>
          ))}
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>Keywords · Google Ads</h3>
        <div style={linkGrid}>
          {K2_AGENTUR_KEYWORDS_DRUCK.map((e) => (
            <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" style={linkBtn}>
              {e.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

const card: CSSProperties = {
  padding: '0.85rem 1rem',
  borderRadius: 10,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
}

const h3: CSSProperties = {
  margin: '0 0 0.55rem',
  fontSize: '0.95rem',
  color: '#1c1a18',
}

const linkGrid: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.45rem',
}
