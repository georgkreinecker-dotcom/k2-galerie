import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  YOGA_DETAIL_ABSchnitte,
  YOGA_DETAIL_AUFWAND,
  YOGA_DETAIL_BADGE,
  YOGA_DETAIL_COVER_SLOGAN,
  YOGA_DETAIL_COVER_TAGLINE,
  YOGA_DETAIL_COVER_TITLE,
  YOGA_DETAIL_LEAD,
  YOGA_DETAIL_MITBRINGEN,
  YOGA_DETAIL_NAECHSTE,
  YOGA_DETAIL_NICHT,
  YOGA_DETAIL_PILOT,
} from '../config/yogaDetailplan'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const GOLD = YOGA_MARKE.gold
const GOLD_DARK = YOGA_MARKE.goldDark
const GOLD_SOFT = YOGA_MARKE.goldSoft
const VIOLETT = YOGA_MARKE.violett

const printStyles = `
  @media print {
    .pm-no-print { display: none !important; }
    body { background: #fff !important; }
    .pm-wrap { background: #fff !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .pm-wrap > div { max-width: none !important; padding: 8mm 12mm !important; box-shadow: none !important; }
    .pm-teal-cover { background: ${GOLD_DARK} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #fff !important; padding: 5mm 9mm !important; border-radius: 0 !important; margin-bottom: 4mm !important; }
    .pm-teal-cover h1 { font-size: 16pt !important; margin: 0 !important; color: #fff !important; }
    .pm-teal-cover .pm-slogan { font-size: 9.5pt !important; margin: 2mm 0 0 !important; color: #fff !important; }
    .pm-teal-cover .pm-tagline { font-size: 8.5pt !important; margin: 1mm 0 0 !important; color: #fff !important; }
    .pm-body { font-size: 8.5pt !important; line-height: 1.32 !important; }
    .pm-body p, .pm-body h2, .pm-body li { margin: 0 0 1.8mm !important; }
    .pm-body h2 { color: ${GOLD} !important; font-size: 9.5pt !important; }
    .pm-body ul { margin: 0 0 2mm !important; padding-left: 4mm !important; }
    table { font-size: 7.5pt !important; }
    .pm-qr-block { margin-top: 3mm !important; padding-top: 3mm !important; }
    .pm-qr-block img { width: 16mm !important; height: 16mm !important; }
    .pm-impressum { margin-top: 3mm !important; font-size: 6pt !important; color: #5c5650 !important; }
    .pm-footer { position: static !important; margin-top: 2mm !important; font-size: 6pt !important; color: #5c5650 !important; }
    .pm-footer .pm-footer-text { display: none !important; }
    .pm-footer::after { content: "Seite " counter(page); }
    @page { margin: 10mm 12mm 10mm 12mm; size: A4; }
  }
`

/**
 * Detailplan für die Akademie – druckbar, ohne K2-Bezug.
 */
