import { Link } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'

const R = PROJECT_ROUTES['k2-galerie']

export const LS_ZENTRUM = 'k2-texte-schreibtisch-zentrum'
export const LS_ARCHIV = 'k2-texte-schreibtisch-archiv'
const LS_GEOM = 'k2-texte-schreibtisch-board-geom'
const MAX_TEXT = 100_000
const MAX_ARCHIV = 40

export type ArchivEintrag = {
  id: string
  gespeichertAm: string
  ausschnitt: string
  volltext: string
}

export type BoardGeom = {
  floating: boolean
  x: number
  y: number
  w: number
  h: number
}

function defaultGeom(): BoardGeom {
  const w = typeof window !== 'undefined' ? Math.min(640, Math.max(360, window.innerWidth - 96)) : 640
  const h = typeof window !== 'undefined' ? Math.min(560, Math.max(320, window.innerHeight - 120)) : 520
  return { floating: false, x: 72, y: 88, w, h }
}

function ladeGeom(): BoardGeom {
  try {
    const v = localStorage.getItem(LS_GEOM)
    if (!v) return defaultGeom()
    const p = JSON.parse(v) as BoardGeom
    if (typeof p !== 'object' || p == null) return defaultGeom()
    return {
      floating: !!p.floating,
      x: Number.isFinite(p.x) ? p.x : 72,
      y: Number.isFinite(p.y) ? p.y : 88,
      w: Number.isFinite(p.w) ? Math.max(280, Math.min(p.w, 2000)) : 640,
      h: Number.isFinite(p.h) ? Math.max(240, Math.min(p.h, 2000)) : 520,
    }
  } catch {
    return defaultGeom()
  }
}

function speichereGeom(g: BoardGeom) {
  try {
    localStorage.setItem(LS_GEOM, JSON.stringify(g))
  } catch {
    /* ignore */
  }
}

function ladeZentrum(): string {
  try {
    const v = localStorage.getItem(LS_ZENTRUM)
    if (typeof v === 'string' && v.length <= MAX_TEXT) return v
  } catch {
    /* ignore */
  }
  return ''
}

function speichereZentrum(text: string) {
  try {
    localStorage.setItem(LS_ZENTRUM, text.slice(0, MAX_TEXT))
  } catch {
    /* ignore */
  }
}

function ladeArchiv(): ArchivEintrag[] {
  try {
    const v = localStorage.getItem(LS_ARCHIV)
    if (!v) return []
    const p = JSON.parse(v) as ArchivEintrag[]
    return Array.isArray(p) ? p.slice(0, MAX_ARCHIV) : []
  } catch {
    return []
  }
}

function speichereArchiv(liste: ArchivEintrag[]) {
  try {
    localStorage.setItem(LS_ARCHIV, JSON.stringify(liste.slice(0, MAX_ARCHIV)))
  } catch {
    /* ignore */
  }
}

const BTN_PRIM = {
  background: '#b54a1e',
  color: '#fff',
  border: '1px solid #923b18',
  borderRadius: 8,
  padding: '0.45rem 0.75rem',
  fontWeight: 700 as const,
  fontSize: '0.82rem',
  cursor: 'pointer' as const,
  fontFamily: 'inherit' as const,
}

const BTN_SEC = {
  background: '#fffefb',
  color: '#1c1a18',
  border: '1px solid rgba(28,26,24,0.18)',
  borderRadius: 8,
  padding: '0.45rem 0.75rem',
  fontWeight: 600 as const,
  fontSize: '0.82rem',
  cursor: 'pointer' as const,
  fontFamily: 'inherit' as const,
}

type Props = {
  /** page = im Schreibtisch (optional schwebend); standalone = eigenes Browserfenster */
  variant: 'page' | 'standalone'
}

