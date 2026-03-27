import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

type TextDoc = {
  id: string
  title: string
  subtitle: string
  defaultContent: string
}

const DOCS: TextDoc[] = [
  {
    id: 'pm-kurz',
    title: 'Präsentationsmappe Kurz',
    subtitle: 'Kommunikation kompakt',
    defaultContent: `Präsentationsmappe Kurz

Diese Seite ist die kurze Kommunikationsfassung.
Sie erklärt in wenigen klaren Punkten, was die Plattform leistet und warum sie für den Alltag geeignet ist.

Kernbotschaft:
- eine Oberfläche
- ein Standard
- ein klarer Ablauf

Einsatz:
- Erstkontakt
- kurze Vorstellung
- schnelle Weitergabe als PDF`,
  },
  {
    id: 'pm-voll',
    title: 'Präsentationsmappe Voll',
    subtitle: 'Kommunikation vollständig',
    defaultContent: `Präsentationsmappe Voll

Diese Seite ist die vollständige Kommunikationsfassung.
Sie fasst Nutzen, Ablauf und Anwendung in einer zusammenhängenden A4-Seite zusammen.

Inhalt:
- Zielgruppe und Nutzen
- Ablauf von Gestaltung bis Veröffentlichung
- Event- und Medienplanung
- Kassa, Verkauf und Betrieb

Zweck:
Die Seite ist als vollständige Grundlage zum Lesen, Besprechen und Drucken gedacht.`,
  },
  {
    id: 'pm-vk2-kurz',
    title: 'Präsentationsmappe VK2 Kurz',
    subtitle: 'Vereins-Kommunikation kompakt',
    defaultContent: `Präsentationsmappe VK2 Kurz

VK2 ist die kompakte Kommunikationsseite für Vereine.

Kern:
- Mitglieder sichtbar machen
- Event- und Medienarbeit vereinheitlichen
- Kassa und Abläufe klar führen

Diese Kurzseite eignet sich für den ersten Kontakt mit Vereinsleitungen und Mitgliedern.`,
  },
  {
    id: 'pm-vk2-voll',
    title: 'Präsentationsmappe VK2 Voll',
    subtitle: 'Vereins-Kommunikation vollständig',
    defaultContent: `Präsentationsmappe VK2 Voll

Diese A4-Seite ist die vollständige Vereinsfassung.
Sie beschreibt den VK2-Ablauf in einem geschlossenen, lesbaren Dokument:

- Mitglieder und Darstellung
- Eventplanung und Werbemittel
- Kassa und Betrieb
- klare Verantwortlichkeiten im Verein

Die Seite ist als druckbare Hauptfassung für Besprechungen gedacht.`,
  },
  {
    id: 'hb-benutzer',
    title: 'Handbuch Benutzer',
    subtitle: 'Einstieg und Alltag',
    defaultContent: `Handbuch Benutzer – A4 Zusammenfassung

Diese Seite fasst den praktischen Alltag zusammen:

1. Einstieg
2. Inhalte pflegen
3. Veröffentlichen
4. Kontrolle am Ergebnis

Leitlinie:
Klare Schritte, einfache Sprache, ein sichtbares Ergebnis pro Aufgabe.`,
  },
  {
    id: 'hb-vk2',
    title: 'Handbuch VK2',
    subtitle: 'Vereinsablauf',
    defaultContent: `Handbuch VK2 – A4 Zusammenfassung

Diese Seite beschreibt den VK2-Alltag in einem Durchgang:

1. Mitgliederdaten pflegen
2. Inhalte zeigen
3. Event erstellen
4. Unterlagen drucken oder digital ausgeben

Ziel:
Vereinsarbeit ohne Medienbruch und ohne doppelte Eingaben.`,
  },
  {
    id: 'hb-team',
    title: 'Handbuch Team',
    subtitle: 'Betrieb und Zusammenarbeit',
    defaultContent: `Handbuch Team – A4 Zusammenfassung

Diese Seite ist die kompakte Teamfassung:

- gemeinsamer Standard
- klare Abläufe
- verlässlicher Stand auf allen Geräten
- saubere Übergabe und Dokumentation

Sie dient als gemeinsame Arbeitsbasis für den täglichen Betrieb.`,
  },
  {
    id: 'hb-k2-galerie',
    title: 'Handbuch K2 Galerie',
    subtitle: 'Galerie-Referenz',
    defaultContent: `Handbuch K2 Galerie – A4 Zusammenfassung

Diese Seite ist die Referenz für die K2-Galerie:

- Struktur der Galerie
- Gestaltung und Veröffentlichung
- Event- und Kommunikationsablauf
- Betrieb im Alltag

Sie ist als geschlossene Lese- und Druckseite gedacht.`,
  },
  {
    id: 'hb-k2-familie',
    title: 'Handbuch K2 Familie',
    subtitle: 'Familien-Referenz',
    defaultContent: `Handbuch K2 Familie – A4 Zusammenfassung

Diese Seite fasst die Familien-Referenz kompakt zusammen:

- Struktur und Rollen
- Personen und Zusammenhänge
- Ereignisse und Dokumentation
- klare, nachvollziehbare Abläufe

Die Seite dient als druckbare Gesamtübersicht.`,
  },
]

