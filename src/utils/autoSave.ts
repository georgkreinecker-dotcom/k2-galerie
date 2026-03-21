/**
 * AUTO-SAVE SYSTEM - Speichert automatisch bei jedem Change
 * Verhindert Datenverlust bei Cursor-Crashes
 */

import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE, DEFAULT_OEK2_FOCUS_DIRECTION_ID } from '../config/tenantConfig'
import { readArtworksRawByKey, saveArtworksByKey, saveArtworksByKeyWithImageStore } from './artworksStorage'
import { preserveStorageImageRefs, mergeMissingFromStorage } from './syncMerge'
import { fillMissingImageRefsFromIndexedDB } from './artworkImageStore'
import { compressImageForStorage } from './compressImageForStorage'
import {
  loadStammdaten,
  saveStammdaten,
  mergeStammdatenPerson,
  mergeStammdatenGallery,
} from './stammdatenStorage'
import { loadEvents, saveEvents } from './eventsStorage'
import { loadDocuments, saveDocuments } from './documentsStorage'
import { sanitizePageContentForVk2Publish } from '../config/pageContentGalerie'

// Auto-Save alle 5 Sekunden
const AUTO_SAVE_INTERVAL = 5000

let autoSaveEnabled = true
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

/** Pausiert Auto-Save für ms Millisekunden (z. B. während Werk speichern – verhindert Überschreiben mit veraltetem State). */
export function pauseAutoSaveForMs(ms: number): void {
  autoSaveEnabled = false
  setTimeout(() => { autoSaveEnabled = true }, ms)
}

export interface AutoSaveData {
  martina?: any
  georg?: any
  gallery?: any
  artworks?: any[]
  events?: any[]
  documents?: any[]
  designSettings?: any
  pageTexts?: any
}

/** Muster (nur ök2-Kontext: id muster-* ohne _isMuster) und VK2 – nie in k2-artworks.
 *  K2-Test-Muster (_isMuster=true) werden behalten – sie wurden bewusst geladen.
 */
export function filterK2ArtworksOnly(artworks: any[]): any[] {
  if (!Array.isArray(artworks)) return []
  return artworks.filter((a: any) => {
    if (!a) return false
    const num = a.number != null ? String(a.number).trim() : ''
    const id = a.id != null ? String(a.id) : ''
    // Musterwerke mit _isMuster=true wurden bewusst in K2 geladen (Test) → behalten
    if ((a as any)._isMuster === true) return true
    // Echte ök2-Muster (id startet mit muster-) ohne _isMuster → rausfiltern
    if (id.startsWith('muster-')) return false
    if (num.startsWith('VK2-') || id.startsWith('vk2-seed-')) return false
    return true
  })
}

/**
 * Starte Auto-Save für alle Daten
 */
export function startAutoSave(getData: () => AutoSaveData) {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
  
  autoSaveTimer = setInterval(async () => {
    if (!autoSaveEnabled) return
    
    try {
      const data = getData()
      
      if (data.martina) saveStammdaten('k2', 'martina', data.martina, { merge: true })
      if (data.georg) saveStammdaten('k2', 'georg', data.georg, { merge: true })
      if (data.gallery) saveStammdaten('k2', 'gallery', data.gallery, { merge: true })
      if (data.artworks) {
        try {
          const fromStorage = readArtworksRawByKey('k2-artworks') ?? []
          let toSave = filterK2ArtworksOnly(data.artworks)
          // KRITISCH: State kann hinterherhinken (30 gerade gespeichert, State hat noch 29) – nie weniger Werke schreiben als im Speicher
          toSave = mergeMissingFromStorage(toSave, fromStorage)
          // KRITISCH: imageRef aus Speicher erhalten wenn State für ein Werk kein Bild hat
          toSave = preserveStorageImageRefs(toSave, fromStorage)
          // Fehlende imageRef aus IndexedDB wiederherstellen (Bild da, Ref in Liste verloren)
          toSave = await fillMissingImageRefsFromIndexedDB(toSave)
          await saveArtworksByKeyWithImageStore('k2-artworks', toSave, { filterK2Only: false, allowReduce: true })
        } catch (e) {
          console.warn('⚠️ Artworks zu groß für Auto-Save')
        }
      }
      if (data.events) {
        try {
          const incoming = Array.isArray(data.events) ? data.events : []
          const existingArr = loadEvents('k2')
          const hasExisting = existingArr.length > 0
          const incomingEmpty = incoming.length === 0
          // EISERN: Niemals K2 mit VK2-Daten überschreiben (z. B. Race beim Tab-Wechsel VK2→K2)
          const vk2List = loadEvents('vk2')
          const vk2Ids = new Set((vk2List || []).map((e: any) => e?.id).filter(Boolean))
          const allIdsAreVk2 = !incomingEmpty && incoming.every((e: any) => e?.id && vk2Ids.has(e.id))
          if (allIdsAreVk2) {
            console.warn('⚠️ Auto-Save: Events nicht geschrieben – Daten sehen nach VK2 aus (K2 geschützt)')
          } else if (!hasExisting || !incomingEmpty) {
            saveEvents('k2', incoming)
          }
        } catch (e) {
          console.warn('⚠️ Events zu groß für Auto-Save')
        }
      }
      if (data.documents) {
        try {
          const incoming = Array.isArray(data.documents) ? data.documents : []
          const existingArr = loadDocuments('k2')
          const hasExisting = existingArr.length > 0
          const incomingEmpty = incoming.length === 0
          // EISERN: K2 nie mit VK2-Dokumenten überschreiben (Race beim Tab-Wechsel)
          const vk2Docs = loadDocuments('vk2')
          const looksLikeVk2 = incoming.length > 0 && vk2Docs.length === incoming.length && JSON.stringify(incoming) === JSON.stringify(vk2Docs)
          if (looksLikeVk2) {
            console.warn('⚠️ Auto-Save: Dokumente nicht geschrieben – Daten sehen nach VK2 aus (K2 geschützt)')
          } else if (!hasExisting || !incomingEmpty) {
            saveDocuments('k2', incoming)
          }
        } catch (e) {
          console.warn('⚠️ Documents zu groß für Auto-Save')
        }
      }
      if (data.designSettings) {
        localStorage.setItem('k2-design-settings', JSON.stringify(data.designSettings))
      }
      if (data.pageTexts) {
        try {
          localStorage.setItem('k2-page-texts', JSON.stringify(data.pageTexts))
        } catch (e) {
          console.warn('⚠️ Seitentexte zu groß für Auto-Save')
        }
      }
      
      // Speichere Timestamp
      localStorage.setItem('k2-last-auto-save', new Date().toISOString())

      // Kein Vollbackup mehr in den localStorage – Vollbackup auf Speicherplatte (z. B. backupmicro) reicht.
      // Spart Speicherplatz und beugt „Speicher voll“ vor. Bei Bedarf: Einstellungen → Vollbackup herunterladen.

      console.log('💾 Auto-Save erfolgreich')
    } catch (error) {
      console.error('❌ Auto-Save Fehler:', error)
    }
  }, AUTO_SAVE_INTERVAL)

  console.log('✅ Auto-Save gestartet (alle 5 Sekunden, Vollbackup nur auf Speicherplatte)')
}