export function TexteSchreibtischBoard({ variant }: Props) {
  const [geom, setGeom] = useState<BoardGeom>(() => (variant === 'standalone' ? { ...defaultGeom(), floating: false } : ladeGeom()))
  const [text, setText] = useState(ladeZentrum)
  const [archiv, setArchiv] = useState<ArchivEintrag[]>(ladeArchiv)
  const [vorschau, setVorschau] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const resizeSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isFloating = variant === 'page' && geom.floating

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return
      if (e.key === LS_ZENTRUM && e.newValue != null) setText(e.newValue)
      if (e.key === LS_ARCHIV && e.newValue != null) {
        try {
          const p = JSON.parse(e.newValue) as ArchivEintrag[]
          if (Array.isArray(p)) setArchiv(p.slice(0, MAX_ARCHIV))
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      speichereZentrum(text)
      setStatus('Gespeichert')
      setTimeout(() => setStatus(null), 1200)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [text])

  useEffect(() => {
    if (!isFloating || !panelRef.current) return
    const el = panelRef.current
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (resizeSaveRef.current) clearTimeout(resizeSaveRef.current)
      resizeSaveRef.current = setTimeout(() => {
        setGeom((g) => {
          const next = {
            ...g,
            w: Math.round(r.width),
            h: Math.round(r.height),
            x: Math.round(r.left),
            y: Math.round(r.top),
          }
          speichereGeom(next)
          return next
        })
      }, 200)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      if (resizeSaveRef.current) clearTimeout(resizeSaveRef.current)
    }
  }, [isFloating])

  const hinweis = useCallback((msg: string) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), 2500)
  }, [])

  const ablegen = () => {
    const t = text.trim()
    if (!t) {
      hinweis('Mitte ist leer – nichts abzulegen.')
      return
    }
    const jetzt = new Date().toISOString()
    const neu: ArchivEintrag = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gespeichertAm: jetzt,
      ausschnitt: t.replace(/\s+/g, ' ').slice(0, 160) + (t.length > 160 ? '…' : ''),
      volltext: t.slice(0, MAX_TEXT),
    }
    const liste = [neu, ...archiv].slice(0, MAX_ARCHIV)
    setArchiv(liste)
    speichereArchiv(liste)
    setText('')
    speichereZentrum('')
    hinweis('In die Ablage gelegt. Mitte ist frei.')
  }

  const loeschenMitte = () => {
    if (!text.trim()) return
    if (typeof window !== 'undefined' && !window.confirm('Mitte wirklich leeren? (Nicht gesichert – Ablage nutzen zum Sichern.)')) return
    setText('')
    speichereZentrum('')
    hinweis('Mitte geleert.')
  }

  const archivWiederMitte = (eintrag: ArchivEintrag) => {
    const neu = text.trim() ? `${text.trim()}\n\n––– aus Ablage ${new Date(eintrag.gespeichertAm).toLocaleString('de-AT')} –––\n\n${eintrag.volltext}` : eintrag.volltext
    setText(neu.slice(0, MAX_TEXT))
    hinweis('Ablage-Inhalt in die Mitte geholt.')
  }

  const archivEntfernen = (id: string) => {
    const liste = archiv.filter((a) => a.id !== id)
    setArchiv(liste)
    speichereArchiv(liste)
  }

  const kopieren = async () => {
    const t = text.trim()
    if (!t) {
      hinweis('Nichts zum Kopieren.')
      return
    }
    try {
      await navigator.clipboard.writeText(t)
      hinweis('In die Zwischenablage kopiert.')
    } catch {
      hinweis('Kopieren ging nicht – Browser-Berechtigung?')
    }
  }

  const versendenMail = () => {
    const t = text.trim()
    if (!t) {
      hinweis('Nichts zum Versenden.')
      return
    }
    const subj = encodeURIComponent('K2 – Schreibtisch')
    const body = encodeURIComponent(t)
    window.location.href = `mailto:?subject=${subj}&body=${body}`
  }

  const dateienAnhaengen = (files: FileList | null) => {
    if (!files?.length) return
    const zeilen = Array.from(files).map((f) => `📎 ${f.name}`)
    setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${zeilen.join('\n')}` : zeilen.join('\n')).slice(0, MAX_TEXT))
    hinweis(`${files.length} Datei(en) in die Notiz gesetzt.`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files?.length) {
      dateienAnhaengen(e.dataTransfer.files)
      return
    }
    const plain = e.dataTransfer.getData('text/plain')
    if (plain) {
      setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${plain}` : plain).slice(0, MAX_TEXT))
      hinweis('Text hereingezogen.')
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const toggleFloating = () => {
    if (variant !== 'page') return
    setGeom((g) => {
      if (g.floating) {
        const next = { ...g, floating: false }
        speichereGeom(next)
        return next
      }
      const el = panelRef.current
      if (el) {
        const r = el.getBoundingClientRect()
        const next: BoardGeom = {
          ...g,
          floating: true,
          w: Math.max(320, Math.round(r.width)),
          h: Math.max(280, Math.round(r.height)),
          x: Math.round(r.left),
          y: Math.round(r.top),
        }
        speichereGeom(next)
        return next
      }
      const next = { ...g, floating: true }
      speichereGeom(next)
      return next
    })
  }

  const einbetten = () => {
    setGeom((g) => {
      const next = { ...g, floating: false }
      speichereGeom(next)
      return next
    })
  }

  const openSecondWindow = () => {
    const path = R.texteSchreibtischBoard
    const url = `${window.location.origin}${path}`
    try {
      const w = window.open(url, 'k2SchreibtischBoard', 'noopener,noreferrer,width=880,height=700')
      if (!w) hinweis('Popup blockiert – im Browser erlauben oder Adresse manuell öffnen.')
    } catch {
      hinweis('Zweites Fenster ging nicht.')
    }
  }

  const onDragHandlePointerDown = (e: React.PointerEvent) => {
    if (!isFloating) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX - geom.x
    const startY = e.clientY - geom.y
    const onMove = (ev: PointerEvent) => {
      setGeom((g) => ({
        ...g,
        x: Math.max(0, ev.clientX - startX),
        y: Math.max(0, ev.clientY - startY),
      }))
    }
    const onUp = () => {
      setGeom((g) => {
        speichereGeom(g)
        return g
      })
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const sectionStyle: React.CSSProperties =
    variant === 'standalone'
      ? {
          minHeight: '100vh',
          boxSizing: 'border-box',
          marginBottom: 0,
          borderRadius: 0,
          padding: '1rem 1rem 1.5rem',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.94), rgba(250,246,238,0.99))',
          border: '2px solid rgba(138,90,43,0.35)',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
        }
      : isFloating
        ? {
            position: 'fixed',
            left: geom.x,
            top: geom.y,
            width: geom.w,
            height: geom.h,
            zIndex: 99990,
            marginBottom: 0,
            borderRadius: 14,
            padding: '1rem 0.95rem 1.1rem',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(250,246,238,0.99))',
            border: '2px solid rgba(138,90,43,0.45)',
            boxShadow: '0 16px 48px rgba(40,28,14,0.22)',
            resize: 'both',
            overflow: 'auto',
            minWidth: 280,
            minHeight: 260,
            maxWidth: 'min(96vw, 1200px)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }
        : {
            marginBottom: '1.75rem',
            borderRadius: 18,
            padding: '1.15rem 1.1rem 1.25rem',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(250,246,238,0.98))',
            border: '2px solid rgba(138,90,43,0.35)',
            boxShadow: '0 8px 28px rgba(60,40,20,0.12)',
            display: 'flex',
            flexDirection: 'column',
          }

  const fillTextarea = {
    flex: variant === 'standalone' || isFloating ? 1 : undefined,
    minHeight: variant === 'standalone' ? 220 : isFloating ? 140 : 160,
  } as React.CSSProperties

  return (
    <>
      {variant === 'page' && isFloating && (
        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.55rem 0.75rem',
            background: 'rgba(138,90,43,0.12)',
            border: '1px solid rgba(138,90,43,0.28)',
            borderRadius: 10,
            fontSize: '0.82rem',
            color: '#1c1a18',
            lineHeight: 1.45,
          }}
        >
          <strong>Board schwebt:</strong> Ziehen am Griff links oben, Größe an der Ecke (resize). Für einen zweiten Monitor:{' '}
          <button type="button" style={{ ...BTN_SEC, padding: '0.2rem 0.5rem', fontSize: '0.78rem' }} onClick={openSecondWindow}>
            eigenes Fenster
          </button>
          {' · '}
          <button type="button" style={{ ...BTN_PRIM, padding: '0.2rem 0.55rem', fontSize: '0.78rem' }} onClick={einbetten}>
            wieder einbetten
          </button>
        </div>
      )}

      <section ref={panelRef} style={sectionStyle} onDrop={onDrop} onDragOver={onDragOver}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '0.55rem' }}>
          {variant === 'page' && isFloating && (
            <button
              type="button"
              title="Board verschieben"
              aria-label="Board verschieben"
              onPointerDown={onDragHandlePointerDown}
              style={{
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
                border: '1px solid rgba(28,26,24,0.2)',
                borderRadius: 6,
                padding: '0.25rem 0.4rem',
                background: '#fffefb',
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              ⠿
            </button>
          )}
          <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#1c1a18', flex: '1 1 auto' }}>
            ⭕ Mitte des Tischs – gerade daran
          </h2>
          {status && <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>✔ {status}</span>}
        </div>

        <p style={{ margin: '0 0 0.75rem', fontSize: '0.84rem', color: '#5c5650', lineHeight: 1.45 }}>
          {variant === 'standalone' ? (
            <>
              Eigenes Fenster – auf den zweiten Bildschirm ziehen und hier ablegen. Gleiche Daten wie auf dem Schreibtisch (
              <strong>dieses Gerät</strong>, localStorage). Änderungen erscheinen im anderen Fenster mit kurzer Verzögerung.
            </>
          ) : (
            <>
              Hierher ziehst du Gedanken, Dateinamen oder Text. Alles nur auf <strong>diesem Gerät</strong> gespeichert.{' '}
              <strong>Schweben:</strong> frei positionieren und vergrößern; <strong>eigenes Fenster:</strong> für zweiten Monitor.
            </>
          )}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.55rem' }}>
          {variant === 'page' && (
            <button type="button" style={BTN_SEC} onClick={toggleFloating} title={isFloating ? 'Am Schreibtisch fest einbetten' : 'Board schwebend, positionierbar'}>
              {isFloating ? '📌 Einbetten' : '🪟 Schweben'}
            </button>
          )}
          <button type="button" style={BTN_SEC} onClick={openSecondWindow} title="Board in eigenem Browserfenster (z. B. 2. Monitor)">
            🖥️ Eigenes Fenster
          </button>
          <button type="button" style={BTN_PRIM} onClick={ablegen} title="Aktuellen Text in die Ablage legen und Mitte freimachen">
            📥 Ablegen
          </button>
          <button type="button" style={BTN_SEC} onClick={loeschenMitte} title="Mitte leeren (ohne Ablage)">
            🗑️ Mitte leeren
          </button>
          <button type="button" style={BTN_SEC} onClick={() => setVorschau((v) => !v)} title="Ergebnis lesen">
            👁️ {vorschau ? 'Bearbeiten' : 'Vorschau'}
          </button>
          <Link to="/admin?tab=design" style={{ ...BTN_SEC, textDecoration: 'none', display: 'inline-block' }} title="Bilder: Galerie gestalten">
            🖼️ Bild holen
          </Link>
          <button type="button" style={BTN_SEC} onClick={() => fileInputRef.current?.click()} title="Dateiname in die Notiz eintragen">
            📄 Datei
          </button>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => dateienAnhaengen(e.target.files)} />
          <Link to={R.notizen} style={{ ...BTN_SEC, textDecoration: 'none', display: 'inline-block' }} title="Zu Notizen und Briefen">
            📝 Notizen
          </Link>
          <button type="button" style={BTN_SEC} onClick={kopieren} title="Text kopieren">
            📋 Kopieren
          </button>
          <button
            type="button"
            style={{ ...BTN_PRIM, background: '#1c1917', borderColor: '#292524' }}
            onClick={versendenMail}
            title="E-Mail-Programm mit diesem Text öffnen"
          >
            ✉️ Versenden
          </button>
          {variant === 'standalone' && (
            <Link to={R.texteSchreibtisch} style={{ ...BTN_SEC, textDecoration: 'none', display: 'inline-block' }}>
              🪑 Zum Schreibtisch
            </Link>
          )}
        </div>

        {!vorschau ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="Schreib hier, was gerade dein Fokus ist … Oder zieh eine Datei / Text hier rein."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.85rem 1rem',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              color: '#1c1a18',
              background: '#fffefb',
              border: '1px dashed rgba(138,90,43,0.45)',
              borderRadius: 10,
              resize: 'vertical',
              fontFamily: 'inherit',
              ...fillTextarea,
            }}
          />
        ) : (
          <div
            style={{
              ...fillTextarea,
              padding: '0.85rem 1rem',
              fontSize: '0.95rem',
              lineHeight: 1.55,
              color: '#1c1a18',
              background: '#fffefb',
              border: '1px solid rgba(28,26,24,0.1)',
              borderRadius: 10,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
            }}
          >
            {text.trim() || <span style={{ color: '#9ca3af' }}>Noch leer.</span>}
          </div>
        )}

        {archiv.length > 0 && (
          <details style={{ marginTop: '0.9rem', flexShrink: 0 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: '#5c5650' }}>📂 Ablage ({archiv.length})</summary>
            <ul style={{ margin: '0.6rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {archiv.map((a) => (
                <li
                  key={a.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.65rem',
                    background: 'rgba(28,26,24,0.04)',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: '#5c5650', flex: '1 1 200px' }}>
                    {new Date(a.gespeichertAm).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })} – {a.ausschnitt}
                  </span>
                  <button type="button" style={{ ...BTN_SEC, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => archivWiederMitte(a)}>
                    Zur Mitte
                  </button>
                  <button
                    type="button"
                    style={{ ...BTN_SEC, padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#991b1b' }}
                    onClick={() => archivEntfernen(a.id)}
                  >
                    Weg
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}

        {isFloating && (
          <p style={{ margin: '0.55rem 0 0', fontSize: '0.72rem', color: '#78716c' }}>Ecke ziehen = Größe · Griff = Position</p>
        )}
      </section>
    </>
  )
}
