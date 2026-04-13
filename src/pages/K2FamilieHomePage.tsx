/**
 * K2 Familie – Fertige Homepage (nutzerorientiert).
 * Route: /projects/k2-familie/meine-familie („Meine Familie“, C).
 * Willkommen + Bild + erste Aktionen (Stammbaum, Events & Kalender, …). Pro Tenant Texte/Bilder.
 */

import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { getFamilyPageContent } from '../config/pageContentFamilie'
import { getFamilyPageTexts } from '../config/pageTextsFamilie'
import { loadEinstellungen, saveEinstellungen, loadPersonen, K2_FAMILIE_SESSION_UPDATED } from '../utils/familieStorage'
import { loadIdentitaetBestaetigt, setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { findPersonIdByMitgliedsNummer, trimMitgliedsNummerEingabe } from '../utils/familieMitgliedsNummer'
import { K2_FAMILIE_EINSTELLUNGEN_UPDATED } from '../components/FamilieEinladungQuerySync'
import type { K2FamilieStartpunktTyp } from '../types/k2Familie'
import QRCode from 'qrcode'
import { seedFamilieHuber, FAMILIE_HUBER_TENANT_ID, getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { adminTheme } from '../config/theme'
import { APP_BASE_URL } from '../config/externalUrls'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const C = {
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.78)',
  accent: '#14b8a6',
  accentHover: '#2dd4bf',
  border: 'rgba(13,148,136,0.35)',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,20,25,0.55) 55%, rgba(15,20,25,0.88) 100%)',
  btnStammdaten: 'linear-gradient(135deg, #0e7490 0%, #14b8a6 100%)',
  btnStammbaum: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  btnEvents: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
  /** Events + Kalender – eine Kachel (Link führt zur Event-Übersicht) */
  btnEventsKalender: 'linear-gradient(135deg, #d97706 0%, #14b8a6 100%)',
  btnGeschichte: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  btnGedenkort: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
  /** Einstellungen-Hub: Zugang, Ansicht, Sicherung, Lizenz, Handbuch & Präsentationsmappe */
  btnEinstellungen: 'linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #6366f1 100%)',
  btnSicherung: 'linear-gradient(135deg, #991b1b 0%, #dc2626 45%, #f87171 100%)',
}