/**
 * Stoppe Auto-Save
 */
export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
  console.log('⏸️ Auto-Save gestoppt')
}

/**
 * Speichere sofort (ohne auf Timer zu warten) – alle Daten wie beim Intervall (Stammdaten, Werke, Events, Dokumente, …)
 */
export async function saveNow(getData: () => AutoSaveData) {
  try {
    const data = getData()

    if (data.martina) saveStammdaten('k2', 'martina', data.martina, { merge: true })
    if (data.georg) saveStammdaten('k2', 'georg', data.georg, { merge: true })
    if (data.gallery) saveStammdaten('k2', 'gallery', data.gallery, { merge: true })
    if (data.artworks) {
      try {
        const toSave = filterK2ArtworksOnly(data.artworks)
        await saveArtworksByKeyWithImageStore('k2-artworks', toSave, { filterK2Only: false, allowReduce: true })
      } catch (e) {
        console.warn('⚠️ Artworks zu groß für Sofort-Save')
      }
    }
    // KRITISCH: Niemals vorhandene Events/Dokumente mit leerem State überschreiben; niemals K2 mit VK2-Daten
    if (data.events) {
      try {
        const incoming = Array.isArray(data.events) ? data.events : []
        const existing = loadEvents('k2')
        const hasExisting = existing.length > 0
        const incomingEmpty = incoming.length === 0
        const vk2List = loadEvents('vk2')
        const vk2Ids = new Set((vk2List || []).map((e: any) => e?.id).filter(Boolean))
        const allIdsAreVk2 = incoming.length > 0 && incoming.every((e: any) => e?.id && vk2Ids.has(e.id))
        if (allIdsAreVk2) {
          console.warn('⚠️ saveNow: Events nicht geschrieben – Daten sehen nach VK2 aus (K2 geschützt)')
        } else if (!hasExisting || !incomingEmpty) {
          saveEvents('k2', incoming)
        }
      } catch (e) {
        console.warn('⚠️ Events zu groß für Sofort-Save')
      }
    }
    if (data.documents) {
      try {
        const incoming = Array.isArray(data.documents) ? data.documents : []
        const existing = loadDocuments('k2')
        const hasExisting = existing.length > 0
        const incomingEmpty = incoming.length === 0
        const vk2Docs = loadDocuments('vk2')
        const looksLikeVk2 = incoming.length > 0 && vk2Docs.length === incoming.length && JSON.stringify(incoming) === JSON.stringify(vk2Docs)
        if (looksLikeVk2) {
          console.warn('⚠️ saveNow: Dokumente nicht geschrieben – Daten sehen nach VK2 aus (K2 geschützt)')
        } else if (!hasExisting || !incomingEmpty) {
          saveDocuments('k2', incoming)
        }
      } catch (e) {
        console.warn('⚠️ Documents zu groß für Sofort-Save')
      }
    }
    if (data.designSettings) {
      localStorage.setItem('k2-design-settings', JSON.stringify(data.designSettings))
    }
    if (data.pageTexts) {
      try {
        localStorage.setItem('k2-page-texts', JSON.stringify(data.pageTexts))
      } catch (e) {
        console.warn('⚠️ Seitentexte zu groß für Sofort-Save')
      }
    }

    localStorage.setItem('k2-last-auto-save', new Date().toISOString())
    console.log('💾 Sofort-Speicherung erfolgreich')
  } catch (error) {
    console.error('❌ Sofort-Speicherung Fehler:', error)
  }
}

