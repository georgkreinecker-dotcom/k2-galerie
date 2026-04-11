/**
 * K2 Familie – Personen-Seite. Phase 2.2, 2.3.
 * Route: /projects/k2-familie/personen/:id
 */

import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo, type ReactNode } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, loadMomente, saveMomente, loadBeitraege, saveBeitraege, deletePersonWithCleanup, loadEinstellungen } from '../utils/familieStorage'
import { loadFamilieFromSupabase } from '../utils/familieSupabaseClient'
import { isSupabaseConfigured } from '../utils/supabaseClient'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson, K2FamilieMoment, K2FamilieBeitrag } from '../types/k2Familie'
import { normalizeFamilieDatum, istFamilieDatumUngueltig } from '../utils/familieDatumEingabe'

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
  }
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
  return false
}

export default function K2FamiliePersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId } = useFamilieTenant()
  const einstellungen = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, location.key])
  const [personen, setPersonen] = useState<K2FamiliePerson[]>(() => loadPersonen(currentTenantId))
  const [momente, setMomente] = useState<K2FamilieMoment[]>(() => loadMomente(currentTenantId))
  const [edit, setEdit] = useState(false)
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [beziehungenFokusHighlight, setBeziehungenFokusHighlight] = useState(false)

  const person = personen.find((p) => p.id === id)
  const fokusParam = searchParams.get('fokus')
  useEffect(() => {
    if (!person || fokusParam !== 'beziehungen') return
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
    if (!isSupabaseConfigured()) {
      setPersonen(loadPersonen(currentTenantId))
      setMomente(loadMomente(currentTenantId))
      setBeitraege(loadBeitraege(currentTenantId))
      return
    }
    loadFamilieFromSupabase(currentTenantId).then((d) => {
      setPersonen(d.personen)
      setMomente(d.momente)
      setBeitraege(loadBeitraege(currentTenantId))
    })
  }, [id, currentTenantId])

  useEffect(() => {
    if (person) {
      setName(person.name)
      setGeburtsdatum(person.geburtsdatum?.slice(0, 10) ?? '')
      setMaedchenname(person.maedchenname ?? '')
      setShortText(person.shortText ?? '')
      setVerstorben(person.verstorben === true)
      setVerstorbenAm(person.verstorbenAm?.slice(0, 10) ?? '')
      setPositionAmongSiblingsInput(person.positionAmongSiblings != null ? String(person.positionAmongSiblings) : '')
      // Neue Person (gerade angelegt): sofort Bearbeiten öffnen, damit Name getippt werden kann – keine Kontakt-Vorschläge
      if (person.name === 'Neue Person') setEdit(true)
    }
  }, [person])

  const stammdatenDirty = useMemo(
    () =>
      !person || !edit
        ? false
        : computeStammdatenDirty(person, {
            name,
            geburtsdatum,
            maedchenname,
            shortText,
            verstorben,
            verstorbenAm,
            positionAmongSiblingsInput,
          }),
    [person, edit, name, geburtsdatum, maedchenname, shortText, verstorben, verstorbenAm, positionAmongSiblingsInput]
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
    if (istFamilieDatumUngueltig(geburtsdatum)) {
      window.alert('Geburtsdatum: bitte als JJJJ-MM-TT oder TT.MM.JJJJ eingeben (z. B. 1959-04-06 oder 6.4.1959).')
      return
    }
    if (verstorben && verstorbenAm.trim() && istFamilieDatumUngueltig(verstorbenAm)) {
      window.alert('Verstorben am: bitte als JJJJ-MM-TT oder TT.MM.JJJJ eingeben.')
      return
    }
    const posNum = positionAmongSiblingsInput.trim() === '' ? undefined : parseInt(positionAmongSiblingsInput.trim(), 10)
    const positionAmongSiblings = posNum != null && !Number.isNaN(posNum) && posNum >= 1 ? posNum : undefined
    const gdNorm = normalizeFamilieDatum(geburtsdatum)
    const vsNorm = verstorben && verstorbenAm.trim() ? normalizeFamilieDatum(verstorbenAm) : undefined
    const updated: K2FamiliePerson = {
      ...person,
      name: name.trim() || person.name,
      geburtsdatum: gdNorm,
      maedchenname: maedchenname.trim() || undefined,
      shortText: shortText.trim() || undefined,
      verstorben: verstorben || undefined,
      verstorbenAm: vsNorm,
      positionAmongSiblings,
      updatedAt: new Date().toISOString(),
    }
    const next = personen.map((p) => (p.id === id ? updated : p))
    if (savePersonen(currentTenantId, next, { allowReduce: false })) {
      setPersonen(next)
      setEdit(false)
    }
  }

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId
  const otherPersonen = personen.filter((p) => p.id !== id)

  /** Kandidat passt logisch nicht zu dieser Beziehung (z. B. Eltern können keine Partner sein). */
  const impossibleForRelation = (type: 'parent' | 'child' | 'partner' | 'sibling' | 'wahlfamilie', p: K2FamiliePerson): boolean => {
    if (!person) return false
    if (type === 'partner') return person.parentIds.includes(p.id) || person.childIds.includes(p.id)
    if (type === 'parent') return person.childIds.includes(p.id)
    if (type === 'child') return person.parentIds.includes(p.id)
    if (type === 'sibling') return person.parentIds.includes(p.id) || person.childIds.includes(p.id)
    return false
  }

  /** Für Beziehungs-Dropdowns: nur sinnvolle Kandidaten, naheliegende zuerst (z. B. gleiche Eltern = Geschwister, gemeinsame Kinder = Partner). */
  const getCandidatesOrdered = (
    type: 'parent' | 'child' | 'partner' | 'sibling' | 'wahlfamilie',
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
    if (type === 'sibling') {
      const myParentSet = new Set(person.parentIds)
      const suggested = pool.filter((p) => p.parentIds.some((pid) => myParentSet.has(pid)))
      const rest = pool.filter((p) => !p.parentIds.some((pid) => myParentSet.has(pid))).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    if (type === 'wahlfamilie') {
      const partnerAndSiblingIds = new Set([...person.partners.map((pr) => pr.personId), ...person.siblingIds])
      const suggested = pool.filter((p) => partnerAndSiblingIds.has(p.id))
      const rest = pool.filter((p) => !partnerAndSiblingIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name))
      return { suggested, rest }
    }
    return { suggested: [], rest: pool.sort((a, b) => a.name.localeCompare(b.name)) }
  }

  const updateAndSave = (next: K2FamiliePerson[]) => {
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
  const createNewPersonAndLink = (relationType: 'parent' | 'child' | 'partner' | 'sibling' | 'wahlfamilie') => {
    if (!id || !person) return
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
    } else if (relationType === 'sibling') {
      const neu = { ...empty, siblingIds: [id] }
      withNew = [
        ...personen.map((p) =>
          p.id === id ? { ...p, siblingIds: [...p.siblingIds, newId], updatedAt: now } : p
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
      navigate(`${PROJECT_ROUTES['k2-familie'].personen}/${newId}`)
    }
  }

  const addSibling = (otherId: string) => {
    if (!id || !person || person.siblingIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, siblingIds: [...p.siblingIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, siblingIds: [...p.siblingIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
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
    setEditingMomentId('new')
    setMomentTitle('')
    setMomentDate('')
    setMomentImage('')
    setMomentText('')
  }
  const openEditMoment = (m: K2FamilieMoment) => {
    setEditingMomentId(m.id)
    setMomentTitle(m.title)
    setMomentDate(m.date ? m.date.slice(0, 10) : '')
    setMomentImage(m.image ?? '')
    setMomentText(m.text ?? '')
  }
  const saveMoment = () => {
    if (!id) return
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
    const next = momente.filter((m) => m.id !== momentId)
    if (saveMomente(currentTenantId, next, { allowReduce: true })) setMomente(next)
    if (editingMomentId === momentId) setEditingMomentId(null)
  }

  const personBeitraege = id ? beitraege.filter((b) => b.personId === id) : []
  const openBeitragModal = () => {
    setBeitragArt('erinnerung')
    setBeitragInhalt('')
    setBeitragVonWem('')
    setBeitragModal(true)
  }
  const saveBeitrag = () => {
    if (!id || !beitragInhalt.trim()) return
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
          <header><Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="meta">← Stammbaum</Link></header>
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

  const smallBtn = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.4rem', fontFamily: 'inherit' } as const
  type RelationType = 'parent' | 'child' | 'partner' | 'sibling' | 'wahlfamilie'
  const newPersonButtonLabels: Record<RelationType, string> = {
    parent: '＋ Neue Person anlegen (als Elternteil)',
    child: '＋ Neue Person anlegen (als Kind)',
    partner: '＋ Neue Person anlegen (als Partner*in)',
    sibling: '＋ Neue Person anlegen (als Geschwister)',
    wahlfamilie: '＋ Neue Person anlegen (Wahlfamilie)',
  }
  /**
   * Eltern/Kinder: volle Auswahl (naheliegend + weitere) – oft mehrere sinnvolle Personen.
   * Partner, Geschwister, Wahlfamilie: nur Dropdown, wenn genau eine Person eindeutig passt (keine lange irritierende Liste).
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
            <option value="">+ Hinzufügen</option>
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
          <option value="">+ Vorschlag</option>
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
              <button type="button" onClick={() => removeFn(pid)} style={smallBtn} title="Entfernen">✕</button>
            </span>
          ))}
          {select}
          {!einstellungen.stammbaumSchlusspunkt && (
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

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="meta">← Stammbaum</Link>
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

        <div className="card familie-card-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          {person.photo ? (
            <img src={person.photo} alt="" className="person-photo" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(20,184,166,0.35)' }} />
          ) : (
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', border: '4px solid rgba(20,184,166,0.25)' }}>👤</div>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            {edit ? (
              <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: 'contents' }}>
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
                  />
                </div>
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <label className="meta">Geburtsdatum</label>
                  <input
                    type="text"
                    value={geburtsdatum}
                    onChange={(e) => setGeburtsdatum(e.target.value)}
                    placeholder="z. B. 1959-04-06 oder 6.4.1959"
                    autoComplete="off"
                    inputMode="text"
                    aria-label="Geburtsdatum"
                  />
                  <span className="meta" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    Frei tippen (Jahr zuerst oder TT.MM.JJJJ) – ohne kleines Datumsfenster.
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
                  />
                </div>
                <div className="field" style={{ marginTop: '0.75rem' }}><label className="meta">Kurztext</label><textarea value={shortText} onChange={(e) => setShortText(e.target.value)} style={{ minHeight: 80 }} placeholder="Kurz beschreiben (optional)" autoComplete="off" data-lpignore="true" /></div>
                <div className="field" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="verstorben" checked={verstorben} onChange={(e) => setVerstorben(e.target.checked)} />
                  <label htmlFor="verstorben" className="meta">Verstorben (erscheint am Gedenkort)</label>
                </div>
                {verstorben && (
                  <div className="field" style={{ marginTop: '0.5rem' }}>
                    <label className="meta">Verstorben am (Datum)</label>
                    <input
                      type="text"
                      value={verstorbenAm}
                      onChange={(e) => setVerstorbenAm(e.target.value)}
                      placeholder="z. B. 2020-03-15 oder 15.3.2020"
                      autoComplete="off"
                      aria-label="Sterbedatum"
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
                    style={{ width: '4rem' }}
                  />
                  <span className="meta" style={{ marginLeft: '0.5rem' }}>Für die Reihenfolge im Stammbaum (1 = erster, 7 = siebter, …)</span>
                </div>
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
                  <button type="button" className="btn-outline" onClick={() => { setEdit(false); setName(person.name); setGeburtsdatum(person.geburtsdatum?.slice(0, 10) ?? ''); setMaedchenname(person.maedchenname ?? ''); setShortText(person.shortText ?? ''); setVerstorben(person.verstorben === true); setVerstorbenAm(person.verstorbenAm?.slice(0, 10) ?? ''); setPositionAmongSiblingsInput(person.positionAmongSiblings != null ? String(person.positionAmongSiblings) : ''); }}>Abbrechen</button>
                </div>
              </form>
            ) : (
              <>
                <p className="meta" style={{ margin: '0 0 0.75rem', color: 'rgba(226,232,240,0.9)' }}>
                  Stammdaten (Name, Daten …) werden erst mit <strong>Speichern</strong> sicher. Beziehungen unten speichern sich beim Verknüpfen sofort.
                </p>
                <button type="button" className="btn" onClick={() => setEdit(true)}>Stammdaten bearbeiten</button>
              </>
            )}
          </div>
        </div>

        <div
          id="k2-familie-beziehungen"
          className="card"
          style={{
            marginTop: '1.5rem',
            transition: 'box-shadow 0.35s ease',
            ...(beziehungenFokusHighlight
              ? { boxShadow: '0 0 0 3px rgba(45, 212, 191, 0.75), 0 4px 24px rgba(13, 148, 136, 0.35)' }
              : {}),
          }}
        >
          <h2>Beziehungen</h2>
          <p className="meta" style={{ margin: '0 0 0.75rem' }}>
            <strong>+ Hinzufügen</strong> (bzw. <strong>+ Vorschlag</strong> bei eindeutigem Treffer) verknüpft <em>bestehende</em> Personen.
            {!einstellungen.stammbaumSchlusspunkt && (
              <> <strong>Neue Person anlegen</strong> steht direkt daneben – Name und Daten trägst du auf der neuen Personenseite ein.</>
            )}
            {einstellungen.stammbaumSchlusspunkt && (
              <> <strong>Schlusspunkt</strong> ist auf dem Stammbaum aktiv – hier werden keine neuen Personen mehr angelegt; zum Fortsetzen den Schlusspunkt dort aufheben.</>
            )}{' '}
            <strong>Zwei Eltern bei einem Kind:</strong> Kind zuerst bei einem Elternteil anlegen oder verknüpfen, dann die <strong>Kinderseite</strong> öffnen und unter <strong>Eltern</strong> den zweiten Elternteil hinzufügen (z. B. Justina). <strong>Geschwister:</strong> dieselben Eltern in der Karte wie beim Bruder/der Schwester – oder unter <strong>Geschwister</strong> verknüpfen.
          </p>
          <p className="meta" style={{ margin: '0 0 0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(13,148,136,0.12)', borderRadius: 8, border: '1px solid rgba(20,184,166,0.25)' }}>
            <strong>Kind mit Vater und Mutter:</strong> Ein neues Kind bekommt zuerst nur den Elternteil, von dessen Seite du es anlegst (z. B. nur Rupert). Den <strong>zweiten Elternteil</strong> trägst du danach ein: <strong>Christine öffnen</strong> → unter <strong>Eltern</strong> → Justina wählen – <em>oder</em> Justina öffnen → unter <strong>Kinder</strong> → Christine wählen. Erst wenn bei Christine <strong>beide</strong> Eltern in der Karte stehen, stimmt die Linie für beide. <strong>Geschwister</strong> (z. B. Andreas): dieselben Eltern in der Karte wie beim Bruder – oder unter Geschwister verknüpfen, wenn die App keinen Vorschlag zeigt.
          </p>
          {row('Eltern', person.parentIds, addParent, removeParent, () => person.parentIds, 'parent')}
          {row('Kinder', person.childIds, addChild, removeChild, () => person.childIds, 'child')}
          <div style={{ marginBottom: '1rem' }}>
            <label className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Partner*innen</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
              {person.partners.map((pr, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(13,148,136,0.15)', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
                  <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pr.personId}`} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>{getPersonName(pr.personId)}</Link>
                  {(pr.from || pr.to) && <span className="meta" style={{ fontSize: '0.8rem' }}>({pr.from ?? '?'} – {pr.to ?? 'heute'})</span>}
                  <button type="button" onClick={() => removePartner(pr.personId)} style={smallBtn} title="Entfernen">✕</button>
                </span>
              ))}
              {partnerAddSelect}
              {!einstellungen.stammbaumSchlusspunkt && (
                <button type="button" className="btn-outline" onClick={() => createNewPersonAndLink('partner')} style={newPersonBtnStyle}>
                  {newPersonButtonLabels.partner}
                </button>
              )}
            </div>
          </div>
          {row('Geschwister', person.siblingIds, addSibling, removeSibling, () => person.siblingIds, 'sibling')}
          {row('Wahlfamilie', person.wahlfamilieIds, addWahlfamilie, removeWahlfamilie, () => person.wahlfamilieIds, 'wahlfamilie')}
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Meine Momente</h2>
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
                    <div className="card-actions" style={{ display: 'flex', gap: '0.35rem' }}>
                      <button type="button" className="btn" onClick={() => openEditMoment(m)}>Bearbeiten</button>
                      <button type="button" className="btn-outline danger" onClick={() => deleteMoment(m.id)}>Löschen</button>
                    </div>
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
            <button type="button" className="btn" onClick={openNewMoment} style={{ marginTop: '0.5rem' }}>Moment hinzufügen</button>
          )}
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Was unsere Familie dazu weiß</h2>
          <p className="meta" style={{ margin: '0 0 0.75rem' }}>Erinnerungen, Korrekturen, Geschichten, Fotos oder Daten – von dir oder anderen.</p>
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
                  <div style={{ marginTop: '0.5rem' }}>
                    <button type="button" className="btn-outline danger" style={{ fontSize: '0.85rem' }} onClick={() => deleteBeitrag(b.id)}>Löschen</button>
                  </div>
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
            <button type="button" className="btn" onClick={openBeitragModal} style={{ marginTop: '0.5rem' }}>Was ich dazu weiß, hinzufügen</button>
          )}
        </div>

        {person && (
          <div className="card" style={{ marginTop: '1.5rem', borderColor: 'rgba(220,80,80,0.5)' }}>
            <h2 style={{ color: 'rgba(220,80,80,0.95)' }}>Person löschen</h2>
            <p className="meta" style={{ margin: '0 0 0.75rem' }}>Diese Person und alle Verknüpfungen (Eltern, Kinder, Partner, Geschwister) werden entfernt. Momente und Beiträge dieser Person gehen verloren. „Du“ oder „Herkunft Partner“ werden zurückgesetzt, falls sie auf diese Person zeigten.</p>
            {!showDeleteConfirm ? (
              <button type="button" className="btn-outline danger" onClick={() => setShowDeleteConfirm(true)}>Person löschen…</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Wirklich endgültig löschen?</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn danger" onClick={() => { if (deletePersonWithCleanup(currentTenantId, person.id)) navigate(PROJECT_ROUTES['k2-familie'].stammbaum); }}>Ja, endgültig löschen</button>
                  <button type="button" className="btn-outline" onClick={() => setShowDeleteConfirm(false)}>Abbrechen</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
