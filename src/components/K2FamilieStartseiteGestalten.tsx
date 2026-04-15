/**
 * K2 Familie – Startseite „Meine Familie“: Hero-Titel, Untertitel, Intro, Willkommensbild.
 * Nur Inhaber:in (canManageFamilienInstanz). Speicher: pageTextsFamilie + pageContentFamilie (localStorage).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { adminTheme } from '../config/theme'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { getFamilyPageContent, setFamilyPageContent } from '../config/pageContentFamilie'
import { getFamilyPageTexts, setFamilyPageTexts } from '../config/pageTextsFamilie'
import { K2_FAMILIE_SESSION_UPDATED } from '../utils/familieStorage'
import { compressImageForStorage } from '../utils/compressImageForStorage'

const a = adminTheme
const R = PROJECT_ROUTES['k2-familie']

const card = {
  marginBottom: '1.15rem',
  padding: '1.1rem 1.2rem',
  borderRadius: a.radius,
  background: a.bgCard,
  boxShadow: a.shadow,
  border: '1px solid rgba(181, 74, 30, 0.12)',
  borderLeft: `4px solid ${a.accent}`,
} as const

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '0.35rem',
  background: '#fffefb',
  border: '1px solid rgba(181, 74, 30, 0.28)',
  borderRadius: a.radius,
  color: a.text,
  padding: '0.5rem 0.65rem',
  fontSize: '0.92rem',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.88rem',
  color: a.muted,
  marginTop: '0.65rem',
}

export default function K2FamilieStartseiteGestalten() {
  const { currentTenantId, bumpFamilieStorageRevision } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz

  const [welcomeTitle, setWelcomeTitle] = useState('')
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('')
  const [introText, setIntroText] = useState('')
  const [welcomeImage, setWelcomeImage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [saveMsg, setSaveMsg] = useState('')
  const [bildLaden, setBildLaden] = useState(false)
  const [speichernLauf, setSpeichernLauf] = useState(false)
  const [dropAktiv, setDropAktiv] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFromStorage = useCallback(() => {
    const t = getFamilyPageTexts(currentTenantId)
    const c = getFamilyPageContent(currentTenantId)
    setWelcomeTitle(t.welcomeTitle)
    setWelcomeSubtitle(t.welcomeSubtitle)
    setIntroText(t.introText)
    setWelcomeImage((c.welcomeImage ?? '').trim())
  }, [currentTenantId])

  useEffect(() => {
    loadFromStorage()
    setSaveStatus('idle')
    setSaveMsg('')
  }, [loadFromStorage])

  const handleBildDatei = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setBildLaden(true)
    setSaveMsg('')
    try {
      const dataUrl = await compressImageForStorage(file, { context: 'pageHero' })
      setWelcomeImage(dataUrl)
    } catch {
      setSaveStatus('err')
      setSaveMsg('Bild konnte nicht verarbeitet werden. Bitte eine andere Datei versuchen.')
    } finally {
      setBildLaden(false)
    }
  }, [])

  const urlFeldWert = welcomeImage.startsWith('data:image') ? '' : welcomeImage

  const handleSpeichern = async () => {
    setSaveStatus('idle')
    setSaveMsg('')
    setSpeichernLauf(true)
    try {
      setFamilyPageTexts(currentTenantId, {
        welcomeTitle: welcomeTitle.trim().slice(0, 120),
        welcomeSubtitle: welcomeSubtitle.trim().slice(0, 120),
        introText: introText.trim().slice(0, 8000),
      })
      let img = welcomeImage.trim()
      // Data-URL niemals mit slice kürzen – das zerstört Base64 und zeigt nur Platzhalter.
      // Sehr große alte Zustände: einmal über pageHero-Komprimierung (maxBytes) in compressImageForStorage.
      if (img.startsWith('data:image') && img.length > 550_000) {
        try {
          img = await compressImageForStorage(img, { context: 'pageHero' })
          setWelcomeImage(img)
        } catch {
          setSaveStatus('err')
          setSaveMsg('Bild konnte nicht verkleinert werden. Bitte eine andere Datei wählen.')
          return
        }
      }
      // Immer String übergeben (auch leer = Bild entfernen). Nicht || undefined – sonst JSON leer und Bild weg.
      setFamilyPageContent(currentTenantId, { welcomeImage: img })
      bumpFamilieStorageRevision()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: currentTenantId } }),
        )
      }
      setSaveStatus('ok')
      setSaveMsg('Gespeichert. Die Startseite zeigt die neuen Texte und das Bild – nach „Meine Familie“ wechseln oder Seite neu laden.')
    } catch {
      setSaveStatus('err')
      setSaveMsg('Speichern ist fehlgeschlagen (z. B. Speicher voll).')
    } finally {
      setSpeichernLauf(false)
    }
  }

  if (!kannInstanz) return null

  return (
    <div id="k2-familie-startseite-gestalten" style={card}>
      <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
        Startseite gestalten
      </h2>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
        Titel, Untertitel und Text unter dem Bild auf <strong style={{ color: a.text }}>Meine Familie</strong> – sowie die Adresse des
        großen Hero-Bildes. Gilt für diese Familie auf diesem Gerät; mit Cloud-Sicherung und anderen Geräten abgleichbar wie die
        übrigen Daten.
      </p>

      <label style={{ ...labelStyle, marginTop: 0 }}>
        Überschrift (groß, z. B. Familienname)
        <input
          type="text"
          value={welcomeTitle}
          onChange={(e) => setWelcomeTitle(e.target.value)}
          maxLength={120}
          autoComplete="off"
          aria-label="Titel Startseite"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Zeile darüber (klein, z. B. Motto)
        <input
          type="text"
          value={welcomeSubtitle}
          onChange={(e) => setWelcomeSubtitle(e.target.value)}
          maxLength={120}
          autoComplete="off"
          aria-label="Untertitel Startseite"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Text unter dem Bild (nur für die Inhaber:in als voller Text sichtbar; Leser/Bearbeiter sehen einen festen Kurztext)
        <textarea
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          maxLength={8000}
          rows={5}
          aria-label="Einleitungstext Startseite"
          style={{ ...inputStyle, minHeight: 120, lineHeight: 1.5, resize: 'vertical' }}
        />
      </label>

      <div style={labelStyle}>
        <span style={{ display: 'block', marginBottom: '0.25rem' }}>
          Bild für den großen Bereich oben (Adresse – z. B. <code style={{ fontSize: '0.82em' }}>/img/…</code> nach Upload oder eine
          stabile Web-Adresse). Leer lassen = Farbverlauf ohne Foto.{' '}
          <strong style={{ color: a.text }}>Oder</strong> Foto per Datei oder Reinziehen (wird für die Speicherung verkleinert).
        </span>
        <input
          type="url"
          inputMode="url"
          placeholder={welcomeImage.startsWith('data:image') ? 'Bild aus Datei aktiv – hier stattdessen eine Web-Adresse eintragen' : 'https://… oder /img/…'}
          value={urlFeldWert}
          onChange={(e) => {
            const v = e.target.value
            // URL-Feld ist bei Data-URL absichtlich leer – leeres onChange nicht als „Bild löschen“ werten
            if (welcomeImage.startsWith('data:image') && v.trim() === '') return
            setWelcomeImage(v)
          }}
          maxLength={2000}
          autoComplete="off"
          aria-label="Adresse Willkommensbild"
          style={{ ...inputStyle, marginBottom: '0.5rem' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          aria-hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) await handleBildDatei(file)
          }}
        />
        <div
          role="group"
          aria-label="Foto ablegen oder Datei wählen"
          onDragEnter={() => setDropAktiv(true)}
          onDragOver={(e) => {
            e.preventDefault()
            setDropAktiv(true)
          }}
          onDragLeave={() => setDropAktiv(false)}
          onDrop={async (e) => {
            e.preventDefault()
            setDropAktiv(false)
            const file = e.dataTransfer.files?.[0]
            if (file) await handleBildDatei(file)
          }}
          style={{
            marginTop: '0.35rem',
            padding: '0.85rem 1rem',
            borderRadius: a.radius,
            border: `2px dashed ${dropAktiv ? '#b54a1e' : 'rgba(181, 74, 30, 0.35)'}`,
            background: dropAktiv ? 'rgba(181, 74, 30, 0.06)' : a.bgDark,
            textAlign: 'center',
            fontSize: '0.88rem',
            color: a.muted,
            lineHeight: 1.45,
          }}
        >
          {bildLaden ? (
            <span style={{ color: a.text }}>Bild wird vorbereitet …</span>
          ) : (
            <>
              <span>Foto hierher ziehen oder </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  borderRadius: a.radius,
                  border: '1px solid rgba(181, 74, 30, 0.45)',
                  background: '#fffefb',
                  color: '#b54a1e',
                  cursor: 'pointer',
                }}
              >
                Datei wählen
              </button>
            </>
          )}
        </div>
        {welcomeImage.startsWith('data:image') ? (
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.82rem', color: a.muted }}>
            Aktuell: Bild von diesem Gerät (nach Speichern in den Familien-Daten). Zum Ersetzen durch eine URL das Feld oben ausfüllen
            oder ein neues Foto wählen.
          </p>
        ) : null}
      </div>

      {welcomeImage.trim() ? (
        <div style={{ marginTop: '0.65rem', maxWidth: '100%' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', color: a.muted }}>Vorschau</p>
          <img
            src={welcomeImage.trim()}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: 220,
              objectFit: 'cover',
              borderRadius: a.radius,
              border: '1px solid rgba(181, 74, 30, 0.2)',
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => void handleSpeichern()}
          disabled={speichernLauf}
          style={{
            padding: '0.5rem 1.1rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: a.radius,
            border: 'none',
            cursor: speichernLauf ? 'wait' : 'pointer',
            opacity: speichernLauf ? 0.85 : 1,
            background: '#b54a1e',
            color: '#fff',
          }}
        >
          {speichernLauf ? 'Speichern …' : 'Speichern'}
        </button>
        <Link
          to={R.meineFamilie}
          style={{
            fontSize: '0.92rem',
            fontWeight: 600,
            color: '#0d9488',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          → Meine Familie ansehen
        </Link>
      </div>

      {saveStatus === 'ok' && saveMsg ? (
        <p
          role="status"
          style={{
            margin: '0.75rem 0 0',
            padding: '0.5rem 0.65rem',
            fontSize: '0.88rem',
            lineHeight: 1.45,
            borderRadius: a.radius,
            background: 'rgba(220, 252, 231, 0.95)',
            color: '#166534',
            border: '1px solid rgba(22, 101, 52, 0.35)',
          }}
        >
          {saveMsg}
        </p>
      ) : null}
      {saveStatus === 'err' && saveMsg ? (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', color: '#b91c1c' }}>{saveMsg}</p>
      ) : null}
    </div>
  )
}
