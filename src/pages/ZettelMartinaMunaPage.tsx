/**
 * Martina & Muna – ein Blatt zum Ausdrucken.
 * Nur dieser Inhalt, weiß, eine Seite. Kein Handbuch, keine Sidebar.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'

const ZETTEL_MD = '/k2team-handbuch/19-MARTINA-MUNA-BESUCH-OEK2-VK2.md'
const OEK2_URL = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich'
const VK2_URL = 'https://k2-galerie.vercel.app/projects/vk2/galerie'

export default function ZettelMartinaMunaPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [qrOek2, setQrOek2] = useState<string>('')
  const [qrVk2, setQrVk2] = useState<string>('')

  useEffect(() => {
    fetch(ZETTEL_MD)
      .then((r) => r.ok ? r.text() : '')
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    QRCode.toDataURL(OEK2_URL, { width: 100, margin: 1 }).then(setQrOek2).catch(() => {})
    QRCode.toDataURL(VK2_URL, { width: 100, margin: 1 }).then(setQrVk2).catch(() => {})
  }, [])

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
        <Link to="/k2team-handbuch" style={{ color: '#333', fontSize: '0.9rem' }}>← Handbuch</Link>
      </div>

      <div className="zettel-page" style={{ marginTop: '3rem' }}>
        <ZettelContent md={content} qrOek2={qrOek2} qrVk2={qrVk2} />
      </div>
      <footer className="zettel-footer" aria-hidden="true">
        <span className="zettel-footer-page" />
        <span>K2 Galerie kgm.solution</span>
      </footer>
    </>
  )
}

function ZettelContent({ md, qrOek2, qrVk2 }: { md: string; qrOek2: string; qrVk2: string }) {
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
        const isAdressTable = body.length === 2 && body[0][0]?.includes('ök2') && body[1][0]?.includes('VK2')
        out.push(
          <table key={i}>
            {head && (
              <thead>
                <tr>
                  {head.map((c, j) => <th key={j}>{parseInline(c)}</th>)}
                  {isAdressTable && qrOek2 && qrVk2 && <th key="qr">QR</th>}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <React.Fragment key={r}>
                  <tr>
                    {row.map((c, j) => <td key={j}>{parseInline(c)}</td>)}
                    {isAdressTable && qrOek2 && qrVk2 && (
                      <td key="qr" style={{ verticalAlign: 'middle', width: 52 }}>
                        {r === 0 && <img src={qrOek2} alt="QR ök2" style={{ display: 'block', width: 48, height: 48 }} />}
                        {r === 1 && <img src={qrVk2} alt="QR VK2" style={{ display: 'block', width: 48, height: 48 }} />}
                      </td>
                    )}
                  </tr>
                  {isAdressTable && qrOek2 && qrVk2 && r === 0 && (
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
