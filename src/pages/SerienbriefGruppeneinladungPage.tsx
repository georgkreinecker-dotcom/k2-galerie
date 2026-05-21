import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  SERIENBRIEF_CSV_URL,
  LS_SERIENBRIEF_ROWS,
  type SerienbriefEmpfaenger,
  parseSemicolonCsv,
  csvRowToEmpfaenger,
  suggestAnrede,
  buildBriefHtml,
  buildAlleBriefeHtml,
  downloadTextFile,
  printHtmlDocument,
  BRIEF_DRUCK_HINWEIS,
  empfaengerListToCsv,
  safeFilenamePart,
} from '../utils/serienbriefGruppeneinladung'

const R = PROJECT_ROUTES['k2-galerie']

function loadRowsFromStorage(): SerienbriefEmpfaenger[] | null {
  try {
    const raw = localStorage.getItem(LS_SERIENBRIEF_ROWS)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SerienbriefEmpfaenger[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveRowsToStorage(rows: SerienbriefEmpfaenger[]) {
  localStorage.setItem(LS_SERIENBRIEF_ROWS, JSON.stringify(rows))
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f6f4f0',
  color: '#1c1a18',
  padding: '1.25rem 1rem 3rem',
  fontFamily: 'system-ui, sans-serif',
}

const cardStyle: React.CSSProperties = {
  background: '#fffefb',
  border: '1px solid #e8e4dc',
  borderRadius: 10,
  padding: '1rem 1.15rem',
  marginBottom: '1rem',
}

const btnPrimary: React.CSSProperties = {
  background: '#b54a1e',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '0.55rem 1rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.95rem',
}

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: '#fffefb',
  color: '#1c1a18',
  border: '1px solid #b54a1e',
}

export default function SerienbriefGruppeneinladungPage() {
  const [rows, setRows] = useState<SerienbriefEmpfaenger[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCsv = useCallback(async () => {
    setLoading(true)
    setStatus('')
    const stored = loadRowsFromStorage()
    if (stored?.length) {
      setRows(stored)
      setSelectedId(stored[0]?.id ?? null)
      setLoading(false)
      setStatus(`Gespeicherte Liste (${stored.length} Einträge) geladen.`)
      return
    }
    try {
      const res = await fetch(SERIENBRIEF_CSV_URL)
      if (!res.ok) throw new Error('CSV nicht gefunden')
      const text = await res.text()
      const parsed = parseSemicolonCsv(text).map(csvRowToEmpfaenger)
      setRows(parsed)
      setSelectedId(parsed[0]?.id ?? null)
      saveRowsToStorage(parsed)
      setStatus(`${parsed.length} Vereine aus der Standard-CSV geladen.`)
    } catch (e) {
      setStatus('Liste konnte nicht geladen werden. CSV hochladen oder Speicher leeren.')
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCsv()
  }, [loadCsv])

  const updateRow = useCallback((id: string, patch: Partial<SerienbriefEmpfaenger>) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      saveRowsToStorage(next)
      return next
    })
  }, [])

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId],
  )

  const aktivCount = rows.filter((r) => r.aktiv).length
  const mitAdresse = rows.filter((r) => r.aktiv && (r.strasse.trim() || (r.plz.trim() && r.ort.trim()))).length

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const parsed = parseSemicolonCsv(text).map((row, i) => csvRowToEmpfaenger(row, i))
      setRows(parsed)
      setSelectedId(parsed[0]?.id ?? null)
      saveRowsToStorage(parsed)
      setStatus(`${parsed.length} Zeilen aus Excel/CSV übernommen.`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleAnredeVorschlagen = () => {
    setRows((prev) => {
      const next = prev.map((r) => ({
        ...r,
        anrede: suggestAnrede(r.anrede, r.funktion, r.name),
      }))
      saveRowsToStorage(next)
      return next
    })
    setStatus('Anreden für alle Zeilen vorgeschlagen.')
  }

  const previewHtml = selected ? buildBriefHtml(selected) : ''

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', color: '#5c5650' }}>
          <Link to={R.texteSchreibtisch} style={{ color: '#b54a1e' }}>
            ← Texte-Schreibtisch
          </Link>
        </p>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.45rem', color: '#2c2419' }}>
          Serienbrief – Gruppeneinladung
        </h1>
        <p style={{ margin: '0 0 0.5rem', color: '#5c5650', lineHeight: 1.5, maxWidth: 640 }}>
          Statt Word/Excel manuell: Liste bearbeiten, jeden Brief prüfen, als HTML für Word öffnen oder alle
          drucken. Speicherung bleibt auf diesem Mac.
        </p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: '#b54a1e', maxWidth: 640 }}>
          {BRIEF_DRUCK_HINWEIS}
        </p>

        <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>
            {loading ? '…' : `${rows.length} Einträge`}
          </span>
          <span style={{ color: mitAdresse < aktivCount ? '#b54a1e' : '#2d6a4f' }}>
            {mitAdresse} mit Adresse zum Druck · {aktivCount} aktiv
          </span>
          <button type="button" style={btnSecondary} onClick={() => loadCsv()}>
            Standard-CSV neu laden
          </button>
          <label style={{ ...btnSecondary, display: 'inline-block', cursor: 'pointer' }}>
            Excel-CSV hochladen
            <input
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleCsvUpload(f)
                e.target.value = ''
              }}
            />
          </label>
          <button type="button" style={btnSecondary} onClick={handleAnredeVorschlagen}>
            Anreden vorschlagen
          </button>
          <button
            type="button"
            style={btnSecondary}
            onClick={() => downloadTextFile(empfaengerListToCsv(rows), 'serienbrief-liste.csv', 'text/csv;charset=utf-8')}
          >
            Liste als CSV (Excel)
          </button>
          <button
            type="button"
            style={btnPrimary}
            disabled={aktivCount === 0}
            onClick={() => {
              const r = printHtmlDocument(buildAlleBriefeHtml(rows), 'Alle Briefe')
              setStatus(r.message)
            }}
          >
            Alle aktiven drucken ({aktivCount})
          </button>
        </div>

        {status && (
          <p style={{ margin: '0 0 1rem', padding: '0.5rem 0.75rem', background: '#ebe8e2', borderRadius: 6, fontSize: '0.9rem' }}>
            {status}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: '1rem' }}>
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Empfänger</h2>
            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
              {rows.map((r) => {
                const hatAdr = Boolean(r.strasse.trim() || (r.plz.trim() && r.ort.trim()))
                const isSel = r.id === selectedId
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: 6,
                      padding: '0.5rem 0.65rem',
                      borderRadius: 8,
                      border: isSel ? '2px solid #b54a1e' : '1px solid #e8e4dc',
                      background: isSel ? '#fff5f0' : '#fffefb',
                      cursor: 'pointer',
                      color: '#1c1a18',
                    }}
                  >
                    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={r.aktiv}
                        onChange={(e) => {
                          e.stopPropagation()
                          updateRow(r.id, { aktiv: e.target.checked })
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>
                        <strong style={{ display: 'block', fontSize: '0.92rem' }}>{r.organisation || '—'}</strong>
                        <span style={{ fontSize: '0.8rem', color: hatAdr ? '#5c5650' : '#b54a1e' }}>
                          {hatAdr ? `${r.plz} ${r.ort}`.trim() : 'Adresse fehlt'}
                        </span>
                      </span>
                    </label>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {selected ? (
              <>
                <div style={cardStyle}>
                  <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Brief bearbeiten</h2>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {(
                      [
                        ['anrede', 'Anrede'],
                        ['name', 'Name'],
                        ['funktion', 'Funktion'],
                        ['organisation', 'Verein'],
                        ['strasse', 'Straße'],
                        ['plz', 'PLZ'],
                        ['ort', 'Ort'],
                        ['email', 'E-Mail'],
                        ['hinweis', 'Hinweis (nur für dich)'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} style={{ display: 'block' }}>
                        <span style={{ color: '#5c5650', fontSize: '0.8rem' }}>{label}</span>
                        <input
                          value={selected[key]}
                          onChange={(e) => updateRow(selected.id, { [key]: e.target.value })}
                          style={{
                            width: '100%',
                            marginTop: 2,
                            padding: '0.4rem 0.5rem',
                            border: '1px solid #c4b8a8',
                            borderRadius: 6,
                            fontSize: '0.9rem',
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      style={btnPrimary}
                      onClick={() => {
                        const html = buildBriefHtml(selected)
                        downloadTextFile(
                          html,
                          `Brief-${safeFilenamePart(selected.organisation)}.html`,
                          'text/html;charset=utf-8',
                        )
                        setStatus(
                          'HTML gespeichert – Doppelklick öffnet in Word (Mac). Dort ggf. „Speichern als“ .docx.',
                        )
                      }}
                    >
                      Für Word speichern (.html)
                    </button>
                    <button
                      type="button"
                      style={btnSecondary}
                      onClick={() => {
                        const r = printHtmlDocument(buildBriefHtml(selected), selected.organisation)
                        setStatus(r.message)
                      }}
                    >
                      Diesen Brief drucken
                    </button>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                  <p style={{ margin: 0, padding: '0.5rem 0.75rem', background: '#ebe8e2', fontSize: '0.85rem' }}>
                    Vorschau
                  </p>
                  <iframe
                    title="Briefvorschau"
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: 1120, border: 'none', background: '#fff' }}
                  />
                </div>
              </>
            ) : (
              <div style={cardStyle}>
                <p style={{ margin: 0, color: '#5c5650' }}>Links einen Empfänger wählen.</p>
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#5c5650' }}>
          Tipp: In Excel die CSV mit Semikolon speichern. Adressen ohne Straße/PLZ sind standardmäßig inaktiv – Häkchen
          setzen, wenn du trotzdem drucken willst.
        </p>
      </div>
    </div>
  )
}