/**
 * Speichere vor unload (bei Crash/Close)
 */
export function setupBeforeUnloadSave(getData: () => AutoSaveData) {
  window.addEventListener('beforeunload', () => {
    saveNow(getData)
  })
  
  // Auch bei visibilitychange (Tab-Wechsel)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveNow(getData)
    }
  })
}

const FULL_BACKUP_KEY = 'k2-full-backup'

/**
 * Stellt alle Daten aus dem letzten Auto-Backup wieder her (localStorage).
 * Leere Kontaktfelder (email, phone) werden nach der Wiederherstellung aus K2_STAMMDATEN_DEFAULTS gefüllt – so geht nichts verloren.
 * @returns true wenn ein Backup gefunden und wiederhergestellt wurde, sonst false
 */
export function restoreFromBackup(): boolean {
  try {
    const raw = localStorage.getItem(FULL_BACKUP_KEY)
    if (!raw) return false
    const backup = JSON.parse(raw)
    if (!backup || !backup.backupAt) return false

    const dm = K2_STAMMDATEN_DEFAULTS.martina
    const dg = K2_STAMMDATEN_DEFAULTS.georg
    const dgal = K2_STAMMDATEN_DEFAULTS.gallery

    if (backup.martina) {
      const m = mergeStammdatenPerson(backup.martina, {}, dm)
      saveStammdaten('k2', 'martina', m, { merge: false })
    }
    if (backup.georg) {
      const g = mergeStammdatenPerson(backup.georg, {}, dg)
      saveStammdaten('k2', 'georg', g, { merge: false })
    }
    if (backup.gallery) {
      const gal = mergeStammdatenGallery(backup.gallery, {}, dgal)
      saveStammdaten('k2', 'gallery', gal, { merge: false })
    }
    // Nur echte K2-Werke wiederherstellen – niemals VK2-Werke in k2-artworks schreiben
    if (Array.isArray(backup.artworks)) {
      const looksLikeVk2 = backup.artworks.some((a: any) =>
        (a?.id && String(a.id).startsWith('vk2-seed-')) || (a?.number && String(a.number).startsWith('VK2-'))
      )
      if (!looksLikeVk2) {
        saveArtworksByKey('k2-artworks', backup.artworks, { filterK2Only: false, allowReduce: true })
      } else {
        console.warn('⚠️ Backup enthält VK2-Werke – k2-artworks wurde nicht überschrieben (K2/VK2-Trennung).')
      }
    }
    if (Array.isArray(backup.events)) saveEvents('k2', backup.events)
    if (Array.isArray(backup.documents)) saveDocuments('k2', backup.documents)
    if (Array.isArray(backup.customers)) {
      localStorage.setItem('k2-customers', JSON.stringify(backup.customers))
    }
    if (backup.designSettings) {
      localStorage.setItem('k2-design-settings', JSON.stringify(backup.designSettings))
    }
    if (backup.pageTexts != null) {
      localStorage.setItem('k2-page-texts', JSON.stringify(backup.pageTexts))
    }
    if (backup.pageContentGalerie != null && typeof backup.pageContentGalerie === 'string') {
      localStorage.setItem('k2-page-content-galerie', backup.pageContentGalerie)
    }

    console.log('💾 Wiederherstellung aus Backup:', backup.backupAt)
    return true
  } catch (e) {
    console.error('❌ Wiederherstellung aus Backup fehlgeschlagen:', e)
    return false
  }
}

/**
 * Stellt alle Daten aus einer Backup-Datei wieder her (z. B. zuvor mit „Vollbackup herunterladen“ gespeichert).
 * Gleiches Format wie k2-full-backup: { martina, georg, gallery, artworks, events, documents, customers?, designSettings, pageTexts, backupAt? }
 * @returns true wenn das Objekt gültig war und geschrieben wurde
 */
