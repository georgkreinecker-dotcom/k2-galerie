import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  YOGA_GESPRAECH_AKADEMIE,
  YOGA_GESPRAECH_AUFWAND,
  YOGA_GESPRAECH_BADGE,
  YOGA_GESPRAECH_COVER_SLOGAN,
  YOGA_GESPRAECH_COVER_TAGLINE,
  YOGA_GESPRAECH_COVER_TITLE,
  YOGA_GESPRAECH_LEAD,
  YOGA_GESPRAECH_NAECHSTE,
  YOGA_GESPRAECH_SCHLUSS,
  YOGA_GESPRAECH_SYSTEM,
} from '../config/yogaGespraechsmappe'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import { yogaKursPath } from '../config/yogaKursStruktur'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const GOLD = YOGA_MARKE.gold
const GOLD_DARK = YOGA_MARKE.goldDark
const VIOLETT = YOGA_MARKE.violett
const GOLD_SOFT = YOGA_MARKE.goldSoft

const printStyles = `
  @media print {
    .gm-no-print { display: none !important; }
    body { background: #fff !important; }
    .gm-wrap { background: #fff !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .gm-wrap > div { max-width: none !important; padding: 8mm 12mm !important; box-shadow: none !important; }
    .gm-cover { background: ${GOLD_DARK} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #fff !important; padding: 6mm 10mm !important; border-radius: 0 !important; margin-bottom: 5mm !important; }
    .gm-cover h1 { font-size: 16pt !important; margin: 0 !important; color: #fff !important; }
    .gm-body { font-size: 9pt !important; line-height: 1.35 !important; }
    .gm-body p, .gm-body h2, .gm-body h3 { margin: 0 0 2.5mm !important; }
    .gm-body h2 { color: ${GOLD} !important; font-size: 11pt !important; }
    .gm-body h3 { color: ${VIOLETT} !important; font-size: 9.5pt !important; }
    table { font-size: 8pt !important; }
    .gm-qr-block { margin-top: 4mm !important; padding-top: 4mm !important; }
    .gm-qr-block img { width: 18mm !important; height: 18mm !important; }
    .gm-impressum { margin-top: 4mm !important; font-size: 6pt !important; color: #5c5650 !important; }
    .gm-footer { position: static !important; margin-top: 3mm !important; font-size: 6pt !important; color: #5c5650 !important; }
    .gm-footer .gm-footer-text { display: none !important; }
    .gm-footer::after { content: "Seite " counter(page); }
    @page { margin: 10mm 12mm 10mm 12mm; size: A4; }
  }
`

/**
 * Richtige Präsentationsmappe zum Versenden nach dem Telefonat.
 * Stellt K2 als System vor, dann die Akademie-Anwendung.
 */
