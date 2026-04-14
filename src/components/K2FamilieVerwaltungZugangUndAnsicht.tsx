/**
 * K2 Familie – Verwaltung: Zugang & Name, QR, Stammbaum-Ansicht (Du, Startpunkt, Partner).
 * Nur auf der Einstellungsseite – getrennt vom täglichen Erlebnis „Meine Familie“.
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { adminTheme } from '../config/theme'
import { APP_BASE_URL } from '../config/externalUrls'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, saveEinstellungen, loadPersonen } from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { K2_FAMILIE_EINSTELLUNGEN_UPDATED } from './FamilieEinladungQuerySync'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import type { K2FamilieStartpunktTyp } from '../types/k2Familie'

const STARTPUNKT_LABELS: Record<K2FamilieStartpunktTyp, string> = {
  ich: 'Bei mir',
  eltern: 'Bei meinen Eltern',
  grosseltern: 'Bei meinen Großeltern',
}

function suggestFamilieZugangsnummer(): string {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `KF-${y}-${n}`
}

export default function K2FamilieVerwaltungZugangUndAnsicht() {
  const a = adminTheme
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const rolle = capabilities.rolle
  const isInhaber = rolle === 'inhaber'
  const isLeser = rolle === 'leser'
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz

  const [startpunkt, setStartpunkt] = useState<K2FamilieStartpunktTyp | undefined>(undefined)
  const [partnerHerkunftId, setPartnerHerkunftId] = useState<string>('')
  const [ichBinPersonId, setIchBinPersonIdState] = useState<string>('')
  const [mitgliedsNummer, setMitgliedsNummer] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [einladungsLinkKopiert, setEinladungsLinkKopiert] = useState(false)
  const [persoenlicherLinkKopiert, setPersoenlicherLinkKopiert] = useState(false)
  const [persoenlicherQrDataUrl, setPersoenlicherQrDataUrl] = useState('')
  const [zugangSpeichernHinweis, setZugangSpeichernHinweis] = useState('')
  const [zugangFestgelegt, setZugangFestgelegt] = useState(false)
  const [zugangAendernModus, setZugangAendernModus] = useState(false)
  const [familyDisplayNameInput, setFamilyDisplayNameInput] = useState('')
  const zugangVorAenderungRef = useRef('')
  const [ansichtEinstellungenOpen, setAnsichtEinstellungenOpen] = useState(false)
  const { versionTimestamp } = useQrVersionTimestamp()
  const ansichtEinstellungenRef = useRef<HTMLDetailsElement>(null)
  const zugangHinweisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const zeigeZugangSpeichernHinweis = (text: string, ms = 5200) => {
    if (zugangHinweisTimerRef.current) {
      clearTimeout(zugangHinweisTimerRef.current)
      zugangHinweisTimerRef.current = null
    }
    setZugangSpeichernHinweis(text)
    zugangHinweisTimerRef.current = setTimeout(() => {
      setZugangSpeichernHinweis('')
      zugangHinweisTimerRef.current = null
    }, ms)
  }

  useEffect(() => {
    return () => {
      if (zugangHinweisTimerRef.current) clearTimeout(zugangHinweisTimerRef.current)
    }
  }, [])

  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision])
  const familieR = PROJECT_ROUTES['k2-familie']

  const reloadEinstellungenAusSpeicher = useCallback(() => {
    const einst = loadEinstellungen(currentTenantId)
    setStartpunkt(einst.startpunktTyp)
    setPartnerHerkunftId(einst.partnerHerkunftPersonId ?? '')
    setIchBinPersonIdState(einst.ichBinPersonId ?? '')
    const z = einst.mitgliedsNummerAdmin ?? ''
    setMitgliedsNummer(z)
    setZugangFestgelegt(Boolean(z.trim()))
    setZugangAendernModus(false)
    setFamilyDisplayNameInput(einst.familyDisplayName ?? '')
  }, [currentTenantId])

  useEffect(() => {
    reloadEinstellungenAusSpeicher()
  }, [reloadEinstellungenAusSpeicher])

  useEffect(() => {
    const onExtern = (ev: Event) => {
      const d = (ev as CustomEvent<{ tenantId?: string }>).detail
      if (d?.tenantId && d.tenantId !== currentTenantId) return
      reloadEinstellungenAusSpeicher()
    }
    window.addEventListener(K2_FAMILIE_EINSTELLUNGEN_UPDATED, onExtern)
    return () => window.removeEventListener(K2_FAMILIE_EINSTELLUNGEN_UPDATED, onExtern)
  }, [currentTenantId, reloadEinstellungenAusSpeicher])

  const ichName = useMemo(() => {
    const id = ichBinPersonId?.trim()
    if (!id) return ''
    return personen.find((p) => p.id === id)?.name?.trim() ?? ''
  }, [personen, ichBinPersonId])

  const meinePerson = useMemo(() => {
    const id = ichBinPersonId?.trim()
    if (!id) return undefined
    return personen.find((p) => p.id === id)
  }, [personen, ichBinPersonId])

  const persoenlicheMitgliedsNummerAufKarte = (meinePerson?.mitgliedsNummer ?? '').trim()

  /** Sprung per Hash: Zugang-Bereich oder Stammbaum-Details öffnen */
  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, '')
      if (raw === 'k2-familie-ansicht-einstellungen') {
        setAnsichtEinstellungenOpen(true)
        requestAnimationFrame(() => {
          ansichtEinstellungenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
      }
      if (raw === 'k2-familie-zugang-name') {
        document.getElementById('k2-familie-zugang-name')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  const familienAnzeigenameFuerEinladung = useMemo(() => {
    const ausInput = familyDisplayNameInput.trim()
    if (ausInput) return ausInput
    return loadEinstellungen(currentTenantId).familyDisplayName?.trim() ?? ''
  }, [currentTenantId, familyDisplayNameInput])

  const familieEinladungsUrlCanonical = useMemo(() => {
    const z = mitgliedsNummer.trim()
    if (!z) return ''
    const base = new URL(`${APP_BASE_URL}${familieR.meineFamilie}`)
    base.searchParams.set('t', currentTenantId)
    base.searchParams.set('z', z)
    const fn = familienAnzeigenameFuerEinladung
    if (fn) base.searchParams.set('fn', fn)
    return base.toString()
  }, [mitgliedsNummer, currentTenantId, familienAnzeigenameFuerEinladung, familieR.meineFamilie])

  const familieEinladungsUrl = useMemo(() => {
    if (!familieEinladungsUrlCanonical) return ''
    return buildQrUrlWithBust(familieEinladungsUrlCanonical, versionTimestamp)
  }, [familieEinladungsUrlCanonical, versionTimestamp])

  const familiePersoenlicheEinladungsUrlCanonical = useMemo(() => {
    const z = mitgliedsNummer.trim()
    const m = persoenlicheMitgliedsNummerAufKarte
    if (!z || !m) return ''
    const base = new URL(`${APP_BASE_URL}${familieR.meineFamilie}`)
    base.searchParams.set('t', currentTenantId)
    base.searchParams.set('z', z)
    base.searchParams.set('m', m)
    const fn = familienAnzeigenameFuerEinladung
    if (fn) base.searchParams.set('fn', fn)
    return base.toString()
  }, [mitgliedsNummer, persoenlicheMitgliedsNummerAufKarte, currentTenantId, familienAnzeigenameFuerEinladung, familieR.meineFamilie])

  const familiePersoenlicheEinladungsUrl = useMemo(() => {
    if (!familiePersoenlicheEinladungsUrlCanonical) return ''
    return buildQrUrlWithBust(familiePersoenlicheEinladungsUrlCanonical, versionTimestamp)
  }, [familiePersoenlicheEinladungsUrlCanonical, versionTimestamp])

  useEffect(() => {
    if (!familieEinladungsUrl) {
      setQrDataUrl('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(familieEinladungsUrl, { width: 168, margin: 1, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [familieEinladungsUrl])

  useEffect(() => {
    if (!familiePersoenlicheEinladungsUrl) {
      setPersoenlicherQrDataUrl('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(familiePersoenlicheEinladungsUrl, { width: 168, margin: 1, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (!cancelled) setPersoenlicherQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setPersoenlicherQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [familiePersoenlicheEinladungsUrl])

  const setStartpunktTyp = (typ: K2FamilieStartpunktTyp) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, startpunktTyp: typ })) {
      setStartpunkt(typ)
    }
  }

  const setPartnerHerkunft = (personId: string) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, partnerHerkunftPersonId: nextId })) {
      setPartnerHerkunftId(personId)
    }
  }

  const setIchBinPerson = (personId: string) => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    const nextId = personId.trim() || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: nextId })) {
      setIchBinPersonIdState(personId)
      if (nextId) setIdentitaetBestaetigt(currentTenantId, nextId)
    }
  }

  const clearStartpunktZumNeuWaehlen = () => {
    if (!kannStruktur) return
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, startpunktTyp: undefined })) {
      setStartpunkt(undefined)
    }
  }

  const persistMitgliedsNummer = (raw: string) => {
    if (!kannInstanz) return
    const einst = loadEinstellungen(currentTenantId)
    const trimmed = raw.trim()
    const next = trimmed || undefined
    if (saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: next })) {
      setMitgliedsNummer(trimmed)
      setZugangFestgelegt(Boolean(trimmed))
      setZugangAendernModus(false)
      if (trimmed) {
        zeigeZugangSpeichernHinweis(
          '✓ Zugangsnummer ist gespeichert. QR-Code und Einladungslink gelten für diese Nummer — Gäste landen in derselben Familie mit diesem Code.',
        )
      } else {
        zeigeZugangSpeichernHinweis('✓ Gespeichert. Ohne Nummer erscheint kein QR-Code.')
      }
    } else {
      zeigeZugangSpeichernHinweis('⚠️ Speichern ist fehlgeschlagen. Bitte später erneut versuchen.', 7000)
    }
  }

  const handleMitgliedsNummerBlur = () => {
    if (!kannInstanz) return
    if (zugangAendernModus) {
      const t = mitgliedsNummer.trim()
      if (!t) {
        setMitgliedsNummer(zugangVorAenderungRef.current)
        setZugangAendernModus(false)
        zeigeZugangSpeichernHinweis('Änderung verworfen — Zugangsnummer bleibt wie zuvor.', 4000)
        return
      }
    }
    persistMitgliedsNummer(mitgliedsNummer)
  }

  const starteZugangAendern = () => {
    if (
      !window.confirm(
        'Zugangsnummer wirklich ändern? Bereits geteilte QR-Codes und Links mit der bisherigen Nummer sind danach ungültig.',
      )
    ) {
      return
    }
    zugangVorAenderungRef.current = mitgliedsNummer
    setZugangAendernModus(true)
  }

  const abbrecheZugangAendern = () => {
    setMitgliedsNummer(zugangVorAenderungRef.current)
    setZugangAendernModus(false)
  }

  const vorschlagZugangsnummerUebernehmen = () => {
    if (!kannInstanz || zugangFestgelegt) return
    const s = suggestFamilieZugangsnummer()
    setMitgliedsNummer(s)
    persistMitgliedsNummer(s)
  }

  const persistFamilyDisplayName = () => {
    if (!kannInstanz) return
    const name = familyDisplayNameInput.trim()
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, familyDisplayName: name || undefined })) {
      zeigeZugangSpeichernHinweis(
        name
          ? '✓ Familienname ist gespeichert — erscheint in der Auswahl oben und überall im Text.'
          : '✓ Anzeigename entfernt — es gilt wieder der Standard.',
      )
    } else {
      zeigeZugangSpeichernHinweis('⚠️ Speichern ist fehlgeschlagen. Bitte später erneut versuchen.', 7000)
    }
  }

  const kopiereFamilieEinladungslink = () => {
    if (!familieEinladungsUrl) return
    void navigator.clipboard.writeText(familieEinladungsUrl).then(() => {
      setEinladungsLinkKopiert(true)
      window.setTimeout(() => setEinladungsLinkKopiert(false), 2200)
    })
  }

  const kopierePersoenlichenEinladungslink = () => {
    if (!familiePersoenlicheEinladungsUrl) return
    void navigator.clipboard.writeText(familiePersoenlicheEinladungsUrl).then(() => {
      setPersoenlicherLinkKopiert(true)
      window.setTimeout(() => setPersoenlicherLinkKopiert(false), 2200)
    })
  }

  const openAnsichtEinstellungenUnten = () => {
    setAnsichtEinstellungenOpen(true)
    requestAnimationFrame(() => {
      ansichtEinstellungenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const stammdatenLinkTo =
    ichBinPersonId?.trim() ? `${familieR.personen}/${ichBinPersonId.trim()}` : null

  const meineFamiliePersoenlicherCodeLink = `${familieR.meineFamilie}#k2-familie-persoenlicher-code`

  return (
    <>
      <div
        id="k2-familie-zugang-name"
        style={{
          marginBottom: '1.25rem',
          padding: '1.15rem 1.2rem',
          borderRadius: a.radius,
          background: a.bgCard,
          boxShadow: a.shadow,
          border: '1px solid rgba(181, 74, 30, 0.12)',
          borderLeft: `4px solid ${a.accent}`,
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
          Zugang & Name
        </h2>
        <p style={{ margin: '0 0 0.55rem', lineHeight: 1.55, color: a.muted, fontSize: '0.9rem' }}>
          {kannInstanz ? (
            <>
              <strong style={{ color: a.text }}>Als Inhaber:in (Administrator):</strong> Du legst unten die{' '}
              <strong style={{ color: a.text }}>Familien-Zugangsnummer</strong> fest — eine Nummer für den ganzen Stammbaum; QR und Link führen alle in dieselbe Familie. Die{' '}
              <strong style={{ color: a.text }}>persönlichen Codes</strong> sind <strong style={{ color: a.text }}>Schlüssel</strong> zum persönlichen Bereich und die{' '}
              <strong style={{ color: a.text }}>erste Identifikation</strong> beim Eintritt; du vergibst sie unter <strong style={{ color: a.text }}>Mitglieder &amp; Codes</strong> oder auf der Personenkarte — jedes Mitglied kann den Code auch{' '}
              <strong style={{ color: a.text }}>selbst auf der eigenen Karte</strong> eintragen. <strong style={{ color: a.text }}>Danach</strong> reicht der gespeicherte persönliche QR oder Link auf dem Gerät — kein erneutes Eintragen bei jedem Besuch. Dann erscheinen{' '}
              <strong style={{ color: a.text }}>Name</strong> und <strong style={{ color: a.text }}>persönlicher QR</strong>. Wer „Du“ bist, stellst du zusätzlich unter{' '}
              <button
                type="button"
                onClick={openAnsichtEinstellungenUnten}
                style={{ background: 'none', border: 'none', color: a.accent, cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
              >
                Stammbaum-Ansicht einstellen
              </button>{' '}
              ein (unten auf dieser Seite).
            </>
          ) : isLeser ? (
            <>
              <strong style={{ color: a.text }}>Kurz:</strong> Familien-Zugang und QR kommen von der Inhaber:in. Deinen <strong style={{ color: a.text }}>persönlichen Code</strong> trägst du auf{' '}
              <Link to={meineFamiliePersoenlicherCodeLink} style={{ color: a.accent, fontWeight: 600 }}>
                Meine Familie
              </Link>{' '}
              ein – danach Name und persönlicher QR. Die Familien-Nummer kannst du nicht ändern.
            </>
          ) : (
            <>
              Die <strong style={{ color: a.text }}>Familien-Zugangsnummer</strong> kommt von der Inhaber:in; der <strong style={{ color: a.text }}>QR Familie</strong> öffnet dieselbe Familie. <strong style={{ color: a.text }}>Persönlichen Code</strong> auf{' '}
              <Link to={meineFamiliePersoenlicherCodeLink} style={{ color: a.accent, fontWeight: 600 }}>
                Meine Familie
              </Link>{' '}
              eintragen – danach reicht der gespeicherte QR oder Link. Die Nummer der Familie kannst du nur als Inhaber:in ändern.
            </>
          )}
        </p>
        {kannInstanz ? (
          <div
            style={{
              marginBottom: '0.85rem',
              padding: '0.65rem 0.75rem',
              borderRadius: a.radius,
              background: 'rgba(181, 74, 30, 0.06)',
              border: '1px solid rgba(181, 74, 30, 0.18)',
            }}
          >
            <label htmlFor="k2fam-family-display-name" style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>
              Wie heißt eure Familie in der App? (z. B. Familie Kreinecker)
            </label>
            <input
              id="k2fam-family-display-name"
              type="text"
              autoComplete="organization"
              value={familyDisplayNameInput}
              onChange={(e) => setFamilyDisplayNameInput(e.target.value)}
              onBlur={persistFamilyDisplayName}
              placeholder="Familie Kreinecker"
              style={{
                width: '100%',
                maxWidth: 420,
                padding: '0.45rem 0.6rem',
                borderRadius: a.radius,
                border: '1px solid rgba(181, 74, 30, 0.28)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                color: a.text,
                background: '#fffefb',
              }}
            />
            <p style={{ margin: '0.45rem 0 0', fontSize: '0.78rem', lineHeight: 1.45, color: a.muted }}>
              Sichtbar in der Familien-Auswahl oben. Der QR-Code und der Link bleiben mit Zugangsnummer und Codes technisch eindeutig — der Familienname steht nicht in der URL.
            </p>
          </div>
        ) : (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: a.text }}>
            <span style={{ color: a.muted }}>Diese Familie:</span> <strong>{getFamilieTenantDisplayName(currentTenantId, 'Familie')}</strong>
          </p>
        )}
        <h3 style={{ margin: '0.75rem 0 0.4rem', fontSize: '0.98rem', fontWeight: 700, color: a.accent, fontFamily: a.fontHeading }}>Familien-Zugang</h3>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.45, color: a.text, fontSize: '0.9rem' }}>
          <span style={{ color: a.muted }}>Gilt für diese Familie:</span> <strong style={{ color: a.text }}>{getFamilieTenantDisplayName(currentTenantId, 'Familie')}</strong>
        </p>
        {isInhaber ? (
          <>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', lineHeight: 1.45, color: a.muted }}>
              Im Link/QR steht die technische Kennung{' '}
              <code
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.85em',
                  color: a.text,
                  background: a.bgElevated,
                  padding: '0.1rem 0.35rem',
                  borderRadius: 4,
                  border: '1px solid rgba(181, 74, 30, 0.2)',
                }}
              >
                t={currentTenantId}
              </code>{' '}
              — die muss zu genau dieser Familie gehören. Steht unten ein Name, ist er zusätzlich als{' '}
              <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85em' }}>fn=…</code> im Link — damit Gäste denselben Namen sehen (ohne euren Speicher).
            </p>
            <p style={{ margin: '0 0 0.85rem', lineHeight: 1.45, color: a.muted, fontSize: '0.82rem' }}>
              <strong style={{ color: a.text }}>Deine Aufgabe als Inhaber:in:</strong> Diese eine Nummer für den ganzen Stammbaum festlegen und weitergeben — QR oder Link (nur Online-App, nicht localhost).
            </p>
          </>
        ) : (
          <details style={{ margin: '0 0 0.85rem' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: a.accent,
                fontFamily: a.fontHeading,
              }}
            >
              {isLeser ? 'Nur bei Fragen: Link, QR und Kennung' : 'Technik zu Link und QR (optional)'}
            </summary>
            <p style={{ margin: '0.55rem 0 0.45rem', fontSize: '0.76rem', lineHeight: 1.45, color: a.muted }}>
              Im Link/QR steht{' '}
              <code
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.85em',
                  color: a.text,
                  background: a.bgElevated,
                  padding: '0.1rem 0.35rem',
                  borderRadius: 4,
                  border: '1px solid rgba(181, 74, 30, 0.2)',
                }}
              >
                t={currentTenantId}
              </code>{' '}
              — Zugehörigkeit zur Familie. Optional <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85em' }}>fn=…</code> für den Anzeigenamen bei Gästen.
            </p>
            <p style={{ margin: 0, lineHeight: 1.45, color: a.muted, fontSize: '0.8rem' }}>
              Eine Nummer für den ganzen Stammbaum — teilen per QR oder Link (nur Online-App, nicht localhost).
            </p>
          </details>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>Name</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: a.text }}>{ichName || '— sobald „Du“ gesetzt ist'}</div>
          </div>
          <div style={{ flex: '1 1 240px', minWidth: 180 }}>
            <label htmlFor={kannInstanz && zugangFestgelegt && !zugangAendernModus ? undefined : 'k2fam-mitgliedsnummer'} style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>
              {kannInstanz ? 'Familien-Zugangsnummer (von dir als Inhaber:in festgelegt)' : 'Familien-Zugangsnummer (vom Administrator)'}
            </label>
            {kannInstanz && zugangFestgelegt && !zugangAendernModus ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <div
                  id="k2fam-mitgliedsnummer-lesen"
                  style={{
                    flex: '1 1 200px',
                    minWidth: 160,
                    maxWidth: 360,
                    background: '#fffefb',
                    border: '1px solid rgba(181, 74, 30, 0.28)',
                    borderRadius: a.radius,
                    color: a.text,
                    padding: '0.45rem 0.6rem',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}
                >
                  {mitgliedsNummer.trim() || '—'}
                </div>
                <button
                  type="button"
                  onClick={starteZugangAendern}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    borderRadius: a.radius,
                    border: `1px solid rgba(181, 74, 30, 0.45)`,
                    background: a.buttonPrimary.background,
                    color: '#fff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Nummer ändern…
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  id="k2fam-mitgliedsnummer"
                  type="text"
                  autoComplete="off"
                  readOnly={!kannInstanz}
                  value={mitgliedsNummer}
                  onChange={(e) => setMitgliedsNummer(e.target.value)}
                  onBlur={handleMitgliedsNummerBlur}
                  placeholder="z. B. KF-2026-0042"
                  title={!kannInstanz ? 'Nur Inhaber:in kann die Zugangsnummer ändern.' : undefined}
                  style={{
                    flex: '1 1 200px',
                    minWidth: 160,
                    maxWidth: 320,
                    background: '#fffefb',
                    border: '1px solid rgba(181, 74, 30, 0.28)',
                    borderRadius: a.radius,
                    color: a.text,
                    padding: '0.45rem 0.6rem',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    opacity: kannInstanz ? 1 : 0.85,
                  }}
                />
                {kannInstanz && !zugangFestgelegt && (
                  <button
                    type="button"
                    onClick={vorschlagZugangsnummerUebernehmen}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: a.radius,
                      border: `1px solid rgba(181, 74, 30, 0.35)`,
                      background: a.bgElevated,
                      color: a.accent,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Nummer vorschlagen
                  </button>
                )}
                {kannInstanz && zugangAendernModus && (
                  <button
                    type="button"
                    onClick={abbrecheZugangAendern}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: a.radius,
                      border: `1px solid rgba(181, 74, 30, 0.35)`,
                      background: a.bgCard,
                      color: a.muted,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            )}
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: a.muted, lineHeight: 1.45 }}>
              {!kannInstanz ? (
                <>QR und Einladungslink funktionieren mit der von der Inhaber:in festgelegten Nummer.</>
              ) : zugangFestgelegt && !zugangAendernModus ? (
                <>
                  <strong style={{ color: a.text }}>Die feste Nummer für diesen Stammbaum</strong> — du hast sie festgelegt. Mitglieder und Gäste nutzen QR oder Link mit genau dieser Nummer.
                </>
              ) : zugangFestgelegt && zugangAendernModus ? (
                <>
                  Neue Nummer eintragen und Feld verlassen zum Speichern — oder <strong style={{ color: a.text }}>Abbrechen</strong>. Alte QR/Links werden mit der neuen Nummer ungültig.
                </>
              ) : (
                <>
                  <strong style={{ color: a.text }}>Als Inhaber:in:</strong> Beim ersten Speichern wird die Nummer fest — danach nur noch über „Nummer ändern…“. Vorher: QR rechts als Vorschau; <strong style={{ color: a.text }}>fest</strong> wird sie beim Verlassen des Feldes. QR und Link zeigen auf die <strong style={{ color: a.text }}>Online-App</strong>, nicht auf localhost.
                </>
              )}
            </p>
            {kannInstanz && zugangSpeichernHinweis ? (
              <p
                role="status"
                aria-live="polite"
                style={{
                  margin: '0.55rem 0 0',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  borderRadius: a.radius,
                  border: zugangSpeichernHinweis.startsWith('⚠️')
                    ? '1px solid rgba(180, 83, 9, 0.45)'
                    : '1px solid rgba(22, 101, 52, 0.35)',
                  background: zugangSpeichernHinweis.startsWith('⚠️')
                    ? 'rgba(254, 243, 199, 0.85)'
                    : 'rgba(220, 252, 231, 0.95)',
                  color: zugangSpeichernHinweis.startsWith('⚠️') ? '#92400e' : '#166534',
                }}
              >
                {zugangSpeichernHinweis}
              </p>
            ) : null}
          </div>
          <div style={{ textAlign: 'left', maxWidth: 200 }}>
            <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>QR Familie (Einstieg)</div>
            {qrDataUrl ? (
              <div>
                <img
                  src={qrDataUrl}
                  alt={`Einladung ${getFamilieTenantDisplayName(currentTenantId, 'Familie')}: App öffnen mit Zugangsnummer`}
                  width={168}
                  height={168}
                  style={{ display: 'block', borderRadius: 12, border: '1px solid rgba(181, 74, 30, 0.25)' }}
                />
                <button
                  type="button"
                  onClick={kopiereFamilieEinladungslink}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.4rem 0.55rem',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    borderRadius: a.radius,
                    border: `1px solid rgba(181, 74, 30, 0.32)`,
                    background: a.bgCard,
                    color: a.accent,
                    cursor: 'pointer',
                  }}
                >
                  {einladungsLinkKopiert ? '✓ Link kopiert' : 'Einladungslink kopieren'}
                </button>
              </div>
            ) : (
              <div
                role="status"
                style={{
                  maxWidth: 200,
                  minHeight: 96,
                  borderRadius: 12,
                  border: '1px dashed rgba(181, 74, 30, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  color: a.muted,
                  fontSize: '0.82rem',
                  padding: '0.65rem 0.75rem',
                  lineHeight: 1.4,
                  background: a.bgElevated,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>
                  📋
                </span>
                <span>
                  <strong style={{ color: a.text }}>Zugangsnummer</strong> eintragen oder „Nummer vorschlagen“ – dann erscheint der QR-Code (und optional der kopierbare Link) für Handy &amp; Gäste.
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: '1.15rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(181, 74, 30, 0.12)',
          }}
        >
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.98rem', fontWeight: 700, color: a.accent, fontFamily: a.fontHeading }}>Persönliche Mitgliedschaft</h3>
          {ichBinPersonId?.trim() && ichName ? (
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.95rem', fontWeight: 600, color: a.text, lineHeight: 1.45, fontFamily: a.fontBody }}>
              Willkommen, {ichName}. Das ist dein persönlicher Bereich — der Code auf <Link to={meineFamiliePersoenlicherCodeLink}>Meine Familie</Link> hat dich dieser Familie zugeordnet; QR und Link gelten für dich.
            </p>
          ) : null}
          {kannInstanz ? (
            <p style={{ margin: '0 0 0.75rem', lineHeight: 1.5, color: a.muted, fontSize: '0.88rem' }}>
              Codes vergeben: Personenkarte oder{' '}
              <Link to={PROJECT_ROUTES['k2-familie'].mitgliederCodes} style={{ color: a.accent, fontWeight: 600 }}>
                Mitglieder &amp; Codes
              </Link>
              . Mitglied tippt den Code auf <Link to={meineFamiliePersoenlicherCodeLink}>Meine Familie</Link> ein — danach erscheint der persönliche QR.
            </p>
          ) : (
            <p style={{ margin: '0 0 0.75rem', lineHeight: 1.5, color: a.muted, fontSize: '0.88rem' }}>
              Code von der Inhaber:in auf <Link to={meineFamiliePersoenlicherCodeLink}>Meine Familie</Link> eintragen. Danach persönlicher QR — oder QR scannen.
            </p>
          )}
          {ichBinPersonId?.trim() ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>Angemeldet als</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: a.text }}>{ichName || '—'}</div>
                {stammdatenLinkTo ? (
                  <Link to={stammdatenLinkTo} style={{ display: 'inline-block', marginTop: '0.45rem', fontSize: '0.88rem', color: a.accent, fontWeight: 600 }}>
                    Zur persönlichen Karte →
                  </Link>
                ) : null}
                {!persoenlicheMitgliedsNummerAufKarte ? (
                  <p style={{ margin: '0.55rem 0 0', fontSize: '0.8rem', color: a.muted, lineHeight: 1.45 }}>
                    {kannInstanz ? (
                      <>
                        Auf <strong style={{ color: a.text }}>deiner</strong> Karte fehlt noch der Code — unter Stammbaum → Person oder{' '}
                        <Link to={PROJECT_ROUTES['k2-familie'].mitgliederCodes} style={{ color: a.accent, fontWeight: 600 }}>
                          Mitglieder &amp; Codes
                        </Link>
                        .
                      </>
                    ) : (
                      <>
                        Noch kein Code auf der Karte — trage ihn auf <strong style={{ color: a.text }}>deiner</strong> Personenkarte ein (wie von der Verwaltung mitgeteilt); dann erscheint dein persönlicher QR. Danach reicht der gespeicherte Link oder QR auf dem Gerät.
                      </>
                    )}
                  </p>
                ) : null}
              </div>
              {persoenlicherQrDataUrl && familiePersoenlicheEinladungsUrlCanonical ? (
                <div style={{ textAlign: 'left', maxWidth: 200 }}>
                  <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>Dein persönlicher QR{ichName ? ` (${ichName})` : ''}</div>
                  <img
                    src={persoenlicherQrDataUrl}
                    alt={`Persönlicher Zugang ${getFamilieTenantDisplayName(currentTenantId, 'Familie')}${ichName ? `, ${ichName}` : ''}`}
                    width={168}
                    height={168}
                    style={{ display: 'block', borderRadius: 12, border: '1px solid rgba(181, 74, 30, 0.25)' }}
                  />
                  <button
                    type="button"
                    onClick={kopierePersoenlichenEinladungslink}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      padding: '0.4rem 0.55rem',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      borderRadius: a.radius,
                      border: `1px solid rgba(181, 74, 30, 0.32)`,
                      background: a.bgCard,
                      color: a.accent,
                      cursor: 'pointer',
                    }}
                  >
                    {persoenlicherLinkKopiert ? '✓ Link kopiert' : 'Persönlichen Link kopieren'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {kannStruktur ? (
        <details
          ref={ansichtEinstellungenRef}
          id="k2-familie-ansicht-einstellungen"
          open={ansichtEinstellungenOpen}
          onToggle={(e) => setAnsichtEinstellungenOpen((e.target as HTMLDetailsElement).open)}
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.15rem',
            borderRadius: a.radius,
            background: a.bgCard,
            boxShadow: a.shadow,
            border: '1px solid rgba(181, 74, 30, 0.12)',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.98rem',
              color: a.accent,
              fontFamily: a.fontHeading,
            }}
          >
            Stammbaum-Ansicht einstellen (Startpunkt, Partner-Zweig, wer „Du“ bist)
          </summary>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ margin: 0, padding: '0.85rem 1rem', borderRadius: a.radius, background: a.bgElevated, borderLeft: `4px solid ${a.accent}` }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: a.text }}>Wo beginnt deine Familie?</h3>
              {startpunkt ? (
                <p style={{ margin: 0, color: a.muted, fontSize: '0.9rem' }}>
                  <strong style={{ color: a.text }}>{STARTPUNKT_LABELS[startpunkt]}</strong>
                  <button
                    type="button"
                    disabled={!kannStruktur}
                    onClick={clearStartpunktZumNeuWaehlen}
                    style={{
                      marginLeft: '0.75rem',
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: a.radius,
                      border: '1px solid rgba(181, 74, 30, 0.35)',
                      background: a.bgCard,
                      color: a.accent,
                      opacity: kannStruktur ? 1 : 0.55,
                      cursor: kannStruktur ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Ändern
                  </button>
                </p>
              ) : (
                <>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: a.muted }}>Anker für Stammbaum und Übersicht.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(['ich', 'eltern', 'grosseltern'] as const).map((typ) => (
                      <button
                        key={typ}
                        type="button"
                        disabled={!kannStruktur}
                        onClick={() => setStartpunktTyp(typ)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.88rem',
                          borderRadius: a.radius,
                          background: a.accentSoft,
                          border: `1px solid rgba(181, 74, 30, 0.28)`,
                          color: a.accent,
                          opacity: kannStruktur ? 1 : 0.55,
                          cursor: kannStruktur ? 'pointer' : 'not-allowed',
                          fontFamily: 'inherit',
                        }}
                      >
                        {STARTPUNKT_LABELS[typ]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ margin: 0, padding: '0.85rem 1rem', borderRadius: a.radius, background: a.bgElevated, borderLeft: '4px solid #c2410c' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: a.text }}>Familie des Partners gleichrangig?</h3>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: a.muted }}>Optional: zweiter Herkunfts-Zweig – „Meine Herkunft“ und „Herkunft [Partner]“ gleichwertig.</p>
              <select
                value={partnerHerkunftId ?? ''}
                disabled={!kannStruktur}
                onChange={(e) => setPartnerHerkunft(e.target.value)}
                style={{
                  background: '#fffefb',
                  border: '1px solid rgba(181, 74, 30, 0.28)',
                  borderRadius: a.radius,
                  color: a.text,
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  minWidth: 200,
                  opacity: kannStruktur ? 1 : 0.75,
                }}
              >
                <option value="">Keiner (nur ein Zweig)</option>
                {personen.map((p) => (
                  <option key={p.id} value={p.id}>
                    Herkunft {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ margin: 0, padding: '0.85rem 1rem', borderRadius: a.radius, background: a.bgElevated, borderLeft: '4px solid #15803d' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: a.text }}>Dein Platz im Stammbaum („Du“)</h3>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: a.muted }}>Diese Person wird im Stammbaum hervorgehoben; von hier aus gelangst du zu „Meine Stammdaten“.</p>
              <select
                value={ichBinPersonId ?? ''}
                disabled={!kannStruktur}
                onChange={(e) => setIchBinPerson(e.target.value)}
                style={{
                  background: '#fffefb',
                  border: '1px solid rgba(181, 74, 30, 0.28)',
                  borderRadius: a.radius,
                  color: a.text,
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  minWidth: 200,
                  opacity: kannStruktur ? 1 : 0.75,
                }}
              >
                <option value="">Nicht festgelegt</option>
                {personen.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      ) : (
        <p
          style={{
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            color: a.muted,
            padding: '0.75rem 1rem',
            borderRadius: a.radius,
            background: a.bgElevated,
            border: '1px solid rgba(181, 74, 30, 0.1)',
          }}
        >
          <strong style={{ color: a.text }}>Stammbaum-Ansicht</strong> (Startpunkt, Partner-Zweig, wer „Du“ ist) richtet die Inhaber:in hier ein – keine weiteren Felder für diese Rolle.
        </p>
      )}
    </>
  )
}