export function restoreFromBackupFile(backup: {
  martina?: any
  georg?: any
  gallery?: any
  artworks?: any[]
  events?: any[]
  documents?: any[]
  customers?: any[]
  designSettings?: any
  pageTexts?: any
  pageContentGalerie?: string
}): boolean {
  try {
    if (!backup || (typeof backup !== 'object')) return false
    const dm = K2_STAMMDATEN_DEFAULTS.martina
    const dg = K2_STAMMDATEN_DEFAULTS.georg
    const dgal = K2_STAMMDATEN_DEFAULTS.gallery

    if (backup.martina && typeof backup.martina === 'object') {
      const m = mergeStammdatenPerson(backup.martina, {}, dm)
      saveStammdaten('k2', 'martina', m, { merge: false })
    }
    if (backup.georg && typeof backup.georg === 'object') {
      const g = mergeStammdatenPerson(backup.georg, {}, dg)
      saveStammdaten('k2', 'georg', g, { merge: false })
    }
    if (backup.gallery && typeof backup.gallery === 'object') {
      const gal = mergeStammdatenGallery(backup.gallery, {}, dgal)
      saveStammdaten('k2', 'gallery', gal, { merge: false })
    }
    // Nur echte K2-Werke wiederherstellen – niemals VK2-Werke in k2-artworks schreiben
    if (Array.isArray(backup.artworks)) {
      const looksLikeVk2 = backup.artworks.some((a: any) =>
        (a?.id && String(a.id).startsWith('vk2-seed-')) || (a?.number && String(a.number).startsWith('VK2-'))
      )
      if (!looksLikeVk2) {
        saveArtworksByKey('k2-artworks', backup.artworks, { filterK2Only: false, allowReduce: true })
      } else {
        console.warn('⚠️ Backup-Datei enthält VK2-Werke – k2-artworks wurde nicht überschrieben (K2/VK2-Trennung).')
      }
    }
    if (Array.isArray(backup.events)) saveEvents('k2', backup.events)
    if (Array.isArray(backup.documents)) saveDocuments('k2', backup.documents)
    if (Array.isArray(backup.customers)) {
      localStorage.setItem('k2-customers', JSON.stringify(backup.customers))
    }
    if (backup.designSettings != null) {
      localStorage.setItem('k2-design-settings', JSON.stringify(backup.designSettings))
    }
    if (backup.pageTexts != null) {
      try {
        localStorage.setItem('k2-page-texts', JSON.stringify(backup.pageTexts))
      } catch (_) {}
    }
    if (backup.pageContentGalerie != null && typeof backup.pageContentGalerie === 'string') {
      localStorage.setItem('k2-page-content-galerie', backup.pageContentGalerie)
    }
    console.log('💾 Wiederherstellung aus Backup-Datei erfolgreich')
    return true
  } catch (e) {
    console.error('❌ Wiederherstellung aus Backup-Datei fehlgeschlagen:', e)
    return false
  }
}

/**
 * Prüft ob ein Auto-Backup vorhanden ist (für Anzeige im UI)
 */
export function hasBackup(): boolean {
  try {
    const raw = localStorage.getItem(FULL_BACKUP_KEY)
    if (!raw) return false
    const backup = JSON.parse(raw)
    return !!(backup && backup.backupAt)
  } catch {
    return false
  }
}

const BACKUP_TIMESTAMPS_KEY = 'k2-backup-timestamps'

/**
 * Gibt das Datum des letzten Backups zurück (für Anzeige)
 */
export function getBackupTimestamp(): string | null {
  try {
    const raw = localStorage.getItem(FULL_BACKUP_KEY)
    if (!raw) return null
    const backup = JSON.parse(raw)
    return backup?.backupAt || null
  } catch {
    return null
  }
}

/**
 * Gibt die letzten Backup-Zeitpunkte zurück (Verlauf, neueste zuerst)
 */
export function getBackupTimestamps(): string[] {
  try {
    const raw = localStorage.getItem(BACKUP_TIMESTAMPS_KEY)
    let list: string[] = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) list = []
    // Falls noch kein Verlauf gespeichert, aktuelles Backup einmal anzeigen
    if (list.length === 0) {
      const last = getBackupTimestamp()
      if (last) list = [last]
    }
    return list
  } catch {
    return []
  }
}

/** Nur Metadaten: Zeitpunkt des letzten „Sicherungskopie herunterladen“ (ök2/VK2) – kein Ersatz für Vollbackup-Buttons */
const LAST_EXPORT_OEK2_KEY = 'k2-oeffentlich-last-backup-export-at'
const LAST_EXPORT_VK2_KEY = 'k2-vk2-last-backup-export-at'

export function recordLastBackupDownloadExported(tenant: 'oeffentlich' | 'vk2'): void {
  try {
    const iso = new Date().toISOString()
    localStorage.setItem(tenant === 'oeffentlich' ? LAST_EXPORT_OEK2_KEY : LAST_EXPORT_VK2_KEY, iso)
  } catch {
    /* ignore */
  }
}

export function getLastBackupDownloadExported(tenant: 'oeffentlich' | 'vk2'): string | null {
  try {
    const raw = localStorage.getItem(tenant === 'oeffentlich' ? LAST_EXPORT_OEK2_KEY : LAST_EXPORT_VK2_KEY)
    return raw && raw.trim() ? raw.trim() : null
  } catch {
    return null
  }
}
/**
 * Setzt K2- und ök2-Stammdaten auf den Repo-Stand (Zustand vor Tom/VK2-Überschreibung).
 * Schreibt k2-stammdaten-* und k2-oeffentlich-stammdaten-* mit allen Feldern (Öffnungszeiten etc.).
 * Keine Änderung an Werken, Events, VK2-Mitgliedern.
 */
