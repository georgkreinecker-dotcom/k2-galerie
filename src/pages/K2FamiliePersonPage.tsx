/**
 * K2 Familie – Personen-Seite. Phase 2.2, 2.3.
 * Route: /projects/k2-familie/personen/:id
 */

import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo, useCallback, useRef, type ReactNode, type ChangeEventHandler, type CSSProperties } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  loadPersonen,
  savePersonen,
  loadMomente,
  saveMomente,
  loadBeitraege,
  saveBeitraege,
  deletePersonWithCleanup,
  loadEinstellungen,
  saveEinstellungen,
} from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamiliePerson, K2FamilieMoment, K2FamilieBeitrag } from '../types/k2Familie'
import { normalizeFamilieDatum, istFamilieDatumUngueltig } from '../utils/familieDatumEingabe'
import {
  getBeziehungenFromKarten,
  getGeschwisterAnzeigeListe,
  getGeschwisterIdsAusEltern,
} from '../utils/familieBeziehungen'
import { getGraphDistanceFromIch, portraitSizeFromGraphDistance } from '../utils/familieGraphDistance'
import { trimMitgliedsNummerEingabe } from '../utils/familieMitgliedsNummer'
import FamilieDatumDreiSelect from '../components/FamilieDatumDreiSelect'
import FamiliePersoenlicherCodeFelder from '../components/FamiliePersoenlicherCodeFelder'
import { compressImageForStorage } from '../utils/compressImageForStorage'
import {
  getAktuellesPersonenFoto,
  getLebensphaseFeldFuerAktuellesFoto,
  isHttpUrlForExternalOpen,
  DEFAULT_LEBENSPHASE_NEUES_FOTO,
  type LebensphaseFotoFeld,
} from '../utils/familiePersonFotos'

function generatePersonId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

/** Anzeige „Zuletzt gespeichert“ (lokal de-AT). */
function formatZuletztGespeichert(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
}

/** Gleiche Logik wie `save()` – true wenn Formular von den gespeicherten Stammdaten abweicht. */
function computeStammdatenDirty(
  person: K2FamiliePerson,
  f: {
    name: string
    geburtsdatum: string
    maedchenname: string
    shortText: string
    verstorben: boolean
    verstorbenAm: string
    positionAmongSiblingsInput: string
    photoKind: string
    photoJugend: string
    photoErwachsen: string
    photoAlter: string
    linkFotoalbum: string
    linkWeb: string
    linkYoutube: string
    linkInstagram: string
    kaZeile1: string
    kaZeile2: string
    kaPlz: string
    kaOrt: string
    kaLand: string
    kaEmail: string
    kaTelefon: string
    mitgliedsNummer: string
  },
  photoLegacyCleared: boolean
): boolean {
  const effName = f.name.trim() || person.name
  if (effName !== person.name) return true
  const gdNorm = normalizeFamilieDatum(f.geburtsdatum)
  const savedGd = person.geburtsdatum?.slice(0, 10) ?? ''
  if ((gdNorm ?? '') !== savedGd) return true
  const maed = f.maedchenname.trim() || undefined
  if ((person.maedchenname ?? undefined) !== maed) return true
  const st = f.shortText.trim() || undefined
  if ((person.shortText ?? undefined) !== st) return true
  if (f.verstorben !== (person.verstorben === true)) return true
  const pendingVs = f.verstorben && f.verstorbenAm.trim() ? normalizeFamilieDatum(f.verstorbenAm) : undefined
  const savedVs = person.verstorbenAm?.slice(0, 10) ?? ''
  if ((pendingVs ?? '') !== (savedVs || '')) return true
  const posNum = f.positionAmongSiblingsInput.trim() === '' ? undefined : parseInt(f.positionAmongSiblingsInput.trim(), 10)
  const pos = posNum != null && !Number.isNaN(posNum) && posNum >= 1 ? posNum : undefined
  if (pos !== (person.positionAmongSiblings ?? undefined)) return true
  const ps = (s: string | undefined, form: string) => (s ?? '').trim() === form.trim()
  if (!ps(person.photoKind, f.photoKind)) return true
  if (!ps(person.photoJugend, f.photoJugend)) return true
  if (!ps(person.photoErwachsen, f.photoErwachsen)) return true
  if (!ps(person.photoAlter, f.photoAlter)) return true
  if (!ps(person.linkFotoalbum, f.linkFotoalbum)) return true
  if (!ps(person.linkWeb, f.linkWeb)) return true
  if (!ps(person.linkYoutube, f.linkYoutube)) return true
  if (!ps(person.linkInstagram, f.linkInstagram)) return true
  if (photoLegacyCleared && String(person.photo ?? '').trim()) return true
  const k = person.kontaktAdresse
  const g = (x: string | undefined, form: string) => (x ?? '').trim() === form.trim()
  if (!g(k?.zeile1, f.kaZeile1)) return true
  if (!g(k?.zeile2, f.kaZeile2)) return true
  if (!g(k?.plz, f.kaPlz)) return true
  if (!g(k?.ort, f.kaOrt)) return true
  if (!g(k?.land, f.kaLand)) return true
  if (!g(k?.email, f.kaEmail)) return true
  if (!g(k?.telefon, f.kaTelefon)) return true
  if (trimMitgliedsNummerEingabe(f.mitgliedsNummer) !== trimMitgliedsNummerEingabe(person.mitgliedsNummer)) return true
  return false
}

/** Nur persönliche Felder (Leser:in / Bearbeiter:in auf eigener Karte) – ohne Name, Daten, Stammbaum. */
function computeStammdatenDirtyPersoenlich(
  person: K2FamiliePerson,
  f: {
    shortText: string
    photoKind: string
    photoJugend: string
    photoErwachsen: string
    photoAlter: string
    linkFotoalbum: string
    linkWeb: string
    linkYoutube: string
    linkInstagram: string
    kaZeile1: string
    kaZeile2: string
    kaPlz: string
    kaOrt: string
    kaLand: string
    kaEmail: string
    kaTelefon: string
    mitgliedsNummer: string
  },
  photoLegacyCleared: boolean
): boolean {
  const st = f.shortText.trim() || undefined
  if ((person.shortText ?? undefined) !== st) return true
  const ps = (s: string | undefined, form: string) => (s ?? '').trim() === form.trim()
  if (!ps(person.photoKind, f.photoKind)) return true
  if (!ps(person.photoJugend, f.photoJugend)) return true
  if (!ps(person.photoErwachsen, f.photoErwachsen)) return true
  if (!ps(person.photoAlter, f.photoAlter)) return true
  if (!ps(person.linkFotoalbum, f.linkFotoalbum)) return true
  if (!ps(person.linkWeb, f.linkWeb)) return true
  if (!ps(person.linkYoutube, f.linkYoutube)) return true
  if (!ps(person.linkInstagram, f.linkInstagram)) return true
  if (photoLegacyCleared && String(person.photo ?? '').trim()) return true
  const k = person.kontaktAdresse
  const g = (x: string | undefined, form: string) => (x ?? '').trim() === form.trim()
  if (!g(k?.zeile1, f.kaZeile1)) return true
  if (!g(k?.zeile2, f.kaZeile2)) return true
  if (!g(k?.plz, f.kaPlz)) return true
  if (!g(k?.ort, f.kaOrt)) return true
  if (!g(k?.land, f.kaLand)) return true
  if (!g(k?.email, f.kaEmail)) return true
  if (!g(k?.telefon, f.kaTelefon)) return true
  if (trimMitgliedsNummerEingabe(f.mitgliedsNummer) !== trimMitgliedsNummerEingabe(person.mitgliedsNummer)) return true
  return false
}

function kontaktAdresseFromFormValues(f: {
  kaZeile1: string
  kaZeile2: string
  kaPlz: string
  kaOrt: string
  kaLand: string
  kaEmail: string
  kaTelefon: string
}): K2FamiliePerson['kontaktAdresse'] {
  const ku = (s: string) => {
    const t = s.trim()
    return t ? t : undefined
  }
  const o = {
    zeile1: ku(f.kaZeile1),
    zeile2: ku(f.kaZeile2),
    plz: ku(f.kaPlz),
    ort: ku(f.kaOrt),
    land: ku(f.kaLand),
    email: ku(f.kaEmail),
    telefon: ku(f.kaTelefon),
  }
  if (!o.zeile1 && !o.zeile2 && !o.plz && !o.ort && !o.land && !o.email && !o.telefon) return undefined
  return o
}

function personHatKontaktAnzeige(p: K2FamiliePerson | undefined): boolean {
  if (!p?.kontaktAdresse) return false
  const k = p.kontaktAdresse
  return [k.zeile1, k.zeile2, k.plz, k.ort, k.land, k.email, k.telefon].some((x) => (x ?? '').trim().length > 0)
}

const LEBENSPHASEN_FOTO_LABELS: { field: 'photoKind' | 'photoJugend' | 'photoErwachsen' | 'photoAlter'; label: string }[] = [
  { field: 'photoKind', label: 'Kind' },
  { field: 'photoJugend', label: 'Jugendlich' },
  { field: 'photoErwachsen', label: 'Erwachsen' },
  { field: 'photoAlter', label: 'Alter' },
]

