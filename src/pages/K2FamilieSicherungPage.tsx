/**
 * K2 Familie – Sicherung (Backup & Wiederherstellung).
 * Eigenbereich getrennt von K2 Galerie, ök2, VK2.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { createK2FamilieBackup, downloadBackupAsFile, restoreK2FamilieFromBackup, mergeK2FamilieFromBackup, detectBackupKontext } from '../utils/autoSave'
import { loadEinstellungen, loadZweige } from '../utils/familieStorage'
import { exportK2FamilieToGedcom } from '../utils/familieGedcom'
import { useFamilieTenant } from '../context/FamilieTenantContext'

const ACCENT = '#14b8a6'
const MUTED = 'rgba(255,255,255,0.65)'
const STARTPUNKT_LABELS: Record<string, string> = { ich: 'Bei mir', eltern: 'Bei meinen Eltern', grosseltern: 'Bei meinen Großeltern' }

export default function K2FamilieSicherungPage() {
  const navigate = useNavigate()
  const { currentTenantId, refreshFromStorage } = useFamilieTenant()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mergeInputRef = useRef<HTMLInputElement>(null)
  const [restoreProgress, setRestoreProgress] = useState<'idle' | 'running' | 'done'>('idle')
  const [mergeDone, setMergeDone] = useState(false)
  const einstellungen = loadEinstellungen(currentTenantId)
  const zweige = loadZweige(currentTenantId)

  const handleDownload = () => {
    try {
      const { data, filename } = createK2FamilieBackup()
      downloadBackupAsFile(data, filename)
      alert('✅ K2-Familie-Sicherung ist heruntergeladen.\n\nSpeichere die Datei an einem sicheren Ort (z. B. PC, USB-Stick, backupmicro). Bei Datenverlust kannst du sie hier mit „Aus Backup-Datei wiederherstellen“ wieder einspielen.')
    } catch (e) {
      alert('Beim Erstellen der Sicherung ist etwas schiefgelaufen. Bitte erneut versuchen.')
    }
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setRestoreProgress('running')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = reader.result as string
        const backup = JSON.parse(raw)
        const kontext = detectBackupKontext(backup)
        if (kontext !== 'k2-familie' && kontext !== 'unbekannt') {
          setRestoreProgress('idle')
          alert('Diese Datei ist keine K2-Familie-Sicherung (sie stammt von K2 Galerie, ök2 oder VK2). Bitte eine K2-Familie-Backup-Datei wählen.')
          return
        }
        const r = restoreK2FamilieFromBackup(backup)
        if (!r.ok) {
          setRestoreProgress('idle')
          alert('Diese Datei ist keine gültige K2-Familie-Sicherung. Bitte eine Datei wählen, die du zuvor hier mit „Sicherungskopie herunterladen“ erstellt hast.')
          return
        }
        setRestoreProgress('done')
        setTimeout(() => navigate(PROJECT_ROUTES['k2-familie'].home, { replace: true }), 800)
      } catch (err) {
        setRestoreProgress('idle')
        alert('❌ Datei konnte nicht gelesen werden: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
    reader.onerror = () => {
      setRestoreProgress('idle')
      alert('❌ Datei konnte nicht gelesen werden.')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleGedcomExport = () => {
    try {
      const ged = exportK2FamilieToGedcom(currentTenantId)
      const blob = new Blob([ged], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `k2-familie-${currentTenantId}-${new Date().toISOString().slice(0, 10)}.ged`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 300)
    } catch (e) {
      alert('Export fehlgeschlagen: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const handleMerge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result as string)
        if (detectBackupKontext(backup) !== 'k2-familie') {
          alert('Diese Datei ist keine K2-Familie-Sicherung. Bitte eine K2-Familie-Backup-Datei wählen.')
          return
        }
        const r = mergeK2FamilieFromBackup(backup)
        if (r.ok) {
          refreshFromStorage()
          setMergeDone(true)
          alert(`Merge abgeschlossen. ${r.merged.length} Bereiche aktualisiert. Du kannst die Startseite neu laden.`)
        } else {
          alert('Merge konnte nicht durchgeführt werden (keine gültigen Daten).')
        }
      } catch (err) {
        alert('❌ Datei konnte nicht gelesen werden: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <Link to={PROJECT_ROUTES['k2-familie'].home} className="meta">← K2 Familie</Link>
            <h1 style={{ marginTop: '0.5rem' }}>Sicherung – K2 Familie</h1>
            <p className="meta" style={{ marginTop: '0.35rem', color: MUTED }}>
              Eigenbereich getrennt von K2 Galerie, ök2 und VK2. Hier sichern und wiederherstellen nur die Familien-Daten (Personen, Momente, Events, alle Familien).
            </p>
          </div>
        </header>

        <section style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(13,148,136,0.12)', borderRadius: 12, border: `1px solid ${ACCENT}40` }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: ACCENT }}>💾 Sicherungskopie herunterladen</h2>
          <button
            type="button"
            onClick={handleDownload}
            style={{ padding: '0.75rem 1.25rem', background: 'rgba(13,148,136,0.25)', border: `1px solid ${ACCENT}66`, borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
          >
            💾 Sicherungskopie herunterladen (K2 Familie)
          </button>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: MUTED }}>Lädt eine Datei mit allen K2-Familie-Daten. Datei sicher speichern – dann hast du eine echte Sicherung gegen Datenverlust.</p>
        </section>

        <section style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(13,148,136,0.12)', borderRadius: 12, border: `1px solid ${ACCENT}40` }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: ACCENT }}>📂 Aus Backup-Datei wiederherstellen</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleRestore}
          />
          {restoreProgress !== 'idle' && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: `1px solid ${ACCENT}50` }}>
              <div style={{ color: ACCENT, fontSize: '0.95rem' }}>{restoreProgress === 'running' ? 'Wiederherstellung läuft…' : 'Fertig. Weiterleitung…'}</div>
            </div>
          )}
          <button
            type="button"
            disabled={restoreProgress !== 'idle'}
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.75rem 1.25rem', background: restoreProgress !== 'idle' ? 'rgba(255,255,255,0.1)' : 'rgba(13,148,136,0.25)', border: `1px solid ${ACCENT}66`, borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: restoreProgress !== 'idle' ? 'not-allowed' : 'pointer' }}
          >
            📂 Aus Backup-Datei wiederherstellen
          </button>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: MUTED }}>Du wählst eine zuvor heruntergeladene K2-Familie-Sicherungsdatei. Alle Familien-Daten in der App werden durch den Inhalt dieser Datei ersetzt.</p>
        </section>

        <section style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(13,148,136,0.12)', borderRadius: 12, border: `1px solid ${ACCENT}40` }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: ACCENT }}>📄 GEDCOM exportieren</h2>
          <button
            type="button"
            onClick={handleGedcomExport}
            style={{ padding: '0.75rem 1.25rem', background: 'rgba(13,148,136,0.25)', border: `1px solid ${ACCENT}66`, borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
          >
            📄 Als GEDCOM herunterladen
          </button>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: MUTED }}>Personen und Beziehungen (Eltern, Kinder, Partner) als .ged-Datei – z. B. für andere Stammbaum-Programme. Siehe docs/K2-FAMILIE-GEDCOM-PLAN.md.</p>
        </section>

        <section style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(13,148,136,0.12)', borderRadius: 12, border: `1px solid ${ACCENT}40` }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: ACCENT }}>🔀 Mit Datei zusammenführen (Merge)</h2>
          <input ref={mergeInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleMerge} />
          <button
            type="button"
            onClick={() => mergeInputRef.current?.click()}
            style={{ padding: '0.75rem 1.25rem', background: 'rgba(13,148,136,0.25)', border: `1px solid ${ACCENT}66`, borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
          >
            🔀 Aus Datei zusammenführen (Merge)
          </button>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: MUTED }}>Personen, Momente, Events, Gaben und Beiträge aus der Datei werden mit deinen bestehenden Daten zusammengeführt (kein Ersetzen). Für Zugang von mehreren: z. B. Export auf Gerät A, Merge auf Gerät B.</p>
          {mergeDone && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: ACCENT }}>Merge durchgeführt. Seite oder Startseite ggf. neu laden.</p>}
        </section>

        <section style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(13,148,136,0.08)', borderRadius: 12, border: `1px solid ${ACCENT}30` }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: ACCENT }}>🌳 Startpunkt &amp; Zweige</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: MUTED }}>
            <strong>Startpunkt:</strong> {einstellungen.startpunktTyp ? STARTPUNKT_LABELS[einstellungen.startpunktTyp] : 'Noch nicht gewählt'}
            {einstellungen.startpunktTyp && ' – '}
            <Link to={PROJECT_ROUTES['k2-familie'].home} style={{ color: ACCENT }}>Auf der Startseite ändern</Link>
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: MUTED }}>
            <strong>Zweige (Option C):</strong> Ein Tenant, Zweig = verwalteter Bereich (Personenliste + Verwalter). Datenmodell aktiv.
            {zweige.length === 0 ? ' Noch keine Zweige angelegt.' : ` ${zweige.length} Zweig(e) angelegt.`}
          </p>
        </section>
      </div>
    </div>
  )
}