export function restoreK2AndOek2StammdatenFromRepo(): void {
  const km = K2_STAMMDATEN_DEFAULTS.martina
  const kg = K2_STAMMDATEN_DEFAULTS.georg
  const kGal = K2_STAMMDATEN_DEFAULTS.gallery
  saveStammdaten('k2', 'martina', { name: km.name, email: km.email, phone: km.phone, website: km.website ?? '', category: 'malerei', bio: '' }, { merge: false })
  saveStammdaten('k2', 'georg', { name: kg.name, email: kg.email, phone: kg.phone, website: kg.website ?? '', category: 'keramik', bio: '' }, { merge: false })
  saveStammdaten('k2', 'gallery', {
    name: kGal.name,
    address: kGal.address ?? '',
    city: kGal.city ?? '',
    country: kGal.country ?? '',
    phone: kGal.phone ?? '',
    email: kGal.email ?? '',
    website: kGal.website ?? '',
    internetadresse: kGal.internetadresse ?? '',
    openingHours: kGal.openingHours ?? '',
    openingHoursWeek: (kGal as { openingHoursWeek?: Record<string, string> }).openingHoursWeek ?? {},
    bankverbindung: kGal.bankverbindung ?? '',
    gewerbebezeichnung: (kGal as { gewerbebezeichnung?: string }).gewerbebezeichnung ?? 'freie Kunstschaffende',
    welcomeImage: '',
    virtualTourImage: '',
    galerieCardImage: '',
    soldArtworksDisplayDays: 30,
    internetShopNotSetUp: true,
  }, { merge: false })

  const om = MUSTER_TEXTE.martina
  const og = MUSTER_TEXTE.georg
  const oGal = MUSTER_TEXTE.gallery
  const oGalFd = (oGal as { focusDirections?: readonly string[] }).focusDirections
  const oGalFocus = Array.isArray(oGalFd) && oGalFd.length > 0 ? [oGalFd[0]] : [DEFAULT_OEK2_FOCUS_DIRECTION_ID]
  saveStammdaten('oeffentlich', 'martina', { name: om.name, email: om.email, phone: om.phone, website: om.website ?? '', category: 'malerei', bio: '' }, { merge: false })
  saveStammdaten('oeffentlich', 'georg', { name: og.name, email: og.email, phone: og.phone, website: og.website ?? '', category: 'keramik', bio: '' }, { merge: false })
  saveStammdaten('oeffentlich', 'gallery', {
    name: 'Galerie Muster',
    address: oGal.address ?? '',
    city: oGal.city ?? '',
    country: oGal.country ?? '',
    phone: oGal.phone ?? '',
    email: oGal.email ?? '',
    website: oGal.website ?? '',
    internetadresse: oGal.internetadresse ?? '',
    openingHours: oGal.openingHours ?? '',
    openingHoursWeek: (oGal as { openingHoursWeek?: Record<string, string> }).openingHoursWeek ?? {},
    bankverbindung: oGal.bankverbindung ?? '',
    gewerbebezeichnung: (oGal as { gewerbebezeichnung?: string }).gewerbebezeichnung ?? 'freie Kunstschaffende',
    welcomeImage: oGal.welcomeImage ?? '',
    virtualTourImage: oGal.virtualTourImage ?? '',
    galerieCardImage: oGal.galerieCardImage ?? '',
    soldArtworksDisplayDays: 30,
    internetShopNotSetUp: true,
    focusDirections: oGalFocus,
    story: (oGal as { story?: string }).story ?? '',
  }, { merge: false })

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('k2-oek2-stammdaten-restored'))
    }
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════════════════
// VOLLBACKUP PRO KONTEXT – K2, ök2, VK2
// Jeder Kontext hat seine eigene Backup-Funktion und eigene Wiederherstellung.
// Alle drei können im Systemchaos vollständig wiederhergestellt werden.
// ═══════════════════════════════════════════════════════════════════════════

/** Erstellt ein vollständiges Backup-Objekt für einen Kontext.
 *  Liest alle relevanten localStorage-Keys und gibt sie als Objekt zurück. */
function readAllKeys(keys: string[]): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (raw && raw.length > 0 && raw.length < 8 * 1024 * 1024) {
        try { result[key] = JSON.parse(raw) } catch { result[key] = raw }
      }
    } catch (_) {}
  }
  return result
}

/** K2-Vollbackup: Stammdaten (Martina, Georg, Galerie) + Werke + Events + Dokumente + Kunden + Design */
export function createK2Backup(): { data: Record<string, any>; filename: string } {
  const keys = [
    'k2-stammdaten-martina',
    'k2-stammdaten-georg',
    'k2-stammdaten-galerie',
    'k2-artworks',
    'k2-events',
    'k2-documents',
    'k2-customers',
    'k2-design-settings',
    'k2-page-texts',
    'k2-page-content-galerie',
    'k2-registrierung',
  ]
  const data = {
    kontext: 'k2',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    label: 'K2 Vollbackup – Stammdaten, Werke, Events, Dokumente, Design',
    ...readAllKeys(keys),
  }
  const filename = `k2-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
  return { data, filename }
}

/** ök2-Vollbackup: Demo-Stammdaten + Demo-Werke + Demo-Events + Demo-Dokumente + Demo-Design */
export function createOek2Backup(): { data: Record<string, any>; filename: string } {
  const keys = [
    'k2-oeffentlich-stammdaten-martina',
    'k2-oeffentlich-stammdaten-georg',
    'k2-oeffentlich-stammdaten-galerie',
    'k2-oeffentlich-artworks',
    'k2-oeffentlich-events',
    'k2-oeffentlich-documents',
    'k2-oeffentlich-design-settings',
    'k2-oeffentlich-page-texts',
    'k2-oeffentlich-page-content-galerie',
    'k2-oeffentlich-registrierung',
  ]
  const data = {
    kontext: 'oeffentlich',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    label: 'ök2 Demo-Backup – Demo-Stammdaten, Demo-Werke, Demo-Events, Demo-Design',
    ...readAllKeys(keys),
  }
  const filename = `oek2-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
  return { data, filename }
}