export default function YogaDetailplanPage() {
  const willkommenPath = PROJECT_ROUTES['k2-yoga'].willkommen
  const adminPath = PROJECT_ROUTES['k2-yoga'].admin
  const akademiePath = PROJECT_ROUTES['k2-yoga'].akademie
  const mappePath = PROJECT_ROUTES['k2-yoga'].praesentationsmappe
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${willkommenPath}` : willkommenPath

  useEffect(() => {
    const prev = document.title
    document.title = `${YOGA_DETAIL_COVER_TITLE} – Detailplan`
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(buildQrUrlWithBust(shareUrl, qrVersionTs), { width: 110, margin: 1 })
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

  return (
    <div className="pm-wrap" style={{ minHeight: '100vh', background: YOGA_MARKE.bg, color: YOGA_MARKE.text, fontFamily: YOGA_MARKE.font }}>
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <style>{printStyles}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem', background: YOGA_MARKE.bgCard, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div
          className="pm-no-print"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 0',
            borderBottom: `1px solid ${GOLD_SOFT}`,
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '0.4rem 0.75rem',
              background: GOLD_SOFT,
              color: VIOLETT,
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Als PDF drucken
          </button>
          <Link to={akademiePath} style={{ color: VIOLETT, fontWeight: 600, textDecoration: 'none' }}>
            Fläche Akademie →
          </Link>
          <Link to={adminPath} style={{ color: VIOLETT, fontWeight: 600, textDecoration: 'none' }}>
            Fläche Absolvent:in →
          </Link>
          <Link to={willkommenPath} style={{ color: VIOLETT, fontWeight: 600, textDecoration: 'none' }}>
            Beispiel-Auftritt →
          </Link>
          <Link to={mappePath} style={{ color: VIOLETT, fontWeight: 600, textDecoration: 'none' }}>
            Kurzmappe →
          </Link>
        </div>

        <div
          className="pm-teal-cover"
          style={{
            background: GOLD_DARK,
            color: '#fff',
            padding: 'clamp(1.75rem, 4vw, 2.6rem) 1.4rem',
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
            {YOGA_DETAIL_BADGE}
          </span>
          <p
            style={{
              margin: '0.85rem 0 0',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              opacity: 0.92,
            }}
          >
            Yoga-Akademie Austria
          </p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', fontWeight: 600, color: GOLD_SOFT }}>{YOGA_MARKE.slogan}</p>
          <h1
            style={{
              fontSize: 'clamp(1.45rem, 3.8vw, 2rem)',
              fontWeight: 700,
              color: '#fff',
              margin: '0.45rem 0 0',
              letterSpacing: '-0.02em',
            }}
          >
            {YOGA_DETAIL_COVER_TITLE}
          </h1>
          <p className="pm-slogan" style={{ fontSize: 'clamp(0.98rem, 2.4vw, 1.08rem)', fontWeight: 600, margin: '0.7rem 0 0', lineHeight: 1.4 }}>
            {YOGA_DETAIL_COVER_SLOGAN}
          </p>
          <p className="pm-tagline" style={{ fontSize: 'clamp(0.88rem, 2vw, 0.98rem)', margin: '0.45rem 0 0', lineHeight: 1.5, color: 'rgba(255,255,255,0.95)' }}>
            {YOGA_DETAIL_COVER_TAGLINE}
          </p>
        </div>

        <div className="pm-body">
          <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 1rem' }}>{YOGA_DETAIL_LEAD}</p>

          {YOGA_DETAIL_ABSchnitte.map((a) => (
            <div key={a.nr}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>
                {a.nr}. {a.titel}
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 0.35rem' }}>{a.absatz}</p>
              {a.punkte && a.punkte.length > 0 ? (
                <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.15rem', lineHeight: 1.45 }}>
                  {a.punkte.map((p) => (
                    <li key={p} style={{ marginBottom: '0.2rem' }}>
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>8. Pilotplan</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', margin: '0 0 0.85rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Phase</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Ziel</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {YOGA_DETAIL_PILOT.map((r) => (
                <tr key={r.phase}>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top', fontWeight: 600 }}>{r.phase}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.ziel}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.ergebnis}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>9. Aufwand</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', margin: '0 0 0.85rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Wer</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Was</th>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', color: '#5c5650' }}>Aufwand</th>
              </tr>
            </thead>
            <tbody>
              {YOGA_DETAIL_AUFWAND.map((r) => (
                <tr key={`${r.wer}-${r.was}`}>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.wer}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.was}</td>
                  <td style={{ padding: '0.3rem 0.35rem', borderBottom: '1px solid #e8e4dc', verticalAlign: 'top' }}>{r.aufwand}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>10. Was bewusst nicht gebaut wird</h2>
          <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.15rem', lineHeight: 1.45 }}>
            {YOGA_DETAIL_NICHT.map((p) => (
              <li key={p} style={{ marginBottom: '0.2rem' }}>
                {p}
              </li>
            ))}
          </ul>

          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>11. Was wir zum Gespräch mitbringen</h2>
          <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.15rem', lineHeight: 1.45 }}>
            {YOGA_DETAIL_MITBRINGEN.map((p) => (
              <li key={p} style={{ marginBottom: '0.2rem' }}>
                {p}
              </li>
            ))}
          </ul>

          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: GOLD, margin: '1.1rem 0 0.35rem' }}>12. Nächste Schritte gemeinsam</h2>
          <ol style={{ margin: '0 0 0.4rem', paddingLeft: '1.2rem', lineHeight: 1.45 }}>
            {YOGA_DETAIL_NAECHSTE.map((p) => (
              <li key={p} style={{ marginBottom: '0.2rem' }}>
                {p}
              </li>
            ))}
          </ol>
        </div>

        <div
          className="pm-qr-block"
          style={{
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${GOLD_SOFT}`,
            display: 'flex',
            gap: '0.9rem',
            alignItems: 'center',
          }}
        >
          {qrDataUrl ? <img src={qrDataUrl} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} /> : null}
          <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#5c5650' }}>
            <strong style={{ color: '#1c1a18' }}>Beispiel-Auftritt + beide Arbeitsflächen</strong>
            <p style={{ margin: '0.25rem 0 0' }}>QR = so sieht das Haus aus. Daneben: Büro der Akademie und Fläche der Absolventin.</p>
            <div className="pm-no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem' }}>
              <Link to={willkommenPath} style={{ color: VIOLETT, fontWeight: 700, textDecoration: 'none' }}>
                Auftritt →
              </Link>
              <Link to={akademiePath} style={{ color: VIOLETT, fontWeight: 700, textDecoration: 'none' }}>
                Fläche Akademie →
              </Link>
              <Link to={adminPath} style={{ color: VIOLETT, fontWeight: 700, textDecoration: 'none' }}>
                Fläche Absolvent:in →
              </Link>
            </div>
          </div>
        </div>

        <div
          className="pm-impressum"
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: `1px solid ${GOLD_SOFT}`,
            fontSize: '0.75rem',
            color: '#5c5650',
            lineHeight: 1.45,
          }}
        >
          <div>Rückfragen: {PRODUCT_LIZENZ_ANFRAGE_EMAIL}</div>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </div>
        <div className="pm-footer seitenfuss">
          <span className="pm-footer-text">Detailplan · Yoga-Akademie Austria</span>
        </div>
      </div>
    </div>
  )
}
