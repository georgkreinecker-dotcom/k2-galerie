import type { CSSProperties } from 'react'
import {
  AHNENRASTER_BLATT,
  AHNENRASTER_MUSTER_SRC,
} from '../../config/hundredGenerationAhnenraster'

type Props = {
  /** Hell = Druck / Formatblatt; dunkel = APf-Karte */
  variant?: 'screen' | 'print'
  className?: string
  /** Di-Kurugu-Referenzfoto (Flechtwerk) */
  referenzSrc?: string
  /** Objekt 4M Vorne (kleiner Bezug) */
  objektSrc?: string
  /** Exakter Raster-Ausschnitt – Standard aus Config */
  musterSrc?: string
}

/**
 * Fertiges Formatblatt: exaktes Ahnenraster-Foto groß + Infos + Bezüge.
 */
export function HundredGenerationAhnenrasterBlatt({
  variant = 'screen',
  className,
  referenzSrc = '/100-generation/referenzen/di-kurugu-flechtwerk.jpg',
  objektSrc = '/100-generation/entwurf-04m-code-ahnen-mythos.png',
  musterSrc = AHNENRASTER_MUSTER_SRC,
}: Props) {
  const isPrint = variant === 'print'
  const ink = isPrint ? '#1c1a18' : '#eef2f7'
  const muted = isPrint ? '#5c5650' : '#a8b3c4'
  const accent = isPrint ? '#8a6a10' : '#d4a017'
  const panel = isPrint ? '#fffefb' : '#1a1f2a'
  const frame = isPrint ? '#c8c0b4' : 'rgba(212,160,23,0.35)'
  const b = AHNENRASTER_BLATT

  return (
    <article
      className={className}
      style={{
        background: panel,
        color: ink,
        borderRadius: isPrint ? 0 : 12,
        border: isPrint ? 'none' : '1px solid rgba(212,160,23,0.28)',
        padding: isPrint ? '0' : '1rem 1.05rem 1.15rem',
        fontFamily: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',
      }}
    >
      <p
        style={{
          margin: '0 0 0.35rem',
          fontFamily: 'system-ui,sans-serif',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accent,
          fontWeight: 600,
        }}
      >
        {b.kicker}
      </p>
      <h2
        style={{
          margin: '0 0 0.2rem',
          fontSize: isPrint ? '1.55rem' : '1.35rem',
          fontWeight: 600,
          lineHeight: 1.2,
          color: ink,
        }}
      >
        {b.title} · {b.subtitle}
      </h2>
      <p style={{ margin: '0 0 0.85rem', color: muted, fontSize: '0.92rem', lineHeight: 1.45 }}>
        Exaktes Raster der Frontplatte – verbindliche Vorlage für die Werkstatt (kein Schema-Zeichnen).
      </p>

      {/* Hauptbild: exaktes Muster */}
      <figure
        style={{
          margin: '0 0 1rem',
          border: `1px solid ${frame}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#0a0c10',
        }}
      >
        <img
          src={musterSrc}
          alt="Ahnenraster heiliges Muster – exakter Ausschnitt der 4M-Frontplatte"
          style={{
            display: 'block',
            width: '100%',
            maxHeight: isPrint ? '165mm' : '28rem',
            objectFit: 'contain',
            margin: '0 auto',
            background: isPrint ? '#f4efe6' : '#0a0c10',
          }}
        />
        <figcaption
          style={{
            padding: '0.45rem 0.65rem',
            fontFamily: 'system-ui,sans-serif',
            fontSize: '0.78rem',
            color: muted,
            background: isPrint ? '#f7f4ef' : 'rgba(0,0,0,0.35)',
          }}
        >
          Exaktes Ahnenraster · Platte ca. H {b.panelHoeheCm} · B {b.panelBreiteCm} cm am Objekt · vier
          Labyrinth-Felder + Rahmen + Fischgrät-Umgebung
        </figcaption>
      </figure>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPrint ? '1fr 1fr' : '1fr',
          gap: '0.85rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          <section>
            <h3 style={h3Style(accent)}>Bedeutung</h3>
            <p style={pStyle(ink)}>{b.bedeutung}</p>
          </section>
          <section>
            <h3 style={h3Style(accent)}>Anwendung</h3>
            <p style={pStyle(ink)}>{b.anwendung}</p>
          </section>
          <section>
            <h3 style={h3Style(accent)}>Di Kurugu · Hintergrund</h3>
            <p style={pStyle(ink)}>{b.bezugDiKurugu}</p>
          </section>
        </div>

        <div style={{ display: 'grid', gap: '0.7rem' }}>
          <section>
            <h3 style={h3Style(accent)}>Was wir dazu wissen</h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.15rem',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                color: ink,
              }}
            >
              {b.wasWirWissen.map((line) => (
                <li key={line.slice(0, 40)} style={{ marginBottom: '0.35rem' }}>
                  {line}
                </li>
              ))}
            </ul>
          </section>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            <figure style={{ margin: 0 }}>
              <img
                src={referenzSrc}
                alt="Di Kurugu Flechtwerk – Bezug"
                style={imgThumb}
              />
              <figcaption style={capStyle(muted)}>Referenz Flechtwerk</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img src={objektSrc} alt="4M Objekt Vorne" style={imgThumb} />
              <figcaption style={capStyle(muted)}>4M am Objekt</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </article>
  )
}

function h3Style(accent: string): CSSProperties {
  return {
    margin: '0 0 0.35rem',
    fontFamily: 'system-ui,sans-serif',
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: accent,
  }
}

function pStyle(ink: string): CSSProperties {
  return { margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: ink }
}

function capStyle(muted: string): CSSProperties {
  return {
    marginTop: 4,
    fontFamily: 'system-ui,sans-serif',
    fontSize: '0.7rem',
    color: muted,
  }
}

const imgThumb: CSSProperties = {
  display: 'block',
  width: '100%',
  borderRadius: 6,
  background: '#0a0c10',
}