const actionBtnBase: CSSProperties = {
  padding: '1.1rem 1.25rem',
  border: 'none',
  borderRadius: 20,
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const STARTPUNKT_LABELS: Record<K2FamilieStartpunktTyp, string> = {
  ich: 'Bei mir',
  eltern: 'Bei meinen Eltern',
  grosseltern: 'Bei meinen Großeltern',
}

/** Einheitliches Format für frei vergebene Zugangsnummern (Inhaber:in / Administrator). */
function suggestFamilieZugangsnummer(): string {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `KF-${y}-${n}`
}

/** Reine Logik (außerhalb der Komponente): vermeidet ReferenceError bei HMR / fragmentierter Ausführung. */
function computeErsteSchritteAmpel(
  ichBinPersonId: string,
  mitgliedsNummer: string,
  startpunkt: K2FamilieStartpunktTyp | undefined,
) {
  const setupDu = Boolean(ichBinPersonId?.trim())
  const setupZugang = Boolean(mitgliedsNummer.trim())
  const setupStartpunkt = startpunkt !== undefined
  const setupAllesErledigt = setupDu && setupZugang && setupStartpunkt
  return { setupDu, setupZugang, setupStartpunkt, setupAllesErledigt }
}

export default function K2FamilieHomePage() {
  const a = adminTheme
  const { currentTenantId, tenantList, setCurrentTenantId, refreshFromStorage } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz
  const [musterLoaded, setMusterLoaded] = useState(false)
  const [startpunkt, setStartpunkt] = useState<K2FamilieStartpunktTyp | undefined>(undefined)
  const [partnerHerkunftId, setPartnerHerkunftId] = useState<string>('')
  const [ichBinPersonId, setIchBinPersonIdState] = useState<string>('')
  const [mitgliedsNummer, setMitgliedsNummer] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [einladungsLinkKopiert, setEinladungsLinkKopiert] = useState(false)
  const [persoenlicherLinkKopiert, setPersoenlicherLinkKopiert] = useState(false)
  const [persoenlicheNummerEingabe, setPersoenlicheNummerEingabe] = useState('')
  /** Wenn „Du“ schon gesetzt, Sitzung aber nicht: erneut Code eingeben (sonst keine Leiste). */
  const [identitaetSessionEingabe, setIdentitaetSessionEingabe] = useState('')
  const [identitaetSessionHinweis, setIdentitaetSessionHinweis] = useState('')
  const [identitaetSessionOk, setIdentitaetSessionOk] = useState('')
  const [registrierungHinweis, setRegistrierungHinweis] = useState('')
  const [registrierungErfolg, setRegistrierungErfolg] = useState('')
  const [persoenlicherQrDataUrl, setPersoenlicherQrDataUrl] = useState('')
  const [zugangSpeichernHinweis, setZugangSpeichernHinweis] = useState('')
  /** Nummer ist mindestens einmal nicht-leer gespeichert → fest (kein Dauernd-neu-Vorschlagen). */
  const [zugangFestgelegt, setZugangFestgelegt] = useState(false)
  /** Inhaber:in hat „Nummer ändern“ gewählt → Feld wieder editierbar bis Speichern/Abbrechen. */
  const [zugangAendernModus, setZugangAendernModus] = useState(false)
  /** Wie die Familie in Auswahl und Texten heißt (z. B. Familie Kreinecker) — nicht die technische Tenant-ID. */
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
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])
  const content = useMemo(() => getFamilyPageContent(currentTenantId), [currentTenantId])
  const texts = useMemo(() => getFamilyPageTexts(currentTenantId), [currentTenantId])
  const welcomeImage = content.welcomeImage || ''

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

  const { setupDu, setupZugang, setupStartpunkt, setupAllesErledigt } = useMemo(
    () => computeErsteSchritteAmpel(ichBinPersonId, mitgliedsNummer, startpunkt),
    [ichBinPersonId, mitgliedsNummer, startpunkt],
  )

  /** Sprung von Einstellungen-Seite (#anker): Stammbaum-Details öffnen bzw. Zugang-Bereich scrollen */
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
        const zugangZiel =
          document.getElementById('k2-familie-persoenlicher-code') || document.getElementById('k2-familie-zugang-name')
        zugangZiel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  /** Wie Galerie-QR (`publicLinks`): immer Produktions-Host (`APP_BASE_URL`), nie localhost — Scan am Handy sonst wertlos. */
  const familieEinladungsUrl = useMemo(() => {
    const z = mitgliedsNummer.trim()
    if (!z) return ''
    const base = new URL(`${APP_BASE_URL}${PROJECT_ROUTES['k2-familie'].meineFamilie}`)
    base.searchParams.set('t', currentTenantId)
    base.searchParams.set('z', z)
    return buildQrUrlWithBust(base.toString(), versionTimestamp)
  }, [mitgliedsNummer, currentTenantId, versionTimestamp])

  /** Familie + persönliche Mitgliedsnummer: ein Scan meldet Gerät in der Familie und ordnet „Du“ zu. */
  const familiePersoenlicheEinladungsUrl = useMemo(() => {
    const z = mitgliedsNummer.trim()
    const m = persoenlicheMitgliedsNummerAufKarte
    if (!z || !m) return ''
    const base = new URL(`${APP_BASE_URL}${PROJECT_ROUTES['k2-familie'].meineFamilie}`)
    base.searchParams.set('t', currentTenantId)
    base.searchParams.set('z', z)
    base.searchParams.set('m', m)
    return buildQrUrlWithBust(base.toString(), versionTimestamp)
  }, [mitgliedsNummer, persoenlicheMitgliedsNummerAufKarte, currentTenantId, versionTimestamp])

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

  const bestaetigeIdentitaetFuerSession = () => {
    setIdentitaetSessionOk('')
    setIdentitaetSessionHinweis('')
    const raw = identitaetSessionEingabe.trim()
    if (!raw) {
      setIdentitaetSessionHinweis('Bitte deinen persönlichen Code eintragen.')
      return
    }
    const ich = ichBinPersonId?.trim()
    if (!ich) return
    const pid = findPersonIdByMitgliedsNummer(personen, raw)
    if (pid !== ich) {
      setIdentitaetSessionHinweis('Der Code passt nicht zu deiner Person „Du“. Schreibweise prüfen.')
      return
    }
    setIdentitaetBestaetigt(currentTenantId, ich)
    setIdentitaetSessionEingabe('')
    setIdentitaetSessionHinweis('')
    setIdentitaetSessionOk('✓ Sitzung bestätigt. Bearbeiten ist wieder möglich.')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: currentTenantId } }))
    }
    window.setTimeout(() => setIdentitaetSessionOk(''), 6000)
  }

  const anmeldenMitPersoenlicherNummer = () => {
    setRegistrierungErfolg('')
    const raw = persoenlicheNummerEingabe.trim()
    if (!raw) {
      setRegistrierungHinweis('Bitte deinen persönlichen Code eintragen (wie mit der Inhaber:in oder dem Administrator vereinbart).')
      return
    }
    const pid = findPersonIdByMitgliedsNummer(personen, raw)
    if (!pid) {
      setRegistrierungHinweis(
        'Keine Person mit dieser Nummer in dieser Familie. Schreibweise prüfen oder Administrator fragen.',
      )
      return
    }
    const einst = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: pid })) {
      setIchBinPersonIdState(pid)
      setPersoenlicheNummerEingabe('')
      setRegistrierungHinweis('')
      setRegistrierungErfolg('✓ Du bist angemeldet. Dein Name und dein persönlicher QR erscheinen unten.')
      setIdentitaetBestaetigt(currentTenantId, pid)
    } else {
      setRegistrierungHinweis('Speichern ist fehlgeschlagen. Bitte später erneut versuchen.')
    }
  }

  const openAnsichtEinstellungen = () => {
    setAnsichtEinstellungenOpen(true)
    requestAnimationFrame(() => {
      ansichtEinstellungenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const familieR = PROJECT_ROUTES['k2-familie']
  const stammdatenLinkTo =
    ichBinPersonId?.trim() ? `${familieR.personen}/${ichBinPersonId.trim()}` : null

  const ichIdSession = ichBinPersonId?.trim()
  const ichPersonFuerSession = ichIdSession ? personen.find((p) => p.id === ichIdSession) : undefined
  const codeAufDuKarteSession = trimMitgliedsNummerEingabe(ichPersonFuerSession?.mitgliedsNummer ?? '')
  const needsIdentitaetSessionBanner = Boolean(
    ichIdSession && codeAufDuKarteSession && loadIdentitaetBestaetigt(currentTenantId) !== ichIdSession,
  )

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: 0, maxWidth: '100%' }}>
        {/* Familie wählen / Neue Familie: einmal im Layout (K2FamilieLayout) */}

        {needsIdentitaetSessionBanner ? (
          <div
            id="k2-familie-identitaet-bestaetigen"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.65rem clamp(0.85rem, 4vw, 1.25rem)',
              background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
              borderBottom: '2px solid rgba(180, 83, 9, 0.35)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                maxWidth: 920,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#78350f',
                  lineHeight: 1.45,
                  fontFamily: a.fontBody,
                }}
              >
                <strong>Sitzung nicht bestätigt.</strong> Auf deiner Karte ist ein persönlicher Code – bitte gib ihn
                hier einmal ein, damit Bearbeiten und Stammdaten wieder freigeschaltet werden (z. B. nach neuem Tab
                oder anderem Gerät).
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.5rem 0.75rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#78350f',
                    fontFamily: a.fontHeading,
                    flex: '0 0 auto',
                  }}
                >
                  Dein Code
                </span>
                <input
                  type="text"
                  autoComplete="off"
                  value={identitaetSessionEingabe}
                  onChange={(e) => {
                    setIdentitaetSessionEingabe(e.target.value)
                    setIdentitaetSessionHinweis('')
                    setIdentitaetSessionOk('')
                  }}
                  placeholder="persönlicher Code"
                  aria-label="Persönlicher Code zur Sitzungsbestätigung"
                  style={{
                    flex: '1 1 160px',
                    minWidth: 140,
                    maxWidth: 280,
                    minHeight: 46,
                    background: '#fff',
                    border: '2px solid rgba(180, 83, 9, 0.45)',
                    borderRadius: 10,
                    color: a.text,
                    padding: '0.5rem 0.65rem',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={bestaetigeIdentitaetFuerSession}
                  style={{
                    minHeight: 46,
                    padding: '0.5rem 1rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    borderRadius: 10,
                    border: 'none',
                    background: '#b45309',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Bestätigen
                </button>
              </div>
              {identitaetSessionHinweis ? (
                <p role="status" style={{ margin: 0, fontSize: '0.88rem', color: '#991b1b', fontWeight: 600 }}>
                  {identitaetSessionHinweis}
                </p>
              ) : null}
              {identitaetSessionOk ? (
                <p role="status" style={{ margin: 0, fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
                  {identitaetSessionOk}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {!ichBinPersonId?.trim() ? (
          <div
            id="k2-familie-persoenlicher-code"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.65rem clamp(0.85rem, 4vw, 1.25rem)',
              background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
              borderBottom: '2px solid rgba(181, 74, 30, 0.28)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div
              style={{
                maxWidth: 920,
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem 0.75rem',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: a.text,
                  fontFamily: a.fontHeading,
                  flex: '0 0 auto',
                }}
              >
                Dein Code
              </span>
              <input
                type="text"
                autoComplete="off"
                value={persoenlicheNummerEingabe}
                onChange={(e) => {
                  setPersoenlicheNummerEingabe(e.target.value)
                  setRegistrierungHinweis('')
                  setRegistrierungErfolg('')
                }}
                placeholder={kannInstanz ? 'z. B. AB12' : 'vom Administrator'}
                aria-label="Persönlicher Mitgliedscode"
                style={{
                  flex: '1 1 160px',
                  minWidth: 140,
                  maxWidth: 280,
                  minHeight: 46,
                  background: '#fff',
                  border: '2px solid rgba(181, 74, 30, 0.4)',
                  borderRadius: 10,
                  color: a.text,
                  padding: '0.5rem 0.65rem',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={anmeldenMitPersoenlicherNummer}
                style={{
                  minHeight: 46,
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  borderRadius: 10,
                  border: 'none',
                  background: a.buttonPrimary.background,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Bestätigen
              </button>
            </div>
          </div>
        ) : null}
        {registrierungHinweis ? (
          <div
            style={{
              width: '100%',
              padding: '0.4rem clamp(0.85rem, 4vw, 1.25rem) 0',
              boxSizing: 'border-box',
              maxWidth: 920,
              margin: '0 auto',
            }}
          >
            <p
              role="status"
              style={{
                margin: 0,
                padding: '0.45rem 0.65rem',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                borderRadius: a.radius,
                border: '1px solid rgba(180, 83, 9, 0.45)',
                background: 'rgba(254, 243, 199, 0.92)',
                color: '#92400e',
              }}
            >
              {registrierungHinweis}
            </p>
          </div>
        ) : null}
        {registrierungErfolg ? (
          <div
            style={{
              width: '100%',
              padding: '0.4rem clamp(0.85rem, 4vw, 1.25rem) 0',
              boxSizing: 'border-box',
              maxWidth: 920,
              margin: '0 auto',
            }}
          >
            <p
              role="status"
              style={{
                margin: 0,
                padding: '0.45rem 0.65rem',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                borderRadius: a.radius,
                border: '1px solid rgba(22, 101, 52, 0.35)',
                background: 'rgba(220, 252, 231, 0.95)',
                color: '#166534',
              }}
            >
              {registrierungErfolg}
            </p>
          </div>
        ) : null}

        {/* Hero: lebendig, mit sanftem Verlauf */}
        <div className="k2-familie-hero" style={{ position: 'relative', width: '100%', height: 'clamp(260px, 44vh, 420px)', overflow: 'hidden', borderRadius: '0 0 28px 28px' }}>
          {welcomeImage ? (
            <img src={welcomeImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, rgba(13,148,136,0.5) 0%, rgba(234,88,12,0.15) 40%, rgba(15,20,25,0.92) 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
          <div className="k2-familie-hero-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.04) 45%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1.25rem, 5vw, 2.5rem)' }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>
              {texts.welcomeSubtitle}
            </p>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 4.5vw, 2.6rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, textShadow: '0 1px 12px rgba(0,0,0,0.45)' }}>
              {texts.welcomeTitle}
            </h1>
          </div>
        </div>

        <div
          style={{
            background: a.bgDark,
            fontFamily: a.fontBody,
            padding: '1.75rem 1.25rem 2.5rem',
          }}
        >
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.98rem', lineHeight: 1.6, color: a.muted }}>
            {texts.introText}
          </p>

          {/* Ampel: erste Einrichtung (nur Hinweis, keine Pflichtlogik) */}
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1.15rem',
              borderRadius: a.radius,
              background: a.bgCard,
              boxShadow: a.shadow,
              border: '1px solid rgba(181, 74, 30, 0.12)',
              borderLeft: `4px solid ${setupAllesErledigt ? '#15803d' : a.accent}`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: a.accent, marginBottom: '0.5rem' }}>
              {setupAllesErledigt ? 'Erste Einrichtung: grundlegend erledigt' : 'Erste Schritte – zum Start'}
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', color: a.muted, fontSize: '0.88rem', lineHeight: 1.55 }}>
              <li style={{ color: setupDu ? '#15803d' : a.muted }}>
                {setupDu ? '✓' : '○'} „Du“ im Stammbaum gewählt
              </li>
              <li style={{ color: setupZugang ? '#15803d' : a.muted }}>
                {setupZugang ? '✓' : '○'} Zugangsnummer für den QR-Code eingetragen
              </li>
              <li style={{ color: setupStartpunkt ? '#15803d' : a.muted }}>
                {setupStartpunkt ? '✓' : '○'} Startpunkt für die Stammbaum-Ansicht gewählt
              </li>
            </ul>
            {!setupAllesErledigt && (
              <p style={{ margin: '0.55rem 0 0', fontSize: '0.8rem', color: a.muted }}>
                {!setupDu ? 'Code oben eintragen. ' : null}
                <button type="button" onClick={openAnsichtEinstellungen} style={{ background: 'none', border: 'none', color: a.accent, cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}>
                  Stammbaum-Ansicht
                </button>
                {' · '}
                Zugang &amp; Name unten.
              </p>
            )}
          </div>

          <section style={{ marginBottom: '1.35rem' }}>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Was möchtest du tun?
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', lineHeight: 1.55, color: a.muted }}>
              Hier groß und klar zum Tippen – dieselben Bereiche erreichst du zusätzlich in der oberen Menüleiste, wenn du schon auf einer anderen Seite bist.
            </p>
            <div
              className="k2-familie-action-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '0.25rem',
              }}
            >
              {stammdatenLinkTo ? (
                <Link
                  to={stammdatenLinkTo}
                  className="btn k2-familie-action-btn"
                  style={{
                    ...actionBtnBase,
                    background: C.btnStammdaten,
                    boxShadow: '0 8px 28px rgba(14, 116, 144, 0.45)',
                  }}
                >
                  👤 Meine Stammdaten
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn k2-familie-action-btn"
                  disabled={!kannStruktur}
                  onClick={kannStruktur ? openAnsichtEinstellungen : undefined}
                  style={{
                    ...actionBtnBase,
                    background: C.btnStammdaten,
                    boxShadow: '0 8px 28px rgba(14, 116, 144, 0.35)',
                    opacity: kannStruktur ? 1 : 0.55,
                    cursor: kannStruktur ? 'pointer' : 'not-allowed',
                  }}
                >
                  👤 Stammdaten – zuerst „Du“ festlegen
                </button>
              )}
              <Link
                to={familieR.stammbaum}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnStammbaum,
                  boxShadow: '0 8px 28px rgba(5, 150, 105, 0.4)',
                }}
              >
                🌳 {texts.buttonStammbaum}
              </Link>
              <Link
                to={familieR.events}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnEventsKalender,
                  boxShadow: '0 8px 28px rgba(217, 119, 6, 0.38)',
                }}
                title="Zur Event-Übersicht; Kalender über denselben Menüpunkt in der oberen Leiste oder von der Events-Seite aus."
              >
                🎉📆 Events &amp; Kalender
              </Link>
              <Link
                to={familieR.geschichte}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnGeschichte,
                  boxShadow: '0 8px 28px rgba(109, 40, 217, 0.35)',
                }}
              >
                📖 Geschichte
              </Link>
              <Link
                to={familieR.gedenkort}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnGedenkort,
                  boxShadow: '0 8px 28px rgba(71, 85, 105, 0.35)',
                }}
              >
                🕯️ Gedenkort
              </Link>
              <Link
                to={familieR.einstellungen}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnEinstellungen,
                  boxShadow: '0 8px 28px rgba(79, 70, 229, 0.42)',
                }}
                title="Zugang &amp; Name, Stammbaum-Ansicht, Sicherung, Lizenz, Handbuch und Präsentationsmappe"
              >
                ⚙️ Einstellungen &amp; Verwaltung
              </Link>
              <Link
                to={familieR.sicherung}
                className="btn k2-familie-action-btn"
                style={{
                  ...actionBtnBase,
                  background: C.btnSicherung,
                  boxShadow: '0 8px 28px rgba(153, 27, 27, 0.35)',
                }}
              >
                💾 Sicherung
              </Link>
            </div>
          </section>

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
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>Zugang & Name</h2>
            <p style={{ margin: '0 0 0.55rem', lineHeight: 1.55, color: a.muted, fontSize: '0.9rem' }}>
              {kannInstanz ? (
                <>
                  <strong style={{ color: a.text }}>Als Inhaber:in (Administrator):</strong> Du legst unten die <strong style={{ color: a.text }}>Familien-Zugangsnummer</strong> fest — eine Nummer für den ganzen Stammbaum; QR und Link führen alle in dieselbe Familie. Die <strong style={{ color: a.text }}>persönlichen Codes</strong> sind <strong style={{ color: a.text }}>Schlüssel</strong> zum persönlichen Bereich und die <strong style={{ color: a.text }}>erste Identifikation</strong> beim Eintritt; du vergibst sie unter <strong style={{ color: a.text }}>Mitglieder &amp; Codes</strong> oder auf der Personenkarte — jedes Mitglied kann den Code auch <strong style={{ color: a.text }}>selbst auf der eigenen Karte</strong> eintragen. <strong style={{ color: a.text }}>Danach</strong> reicht der gespeicherte persönliche QR oder Link auf dem Gerät — kein erneutes Eintragen bei jedem Besuch. Dann erscheinen <strong style={{ color: a.text }}>Name</strong> und <strong style={{ color: a.text }}>persönlicher QR</strong>. Wer „Du“ bist, stellst du zusätzlich unter{' '}
                  <button type="button" onClick={openAnsichtEinstellungen} style={{ background: 'none', border: 'none', color: a.accent, cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}>
                    Stammbaum-Ansicht einstellen
                  </button>{' '}
                  ein.
                </>
              ) : (
                <>
                  Die <strong style={{ color: a.text }}>Familien-Zugangsnummer</strong> kommt von der Inhaber:in oder dem Administrator; der <strong style={{ color: a.text }}>QR Familie</strong> öffnet dieselbe Familie. <strong style={{ color: a.text }}>Deinen persönlichen Code</strong> trägst du unten ein (wie mitgeteilt) — das ist die <strong style={{ color: a.text }}>erste Identifikation</strong> beim Eintritt; <strong style={{ color: a.text }}>danach</strong> reicht der gespeicherte persönliche QR oder Link auf dem Gerät. Sobald „Du“ gesetzt ist, siehst du deinen Namen. Die Nummer der Familie kannst du
                  {capabilities.rolle === 'leser' ? ' nicht ändern.' : ' nur als Inhaber:in ändern.'}
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
                <span style={{ color: a.muted }}>Diese Familie:</span>{' '}
                <strong>{getFamilieTenantDisplayName(currentTenantId, 'Familie')}</strong>
              </p>
            )}
            <h3 style={{ margin: '0.75rem 0 0.4rem', fontSize: '0.98rem', fontWeight: 700, color: a.accent, fontFamily: a.fontHeading }}>Familien-Zugang</h3>
            <p style={{ margin: '0 0 0.85rem', lineHeight: 1.45, color: a.muted, fontSize: '0.82rem' }}>
              {kannInstanz ? (
                <>
                  <strong style={{ color: a.text }}>Deine Aufgabe als Inhaber:in:</strong> Diese eine Nummer für den ganzen Stammbaum festlegen und weitergeben — QR oder Link (nur Online-App, nicht localhost).
                </>
              ) : (
                <>Eine Nummer für den ganzen Stammbaum — teilen per QR oder Link (nur Online-App, nicht localhost).</>
              )}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div>
                <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: a.text }}>
                  {ichName || '— sobald „Du“ gesetzt ist'}
                </div>
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
                    <img src={qrDataUrl} alt="QR-Code zum Öffnen dieser Familie mit Zugangscode" width={168} height={168} style={{ display: 'block', borderRadius: 12, border: '1px solid rgba(181, 74, 30, 0.25)' }} />
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
                <p
                  style={{
                    margin: '0 0 0.65rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: a.text,
                    lineHeight: 1.45,
                    fontFamily: a.fontBody,
                  }}
                >
                  Willkommen, {ichName}. Das ist dein persönlicher Bereich — der Code oben hat dich dieser Familie zugeordnet; QR und Link gelten für dich.
                </p>
              ) : null}
              {kannInstanz ? (
                <p style={{ margin: '0 0 0.75rem', lineHeight: 1.5, color: a.muted, fontSize: '0.88rem' }}>
                  Codes vergeben: Personenkarte oder{' '}
                  <Link to={PROJECT_ROUTES['k2-familie'].mitgliederCodes} style={{ color: a.accent, fontWeight: 600 }}>
                    Mitglieder &amp; Codes
                  </Link>
                  . Mitglied tippt den Code <strong style={{ color: a.text }}>oben</strong> ein — danach erscheint der persönliche QR.
                </p>
              ) : (
                <p style={{ margin: '0 0 0.75rem', lineHeight: 1.5, color: a.muted, fontSize: '0.88rem' }}>
                  Code von der Inhaberin <strong style={{ color: a.text }}>oben</strong> eintragen. Danach persönlicher QR — oder QR scannen.
                </p>
              )}
              {ichBinPersonId?.trim() ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                    <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>Angemeldet als</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: a.text }}>{ichName || '—'}</div>
                    {stammdatenLinkTo ? (
                      <Link
                        to={stammdatenLinkTo}
                        style={{ display: 'inline-block', marginTop: '0.45rem', fontSize: '0.88rem', color: a.accent, fontWeight: 600 }}
                      >
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
                  {persoenlicherQrDataUrl && familiePersoenlicheEinladungsUrl ? (
                    <div style={{ textAlign: 'left', maxWidth: 200 }}>
                      <div style={{ marginBottom: 6, fontSize: '0.82rem', color: a.muted }}>
                        Dein persönlicher QR{ichName ? ` (${ichName})` : ''}
                      </div>
                      <img
                        src={persoenlicherQrDataUrl}
                        alt=""
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
                    <button type="button" disabled={!kannStruktur} onClick={() => setStartpunkt(undefined)} style={{ marginLeft: '0.75rem', fontSize: '0.85rem', padding: '0.35rem 0.65rem', borderRadius: a.radius, border: '1px solid rgba(181, 74, 30, 0.35)', background: a.bgCard, color: a.accent, opacity: kannStruktur ? 1 : 0.55, cursor: kannStruktur ? 'pointer' : 'not-allowed' }}>Ändern</button>
                  </p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: a.muted }}>Anker für Stammbaum und Übersicht.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(['ich', 'eltern', 'grosseltern'] as const).map((typ) => (
                        <button key={typ} type="button" disabled={!kannStruktur} onClick={() => setStartpunktTyp(typ)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.88rem', borderRadius: a.radius, background: a.accentSoft, border: `1px solid rgba(181, 74, 30, 0.28)`, color: a.accent, opacity: kannStruktur ? 1 : 0.55, cursor: kannStruktur ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
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
                    <option key={p.id} value={p.id}>Herkunft {p.name}</option>
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
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          {!tenantList.includes(FAMILIE_HUBER_TENANT_ID) && kannInstanz && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.15rem',
                borderRadius: a.radius,
                background: a.bgCard,
                boxShadow: a.shadow,
                border: '1px solid rgba(181, 74, 30, 0.12)',
                borderLeft: `4px solid ${a.accent}`,
              }}
            >
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>Musterfamilie Huber</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.5 }}>Demo-Familie mit 16 Personen, Stammbaum und Events – zum Anschauen und Ausprobieren.</p>
              <button
                type="button"
                onClick={() => {
                  if (seedFamilieHuber()) {
                    refreshFromStorage()
                    setCurrentTenantId(FAMILIE_HUBER_TENANT_ID)
                    setMusterLoaded(true)
                  }
                }}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  borderRadius: a.radius,
                  border: 'none',
                  cursor: 'pointer',
                  ...a.buttonPrimary,
                }}
              >
                Musterfamilie laden und anzeigen
              </button>
              {musterLoaded && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: a.muted }}>Familie Huber geladen. Im Dropdown „Familie:“ in der Leiste kannst du sie auswählen.</p>}
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  )
}
