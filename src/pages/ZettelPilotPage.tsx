/**
 * Pilot-Zettel – Testpilot:in ök2 & VK2 (20-PILOT-…) oder K2 Familie (32-PILOT-…, eigenes Lizenz-/Produktkonzept).
 * Name und Pilot-URL aus Query. QR: bei Pilot-URL deren busted QR.
 */

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, ENTDECKEN_ROUTE, K2_FAMILIE_WILLKOMMEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { buildFamiliePilotFamilienZugang, buildFamiliePilotTenantIdFromZettelNr } from '../utils/familiePilotSeed'

const PILOT_ZETTEL_MD_OEK2_VK2 = '/k2team-handbuch/20-PILOT-ZETTEL-OEK2-VK2.md'
/** K2 Familie = eigene Produktlinie, kein Galerie-Lizenzsystem (ök2/VK2) – eigener Zetteltext */
const PILOT_ZETTEL_MD_K2_FAMILIE = '/k2team-handbuch/32-PILOT-ZETTEL-K2-FAMILIE.md'
/** Testpiloten über denselben Einstieg wie alle: Entdecken → Vorschau → Admin */
const OEK2_BASE = BASE_APP_URL + ENTDECKEN_ROUTE
const VK2_BASE = BASE_APP_URL + PROJECT_ROUTES.vk2.galerie
const FAMILIE_BASE = BASE_APP_URL + K2_FAMILIE_WILLKOMMEN_ROUTE

function pilotUrlIsK2FamilieWillkommen(pilotUrl: string): boolean {
  return pilotUrl === FAMILIE_BASE || pilotUrl.startsWith(`${FAMILIE_BASE}?`)
}

export type PilotType = 'oek2' | 'vk2' | 'familie'

