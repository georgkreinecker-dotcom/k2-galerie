/**
 * K2 Familie – Fertige Homepage (nutzerorientiert).
 * Route: /projects/k2-familie/meine-familie („Meine Familie“, C).
 * Willkommen + Bild + erste Aktionen (Stammbaum, Events & Kalender, …). Pro Tenant Texte/Bilder.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { getFamilyPageContent } from '../config/pageContentFamilie'
import { getFamilyPageTexts } from '../config/pageTextsFamilie'
import { loadEinstellungen, saveEinstellungen, loadPersonen, K2_FAMILIE_SESSION_UPDATED } from '../utils/familieStorage'
import { getFamilieLoadHinweisFuerNutzer, loadFamilieFromSupabase } from '../utils/familieSupabaseClient'
import {
  clearFamilieEinladungPending,
  clearFamilieFamilienQrKompaktSession,
  getFamilieEinladungPending,
  isFamilieEinladungNurZugangAnsicht,
  isFamilieFamilienQrKompaktSession,
  K2_FAMILIE_EINLADUNG_PENDING_EVENT,
} from '../utils/familieEinladungPending'
import {
  clearGerateVertrauen,
  loadIdentitaetBestaetigt,
  saveGerateVertrauen,
  setIdentitaetBestaetigt,
  tryRestoreIdentitaetFromGerat,
} from '../utils/familieIdentitaetStorage'
import {
  findPersonIdByMitgliedsNummer,
  persoenlicherCodePasstZuKarte,
  resolvePersonIdFuerPersoenlichenCodeNachMerge,
  trimMitgliedsNummerEingabe,
} from '../utils/familieMitgliedsNummer'
import type { K2FamilieStartpunktTyp } from '../types/k2Familie'
import { isK2FamilieNurMitgliedEinstiegModus } from '../utils/familieIdentitaet'
import { seedFamilieHuber, FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { clearFamilieNurMusterSession, isFamilieNurMusterSession } from '../utils/familieMusterSession'
import {
  MUSTER_HINT_HOME_KACHEL_EVENTS_KALENDER,
  MUSTER_HINT_HOME_KACHEL_GEDENKORT,
  MUSTER_HINT_HOME_KACHEL_GESCHICHTE,
  MUSTER_HINT_HOME_KACHEL_STAMMBAUM,
  MUSTER_HINT_HOME_STAMMDATEN,
} from '../config/familieMusterDemoHints'
import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import { adminTheme } from '../config/theme'
import { K2_FAMILIE_UI } from '../config/k2FamilieUiColors'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from '../config/k2FamilieNavLabels'

const C = {
  ...K2_FAMILIE_UI,
  accentHover: '#2dd4bf',
  heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,20,25,0.55) 55%, rgba(15,20,25,0.88) 100%)',
  btnStammdaten: 'linear-gradient(135deg, #0e7490 0%, #14b8a6 100%)',
  btnStammbaum: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  btnEvents: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
  /** Events + Kalender – eine Kachel (Link führt zur Event-Übersicht) */
  btnEventsKalender: 'linear-gradient(135deg, #d97706 0%, #14b8a6 100%)',
  btnGeschichte: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  btnGedenkort: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
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
  const navigate = useNavigate()
  const location = useLocation()
  const familieR = PROJECT_ROUTES['k2-familie']
  const {
    currentTenantId,
    tenantList,
    setCurrentTenantId,
    ensureTenantInListAndSelect,
    refreshFromStorage,
    familieStorageRevision,
    bumpFamilieStorageRevision,
  } = useFamilieTenant()
  const { capabilities, rolle: rolleGewaehlt } = useFamilieRolle()
  const effRolle = capabilities.rolle
  const isInhaber = effRolle === 'inhaber'
  const isBearbeiter = effRolle === 'bearbeiter'
  const isLeser = effRolle === 'leser'
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz
  const [musterLoaded, setMusterLoaded] = useState(false)
  const [persoenlicheNummerEingabe, setPersoenlicheNummerEingabe] = useState('')
  /** Wenn „Du“ schon gesetzt, Sitzung aber nicht: erneut Code eingeben (sonst keine Leiste). */
  const [identitaetSessionEingabe, setIdentitaetSessionEingabe] = useState('')
  const [identitaetSessionHinweis, setIdentitaetSessionHinweis] = useState('')
  const [identitaetSessionOk, setIdentitaetSessionOk] = useState('')
  /** Nach Code-Bestätigung: Gerät merken (localStorage-Fingerprint), damit kein Neuteippen pro Sitzung. */
  const [merkGeraetIdentitaet, setMerkGeraetIdentitaet] = useState(true)
  const [registrierungHinweis, setRegistrierungHinweis] = useState('')
  const [registrierungErfolg, setRegistrierungErfolg] = useState('')
  /** Mobil/erstes Gerät: Personen kommen erst nach Cloud-Sync – einmaliger Lade-Button + Spinner. */
  const [familieCloudSyncBusy, setFamilieCloudSyncBusy] = useState(false)
  /** Willkommens-Hero: Tippen öffnet Vollbild (Overlay oben darf Touches nicht blockieren). */
  const [heroBildVollbild, setHeroBildVollbild] = useState(false)

  const einstAmpel = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, familieStorageRevision])
  const ichBinPersonId = einstAmpel.ichBinPersonId ?? ''

  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision])
  const content = useMemo(() => getFamilyPageContent(currentTenantId), [currentTenantId, familieStorageRevision])
  const texts = useMemo(() => getFamilyPageTexts(currentTenantId), [currentTenantId, familieStorageRevision])
  /** Erste Seite: Leser minimal, Bearbeiter mittel, Inhaber voller Text aus den Seitentexten. */
  const introForRole = useMemo(() => {
    if (isInhaber) return texts.introText
    if (isBearbeiter) {
      return 'Du bearbeitest Texte, Events und Geschichten. Der Stammbaum ist lesbar; Struktur und Familien-Zugang richtet die Inhaber:in ein.'
    }
    return 'Hier liest du die Familie. Auf deiner eigenen Karte ergänzt du persönliches – ohne den Stammbaum zu verändern.'
  }, [isInhaber, isBearbeiter, texts.introText])
  const welcomeImage = content.welcomeImage || ''

  /** Volle Seite erst nach Einrichtung – vermeidet Verwechslung mit Musterfamilie in Leisten/Dropdown. */
  const einladungNurZugangAnsicht = useMemo(
    () => isFamilieEinladungNurZugangAnsicht(currentTenantId),
    [currentTenantId, location.search, familieStorageRevision],
  )
  const nurMitgliedEinstieg = useMemo(
    () =>
      isK2FamilieNurMitgliedEinstiegModus(
        rolleGewaehlt,
        currentTenantId,
        einstAmpel,
        personen,
        einladungNurZugangAnsicht,
      ),
    [rolleGewaehlt, currentTenantId, einstAmpel, personen, einladungNurZugangAnsicht],
  )

  /** Nur „t+z“-QR: ohne diesen Schritt bleiben Main + Formular leer, wenn schon „Du“ + bestätigt im Gerätespeicher. */
  const familienQrKompakt = useMemo(
    () => isFamilieFamilienQrKompaktSession(currentTenantId),
    [currentTenantId, familieStorageRevision, location.search],
  )
  const familienQrZeigeWeiterZurFamilie = useMemo(() => {
    const ich = ichBinPersonId?.trim()
    if (!familienQrKompakt || !ich) return false
    return loadIdentitaetBestaetigt(currentTenantId) === ich
  }, [familienQrKompakt, ichBinPersonId, currentTenantId, familieStorageRevision])

  const beendeFamilienQrKompaktAnsicht = () => {
    clearFamilieFamilienQrKompaktSession()
    bumpFamilieStorageRevision()
  }

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

  /** Wenn schon „Du“ + Code auf Karte: aus Geräte-Speicher Sitzung wiederherstellen (kein Neuteippen). */
  useEffect(() => {
    let cancelled = false
    const ich = ichBinPersonId?.trim()
    if (!ich) return
    const code = trimMitgliedsNummerEingabe(personen.find((p) => p.id === ich)?.mitgliedsNummer ?? '')
    if (!code) return
    if (loadIdentitaetBestaetigt(currentTenantId) === ich) return

    void (async () => {
      const ok = await tryRestoreIdentitaetFromGerat(currentTenantId, ich, code)
      if (cancelled || !ok) return
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: currentTenantId } }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentTenantId, ichBinPersonId, personen])

  /** QR-Link: wenn der Abgleich im Layout nicht reichte, Pending hier nochmal (Cloud) oder Code vorbefüllen. */
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const p = getFamilieEinladungPending()
      if (!p) return
      if (p.tenantInvalid) {
        setRegistrierungHinweis(
          'Der Link zur Familie passt nicht (Kennung in der URL). Bitte den QR-Code erneut scannen oder die Inhaber:in fragen.',
        )
        clearFamilieEinladungPending()
        return
      }
      const mNorm = trimMitgliedsNummerEingabe(p.m ?? '')
      if (!mNorm) {
        clearFamilieEinladungPending()
        return
      }
      if (p.t && p.t !== currentTenantId) {
        if (p.t !== FAMILIE_HUBER_TENANT_ID) {
          clearFamilieNurMusterSession()
        }
        const switched = ensureTenantInListAndSelect(p.t)
        if (!switched) {
          setRegistrierungHinweis(
            'Der Link zur Familie passt nicht (Kennung in der URL). Bitte den QR-Code erneut scannen oder die Inhaber:in fragen.',
          )
          clearFamilieEinladungPending()
        }
        return
      }

      /** Eine Quelle: nur die gemergte Liste nach Vollladen (inkl. Code vom Server bei leerem Lokal). */
      const data = await loadFamilieFromSupabase(currentTenantId)
      if (cancelled) return
      bumpFamilieStorageRevision()
      if (!data.loadMeta.ok) {
        setRegistrierungHinweis(getFamilieLoadHinweisFuerNutzer(data.loadMeta))
        clearFamilieEinladungPending()
        return
      }
      const pid = resolvePersonIdFuerPersoenlichenCodeNachMerge(data.personen, mNorm)
      if (pid) {
        const einst = loadEinstellungen(currentTenantId)
        if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: pid })) {
          setIdentitaetBestaetigt(currentTenantId, pid)
          clearFamilieEinladungPending()
          clearFamilieFamilienQrKompaktSession()
          bumpFamilieStorageRevision()
          navigate(`${familieR.personen}/${pid}`, { replace: true })
          return
        }
      }
      setPersoenlicheNummerEingabe(mNorm)
      setRegistrierungHinweis(
        'Automatik konnte nicht sofort zuordnen (Netzwerk oder Cloud). Dein persönlicher Code steht unten – „Bestätigen“ tippen oder kurz warten und die Seite neu öffnen.',
      )
      clearFamilieEinladungPending()
    }

    void run()
    const onPending = () => {
      void run()
    }
    window.addEventListener(K2_FAMILIE_EINLADUNG_PENDING_EVENT, onPending)
    return () => {
      cancelled = true
      window.removeEventListener(K2_FAMILIE_EINLADUNG_PENDING_EVENT, onPending)
    }
  }, [currentTenantId, familieR.personen, navigate, bumpFamilieStorageRevision, ensureTenantInListAndSelect])

  const { setupDu, setupZugang, setupStartpunkt, setupAllesErledigt } = useMemo(
    () =>
      computeErsteSchritteAmpel(
        einstAmpel.ichBinPersonId ?? '',
        einstAmpel.mitgliedsNummerAdmin ?? '',
        einstAmpel.startpunktTyp,
      ),
    [einstAmpel],
  )

  /** Alte Lesezeichen: Meine Familie#… → Verwaltung unter Einstellungen (nicht bei Einladungs-QR ?t=&z=&m= – sonst geht die Query verloren). */
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, '')
    if (raw !== 'k2-familie-zugang-name' && raw !== 'k2-familie-ansicht-einstellungen') return
    const sp = new URLSearchParams(location.search)
    if (sp.get('t') || sp.get('z') || sp.get('m') || sp.get('fn')) return
    navigate(`${familieR.einstellungen}#${raw}`, { replace: true })
  }, [navigate, familieR.einstellungen, location.search])

  const openEinstellungenAnsicht = () => {
    navigate(`${familieR.einstellungen}#k2-familie-ansicht-einstellungen`)
  }

  const openEinstellungenZugang = () => {
    navigate(`${familieR.einstellungen}#k2-familie-zugang-name`)
  }

  const bestaetigeIdentitaetFuerSession = () => {
    setIdentitaetSessionOk('')
    setIdentitaetSessionHinweis('')
    const raw = trimMitgliedsNummerEingabe(identitaetSessionEingabe)
    if (!raw) {
      setIdentitaetSessionHinweis('Bitte deinen persönlichen Code eintragen.')
      return
    }
    const ich = ichBinPersonId?.trim()
    if (!ich) return
    /** Immer aktuell aus dem Speicher – nicht nur useMemo-Stand (vermeidet „Code stimmt, Bestätigung fehl“). */
    const personenAktuell = loadPersonen(currentTenantId)
    const pid = findPersonIdByMitgliedsNummer(personenAktuell, raw)
    const ichPerson = personenAktuell.find((p) => p.id === ich)
    const codePasstZuDu =
      pid === ich || (ichPerson ? persoenlicherCodePasstZuKarte(raw, ichPerson.mitgliedsNummer) : false)
    if (!codePasstZuDu) {
      if (!pid && ichPerson?.mitgliedsNummer && trimMitgliedsNummerEingabe(raw)) {
        setIdentitaetSessionHinweis(
          'Kein Treffer. Hier den persönlichen Code eintragen (z. B. AB12) – nicht die Familien-Zugangsnummer (KF-…).',
        )
      } else {
        setIdentitaetSessionHinweis('Der Code passt nicht zu deiner Person „Du“. Schreibweise prüfen.')
      }
      return
    }
    setIdentitaetBestaetigt(currentTenantId, ich)
    if (loadIdentitaetBestaetigt(currentTenantId) !== ich) {
      setIdentitaetSessionHinweis(
        'Die Bestätigung konnte nicht gespeichert werden (z. B. strenger Privatmodus oder Speicher voll). Bitte normalen Tab nutzen oder Speicher prüfen.',
      )
      return
    }
    if (merkGeraetIdentitaet) {
      void saveGerateVertrauen(currentTenantId, ich, raw)
    } else {
      clearGerateVertrauen(currentTenantId)
    }
    setIdentitaetSessionEingabe('')
    setIdentitaetSessionHinweis('')
    setIdentitaetSessionOk(
      '✓ Du bist eingerichtet. Bearbeiten ist frei – du kannst den Code später auf deiner Personenkarte ändern, wenn du möchtest.',
    )
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: currentTenantId } }))
    }
    window.setTimeout(() => setIdentitaetSessionOk(''), 8000)
  }

  const ladeFamilieDatenVomServer = async () => {
    setFamilieCloudSyncBusy(true)
    setRegistrierungHinweis('')
    try {
      const result = await loadFamilieFromSupabase(currentTenantId)
      bumpFamilieStorageRevision()
      if (!result.loadMeta.ok) {
        setRegistrierungHinweis(getFamilieLoadHinweisFuerNutzer(result.loadMeta))
        return
      }
      if (result.personen.length === 0) {
        setRegistrierungHinweis(
          (result.loadMeta.serverPersonenCount ?? 0) === 0
            ? 'In der Cloud sind für diese Familie noch keine Personen. Prüfen: dieselbe Familie wie am Mac (QR/URL)? Inhaber:in am Mac Personen angelegt und mit der Cloud abgeglichen?'
            : 'Die Daten konnten nach dem Laden nicht im Gerätespeicher abgelegt werden (z. B. Speicher voll). Seite kurz neu öffnen oder Speicherplatz freigeben, dann „Daten vom Server laden“ erneut tippen.',
        )
      } else {
        setIdentitaetSessionHinweis('')
        setIdentitaetSessionOk('')
      }
    } finally {
      setFamilieCloudSyncBusy(false)
    }
  }

  const anmeldenMitPersoenlicherNummer = async () => {
    setRegistrierungErfolg('')
    const raw = trimMitgliedsNummerEingabe(persoenlicheNummerEingabe)
    if (!raw) {
      setRegistrierungHinweis('Bitte deinen persönlichen Code eintragen (wie mit der Inhaber:in oder dem Administrator vereinbart).')
      return
    }
    setFamilieCloudSyncBusy(true)
    try {
      const result = await loadFamilieFromSupabase(currentTenantId)
      bumpFamilieStorageRevision()
      if (!result.loadMeta.ok) {
        setRegistrierungHinweis(getFamilieLoadHinweisFuerNutzer(result.loadMeta))
        return
      }
      /** Gemergte Liste aus dem Ladevorgang – nicht nur loadPersonen(): Speichern nach Cloud-Laden kann auf dem Gerät fehlschlagen (Quota), die Server-Antwort ist trotzdem gültig. */
      const personenAktuell = result.personen.length > 0 ? result.personen : loadPersonen(currentTenantId)
      const pid = resolvePersonIdFuerPersoenlichenCodeNachMerge(personenAktuell, raw)
      if (personenAktuell.length === 0) {
        setRegistrierungHinweis(
          (result.loadMeta.serverPersonenCount ?? 0) === 0
            ? 'Es sind noch keine Personen für diese Familie da. Prüfen: gleiche Familie wie am Mac (QR/URL)? Inhaber:in am Mac Personen angelegt und mit der Cloud abgeglichen?'
            : 'Die Personenliste konnte auf diesem Gerät nicht gespeichert werden (z. B. Speicher voll). Seite neu öffnen oder Speicher freigeben, dann erneut „Bestätigen“.',
        )
        return
      }
      if (!pid) {
        setRegistrierungHinweis(
          'Keine Person mit diesem Code in dieser Familie. Persönlicher Code (z. B. AB12), nicht die Familien-Zugangsnummer (KF-…). Sonst Schreibweise prüfen oder Administrator fragen.',
        )
        return
      }
      const einst = loadEinstellungen(currentTenantId)
      if (saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: pid })) {
        setRegistrierungHinweis('')
        clearFamilieEinladungPending()
        clearFamilieFamilienQrKompaktSession()
        bumpFamilieStorageRevision()
        setIdentitaetBestaetigt(currentTenantId, pid)
        if (loadIdentitaetBestaetigt(currentTenantId) !== pid) {
          setRegistrierungHinweis(
            'Die Bestätigung konnte nicht gespeichert werden (z. B. strenger Privatmodus). Bitte normalen Tab nutzen oder Speicher prüfen.',
          )
          return
        }
        setPersoenlicheNummerEingabe('')
        setRegistrierungErfolg(
          '✓ Du bist eingerichtet. Persönlicher QR und Familien-Zugang findest du unter Einstellungen & Verwaltung – den Code kannst du auf deiner Personenkarte ändern.',
        )
        if (merkGeraetIdentitaet) {
          void saveGerateVertrauen(currentTenantId, pid, raw)
        } else {
          clearGerateVertrauen(currentTenantId)
        }
        /** Wie Einladungs-QR mit Code: gleich zur eigenen Personenkarte, nicht nur Hinweis auf der Startseite. */
        navigate(`${familieR.personen}/${pid}`, { replace: true })
      } else {
        setRegistrierungHinweis('Speichern ist fehlgeschlagen. Bitte später erneut versuchen.')
      }
    } finally {
      setFamilieCloudSyncBusy(false)
    }
  }

  const stammdatenLinkTo =
    ichBinPersonId?.trim() ? `${familieR.personen}/${ichBinPersonId.trim()}` : null

  const ichIdSession = ichBinPersonId?.trim()
  const ichPersonFuerSession = ichIdSession ? personen.find((p) => p.id === ichIdSession) : undefined
  const codeAufDuKarteSession = trimMitgliedsNummerEingabe(ichPersonFuerSession?.mitgliedsNummer ?? '')
  /** Sitzung offen: sobald „Du“ gesetzt, aber nicht bestätigt – auch auf neuem Gerät ohne lokale Personen/Code. */
  const needsIdentitaetSessionBanner = Boolean(
    ichIdSession && loadIdentitaetBestaetigt(currentTenantId) !== ichIdSession,
  )
  const isDemoMusterHuber = currentTenantId === FAMILIE_HUBER_TENANT_ID && isFamilieNurMusterSession()
  const nurMusterDemo = isFamilieNurMusterSession()
  const musterHintProps = (text: string) =>
    nurMusterDemo ? ({ 'data-muster-hint': text } as const) : ({} as const)
  /** Echte Familie aktiv (Lizenz-Mandant) – Demo-Karte „Musterfamilie laden“ nicht anzeigen. */
  const istEchteFamilieTenantAktiv = currentTenantId.startsWith('familie-')
  /** Demo Huber (Nur-Muster-Sitzung): kein gelber Code-Banner – Rechte gelten über familieIdentitaet. */
  const showIdentitaetSessionBanner = needsIdentitaetSessionBanner && !isDemoMusterHuber
  /** Ohne Personenliste oder ohne gespeicherten Code auf der Karte (lokal) gibt es nichts zum Abgleichen – zuerst Server laden. */
  const identitaetSessionFehlenDatenZumAbgleich = Boolean(
    showIdentitaetSessionBanner && (personen.length === 0 || !codeAufDuKarteSession),
  )

  useEffect(() => {
    if (!heroBildVollbild) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHeroBildVollbild(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [heroBildVollbild])

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: 0, maxWidth: '100%' }}>
        {/* Familie wählen / Neue Familie: einmal im Layout (K2FamilieLayout) */}

        {showIdentitaetSessionBanner ? (
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
                <>
                  <strong>Sitzung nicht bestätigt.</strong> Trage hier deinen persönlichen Code ein (wie auf deiner
                  Karte). Optional: &quot;Auf diesem Gerät merken&quot; – dann musst du auf <strong>diesem</strong>{' '}
                  Browser nicht bei jedem Besuch neu tippen (anderes Gerät = erneut eingeben). Den Code kannst du später
                  auf deiner Personenkarte ändern; dann gilt die Merkung hier nicht mehr.
                </>
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
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="done"
                  value={identitaetSessionEingabe}
                onChange={(e) => {
                  setIdentitaetSessionEingabe(e.target.value)
                  setIdentitaetSessionHinweis('')
                  setIdentitaetSessionOk('')
                }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      bestaetigeIdentitaetFuerSession()
                    }
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
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.45rem',
                  marginTop: '0.35rem',
                  fontSize: '0.86rem',
                  color: '#78350f',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 1.4,
                }}
              >
                <input
                  type="checkbox"
                  checked={merkGeraetIdentitaet}
                  onChange={(e) => setMerkGeraetIdentitaet(e.target.checked)}
                  aria-label="Auf diesem Gerät merken"
                  style={{ marginTop: '0.12rem', flexShrink: 0 }}
                />
                <span>Auf diesem Gerät merken (persönlicher Code nicht jedes Mal neu)</span>
              </label>
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

        {familienQrZeigeWeiterZurFamilie ? (
          <div
            className="k2-familie-no-print"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.65rem clamp(0.85rem, 4vw, 1.25rem)',
              background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
              borderBottom: '2px solid rgba(5, 150, 105, 0.35)',
            }}
          >
            <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <p style={{ margin: 0, flex: '1 1 220px', fontSize: '0.88rem', lineHeight: 1.45, color: '#064e3b', fontFamily: a.fontBody }}>
                <strong>Familien-Einstieg:</strong> Auf diesem Gerät ist deine Identität schon bestätigt{ichName ? ` (${ichName})` : ''}. Tippe auf den Button für die volle Ansicht mit Navigation und Kacheln.
              </p>
              <button
                type="button"
                onClick={beendeFamilienQrKompaktAnsicht}
                style={{
                  minHeight: 46,
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  borderRadius: 10,
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Weiter zur Familie
              </button>
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
            <p
              style={{
                margin: '0 auto 0.55rem',
                maxWidth: 920,
                width: '100%',
                fontSize: '0.86rem',
                lineHeight: 1.45,
                color: a.muted,
              }}
            >
              Der Familienraum ist privat und nur für eure Familie. Zugang hast du mit deiner persönlichen ID – dem Code auf deiner Karte.
            </p>
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
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                enterKeyHint="done"
                value={persoenlicheNummerEingabe}
                onChange={(e) => {
                  setPersoenlicheNummerEingabe(e.target.value)
                  setRegistrierungHinweis('')
                  setRegistrierungErfolg('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void anmeldenMitPersoenlicherNummer()
                  }
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
                onClick={() => void anmeldenMitPersoenlicherNummer()}
                disabled={familieCloudSyncBusy}
                style={{
                  minHeight: 46,
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  borderRadius: 10,
                  border: 'none',
                  background: a.buttonPrimary.background,
                  color: '#fff',
                  cursor: familieCloudSyncBusy ? 'wait' : 'pointer',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  opacity: familieCloudSyncBusy ? 0.85 : 1,
                }}
              >
                {familieCloudSyncBusy ? 'Lade …' : 'Bestätigen'}
              </button>
            </div>
            {!ichBinPersonId && personen.length === 0 ? (
              <div style={{ marginTop: '0.5rem', width: '100%' }}>
                <button
                  type="button"
                  id="k2-familie-daten-vom-server"
                  onClick={() => void ladeFamilieDatenVomServer()}
                  disabled={familieCloudSyncBusy}
                  style={{
                    minHeight: 42,
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    borderRadius: 10,
                    border: '1px solid rgba(13, 148, 136, 0.45)',
                    background: 'rgba(13, 148, 136, 0.12)',
                    color: a.text,
                    cursor: familieCloudSyncBusy ? 'wait' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {familieCloudSyncBusy ? 'Lade …' : 'Daten vom Server laden'}
                </button>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', lineHeight: 1.4, color: a.muted }}>
                  Wichtig auf einem neuen Handy: erst die Personen holen, dann den persönlichen Code bestätigen.
                </p>
              </div>
            ) : null}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.45rem',
                marginTop: '0.35rem',
                fontSize: '0.86rem',
                color: a.text,
                cursor: 'pointer',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              <input
                type="checkbox"
                checked={merkGeraetIdentitaet}
                onChange={(e) => setMerkGeraetIdentitaet(e.target.checked)}
                aria-label="Auf diesem Gerät merken"
                style={{ marginTop: '0.12rem', flexShrink: 0 }}
              />
              <span>Auf diesem Gerät merken (persönlicher Code nicht jedes Mal neu)</span>
            </label>
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

        {!nurMitgliedEinstieg ? (
          <>
        {/* Hero: lebendig, mit sanftem Verlauf */}
        <div className="k2-familie-hero" style={{ position: 'relative', width: '100%', height: 'clamp(260px, 44vh, 420px)', overflow: 'hidden', borderRadius: '0 0 28px 28px' }}>
          {welcomeImage ? (
            <button
              type="button"
              aria-label="Willkommensbild vergrößern"
              onClick={() => setHeroBildVollbild(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                padding: 0,
                margin: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'zoom-in',
                display: 'block',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <img
                src={welcomeImage}
                alt=""
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              />
            </button>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, rgba(13,148,136,0.5) 0%, rgba(234,88,12,0.15) 40%, rgba(15,20,25,0.92) 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay, pointerEvents: 'none' }} />
          <div className="k2-familie-hero-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.04) 45%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1.25rem, 5vw, 2.5rem)', pointerEvents: 'none' }}>
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
          {!isDemoMusterHuber ? (
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.98rem', lineHeight: 1.6, color: a.muted }}>
            {introForRole}
          </p>
          ) : null}

          {/* Ampel: Inhaber:in – außer Huber-Demo (dort kein Block; Einstieg schrittweise im Leitfaden). */}
          {isInhaber ? (
            isDemoMusterHuber ? null : (
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
                  <button type="button" onClick={openEinstellungenAnsicht} style={{ background: 'none', border: 'none', color: a.accent, cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}>
                    Stammbaum-Ansicht
                  </button>
                  {' · '}
                  <button type="button" onClick={openEinstellungenZugang} style={{ background: 'none', border: 'none', color: a.accent, cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}>
                    Zugang &amp; Name
                  </button>{' '}
                  unter Einstellungen.
                </p>
              )}
            </div>
            )
          ) : isDemoMusterHuber ? null : (
            <div
              style={{
                marginBottom: '1.1rem',
                padding: '0.75rem 1rem',
                borderRadius: a.radius,
                background: a.bgCard,
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderLeft: `4px solid ${isLeser ? '#64748b' : '#d97706'}`,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: a.muted }}>
                {isLeser ? (
                  <>
                    <strong style={{ color: a.text }}>Leser:in</strong> – du siehst alles; schreiben auf deiner eigenen Karte und am Gedenkort. Stammbaum-Struktur und Zugang richtet die Inhaber:in ein.
                  </>
                ) : (
                  <>
                    <strong style={{ color: a.text }}>Bearbeiter:in</strong> – du gestaltest Inhalte (Geschichte, Events, Gedenkort). Stammbaum und Zugang sind nur für die Inhaber:in.
                  </>
                )}
              </p>
            </div>
          )}

          <section
            style={{ marginBottom: '1.35rem' }}
            {...(isDemoMusterHuber ? { 'data-leitfaden-focus': 'home' } : {})}
          >
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              {isLeser ? 'Wohin geht’s?' : 'Was möchtest du tun?'}
            </h2>
            {!isDemoMusterHuber ? (
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', lineHeight: 1.55, color: a.muted }}>
              {isInhaber
                ? 'Hier groß und klar zum Tippen – dieselben Bereiche erreichst du zusätzlich in der oberen Menüleiste, wenn du schon auf einer anderen Seite bist.'
                : isLeser
                  ? 'Die wichtigsten Einstiege – ohne Ballast. Mehr findest du in der Menüleiste oben.'
                  : 'Kernbereiche zum Bearbeiten und Lesen – Verwaltung und Details in der oberen Menüleiste (Einstellungen).'}
            </p>
            ) : null}
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
                  {...musterHintProps(MUSTER_HINT_HOME_STAMMDATEN)}
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
                  onClick={kannStruktur ? openEinstellungenAnsicht : undefined}
                  {...musterHintProps(MUSTER_HINT_HOME_STAMMDATEN)}
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
                {...musterHintProps(MUSTER_HINT_HOME_KACHEL_STAMMBAUM)}
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
                {...musterHintProps(MUSTER_HINT_HOME_KACHEL_EVENTS_KALENDER)}
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
                {...musterHintProps(MUSTER_HINT_HOME_KACHEL_GESCHICHTE)}
                style={{
                  ...actionBtnBase,
                  background: C.btnGeschichte,
                  boxShadow: '0 8px 28px rgba(109, 40, 217, 0.35)',
                }}
              >
                📖 {K2_FAMILIE_NAV_LABEL_GESCHICHTE}
              </Link>
              <Link
                to={familieR.gedenkort}
                className="btn k2-familie-action-btn"
                {...musterHintProps(MUSTER_HINT_HOME_KACHEL_GEDENKORT)}
                style={{
                  ...actionBtnBase,
                  background: C.btnGedenkort,
                  boxShadow: '0 8px 28px rgba(71, 85, 105, 0.35)',
                }}
              >
                🕯️ Gedenkort
              </Link>
            </div>
          </section>

          {!tenantList.includes(FAMILIE_HUBER_TENANT_ID) && kannInstanz && !istEchteFamilieTenantAktiv && (
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
              {musterLoaded && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: a.muted }}>
                  Musterfamilie Huber geladen. Oben in der Leiste ist die aktuelle Familie sichtbar (mehrere Mandanten: dort wechseln).
                </p>
              )}
            </div>
          )}

          </div>
        </div>
          </>
        ) : null}
      </div>

      {heroBildVollbild && welcomeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Willkommensbild groß"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'max(0.5rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) max(0.5rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left))',
            boxSizing: 'border-box',
            touchAction: 'manipulation',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={() => setHeroBildVollbild(false)}
        >
          <button
            type="button"
            aria-label="Schließen"
            onClick={(e) => {
              e.stopPropagation()
              setHeroBildVollbild(false)
            }}
            style={{
              position: 'absolute',
              top: 'max(10px, env(safe-area-inset-top))',
              right: 'max(10px, env(safe-area-inset-right))',
              zIndex: 1,
              minWidth: 44,
              minHeight: 44,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              fontSize: '1.25rem',
              lineHeight: 1,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
          <img
            src={welcomeImage}
            alt=""
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: 'min(92vh, 100%)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
            Tippen auf das Bild, daneben oder ✕ zum Schließen
          </p>
        </div>
      ) : null}
    </div>
  )
}
