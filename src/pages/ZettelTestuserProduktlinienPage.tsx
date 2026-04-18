/**
 * Testuser-Zettel – drei Produktlinien (ök2, VK2, K2 Familie): kostenlose Testlizenz, Gutschein-Hinweis, Voraussetzungen.
 * QR mit Server-Stand + Cache-Bust (Pilot-Zettel-Muster).
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, ENTDECKEN_ROUTE, K2_FAMILIE_WILLKOMMEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const TESTUSER_ZETTEL_MD = '/k2team-handbuch/28-TESTUSER-ZETTEL-PRODUKTLINIEN.md'
const OEK2_BASE = BASE_APP_URL + ENTDECKEN_ROUTE
const VK2_BASE = BASE_APP_URL + PROJECT_ROUTES.vk2.galerie
const K2_FAMILIE_BASE = BASE_APP_URL + K2_FAMILIE_WILLKOMMEN_ROUTE

export default function ZettelTestuserProduktlinienPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [qrOek2, setQrOek2] = useState('')
  const [qrVk2, setQrVk2] = useState('')
  const [qrFamilie, setQrFamilie] = useState('')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()

  useEffect(() => {
    fetch(TESTUSER_ZETTEL_MD)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const oek2Bust = buildQrUrlWithBust(OEK2_BASE, qrVersionTs)
    const vk2Bust = buildQrUrlWithBust(VK2_BASE, qrVersionTs)
    const famBust = buildQrUrlWithBust(K2_FAMILIE_BASE, qrVersionTs)
    QRCode.toDataURL(oek2Bust, { width: 100, margin: 1 }).then(setQrOek2).catch(() => setQrOek2(''))
    QRCode.toDataURL(vk2Bust, { width: 100, margin: 1 }).then(setQrVk2).catch(() => setQrVk2(''))
    QRCode.toDataURL(famBust, { width: 100, margin: 1 }).then(setQrFamilie).catch(() => setQrFamilie(''))
  }, [qrVersionTs])

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
        .zettel-page ul, .zettel-page ol { margin: 0.25rem 0 0.5rem 1.2rem; padding: 0; }
        .zettel-page li { margin-bottom: 0.15rem; }
        .zettel-page hr { border: none; border-top: 1px solid #ccc; margin: 0.5rem 0; }
        .zettel-page table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0.4rem 0; }
        .zettel-page th, .zettel-page td { border: 1px solid #ccc; padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }
        .zettel-page th { background: #f5f5f5; font-weight: 600; }
        .zettel-page code { font-size: 0.9em; word-break: break-all; }
        .zettel-page strong { font-weight: 600; }
        .zettel-page em { font-style: italic; }
        .zettel-qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 0.5rem; }
        @media print {
          .zettel-page { padding-bottom: 14mm !important; }
          .zettel-footer { display: flex !important; justify-content: space-between; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; padding: 2mm 12mm; font-size: 9pt; color: #555; background: #fff; }
          .zettel-footer-page::before { content: "Seite "; }
          .zettel-footer-page::after { content: counter(page); }
        }
        @media (max-width: 640px) {
          .zettel-qr-grid { grid-template-columns: 1fr; }
        }
        .zettel-footer { display: none; }
      `}</style>

      <div
        className="zettel-no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '0.5rem 1rem',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🖨️ Drucken / Als PDF speichern
        </button>
        <Link to="/mission-control" style={{ color: '#333', fontSize: '0.9rem' }}>
          ← Mission Control
        </Link>
        <Link to="/k2team-handbuch?doc=28-TESTUSER-ZETTEL-PRODUKTLINIEN.md" style={{ color: '#333', fontSize: '0.9rem' }}>
          Im Handbuch öffnen
        </Link>
      </div>

      <div className="zettel-page" style={{ marginTop: '3rem' }}>
        <ZettelTestuserMarkdown md={content} />
        <h2 className="zettel-seite-qr">QR-Einstiege – drei Produktlinien</h2>
        <p style={{ marginBottom: '0.5rem', fontSize: '9.5pt', color: '#444' }}>
          Zum Scannen mit dem Handy: gleicher Server-Stand wie die Live-App (kein alter Cache).
        </p>
        <div className="zettel-qr-grid">
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', textAlign: 'center', background: '#fafafa' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>ök2 – Demo-Galerie</strong>
            {qrOek2 ? <img src={qrOek2} alt="QR ök2 Einstieg" style={{ width: 96, height: 96, margin: '0 auto', display: 'block' }} /> : null}
            <code style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.35rem', wordBreak: 'break-all' }}>{OEK2_BASE}</code>
          </div>
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', textAlign: 'center', background: '#fafafa' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>VK2 – Vereinsplattform</strong>
            {qrVk2 ? <img src={qrVk2} alt="QR VK2 Galerie" style={{ width: 96, height: 96, margin: '0 auto', display: 'block' }} /> : null}
            <code style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.35rem', wordBreak: 'break-all' }}>{VK2_BASE}</code>
          </div>
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', textAlign: 'center', background: '#fafafa' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>K2 Familie – Willkommen</strong>
            {qrFamilie ? <img src={qrFamilie} alt="QR K2 Familie" style={{ width: 96, height: 96, margin: '0 auto', display: 'block' }} /> : null}
            <code style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.35rem', wordBreak: 'break-all' }}>{K2_FAMILIE_BASE}</code>
          </div>
        </div>
      </div>
      <footer className="zettel-footer" aria-hidden="true">
        <span className="zettel-footer-page" />
        <span>K2 Galerie kgm solution</span>
      </footer>
    </>
  )
}

function ZettelTestuserMarkdown({ md }: { md: string }) {
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
      out.push(<h2 key={i}>{line.slice(3).trim()}</h2>)
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
        const row = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        const isSep = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
        if (row.length > 0 && !isSep) rows.push(row)
        i++
      }
      if (rows.length > 0) {
        const [head, ...body] = rows
        out.push(
          <table key={i}>
            {head && (
              <thead>
                <tr>
                  {head.map((c, j) => (
                    <th key={j}>{parseInline(c)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={c === 1 ? { wordBreak: 'break-all' as const } : undefined}>
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
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
        const raw = lines[i].slice(2).trim()
        if (/^\d+\.\s/.test(raw)) break
        items.push(<li key={items.length}>{parseInline(raw)}</li>)
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
      const candidates = [idxB, idxE, idxC].filter((x) => x >= 0)
      const next = candidates.length ? Math.min(...candidates) : rest.length
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
