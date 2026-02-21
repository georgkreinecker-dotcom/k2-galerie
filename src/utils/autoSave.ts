/**
 * AUTO-SAVE SYSTEM - Speichert automatisch bei jedem Change
 * Verhindert Datenverlust bei Cursor-Crashes
 */

import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE } from '../config/tenantConfig'

// Auto-Save alle 5 Sekunden
const AUTO_SAVE_INTERVAL = 5000

let autoSaveEnabled = true
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

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

/** Niemals leere Kontaktfelder persistieren: vorhanden > Repo-Standard */
function mergeStammdatenPerson(incoming: any, existing: any, defaults: { name: string; email: string; phone: string; website?: string }) {
  const e = existing && typeof existing === 'object' ? existing : {}
  return {
    ...incoming,
    name: (incoming?.name && String(incoming.name).trim()) || e.name || defaults.name,
    email: (incoming?.email && String(incoming.email).trim()) || (e.email && String(e.email).trim()) || defaults.email,
    phone: (incoming?.phone && String(incoming.phone).trim()) || (e.phone && String(e.phone).trim()) || defaults.phone,
    website: (incoming?.website && String(incoming.website).trim()) || (e.website && String(e.website).trim()) || (defaults.website || '')
  }
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

function mergeStammdatenGallery(incoming: any, existing: any, defaults: typeof K2_STAMMDATEN_DEFAULTS.gallery) {
  const e = existing && typeof existing === 'object' ? existing : {}
  return {
    ...incoming,
    name: (incoming?.name && String(incoming.name).trim()) || e.name || defaults.name,
    address: (incoming?.address != null && String(incoming.address).trim()) ? incoming.address : (e.address || defaults.address),
    city: (incoming?.city != null && String(incoming.city).trim()) ? incoming.city : (e.city || defaults.city),
    country: (incoming?.country != null && String(incoming.country).trim()) ? incoming.country : (e.country || defaults.country),
    phone: (incoming?.phone && String(incoming.phone).trim()) || (e.phone && String(e.phone).trim()) || defaults.phone,
    email: (incoming?.email && String(incoming.email).trim()) || (e.email && String(e.email).trim()) || defaults.email,
    website: (incoming?.website != null && String(incoming.website).trim()) ? incoming.website : (e.website || defaults.website || ''),
    internetadresse: (incoming?.internetadresse != null && String(incoming.internetadresse).trim()) ? incoming.internetadresse : (e.internetadresse || defaults.internetadresse || ''),
    openingHours: (incoming?.openingHours != null && String(incoming.openingHours).trim()) ? incoming.openingHours : ((e as any)?.openingHours || defaults.openingHours || ''),
    bankverbindung: (incoming?.bankverbindung != null && String(incoming.bankverbindung).trim()) ? incoming.bankverbindung : (e.bankverbindung || defaults.bankverbindung || ''),
    gewerbebezeichnung: (incoming?.gewerbebezeichnung != null && String(incoming.gewerbebezeichnung).trim()) ? incoming.gewerbebezeichnung : ((e as any)?.gewerbebezeichnung || (defaults as any)?.gewerbebezeichnung || 'freie Kunstschaffende')
  }
}

/**
 * Starte Auto-Save für alle Daten
 */
export function startAutoSave(getData: () => AutoSaveData) {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
  
  autoSaveTimer = setInterval(() => {
    if (!autoSaveEnabled) return
    
    try {
      const data = getData()
      
      // Stammdaten: Niemals vorhandene E-Mail/Telefon mit leer überschreiben (Quelle: vorhanden > Repo-Standard)
      if (data.martina) {
        let existing: any = null
        try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-martina') || 'null') } catch (_) {}
        const merged = mergeStammdatenPerson(data.martina, existing, K2_STAMMDATEN_DEFAULTS.martina)
        localStorage.setItem('k2-stammdaten-martina', JSON.stringify({ ...data.martina, ...merged }))
      }
      if (data.georg) {
        let existing: any = null
        try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-georg') || 'null') } catch (_) {}
        const merged = mergeStammdatenPerson(data.georg, existing, K2_STAMMDATEN_DEFAULTS.georg)
        localStorage.setItem('k2-stammdaten-georg', JSON.stringify({ ...data.georg, ...merged }))
      }
      if (data.gallery) {
        let existing: any = null
        try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || 'null') } catch (_) {}
        const merged = mergeStammdatenGallery(data.gallery, existing, K2_STAMMDATEN_DEFAULTS.gallery)
        localStorage.setItem('k2-stammdaten-galerie', JSON.stringify({ ...data.gallery, ...merged }))
      }
      if (data.artworks) {
        try {
          const toSave = filterK2ArtworksOnly(data.artworks)
          localStorage.setItem('k2-artworks', JSON.stringify(toSave))
        } catch (e) {
          console.warn('⚠️ Artworks zu groß für Auto-Save')
        }
      }
      if (data.events) {
        try {
          const existingRaw = localStorage.getItem('k2-events')
          const existingArr = existingRaw ? JSON.parse(existingRaw) : []
          const hasExisting = Array.isArray(existingArr) && existingArr.length > 0
          const incomingEmpty = !Array.isArray(data.events) || data.events.length === 0
          if (hasExisting && incomingEmpty) {
            // Niemals vorhandene Eventplanung mit leerem Zustand überschreiben
          } else {
            localStorage.setItem('k2-events', JSON.stringify(data.events))
          }
        } catch (e) {
          console.warn('⚠️ Events zu groß für Auto-Save')
        }
      }
      if (data.documents) {
        try {
          const existingRaw = localStorage.getItem('k2-documents')
          const existingArr = existingRaw ? JSON.parse(existingRaw) : []
          const hasExisting = Array.isArray(existingArr) && existingArr.length > 0
          const incomingEmpty = !Array.isArray(data.documents) || data.documents.length === 0
          if (hasExisting && incomingEmpty) {
            // Niemals vorhandene Dokumente mit leerem Zustand überschreiben
          } else {
            localStorage.setItem('k2-documents', JSON.stringify(data.documents))
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
export function saveNow(getData: () => AutoSaveData) {
  try {
    const data = getData()

    if (data.martina) {
      let existing: any = null
      try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-martina') || 'null') } catch (_) {}
      const merged = mergeStammdatenPerson(data.martina, existing, K2_STAMMDATEN_DEFAULTS.martina)
      localStorage.setItem('k2-stammdaten-martina', JSON.stringify({ ...data.martina, ...merged }))
    }
    if (data.georg) {
      let existing: any = null
      try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-georg') || 'null') } catch (_) {}
      const merged = mergeStammdatenPerson(data.georg, existing, K2_STAMMDATEN_DEFAULTS.georg)
      localStorage.setItem('k2-stammdaten-georg', JSON.stringify({ ...data.georg, ...merged }))
    }
    if (data.gallery) {
      let existing: any = null
      try { existing = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || 'null') } catch (_) {}
      const merged = mergeStammdatenGallery(data.gallery, existing, K2_STAMMDATEN_DEFAULTS.gallery)
      localStorage.setItem('k2-stammdaten-galerie', JSON.stringify({ ...data.gallery, ...merged }))
    }
    if (data.artworks) {
      try {
        const toSave = filterK2ArtworksOnly(data.artworks)
        localStorage.setItem('k2-artworks', JSON.stringify(toSave))
      } catch (e) {
        console.warn('⚠️ Artworks zu groß für Sofort-Save')
      }
    }
    // KRITISCH: Niemals vorhandene Events/Dokumente mit leerem State überschreiben (verhindert Datenverlust beim Tab-Wechsel/Reload)
    if (data.events) {
      try {
        const incomingEmpty = !Array.isArray(data.events) || data.events.length === 0
        const existingRaw = localStorage.getItem('k2-events')
        const existing = existingRaw ? JSON.parse(existingRaw) : []
        const hasExisting = Array.isArray(existing) && existing.length > 0
        if (hasExisting && incomingEmpty) {
          // Lokale Events behalten – State war vielleicht noch nicht geladen
        } else {
          localStorage.setItem('k2-events', JSON.stringify(data.events))
        }
      } catch (e) {
        console.warn('⚠️ Events zu groß für Sofort-Save')
      }
    }
    if (data.documents) {
      try {
        const incomingEmpty = !Array.isArray(data.documents) || data.documents.length === 0
        const existingRaw = localStorage.getItem('k2-documents')
        const existing = existingRaw ? JSON.parse(existingRaw) : []
        const hasExisting = Array.isArray(existing) && existing.length > 0
        if (hasExisting && incomingEmpty) {
          // Lokale Dokumente behalten
        } else {
          localStorage.setItem('k2-documents', JSON.stringify(data.documents))
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
      const m = { ...backup.martina }
      if (!m.email?.trim()) m.email = dm.email
      if (!m.phone?.trim()) m.phone = dm.phone
      if (!m.name?.trim()) m.name = dm.name
      localStorage.setItem('k2-stammdaten-martina', JSON.stringify(m))
    }
    if (backup.georg) {
      const g = { ...backup.georg }
      if (!g.email?.trim()) g.email = dg.email
      if (!g.phone?.trim()) g.phone = dg.phone
      if (!g.name?.trim()) g.name = dg.name
      localStorage.setItem('k2-stammdaten-georg', JSON.stringify(g))
    }
    if (backup.gallery) {
      const merged = mergeStammdatenGallery(backup.gallery, {}, dgal)
      const gal = { ...backup.gallery, ...merged }
      localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(gal))
    }
    // Nur echte K2-Werke wiederherstellen – niemals VK2-Werke in k2-artworks schreiben
    if (Array.isArray(backup.artworks)) {
      const looksLikeVk2 = backup.artworks.some((a: any) =>
        (a?.id && String(a.id).startsWith('vk2-seed-')) || (a?.number && String(a.number).startsWith('VK2-'))
      )
      if (!looksLikeVk2) {
        localStorage.setItem('k2-artworks', JSON.stringify(backup.artworks))
      } else {
        console.warn('⚠️ Backup enthält VK2-Werke – k2-artworks wurde nicht überschrieben (K2/VK2-Trennung).')
      }
    }
    if (Array.isArray(backup.events)) {
      localStorage.setItem('k2-events', JSON.stringify(backup.events))
    }
    if (Array.isArray(backup.documents)) {
      localStorage.setItem('k2-documents', JSON.stringify(backup.documents))
    }
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
      const m = { ...backup.martina }
      if (!m.email?.trim()) m.email = dm.email
      if (!m.phone?.trim()) m.phone = dm.phone
      if (!m.name?.trim()) m.name = dm.name
      localStorage.setItem('k2-stammdaten-martina', JSON.stringify(m))
    }
    if (backup.georg && typeof backup.georg === 'object') {
      const g = { ...backup.georg }
      if (!g.email?.trim()) g.email = dg.email
      if (!g.phone?.trim()) g.phone = dg.phone
      if (!g.name?.trim()) g.name = dg.name
      localStorage.setItem('k2-stammdaten-georg', JSON.stringify(g))
    }
    if (backup.gallery && typeof backup.gallery === 'object') {
      const merged = mergeStammdatenGallery(backup.gallery, {}, dgal)
      const gal = { ...backup.gallery, ...merged }
      localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(gal))
    }
    // Nur echte K2-Werke wiederherstellen – niemals VK2-Werke in k2-artworks schreiben
    if (Array.isArray(backup.artworks)) {
      const looksLikeVk2 = backup.artworks.some((a: any) =>
        (a?.id && String(a.id).startsWith('vk2-seed-')) || (a?.number && String(a.number).startsWith('VK2-'))
      )
      if (!looksLikeVk2) {
        localStorage.setItem('k2-artworks', JSON.stringify(backup.artworks))
      } else {
        console.warn('⚠️ Backup-Datei enthält VK2-Werke – k2-artworks wurde nicht überschrieben (K2/VK2-Trennung).')
      }
    }
    if (Array.isArray(backup.events)) {
      localStorage.setItem('k2-events', JSON.stringify(backup.events))
    }
    if (Array.isArray(backup.documents)) {
      localStorage.setItem('k2-documents', JSON.stringify(backup.documents))
    }
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
/**
 * Setzt K2- und ök2-Stammdaten auf den Repo-Stand (Zustand vor Tom/VK2-Überschreibung).
 * Schreibt k2-stammdaten-* und k2-oeffentlich-stammdaten-* mit allen Feldern (Öffnungszeiten etc.).
 * Keine Änderung an Werken, Events, VK2-Mitgliedern.
 */
export function restoreK2AndOek2StammdatenFromRepo(): void {
  const km = K2_STAMMDATEN_DEFAULTS.martina
  const kg = K2_STAMMDATEN_DEFAULTS.georg
  const kGal = K2_STAMMDATEN_DEFAULTS.gallery

  localStorage.setItem('k2-stammdaten-martina', JSON.stringify({
    name: km.name,
    email: km.email,
    phone: km.phone,
    website: km.website ?? '',
    category: 'malerei',
    bio: '',
  }))
  localStorage.setItem('k2-stammdaten-georg', JSON.stringify({
    name: kg.name,
    email: kg.email,
    phone: kg.phone,
    website: kg.website ?? '',
    category: 'keramik',
    bio: '',
  }))
  localStorage.setItem('k2-stammdaten-galerie', JSON.stringify({
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
  }))

  const om = MUSTER_TEXTE.martina
  const og = MUSTER_TEXTE.georg
  const oGal = MUSTER_TEXTE.gallery

  localStorage.setItem('k2-oeffentlich-stammdaten-martina', JSON.stringify({
    name: om.name,
    email: om.email,
    phone: om.phone,
    website: om.website ?? '',
    category: 'malerei',
    bio: '',
  }))
  localStorage.setItem('k2-oeffentlich-stammdaten-georg', JSON.stringify({
    name: og.name,
    email: og.email,
    phone: og.phone,
    website: og.website ?? '',
    category: 'keramik',
    bio: '',
  }))
  localStorage.setItem('k2-oeffentlich-stammdaten-galerie', JSON.stringify({
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
  }))

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('k2-oek2-stammdaten-restored'))
    }
  } catch (_) {}
}