function storageKey(id: string): string {
  return `k2-texts-a4-${id}`
}

export default function TextsA4Page() {
  const [searchParams, setSearchParams] = useSearchParams()
  const docId = searchParams.get('doc') || 'pm-kurz'
  const doc = useMemo(() => DOCS.find((d) => d.id === docId) || DOCS[0], [docId])
  const [content, setContent] = useState<string>(() => {
    try {
      const v = localStorage.getItem(storageKey(doc.id))
      return v && v.trim() ? v : doc.defaultContent
    } catch {
      return doc.defaultContent
    }
  })

  const switchDoc = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('doc', id)
      return next
    })
    const nextDoc = DOCS.find((d) => d.id === id) || DOCS[0]
    try {
      const v = localStorage.getItem(storageKey(nextDoc.id))
      setContent(v && v.trim() ? v : nextDoc.defaultContent)
    } catch {
      setContent(nextDoc.defaultContent)
    }
  }

  const save = () => {
    try {
      localStorage.setItem(storageKey(doc.id), content)
    } catch {
      // ignore
    }
  }

  const reset = () => {
    setContent(doc.defaultContent)
    try {
      localStorage.removeItem(storageKey(doc.id))
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3efe7', color: '#1c1a18', padding: '1rem' }}>
      <style>{`
        @media print {
          .a4-no-print { display: none !important; }
          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
          }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      <div className="a4-no-print" style={{ maxWidth: 1200, margin: '0 auto 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/projects/k2-galerie/texte-schreibtisch" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 700 }}>← Zurück zum Texte-Schreibtisch</Link>
        <button type="button" onClick={save} style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: '1px solid #6d28d9', background: '#ede9fe', color: '#4c1d95', fontWeight: 700, cursor: 'pointer' }}>Speichern</button>
        <button type="button" onClick={reset} style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: '1px solid #b91c1c', background: '#fee2e2', color: '#7f1d1d', fontWeight: 700, cursor: 'pointer' }}>Zurücksetzen</button>
        <button type="button" onClick={() => window.print()} style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: '1px solid #1c1a18', background: '#1c1a18', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Drucken (A4)</button>
      </div>

      <div className="a4-no-print" style={{ maxWidth: 1200, margin: '0 auto 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
        {DOCS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchDoc(item.id)}
            style={{
              padding: '0.5rem 0.7rem',
              borderRadius: 8,
              border: doc.id === item.id ? '2px solid #6d28d9' : '1px solid #c4b5fd',
              background: doc.id === item.id ? '#ede9fe' : '#faf5ff',
              color: '#312e81',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
            title={item.subtitle}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(280px, 360px) 1fr' }}>
        <div className="a4-no-print" style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '0.9rem' }}>
          <div style={{ fontWeight: 800, color: '#4c1d95', marginBottom: '0.4rem' }}>{doc.title}</div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>{doc.subtitle}</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', minHeight: 520, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.65rem', fontSize: '0.92rem', lineHeight: 1.5, color: '#0f172a', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <article className="a4-page" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '18mm 16mm', width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.45rem', color: '#1e1b4b' }}>{doc.title}</h1>
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#475569' }}>{doc.subtitle}</p>
          {content.split('\n').map((line, idx) => (
            <p key={idx} style={{ margin: line.trim() ? '0 0 0.45rem' : '0 0 0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.45, fontSize: '0.98rem', color: '#111827' }}>
              {line || ' '}
            </p>
          ))}
        </article>
      </div>
    </div>
  )
}