/** K2-Bild-URL – darf nie in VK2-Payload. */
function isK2OriginImageUrl(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/img/k2/')
}

/** VK2-Vollbackup: Vereins-Stammdaten (Vorstand + Mitglieder) + Events + Dokumente + Design + Eingangskarten */
export function createVk2Backup(): { data: Record<string, any>; filename: string } {
  const keys = [
    'k2-vk2-stammdaten',      // Verein, Vorstand, Mitglieder-Liste
    'k2-vk2-events',
    'k2-vk2-documents',
    'k2-vk2-design-settings',
    'k2-vk2-page-texts',
    'k2-vk2-page-content-galerie',
    'k2-vk2-eingangskarten',  // Zwei Design-Karten (Titel, Untertitel, Bild)
    'k2-vk2-registrierung',
  ]
  const raw = readAllKeys(keys)
  // Eisernes Gesetz: Keine K2-Daten in VK2. Seitengestaltung vor Veröffentlichen von K2-Bild-URLs bereinigen.
  let pc = raw['k2-vk2-page-content-galerie']
  if (pc != null) {
    if (typeof pc === 'string') {
      try {
        pc = JSON.parse(pc) as Record<string, unknown>
      } catch {
        pc = null
      }
    }
    if (pc != null && typeof pc === 'object') {
      raw['k2-vk2-page-content-galerie'] = sanitizePageContentForVk2Publish(pc as Record<string, unknown>)
    }
  }
  // Eingangskarten: K2-Bild-URLs aus Bildern entfernen
  const karten = raw['k2-vk2-eingangskarten']
  if (Array.isArray(karten) && karten.length > 0) {
    raw['k2-vk2-eingangskarten'] = karten.map((k: { titel?: string; untertitel?: string; imageUrl?: string }) =>
      k && typeof k === 'object' && isK2OriginImageUrl(k.imageUrl)
        ? { ...k, imageUrl: '' }
        : k
    )
  }
  const data = {
    kontext: 'vk2',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    label: 'VK2 Vereins-Backup – Stammdaten, Vorstand, Mitglieder, Events, Design',
    ...raw,
  }
  const filename = `vk2-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
  return { data, filename }
}

const K2_FAMILIE_PREFIX = 'k2-familie-'

/** Sammelt alle localStorage-Keys die mit k2-familie- beginnen (für Backup). */
function getK2FamilieStorageKeys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(K2_FAMILIE_PREFIX)) keys.push(key)
    }
  } catch (_) {}
  return keys
}

/** K2-Familie-Vollbackup: alle k2-familie-* Keys (Tenant-Liste, pro Familie: Personen, Momente, Events, Seitentexte). */
export function createK2FamilieBackup(): { data: Record<string, any>; filename: string } {
  const keys = getK2FamilieStorageKeys()
  const raw = readAllKeys(keys)
  const data = {
    kontext: 'k2-familie',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    label: 'K2 Familie – Backup (alle Familien, Personen, Momente, Events)',
    ...raw,
  }
  const filename = `k2-familie-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
  return { data, filename }
}

/** Hilfsfunktion: Backup-Objekt als JSON-Datei herunterladen */
export function downloadBackupAsFile(data: Record<string, any>, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 300)
}

/** K2-Backup wiederherstellen – schreibt alle K2-Keys aus der Backup-Datei zurück */
export function restoreK2FromBackup(backup: Record<string, any>): { ok: boolean; restored: string[] } {
  const restored: string[] = []
  if (!backup || backup.kontext !== 'k2') {
    // Auch altes Format (ohne kontext-Feld) akzeptieren für Abwärtskompatibilität
    if (!backup || (backup.kontext && backup.kontext !== 'k2')) {
      return { ok: false, restored: [] }
    }
  }
  const k2Keys = [
    'k2-stammdaten-martina', 'k2-stammdaten-georg', 'k2-stammdaten-galerie',
    'k2-artworks', 'k2-events', 'k2-documents', 'k2-customers',
    'k2-design-settings', 'k2-page-texts', 'k2-page-content-galerie', 'k2-registrierung',
  ]
  for (const key of k2Keys) {
    if (backup[key] != null) {
      try {
        const val = typeof backup[key] === 'string' ? backup[key] : JSON.stringify(backup[key])
        localStorage.setItem(key, val)
        restored.push(key)
      } catch (_) {}
    }
  }
  return { ok: restored.length > 0, restored }
}