export default function ZettelPilotPage() {
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name')?.trim() || ''
  const appName = searchParams.get('appName')?.trim() || ''
  /** Für Texte/Zettel: gewählter App-Name, sonst Kontaktname (alte Links) */
  const displayAppName = appName || name
  const pilotUrl = searchParams.get('pilotUrl')?.trim() || ''
  const typeParam = searchParams.get('type')?.trim().toLowerCase()
  const pilotType: PilotType | null =
    typeParam === 'oek2' || typeParam === 'vk2' || typeParam === 'familie'
      ? typeParam
      : pilotUrl === OEK2_BASE
        ? 'oek2'
        : pilotUrl === VK2_BASE
          ? 'vk2'
          : pilotUrlIsK2FamilieWillkommen(pilotUrl)
            ? 'familie'
            : null
  const nr = searchParams.get('nr')?.trim() || ''

  const familieUrlForQr =
    pilotType === 'familie' && pilotUrl.includes('t=familie-pilot-') ? pilotUrl : FAMILIE_BASE

  const useK2FamilieZettel =
    pilotType === 'familie' || (pilotType === null && pilotUrlIsK2FamilieWillkommen(pilotUrl))

  const pilotZettelMd = useK2FamilieZettel ? PILOT_ZETTEL_MD_K2_FAMILIE : PILOT_ZETTEL_MD_OEK2_VK2

  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [qrPilot, setQrPilot] = useState<string>('')
  const [qrVk2, setQrVk2] = useState<string>('')
  const [qrOek2, setQrOek2] = useState<string>('')
  const [qrFamilie, setQrFamilie] = useState<string>('')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()

  useEffect(() => {
    setLoading(true)
    fetch(pilotZettelMd)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pilotZettelMd])

  useEffect(() => {
    const oek2Bust = buildQrUrlWithBust(OEK2_BASE, qrVersionTs)
    const vk2Bust = buildQrUrlWithBust(VK2_BASE, qrVersionTs)
    const familieBust = buildQrUrlWithBust(familieUrlForQr, qrVersionTs)
    if (pilotUrl) {
      const busted = pilotUrl.startsWith(BASE_APP_URL) ? buildQrUrlWithBust(pilotUrl, qrVersionTs) : pilotUrl
      QRCode.toDataURL(busted, { width: 100, margin: 1 }).then(setQrPilot).catch(() => setQrPilot(''))
    } else {
      setQrPilot('')
    }
    QRCode.toDataURL(oek2Bust, { width: 100, margin: 1 }).then(setQrOek2).catch(() => {})
    QRCode.toDataURL(vk2Bust, { width: 100, margin: 1 }).then(setQrVk2).catch(() => {})
    QRCode.toDataURL(familieBust, { width: 100, margin: 1 }).then(setQrFamilie).catch(() => setQrFamilie(''))
  }, [pilotUrl, qrVersionTs, familieUrlForQr])

  if (loading) {
    return (
      <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
        Zettel wird geladen …
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          .zettel-no-print { display: none !important; }
          body, html { background: #fff !important; margin: 0 !important; }
          .zettel-page { box-shadow: none !important; margin: 0 !important; padding: 10mm 12mm !important; max-width: none !important; }
        }
        .zettel-page {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm 12mm 16mm;
          background: #fff;
          color: #1c1a18;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
        }
        .zettel-page h1 { font-size: 1.25rem; margin: 0 0 0.5rem; font-weight: 700; }
        .zettel-page h2 { font-size: 1rem; margin: 0.6rem 0 0.3rem; font-weight: 600; }
        .zettel-page p { margin: 0 0 0.35rem; }
        .zettel-page ul { margin: 0.25rem 0 0.5rem 1.2rem; padding: 0; }
        .zettel-page li { margin-bottom: 0.15rem; }
        .zettel-page hr { border: none; border-top: 1px solid #ccc; margin: 0.5rem 0; }
        .zettel-page table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0.4rem 0; }
        .zettel-page th, .zettel-page td { border: 1px solid #ccc; padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }
        .zettel-page th { background: #f5f5f5; font-weight: 600; }
        .zettel-page code { font-size: 0.9em; word-break: break-all; }
        .zettel-page strong { font-weight: 600; }
        .zettel-page em { font-style: italic; }
        .zettel-page table img { display: block; max-width: 48px; height: auto; }
        .zettel-pilot-name { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
        @media print {
          .zettel-page h2.zettel-seite-2 { page-break-before: always; padding-top: 0; }
          .zettel-page { padding-bottom: 14mm !important; }
          .zettel-footer { display: flex !important; justify-content: space-between; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; padding: 2mm 12mm; font-size: 9pt; color: #555; background: #fff; }
          .zettel-footer-page::before { content: "Seite "; }
          .zettel-footer-page::after { content: counter(page); }
        }
        .zettel-footer { display: none; }
      `}</style>

      <div className="zettel-no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '0.5rem 1rem', background: '#f5f5f5', borderBottom: '1px solid #ddd', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
        >
          🖨️ Drucken / Als PDF speichern
        </button>
        <Link to="/mission-control" style={{ color: '#333', fontSize: '0.9rem' }}>← Mission Control</Link>
        <Link to="/zettel-pilot-form" style={{ color: '#333', fontSize: '0.9rem' }}>Neuer Test-Pilot</Link>
      </div>

      <div className="zettel-page" style={{ marginTop: '3rem' }}>
        {nr && (
          <p className="zettel-pilot-name" style={{ marginBottom: '0.25rem' }}>
            <strong>Test-Pilot-Zettel Nr. {nr}</strong>
          </p>
        )}
        <p className="zettel-pilot-name">
          <strong>Name der Pilot:in:</strong> {name || '________________'}
        </p>
        {appName ? (
          <p className="zettel-pilot-name" style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>
            <strong>Name der App (für den Test):</strong> {appName}
          </p>
        ) : null}
        {pilotType === 'familie' && nr ? (
          <p
            className="zettel-pilot-name"
            style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333', marginBottom: '0.75rem' }}
          >
            <strong>Test-Zugang K2 Familie:</strong> Familien-Zugangsnummer{' '}
            <code style={{ fontSize: '0.9em' }}>{buildFamiliePilotFamilienZugang(nr)}</code>
            {' · '}Instanz{' '}
            <code style={{ fontSize: '0.9em' }}>{buildFamiliePilotTenantIdFromZettelNr(nr)}</code>
            {' '}
            (steht auch im QR; nach dem Öffnen ist die Familie unter „{displayAppName || '…'}“ bereit)
          </p>
        ) : null}
        <ZettelPilotContent
          md={content}
          pilotType={pilotType}
          pilotUrl={pilotUrl || null}
          qrPilot={qrPilot}
          oek2Url={OEK2_BASE}
          vk2Url={VK2_BASE}
          familieUrl={familieUrlForQr}
          qrOek2={qrOek2}
          qrVk2={qrVk2}
          qrFamilie={qrFamilie}
        />
      </div>
      <footer className="zettel-footer" aria-hidden="true">
        <span className="zettel-footer-page" />
        <span>K2 Galerie kgm.solution</span>
      </footer>
    </>
  )
}

function ZettelPilotContent({
  md,
  pilotType,
  pilotUrl,
  qrPilot,
  oek2Url,
  vk2Url,
  familieUrl,
  qrOek2,
  qrVk2,
  qrFamilie,
}: {
  md: string
  pilotType: PilotType | null
  pilotUrl: string | null
  qrPilot: string
  oek2Url: string
  vk2Url: string
  familieUrl: string
  qrOek2: string
  qrVk2: string
  qrFamilie: string
}) {
  const lines = md.split('\n')
  const out: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      out.push(<div key={i} style={{ height: '0.4rem' }} />)
      i++
      continue
    }

    if (line.startsWith('# ')) {
      out.push(<h1 key={i}>{line.slice(2).trim()}</h1>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      const isSeite2 = title.startsWith('Schritt für Schritt')
      out.push(<h2 key={i} className={isSeite2 ? 'zettel-seite-2' : undefined}>{title}</h2>)
      i++
      continue
    }
    if (t === '---' || /^-+$/.test(t)) {
      out.push(<hr key={i} />)
      i++
      continue
    }

    if (line.startsWith('|') && line.includes('|', 1)) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i].split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        const isSep = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
        if (row.length > 0 && !isSep) rows.push(row)
        i++
      }
      if (rows.length > 0) {
        const [head, ...body] = rows
        const isPilotTable = body.length >= 2 && body[0][0]?.includes('ök2') && body[1][0]?.includes('VK2')
        const isK2FamiliePilotTable =
          pilotType === 'familie' &&
          !isPilotTable &&
          body.length >= 1 &&
          head.length >= 2 &&
          /bereich|adresse/i.test(`${head[0] || ''} ${head[1] || ''}`)

        if (isK2FamiliePilotTable) {
          out.push(
            <table key={i}>
              {head && (
                <thead>
                  <tr>
                    {head.map((c, j) => (
                      <th key={j}>{parseInline(c)}</th>
                    ))}
                    {qrFamilie ? <th key="qr">QR</th> : null}
                  </tr>
                </thead>
              )}
              <tbody>
                {body.map((row, r) => (
                  <tr key={r}>
                    <td>{parseInline(row[0] || '')}</td>
                    <td style={{ wordBreak: 'break-all' }}>
                      {r === 0 ? pilotUrl || familieUrl : parseInline(row[1] || '')}
                    </td>
                    {qrFamilie ? (
                      <td style={{ verticalAlign: 'middle', width: 52 }}>
                        {r === 0 ? (
                          <img
                            src={qrFamilie}
                            alt="QR K2 Familie"
                            style={{ display: 'block', width: 48, height: 48 }}
                          />
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )
          continue
        }

        out.push(
          <table key={i}>
            {head && (
              <thead>
                <tr>
                  {head.map((c, j) => (
                    <th key={j}>{parseInline(c)}</th>
                  ))}
                    {isPilotTable && (qrPilot || qrOek2 || qrVk2) && <th key="qr">QR</th>}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <React.Fragment key={r}>
                  <tr>
                    <td>{parseInline(row[0] || '')}</td>
                    <td style={{ wordBreak: 'break-all' }}>
                      {isPilotTable && r === 0
                        ? pilotType === 'oek2' && pilotUrl
                          ? pilotUrl
                          : pilotType === 'vk2'
                            ? oek2Url
                            : pilotType === 'familie' && pilotUrl
                              ? pilotUrl
                              : pilotType === 'familie'
                                ? familieUrl
                                : pilotUrl || '(Adresse und QR vom Team erhalten)'
                        : isPilotTable && r === 1
                          ? pilotType === 'vk2' && pilotUrl
                            ? pilotUrl
                            : vk2Url
                          : parseInline(row[1] || '')}
                    </td>
                    {isPilotTable && (qrPilot || qrOek2 || qrVk2 || qrFamilie) && (
                      <td style={{ verticalAlign: 'middle', width: 52 }}>
                        {r === 0 &&
                        ((pilotType === 'oek2' || (pilotType === null && pilotUrl))
                          ? qrPilot
                          : pilotType === 'vk2'
                            ? qrOek2
                            : pilotType === 'familie'
                              ? qrFamilie
                              : null) ? (
                          <img
                            src={
                              (pilotType === 'oek2' || (pilotType === null && pilotUrl))
                                ? qrPilot
                                : pilotType === 'vk2'
                                  ? qrOek2
                                  : qrFamilie
                            }
                            alt={pilotType === 'familie' ? 'QR K2 Familie' : 'QR ök2'}
                            style={{ display: 'block', width: 48, height: 48 }}
                          />
                        ) : r === 1 && (pilotType === 'vk2' ? qrPilot : qrVk2) ? (
                          <img src={pilotType === 'vk2' ? qrPilot : qrVk2} alt="QR VK2" style={{ display: 'block', width: 48, height: 48 }} />
                        ) : r === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>{pilotType === 'vk2' ? 'zum Vergleich' : 'vom Team'}</span>
                        ) : null}
                      </td>
                    )}
                  </tr>
                  {isPilotTable && r === 0 && (
                    <tr aria-hidden>
                      <td colSpan={3} style={{ height: '1.5rem', border: 'none', background: 'transparent', padding: 0, lineHeight: 0 }} />
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )
      }
      continue
    }

    if (line.startsWith('- [ ] ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].startsWith('- [ ] ')) {
        items.push(<li key={items.length}>☐ {parseInline(lines[i].slice(6).trim())}</li>)
        i++
      }
      out.push(<ul key={i}>{items}</ul>)
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={items.length}>{parseInline(lines[i].slice(2).trim())}</li>)
        i++
      }
      out.push(<ul key={i}>{items}</ul>)
      continue
    }

    if (line.match(/^\d+\.\s/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(<li key={items.length}>{parseInline(lines[i].replace(/^\d+\.\s/, '').trim())}</li>)
        i++
      }
      out.push(<ol key={i}>{items}</ol>)
      continue
    }

    out.push(<p key={i}>{parseInline(line)}</p>)
    i++
  }

  return <>{out}</>
}

function parseInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let rest = s
  let key = 0
  while (rest.length > 0) {
    const bold = rest.match(/^\*\*([^*]+)\*\*/)
    const em = rest.match(/^\*([^*]+)\*/)
    const code = rest.match(/^`([^`]+)`/)
    if (bold) {
      parts.push(<strong key={key++}>{bold[1]}</strong>)
      rest = rest.slice(bold[0].length)
    } else if (em) {
      parts.push(<em key={key++}>{em[1]}</em>)
      rest = rest.slice(em[0].length)
    } else if (code) {
      parts.push(<code key={key++}>{code[1]}</code>)
      rest = rest.slice(code[0].length)
    } else {
      const idxB = rest.indexOf('**')
      const idxE = rest.indexOf('*')
      const idxC = rest.indexOf('`')
      const next = [idxB, idxE, idxC].filter((x) => x >= 0).length
        ? Math.min(...[idxB, idxE, idxC].filter((x) => x >= 0))
        : rest.length
      if (next >= rest.length) {
        parts.push(rest)
        break
      }
      parts.push(rest.slice(0, next))
      rest = rest.slice(next)
    }
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>
}