const EXTERNE_LINK_FELDER: {
  stateKey: 'linkFotoalbum' | 'linkWeb' | 'linkYoutube' | 'linkInstagram'
  label: string
  placeholder: string
}[] = [
  { stateKey: 'linkFotoalbum', label: 'Fotoalbum', placeholder: 'https://… geteiltes Album' },
  { stateKey: 'linkWeb', label: 'Web / Homepage', placeholder: 'https://…' },
  { stateKey: 'linkYoutube', label: 'YouTube', placeholder: 'https://youtube.com/… oder youtu.be/…' },
  { stateKey: 'linkInstagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
]

export default function K2FamiliePersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannBearbeiten = capabilities.canEditFamiliendaten || capabilities.canEditEigenesProfil
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz
  const kannOrganisch = capabilities.canEditOrganisches
  const [edit, setEdit] = useState(false)
  const einstellungen = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, location.key, familieStorageRevision])
  const istEigeneKarte = Boolean(id && einstellungen.ichBinPersonId === id)
  const rolle = capabilities.rolle
  const effectiveEditPersoenlich = Boolean(edit && istEigeneKarte && (rolle === 'bearbeiter' || rolle === 'leser'))
  const effectiveEditStammdaten = Boolean((edit && kannStruktur) || effectiveEditPersoenlich)
  /** Code: Administrator stellt ihn bereit; das Mitglied trägt ihn auf der eigenen Karte ein. Inhaber:in kann zusätzlich auf anderen Karten pflegen. */
  const canEditPersoenlicherCode = Boolean(effectiveEditStammdaten && (kannInstanz || istEigeneKarte))
  const kannOrganischHier = kannOrganisch || (istEigeneKarte && capabilities.canEditEigenesProfil)
  const feldStrukturNurLesen = Boolean(effectiveEditPersoenlich && !kannStruktur)
  const [personen, setPersonen] = useState<K2FamiliePerson[]>(() => loadPersonen(currentTenantId))
  const [momente, setMomente] = useState<K2FamilieMoment[]>(() => loadMomente(currentTenantId))
  const [name, setName] = useState('')
  const [geburtsdatum, setGeburtsdatum] = useState('')
  const [maedchenname, setMaedchenname] = useState('')
  const [shortText, setShortText] = useState('')
  const [verstorben, setVerstorben] = useState(false)
  const [verstorbenAm, setVerstorbenAm] = useState('')
  const [editingMomentId, setEditingMomentId] = useState<string | 'new' | null>(null)
  const [momentTitle, setMomentTitle] = useState('')
  const [momentDate, setMomentDate] = useState('')
  const [momentImage, setMomentImage] = useState('')
  const [momentText, setMomentText] = useState('')
  const [beitraege, setBeitraege] = useState<K2FamilieBeitrag[]>(() => loadBeitraege(currentTenantId))
  const [beitragModal, setBeitragModal] = useState(false)
  const [beitragArt, setBeitragArt] = useState<K2FamilieBeitrag['art']>('erinnerung')
  const [beitragInhalt, setBeitragInhalt] = useState('')
  const [beitragVonWem, setBeitragVonWem] = useState('')
  const [positionAmongSiblingsInput, setPositionAmongSiblingsInput] = useState<string>('')
  const [photoKind, setPhotoKind] = useState('')
  const [photoJugend, setPhotoJugend] = useState('')
  const [photoErwachsen, setPhotoErwachsen] = useState('')
  const [photoAlter, setPhotoAlter] = useState('')
  const [linkFotoalbum, setLinkFotoalbum] = useState('')
  const [linkWeb, setLinkWeb] = useState('')
  const [linkYoutube, setLinkYoutube] = useState('')
  const [linkInstagram, setLinkInstagram] = useState('')
  const [kaZeile1, setKaZeile1] = useState('')
  const [kaZeile2, setKaZeile2] = useState('')
  const [kaPlz, setKaPlz] = useState('')
  const [kaOrt, setKaOrt] = useState('')
  const [kaLand, setKaLand] = useState('')
  const [kaEmail, setKaEmail] = useState('')
  const [kaTelefon, setKaTelefon] = useState('')
  const [mitgliedsNummer, setMitgliedsNummer] = useState('')
  /** Eigene Karte: Klartext in den vier Plätzen nur nach „Code ändern“; nach Speichern wieder ausgeblendet. */
  const [persCodeUnlocked, setPersCodeUnlocked] = useState(false)
  const [kontaktAdresseOpen, setKontaktAdresseOpen] = useState(false)
  /** Im Bearbeiten: altes Einzelfeld `photo` entfernen, obwohl es noch in `person` steht (bis Speichern). */
  const [photoLegacyCleared, setPhotoLegacyCleared] = useState(false)
  const [fotoMenu, setFotoMenu] = useState<{ x: number; y: number; kind: 'haupt' | LebensphaseFotoFeld } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileTargetRef = useRef<LebensphaseFotoFeld | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [beziehungenFokusHighlight, setBeziehungenFokusHighlight] = useState(false)
  const [stammdatenHauptOpen, setStammdatenHauptOpen] = useState(true)
  const [beziehungenOpen, setBeziehungenOpen] = useState(false)
  const [momenteOpen, setMomenteOpen] = useState(false)
  const [erinnerungenOpen, setErinnerungenOpen] = useState(false)

  const person = personen.find((p) => p.id === id)
  const rawSavedPersCode = trimMitgliedsNummerEingabe(person?.mitgliedsNummer ?? '')
  /** Gespeicherter Code: nirgends Klartext in den vier Feldern, bis „Code anzeigen“ / „Code ändern“ (auch wenn ichBinPersonId noch nicht gesetzt ist). */
  const maskPersCodeKlartext = Boolean(rawSavedPersCode && !persCodeUnlocked)
  /** Eigene Karte oder Inhaber:in: Code einblenden dürfen auch ohne aktives Stammdaten-Bearbeiten (Leser, nur Ansicht). */
  const kannPersCodeKlartextEinblenden = Boolean(kannInstanz || istEigeneKarte)
  const graphDistanceFromDu = useMemo(() => {
    if (!id) return null
    return getGraphDistanceFromIch(personen, einstellungen.ichBinPersonId, id)
  }, [personen, einstellungen.ichBinPersonId, id])
  const portraitGroessePx = useMemo(
    () => portraitSizeFromGraphDistance(graphDistanceFromDu),
    [graphDistanceFromDu]
  )
  const ichBinAndererName = useMemo(() => {
    const pid = einstellungen.ichBinPersonId?.trim()
    if (!pid) return ''
    return personen.find((p) => p.id === pid)?.name?.trim() ?? ''
  }, [einstellungen.ichBinPersonId, personen])

  const handleSetDasBinIch = useCallback(() => {
    if (!kannStruktur || !id || !person) return
    const pos = person.name?.match(/^(?:Geschwister|Kind)\s+(\d+)$/i)?.[1]
    const einst = loadEinstellungen(currentTenantId)
    const ichBinPositionAmongSiblings = pos ? parseInt(pos, 10) : einst.ichBinPositionAmongSiblings
    let changed = saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: id, ichBinPositionAmongSiblings })
    const posNum =
      ichBinPositionAmongSiblings != null && ichBinPositionAmongSiblings >= 1 && ichBinPositionAmongSiblings <= 99
        ? ichBinPositionAmongSiblings
        : (person.positionAmongSiblings ?? null)
    if (posNum != null) {
      const updated = personen.map((x) => (x.id === id ? { ...x, positionAmongSiblings: posNum } : x))
      if (savePersonen(currentTenantId, updated, { allowReduce: false })) changed = true
    }
    if (changed) {
      setIdentitaetBestaetigt(currentTenantId, id)
    }
  }, [kannStruktur, id, person, currentTenantId, personen])

  const beziehungenKurz = useMemo(() => {
    if (!id) return { eltern: [] as K2FamiliePerson[], geschwister: [] as K2FamiliePerson[] }
    const b = getBeziehungenFromKarten(personen, id)
    const geschwister = getGeschwisterAnzeigeListe(personen, id)
    return { eltern: b.eltern, geschwister }
  }, [personen, id])
  const geschwisterAusElternIds = useMemo(
    () => (id ? getGeschwisterIdsAusEltern(personen, id) : new Set<string>()),
    [personen, id]
  )
  const fokusParam = searchParams.get('fokus')
  useEffect(() => {
    setPersCodeUnlocked(false)
  }, [id])

  useEffect(() => {
    if (!person || fokusParam !== 'beziehungen') return
    setStammdatenHauptOpen(true)
    setBeziehungenOpen(true)
    requestAnimationFrame(() => {
      document.getElementById('k2-familie-beziehungen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setBeziehungenFokusHighlight(true)
      window.setTimeout(() => setBeziehungenFokusHighlight(false), 2600)
    })
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('fokus')
        return next
      },
      { replace: true }
    )
  }, [person?.id, fokusParam, person, setSearchParams])

  useEffect(() => {
    if (kannBearbeiten) return
    setEdit(false)
    setEditingMomentId(null)
    setBeitragModal(false)
    setShowDeleteConfirm(false)
  }, [kannBearbeiten])

  useEffect(() => {
    if (kannStruktur) return
    if (istEigeneKarte && (rolle === 'bearbeiter' || rolle === 'leser')) return
    setEdit(false)
  }, [kannStruktur, istEigeneKarte, rolle])

  useEffect(() => {
    if (kannOrganischHier) return
    setEditingMomentId(null)
    setBeitragModal(false)
  }, [kannOrganischHier])

  useEffect(() => {
    setPersonen(loadPersonen(currentTenantId))
    setMomente(loadMomente(currentTenantId))
    setBeitraege(loadBeitraege(currentTenantId))
  }, [id, currentTenantId, familieStorageRevision])

  useEffect(() => {
    if (person) {
      setName(person.name)
      setGeburtsdatum(person.geburtsdatum?.slice(0, 10) ?? '')
      setMaedchenname(person.maedchenname ?? '')
      setShortText(person.shortText ?? '')
      setVerstorben(person.verstorben === true)
      setVerstorbenAm(person.verstorbenAm?.slice(0, 10) ?? '')
      setPositionAmongSiblingsInput(person.positionAmongSiblings != null ? String(person.positionAmongSiblings) : '')
      setPhotoKind(person.photoKind ?? '')
      setPhotoJugend(person.photoJugend ?? '')
      setPhotoErwachsen(person.photoErwachsen ?? '')
      setPhotoAlter(person.photoAlter ?? '')
      setLinkFotoalbum(person.linkFotoalbum ?? '')
      setLinkWeb(person.linkWeb ?? '')
      setLinkYoutube(person.linkYoutube ?? '')
      setLinkInstagram(person.linkInstagram ?? '')
      const ka = person.kontaktAdresse
      setKaZeile1(ka?.zeile1 ?? '')
      setKaZeile2(ka?.zeile2 ?? '')
      setKaPlz(ka?.plz ?? '')
      setKaOrt(ka?.ort ?? '')
      setKaLand(ka?.land ?? '')
      setKaEmail(ka?.email ?? '')
      setKaTelefon(ka?.telefon ?? '')
      setMitgliedsNummer(person.mitgliedsNummer ?? '')
      setPhotoLegacyCleared(false)
      // Neue Person (gerade angelegt): sofort Bearbeiten öffnen, damit Name getippt werden kann – keine Kontakt-Vorschläge
      if (person.name === 'Neue Person' && kannStruktur) setEdit(true)
    }
  }, [person, kannStruktur])

  const stammdatenDirty = useMemo(
    () => {
      if (!person || !effectiveEditStammdaten) return false
      if (effectiveEditPersoenlich && !kannStruktur) {
        return computeStammdatenDirtyPersoenlich(
          person,
          {
            shortText,
            photoKind,
            photoJugend,
            photoErwachsen,
            photoAlter,
            linkFotoalbum,
            linkWeb,
            linkYoutube,
            linkInstagram,
            kaZeile1,
            kaZeile2,
            kaPlz,
            kaOrt,
            kaLand,
            kaEmail,
            kaTelefon,
            mitgliedsNummer,
          },
          photoLegacyCleared
        )
      }
      return computeStammdatenDirty(
        person,
        {
          name,
          geburtsdatum,
          maedchenname,
          shortText,
          verstorben,
          verstorbenAm,
          positionAmongSiblingsInput,
          photoKind,
          photoJugend,
          photoErwachsen,
          photoAlter,
          linkFotoalbum,
          linkWeb,
          linkYoutube,
          linkInstagram,
          kaZeile1,
          kaZeile2,
          kaPlz,
          kaOrt,
          kaLand,
          kaEmail,
          kaTelefon,
          mitgliedsNummer,
        },
        photoLegacyCleared
      )
    },
    [
      person,
      effectiveEditStammdaten,
      effectiveEditPersoenlich,
      kannStruktur,
      name,
      geburtsdatum,
      maedchenname,
      shortText,
      verstorben,
      verstorbenAm,
      positionAmongSiblingsInput,
      photoKind,
      photoJugend,
      photoErwachsen,
      photoAlter,
      linkFotoalbum,
      linkWeb,
      linkYoutube,
      linkInstagram,
      kaZeile1,
      kaZeile2,
      kaPlz,
      kaOrt,
      kaLand,
      kaEmail,
      kaTelefon,
      mitgliedsNummer,
      photoLegacyCleared,
    ]
  )

  useEffect(() => {
    if (!stammdatenDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [stammdatenDirty])

  const save = () => {
    if (!person) return
    if (effectiveEditPersoenlich && !kannStruktur) {
      const mNext = trimMitgliedsNummerEingabe(mitgliedsNummer)
      if (mNext) {
        const conflict = personen.find(
          (p) =>
            p.id !== id &&
            trimMitgliedsNummerEingabe(p.mitgliedsNummer).toLowerCase() === mNext.toLowerCase()
        )
        if (conflict) {
          window.alert(`Dieser Personencode ist bereits bei ${conflict.name} eingetragen.`)
          return
        }
      }
      const pk = photoKind.trim() || undefined
      const pj = photoJugend.trim() || undefined
      const pe = photoErwachsen.trim() || undefined
      const pa = photoAlter.trim() || undefined
      const fotoAktuell = getAktuellesPersonenFoto({
        ...person,
        photoKind: pk,
        photoJugend: pj,
        photoErwachsen: pe,
        photoAlter: pa,
        photo: photoLegacyCleared ? undefined : person.photo,
      })
      const updated: K2FamiliePerson = {
        ...person,
        shortText: shortText.trim() || undefined,
        mitgliedsNummer: mNext || undefined,
        photoKind: pk,
        photoJugend: pj,
        photoErwachsen: pe,
        photoAlter: pa,
        linkFotoalbum: linkFotoalbum.trim() || undefined,
        linkWeb: linkWeb.trim() || undefined,
        linkYoutube: linkYoutube.trim() || undefined,
        linkInstagram: linkInstagram.trim() || undefined,
        kontaktAdresse: kontaktAdresseFromFormValues({
          kaZeile1,
          kaZeile2,
          kaPlz,
          kaOrt,
          kaLand,
          kaEmail,
          kaTelefon,
        }),
        photo: fotoAktuell,
        updatedAt: new Date().toISOString(),
      }
      const next = personen.map((p) => (p.id === id ? updated : p))
      if (savePersonen(currentTenantId, next, { allowReduce: false })) {
        setPersonen(next)
        setEdit(false)
        setPersCodeUnlocked(false)
      }
      return
    }
    if (!kannStruktur) return
    if (istFamilieDatumUngueltig(geburtsdatum)) {
      window.alert('Geburtsdatum ist ungültig – bitte Tag, Monat und Jahr vollständig wählen oder alles leer lassen.')
      return
    }
    if (verstorben && verstorbenAm.trim() && istFamilieDatumUngueltig(verstorbenAm)) {
      window.alert('Sterbedatum ist ungültig – bitte Tag, Monat und Jahr vollständig wählen oder Feld leer lassen.')
      return
    }
    const mNext = trimMitgliedsNummerEingabe(mitgliedsNummer)
    const persistMitgliedsNummer = kannInstanz || istEigeneKarte
    if (persistMitgliedsNummer && mNext) {
      const conflict = personen.find(
        (p) =>
          p.id !== id &&
          trimMitgliedsNummerEingabe(p.mitgliedsNummer).toLowerCase() === mNext.toLowerCase()
      )
      if (conflict) {
        window.alert(`Dieser Personencode ist bereits bei ${conflict.name} eingetragen.`)
        return
      }
    }
    const posNum = positionAmongSiblingsInput.trim() === '' ? undefined : parseInt(positionAmongSiblingsInput.trim(), 10)
    const positionAmongSiblings = posNum != null && !Number.isNaN(posNum) && posNum >= 1 ? posNum : undefined
    const gdNorm = normalizeFamilieDatum(geburtsdatum)
    const vsNorm = verstorben && verstorbenAm.trim() ? normalizeFamilieDatum(verstorbenAm) : undefined
    const pk = photoKind.trim() || undefined
    const pj = photoJugend.trim() || undefined
    const pe = photoErwachsen.trim() || undefined
    const pa = photoAlter.trim() || undefined
    const fotoAktuell = getAktuellesPersonenFoto({
      ...person,
      photoKind: pk,
      photoJugend: pj,
      photoErwachsen: pe,
      photoAlter: pa,
      photo: photoLegacyCleared ? undefined : person.photo,
    })
    const updated: K2FamiliePerson = {
      ...person,
      name: name.trim() || person.name,
      geburtsdatum: gdNorm,
      maedchenname: maedchenname.trim() || undefined,
      shortText: shortText.trim() || undefined,
      verstorben: verstorben || undefined,
      verstorbenAm: vsNorm,
      positionAmongSiblings,
      ...(persistMitgliedsNummer ? { mitgliedsNummer: mNext || undefined } : {}),
      photoKind: pk,
      photoJugend: pj,
      photoErwachsen: pe,
      photoAlter: pa,
      linkFotoalbum: linkFotoalbum.trim() || undefined,
      linkWeb: linkWeb.trim() || undefined,
      linkYoutube: linkYoutube.trim() || undefined,
      linkInstagram: linkInstagram.trim() || undefined,
      kontaktAdresse: kontaktAdresseFromFormValues({
        kaZeile1,
        kaZeile2,
        kaPlz,
        kaOrt,
        kaLand,
        kaEmail,
        kaTelefon,
      }),
      photo: fotoAktuell,
      updatedAt: new Date().toISOString(),
    }
    const next = personen.map((p) => (p.id === id ? updated : p))
    if (savePersonen(currentTenantId, next, { allowReduce: false })) {
      setPersonen(next)
      setEdit(false)
      setPersCodeUnlocked(false)
    }
  }

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId
  const otherPersonen = personen.filter((p) => p.id !== id)

  /** Kandidat passt logisch nicht zu dieser Beziehung (z. B. Eltern können keine Partner sein). */
  const impossibleForRelation = (type: 'parent' | 'child' | 'partner' | 'wahlfamilie', p: K2FamiliePerson): boolean => {
    if (!person) return false
    if (type === 'partner') return person.parentIds.includes(p.id) || person.childIds.includes(p.id)
    if (type === 'parent') return person.childIds.includes(p.id)
    if (type === 'child') return person.parentIds.includes(p.id)
    return false
  }

  /** Für Beziehungs-Dropdowns: nur sinnvolle Kandidaten, naheliegende zuerst (z. B. gleiche Eltern = Geschwister, gemeinsame Kinder = Partner). */
  const getCandidatesOrdered = (
    type: 'parent' | 'child' | 'partner' | 'wahlfamilie',
    excludeIds: string[]
  ): { suggested: K2FamiliePerson[]; rest: K2FamiliePerson[] } => {
    if (!person) return { suggested: [], rest: [] }
    const pool = otherPersonen
      .filter((p) => !excludeIds.includes(p.id))
      .filter((p) => !impossibleForRelation(type, p))
    const byId = new Map(personen.map((p) => [p.id, p]))
    if (type === 'parent') {
      const siblingParentIds = new Set<string>()
      person.siblingIds.forEach((sid) => {
        byId.get(sid)?.parentIds.forEach((pid) => siblingParentIds.add(pid))
      })
      const suggested = pool.filter((p) => siblingParentIds.has(p.id))
      const rest = pool.filter((p) => !siblingParentIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    if (type === 'child') {
      const partnerChildIds = new Set<string>()
      person.partners.forEach((pr) => {
        byId.get(pr.personId)?.childIds.forEach((cid) => partnerChildIds.add(cid))
      })
      const suggested = pool.filter((p) => partnerChildIds.has(p.id))
      const rest = pool.filter((p) => !partnerChildIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    if (type === 'partner') {
      const coParentIds = new Set<string>()
      person.childIds.forEach((cid) => {
        byId.get(cid)?.parentIds.forEach((pid) => { if (pid !== id) coParentIds.add(pid) })
      })
      const suggested = pool.filter((p) => coParentIds.has(p.id))
      const rest = pool.filter((p) => !coParentIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    if (type === 'wahlfamilie') {
      const partnerAndSiblingIds = new Set([
        ...person.partners.map((pr) => pr.personId),
        ...person.siblingIds,
        ...Array.from(getGeschwisterIdsAusEltern(personen, person.id)),
      ])
      const suggested = pool.filter((p) => partnerAndSiblingIds.has(p.id))
      const rest = pool.filter((p) => !partnerAndSiblingIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    return { suggested: [], rest: pool.sort((a, b) => a.name.localeCompare(b.name)) }
  }

  const updateAndSave = (next: K2FamiliePerson[]) => {
    if (!kannStruktur) return
    if (savePersonen(currentTenantId, next, { allowReduce: false })) setPersonen(next)
  }

  const addParent = (otherId: string) => {
    if (!id || !person || person.parentIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, parentIds: [...p.parentIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, childIds: [...p.childIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeParent = (otherId: string) => {
    if (!id || !person) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, parentIds: p.parentIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, childIds: p.childIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addChild = (otherId: string) => {
    if (!id || !person || person.childIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, childIds: [...p.childIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, parentIds: [...p.parentIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeChild = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, childIds: p.childIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, parentIds: p.parentIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addPartner = (otherId: string) => {
    if (!id || !person || person.partners.some((pr) => pr.personId === otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const entry = { personId: otherId, from: null as string | null, to: null as string | null }
    const entryOther = { personId: id, from: null as string | null, to: null as string | null }
    const next = personen.map((p) => {
      if (p.id === id) return { ...p, partners: [...p.partners, entry], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, partners: [...p.partners, entryOther], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removePartner = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, partners: p.partners.filter((pr) => pr.personId !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, partners: p.partners.filter((pr) => pr.personId !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  /**
   * Neue Person anlegen, symmetrisch verknüpfen wie addParent/addChild/…, speichern, zur neuen Person navigieren.
   */
  const createNewPersonAndLink = (relationType: 'parent' | 'child' | 'partner' | 'wahlfamilie') => {
    if (!id || !person || !kannStruktur) return
    if (einstellungen.stammbaumSchlusspunkt) return
    const newId = generatePersonId()
    const now = new Date().toISOString()
    const empty: K2FamiliePerson = {
      id: newId,
      name: 'Neue Person',
      parentIds: [],
      childIds: [],
      partners: [],
      siblingIds: [],
      wahlfamilieIds: [],
      updatedAt: now,
    }
    let withNew: K2FamiliePerson[]
    if (relationType === 'parent') {
      const neu = { ...empty, childIds: [id] }
      withNew = [
        ...personen.map((p) =>
          p.id === id ? { ...p, parentIds: [...p.parentIds, newId], updatedAt: now } : p
        ),
        neu,
      ]
    } else if (relationType === 'child') {
      const neu = { ...empty, parentIds: [id] }
      withNew = [
        ...personen.map((p) =>
          p.id === id ? { ...p, childIds: [...p.childIds, newId], updatedAt: now } : p
        ),
        neu,
      ]
    } else if (relationType === 'partner') {
      const entry = { personId: newId, from: null as string | null, to: null as string | null }
      const entryOther = { personId: id, from: null as string | null, to: null as string | null }
      const neu = { ...empty, partners: [entryOther] }
      withNew = [
        ...personen.map((p) =>
          p.id === id ? { ...p, partners: [...p.partners, entry], updatedAt: now } : p
        ),
        neu,
      ]
    } else {
      const neu = { ...empty, wahlfamilieIds: [id] }
      withNew = [
        ...personen.map((p) =>
          p.id === id ? { ...p, wahlfamilieIds: [...p.wahlfamilieIds, newId], updatedAt: now } : p
        ),
        neu,
      ]
    }
    if (savePersonen(currentTenantId, withNew, { allowReduce: false })) {
      setPersonen(withNew)
      navigate(`${PROJECT_ROUTES['k2-familie'].personen}/${newId}`, {
        state: { familieZurueckZu: { id, name: person.name } },
      })
    }
  }

  const removeSibling = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, siblingIds: p.siblingIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, siblingIds: p.siblingIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addWahlfamilie = (otherId: string) => {
    if (!id || !person || person.wahlfamilieIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, wahlfamilieIds: [...p.wahlfamilieIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, wahlfamilieIds: [...p.wahlfamilieIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeWahlfamilie = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, wahlfamilieIds: p.wahlfamilieIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, wahlfamilieIds: p.wahlfamilieIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const personMomente = id ? momente.filter((m) => m.personId === id) : []
  const openNewMoment = () => {
    setStammdatenHauptOpen(true)
    setMomenteOpen(true)
    setEditingMomentId('new')
    setMomentTitle('')
    setMomentDate('')
    setMomentImage('')
    setMomentText('')
  }
  const openEditMoment = (m: K2FamilieMoment) => {
    setStammdatenHauptOpen(true)
    setMomenteOpen(true)
    setEditingMomentId(m.id)
    setMomentTitle(m.title)
    setMomentDate(m.date ? m.date.slice(0, 10) : '')
    setMomentImage(m.image ?? '')
    setMomentText(m.text ?? '')
  }
  const saveMoment = () => {
    if (!id || !kannOrganischHier) return
    if (momentDate.trim() && istFamilieDatumUngueltig(momentDate)) {
      window.alert('Moment-Datum: bitte als JJJJ-MM-TT oder TT.MM.JJJJ eingeben – oder leer lassen.')
      return
    }
    const momentDateNorm = momentDate.trim() ? normalizeFamilieDatum(momentDate) ?? null : null
    const now = new Date().toISOString()
    if (editingMomentId === 'new') {
      const newM: K2FamilieMoment = {
        id: 'moment-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
        personId: id,
        title: momentTitle.trim() || 'Ohne Titel',
        date: momentDateNorm,
        image: momentImage.trim() || undefined,
        text: momentText.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      const next = [...momente, newM]
      if (saveMomente(currentTenantId, next)) {
        setMomente(next)
        setEditingMomentId(null)
      }
    } else if (editingMomentId) {
      const next = momente.map((m) =>
        m.id === editingMomentId
          ? {
              ...m,
              title: momentTitle.trim() || m.title,
              date: momentDateNorm,
              image: momentImage.trim() || undefined,
              text: momentText.trim() || undefined,
              updatedAt: now,
            }
          : m
      )
      if (saveMomente(currentTenantId, next)) {
        setMomente(next)
        setEditingMomentId(null)
      }
    }
  }
  const deleteMoment = (momentId: string) => {
    if (!kannOrganischHier) return
    const next = momente.filter((m) => m.id !== momentId)
    if (saveMomente(currentTenantId, next, { allowReduce: true })) setMomente(next)
    if (editingMomentId === momentId) setEditingMomentId(null)
  }

  const personBeitraege = id ? beitraege.filter((b) => b.personId === id) : []
  const openBeitragModal = () => {
    setStammdatenHauptOpen(true)
    setErinnerungenOpen(true)
    setBeitragArt('erinnerung')
    setBeitragInhalt('')
    setBeitragVonWem('')
    setBeitragModal(true)
  }
  const saveBeitrag = () => {
    if (!id || !beitragInhalt.trim() || !kannOrganischHier) return
    const newB: K2FamilieBeitrag = {
      id: 'beitrag-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      personId: id,
      art: beitragArt,
      inhalt: beitragInhalt.trim(),
      vonWem: beitragVonWem.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    const next = [...beitraege, newB]
    if (saveBeitraege(currentTenantId, next)) {
      setBeitraege(next)
      setBeitragModal(false)
    }
  }
  const deleteBeitrag = (beitragId: string) => {
    if (!kannOrganischHier) return
    const next = beitraege.filter((b) => b.id !== beitragId)
    if (saveBeitraege(currentTenantId, next)) setBeitraege(next)
  }
  const artLabel: Record<K2FamilieBeitrag['art'], string> = {
    erinnerung: 'Erinnerung',
    korrektur: 'Korrektur',
    foto: 'Foto',
    geschichte: 'Geschichte',
    datum: 'Datum',
  }

  if (!id) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page">
          <div className="card"><p className="meta" style={{ margin: 0 }}>Person nicht gefunden.</p></div>
        </div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page">
          <header><Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="meta">← Stammbaum</Link></header>
          <div className="card"><p className="meta" style={{ margin: 0 }}>Person mit dieser ID nicht gefunden.</p></div>
        </div>
      </div>
    )
  }

  const familieZurueckZu = (location.state as { familieZurueckZu?: { id: string; name: string } } | null | undefined)
    ?.familieZurueckZu

  const smallBtn = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.4rem', fontFamily: 'inherit' } as const
  type RelationType = 'parent' | 'child' | 'partner' | 'wahlfamilie'
  const newPersonButtonLabels: Record<RelationType, string> = {
    parent: '＋ Neu als Elternteil',
    child: '＋ Neu als Kind',
    partner: '＋ Neu als Partner*in',
    wahlfamilie: '＋ Neu Wahlfamilie',
  }
  /**
   * Eltern/Kinder: volle Auswahl (naheliegend + weitere) – oft mehrere sinnvolle Personen.
   * Partner, Wahlfamilie: nur Dropdown, wenn genau eine Person eindeutig passt (keine lange irritierende Liste).
   */
  const getAddSelectUI = (type: RelationType, excludeIds: string[], addFn: (oid: string) => void): { select: ReactNode } => {
    const { suggested, rest } = getCandidatesOrdered(type, excludeIds)
    const hasAny = suggested.length + rest.length > 0
    if (!hasAny) return { select: null }

    const fullList = type === 'parent' || type === 'child'
    if (fullList) {
      return {
        select: (
          <select className="field" value="" onChange={(e) => { const v = e.target.value; if (v) { addFn(v); e.target.value = ''; } }} style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }} aria-label="Person hinzufügen">
            <option value="">Person wählen …</option>
            {suggested.length > 0 && (
              <optgroup label="Naheliegend (z. B. gleiche Eltern, gemeinsame Kinder)">
                {suggested.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            )}
            {rest.length > 0 && (
              <optgroup label={suggested.length > 0 ? 'Weitere' : 'Person wählen'}>
                {rest.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        ),
      }
    }

    const unique: K2FamiliePerson | null =
      suggested.length === 1
        ? suggested[0]
        : suggested.length === 0 && rest.length === 1
          ? rest[0]
          : null
    if (!unique) return { select: null }
    return {
      select: (
        <select className="field" value="" onChange={(e) => { const v = e.target.value; if (v) { addFn(v); e.target.value = ''; } }} style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }} aria-label="Eindeutiger Vorschlag zum Verknüpfen">
          <option value="">Vorschlag wählen …</option>
          <option value={unique.id}>{unique.name}</option>
        </select>
      ),
    }
  }
  const newPersonBtnStyle = { fontSize: '0.9rem', padding: '0.35rem 0.5rem' } as const
  const row = (
    label: string,
    ids: string[],
    addFn: (oid: string) => void,
    removeFn: (oid: string) => void,
    getIds: () => string[],
    relationType: RelationType
  ) => {
    const { select } = getAddSelectUI(relationType, getIds(), addFn)
    return (
      <div key={label} className="field" style={{ marginBottom: '1rem' }}>
        <label className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>{label}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          {ids.map((pid) => (
            <span key={pid} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(13,148,136,0.15)', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
              <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>{getPersonName(pid)}</Link>
              {kannStruktur && (
              <button type="button" onClick={() => removeFn(pid)} style={smallBtn} title="Entfernen">✕</button>
              )}
            </span>
          ))}
          {kannStruktur && select}
          {!einstellungen.stammbaumSchlusspunkt && kannStruktur && (
            <button type="button" className="btn-outline" onClick={() => createNewPersonAndLink(relationType)} style={newPersonBtnStyle}>
              {newPersonButtonLabels[relationType]}
            </button>
          )}
        </div>
      </div>
    )
  }

  const partnerExcludeIds = person.partners.map((pr) => pr.personId)
  const { select: partnerAddSelect } = getAddSelectUI('partner', partnerExcludeIds, addPartner)

  const aktuellFotoSrc = useMemo(() => {
    if (!person) return undefined
    if (effectiveEditStammdaten) {
      return getAktuellesPersonenFoto({
        ...person,
        photoKind: photoKind.trim() || undefined,
        photoJugend: photoJugend.trim() || undefined,
        photoErwachsen: photoErwachsen.trim() || undefined,
        photoAlter: photoAlter.trim() || undefined,
        photo: photoLegacyCleared ? undefined : person.photo,
      })
    }
    return getAktuellesPersonenFoto(person)
  }, [person, effectiveEditStammdaten, photoKind, photoJugend, photoErwachsen, photoAlter, photoLegacyCleared])

  const phaseThumbUrl = (
    field: 'photoKind' | 'photoJugend' | 'photoErwachsen' | 'photoAlter'
  ): string | undefined => {
    if (effectiveEditStammdaten) {
      const raw =
        field === 'photoKind'
          ? photoKind
          : field === 'photoJugend'
            ? photoJugend
            : field === 'photoErwachsen'
              ? photoErwachsen
              : photoAlter
      const t = raw.trim()
      return t || undefined
    }
    return person[field]?.trim() || undefined
  }

  const mergedForFoto = useMemo(() => {
    if (!person) return null
    return {
      ...person,
      photoKind: photoKind.trim() || undefined,
      photoJugend: photoJugend.trim() || undefined,
      photoErwachsen: photoErwachsen.trim() || undefined,
      photoAlter: photoAlter.trim() || undefined,
      photo: photoLegacyCleared ? undefined : person.photo,
    }
  }, [person, photoKind, photoJugend, photoErwachsen, photoAlter, photoLegacyCleared])

  const resolveTargetForHaupt = (): LebensphaseFotoFeld => {
    if (!mergedForFoto) return DEFAULT_LEBENSPHASE_NEUES_FOTO
    const f = getLebensphaseFeldFuerAktuellesFoto(mergedForFoto)
    if (f === 'legacy') return DEFAULT_LEBENSPHASE_NEUES_FOTO
    return f
  }

  const applyDataUrlToField = (field: LebensphaseFotoFeld, dataUrl: string) => {
    setPhotoLegacyCleared(false)
    if (field === 'photoKind') setPhotoKind(dataUrl)
    else if (field === 'photoJugend') setPhotoJugend(dataUrl)
    else if (field === 'photoErwachsen') setPhotoErwachsen(dataUrl)
    else setPhotoAlter(dataUrl)
  }

  const applyClearField = (kind: 'haupt' | LebensphaseFotoFeld) => {
    if (kind !== 'haupt') {
      if (kind === 'photoKind') setPhotoKind('')
      else if (kind === 'photoJugend') setPhotoJugend('')
      else if (kind === 'photoErwachsen') setPhotoErwachsen('')
      else setPhotoAlter('')
      setPhotoLegacyCleared(false)
      return
    }
    if (!mergedForFoto) return
    const f = getLebensphaseFeldFuerAktuellesFoto(mergedForFoto)
    if (f === 'legacy') {
      setPhotoLegacyCleared(true)
    } else {
      applyClearField(f)
    }
  }

  const openFilePicker = (field: LebensphaseFotoFeld) => {
    fileTargetRef.current = field
    fileInputRef.current?.click()
  }

  const openFotoHttpExternal = (url: string | undefined) => {
    if (!isHttpUrlForExternalOpen(url)) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const onFotoFileChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    const target = fileTargetRef.current
    fileTargetRef.current = null
    if (!file?.type.startsWith('image/') || !target) return
    try {
      const dataUrl = await compressImageForStorage(file, { context: 'desktop' })
      applyDataUrlToField(target, dataUrl)
    } catch (err) {
      console.warn(err)
      window.alert('Bild konnte nicht verarbeitet werden.')
    }
  }

  useEffect(() => {
    if (!fotoMenu) return
    const close = (ev?: MouseEvent) => {
      if (ev?.target && (ev.target as HTMLElement).closest?.('.k2-familie-foto-menu')) return
      setFotoMenu(null)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setFotoMenu(null)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [fotoMenu])

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            {familieZurueckZu && (
              <p className="meta" style={{ margin: '0.35rem 0 0' }}>
                <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${familieZurueckZu.id}`} className="meta">
                  ← Zurück zu {familieZurueckZu.name}
                </Link>
              </p>
            )}
            <h1 style={{ marginTop: '0.5rem' }}>{person.name}</h1>
            {person.updatedAt && (
              <p className="meta" style={{ marginTop: '0.35rem', color: 'rgba(20,184,166,0.95)' }}>
                Zuletzt gespeichert: {formatZuletztGespeichert(person.updatedAt)}
              </p>
            )}
            {person.verstorben && <div className="meta" style={{ marginTop: '0.25rem' }}>† {person.verstorbenAm || '–'}</div>}
            {person.shortText && <div className="meta" style={{ marginTop: '0.25rem' }}>{person.shortText}</div>}
          </div>
        </header>

        {(istEigeneKarte || kannInstanz) && (
          <section
            id="k2-familie-person-persoenlicher-code"
            className="card familie-card-enter"
            style={{ marginTop: '1rem', padding: '0.85rem 1rem' }}
            aria-labelledby="k2-familie-pers-code-heading"
          >
            <h2
              id="k2-familie-pers-code-heading"
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'rgba(94, 234, 212, 0.98)',
                letterSpacing: '0.02em',
              }}
            >
              Persönlicher Code
            </h2>
            <p id="k2-familie-pers-code-hint" className="meta" style={{ margin: '0.35rem 0 0.65rem', lineHeight: 1.45, fontSize: '0.82rem' }}>
              Die Verwaltung teilt den Code mit; er ist der <strong>Schlüssel</strong> zum persönlichen Bereich und die <strong>erste Identifikation</strong> beim Eintritt.
            </p>
            <div className="field" style={{ marginBottom: 0 }}>
              <FamiliePersoenlicherCodeFelder
                idPrefix="k2-familie-pers-code"
                value={canEditPersoenlicherCode ? mitgliedsNummer : person.mitgliedsNummer ?? ''}
                onChange={setMitgliedsNummer}
                readOnly={!canEditPersoenlicherCode}
                maskClearText={maskPersCodeKlartext}
                onEntsperrenPersCode={
                  maskPersCodeKlartext && kannPersCodeKlartextEinblenden ? () => setPersCodeUnlocked(true) : undefined
                }
                entsperrenButtonLabel={canEditPersoenlicherCode ? 'Code ändern' : 'Code anzeigen'}
                ariaLabelledBy="k2-familie-pers-code-heading"
                ariaDescribedBy="k2-familie-pers-code-hint"
              />
            </div>
            {persCodeUnlocked && kannPersCodeKlartextEinblenden ? (
              <div style={{ marginTop: '0.65rem' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => {
                    if (
                      canEditPersoenlicherCode &&
                      trimMitgliedsNummerEingabe(mitgliedsNummer) !== trimMitgliedsNummerEingabe(person.mitgliedsNummer ?? '')
                    ) {
                      if (!window.confirm('Ungespeicherte Änderungen am Code verwerfen und wieder ausblenden?')) return
                    }
                    setMitgliedsNummer(person.mitgliedsNummer ?? '')
                    setPersCodeUnlocked(false)
                  }}
                >
                  Code wieder ausblenden
                </button>
              </div>
            ) : null}
          </section>
        )}

        <details
          id="k2-familie-person-stammdaten"
          className="card familie-card-enter k2-familie-haupt-details-block"
          open={stammdatenHauptOpen}
          onToggle={(e) => setStammdatenHauptOpen((e.target as HTMLDetailsElement).open)}
          style={{ marginTop: '1rem' }}
        >
          <summary className="k2-familie-haupt-summary">Stammdaten</summary>
          <div className="k2-familie-haupt-inner">
            {(istEigeneKarte || einstellungen.ichBinPersonId || (kannStruktur && person)) && (
              <div
                style={{
                  marginBottom: '0.85rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(20,184,166,0.35)',
                }}
              >
                {istEigeneKarte ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: 'rgba(94, 234, 212, 0.98)',
                        fontSize: '0.95rem',
                      }}
                    >
                      ✓ Das bin ich
                    </span>
                    <span className="meta" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                      Diese Karte ist als „du“ gesetzt (Stammbaum, Sortierung, Einladung).
                    </span>
                  </div>
                ) : (
                  <>
                    {einstellungen.ichBinPersonId && ichBinAndererName ? (
                      <p className="meta" style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        Aktuell als „du“ eingetragen:{' '}
                        <Link
                          to={`${PROJECT_ROUTES['k2-familie'].personen}/${einstellungen.ichBinPersonId}`}
                          style={{ color: 'rgba(94, 234, 212, 0.95)' }}
                        >
                          {ichBinAndererName}
                        </Link>
                      </p>
                    ) : null}
                    {kannStruktur && person ? (
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ fontSize: '0.88rem', padding: '0.4rem 0.75rem' }}
                        onClick={handleSetDasBinIch}
                      >
                        Das bin ich (diese Person)
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0, maxWidth: Math.max(300, portraitGroessePx + 40) }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFotoFileChange}
              aria-hidden
            />
            {aktuellFotoSrc ? (
              <img
                src={aktuellFotoSrc}
                alt=""
                className="person-photo"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => {
                  if (effectiveEditStammdaten) openFilePicker(resolveTargetForHaupt())
                  else openFotoHttpExternal(aktuellFotoSrc)
                }}
                onContextMenu={(e) => {
                  if (!effectiveEditStammdaten && !isHttpUrlForExternalOpen(aktuellFotoSrc)) return
                  e.preventDefault()
                  setFotoMenu({ x: e.clientX, y: e.clientY, kind: 'haupt' })
                }}
                style={{
                  width: portraitGroessePx,
                  height: portraitGroessePx,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(20,184,166,0.35)',
                  cursor: effectiveEditStammdaten || isHttpUrlForExternalOpen(aktuellFotoSrc) ? 'pointer' : 'default',
                }}
                title={effectiveEditStammdaten ? 'Klick: Bild wählen · Rechtsklick: Menü' : isHttpUrlForExternalOpen(aktuellFotoSrc) ? 'Klick: Link im Browser öffnen' : undefined}
              />
            ) : (
              <div
                role={effectiveEditStammdaten ? 'button' : undefined}
                tabIndex={effectiveEditStammdaten ? 0 : undefined}
                onClick={() => {
                  if (effectiveEditStammdaten) openFilePicker(resolveTargetForHaupt())
                }}
                onKeyDown={
                  effectiveEditStammdaten
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openFilePicker(resolveTargetForHaupt())
                        }
                      }
                    : undefined
                }
                onContextMenu={(e) => {
                  if (!effectiveEditStammdaten) return
                  e.preventDefault()
                  setFotoMenu({ x: e.clientX, y: e.clientY, kind: 'haupt' })
                }}
                style={{
                  width: portraitGroessePx,
                  height: portraitGroessePx,
                  borderRadius: '50%',
                  background: 'rgba(13,148,136,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3.5rem',
                  border: '4px solid rgba(20,184,166,0.25)',
                  cursor: effectiveEditStammdaten ? 'pointer' : 'default',
                }}
                title={effectiveEditStammdaten ? 'Klick: Bild wählen · Rechtsklick: Menü' : undefined}
              >
                👤
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '0.55rem',
              }}
            >
              {LEBENSPHASEN_FOTO_LABELS.map(({ field, label }) => {
                const src = phaseThumbUrl(field)
                const thumbClickable = effectiveEditStammdaten || (src != null && isHttpUrlForExternalOpen(src))
                return (
                  <div key={field} style={{ textAlign: 'center', width: 66 }}>
                    <div className="meta" style={{ fontSize: '0.65rem', marginBottom: 3, lineHeight: 1.2 }}>{label}</div>
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onClick={() => {
                          if (effectiveEditStammdaten) openFilePicker(field)
                          else openFotoHttpExternal(src)
                        }}
                        onContextMenu={(e) => {
                          if (!effectiveEditStammdaten && !isHttpUrlForExternalOpen(src)) return
                          e.preventDefault()
                          setFotoMenu({ x: e.clientX, y: e.clientY, kind: field })
                        }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          objectFit: 'cover',
                          border: '2px solid rgba(20,184,166,0.35)',
                          display: 'block',
                          margin: '0 auto',
                          cursor: thumbClickable ? 'pointer' : 'default',
                        }}
                        title={effectiveEditStammdaten ? 'Klick: Bild wählen · Rechtsklick: Menü' : isHttpUrlForExternalOpen(src) ? 'Klick: Link öffnen' : undefined}
                      />
                    ) : (
                      <div
                        role={effectiveEditStammdaten ? 'button' : undefined}
                        tabIndex={effectiveEditStammdaten ? 0 : undefined}
                        onClick={() => {
                          if (effectiveEditStammdaten) openFilePicker(field)
                        }}
                        onKeyDown={
                          effectiveEditStammdaten
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  openFilePicker(field)
                                }
                              }
                            : undefined
                        }
                        onContextMenu={(e) => {
                          if (!effectiveEditStammdaten) return
                          e.preventDefault()
                          setFotoMenu({ x: e.clientX, y: e.clientY, kind: field })
                        }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          background: 'rgba(13,148,136,0.18)',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: 'rgba(226,232,240,0.5)',
                          border: '1px dashed rgba(20,184,166,0.3)',
                          cursor: effectiveEditStammdaten ? 'pointer' : 'default',
                        }}
                        title={effectiveEditStammdaten ? 'Klick: Bild wählen · Rechtsklick: Menü' : undefined}
                      >
                        –
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {(effectiveEditStammdaten ||
              person.linkFotoalbum?.trim() ||
              person.linkWeb?.trim() ||
              person.linkYoutube?.trim() ||
              person.linkInstagram?.trim()) && (
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {effectiveEditStammdaten && (
                <p className="meta" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4 }}>
                  Fotos oben per <strong>Klick</strong> oder <strong>Rechtsklick</strong> setzen – mit <strong>Speichern</strong> sichern. Unten optional: Links zu Fotoalbum, Web, YouTube oder Instagram (keine Bild-URLs).
                </p>
              )}
              {!effectiveEditStammdaten &&
                (person.linkFotoalbum?.trim() ||
                  person.linkWeb?.trim() ||
                  person.linkYoutube?.trim() ||
                  person.linkInstagram?.trim()) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <span className="meta" style={{ fontSize: '0.78rem', marginRight: '0.25rem' }}>
                      Externe Links:
                    </span>
                    {EXTERNE_LINK_FELDER.map(({ stateKey, label }) => {
                      const url =
                        stateKey === 'linkFotoalbum'
                          ? person.linkFotoalbum
                          : stateKey === 'linkWeb'
                            ? person.linkWeb
                            : stateKey === 'linkYoutube'
                              ? person.linkYoutube
                              : person.linkInstagram
                      const t = url?.trim() ?? ''
                      if (!t || !isHttpUrlForExternalOpen(t)) return null
                      return (
                        <a
                          key={stateKey}
                          href={t}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.82rem' }}
                        >
                          {label}
                        </a>
                      )
                    })}
                  </div>
                )}
              {effectiveEditStammdaten &&
                EXTERNE_LINK_FELDER.map(({ stateKey, label, placeholder }) => {
                  const raw =
                    stateKey === 'linkFotoalbum'
                      ? linkFotoalbum
                      : stateKey === 'linkWeb'
                        ? linkWeb
                        : stateKey === 'linkYoutube'
                          ? linkYoutube
                          : linkInstagram
                  const trimmed = raw.trim()
                  const setLink =
                    stateKey === 'linkFotoalbum'
                      ? setLinkFotoalbum
                      : stateKey === 'linkWeb'
                        ? setLinkWeb
                        : stateKey === 'linkYoutube'
                          ? setLinkYoutube
                          : setLinkInstagram
                  return (
                    <div key={stateKey} className="field" style={{ marginBottom: 0 }}>
                      <label className="meta">{label}</label>
                      <input
                        type="url"
                        inputMode="url"
                        value={raw}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder={placeholder}
                        autoComplete="off"
                        data-lpignore="true"
                      />
                      {isHttpUrlForExternalOpen(trimmed) && (
                        <a
                          href={trimmed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="meta"
                          style={{ display: 'inline-block', marginTop: 6, color: 'rgba(94, 234, 212, 0.95)', fontSize: '0.82rem' }}
                        >
                          → Im Browser öffnen
                        </a>
                      )}
                    </div>
                  )
                })}
            </div>
            )}
            {fotoMenu &&
              (() => {
                const menuPreview = fotoMenu.kind === 'haupt' ? aktuellFotoSrc : phaseThumbUrl(fotoMenu.kind)
                const canOpen = isHttpUrlForExternalOpen(menuPreview)
                const canRemove = effectiveEditStammdaten && !!(menuPreview && String(menuPreview).trim())
                const menuW = 220
                const mx = typeof window !== 'undefined' ? Math.min(fotoMenu.x, window.innerWidth - menuW - 8) : fotoMenu.x
                const my = typeof window !== 'undefined' ? Math.min(fotoMenu.y, window.innerHeight - 130) : fotoMenu.y
                const btnStyle: CSSProperties = {
                  display: 'block',
                  width: '100%',
                  margin: 0,
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.88rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#e2e8f0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }
                return (
                  <div
                    className="k2-familie-foto-menu"
                    role="menu"
                    style={{
                      position: 'fixed',
                      left: mx,
                      top: my,
                      zIndex: 10000,
                      background: 'rgba(15,23,42,0.98)',
                      border: '1px solid rgba(20,184,166,0.35)',
                      borderRadius: 10,
                      padding: '0.25rem 0',
                      minWidth: menuW,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    {effectiveEditStammdaten && (
                      <button
                        type="button"
                        style={btnStyle}
                        onClick={() => {
                          const target = fotoMenu.kind === 'haupt' ? resolveTargetForHaupt() : fotoMenu.kind
                          openFilePicker(target)
                          setFotoMenu(null)
                        }}
                      >
                        Bild von diesem Gerät wählen…
                      </button>
                    )}
                    {canOpen && (
                      <button
                        type="button"
                        style={btnStyle}
                        onClick={() => {
                          openFotoHttpExternal(menuPreview)
                          setFotoMenu(null)
                        }}
                      >
                        Link im Browser öffnen
                      </button>
                    )}
                    {canRemove && (
                      <button
                        type="button"
                        style={{ ...btnStyle, color: '#fecaca' }}
                        onClick={() => {
                          applyClearField(fotoMenu.kind === 'haupt' ? 'haupt' : fotoMenu.kind)
                          setFotoMenu(null)
                        }}
                      >
                        Bild entfernen
                      </button>
                    )}
                  </div>
                )
              })()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {effectiveEditStammdaten ? (
              <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: 'contents' }}>
                {feldStrukturNurLesen && (
                  <p className="meta" style={{ margin: '0 0 0.75rem', color: 'rgba(226,232,240,0.92)', lineHeight: 1.45 }}>
                    Name, Geburtsdaten und Stammbaum nur durch Inhaber:in. Hier bearbeitest du <strong>Fotos</strong>, <strong>Links</strong>, <strong>Kurztext</strong> und <strong>Kontakt</strong>.
                  </p>
                )}
                <div className="field">
                  <label className="meta">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name eintragen"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    name="ft-person-name"
                    id="ft-person-display"
                    aria-label="Name der Person"
                    readOnly={feldStrukturNurLesen}
                    style={feldStrukturNurLesen ? { opacity: 0.85 } : undefined}
                  />
                </div>
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <span className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Geburtsdatum</span>
                  <FamilieDatumDreiSelect
                    value={geburtsdatum}
                    onChange={setGeburtsdatum}
                    idPrefix="ft-person-geburtsdatum"
                    labelShort="Geburtsdatum"
                    resetKey={person.id}
                    disabled={feldStrukturNurLesen}
                  />
                  <span className="meta" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    Tag · Monat · Jahr wählen (ohne Datums-Popup; auf dem Handy wie Scrollräder).
                  </span>
                </div>
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <label className="meta">Mädchenname</label>
                  <input
                    type="text"
                    value={maedchenname}
                    onChange={(e) => setMaedchenname(e.target.value)}
                    placeholder="Geburtsname, z. B. bei Frauen (optional)"
                    autoComplete="off"
                    data-lpignore="true"
                    name="ft-person-maedchenname"
                    aria-label="Mädchenname oder Geburtsname"
                    readOnly={feldStrukturNurLesen}
                    style={feldStrukturNurLesen ? { opacity: 0.85 } : undefined}
                  />
                </div>
                <div className="field" style={{ marginTop: '0.75rem' }}><label className="meta">Kurztext</label><textarea value={shortText} onChange={(e) => setShortText(e.target.value)} style={{ minHeight: 80 }} placeholder="Kurz beschreiben (optional)" autoComplete="off" data-lpignore="true" /></div>
                <div className="field" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="verstorben" checked={verstorben} onChange={(e) => setVerstorben(e.target.checked)} disabled={feldStrukturNurLesen} />
                  <label htmlFor="verstorben" className="meta">Verstorben (erscheint am Gedenkort)</label>
                </div>
                {verstorben && (
                  <div className="field" style={{ marginTop: '0.5rem' }}>
                    <span className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Verstorben am (Datum)</span>
                    <FamilieDatumDreiSelect
                      value={verstorbenAm}
                      onChange={setVerstorbenAm}
                      idPrefix="ft-person-verstorben"
                      labelShort="Sterbedatum"
                      resetKey={person.id}
                      disabled={feldStrukturNurLesen}
                    />
                  </div>
                )}
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <label className="meta">Position unter Geschwistern (1–13 oder leer)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={positionAmongSiblingsInput}
                    onChange={(e) => setPositionAmongSiblingsInput(e.target.value)}
                    placeholder="z. B. 7"
                    style={{ width: '4rem', ...(feldStrukturNurLesen ? { opacity: 0.85 } : {}) }}
                    readOnly={feldStrukturNurLesen}
                  />
                  <span className="meta" style={{ marginLeft: '0.5rem' }}>Für die Reihenfolge im Stammbaum (1 = erster, 7 = siebter, …)</span>
                </div>
                <details
                  className="k2-familie-details-inner"
                  style={{ marginTop: '0.85rem' }}
                  open={kontaktAdresseOpen}
                  onToggle={(e) => setKontaktAdresseOpen((e.target as HTMLDetailsElement).open)}
                >
                  <summary className="k2-familie-details-summary k2-familie-details-summary-nested" style={{ cursor: 'pointer' }}>
                    Anschrift & Kontakt (optional)
                  </summary>
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div className="field">
                      <label className="meta">Adresszeile 1</label>
                      <input
                        type="text"
                        value={kaZeile1}
                        onChange={(e) => setKaZeile1(e.target.value)}
                        placeholder="Straße, Hausnummer"
                        autoComplete="street-address"
                        data-lpignore="true"
                      />
                    </div>
                    <div className="field">
                      <label className="meta">Adresszeile 2</label>
                      <input
                        type="text"
                        value={kaZeile2}
                        onChange={(e) => setKaZeile2(e.target.value)}
                        placeholder="Zusatz (optional)"
                        autoComplete="off"
                        data-lpignore="true"
                      />
                    </div>
                    <div className="field" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: '1 1 5rem', minWidth: 80 }}>
                        <label className="meta">PLZ</label>
                        <input
                          type="text"
                          value={kaPlz}
                          onChange={(e) => setKaPlz(e.target.value)}
                          placeholder="PLZ"
                          autoComplete="postal-code"
                          data-lpignore="true"
                        />
                      </div>
                      <div style={{ flex: '2 1 8rem', minWidth: 120 }}>
                        <label className="meta">Ort</label>
                        <input
                          type="text"
                          value={kaOrt}
                          onChange={(e) => setKaOrt(e.target.value)}
                          placeholder="Ort"
                          autoComplete="address-level2"
                          data-lpignore="true"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label className="meta">Land</label>
                      <input
                        type="text"
                        value={kaLand}
                        onChange={(e) => setKaLand(e.target.value)}
                        placeholder="z. B. Österreich"
                        autoComplete="country-name"
                        data-lpignore="true"
                      />
                    </div>
                    <div className="field">
                      <label className="meta">E-Mail</label>
                      <input
                        type="email"
                        value={kaEmail}
                        onChange={(e) => setKaEmail(e.target.value)}
                        placeholder="name@beispiel.at"
                        autoComplete="email"
                        data-lpignore="true"
                        inputMode="email"
                      />
                    </div>
                    <div className="field">
                      <label className="meta">Telefon</label>
                      <input
                        type="tel"
                        value={kaTelefon}
                        onChange={(e) => setKaTelefon(e.target.value)}
                        placeholder="+43 …"
                        autoComplete="tel"
                        data-lpignore="true"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                </details>
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    ...(stammdatenDirty
                      ? {
                          background: 'rgba(234, 88, 12, 0.22)',
                          color: '#ffedd5',
                          border: '1px solid rgba(251, 146, 60, 0.65)',
                        }
                      : {
                          background: 'rgba(22, 163, 74, 0.18)',
                          color: '#dcfce7',
                          border: '1px solid rgba(74, 222, 128, 0.5)',
                        }),
                  }}
                >
                  {stammdatenDirty ? '⚠ Nicht gespeichert – auf Speichern tippen' : '✓ Keine offenen Änderungen'}
                </div>
                <div className="card-actions" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn">Speichern</button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setEdit(false)
                      setPhotoLegacyCleared(false)
                      setName(person.name)
                      setGeburtsdatum(person.geburtsdatum?.slice(0, 10) ?? '')
                      setMaedchenname(person.maedchenname ?? '')
                      setShortText(person.shortText ?? '')
                      setVerstorben(person.verstorben === true)
                      setVerstorbenAm(person.verstorbenAm?.slice(0, 10) ?? '')
                      setPositionAmongSiblingsInput(person.positionAmongSiblings != null ? String(person.positionAmongSiblings) : '')
                      setPhotoKind(person.photoKind ?? '')
                      setPhotoJugend(person.photoJugend ?? '')
                      setPhotoErwachsen(person.photoErwachsen ?? '')
                      setPhotoAlter(person.photoAlter ?? '')
                      setLinkFotoalbum(person.linkFotoalbum ?? '')
                      setLinkWeb(person.linkWeb ?? '')
                      setLinkYoutube(person.linkYoutube ?? '')
                      setLinkInstagram(person.linkInstagram ?? '')
                      const ka = person.kontaktAdresse
                      setKaZeile1(ka?.zeile1 ?? '')
                      setKaZeile2(ka?.zeile2 ?? '')
                      setKaPlz(ka?.plz ?? '')
                      setKaOrt(ka?.ort ?? '')
                      setKaLand(ka?.land ?? '')
                      setKaEmail(ka?.email ?? '')
                      setKaTelefon(ka?.telefon ?? '')
                      setMitgliedsNummer(person.mitgliedsNummer ?? '')
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="meta" style={{ margin: '0 0 0.75rem', color: 'rgba(226,232,240,0.9)' }}>
                  Name und Daten erst mit <strong>Speichern</strong> sicher. Beziehungen in diesem Block (aufklappen) speichern sich beim Verknüpfen sofort.
                </p>
                {kannStruktur ? (
                  <button type="button" className="btn" onClick={() => setEdit(true)}>
                    Stammdaten bearbeiten
                  </button>
                ) : istEigeneKarte && (rolle === 'bearbeiter' || rolle === 'leser') ? (
                  <button type="button" className="btn" onClick={() => setEdit(true)}>
                    Persönliche Angaben bearbeiten
                  </button>
                ) : kannOrganisch ? (
                  <p className="meta" style={{ margin: 0, color: 'rgba(226,232,240,0.92)', lineHeight: 1.5 }}>
                    <strong>Bearbeiter:in:</strong> Stammdaten und Beziehungen nur für Inhaber:in änderbar. Momente und Erinnerungen kannst du unten bearbeiten.
                  </p>
                ) : (
                  <p className="meta" style={{ margin: 0, color: 'rgba(251,191,36,0.95)' }}>
                    Lesemodus – auf fremden Karten ist Bearbeiten ausgeschaltet (oben Rolle wählen).
                  </p>
                )}
              </>
            )}
            {!effectiveEditStammdaten && person && personHatKontaktAnzeige(person) && (
              <details className="k2-familie-details-inner" style={{ marginTop: '0.85rem' }}>
                <summary className="k2-familie-details-summary k2-familie-details-summary-nested" style={{ cursor: 'pointer' }}>
                  Anschrift & Kontakt
                </summary>
                <div
                  className="meta"
                  style={{
                    marginTop: '0.5rem',
                    lineHeight: 1.55,
                    color: 'rgba(226,232,240,0.95)',
                    fontSize: '0.95rem',
                  }}
                >
                  {(() => {
                    const k = person.kontaktAdresse!
                    const lines: ReactNode[] = []
                    const pushLine = (s: string | undefined) => {
                      const t = (s ?? '').trim()
                      if (t) lines.push(<div key={lines.length}>{t}</div>)
                    }
                    pushLine(k.zeile1)
                    pushLine(k.zeile2)
                    const plzOrt = [k.plz, k.ort].map((x) => (x ?? '').trim()).filter(Boolean).join(' ')
                    if (plzOrt) lines.push(<div key="plz">{plzOrt}</div>)
                    pushLine(k.land)
                    const em = (k.email ?? '').trim()
                    if (em) {
                      lines.push(
                        <div key="email">
                          <a href={`mailto:${em}`} style={{ color: 'rgba(45,212,191,0.95)' }}>
                            {em}
                          </a>
                        </div>
                      )
                    }
                    const tel = (k.telefon ?? '').trim()
                    if (tel) {
                      const href = 'tel:' + tel.replace(/\s/g, '')
                      lines.push(
                        <div key="tel">
                          <a href={href} style={{ color: 'rgba(45,212,191,0.95)' }}>
                            {tel}
                          </a>
                        </div>
                      )
                    }
                    return <>{lines}</>
                  })()}
                </div>
              </details>
            )}
          </div>
        </div>

        <details
          id="k2-familie-beziehungen"
          className="k2-familie-details-inner"
          open={beziehungenOpen}
          onToggle={(e) => setBeziehungenOpen((e.target as HTMLDetailsElement).open)}
          style={{
            transition: 'box-shadow 0.35s ease',
            ...(beziehungenFokusHighlight
              ? { boxShadow: '0 0 0 3px rgba(45, 212, 191, 0.75), 0 4px 24px rgba(13, 148, 136, 0.35)' }
              : {}),
          }}
        >
          <summary className="k2-familie-details-summary k2-familie-details-summary-nested">
            Beziehungen
          </summary>
          <div
            className="meta"
            style={{
              margin: '0 0 0.75rem',
              padding: '0.55rem 0.75rem',
              background: 'rgba(13,148,136,0.1)',
              borderRadius: 8,
              border: '1px solid rgba(20,184,166,0.22)',
              lineHeight: 1.45,
            }}
          >
            <strong>So geht’s:</strong> Oben im Menü eine <strong>bestehende</strong> Person wählen – oder <strong>＋ Neu …</strong> und Namen auf der neuen Seite eintragen.
            {!einstellungen.stammbaumSchlusspunkt && (
              <span> Verknüpfen speichert sofort.</span>
            )}
            {einstellungen.stammbaumSchlusspunkt && (
              <span> Keine neuen Personen (Inhaber:in unter Einstellungen) – nur Verknüpfen bestehender Karten.</span>
            )}
          </div>
          <details className="meta" style={{ margin: '0 0 0.85rem', padding: '0.35rem 0' }}>
            <summary style={{ cursor: 'pointer', color: 'rgba(20,184,166,0.95)', fontWeight: 600 }}>
              Zwei Eltern · Geschwister · Kind mit Vater und Mutter
            </summary>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.45 }}>
              <li>
                <strong>Zwei Eltern:</strong> Kind zuerst bei einem Elternteil verknüpfen oder neu anlegen. Dann die <strong>Kind-Seite</strong> öffnen und unter <strong>Eltern</strong> den zweiten Elternteil ergänzen.
              </li>
              <li>
                <strong>Geschwister:</strong> bei allen dieselben Eltern in der Karte (mindestens ein gemeinsamer Elternteil) – dann erscheinen sie automatisch. Nicht separat als Geschwister eintragen.
              </li>
              <li>
                <strong>Kind mit beiden Eltern in der Grafik:</strong> Erst wenn bei dem Kind <strong>beide</strong> Eltern in der Karte stehen (von einer Seite Kind anlegen, von der anderen Seite den fehlenden Elternteil unter Eltern wählen), stimmen die Linien.
              </li>
            </ul>
          </details>
          <div
            className="meta"
            role="region"
            aria-label="Kurzübersicht Eltern und Geschwister"
            style={{
              margin: '0 0 1rem',
              padding: '0.65rem 0.75rem',
              background: 'rgba(0,0,0,0.18)',
              borderRadius: 8,
              border: '1px solid rgba(20,184,166,0.22)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.45rem', color: 'rgba(20,184,166,0.95)' }}>
              Kurzübersicht <span className="meta" style={{ fontWeight: 400 }}>– nur Anzeige; ändern unten in den Zeilen</span>
            </div>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                <span className="meta" style={{ minWidth: '5.5rem', fontWeight: 600 }}>Eltern:</span>
                {beziehungenKurz.eltern.length === 0 ? (
                  <span className="meta">–</span>
                ) : (
                  beziehungenKurz.eltern.map((p) => (
                    <Link
                      key={p.id}
                      to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                      className="btn"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}
                    >
                      {p.name}
                    </Link>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                <span className="meta" style={{ minWidth: '5.5rem', fontWeight: 600 }}>Geschwister:</span>
                {beziehungenKurz.geschwister.length === 0 ? (
                  <span className="meta">–</span>
                ) : (
                  beziehungenKurz.geschwister.map((p) => (
                    <Link
                      key={p.id}
                      to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                      className="btn"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}
                    >
                      {p.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          {row('Eltern', person.parentIds, addParent, removeParent, () => person.parentIds, 'parent')}
          {row('Kinder', person.childIds, addChild, removeChild, () => person.childIds, 'child')}
          <div style={{ marginBottom: '1rem' }}>
            <label className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Partner*innen</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
              {person.partners.map((pr, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(13,148,136,0.15)', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
                  <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pr.personId}`} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>{getPersonName(pr.personId)}</Link>
                  {(pr.from || pr.to) && <span className="meta" style={{ fontSize: '0.8rem' }}>({pr.from ?? '?'} – {pr.to ?? 'heute'})</span>}
                  {kannStruktur && (
                  <button type="button" onClick={() => removePartner(pr.personId)} style={smallBtn} title="Entfernen">✕</button>
                  )}
                </span>
              ))}
              {kannStruktur && partnerAddSelect}
              {!einstellungen.stammbaumSchlusspunkt && kannStruktur && (
                <button type="button" className="btn-outline" onClick={() => createNewPersonAndLink('partner')} style={newPersonBtnStyle}>
                  {newPersonButtonLabels.partner}
                </button>
              )}
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Geschwister</label>
            <p className="meta" style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', maxWidth: '42rem' }}>
              Ergeben sich aus gleichen Eltern auf den Karten (mindestens ein gemeinsamer Elternteil). Hier nicht separat eintragen – bei Eltern ändern.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
              {beziehungenKurz.geschwister.length === 0 ? (
                <span className="meta">–</span>
              ) : (
                beziehungenKurz.geschwister.map((p) => (
                  <span
                    key={p.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(13,148,136,0.15)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                    }}
                  >
                    <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>
                      {p.name}
                    </Link>
                    {kannStruktur && person.siblingIds.includes(p.id) && !geschwisterAusElternIds.has(p.id) && (
                      <button
                        type="button"
                        onClick={() => removeSibling(p.id)}
                        style={smallBtn}
                        title="Alte Verknüpfung entfernen (nur in siblingIds, nicht aus Eltern)"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {row('Wahlfamilie', person.wahlfamilieIds, addWahlfamilie, removeWahlfamilie, () => person.wahlfamilieIds, 'wahlfamilie')}
        </details>

        <details
          className="k2-familie-details-inner"
          open={momenteOpen}
          onToggle={(e) => setMomenteOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="k2-familie-details-summary k2-familie-details-summary-nested">
            Meine Momente
          </summary>
          <p className="meta" style={{ margin: '0 0 0.75rem' }}>Hochzeit, Geburt, Umzug, Reise, Abschied, Neuanfang – was dir wichtig ist.</p>
          {personMomente.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
              {personMomente.map((m) => (
                <li key={m.id} className="card k2-familie-moment-card" style={{ marginBottom: '0.75rem', padding: '0.9rem', borderRadius: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                    {m.image && <img src={m.image} alt="" className="person-photo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />}
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <strong>{m.title}</strong>
                      {m.date && <span className="meta" style={{ marginLeft: '0.5rem' }}>{m.date.slice(0, 10)}</span>}
                      {m.text && <p className="meta" style={{ margin: '0.35rem 0 0' }}>{m.text}</p>}
                    </div>
                    {kannOrganischHier && (
                    <div className="card-actions" style={{ display: 'flex', gap: '0.35rem' }}>
                      <button type="button" className="btn" onClick={() => openEditMoment(m)}>Bearbeiten</button>
                      <button type="button" className="btn-outline danger" onClick={() => deleteMoment(m.id)}>Löschen</button>
                    </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {editingMomentId ? (
            <div className="card" style={{ padding: '1rem', marginTop: '0.5rem' }}>
              <div className="field"><label className="meta">Titel</label><input value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} placeholder="z. B. Hochzeit, Umzug Wien" /></div>
              <div className="field" style={{ marginTop: '0.5rem' }}>
                <label className="meta">Datum (optional)</label>
                <input
                  type="text"
                  value={momentDate}
                  onChange={(e) => setMomentDate(e.target.value)}
                  placeholder="z. B. 2010-06-12 oder 12.6.2010"
                  autoComplete="off"
                  aria-label="Moment-Datum"
                />
              </div>
              <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Bild (URL oder data:…, optional)</label><input value={momentImage} onChange={(e) => setMomentImage(e.target.value)} placeholder="https://… oder data:image/…" /></div>
              <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Text (optional)</label><textarea value={momentText} onChange={(e) => setMomentText(e.target.value)} style={{ minHeight: 80 }} placeholder="Kurze Beschreibung" /></div>
              <div className="card-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={saveMoment}>Speichern</button>
                <button type="button" className="btn-outline" onClick={() => setEditingMomentId(null)}>Abbrechen</button>
              </div>
            </div>
          ) : (
            kannOrganischHier && (
            <button type="button" className="btn" onClick={openNewMoment} style={{ marginTop: '0.5rem' }}>Moment hinzufügen</button>
            )
          )}
        </details>

        <details
          className="k2-familie-details-inner"
          open={erinnerungenOpen}
          onToggle={(e) => setErinnerungenOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="k2-familie-details-summary k2-familie-details-summary-nested">
            Erinnerungen
          </summary>
          <p className="meta" style={{ margin: '0 0 0.75rem' }}>Was unsere Familie dazu weiß – Korrekturen, Geschichten, Fotos oder Daten, von dir oder anderen.</p>
          {personBeitraege.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
              {personBeitraege.map((b) => (
                <li key={b.id} className="card" style={{ marginBottom: '0.75rem', padding: '0.9rem', borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span className="meta" style={{ fontSize: '0.8rem', background: 'rgba(13,148,136,0.2)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>{artLabel[b.art]}</span>
                    {b.vonWem && <span className="meta" style={{ fontSize: '0.85rem' }}>von {b.vonWem}</span>}
                    <span className="meta" style={{ fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleDateString('de-AT')}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>{b.inhalt}</p>
                  {kannOrganischHier && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button type="button" className="btn-outline danger" style={{ fontSize: '0.85rem' }} onClick={() => deleteBeitrag(b.id)}>Löschen</button>
                  </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {beitragModal ? (
            <div className="card" style={{ padding: '1rem', marginTop: '0.5rem' }}>
              <div className="field">
                <label className="meta">Art</label>
                <select value={beitragArt} onChange={(e) => setBeitragArt(e.target.value as K2FamilieBeitrag['art'])} style={{ padding: '0.35rem 0.5rem' }}>
                  {(['erinnerung', 'korrektur', 'foto', 'geschichte', 'datum'] as const).map((a) => (
                    <option key={a} value={a}>{artLabel[a]}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginTop: '0.5rem' }}>
                <label className="meta">Inhalt</label>
                <textarea value={beitragInhalt} onChange={(e) => setBeitragInhalt(e.target.value)} style={{ minHeight: 80 }} placeholder="Was weißt du dazu?" />
              </div>
              <div className="field" style={{ marginTop: '0.5rem' }}>
                <label className="meta">Von wem (optional)</label>
                <input value={beitragVonWem} onChange={(e) => setBeitragVonWem(e.target.value)} placeholder="z. B. dein Name oder anonym" autoComplete="off" />
              </div>
              <div className="card-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={saveBeitrag}>Speichern</button>
                <button type="button" className="btn-outline" onClick={() => setBeitragModal(false)}>Abbrechen</button>
              </div>
            </div>
          ) : (
            kannOrganischHier && (
            <button type="button" className="btn" onClick={openBeitragModal} style={{ marginTop: '0.5rem' }}>Was ich dazu weiß, hinzufügen</button>
            )
          )}
        </details>
        </div>
        </details>

        {person && kannStruktur && (
          <div
            className="k2-familie-person-delete-footer"
            style={{
              marginTop: '1.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(20, 184, 166, 0.18)',
            }}
          >
            {einstellungen.stammbaumPersonenLoeschenGesperrt ? (
              <p className="meta" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.45, maxWidth: '40rem' }}>
                <strong>Personen löschen</strong> ist für diese Familie gesperrt – die Stammbaum-Struktur soll nicht auseinanderfallen. Nur die <strong>Inhaber:in</strong> kann das unter{' '}
                <Link to={PROJECT_ROUTES['k2-familie'].einstellungen} style={{ color: 'rgba(20,184,166,0.95)', fontWeight: 600 }}>
                  Einstellungen
                </Link>{' '}
                wieder freigeben.
              </p>
            ) : !showDeleteConfirm ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem 1rem' }}>
                <span className="meta" style={{ fontSize: '0.8rem', opacity: 0.88 }}>
                  Optional – nur wenn du diese Person wirklich aus dem Stammbaum entfernen willst:
                </span>
                <button
                  type="button"
                  className="btn-outline danger"
                  style={{ fontSize: '0.82rem', padding: '0.3rem 0.65rem', fontWeight: 500 }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Person löschen…
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '36rem' }}>
                <p className="meta" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.45 }}>
                  Verknüpfungen (Eltern, Kinder, Partner, Geschwister) werden entfernt, Momente und Beiträge gehen verloren. „Du“ / „Herkunft Partner“ werden zurückgesetzt, falls sie hierher zeigten.
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Wirklich endgültig löschen?</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn danger"
                    style={{ fontSize: '0.9rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => {
                      if (deletePersonWithCleanup(currentTenantId, person.id)) navigate(PROJECT_ROUTES['k2-familie'].stammbaum)
                    }}
                  >
                    Ja, endgültig löschen
                  </button>
                  <button type="button" className="btn-outline" style={{ fontSize: '0.9rem' }} onClick={() => setShowDeleteConfirm(false)}>
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