/** ök2-Backup wiederherstellen */
export function restoreOek2FromBackup(backup: Record<string, any>): { ok: boolean; restored: string[] } {
  const restored: string[] = []
  if (!backup || backup.kontext !== 'oeffentlich') return { ok: false, restored: [] }
  const oek2Keys = [
    'k2-oeffentlich-stammdaten-martina', 'k2-oeffentlich-stammdaten-georg', 'k2-oeffentlich-stammdaten-galerie',
    'k2-oeffentlich-artworks', 'k2-oeffentlich-events', 'k2-oeffentlich-documents',
    'k2-oeffentlich-design-settings', 'k2-oeffentlich-page-texts', 'k2-oeffentlich-page-content-galerie', 'k2-oeffentlich-registrierung',
  ]
  for (const key of oek2Keys) {
    if (backup[key] != null) {
      try {
        const val = typeof backup[key] === 'string' ? backup[key] : JSON.stringify(backup[key])
        localStorage.setItem(key, val)
        restored.push(key)
      } catch (_) {}
    }
  }
  return { ok: restored.length > 0, restored }
}

/** VK2-Backup wiederherstellen – Mitglieder, Vorstand, Events */
export function restoreVk2FromBackup(backup: Record<string, any>): { ok: boolean; restored: string[] } {
  const restored: string[] = []
  if (!backup || backup.kontext !== 'vk2') return { ok: false, restored: [] }
  const vk2Keys = [
    'k2-vk2-stammdaten', 'k2-vk2-events', 'k2-vk2-documents',
    'k2-vk2-design-settings', 'k2-vk2-page-texts', 'k2-vk2-page-content-galerie', 'k2-vk2-eingangskarten', 'k2-vk2-registrierung',
  ]
  for (const key of vk2Keys) {
    if (backup[key] != null) {
      try {
        const val = typeof backup[key] === 'string' ? backup[key] : JSON.stringify(backup[key])
        localStorage.setItem(key, val)
        restored.push(key)
      } catch (_) {}
    }
  }
  return { ok: restored.length > 0, restored }
}

/** K2-Familie-Backup wiederherstellen – schreibt alle k2-familie-* Keys aus der Backup-Datei zurück.
 * Tenant-Liste wird gemerged: Familien, die lokal noch Daten haben (z. B. Musterfamilie huber), bleiben in der Liste,
 * damit sie nicht „verschwinden“, wenn das Backup von vor dem Anlegen der Musterfamilie stammt. */
export function restoreK2FamilieFromBackup(backup: Record<string, any>): { ok: boolean; restored: string[] } {
  const restored: string[] = []
  if (!backup || backup.kontext !== 'k2-familie') return { ok: false, restored: [] }
  const tenantListKey = 'k2-familie-tenant-list'
  let currentTenantList: string[] = []
  try {
    const raw = localStorage.getItem(tenantListKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      currentTenantList = Array.isArray(parsed) ? parsed : []
    }
  } catch (_) {}

  const metaKeys = ['kontext', 'exportedAt', 'version', 'label']
  for (const key of Object.keys(backup)) {
    if (metaKeys.includes(key) || !key.startsWith(K2_FAMILIE_PREFIX)) continue
    try {
      let val = typeof backup[key] === 'string' ? backup[key] : JSON.stringify(backup[key])
      if (key === tenantListKey) {
        const backupList: string[] = (() => {
          try {
            const p = typeof backup[key] === 'string' ? JSON.parse(backup[key]) : backup[key]
            return Array.isArray(p) ? p : []
          } catch {
            return []
          }
        })()
        const merged = [...backupList]
        for (const id of currentTenantList) {
          if (merged.includes(id)) continue
          try {
            const personenRaw = localStorage.getItem(`${K2_FAMILIE_PREFIX}${id}-personen`)
            const personen = personenRaw ? JSON.parse(personenRaw) : []
            if (Array.isArray(personen) && personen.length > 0) merged.push(id)
          } catch (_) {}
        }
        val = JSON.stringify(merged)
      }
      localStorage.setItem(key, val)
      restored.push(key)
    } catch (_) {}
  }
  return { ok: restored.length > 0, restored }
}

/**
 * K2-Familie Merge: Daten aus einer Backup-Datei in die bestehende Familie mergen (kein Ersetzen).
 * Personen, Momente, Events, Gaben, Beiträge: nach ID mergen (aus Datei ergänzen/aktualisieren).
 * Einstellungen/Zweige: Objekt- bzw. Array-Merge. Tenant-Liste: Vereinigung.
 */