export default function YogaGespraechsmappePage() {
  const willkommen = PROJECT_ROUTES['k2-yoga'].willkommen
  const akademie = PROJECT_ROUTES['k2-yoga'].akademie
  const kursWels = yogaKursPath('lg-wels-2026')
  const mappePath = PROJECT_ROUTES['k2-yoga'].gespraechsmappe
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copyOk, setCopyOk] = useState(false)
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${mappePath}` : mappePath

  useEffect(() => {
    const prev = document.title
    document.title = `${YOGA_GESPRAECH_COVER_TITLE} · Gesprächsmappe`
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(buildQrUrlWithBust(shareUrl, qrVersionTs), { width: 120, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [shareUrl, qrVersionTs])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyOk(true)
      window.setTimeout(() => setCopyOk(false), 2500)
    } catch {
      setCopyOk(false)
    }
  }

  const abschnitt = (a: (typeof YOGA_GESPRAECH_SYSTEM)[0]) => (
    <div key={a.nr} style={{ marginBottom: '0.85rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: VIOLETT, margin: '0.85rem 0 0.3rem' }}>
        {a.titel}
      </h3>
      {a.absatz ? (
        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 0.35rem' }}>{a.absatz}</p>
      ) : null}
      {a.punkte && a.punkte.length > 0 ? (
        <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.15rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
          {a.punkte.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )

  return (
    <div className="gm-wrap" style={{ minHeight: '100vh', background: YOGA_MARKE.bg, color: YOGA_MARKE.text, fontFamily: YOGA_MARKE.font }}>
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <style>{printStyles}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem', background: YOGA_MARKE.bgCard, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div
          className="gm-no-print"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 0',
            borderBottom: `1px solid ${GOLD_SOFT}`,
            display: 'flex',
            gap: '0.55rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => void copyLink()}
            style={{
              padding: '0.45rem 0.9rem',
              background: GOLD_SOFT,
              color: VIOLETT,
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {copyOk ? '✅ Link kopiert' : '📎 Link zum Versenden kopieren'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '0.45rem 0.9rem',
              background: YOGA_MARKE.bgCard,
              color: YOGA_MARKE.text,
              border: `1px solid ${GOLD}44`,
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Als PDF drucken
          </button>
          <Link to={PROJECT_ROUTES['k2-yoga'].praesentationsmappe} style={{ color: VIOLETT, fontWeight: 600, textDecoration: 'none' }}>
            Kurzmappe (ohne System) →
          </Link>
        </div>

        <div
          className="gm-cover"
          style={{
            background: GOLD_DARK,
            color: '#fff',
            padding: 'clamp(1.75rem, 4vw, 2.75rem) 1.5rem',
            borderRadius: 12,
            marginBottom: '1.35rem',
            textAlign: 'center',
          }}
        >
          <img src={YOGA_MARKE.logo} alt="" width={88} height={58} style={{ display: 'block', margin: '0 auto 0.65rem', objectFit: 'contain' }} />
          <span
            style={{
              padding: '0.25rem 0.55rem',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            {YOGA_GESPRAECH_BADGE}
          </span>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.92 }}>
            Yoga-Akademie Austria
          </p>
          <h1 style={{ fontSize: 'clamp(1.45rem, 3.8vw, 1.95rem)', fontWeight: 700, color: '#fff', margin: '0.4rem 0 0', letterSpacing: '-0.02em' }}>
            {YOGA_GESPRAECH_COVER_TITLE}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2.3vw, 1.08rem)', fontWeight: 600, margin: '0.7rem 0 0', lineHeight: 1.4 }}>
            {YOGA_GESPRAECH_COVER_SLOGAN}
          </p>
          <p style={{ fontSize: '0.9rem', margin: '0.45rem 0 0', lineHeight: 1.5, color: 'rgba(255,255,255,0.95)' }}>
            {YOGA_GESPRAECH_COVER_TAGLINE}
          </p>
        </div>

        <div className="gm-body">
          <p style={{ fontSize: '0.95rem', lineHeight: 1.55, margin: '0 0 1.1rem' }}>{YOGA_GESPRAECH_LEAD}</p>

          <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: GOLD, margin: '1.25rem 0 0.35rem' }}>
            Teil A · Das System (K2 / {PRODUCT_BRAND_NAME})
          </h2>
          <p style={{ fontSize: '0.9rem', color: YOGA_MARKE.muted, margin: '0 0 0.5rem' }}>
            Kurz im Vorfeld – damit klar ist, worauf die Akademie-Lösung aufbaut.
          </p>
          {YOGA_GESPRAECH_SYSTEM.map(abschnitt)}

          <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: GOLD, margin: '1.5rem 0 0.35rem' }}>
            Teil B · Anwendung für die Akademie
          </h2>
          {YOGA_GESPRAECH_AKADEMIE.map(abschnitt)}

          <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: GOLD, margin: '1.35rem 0 0.4rem' }}>Aufwand</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', margin: '0 0 1rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Wer</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Was</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Aufwand</th>
              </tr>
            </thead>
            <tbody>
              {YOGA_GESPRAECH_AUFWAND.map((r) => (
                <tr key={`${r.wer}-${r.was}`}>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.wer}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.was}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.aufwand}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: GOLD, margin: '1.25rem 0 0.4rem' }}>Zum Anschauen</h2>
          <div style={{ display: 'grid', gap: '0.55rem', marginBottom: '1rem' }}>
            {[
              { ...YOGA_GESPRAECH_NAECHSTE[0], to: willkommen },
              { ...YOGA_GESPRAECH_NAECHSTE[1], to: akademie },
              { ...YOGA_GESPRAECH_NAECHSTE[2], to: kursWels },
            ].map((n) => (
              <Link
                key={n.titel}
                to={n.to}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: YOGA_MARKE.bg,
                  border: `1px solid ${GOLD}33`,
                  borderRadius: 12,
                  padding: '0.75rem 0.9rem',
                }}
              >
                <div style={{ fontWeight: 700, color: VIOLETT }}>{n.titel} →</div>
                <div style={{ fontSize: '0.85rem', color: YOGA_MARKE.muted, marginTop: '0.15rem' }}>{n.text}</div>
              </Link>
            ))}
          </div>

          <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: YOGA_MARKE.muted, margin: '0 0 0.5rem' }}>
            {YOGA_GESPRAECH_SCHLUSS}
          </p>
        </div>

        <div
          className="gm-qr-block"
          style={{
            marginTop: '0.75rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${GOLD_SOFT}`,
            display: 'flex',
            gap: '0.9rem',
            alignItems: 'center',
          }}
        >
          {qrDataUrl ? <img src={qrDataUrl} alt="" width={120} height={120} style={{ display: 'block', flexShrink: 0 }} /> : null}
          <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#5c5650' }}>
            <strong style={{ color: '#1c1a18' }}>Diese Mappe teilen</strong>
            <p style={{ margin: '0.25rem 0 0' }}>QR oder Link – nach dem Telefonat weitergeben. Immer der aktuelle Stand.</p>
            <p className="gm-no-print" style={{ margin: '0.35rem 0 0', wordBreak: 'break-all', fontSize: '0.78rem' }}>
              {shareUrl}
            </p>
          </div>
        </div>

        <div
          className="gm-impressum"
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: `1px solid ${GOLD_SOFT}`,
            fontSize: '0.75rem',
            color: '#5c5650',
            lineHeight: 1.45,
          }}
        >
          <div>
            {PRODUCT_BRAND_NAME} · Rückfragen: {PRODUCT_LIZENZ_ANFRAGE_EMAIL}
          </div>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </div>
        <div className="gm-footer seitenfuss">
          <span className="gm-footer-text">Gesprächsmappe · Yoga-Akademie Austria · {PRODUCT_BRAND_NAME}</span>
        </div>
      </div>
    </div>
  )
}