export function mergeK2FamilieFromBackup(backup: Record<string, any>): { ok: boolean; merged: string[] } {
  const merged: string[] = []
  if (!backup || backup.kontext !== 'k2-familie') return { ok: false, merged: [] }

  const tenantListKey = 'k2-familie-tenant-list'
  const suffixes = ['personen', 'momente', 'events', 'gaben', 'beitraege', 'einstellungen', 'zweige', 'geschichten'] as const

  let backupTenantIds: string[] = []
  try {
    const raw = backup[tenantListKey]
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    backupTenantIds = Array.isArray(parsed) ? parsed : []
  } catch (_) {}
  if (backupTenantIds.length === 0) {
    const seen = new Set<string>()
    for (const key of Object.keys(backup)) {
      const m = key.match(/^k2-familie-(.+)-personen$/)
      if (m) seen.add(m[1])
    }
    backupTenantIds = [...seen]
  }

  const mergeArrayById = (current: any[], fromFile: any[]): any[] => {
    if (!Array.isArray(fromFile)) return current
    const byId = new Map<string, any>()
    for (const item of current) if (item && item.id) byId.set(item.id, item)
    for (const item of fromFile) if (item && item.id) byId.set(item.id, item)
    return [...byId.values()]
  }

  const mergeObjects = (current: Record<string, any>, fromFile: Record<string, any>): Record<string, any> => {
    if (!fromFile || typeof fromFile !== 'object') return current
    return { ...current, ...fromFile }
  }

  for (const tenantId of backupTenantIds) {
    for (const suffix of suffixes) {
      const key = `${K2_FAMILIE_PREFIX}${tenantId}-${suffix}`
      const fileVal = backup[key]
      if (fileVal === undefined) continue

      try {
        let newVal: string
        if (suffix === 'einstellungen') {
          const curRaw = localStorage.getItem(key)
          let cur: Record<string, any> = {}
          if (curRaw) try { cur = JSON.parse(curRaw) } catch (_) {}
          const fromFile = typeof fileVal === 'string' ? JSON.parse(fileVal) : fileVal
          newVal = JSON.stringify(mergeObjects(cur, fromFile || {}))
        } else if (suffix === 'zweige' || suffix === 'personen' || suffix === 'momente' || suffix === 'events' || suffix === 'gaben' || suffix === 'beitraege' || suffix === 'geschichten') {
          const curRaw = localStorage.getItem(key)
          let cur: any[] = []
          if (curRaw) try { cur = JSON.parse(curRaw); if (!Array.isArray(cur)) cur = [] } catch (_) {}
          const fromFile = typeof fileVal === 'string' ? JSON.parse(fileVal) : fileVal
          const arr = Array.isArray(fromFile) ? fromFile : []
          newVal = JSON.stringify(mergeArrayById(cur, arr))
        } else {
          newVal = typeof fileVal === 'string' ? fileVal : JSON.stringify(fileVal)
        }
        localStorage.setItem(key, newVal)
        if (!merged.includes(key)) merged.push(key)
      } catch (_) {}
    }
  }

  const currentListRaw = localStorage.getItem(tenantListKey)
  let currentList: string[] = []
  if (currentListRaw) try { currentList = JSON.parse(currentListRaw) } catch (_) {}
  const combined = [...currentList]
  for (const id of backupTenantIds) {
    if (!combined.includes(id)) combined.push(id)
  }
  if (combined.length > 0) {
    try {
      localStorage.setItem(tenantListKey, JSON.stringify(combined))
      if (!merged.includes(tenantListKey)) merged.push(tenantListKey)
    } catch (_) {}
  }

  return { ok: merged.length > 0, merged }
}

/** Erkennt automatisch den Kontext einer Backup-Datei (k2 / oeffentlich / vk2 / k2-familie / unbekannt) */
export function detectBackupKontext(backup: Record<string, any>): 'k2' | 'oeffentlich' | 'vk2' | 'k2-familie' | 'unbekannt' {
  if (!backup || typeof backup !== 'object') return 'unbekannt'
  if (backup.kontext === 'k2') return 'k2'
  if (backup.kontext === 'oeffentlich') return 'oeffentlich'
  if (backup.kontext === 'vk2') return 'vk2'
  if (backup.kontext === 'k2-familie') return 'k2-familie'
  // Altes Format erkennen
  if (backup['k2-artworks'] || backup.artworks || backup.martina) return 'k2'
  if (backup['k2-vk2-stammdaten']) return 'vk2'
  if (backup['k2-oeffentlich-artworks']) return 'oeffentlich'
  if (backup['k2-familie-tenant-list']) return 'k2-familie'
  return 'unbekannt'
}

/** Speicher entlasten: Alle Werkbilder im angegebenen Key nachkomprimieren (artwork-Standard).
 * Keine Daten löschen – nur Bilder verkleinern, damit bei vielen Werken der localStorage nicht voll läuft. */
export async function compressAllArtworkImages(storageKey: string): Promise<{ ok: boolean; count: number; savedBytes: number; error?: string }> {
  let savedBytes = 0
  try {
    const list = readArtworksRawByKey(storageKey)
    if (!Array.isArray(list) || list.length === 0) {
      return { ok: true, count: 0, savedBytes: 0 }
    }
    let count = 0
    const updated = await Promise.all(list.map(async (a: any) => {
      const url = a?.imageUrl
      if (typeof url !== 'string' || !url.startsWith('data:image')) return a
      try {
        const compressed = await compressImageForStorage(url, { context: 'artwork' })
        const before = url.length
        const after = compressed.length
        if (after < before) {
          savedBytes += before - after
          count++
        }
        return { ...a, imageUrl: compressed }
      } catch {
        return a
      }
    }))
    const ok = saveArtworksByKey(storageKey, updated, { filterK2Only: storageKey === 'k2-artworks', allowReduce: true })
    return { ok, count, savedBytes, error: ok ? undefined : 'Speichern fehlgeschlagen (Speicher voll?)' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, count: 0, savedBytes: 0, error: msg }
  }
}

