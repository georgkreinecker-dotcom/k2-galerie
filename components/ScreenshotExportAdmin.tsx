import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../src/config/navigation'

/** Feste Galerie-URL für Etiketten-QR (unabhängig vom Router/WLAN) – gleiche Basis wie Mobile Connect */
const GALERIE_QR_BASE = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
import { MUSTER_TEXTE, MUSTER_ARTWORKS, K2_STAMMDATEN_DEFAULTS, TENANT_CONFIGS, PRODUCT_BRAND_NAME, getCurrentTenantId, type TenantId } from '../src/config/tenantConfig'
import { getPageTexts, setPageTexts, defaultPageTexts, type PageTextsConfig } from '../src/config/pageTexts'
import { getPageContentGalerie, setPageContentGalerie, type PageContentGalerie } from '../src/config/pageContentGalerie'
import '../src/App.css'

const ADMIN_CONTEXT_KEY = 'k2-admin-context'
function isOeffentlichAdminContext(): boolean {
  try {
    // URL hat Vorrang: /admin?context=oeffentlich (von ök2-Willkommensseite)
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('context') === 'oeffentlich') return true
    }
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_CONTEXT_KEY) === 'oeffentlich'
  } catch {
    return false
  }
}

// KRITISCH: Getrennte Storage-Keys für K2 vs. ök2 – niemals K2-Daten in ök2-Kontext lesen/schreiben
function getArtworksKey(): string {
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-artworks' : 'k2-artworks'
}
function getEventsKey(): string {
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-events' : 'k2-events'
}
function getDocumentsKey(): string {
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-documents' : 'k2-documents'
}
import { checkLocalStorageSize, cleanupLargeImages, getLocalStorageReport } from './SafeMode'
import { startAutoSave, stopAutoSave, setupBeforeUnloadSave, restoreFromBackup, restoreFromBackupFile, hasBackup, getBackupTimestamp, getBackupTimestamps } from '../src/utils/autoSave'
import { sortArtworksNewestFirst } from '../src/utils/artworkSort'
import { appendToHistory } from '../src/utils/artworkHistory'
import { urlWithBuildVersion } from '../src/buildInfo.generated'
import { writePngDpi } from 'png-dpi-reader-writer'

// KRITISCH: Importiere Safe Mode Utilities für Crash-Schutz
let safeModeUtils: any = null
try {
  import('../src/utils/safeMode').then(utils => {
    safeModeUtils = utils
  }).catch(() => {
    // Fallback wenn Import fehlschlägt
    safeModeUtils = {
      safeSetState: (isMounted: boolean, setState: any, value: any) => {
        if (isMounted) setState(value)
      },
      isSafeModeActive: () => false
    }
  })
} catch (e) {
  // Ignoriere Import-Fehler
}

// Einfache localStorage-Funktionen für Werke-Verwaltung (Key abhängig von K2 vs. ök2 – K2 wird nie in ök2 überschrieben)
function saveArtworks(artworks: any[]): boolean {
  try {
    const key = getArtworksKey()
    const json = JSON.stringify(artworks)
    
    // Prüfe Größe
    if (json.length > 10000000) { // Über 10MB = zu groß
      console.error('❌ Daten zu groß für localStorage:', json.length, 'Bytes')
      alert('⚠️ Zu viele Werke! Bitte einige löschen.')
      return false
    }
    
    localStorage.setItem(key, json)
    console.log('✅ Gespeichert:', artworks.length, 'Werke, Größe:', json.length, 'Bytes', key === 'k2-oeffentlich-artworks' ? '(ök2)' : '')
    
    // KRITISCH: Verifiziere Speicherung
    const verify = localStorage.getItem(key)
    if (!verify || verify !== json) {
      console.error('❌ Verifikation fehlgeschlagen!')
      return false
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Fehler beim Speichern:', error)
    
    // Spezifische Fehlerbehandlung
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Speicher voll! Bitte einige Werke löschen.')
    } else {
      alert('⚠️ Fehler beim Speichern: ' + (error.message || error))
    }
    
    return false
  }
}

function loadArtworks(): any[] {
  try {
    const key = getArtworksKey()
    const stored = localStorage.getItem(key)
    // ök2: Wenn noch keine Daten, Musterwerke als Ausgangsbasis (K2-artworks nie anrühren)
    if (!stored || stored === '[]') {
      if (isOeffentlichAdminContext()) return [...MUSTER_ARTWORKS]
      return []
    }
    // SAFE MODE: Prüfe Größe bevor Parsen
    if (stored.length > 10000000) { // Über 10MB = zu groß
      console.warn('Werke-Daten zu groß, überspringe Laden')
      return []
    }
    const artworks = JSON.parse(stored)
    
    // KRITISCH: Behebe automatisch doppelte Nummern beim Laden
    const numberMap = new Map<string, any[]>()
    artworks.forEach((a: any) => {
      if (a.number) {
        if (!numberMap.has(a.number)) {
          numberMap.set(a.number, [])
        }
        numberMap.get(a.number)!.push(a)
      }
    })
    
    let hasDuplicates = false
    const fixedNumbers: string[] = []
    
    numberMap.forEach((duplicates, number) => {
      if (duplicates.length > 1) {
        hasDuplicates = true
        console.warn(`⚠️ Doppelte Nummer gefunden: ${number} (${duplicates.length} Werke)`)
        
        // Sortiere nach createdAt (neuestes zuerst) oder deviceId für bessere Unterscheidung
        duplicates.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          // Falls gleiches Datum: Sortiere nach deviceId
          if (dateA === dateB) {
            const deviceA = a.deviceId || ''
            const deviceB = b.deviceId || ''
            return deviceB.localeCompare(deviceA)
          }
          return dateB - dateA
        })
        
        // Behalte das erste (neueste), benenne andere um mit eindeutiger Nummer
        // WICHTIG: Beide Werke bleiben erhalten, bekommen aber unterschiedliche Nummern
        for (let i = 1; i < duplicates.length; i++) {
          const duplicate = duplicates[i]
          const prefix = duplicate.category === 'keramik' ? 'K' : 'M'
          
          // Extrahiere Basis-Nummer (z.B. "0011" aus "K2-M-0011")
          const baseNumber = number.replace(/K2-[KM]-/, '').replace(/[^0-9]/g, '')
          const baseNum = parseInt(baseNumber) || 1
          
          // Finde nächste freie Nummer mit Suffix (z.B. K2-M-0011-1, K2-M-0011-2)
          let newNumber = ''
          let suffix = 1
          let maxAttempts = 100
          
          while (maxAttempts > 0) {
            const candidate = `K2-${prefix}-${String(baseNum).padStart(4, '0')}-${suffix}`
            const exists = artworks.some((a: any) => {
              // Prüfe ob Nummer bereits verwendet wird (außer vom aktuellen Werk)
              return a.number === candidate && a.id !== duplicate.id && !fixedNumbers.includes(candidate)
            })
            
            if (!exists) {
              newNumber = candidate
              break
            }
            suffix++
            maxAttempts--
          }
          
          // Fallback: Wenn keine Suffix-Nummer gefunden, verwende Timestamp + Device-ID
          if (!newNumber) {
            const deviceId = duplicate.deviceId || 'unknown'
            const deviceHash = deviceId.split('-').pop()?.substring(0, 2) || Math.floor(Math.random() * 100).toString().padStart(2, '0')
            const timestamp = Date.now().toString().slice(-6)
            newNumber = `K2-${prefix}-${timestamp}${deviceHash}`
            console.warn(`⚠️ Fallback-Nummer verwendet: ${newNumber}`)
          }
          
          // Finde und aktualisiere im artworks Array
          const index = artworks.findIndex((a: any) => {
            // Exakte Übereinstimmung finden
            if (a.id === duplicate.id) return true
            if (a.number === duplicate.number && a.createdAt === duplicate.createdAt) {
              // Zusätzliche Prüfung: deviceId falls vorhanden
              if (duplicate.deviceId && a.deviceId) {
                return a.deviceId === duplicate.deviceId
              }
              return true
            }
            return false
          })
          
          if (index !== -1) {
            console.log(`🔄 Automatische Umbenennung: ${number} → ${newNumber}`)
            console.log(`   Werk: ${duplicate.title || 'Unbekannt'}, Device: ${duplicate.deviceId || 'Unbekannt'}, Index: ${index}`)
            artworks[index].number = newNumber
            artworks[index].id = newNumber
            artworks[index].renamedFrom = number // Speichere Original-Nummer für Referenz
            artworks[index].renamedAt = new Date().toISOString()
            fixedNumbers.push(newNumber)
            console.log(`✅ Werk umbenannt:`, artworks[index])
          } else {
            console.error(`❌ Konnte Werk nicht finden für Umbenennung`)
            console.error(`   Gesucht:`, duplicate)
            console.error(`   Verfügbare IDs:`, artworks.map((a: any) => ({ id: a.id, number: a.number, createdAt: a.createdAt })))
          }
        }
      }
    })
    
    // Speichere korrigierte Daten zurück falls Änderungen gemacht wurden
    if (hasDuplicates && fixedNumbers.length > 0) {
      try {
        console.log(`💾 Speichere ${fixedNumbers.length} umbenannte Werke...`)
        const saved = saveArtworks(artworks)
        if (saved) {
          console.log('✅ Doppelte Nummern automatisch behoben und gespeichert')
          console.log(`📝 ${fixedNumbers.length} Werke umbenannt:`, fixedNumbers)
          // Dispatch Event damit UI aktualisiert wird
          window.dispatchEvent(new CustomEvent('artworks-updated'))
          // Zeige Info-Meldung (nur einmal, nicht bei jedem Laden)
          const lastFixTime = localStorage.getItem('k2-duplicate-fix-time')
          const now = Date.now()
          if (!lastFixTime || (now - parseInt(lastFixTime)) > 60000) { // Maximal alle 60 Sekunden
            localStorage.setItem('k2-duplicate-fix-time', now.toString())
            console.log(`ℹ️ ${fixedNumbers.length} Werke wurden automatisch umbenannt um Duplikate zu beheben`)
          }
        } else {
          console.error('❌ Fehler beim Speichern korrigierter Daten')
        }
      } catch (e) {
        console.error('Fehler beim Speichern korrigierter Daten:', e)
      }
    }
    
    return artworks
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

// localStorage-Funktionen für Events (Key abhängig von K2 vs. ök2)
function saveEvents(events: any[]): void {
  try {
    localStorage.setItem(getEventsKey(), JSON.stringify(events))
  } catch (error) {
    console.error('Fehler beim Speichern der Events:', error)
  }
}

function loadEvents(): any[] {
  try {
    const stored = localStorage.getItem(getEventsKey())
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error)
    return []
  }
}

// Minimale Cleanup-Funktion - komplett vereinfacht um Abstürze zu vermeiden
// Wird nur noch manuell aufgerufen, nicht automatisch
function cleanupUnnecessaryData() {
  // Keine komplexen Operationen mehr - nur minimale Bereinigung
  // Wird nur noch bei Bedarf aufgerufen, nicht automatisch
  try {
    const events = loadEvents()
    if (!Array.isArray(events) || events.length === 0) {
      return // Nichts zu bereinigen
    }
    const cleanedEvents = events.filter((event: any) => event && event.id && event.title)
    if (cleanedEvents.length !== events.length) {
      saveEvents(cleanedEvents)
    }
  } catch (error) {
    // Fehler komplett ignorieren um Abstürze zu vermeiden
  }
}

// Tracking für offene PDF-Fenster - verhindert zu viele gleichzeitige Fenster
let openPDFWindows: Window[] = []
let intervalIds: ReturnType<typeof setInterval>[] = [] // Tracking für alle Intervalle
const MAX_OPEN_WINDOWS = 3

// PDF-Fenster sicher öffnen mit automatischem Cleanup - VERBESSERT gegen Memory Leaks
function openPDFWindowSafely(blob: Blob, title?: string): Window | null {
  // Schließe alte Fenster wenn zu viele offen sind
  if (openPDFWindows.length >= MAX_OPEN_WINDOWS) {
    const oldestWindow = openPDFWindows.shift()
    if (oldestWindow && !oldestWindow.closed) {
      try {
        oldestWindow.close()
      } catch (e) {
        // Ignorieren
      }
    }
  }
  
  // Bereinige geschlossene Fenster aus Array
  openPDFWindows = openPDFWindows.filter(w => w && !w.closed)
  
  try {
    const url = URL.createObjectURL(blob)
    const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
    
    if (!pdfWindow) {
      URL.revokeObjectURL(url)
      return null
    }
    
    // Fenster zum Tracking hinzufügen
    openPDFWindows.push(pdfWindow)
    
    // Cleanup: Revoke URL wenn Fenster geschlossen wird
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url)
        const index = openPDFWindows.indexOf(pdfWindow)
        if (index > -1) {
          openPDFWindows.splice(index, 1)
        }
      } catch (e) {
        // Ignorieren
      }
    }
    
    // KEIN Interval mehr - verursacht Crashes alle 3 Minuten!
    // Stattdessen: Cleanup nur wenn Fenster geschlossen wird (via beforeunload)
    const handleBeforeUnload = () => {
      cleanup()
    }
    
    // Cleanup wenn Fenster geschlossen wird
    pdfWindow.addEventListener('beforeunload', handleBeforeUnload)
    
    // Fallback: Cleanup nach 30 Sekunden (nicht 3 Minuten!)
    const timeoutId = setTimeout(() => {
      pdfWindow.removeEventListener('beforeunload', handleBeforeUnload)
      if (!pdfWindow.closed) {
        cleanup()
      }
    }, 30000) // Nur 30 Sekunden - verhindert Memory-Leaks ohne Crashes
    
    return pdfWindow
  } catch (error) {
    console.error('Fehler beim Öffnen des PDF-Fensters:', error)
    return null
  }
}

// Alle Intervalle bereinigen - wird beim Unmount aufgerufen
function cleanupAllIntervals() {
  intervalIds.forEach(id => clearInterval(id))
  intervalIds = []
}

// Alle PDF-Fenster schließen
function closeAllPDFWindows() {
  openPDFWindows.forEach(window => {
    try {
      if (!window.closed) {
        window.close()
      }
    } catch (e) {
      // Ignorieren
    }
  })
  openPDFWindows = []
}

/**
 * Admin-Seite für K2 Galerie Verwaltung
 * Wird angezeigt bei: ?screenshot=admin oder /admin
 */
// Globaler Singleton-Check: Verhindere doppeltes Mounten
let globalAdminInstance: any = null
let globalMountCount = 0

function ScreenshotExportAdmin() {
  const navigate = useNavigate()
  // Singleton-Check: Verhindere doppeltes Mounten - KRITISCH gegen Crashes
  const mountId = React.useRef(`admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const isMountedRef = React.useRef(true)
  
  React.useEffect(() => {
    globalMountCount++
    isMountedRef.current = true
    
    // Wenn bereits eine Instanz existiert, warnen und frühe Instanz bereinigen
    if (globalAdminInstance && globalAdminInstance !== mountId.current) {
      console.error('❌ KRITISCH: ScreenshotExportAdmin wird doppelt gemountet!', {
        erste: globalAdminInstance,
        zweite: mountId.current,
        count: globalMountCount
      })
      // Bereinige alte Instanz
      cleanupAllIntervals()
      closeAllPDFWindows()
    }
    
    globalAdminInstance = mountId.current
    console.log(`🔧 ScreenshotExportAdmin #${globalMountCount} gemountet:`, mountId.current)
    
    return () => {
      isMountedRef.current = false
      globalMountCount--
      if (globalAdminInstance === mountId.current) {
        globalAdminInstance = null
      }
      console.log(`🔧 ScreenshotExportAdmin unmountet:`, mountId.current, `(Verbleibend: ${globalMountCount})`)
      
      // KRITISCH: Bereinige ALLES bevor Component unmountet
      try {
        // Bereinige alle PDF-Fenster Intervalle
        cleanupAllIntervals()
        // Schließe alle PDF-Fenster
        closeAllPDFWindows()
        
        // Hinweis: Echte Listener werden in den jeweiligen useEffects mit derselben Referenz entfernt.
        // storage/stammdaten-updated werden hier nicht registriert → kein Render-Loop-Risiko.
      } catch (e) {
        console.error('Fehler beim Cleanup:', e)
      }
    }
  }, [])

  // In Admin: Flag entfernen, damit „Zum Shop“ von hier aus zur Kasse führt (nicht Kundenansicht)
  React.useEffect(() => {
    try {
      sessionStorage.removeItem('k2-from-galerie-view')
    } catch (_) {}
  }, [])

  // Klare Admin-Struktur: Werke | Eventplanung | Design | Einstellungen. Kasse = ein Button im Header, öffnet direkt den Shop.
  const [activeTab, setActiveTab] = useState<'werke' | 'eventplan' | 'design' | 'einstellungen'>('werke')
  const [eventplanSubTab, setEventplanSubTab] = useState<'events' | 'dokumente' | 'öffentlichkeitsarbeit'>('events')
  const [settingsSubTab, setSettingsSubTab] = useState<'stammdaten' | 'drucker' | 'sicherheit' | 'lager'>('stammdaten')
  const [designSubTab, setDesignSubTab] = useState<'vorschau' | 'farben'>('vorschau')
  const [designPreviewEdit, setDesignPreviewEdit] = useState<string | null>(null) // z. B. 'p1-title' | 'p2-martinaBio' – alles auf der Seite klickbar
  const [previewContainerWidth, setPreviewContainerWidth] = useState(412) // für bildausfüllende Skalierung
  const [previewFullscreenPage, setPreviewFullscreenPage] = useState<1 | 2>(1) // welche Seite in der Vorschau (immer nur eine)
  const previewContainerRef = React.useRef<HTMLDivElement>(null)
  const welcomeImageInputRef = React.useRef<HTMLInputElement>(null)
  const galerieImageInputRef = React.useRef<HTMLInputElement>(null)
  const virtualTourImageInputRef = React.useRef<HTMLInputElement>(null)
  const [backupTimestamps, setBackupTimestamps] = useState<string[]>([])
  const [restoreProgress, setRestoreProgress] = useState<'idle' | 'running' | 'done'>('idle')
  const [backupPanelMinimized, setBackupPanelMinimized] = useState(true)
  const backupFileInputRef = useRef<HTMLInputElement>(null)

  // Bei laufender Wiederherstellung automatisch aufklappen, damit der Balkenverlauf sichtbar ist
  useEffect(() => {
    if (restoreProgress !== 'idle') setBackupPanelMinimized(false)
  }, [restoreProgress])

  // Backup-Verlauf laden, wenn du Einstellungen öffnest (kein Auto-Refresh)
  useEffect(() => {
    if (activeTab === 'einstellungen') setBackupTimestamps(getBackupTimestamps())
  }, [activeTab])

  // Vorschau-Container für bildausfüllende Skalierung messen (Design-Tab Vorschau; bei Overlay ref wechselt)
  useEffect(() => {
    if (designSubTab !== 'vorschau') return
    const el = previewContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0) setPreviewContainerWidth(el.offsetWidth)
    })
    ro.observe(el)
    if (el.offsetWidth > 0) setPreviewContainerWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [designSubTab])

  // Brother-Etikettengröße parsen (Format "29x90.3" → { width: 29, height: 90.3 })
  const parseLabelSize = (s: string) => {
    const match = (s || '').trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)$/i)
    if (match) {
      const w = parseFloat(match[1].replace(',', '.'))
      const h = parseFloat(match[2].replace(',', '.'))
      if (w > 0 && h > 0) return { width: w, height: h }
    }
    return { width: 29, height: 90.3 }
  }

  // Mandantenspezifische Drucker-Einstellungen (K2, ök2, Demo – je eigener Drucker + Format)
  const printerStorageKey = (tenantId: TenantId, key: 'ip' | 'type' | 'labelSize' | 'printServerUrl') => {
    const suffix = key === 'ip' ? 'printer-ip' : key === 'type' ? 'printer-type' : key === 'labelSize' ? 'label-size' : 'print-server-url'
    return `k2-${suffix}-${tenantId}`
  }
  const defaultPrinterSettings = () => ({
    ipAddress: '192.168.1.102',
    printerModel: 'Brother QL-820MWBc',
    printerType: 'etikettendrucker' as const,
    labelSize: '29x90,3',
    // Standard: Am Mac localhost; Mobilgeräte und Drucker im LAN 192.168.1.x → Print-Server-URL in diesem Netz.
    printServerUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3847'
      : 'http://192.168.1.1:3847'
  })
  const loadPrinterSettingsForTenant = (tenantId: TenantId) => {
    try {
      const def = defaultPrinterSettings()
      // Migration: alte Keys ohne Mandant-Suffix (nur für k2) einmal in neue Keys übernehmen
      if (tenantId === 'k2') {
        const newIpKey = printerStorageKey('k2', 'ip')
        if (!localStorage.getItem(newIpKey)) {
          const oldIp = localStorage.getItem('k2-printer-ip')
          if (oldIp) localStorage.setItem(newIpKey, oldIp)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'type'))) {
          const oldType = localStorage.getItem('k2-printer-type')
          if (oldType) localStorage.setItem(printerStorageKey('k2', 'type'), oldType)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'labelSize'))) {
          const oldLabel = localStorage.getItem('k2-label-size')
          if (oldLabel) localStorage.setItem(printerStorageKey('k2', 'labelSize'), oldLabel)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'printServerUrl'))) {
          const oldUrl = localStorage.getItem('k2-print-server-url')
          if (oldUrl) localStorage.setItem(printerStorageKey('k2', 'printServerUrl'), oldUrl)
        }
      }
      const ip = localStorage.getItem(printerStorageKey(tenantId, 'ip'))
      const type = localStorage.getItem(printerStorageKey(tenantId, 'type'))
      const labelSize = localStorage.getItem(printerStorageKey(tenantId, 'labelSize'))
      const printServerUrl = localStorage.getItem(printerStorageKey(tenantId, 'printServerUrl'))
      return {
        ipAddress: ip || def.ipAddress,
        printerModel: def.printerModel,
        printerType: (type || def.printerType) as 'etikettendrucker' | 'standarddrucker',
        labelSize: labelSize || def.labelSize,
        printServerUrl: printServerUrl || def.printServerUrl
      }
    } catch {
      return defaultPrinterSettings()
    }
  }
  const savePrinterSetting = (tenantId: TenantId, key: 'ip' | 'type' | 'labelSize' | 'printServerUrl', value: string) => {
    try {
      localStorage.setItem(printerStorageKey(tenantId, key), value)
    } catch (_) {}
  }

  const [printerSettingsForTenant, setPrinterSettingsForTenant] = useState<TenantId>(() => getCurrentTenantId())
  const [printerSettings, setPrinterSettings] = useState(() => loadPrinterSettingsForTenant(getCurrentTenantId()))

  // Beim Wechsel des Mandanten (Drucker-Tab): Einstellungen für diesen Mandanten laden
  useEffect(() => {
    setPrinterSettings(loadPrinterSettingsForTenant(printerSettingsForTenant))
  }, [printerSettingsForTenant])
  
  // Cleanup beim Mount: Schließe alle Modals (falls durch StrictMode doppelt geöffnet)
  useEffect(() => {
    if (!isMountedRef.current) return
    // Stelle sicher dass alle Modals geschlossen sind
    setShowEventModal(false)
    setShowExportMenu(false)
    setShowDocumentModal(false)
    setShowUploadModal(false)
  }, [])
  
  // Safe Mode: Prüfe localStorage-Größe NUR beim Mount - KEIN Interval mehr!
  useEffect(() => {
    let isMounted = true
    
    // Prüfe nur einmal beim Mount, nicht regelmäßig
    const checkStorage = () => {
      if (!isMounted) return
      
      try {
        const { size, limit, needsCleanup } = checkLocalStorageSize()
        
        if (needsCleanup || size > 4 * 1024 * 1024) { // Warnung bei 80% ODER über 4MB
          console.warn('⚠️ localStorage zu voll!', getLocalStorageReport())
          
          // Aggressive Bereinigung (mehrfach bis genug Platz)
          let cleaned = 0
          let attempts = 0
          let afterCleanup = checkLocalStorageSize()
          const initialSize = size
          
          // Mehrere Durchläufe für aggressives Cleanup
          while ((afterCleanup.needsCleanup || afterCleanup.size > 3.5 * 1024 * 1024) && attempts < 5) {
            const beforeSize = afterCleanup.size
            cleaned += cleanupLargeImages()
            afterCleanup = checkLocalStorageSize()
            const freed = beforeSize - afterCleanup.size
            
            if (freed > 0) {
              console.log(`✅ Cleanup Durchlauf ${attempts + 1}: ${(freed / 1024 / 1024).toFixed(2)}MB freigegeben`)
            } else {
              console.log(`⚠️ Cleanup Durchlauf ${attempts + 1}: Keine Verbesserung`)
            }
            
            attempts++
            
            // Wenn keine Verbesserung mehr, stoppe
            if (freed < 10000) break // Weniger als 10KB freigegeben
          }
          
          // Prüfe nochmal
          const finalCheck = checkLocalStorageSize()
          const freedTotal = initialSize - finalCheck.size
          
          if (cleaned > 0 || freedTotal > 0) {
            console.log(`✅ Cleanup abgeschlossen: ${cleaned} Einträge entfernt, ${(freedTotal / 1024 / 1024).toFixed(2)}MB freigegeben`)
          }
          
          if (finalCheck.needsCleanup || finalCheck.size > 4 * 1024 * 1024) {
            console.error('❌ localStorage immer noch zu voll!')
            alert(`⚠️ WARNUNG: localStorage ist zu voll (${(finalCheck.size / 1024 / 1024).toFixed(2)}MB)!\n\nAutomatisches Cleanup:\n- ${cleaned} Einträge entfernt\n- ${(freedTotal / 1024 / 1024).toFixed(2)}MB freigegeben\n\nAber es ist immer noch zu voll!\n\nBitte:\n1. Lösche alte Werke manuell in "Werke verwalten"\n2. Oder verwende kleinere Bilder\n3. Oder lösche Browser-Cache komplett\n\nSonst kann die App crashen!`)
          } else if (cleaned > 0 || freedTotal > 0) {
            console.log(`✅ Cleanup erfolgreich: ${(finalCheck.size / 1024 / 1024).toFixed(2)}MB verbleibend (${(freedTotal / 1024 / 1024).toFixed(2)}MB freigegeben)`)
          }
        }
      } catch (e) {
        console.error('Fehler beim Safe Mode Check:', e)
      }
    }
    
    // Prüfe nur einmal beim Mount - KEIN Interval mehr (verursacht Crashes!)
    // Verzögert ausführen um sicherzustellen dass Component vollständig geladen ist
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        checkStorage()
      }
    }, 1000) // 1 Sekunde Verzögerung
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      // Bereinige alle PDF-Fenster Intervalle
      cleanupAllIntervals()
      // Schließe alle PDF-Fenster
      closeAllPDFWindows()
      // Stoppe Auto-Save beim Unmount
      stopAutoSave()
    }
  }, [])
  
  // Seitentexte (bearbeitbare Texte pro Seite – Basis: Textversion der App)
  const [pageTexts, setPageTextsState] = useState<PageTextsConfig>(() => getPageTexts())

  // Altes Blau-Theme erkennen → K2-Orange (wie in GaleriePage)
  const K2_ORANGE_DESIGN = {
    accentColor: '#ff8c42',
    backgroundColor1: '#1a0f0a',
    backgroundColor2: '#2d1a14',
    backgroundColor3: '#3d2419',
    textColor: '#fff5f0',
    mutedColor: '#d4a574',
    cardBg1: 'rgba(45, 26, 20, 0.95)',
    cardBg2: 'rgba(26, 15, 10, 0.92)'
  }
  const OLD_BLUE_BG_LIST = ['#0a0e27', '#03040a', '#1a1f3a', '#0d1426', '#111c33', '#0f1419']
  const isOldBlueDesign = (d: Record<string, string>) => OLD_BLUE_BG_LIST.includes((d.backgroundColor1 || '').toLowerCase().trim())

  // Design-Einstellungen – aus localStorage; altes Blau wird auf K2-Orange migriert
  const [designSettings, setDesignSettings] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('k2-design-settings') : null
      if (stored && stored.length > 0 && stored.length < 50000) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && (parsed.accentColor || parsed.backgroundColor1)) {
          if (isOldBlueDesign(parsed)) {
            try { localStorage.setItem('k2-design-settings', JSON.stringify(K2_ORANGE_DESIGN)) } catch (_) {}
            return K2_ORANGE_DESIGN
          }
          return {
            accentColor: parsed.accentColor ?? '#ff8c42',
            backgroundColor1: parsed.backgroundColor1 ?? '#1a0f0a',
            backgroundColor2: parsed.backgroundColor2 ?? '#2d1a14',
            backgroundColor3: parsed.backgroundColor3 ?? '#3d2419',
            textColor: parsed.textColor ?? '#fff5f0',
            mutedColor: parsed.mutedColor ?? '#d4a574',
            cardBg1: parsed.cardBg1 ?? 'rgba(45, 26, 20, 0.95)',
            cardBg2: parsed.cardBg2 ?? 'rgba(26, 15, 10, 0.92)'
          }
        }
      }
    } catch (_) {}
    return { ...K2_ORANGE_DESIGN }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Nur im Admin: Foto freistellen (mit Pro-Hintergrund) oder Original unverändert benutzen
  const [photoUseFreistellen, setPhotoUseFreistellen] = useState(true)
  // Hintergrund-Variante bei Freistellung: hell | weiss | warm | kuehl | dunkel
  const [photoBackgroundPreset, setPhotoBackgroundPreset] = useState<'hell' | 'weiss' | 'warm' | 'kuehl' | 'dunkel'>('hell')
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkCategory, setArtworkCategory] = useState<'malerei' | 'keramik'>('malerei')
  const [artworkCeramicSubcategory, setArtworkCeramicSubcategory] = useState<'vase' | 'teller' | 'skulptur' | 'sonstig'>('vase')
  const [artworkCeramicHeight, setArtworkCeramicHeight] = useState<string>('10')
  const [artworkCeramicDiameter, setArtworkCeramicDiameter] = useState<string>('10')
  const [artworkCeramicDescription, setArtworkCeramicDescription] = useState<string>('')
  const [artworkCeramicType, setArtworkCeramicType] = useState<'steingut' | 'steinzeug'>('steingut')
  const [artworkCeramicSurface, setArtworkCeramicSurface] = useState<'engobe' | 'glasur' | 'mischtechnik'>('mischtechnik')
  const [artworkPaintingWidth, setArtworkPaintingWidth] = useState<string>('')
  const [artworkPaintingHeight, setArtworkPaintingHeight] = useState<string>('')
  const [artworkArtist, setArtworkArtist] = useState<string>('')
  const [artworkDescription, setArtworkDescription] = useState('')
  const [artworkPrice, setArtworkPrice] = useState<string>('')
  // Sichtbarkeit-Einstellungen:
  // - inExhibition: Werke in der Galerie-Vorschau sichtbar (immer true)
  // - inShop: Werke im Online-Shop verfügbar (kann geändert werden)
  const [isInExhibition] = useState(true)
  const [isInShop, setIsInShop] = useState(true)
  const [artworkNumber, setArtworkNumber] = useState<string>('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [oneClickPrinting, setOneClickPrinting] = useState(false)
  const [showShareFallbackOverlay, setShowShareFallbackOverlay] = useState(false)
  const [shareFallbackImageUrl, setShareFallbackImageUrl] = useState<string | null>(null)
  const shareFallbackBlobRef = useRef<Blob | null>(null)
  const [printLabelData, setPrintLabelData] = useState<{ url: string; widthMm: number; heightMm: number } | null>(null)
  const [savedArtwork, setSavedArtwork] = useState<any>(null)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleInput, setSaleInput] = useState('')
  const [saleMethod, setSaleMethod] = useState<'scan' | 'manual'>('scan')
  const [allArtworks, setAllArtworks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [showCameraView, setShowCameraView] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [documentFilter, setDocumentFilter] = useState<'alle' | 'pr-dokumente' | 'sonstige'>('alle')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Eventplan
  const [events, setEvents] = useState<any[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventType, setEventType] = useState<'galerieeröffnung' | 'vernissage' | 'finissage' | 'öffentlichkeitsarbeit' | 'sonstiges'>('galerieeröffnung')
  const [eventDate, setEventDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventDailyTimes, setEventDailyTimes] = useState<Record<string, { start: string, end: string }>>({})
  const [eventDescription, setEventDescription] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  
  // PR-Vorschläge State
  const [eventPRSuggestions, setEventPRSuggestions] = useState<any>(null)
  const [editingPRType, setEditingPRType] = useState<string | null>(null)

  // ESC-Taste zum Schließen des Event-Modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEventModal) {
        setShowEventModal(false)
        setEditingEvent(null)
        setEventTitle('')
        setEventType('galerieeröffnung')
        setEventDate('')
        setEventEndDate('')
        setEventStartTime('')
        setEventEndTime('')
        setEventDailyTimes({})
        setEventDescription('')
        setEventLocation('')
        setEventPRSuggestions(null)
        setEditingPRType(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showEventModal])

  // Schließe Export-Menü beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExportMenu && !(e.target as HTMLElement).closest('[data-export-menu]')) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Mobile: Viewport beim Öffnen/Schließen des Werk-Modals vergrößern für optimale Eingabestruktur
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
    if (!meta) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const defaultViewport = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    const zoomedViewport = 'width=device-width, initial-scale=1.35, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    if (showAddModal && isMobile) {
      meta.setAttribute('content', zoomedViewport)
    } else {
      meta.setAttribute('content', defaultViewport)
    }
    return () => {
      meta.setAttribute('content', defaultViewport)
    }
  }, [showAddModal])

  // Design wird bereits im useState-Initializer aus localStorage gelesen – kein zweites Laden nötig (verhindert Überschreiben von Variante A/B)

  // Seitentexte laden (wie Design)
  useEffect(() => {
    let isMounted = true
    const t = setTimeout(() => {
      if (!isMounted) return
      try {
        const stored = localStorage.getItem('k2-page-texts')
        if (stored && stored.length < 50000) {
          const saved = JSON.parse(stored) as PageTextsConfig
          if (isMounted) setPageTextsState(saved)
        }
      } catch (_) {}
    }, 100)
    return () => { isMounted = false; clearTimeout(t) }
  }, [])

  // CSS-Variablen setzen wenn designSettings vorhanden (setState-frei → kein Render-Loop)
  useEffect(() => {
    if (!designSettings || Object.keys(designSettings).length === 0) return
    let isMounted = true
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      try {
        const root = document.documentElement
        if (designSettings.accentColor) root.style.setProperty('--k2-accent', designSettings.accentColor)
        if (designSettings.backgroundColor1) root.style.setProperty('--k2-bg-1', designSettings.backgroundColor1)
        if (designSettings.backgroundColor2) root.style.setProperty('--k2-bg-2', designSettings.backgroundColor2)
        if (designSettings.backgroundColor3) root.style.setProperty('--k2-bg-3', designSettings.backgroundColor3)
        if (designSettings.textColor) root.style.setProperty('--k2-text', designSettings.textColor)
        if (designSettings.mutedColor) root.style.setProperty('--k2-muted', designSettings.mutedColor)
        if (designSettings.cardBg1) root.style.setProperty('--k2-card-bg-1', designSettings.cardBg1)
        if (designSettings.cardBg2) root.style.setProperty('--k2-card-bg-2', designSettings.cardBg2)
      } catch (error) {
        console.error('Fehler beim Setzen der CSS-Variablen:', error)
      }
    }, 100)
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [designSettings])

  // Design-Einstellungen bei Änderung sofort speichern (Vorschau zeigt dann dieselben Farben)
  useEffect(() => {
    if (!designSettings || Object.keys(designSettings).length === 0) return
    try {
      const json = JSON.stringify(designSettings)
      if (json.length < 50000) localStorage.setItem('k2-design-settings', json)
    } catch (_) {}
  }, [designSettings])

  // Hex ↔ HSL für stufenlose Schieber (0–360 H, 0–100 S, 0–100 L)
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const s = hex.replace(/^#/, '')
    const r = s.length === 3 ? parseInt(s[0] + s[0], 16) / 255 : parseInt(s.slice(0, 2), 16) / 255
    const g = s.length === 3 ? parseInt(s[1] + s[1], 16) / 255 : parseInt(s.slice(2, 4), 16) / 255
    const b = s.length === 3 ? parseInt(s[2] + s[2], 16) / 255 : parseInt(s.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s2 = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s2 = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      else if (max === g) h = ((b - r) / d + 2) / 6
      else h = ((r - g) / d + 4) / 6
    }
    return { h: Math.round(h * 360), s: Math.round(s2 * 100), l: Math.round(l * 100) }
  }
  const hslToHex = (h: number, s: number, l: number): string => {
    const s2 = s / 100, l2 = l / 100
    const c = (1 - Math.abs(2 * l2 - 1)) * s2
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l2 - c / 2
    let r = 0, g = 0, b = 0
    if (h < 60) { r = c; g = x; b = 0 } else if (h < 120) { r = x; g = c; b = 0 } else if (h < 180) { r = 0; g = c; b = x } else if (h < 240) { r = 0; g = x; b = c } else if (h < 300) { r = x; g = 0; b = c } else { r = c; g = 0; b = x }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
    return '#' + toHex(r) + toHex(g) + toHex(b)
  }

  // Design-Einstellungen speichern
  const handleDesignChange = (key: string, value: string) => {
    setDesignSettings(prev => ({ ...prev, [key]: value }))
  }

  // Vordefinierte Themes (default = Orange)
  const themes = {
    default: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    },
    warm: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    },
    elegant: {
      accentColor: '#c9a961',
      backgroundColor1: '#0f0e0a',
      backgroundColor2: '#1a1814',
      backgroundColor3: '#25221e',
      textColor: '#f5f3f0',
      mutedColor: '#b8a68a',
      cardBg1: 'rgba(26, 24, 20, 0.95)',
      cardBg2: 'rgba(15, 14, 10, 0.92)'
    },
    modern: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    }
  }

  const applyTheme = (themeName: keyof typeof themes) => {
    setDesignSettings(themes[themeName])
  }

  const [designSaveFeedback, setDesignSaveFeedback] = useState<'ok' | null>(null)

  const DESIGN_VARIANT_KEYS = { a: 'k2-design-variant-a', b: 'k2-design-variant-b' } as const
  const saveDesignVariant = (slot: 'a' | 'b') => {
    try {
      const json = JSON.stringify(designSettings)
      if (json.length >= 50000) { alert('Design zu groß zum Speichern.'); return }
      localStorage.setItem(DESIGN_VARIANT_KEYS[slot], json)
      localStorage.setItem('k2-design-settings', json)
      alert('Variante ' + (slot === 'a' ? 'A' : 'B') + ' gespeichert. Bleibt erhalten – mit „Anwenden“ wieder abrufbar.')
    } catch (_) { alert('Speichern fehlgeschlagen.') }
  }
  const loadDesignVariant = (slot: 'a' | 'b') => {
    try {
      const raw = localStorage.getItem(DESIGN_VARIANT_KEYS[slot])
      if (raw && raw.length < 50000) {
        const next = JSON.parse(raw)
        if (next && typeof next === 'object') {
          setDesignSettings(next)
          // Sofort in k2-design-settings schreiben, damit „So sehen Kunden die Galerie“ dieselben Farben zeigt
          localStorage.setItem('k2-design-settings', JSON.stringify(next))
        }
        return
      }
    } catch (_) {}
    alert('Variante ' + (slot === 'a' ? 'A' : 'B') + ' ist noch nicht gespeichert.')
  }

  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedEventForDocument, setSelectedEventForDocument] = useState<string | null>(null)
  const [eventDocumentFile, setEventDocumentFile] = useState<File | null>(null)
  const [eventDocumentName, setEventDocumentName] = useState('')
  const [eventDocumentType, setEventDocumentType] = useState<'flyer' | 'plakat' | 'presseaussendung' | 'sonstiges'>('flyer')
  
  // Stammdaten – bei ök2-Kontext nur Musterdaten (keine Vermischung mit K2); K2 nutzt K2_STAMMDATEN_DEFAULTS
  const [martinaData, setMartinaData] = useState(() =>
    isOeffentlichAdminContext()
      ? { name: MUSTER_TEXTE.martina.name, email: MUSTER_TEXTE.martina.email || '', phone: MUSTER_TEXTE.martina.phone || '', category: 'malerei' as const, bio: MUSTER_TEXTE.artist1Bio, website: MUSTER_TEXTE.martina.website || '' }
      : {
          name: K2_STAMMDATEN_DEFAULTS.martina.name,
          category: 'malerei',
          bio: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
          email: K2_STAMMDATEN_DEFAULTS.martina.email,
          phone: K2_STAMMDATEN_DEFAULTS.martina.phone,
          website: K2_STAMMDATEN_DEFAULTS.martina.website || ''
        }
  )
  const [georgData, setGeorgData] = useState(() =>
    isOeffentlichAdminContext()
      ? { name: MUSTER_TEXTE.georg.name, email: MUSTER_TEXTE.georg.email || '', phone: MUSTER_TEXTE.georg.phone || '', category: 'keramik' as const, bio: MUSTER_TEXTE.artist2Bio, website: MUSTER_TEXTE.georg.website || '' }
      : {
          name: K2_STAMMDATEN_DEFAULTS.georg.name,
          category: 'keramik',
          bio: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von jahrzehntelanger Erfahrung.',
          email: K2_STAMMDATEN_DEFAULTS.georg.email,
          phone: K2_STAMMDATEN_DEFAULTS.georg.phone,
          website: K2_STAMMDATEN_DEFAULTS.georg.website || ''
        }
  )
  const [galleryData, setGalleryData] = useState<any>(() =>
    isOeffentlichAdminContext()
      ? {
          name: 'Galerie Muster',
          subtitle: 'Malerei & Skulptur',
          description: MUSTER_TEXTE.gemeinsamText,
          address: MUSTER_TEXTE.gallery.address,
          city: (MUSTER_TEXTE.gallery as any).city || '',
          country: (MUSTER_TEXTE.gallery as any).country || '',
          phone: (MUSTER_TEXTE.gallery as any).phone || '',
          email: (MUSTER_TEXTE.gallery as any).email || '',
          website: MUSTER_TEXTE.gallery.website || '',
          internetadresse: MUSTER_TEXTE.gallery.internetadresse || '',
          openingHours: (MUSTER_TEXTE.gallery as any).openingHours || '',
          bankverbindung: (MUSTER_TEXTE.gallery as any).bankverbindung || '',
          adminPassword: '',
          soldArtworksDisplayDays: 30,
          welcomeImage: '',
          virtualTourImage: '',
          galerieCardImage: '',
          internetShopNotSetUp: true
        }
      : {
          name: K2_STAMMDATEN_DEFAULTS.gallery.name,
          subtitle: 'Kunst & Keramik',
          description: 'Gemeinsam eröffnen Martina und Georg nach über 20 Jahren kreativer Tätigkeit die K2 Galerie – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.',
          address: K2_STAMMDATEN_DEFAULTS.gallery.address,
          city: K2_STAMMDATEN_DEFAULTS.gallery.city,
          country: K2_STAMMDATEN_DEFAULTS.gallery.country,
          phone: K2_STAMMDATEN_DEFAULTS.gallery.phone,
          email: K2_STAMMDATEN_DEFAULTS.gallery.email,
          website: K2_STAMMDATEN_DEFAULTS.gallery.website,
          internetadresse: K2_STAMMDATEN_DEFAULTS.gallery.internetadresse || K2_STAMMDATEN_DEFAULTS.gallery.website,
          openingHours: K2_STAMMDATEN_DEFAULTS.gallery.openingHours,
          bankverbindung: K2_STAMMDATEN_DEFAULTS.gallery.bankverbindung,
          adminPassword: 'k2Galerie2026',
          soldArtworksDisplayDays: 30,
          welcomeImage: '',
          virtualTourImage: '',
          galerieCardImage: '',
          internetShopNotSetUp: true
        }
  )

  // Seitengestaltung (Willkommensseite & Galerie-Vorschau) – getrennt von Stammdaten
  const [pageContent, setPageContent] = useState<PageContentGalerie>(() => getPageContentGalerie())
  useEffect(() => {
    if (!isOeffentlichAdminContext()) setPageContent(getPageContentGalerie())
  }, [])

  // URL-Parameter context=oeffentlich in sessionStorage übernehmen (ök2-Admin von Willkommensseite)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('context') === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
    } catch (_) {}
  }, [])

  // Stammdaten aus localStorage laden – bei ök2-Kontext nicht laden (nur Musterdaten)
  useEffect(() => {
    if (isOeffentlichAdminContext()) return
    let isMounted = true // Flag um Updates nach Unmount zu verhindern
    
    // Lade Daten verzögert um Abstürze zu vermeiden
    const timeoutId = setTimeout(() => {
      if (!isMounted) return // Verhindere Updates nach Unmount
      
      try {
        const storedMartina = localStorage.getItem('k2-stammdaten-martina')
        const d = K2_STAMMDATEN_DEFAULTS.martina
        let mergedMartina: any
        if (storedMartina && storedMartina.length < 100000) {
          const parsed = JSON.parse(storedMartina)
          mergedMartina = {
            ...parsed,
            name: (parsed.name && String(parsed.name).trim()) ? parsed.name : d.name,
            email: (parsed.email && String(parsed.email).trim()) ? parsed.email : d.email,
            phone: (parsed.phone && String(parsed.phone).trim()) ? parsed.phone : d.phone,
            website: (parsed.website && String(parsed.website).trim()) ? parsed.website : (d.website || '')
          }
        } else {
          mergedMartina = { name: d.name, email: d.email, phone: d.phone, website: d.website || '', category: 'malerei', bio: '' }
        }
        if (isMounted) setMartinaData(mergedMartina)
        // Nur Kontaktfelder reparieren – niemals komplette Stammdaten überschreiben (sonst gehen Adresse, Bio, Bilder verloren)
        if (storedMartina && storedMartina.length < 100000) {
          try {
            const prev = JSON.parse(storedMartina)
            const toWrite = { ...prev, name: mergedMartina.name, email: mergedMartina.email, phone: mergedMartina.phone, website: mergedMartina.website }
            localStorage.setItem('k2-stammdaten-martina', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden von Martina-Daten:', error)
      }
      
      if (!isMounted) return
      
      try {
        const storedGeorg = localStorage.getItem('k2-stammdaten-georg')
        const d = K2_STAMMDATEN_DEFAULTS.georg
        let mergedGeorg: any
        if (storedGeorg && storedGeorg.length < 100000) {
          const parsed = JSON.parse(storedGeorg)
          mergedGeorg = {
            ...parsed,
            name: (parsed.name && String(parsed.name).trim()) ? parsed.name : d.name,
            email: (parsed.email && String(parsed.email).trim()) ? parsed.email : d.email,
            phone: (parsed.phone && String(parsed.phone).trim()) ? parsed.phone : d.phone,
            website: (parsed.website && String(parsed.website).trim()) ? parsed.website : (d.website || '')
          }
        } else {
          mergedGeorg = { name: d.name, email: d.email, phone: d.phone, website: d.website || '', category: 'keramik', bio: '' }
        }
        if (isMounted) setGeorgData(mergedGeorg)
        if (storedGeorg && storedGeorg.length < 100000) {
          try {
            const prev = JSON.parse(storedGeorg)
            const toWrite = { ...prev, name: mergedGeorg.name, email: mergedGeorg.email, phone: mergedGeorg.phone, website: mergedGeorg.website }
            localStorage.setItem('k2-stammdaten-georg', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden von Georg-Daten:', error)
      }
      
      if (!isMounted) return
      
      try {
        const storedGallery = localStorage.getItem('k2-stammdaten-galerie')
        const g = K2_STAMMDATEN_DEFAULTS.gallery
        let data: any = null
        if (storedGallery) {
          try { data = JSON.parse(storedGallery) } catch (_) {}
        }
        let mergedGallery: any
        if (data && typeof data === 'object') {
          // Bestehende Daten behalten (Adresse, welcomeImage, virtualTourImage, etc.) – nur leere Kontaktfelder aus Defaults füllen
          mergedGallery = {
            ...data,
            name: (data.name && String(data.name).trim()) ? data.name : g.name,
            phone: (data.phone && String(data.phone).trim()) ? data.phone : g.phone,
            email: (data.email && String(data.email).trim()) ? data.email : g.email,
            address: (data.address != null && String(data.address).trim()) ? data.address : (g.address || data.address),
            city: (data.city != null && String(data.city).trim()) ? data.city : (g.city || data.city),
            country: (data.country != null && String(data.country).trim()) ? data.country : (g.country || data.country),
            website: (data.website != null && String(data.website).trim()) ? data.website : (g.website || data.website || ''),
            internetadresse: (data.internetadresse != null && String(data.internetadresse).trim()) ? data.internetadresse : (data.website || g.internetadresse || ''),
            openingHours: (data.openingHours != null && String(data.openingHours).trim()) ? data.openingHours : (g.openingHours || data.openingHours || ''),
            bankverbindung: (data.bankverbindung != null && String(data.bankverbindung).trim()) ? data.bankverbindung : (g.bankverbindung || data.bankverbindung || '')
          }
        } else {
          mergedGallery = {
            name: g.name,
            address: g.address,
            city: g.city,
            country: g.country,
            phone: g.phone,
            email: g.email,
            website: g.website || '',
            internetadresse: g.internetadresse || '',
            openingHours: g.openingHours || '',
            bankverbindung: g.bankverbindung || '',
            adminPassword: 'k2Galerie2026',
            soldArtworksDisplayDays: 30,
            welcomeImage: '',
            virtualTourImage: '',
            galerieCardImage: '',
            internetShopNotSetUp: data.internetShopNotSetUp !== false
          }
        }
        if (isMounted) setGalleryData(mergedGallery)
        // Nur Kontakt/Name reparieren – niemals welcomeImage, virtualTourImage, Adresse etc. überschreiben
        if (data && typeof data === 'object') {
          try {
            const toWrite = {
              ...data,
              name: mergedGallery.name,
              phone: mergedGallery.phone,
              email: mergedGallery.email,
              address: mergedGallery.address,
              city: mergedGallery.city,
              country: mergedGallery.country,
              website: mergedGallery.website,
              internetadresse: mergedGallery.internetadresse,
              openingHours: mergedGallery.openingHours,
              bankverbindung: mergedGallery.bankverbindung
            }
            localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden der Galerie-Daten:', error)
        if (isMounted) {
          const fallback = { ...K2_STAMMDATEN_DEFAULTS.gallery, adminPassword: 'k2Galerie2026', soldArtworksDisplayDays: 30, welcomeImage: '', virtualTourImage: '', galerieCardImage: '', internetShopNotSetUp: true }
          setGalleryData(fallback)
        }
      }
    }, 200) // Längere Verzögerung für Stabilität
    
    return () => {
      isMounted = false // Verhindere Updates nach Unmount
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])

  /** Speichert alle aktuellen Admin-Daten in localStorage (K2-Keys), damit „Seiten prüfen“ die neuesten Änderungen anzeigt. Nur in K2-Admin in echte K2-Keys schreiben. */
  const saveAllForVorschau = () => {
    try {
      if (designSettings && Object.keys(designSettings).length > 0) {
        const ds = JSON.stringify(designSettings)
        if (ds.length < 50000) localStorage.setItem('k2-design-settings', ds)
      }
      if (!isOeffentlichAdminContext()) {
        const martinaStr = JSON.stringify(martinaData)
        const georgStr = JSON.stringify(georgData)
        const galleryStr = JSON.stringify(galleryData)
        if (martinaStr.length < 100000) localStorage.setItem('k2-stammdaten-martina', martinaStr)
        if (georgStr.length < 100000) localStorage.setItem('k2-stammdaten-georg', georgStr)
        if (galleryStr.length < 5000000) localStorage.setItem('k2-stammdaten-galerie', galleryStr)
        const artworksStr = JSON.stringify(allArtworks)
        if (artworksStr.length < 10000000) localStorage.setItem('k2-artworks', artworksStr)
        localStorage.setItem('k2-events', JSON.stringify(events))
        localStorage.setItem('k2-documents', JSON.stringify(documents))
      }
      setPageTexts(pageTexts)
      setPageContentGalerie(pageContent)
    } catch (e) {
      console.warn('Vorschau-Speichern:', e)
    }
  }

  // Stammdaten speichern - bei ök2-Kontext nicht in echte K2-Daten schreiben
  const saveStammdaten = () => {
    return new Promise<void>((resolve, reject) => {
      if (isOeffentlichAdminContext()) {
        alert('Demo-Modus (ök2): Es werden keine echten Daten gespeichert. Wechsle zur K2-Galerie für echte Stammdaten.')
        resolve()
        return
      }
      const timeoutId = setTimeout(() => {
        reject(new Error('Speichern dauerte zu lange'))
      }, 5000) // Max 5 Sekunden
      
      try {
        // Stammdaten Galerie: Bilder nicht mitschreiben (leben nur in Seitengestaltung k2-page-content-galerie)
        const { welcomeImage: _w, galerieCardImage: _c, virtualTourImage: _v, ...galleryStammdaten } = galleryData
        const galleryToSave = galleryStammdaten as typeof galleryData

        // Prüfe Größe bevor speichern
        const martinaStr = JSON.stringify(martinaData)
        const georgStr = JSON.stringify(georgData)
        const galleryStr = JSON.stringify(galleryToSave)

        if (martinaStr.length > 100000 || georgStr.length > 100000 || galleryStr.length > 5000000) {
          clearTimeout(timeoutId)
          reject(new Error('Daten zu groß zum Speichern'))
          return
        }

        localStorage.setItem('k2-stammdaten-martina', martinaStr)
        localStorage.setItem('k2-stammdaten-georg', georgStr)
        localStorage.setItem('k2-stammdaten-galerie', galleryStr)
        
        clearTimeout(timeoutId)
        resolve()
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  // Mobile Version veröffentlichen - Daten speichern + JSON-Datei erstellen + Vercel öffnen
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [publishErrorMsg, setPublishErrorMsg] = React.useState<string | null>(null)
  const [publishSuccessModal, setPublishSuccessModal] = React.useState<{ size: number; version: number } | null>(null)
  
  // Smart Sync: Server = Quelle der Wahrheit (wie GaleriePage/GalerieVorschauPage)
  const handleSyncFromServer = async () => {
    if (isSyncing) return
    if (isOeffentlichAdminContext()) {
      alert('Sync vom Server ist nur in der K2-Galerie verfügbar. Wechsle zur K2-Galerie für echte Daten.')
      return
    }
    setIsSyncing(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const url = 'https://k2-galerie.vercel.app/gallery-data.json?t=' + Date.now()
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const serverArtworks = Array.isArray(data?.artworks) ? data.artworks : []
      const localArtworks = loadArtworks()
      const serverMap = new Map<string, any>()
      serverArtworks.forEach((a: any) => {
        const key = a.number || a.id
        if (key) serverMap.set(key, a)
      })
      const merged: any[] = [...serverArtworks]
      const toHistory: any[] = []
      localArtworks.forEach((local: any) => {
        const key = local.number || local.id
        if (!key) return
        const serverArtwork = serverMap.get(key)
        const isMobileWork = local.createdOnMobile || local.updatedOnMobile
        const createdAt = local.createdAt ? new Date(local.createdAt).getTime() : 0
        const isVeryNew = createdAt > Date.now() - 600000
        if (!serverArtwork) {
          if (isMobileWork && isVeryNew) merged.push(local)
          else toHistory.push(local)
        } else {
          if (isMobileWork) {
            const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
            if (idx >= 0) merged[idx] = local
            else merged.push(local)
          } else {
            const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
            const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
            if (localUpdated > serverUpdated) {
              const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
              if (idx >= 0) merged[idx] = local
              else merged.push(local)
            }
          }
        }
      })
      if (toHistory.length > 0) appendToHistory(toHistory)
      const ok = saveArtworks(merged)
      if (ok) {
        setAllArtworks(merged)
        const msg = toHistory.length > 0
          ? `✅ ${merged.length} Werke geladen (Server = Quelle).\n\n${toHistory.length} gelöschte Werke in History archiviert.`
          : `✅ ${merged.length} Werke synchronisiert.`
        alert(msg)
      } else {
        alert('⚠️ Fehler beim Speichern.')
      }
    } catch (err) {
      try {
        const { loadArtworksFromSupabase } = await import('../src/utils/supabaseClient')
        const supabaseArtworks = await loadArtworksFromSupabase()
        if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
          const localArtworks = loadArtworks()
          const merged = [...localArtworks]
          supabaseArtworks.forEach((s: any) => {
            const exists = merged.some((a: any) =>
              (a.number && s.number && a.number === s.number) || (a.id && s.id && a.id === s.id)
            )
            if (!exists) {
              const work = { ...s }
              if (!work.addedToGalleryAt) work.addedToGalleryAt = new Date().toISOString()
              if (!work.createdAt) work.createdAt = work.addedToGalleryAt
              merged.push(work)
            }
          })
          if (merged.length > localArtworks.length) {
            saveArtworks(merged)
            setAllArtworks(merged)
            alert(`✅ ${merged.length - localArtworks.length} Werk(e) von Supabase geladen.`)
          } else {
            alert('✅ Alle Werke bereits synchronisiert.')
          }
        } else {
          throw new Error('Supabase leer')
        }
      } catch {
        const artworks = loadArtworks()
        setAllArtworks(artworks)
        alert(`⚠️ Server nicht erreichbar.\n\nLokal ${artworks.length} Werke geladen.\n\nPrüfe: Internet, Vercel-Status.`)
      }
    } finally {
      setIsSyncing(false)
    }
  }
  
  // SICHERHEIT: Stelle sicher dass isDeploying nach 60 Sekunden zurückgesetzt wird
  React.useEffect(() => {
    if (isDeploying) {
      const safetyTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('⚠️ isDeploying wurde nach 60 Sekunden automatisch zurückgesetzt')
          setIsDeploying(false)
        }
      }, 60000) // 60 Sekunden Safety-Timeout
      
      return () => {
        clearTimeout(safetyTimeout)
        // Kein setState im Cleanup – verhindert Crash/Warning bei Unmount
      }
    }
  }, [isDeploying])
  
  // KEINE automatische Prüfung mehr - verursacht Abstürze!
  // Verwende nur den manuellen "🔍 Vercel-Status" Button
  
  // Manueller Vercel-Check-Button
  const [checkingVercel, setCheckingVercel] = React.useState(false)
  
  // MINIMALE Vercel-Prüfung - MIT TIMEOUT UND CRASH-SCHUTZ
  const manualCheckVercel = () => {
    if (checkingVercel) return
    
    setCheckingVercel(true)
    
    // Timeout nach 10 Sekunden - verhindert Hänger
    const timeoutId = setTimeout(() => {
      setCheckingVercel(false)
      alert('⚠️ Vercel-Check:\n\nTimeout nach 10 Sekunden\n\nPrüfe manuell: https://vercel.com/dashboard → Projekt k2-galerie')
    }, 10000)
    
    try {
      // Fetch mit Timeout
      const controller = new AbortController()
      const fetchTimeout = setTimeout(() => controller.abort(), 8000) // 8 Sekunden Timeout
      
      fetch('https://k2-galerie.vercel.app/gallery-data.json?t=' + Date.now(), {
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (response.ok) {
            return response.json()
          }
          throw new Error('HTTP ' + response.status)
        })
        .then(data => {
          const exportedAt = data?.exportedAt || 'nicht gefunden'
          alert(`✅ Vercel-Status:\n\nDatei verfügbar\nExportedAt: ${exportedAt}\n\nPrüfe: https://vercel.com/dashboard → k2-galerie`)
        })
        .catch(err => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (err.name === 'AbortError') {
            alert('⚠️ Vercel-Check:\n\nTimeout - Anfrage dauerte zu lange\n\nPrüfe: https://vercel.com/dashboard → k2-galerie')
          } else {
            alert('⚠️ Vercel-Check:\n\nDatei nicht verfügbar\n\nPrüfe: https://vercel.com/dashboard → k2-galerie')
          }
        })
        .finally(() => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          setCheckingVercel(false)
        })
    } catch (error) {
      clearTimeout(timeoutId)
      setCheckingVercel(false)
      alert('⚠️ Vercel-Check Fehler:\n\n' + (error instanceof Error ? error.message : String(error)))
    }
  }
  
  // KEINE automatische Prüfung mehr - verursacht Abstürze!
  // Verwende nur den manuellen "🔍 Vercel-Status" Button
  
  /** Vollbackup (Stammdaten + Werke + Eventplanung + Öffentlichkeitsarbeit) als JSON herunterladen – für Sicherung */
  const downloadFullBackup = () => {
    try {
      const getItemSafe = (key: string, def: any) => {
        try {
          const item = localStorage.getItem(key)
          if (!item || item.length > 1000000) return def
          return JSON.parse(item)
        } catch { return def }
      }
      const eventsForBackup = (Array.isArray(events) && events.length > 0) ? events : (getItemSafe('k2-events', []) || [])
      const documentsForBackup = (Array.isArray(documents) && documents.length > 0) ? documents : (getItemSafe('k2-documents', []) || [])
      const customersForBackup = getItemSafe('k2-customers', []) || []
      let pageContentGalerieRaw: string | undefined
      try {
        const raw = localStorage.getItem('k2-page-content-galerie')
        if (raw && raw.length < 6 * 1024 * 1024) pageContentGalerieRaw = raw
      } catch (_) {}
      const payload = {
        martina: martinaData,
        georg: georgData,
        gallery: galleryData,
        artworks: allArtworks,
        events: eventsForBackup,
        documents: documentsForBackup,
        customers: Array.isArray(customersForBackup) ? customersForBackup : [],
        designSettings: getItemSafe('k2-design-settings', {}),
        pageTexts: getItemSafe('k2-page-texts', null),
        pageContentGalerie: pageContentGalerieRaw,
        exportedAt: new Date().toISOString(),
        backupLabel: 'K2 Vollbackup (Stammdaten, Werke, Eventplanung, Öffentlichkeitsarbeit, Kunden, Seitengestaltung)'
      }
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `k2-vollbackup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)
      const customersCount = Array.isArray(customersForBackup) ? customersForBackup.length : 0
      alert(`✅ Vollbackup heruntergeladen.\n\nEnthält: Stammdaten, ${allArtworks.length} Werke, ${eventsForBackup.length} Events, ${documentsForBackup.length} Dokumente, ${customersCount} Kunden.\n\nDatei lokal aufbewahren – bei Datenverlust kann sie im Admin wieder eingespielt werden.`)
    } catch (e) {
      alert('Fehler beim Erstellen des Backups: ' + (e instanceof Error ? e.message : String(e)))
    }
  }
  
  const publishMobile = () => {
    if (isDeploying) return
    if (isOeffentlichAdminContext()) {
      alert('Veröffentlichen ist nur in der K2-Galerie verfügbar. Wechsle zur K2-Galerie, um die echte Galerie zu veröffentlichen.')
      return
    }
    if (!isMountedRef.current) {
      console.warn('⚠️ publishMobile: Component ist unmounted')
      return
    }
    setIsDeploying(true)
    
    // KOMPLETT NEUE LÖSUNG: Web Worker für JSON.stringify um UI nicht zu blockieren
    const executeExport = () => {
      try {
        // Minimale Datenmenge - nur das Nötigste
        const getItemSafe = (key: string, defaultValue: any) => {
          try {
            const item = localStorage.getItem(key)
            if (!item || item.length > 1000000) return defaultValue // Max 1MB pro Item
            return JSON.parse(item)
          } catch {
            return defaultValue
          }
        }
        
        // SEHR aggressive Begrenzung um Hänger zu vermeiden
        // KRITISCH: Lade ALLE Werke inkl. Mobile-Werke für Synchronisation!
        let artworks = getItemSafe('k2-artworks', [])
        
        // WICHTIG: Prüfe ob Werke vorhanden sind
        if (!Array.isArray(artworks) || artworks.length === 0) {
          console.warn('⚠️ WARNUNG: Keine Werke gefunden in localStorage!')
          console.log('localStorage k2-artworks:', localStorage.getItem('k2-artworks')?.substring(0, 200))
          
          // Versuche alternative Methode
          try {
            const stored = localStorage.getItem('k2-artworks')
            if (stored) {
              artworks = JSON.parse(stored)
              console.log('✅ Werke geladen via alternative Methode:', artworks.length)
            }
          } catch (e) {
            console.error('❌ Fehler beim Laden der Werke:', e)
          }
        }
        
        // WICHTIG: Prüfe ob Mobile-Werke vorhanden sind und stelle sicher dass sie mit exportiert werden
        const mobileWorks = artworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
        if (mobileWorks.length > 0) {
          console.log(`📱 ${mobileWorks.length} Mobile-Werke werden mit exportiert:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
        }
        
        // WICHTIG: Prüfe ob Werke vorhanden sind BEVOR exportiert wird
        if (!Array.isArray(artworks) || artworks.length === 0) {
          if (isMountedRef.current) setIsDeploying(false)
          alert('⚠️ KEINE WERKE GEFUNDEN!\n\nBitte zuerst Werke speichern bevor veröffentlicht wird.\n\n📋 Prüfe:\n1. Sind Werke in "Werke verwalten" vorhanden?\n2. Werden Werke korrekt gespeichert?\n3. Prüfe Browser-Konsole für Fehler')
          return
        }
        
        // KRITISCH: Beim Export aktuellen State verwenden (nicht nur localStorage), damit Eventplanung + Öffentlichkeitsarbeit mitgehen
        const eventsForExport = (Array.isArray(events) && events.length > 0) ? events : (getItemSafe('k2-events', []) || [])
        const documentsForExport = (Array.isArray(documents) && documents.length > 0) ? documents : (getItemSafe('k2-documents', []) || [])
        
        const exportedAt = new Date().toISOString()
        // KRITISCH: Erhöhe Versionsnummer für Cache-Busting
        const currentVersion = parseInt(localStorage.getItem('k2-data-version') || '0')
        const newVersion = currentVersion + 1
        localStorage.setItem('k2-data-version', newVersion.toString())
        
        const galleryStamm = getItemSafe('k2-stammdaten-galerie', {})
        const pageContent = getPageContentGalerie()
        const data = {
          martina: getItemSafe('k2-stammdaten-martina', {}),
          georg: getItemSafe('k2-stammdaten-georg', {}),
          gallery: {
            ...galleryStamm,
            welcomeImage: galleryData.welcomeImage ?? pageContent.welcomeImage ?? galleryStamm.welcomeImage ?? '',
            galerieCardImage: galleryData.galerieCardImage ?? pageContent.galerieCardImage ?? galleryStamm.galerieCardImage ?? '',
            virtualTourImage: galleryData.virtualTourImage ?? pageContent.virtualTourImage ?? galleryStamm.virtualTourImage ?? ''
          },
          artworks: Array.isArray(artworks) ? sortArtworksNewestFirst(artworks) : [],
          events: Array.isArray(eventsForExport) ? eventsForExport.slice(0, 20) : [], // NUR 20 Events – aus State oder localStorage
          documents: Array.isArray(documentsForExport) ? documentsForExport.slice(0, 20) : [], // NUR 20 Dokumente
          designSettings: getItemSafe('k2-design-settings', {}),
          pageTexts: getItemSafe('k2-page-texts', null),
          exportedAt: exportedAt,
          version: newVersion, // Versionsnummer für Cache-Busting
          buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}` // Eindeutige Build-ID
        }
        
        // WICHTIG: Prüfe nochmal ob Werke im Export vorhanden sind
        if (!data.artworks || data.artworks.length === 0) {
          console.error('❌ FEHLER: Keine Werke im Export-Objekt!', {
            artworksCount: artworks.length,
            dataArtworksCount: data.artworks.length,
            dataKeys: Object.keys(data)
          })
          if (isMountedRef.current) setIsDeploying(false)
          alert('⚠️ FEHLER: Keine Werke im Export!\n\nBitte prüfe Browser-Konsole für Details.')
          return
        }
        
        console.log(`✅ Export vorbereitet: ${data.artworks.length} Werke werden exportiert`)
        
        // JSON.stringify in separatem Frame mit Progress-Check
        const stringifyData = () => {
          try {
            const json = JSON.stringify(data)
            if (json.length > 5000000) { // Max 5MB
              if (isMountedRef.current) setIsDeploying(false)
              alert('⚠️ Daten zu groß. Bitte reduzieren Sie die Anzahl der Werke.')
              return
            }
            
            // Versuche direkt in public Ordner zu schreiben über API
            // WICHTIG: Nur EINMAL aufrufen, nicht mehrfach!
            // MIT TIMEOUT-Schutz (30 Sekunden)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
              controller.abort()
              if (isMountedRef.current) setIsDeploying(false)
              alert('⚠️ API-Timeout:\n\nDie Anfrage dauerte zu lange (über 30 Sekunden).\n\n📋 Bitte manuell:\n1. Terminal öffnen\n2. cd /Users/georgkreinecker/k2Galerie\n3. Prüfe ob public/gallery-data.json existiert\n4. Falls ja: git add/commit/push manuell')
            }, 30000)
            
            let timeoutCleared = false
            fetch('/api/write-gallery-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: json,
              signal: controller.signal
            })
            .then(response => {
              if (!timeoutCleared) {
                clearTimeout(timeoutId)
                timeoutCleared = true
              }
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }
              return response.json()
            })
            .then(result => {
              // Timeout bereits gelöscht
              
              if (result.success) {
                // ANSI-Escape-Codes entfernen (033/034 = Farben aus git-push Script)
                const stripAnsi = (s: string) => String(s)
                  .replace(/\x1b\[[0-9;]*[a-zA-Z]?/g, '')
                  .replace(/[\u001b\u009b]\[[0-9;]*[a-zA-Z]?/g, '')
                  .replace(/\[0?;?3[0-9]m/g, '')  // orphaned ";33m" ";34m" etc
                  .replace(/\r/g, '')
                const gitOutput = stripAnsi(result.git?.output || '')
                const gitError = stripAnsi(result.git?.error || '')
                const gitSuccess = result.git?.success !== false // Default true wenn nicht gesetzt
                const gitExitCode = result.git?.exitCode || 0
                
                console.log('🔍 Git Push Ergebnis:', {
                  gitSuccess,
                  gitExitCode,
                  gitOutputLength: gitOutput.length,
                  gitErrorLength: gitError.length,
                  gitOutputPreview: gitOutput.substring(0, 300),
                  gitErrorPreview: gitError.substring(0, 300),
                  fullResult: result.git
                })
                
                // WICHTIG: Setze isDeploying IMMER auf false, auch bei Fehlern!
                // Das verhindert dass die Seite hängen bleibt
                setIsDeploying(false)
                
                // WICHTIG: Prüfe zuerst ob gitSuccess explizit false ist
                // Das ist die zuverlässigste Quelle
                if (!gitSuccess || gitExitCode !== 0) {
                  // Git push fehlgeschlagen - zeige IMMER Fehlermeldung
                  const gitExitCodeStr = gitExitCode !== 0 ? `\nExit Code: ${gitExitCode}` : ''
                  const gitOutputFull = gitOutput || ''
                  const gitErrorFull = gitError || 'Git Push fehlgeschlagen (keine Details verfügbar)'
                  
                  // Vollständige Fehlermeldung zusammenstellen
                  let fullErrorMsg = gitErrorFull
                  
                  // Zeige Output IMMER wenn vorhanden
                  if (gitOutputFull && gitOutputFull.trim().length > 0) {
                    fullErrorMsg += `\n\n📋 SCRIPT OUTPUT:\n${gitOutputFull.substring(0, 2000)}`
                  }
                  
                  if (gitExitCodeStr) {
                    fullErrorMsg += gitExitCodeStr
                  }
                  
                  console.error('❌ Git Push Fehler Details:', {
                    exitCode: gitExitCode,
                    error: gitErrorFull,
                    output: gitOutputFull,
                    fullResult: result.git,
                    resultSize: result.size,
                    artworksCount: result.artworksCount
                  })
                  
                  // Zeige Fehlermeldung mit Kopier-Button (für Mobile: an Cursor schicken)
                  const msg = `GIT PUSH FEHLGESCHLAGEN\n\nDatei geschrieben: public/gallery-data.json\nGröße: ${(result.size / 1024).toFixed(1)} KB\nWerke: ${result.artworksCount || 0}\n\nFEHLER-DETAILS:\n${fullErrorMsg.substring(0, 3000)}\n\n---\nManuell pushen:\n1. Terminal: cd /Users/georgkreinecker/k2Galerie\n2. git add public/gallery-data.json\n3. git commit -m "Update gallery-data.json"\n4. git push origin main`
                  setPublishErrorMsg(msg)
                  return
                }
                
                // Prüfe ob git push wirklich erfolgreich war - ZUSÄTZLICHE PRÜFUNG
                // WICHTIG: Prüfe auf verschiedene Erfolgs-Indikatoren
                const hasSuccessMessage = gitOutput.includes('git push erfolgreich') || 
                                         gitOutput.includes('✅✅✅ Git Push erfolgreich') ||
                                         gitOutput.includes('To https://') ||
                                         gitOutput.includes('Enumerating objects') ||
                                         gitOutput.includes('Counting objects') ||
                                         gitOutput.includes('Writing objects') ||
                                         gitOutput.includes('remote:')
                
                const hasError = gitError.includes('GIT PUSH FEHLER') ||
                               gitError.includes('FEHLER') ||
                               gitError.toLowerCase().includes('error') ||
                               gitError.toLowerCase().includes('failed') ||
                               gitError.toLowerCase().includes('authentication') ||
                               gitError.toLowerCase().includes('credential') ||
                               gitError.toLowerCase().includes('denied') ||
                               gitError.toLowerCase().includes('fehlgeschlagen')
                
                // Prüfe ob Fehler vorhanden ist
                if (hasError || (gitError && gitError.trim().length > 0)) {
                  // Fehler gefunden - zeige Fehlermeldung
                  const gitExitCodeStr = gitExitCode !== 0 ? `\nExit Code: ${gitExitCode}` : ''
                  let fullErrorMsg = gitError
                  
                  if (gitOutput && gitOutput.trim().length > 0) {
                    fullErrorMsg += `\n\n📋 SCRIPT OUTPUT:\n${gitOutput.substring(0, 1500)}`
                  }
                  
                  if (gitExitCodeStr) {
                    fullErrorMsg += gitExitCodeStr
                  }
                  
                  console.error('❌ Git Push Fehler erkannt:', {
                    hasError,
                    gitError,
                    gitOutput,
                    exitCode: gitExitCode
                  })
                  
                  const msg = `GIT PUSH FEHLGESCHLAGEN\n\nDatei geschrieben: public/gallery-data.json\nGröße: ${(result.size / 1024).toFixed(1)} KB\nWerke: ${result.artworksCount || 0}\n\nFEHLER-DETAILS:\n${fullErrorMsg.substring(0, 3000)}\n\n---\nManuell pushen:\n1. Terminal: cd /Users/georgkreinecker/k2Galerie\n2. git add public/gallery-data.json\n3. git commit -m "Update gallery-data.json"\n4. git push origin main`
                  setPublishErrorMsg(msg)
                  return
                }
                
                // Erfolg - zeige Erfolgsmeldung
                if (hasSuccessMessage || gitSuccess) {
                  // WICHTIG: Erhöhe Versionsnummer für Cache-Busting
                  const currentVersion = parseInt(localStorage.getItem('k2-data-version') || '0')
                  const newVersion = currentVersion + 1
                  localStorage.setItem('k2-data-version', newVersion.toString())
                  
                  // Zeige Modal mit Button statt confirm+window.open (Popup-Blocker umgehen)
                  // Nutzer klickt Button → window.open ist direkt user-initiiert → kein Block
                  setPublishSuccessModal({ size: result.size, version: newVersion })
                } else {
                  // Unklarer Status - zeige Warnung
                  console.warn('⚠️ Unklarer Git Push Status:', {
                    gitSuccess,
                    gitExitCode,
                    gitOutput,
                    gitError
                  })
                  
                  const msg = `Git Push Status unklar\n\nDatei: public/gallery-data.json\nGröße: ${(result.size / 1024).toFixed(1)} KB\nWerke: ${result.artworksCount || 0}\n\nOUTPUT:\n${gitOutput.substring(0, 2000)}\n\nManuell prüfen: git status, git add/commit/push`
                  setPublishErrorMsg(msg)
                }
              } else {
                throw new Error(result.error || 'Unbekannter Fehler')
              }
            })
            .catch(error => {
              // WICHTIG: Setze isDeploying IMMER auf false bei Fehlern!
              setIsDeploying(false)
              
              if (!timeoutCleared) {
                clearTimeout(timeoutId)
                timeoutCleared = true
              }
              
              // Prüfe ob es ein Timeout war
              if (error.name === 'AbortError') {
                alert('⚠️ API-Timeout:\n\nDie Anfrage dauerte zu lange.\n\n📋 Bitte manuell:\n1. Terminal öffnen\n2. cd /Users/georgkreinecker/k2Galerie\n3. Prüfe ob public/gallery-data.json existiert\n4. Falls ja: git add/commit/push manuell')
                return
              }
              
              // Fallback: Download falls API nicht funktioniert (Server läuft nicht)
              try {
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'gallery-data.json'
                link.style.display = 'none'
                document.body.appendChild(link)
                link.click()
                
                // WICHTIG: isDeploying SOFORT zurücksetzen, nicht erst nach Timeout! - NUR wenn gemountet
                if (isMountedRef.current) setIsDeploying(false)
                
                setTimeout(() => {
                  try {
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  } catch {}
                  alert('✅ gallery-data.json wurde heruntergeladen!\n\n📁 Nächste Schritte:\n1. Datei in "public" Ordner kopieren (im Projektordner)\n2. Terminal öffnen und ausführen:\n   git add public/gallery-data.json\n   git commit -m "Update"\n   git push\n3. Auf Vercel warten bis Deployment fertig\n4. Mobile: Seite neu laden\n\n💡 Tipp: Falls Dev-Server läuft, wird die Datei automatisch geschrieben!')
                }, 100)
              } catch (downloadError) {
                if (isMountedRef.current) setIsDeploying(false)
                alert('❌ Fehler:\n\nAPI nicht verfügbar UND Download fehlgeschlagen\n\n' + (error instanceof Error ? error.message : String(error)))
              }
            })
            .finally(() => {
              // SICHERHEIT: Stelle sicher dass isDeploying IMMER zurückgesetzt wird - NUR wenn gemountet
              setTimeout(() => {
                if (isMountedRef.current) setIsDeploying(false)
              }, 100)
            })
          } catch (e) {
            if (isMountedRef.current) setIsDeploying(false)
            alert('Fehler: ' + (e instanceof Error ? e.message : String(e)))
          }
        }
        
        // Verwende requestIdleCallback wenn verfügbar, sonst setTimeout
        if (typeof window.requestIdleCallback !== 'undefined') {
          window.requestIdleCallback(stringifyData, { timeout: 5000 })
        } else {
          setTimeout(stringifyData, 100)
        }
      } catch (error) {
        if (isMountedRef.current) setIsDeploying(false)
        alert('Fehler: ' + (error instanceof Error ? error.message : String(error)))
      }
    }
    
    // Starte Export nach kurzer Verzögerung - MIT Cleanup
    const executeTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        executeExport()
      } else {
        if (isMountedRef.current) setIsDeploying(false)
      }
    }, 50)
    
    // SICHERHEIT: Stelle sicher dass isDeploying nach max 60 Sekunden zurückgesetzt wird - MIT Cleanup
    // WICHTIG: Dieser Timeout wird durch den useEffect oben bereits abgedeckt, daher nicht nochmal hier
    
    // Cleanup Timeouts beim Unmount - WICHTIG: publishMobile ist keine useEffect, daher kein return
    // Die Timeouts werden durch isMountedRef.current geschützt
  }

  // KRITISCH: Behebe Duplikate beim initialen Laden
  useEffect(() => {
    let isMounted = true
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      // Lade Werke und behebe Duplikate
      const artworks = loadArtworks() // Diese Funktion behebt automatisch Duplikate
      if (isMounted) {
        setAllArtworks(artworks)
        console.log('✅ Werke geladen und Duplikate geprüft:', artworks.length)
      }
    }, 100)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])
  
  // Automatisch Künstler basierend auf Kategorie setzen - NUR wenn Kategorie sich ändert
  useEffect(() => {
    let isMounted = true
    // Warte kurz damit Daten geladen sind
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      try {
        // Prüfe nur wenn Kategorie sich ändert, nicht wenn Artist sich ändert
        if (artworkCategory === 'malerei' && martinaData?.name) {
          setArtworkArtist(martinaData.name)
        } else if (artworkCategory === 'keramik' && georgData?.name) {
          setArtworkArtist(georgData.name)
        }
      } catch (error) {
        // Ignoriere Fehler um Crashes zu vermeiden
        console.warn('Fehler beim Setzen des Künstlers:', error)
      }
    }, 500) // Warte bis Daten geladen sind
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [artworkCategory]) // NUR Kategorie - verhindert Render-Loop!


  // Alle Werke aus localStorage laden - SAFE MODE mit Größenprüfung - mit Cleanup
  useEffect(() => {
    let isMounted = true
    
    // Lade Werke verzögert nach anderen Daten
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        const key = getArtworksKey()
        const stored = localStorage.getItem(key)
        if (stored && stored.length > 10000000) { // Über 10MB = zu groß
          console.warn('Werke-Daten zu groß, lade leer')
          if (isMounted) setAllArtworks([])
          return
        }
        const artworks = loadArtworks()
        if (isMounted) {
          if (Array.isArray(artworks)) {
            setAllArtworks(artworks)
          } else {
            setAllArtworks([])
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Werke:', error)
        if (isMounted) setAllArtworks([])
      }
    }, 500) // Lade nach Stammdaten mit mehr Verzögerung
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])
  
  // WICHTIG: Event-Listener für Mobile-Updates (damit Mobile-Werke im Admin angezeigt werden)
  useEffect(() => {
    const handleArtworksUpdate = () => {
      console.log('🔄 artworks-updated Event empfangen - lade Werke neu...')
      try {
        const artworks = loadArtworks()
        console.log('📦 Geladene Werke:', artworks.length)
        if (Array.isArray(artworks)) {
          setAllArtworks(artworks)
        }
      } catch (error) {
        console.error('Fehler beim Neuladen der Werke:', error)
      }
    }
    
    window.addEventListener('artworks-updated', handleArtworksUpdate)
    
    return () => {
      window.removeEventListener('artworks-updated', handleArtworksUpdate)
    }
  }, [])
  
  // WICHTIG: Automatische Synchronisation von Mobile-Werken beim Mount
  // KRITISCH: Mobile-Werke werden automatisch geladen - kein manuelles Speichern nötig!
  // CRASH-SCHUTZ: isMounted prüfen vor jedem setState/Event nach Unmount
  useEffect(() => {
    let isMounted = true
    
    const checkMobileUpdates = async () => {
      try {
        if (!isMounted) return
        // 1. Prüfe Supabase (falls konfiguriert)
        try {
          const { loadArtworksFromSupabase } = await import('../src/utils/supabaseClient')
          const supabaseArtworks = await loadArtworksFromSupabase()
          if (!isMounted) return
          
          if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
            console.log('📱 Mobile-Werke von Supabase geladen:', supabaseArtworks.length)
            
            const localArtworks = loadArtworks()
            const merged = [...localArtworks]
            
            supabaseArtworks.forEach((supabaseArtwork: any) => {
              const exists = merged.some((a: any) => 
                (a.number && supabaseArtwork.number && a.number === supabaseArtwork.number) ||
                (a.id && supabaseArtwork.id && a.id === supabaseArtwork.id)
              )
              if (!exists) {
                merged.push(supabaseArtwork)
              }
            })
            
            if (merged.length > localArtworks.length && isMounted) {
              console.log(`✅ ${merged.length - localArtworks.length} neue Mobile-Werke gefunden`)
              const saved = saveArtworks(merged)
              if (saved && isMounted) {
                setAllArtworks(merged)
              } else if (!saved) {
                console.error('❌ Fehler beim Speichern der Mobile-Werke')
              }
            }
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase-Check fehlgeschlagen (normal wenn nicht konfiguriert):', supabaseError)
        }
        
        if (!isMounted) return
        // 2. KRITISCH: Automatische Synchronisation von Mobile-Werken vom Server
        try {
          const timestamp = Date.now()
          const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
          
          const response = await fetch(url, { 
            cache: 'no-store',
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          })
          
          if (!isMounted) return
          if (response.ok) {
            const data = await response.json()
            if (data.artworks && Array.isArray(data.artworks)) {
              const serverArtworks = data.artworks
              const localArtworks = loadArtworks()
              
              const mobileWorksOnServer = serverArtworks.filter((a: any) => 
                (a.createdOnMobile || a.updatedOnMobile) && 
                !localArtworks.some((local: any) => 
                  (local.number && a.number && local.number === a.number) ||
                  (local.id && a.id && local.id === a.id)
                )
              )
              
              if (mobileWorksOnServer.length > 0 && isMounted) {
                console.log(`📱 ${mobileWorksOnServer.length} Mobile-Werke automatisch vom Server synchronisiert:`, mobileWorksOnServer.map((a: any) => a.number || a.id).join(', '))
                
                const merged = [...localArtworks, ...mobileWorksOnServer]
                const saved = saveArtworks(merged)
                
                if (saved && isMounted) {
                  console.log(`✅ ${mobileWorksOnServer.length} Mobile-Werke automatisch synchronisiert - kein manuelles Speichern nötig!`)
                  setAllArtworks(merged)
                  window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, mobileSync: true, autoSync: true } }))
                } else if (!saved) {
                  console.error('❌ Fehler beim automatischen Speichern der Mobile-Werke')
                }
              } else if (mobileWorksOnServer.length === 0) {
                console.log('ℹ️ Keine neuen Mobile-Werke auf dem Server gefunden')
              }
            }
          }
        } catch (serverError) {
          console.warn('⚠️ Automatische Synchronisation von Mobile-Werken fehlgeschlagen:', serverError)
        }
      } catch (error) {
        console.warn('⚠️ Fehler beim Prüfen auf Mobile-Updates:', error)
      }
    }
    
    const timeoutId = setTimeout(() => {
      if (isMounted) checkMobileUpdates()
    }, 2000)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // Dokumente aus localStorage laden (Key abhängig von K2 vs. ök2)
  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem(getDocumentsKey())
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch (error) {
      console.error('Fehler beim Laden der Dokumente:', error)
      return []
    }
  }

  // Dokumente aus localStorage laden - verzögert - mit Cleanup
  useEffect(() => {
    let isMounted = true
    
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        const docs = loadDocuments()
        if (isMounted) setDocuments(docs)
      } catch (error) {
        console.error('Fehler beim Laden der Dokumente:', error)
        if (isMounted) setDocuments([])
      }
    }, 300)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])

  // Events aus localStorage laden - verzögert - mit Cleanup
  useEffect(() => {
    let isMounted = true
    
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        const loadedEvents = loadEvents()
        if (isMounted) setEvents(loadedEvents)
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error)
        if (isMounted) setEvents([])
      }
    }, 400)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])
  
  // AUTO-SAVE: Speichere alle Daten automatisch alle 5 Sekunden - VERHINDERT DATENVERLUST BEI CRASHES
  useEffect(() => {
    let isMounted = true
    
    // Funktion die alle Daten sammelt
    const getAllData = () => ({
      martina: martinaData,
      georg: georgData,
      gallery: galleryData,
      artworks: allArtworks,
      events: events,
      documents: documents,
      designSettings: designSettings,
      pageTexts: pageTexts
    })
    
    // KRITISCH: Auto-Save nur in K2 – in ök2 niemals in K2-Keys schreiben
    if (!isOeffentlichAdminContext()) {
      startAutoSave(getAllData)
      setupBeforeUnloadSave(getAllData)
    }
    
    return () => {
      isMounted = false
      stopAutoSave()
    }
  }, [martinaData, georgData, galleryData, allArtworks, events, documents, designSettings, pageTexts])

  // Event hinzufügen/bearbeiten
  const handleSaveEvent = () => {
    if (!eventTitle || !eventDate) {
      alert('Bitte Titel und Datum eingeben')
      return
    }

    const eventData = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      endDate: eventEndDate || eventDate, // Falls kein Enddatum, dann Startdatum verwenden
      startTime: eventStartTime || '',
      endTime: eventEndTime || '',
      dailyTimes: eventDailyTimes || {}, // Tägliche Zeiten für jeden Tag
      description: eventDescription,
      location: eventLocation,
      documents: editingEvent?.documents || [],
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedEvents
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? eventData : e)
    } else {
      updatedEvents = [...events, eventData]
    }

    // Nach Startdatum sortieren
    updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setEvents(updatedEvents)
    saveEvents(updatedEvents)
    
    // PR-Vorschläge speichern falls vorhanden
    if (eventPRSuggestions) {
      eventPRSuggestions.eventId = eventData.id
      eventPRSuggestions.eventTitle = eventData.title
      const existingSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
      const index = existingSuggestions.findIndex((s: any) => s.eventId === eventData.id)
      if (index >= 0) {
        existingSuggestions[index] = eventPRSuggestions
      } else {
        existingSuggestions.push(eventPRSuggestions)
      }
      localStorage.setItem('k2-pr-suggestions', JSON.stringify(existingSuggestions))
    } else if (!editingEvent) {
      // Automatisch Vorschläge für neues Event generieren
      generateAutomaticSuggestions(eventData)
    }
    
    // Zurücksetzen
    setShowEventModal(false)
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    setEventLocation('')
    setEventPRSuggestions(null)
    setEditingPRType(null)
    
    alert(editingEvent ? '✅ Event aktualisiert!' : '✅ Event hinzugefügt!')
  }

  // Event bearbeiten
  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventType(event.type)
    setEventDate(event.date)
    setEventEndDate(event.endDate || event.date)
    setEventStartTime(event.startTime || event.time || '')
    setEventEndTime(event.endTime || '')
    // Konvertiere alte Format (string) zu neuem Format (object mit start/end)
    const dailyTimes = event.dailyTimes || {}
    const convertedDailyTimes: Record<string, { start: string, end: string }> = {}
    Object.keys(dailyTimes).forEach(day => {
      const time = dailyTimes[day]
      if (typeof time === 'string') {
        convertedDailyTimes[day] = { start: time, end: '' }
      } else {
        convertedDailyTimes[day] = { start: time?.start || '', end: time?.end || '' }
      }
    })
    setEventDailyTimes(convertedDailyTimes)
    setEventDescription(event.description || '')
    setEventLocation(event.location || '')
    
    // PR-Vorschläge laden falls vorhanden
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    if (eventSuggestion) {
      setEventPRSuggestions(eventSuggestion)
    } else {
      // Neue Vorschläge generieren falls noch nicht vorhanden
      const newSuggestions = {
        eventId: event.id,
        eventTitle: event.title,
        generatedAt: new Date().toISOString(),
        presseaussendung: generatePresseaussendungContent(event),
        socialMedia: generateSocialMediaContent(event),
        flyer: generateFlyerContent(event),
        newsletter: generateNewsletterContent(event),
        plakat: generatePlakatContent(event)
      }
      setEventPRSuggestions(newSuggestions)
    }
    
    setShowEventModal(true)
  }

  // Alle Tage zwischen Start- und Enddatum generieren
  const getEventDays = (startDate: string, endDate: string): string[] => {
    if (!startDate) return []
    const end = endDate || startDate
    const days: string[] = []
    const start = new Date(startDate)
    const endDateObj = new Date(end)
    
    for (let d = new Date(start); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    
    return days
  }

  // Automatische Vorschläge für neues Event generieren
  const generateAutomaticSuggestions = (event: any) => {
    // Speichere Vorschläge in localStorage
    const suggestions = {
      eventId: event.id,
      eventTitle: event.title,
      generatedAt: new Date().toISOString(),
      presseaussendung: generatePresseaussendungContent(event),
      socialMedia: generateSocialMediaContent(event),
      flyer: generateFlyerContent(event),
      newsletter: generateNewsletterContent(event),
      plakat: generatePlakatContent(event)
    }
    
    const existingSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    existingSuggestions.push(suggestions)
    localStorage.setItem('k2-pr-suggestions', JSON.stringify(existingSuggestions))
  }

  // Hilfsfunktion: Alle Termindaten formatieren
  const formatEventDates = (event: any): string => {
    if (!event || !event.date) {
      return 'Datum folgt'
    }
    try {
      const startDate = new Date(event.date)
      if (isNaN(startDate.getTime())) {
        return 'Datum folgt'
      }
      let endDate = event.endDate ? new Date(event.endDate) : null
      if (endDate && isNaN(endDate.getTime())) {
        // EndDate ist ungültig, ignoriere es
        endDate = null
      }
    
    let dateStr = startDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    if (endDate && endDate.getTime() !== startDate.getTime()) {
      dateStr += ` - ${endDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`
    }
    
    // Zeiten hinzufügen
    if (event.dailyTimes && Object.keys(event.dailyTimes).length > 0) {
      // Mehrteiliges Event mit täglichen Zeiten
      const times: string[] = []
      const days = getEventDays(event.date, event.endDate || event.date)
      days.forEach(day => {
        const dayTime = event.dailyTimes[day]
        if (dayTime) {
          const dayDate = new Date(day)
          if (typeof dayTime === 'string') {
            // Altes Format (nur Startzeit)
            times.push(`${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${dayTime}`)
          } else if (dayTime.start || dayTime.end) {
            // Neues Format (Start- und Endzeit)
            const timeStr = dayTime.start 
              ? (dayTime.end ? `${dayTime.start} - ${dayTime.end} Uhr` : `${dayTime.start} Uhr`)
              : (dayTime.end ? `bis ${dayTime.end} Uhr` : '')
            if (timeStr) {
              times.push(`${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${timeStr}`)
            }
          }
        }
      })
      if (times.length > 0) {
        dateStr += '\n\nZeiten:\n' + times.join('\n')
      }
    } else if (event.startTime) {
      dateStr += `\n🕐 ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr`
    }
    
    return dateStr
    } catch (error) {
      console.error('Fehler beim Formatieren der Event-Daten:', error)
      return 'Datum folgt'
    }
  }

  // Content-Generatoren im App-Design-Stil
  const generatePresseaussendungContent = (event: any) => {
    const eventTypeLabels: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    return {
      title: `PRESSEAUSSENDUNG: ${event.title}`,
      content: `
${event.title.toUpperCase()}

EVENT-TYP: ${eventTypeLabels[event.type] || 'Veranstaltung'}

TERMINDATEN:
${formatEventDates(event)}

ORT:
${event.location || galleryData.address || ''}

${galleryData.name || 'K2 Galerie'}
${galleryData.address || ''}
${galleryData.phone ? `Tel: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}

BESCHREIBUNG:
${event.description || 'Wir laden Sie herzlich zu unserer Veranstaltung ein.'}

KÜNSTLER:
${martinaData.name}: ${martinaData.bio}
${georgData.name}: ${georgData.bio}

Für weitere Informationen kontaktieren Sie bitte:
${galleryData.email || ''}
${galleryData.phone || ''}
      `.trim()
    }
  }

  const generateSocialMediaContent = (event: any) => {
    const eventTypeLabels: Record<string, string> = {
      galerieeröffnung: '#Galerieeröffnung #Kunst',
      vernissage: '#Vernissage #Kunstausstellung',
      finissage: '#Finissage #Kunst',
      öffentlichkeitsarbeit: '#Kunst #Galerie',
      sonstiges: '#Kunst #Event'
    }
    
    const eventTypeNames: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    // Formatierte Termindaten für Social Media
    const datesFormatted = formatEventDates(event)
    
    return {
      instagram: `
🎨 ${event.title}

📅 ${datesFormatted}

📍 ${event.location || galleryData.address || ''}

${event.description || 'Wir freuen uns auf deinen/Ihren Besuch!'}

${eventTypeLabels[event.type] || '#Kunst #Galerie'} #K2Galerie #KunstUndKeramik
      `.trim(),
      facebook: `
${event.title}

Wir laden Sie herzlich ein zu unserer ${eventTypeNames[event.type] || 'Veranstaltung'}!

📅 ${datesFormatted}

📍 ${event.location || galleryData.address || ''}

${event.description || 'Besuchen Sie uns auch online!'}

Wir freuen uns auf deinen/Ihren Besuch!
      `.trim()
    }
  }

  const generateFlyerContent = (event: any) => {
    return {
      headline: event.title,
      date: formatEventDates(event),
      location: event.location || galleryData.address || '',
      description: event.description || '',
      type: event.type,
      qrCode: galleryData.website || window.location.origin,
      contact: {
        phone: galleryData.phone || '',
        email: galleryData.email || '',
        address: galleryData.address || ''
      }
    }
  }

  const generateNewsletterContent = (event: any) => {
    const eventTypeNames: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    return {
      subject: `Einladung: ${event.title}`,
      greeting: 'Liebe Kunstfreunde,',
      body: `
wir laden Sie herzlich ein zu unserer ${eventTypeNames[event.type] || 'Veranstaltung'}!

TERMINDATEN:
📅 ${formatEventDates(event)}

ORT:
📍 ${event.location || galleryData.address || ''}

BESCHREIBUNG:
${event.description || 'Wir freuen uns auf deinen/Ihren Besuch!'}

KONTAKT:
${galleryData.phone ? `Tel: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}
${galleryData.address ? `Adresse: ${galleryData.address}` : ''}
      `.trim()
    }
  }

  const generatePlakatContent = (event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const eventTypeNames: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    return {
      title: event.title || 'Event',
      type: eventTypeNames[event.type] || 'Veranstaltung',
      date: formatEventDates(event) || 'Datum folgt',
      location: event.location || galleryData.address || '',
      description: event.description || '',
      qrCode: galleryData.website || window.location.origin,
      contact: {
        phone: galleryData.phone || '',
        email: galleryData.email || '',
        address: galleryData.address || ''
      }
    }
  }

  // Einzelne bearbeitbare PDFs generieren
  // Leichtgewichtige Text-Export Funktionen (statt PDF) - viel weniger Memory-Belastung
  const exportPresseaussendungAsText = (presseaussendung: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const text = `
${'='.repeat(60)}
${galleryName.toUpperCase()}
${'='.repeat(60)}

PRESSEAUSSENDUNG

Event: ${event?.title || 'Nicht angegeben'}
Datum: ${event?.date ? new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Nicht angegeben'}

${galleryData.address ? `Adresse: ${galleryData.address}` : ''}
${galleryData.phone ? `Telefon: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}

${'-'.repeat(60)}

TITEL:
${presseaussendung?.title || ''}

${'-'.repeat(60)}

INHALT:
${presseaussendung?.content || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    // Kopiere in Zwischenablage (sehr leichtgewichtig)
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Presseaussendung wurde in die Zwischenablage kopiert!\n\nDu kannst sie jetzt in Word, Pages oder einem Texteditor einfügen.')
    }).catch(() => {
      // Fallback: Öffne in neuem Fenster (kleiner Blob, sofort freigegeben)
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
      if (win) {
        alert('✅ Text wurde geöffnet. Du kannst ihn kopieren und in Word/Pages einfügen.')
      }
    })
  }

  const exportSocialMediaAsText = (socialMedia: any, event: any) => {
    const text = `
${'='.repeat(60)}
SOCIAL MEDIA POSTS
${'='.repeat(60)}

Event: ${event?.title || 'Nicht angegeben'}

${'-'.repeat(60)}
INSTAGRAM POST:
${'-'.repeat(60)}
${socialMedia?.instagram || ''}

${'-'.repeat(60)}
FACEBOOK POST:
${'-'.repeat(60)}
${socialMedia?.facebook || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Social Media Posts wurden in die Zwischenablage kopiert!')
    }).catch(() => {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
    })
  }

  const exportNewsletterAsText = (newsletter: any, event: any) => {
    const text = `
${'='.repeat(60)}
E-MAIL NEWSLETTER
${'='.repeat(60)}

Event: ${event?.title || 'Nicht angegeben'}

${'-'.repeat(60)}
BETREFF:
${newsletter?.subject || ''}

${'-'.repeat(60)}
INHALT:
${newsletter?.body || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Newsletter wurde in die Zwischenablage kopiert!')
    }).catch(() => {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
    })
  }

  const generateEditablePresseaussendungPDF = (presseaussendung: any, event: any) => {
    let blob: Blob | null = null // WICHTIG: Außerhalb try-catch definieren
    
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    const galleryAddress = galleryData.address || ''
    const galleryPhone = galleryData.phone || ''
    const galleryEmail = galleryData.email || ''
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presseaussendung - ${event?.title || 'Event'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important; 
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .page { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: none !important; 
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      .header { 
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
        margin-bottom: 25px !important;
      }
      .header h1 { 
        color: #667eea !important; 
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }
      .header-info { color: #666 !important; }
      h1 { 
        color: #1a1a1a !important; 
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
        margin-bottom: 20px !important;
      }
      label { 
        color: #333 !important; 
        font-weight: 700 !important;
      }
      textarea, input[type="text"] { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: 2px solid #ddd !important;
        padding: 12px !important;
      }
      textarea:focus, input[type="text"]:focus {
        border-color: #667eea !important;
        outline: 2px solid rgba(102, 126, 234, 0.2) !important;
      }
      .field-group {
        margin-bottom: 25px !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 30mm 25mm;
      background: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.2rem;
      color: #667eea;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header-info {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.8;
    }
    .header-info strong {
      color: #333;
      font-weight: 600;
    }
    h1 {
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 700;
    }
    .field-group {
      margin-bottom: 25px;
    }
    label {
      display: block;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Arial', sans-serif;
    }
    textarea, input[type="text"] {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      resize: vertical;
      background: white;
      color: #1a1a1a;
      transition: all 0.2s ease;
    }
    textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    textarea {
      min-height: 300px;
      font-size: 1.05rem;
    }
    input[type="text"] {
      font-size: 1.1rem;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .no-print p {
      color: #666;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="goBack(); return false;" style="background: #6b7280; margin-right: 8px; cursor: pointer;">← Zurück</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Änderungen speichern</button>
    <p>Bearbeite die Felder direkt. Nach dem Drucken kannst du die Änderungen speichern.</p>
  </div>

  <div class="page">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${galleryAddress ? `<strong>Adresse:</strong> ${galleryAddress}<br>` : ''}
        ${galleryPhone ? `<strong>Telefon:</strong> ${galleryPhone}<br>` : ''}
        ${galleryEmail ? `<strong>E-Mail:</strong> ${galleryEmail}<br>` : ''}
        ${event?.date ? `<strong>Event-Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br>` : ''}
        ${event?.title ? `<strong>Event:</strong> ${event.title}` : ''}
      </div>
    </div>
    
    <h1>Presseaussendung</h1>
    
    <div class="field-group">
      <label>Titel der Presseaussendung</label>
      <input type="text" id="presse-title" value="${(presseaussendung?.title || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Inhalt der Presseaussendung</label>
      <textarea id="presse-content" rows="30">${(presseaussendung?.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        presseaussendung: {
          title: document.getElementById('presse-title').value,
          content: document.getElementById('presse-content').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Versuche Fenster zu öffnen - mit besserer Pop-up-Erkennung
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      // Prüfe ob Fenster wirklich geöffnet wurde (mit kurzer Verzögerung)
      setTimeout(() => {
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          // Pop-up blockiert - öffne als Link ohne Download-Attribut
          URL.revokeObjectURL(url)
          const newUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = newUrl
          link.target = '_blank'
          // KEIN download-Attribut - Browser öffnet Datei statt Download
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
            // URL nicht sofort revoken - Browser braucht Zeit zum Laden
            setTimeout(() => URL.revokeObjectURL(newUrl), 2000)
          }, 100)
        } else {
          // Fenster erfolgreich geöffnet - Cleanup später
          pdfWindow.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(url)
          })
        }
      }, 100)
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error)
      alert('Fehler beim Generieren des PDFs. Bitte versuche es erneut.')
      return // WICHTIG: Return wenn Fehler, damit blob nicht verwendet wird
    }
    
    // Speichere auch in Dokumente-Sektion (nur wenn blob erfolgreich erstellt wurde)
    if (blob) {
      const reader = new FileReader()
      const blobToSave: Blob = blob // Explizite Type-Assertion
      reader.onloadend = () => {
        const documentData = {
          id: `pr-editable-presseaussendung-${event?.id || 'unknown'}-${Date.now()}`,
          name: `Presseaussendung (bearbeitbar) - ${event?.title || 'Event'}`,
          type: 'text/html',
          size: blobToSave.size,
          data: reader.result as string,
          fileName: `presseaussendung-editable-${(event?.title || 'event').replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: event?.id,
          eventTitle: event?.title
        }
        const existingDocs = loadDocuments()
        const filteredDocs = existingDocs.filter((d: any) => 
          !(d.category === 'pr-dokumente' && d.eventId === event?.id && d.name.includes('Presseaussendung (bearbeitbar)'))
        )
        const updated = [...filteredDocs, documentData]
        saveDocuments(updated)
      }
      reader.readAsDataURL(blob)
    }
  }

  const generateEditableSocialMediaPDF = (socialMedia: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media - ${event?.title || 'Event'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important; 
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .page { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: none !important; 
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 0 30mm 0 !important;
        max-width: 100% !important;
      }
      .page-break { page-break-after: always; }
      .header { 
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
        margin-bottom: 25px !important;
      }
      .header h1 { 
        color: #667eea !important; 
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }
      h1 { 
        color: #1a1a1a !important; 
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
        margin-bottom: 20px !important;
      }
      h2 { 
        color: #333 !important; 
        border-bottom: 1px solid #ddd !important;
        padding-bottom: 8px !important;
        margin-top: 30px !important;
      }
      label { 
        color: #333 !important; 
        font-weight: 700 !important;
      }
      textarea { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: 2px solid #ddd !important;
        padding: 12px !important;
      }
      textarea:focus {
        border-color: #667eea !important;
        outline: 2px solid rgba(102, 126, 234, 0.2) !important;
      }
      .field-group {
        margin-bottom: 25px !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto 2rem;
      padding: 30mm 25mm;
      background: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.2rem;
      color: #667eea;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header-info {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.8;
    }
    .header-info strong {
      color: #333;
      font-weight: 600;
    }
    h1 {
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 700;
    }
    h2 {
      font-size: 1.4rem;
      color: #333;
      margin: 30px 0 15px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      font-weight: 600;
    }
    .field-group {
      margin-bottom: 25px;
    }
    label {
      display: block;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    textarea {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      resize: vertical;
      background: white;
      color: #1a1a1a;
      min-height: 200px;
      transition: all 0.2s ease;
    }
    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .no-print p {
      color: #666;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="goBack(); return false;" style="background: #6b7280; margin-right: 8px; cursor: pointer;">← Zurück</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Änderungen speichern</button>
    <p>Bearbeite die Felder direkt. Nach dem Drucken kannst du die Änderungen speichern.</p>
  </div>

  <div class="page">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${event?.title ? `<strong>Event:</strong> ${event.title}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>Social Media Posts</h1>
    
    <h2>Instagram Post</h2>
    <div class="field-group">
      <label>Instagram Text</label>
      <textarea id="instagram-post" rows="18">${((socialMedia?.instagram || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    
    <h2>Facebook Post</h2>
    <div class="field-group">
      <label>Facebook Text</label>
      <textarea id="facebook-post" rows="18">${((socialMedia?.facebook || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        socialMedia: {
          instagram: document.getElementById('instagram-post').value,
          facebook: document.getElementById('facebook-post').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Versuche Fenster zu öffnen - mit besserer Pop-up-Erkennung
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      // Prüfe ob Fenster wirklich geöffnet wurde (mit kurzer Verzögerung)
      setTimeout(() => {
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          // Pop-up blockiert - öffne als Link ohne Download-Attribut
          URL.revokeObjectURL(url)
          const newUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = newUrl
          link.target = '_blank'
          // KEIN download-Attribut - Browser öffnet Datei statt Download
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
            // URL nicht sofort revoken - Browser braucht Zeit zum Laden
            setTimeout(() => URL.revokeObjectURL(newUrl), 2000)
          }, 100)
        } else {
          // Fenster erfolgreich geöffnet - Cleanup später
          pdfWindow.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(url)
          })
        }
      }, 100)
      
      // Speichere auch in Dokumente-Sektion
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `pr-editable-socialmedia-${event?.id || 'unknown'}-${Date.now()}`,
          name: `Social Media Posts (bearbeitbar) - ${event?.title || 'Event'}`,
          type: 'text/html',
          size: blob.size,
          data: reader.result as string,
          fileName: `social-media-editable-${(event?.title || 'event').replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: event?.id,
          eventTitle: event?.title
        }
        const existingDocs = loadDocuments()
        const filteredDocs = existingDocs.filter((d: any) => 
          !(d.category === 'pr-dokumente' && d.eventId === event?.id && d.name.includes('Social Media Posts (bearbeitbar)'))
        )
        const updated = [...filteredDocs, documentData]
        saveDocuments(updated)
      }
      reader.onerror = () => {
        console.error('Fehler beim Lesen des Blobs')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error)
      alert('Fehler beim Generieren des PDFs. Bitte versuche es erneut.')
    }
  }

  // Platzhalter-Funktionen für Event-Flyer und Newsletter-Content
  const generateEventFlyerContent = (event: any): string => {
    // TODO: Implementiere Flyer-Generierung
    return ''
  }

  const generateEmailNewsletterContent = (event: any): string => {
    // TODO: Implementiere Newsletter-Generierung
    return ''
  }

  const generateEditableNewsletterPDF = (newsletter: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter - ${event?.title || 'Event'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important; 
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .page { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: none !important; 
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      .header { 
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
        margin-bottom: 25px !important;
      }
      .header h1 { 
        color: #667eea !important; 
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }
      .header-info { color: #666 !important; }
      h1 { 
        color: #1a1a1a !important; 
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
        margin-bottom: 20px !important;
      }
      label { 
        color: #333 !important; 
        font-weight: 700 !important;
      }
      textarea, input[type="text"] { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: 2px solid #ddd !important;
        padding: 12px !important;
      }
      textarea:focus, input[type="text"]:focus {
        border-color: #667eea !important;
        outline: 2px solid rgba(102, 126, 234, 0.2) !important;
      }
      .field-group {
        margin-bottom: 25px !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 30mm 25mm;
      background: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.2rem;
      color: #667eea;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header-info {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.8;
    }
    .header-info strong {
      color: #333;
      font-weight: 600;
    }
    h1 {
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 700;
    }
    .field-group {
      margin-bottom: 25px;
    }
    label {
      display: block;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Arial', sans-serif;
    }
    textarea, input[type="text"] {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      resize: vertical;
      background: white;
      color: #1a1a1a;
      transition: all 0.2s ease;
    }
    textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    textarea {
      min-height: 300px;
      font-size: 1.05rem;
    }
    input[type="text"] {
      font-size: 1.1rem;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .no-print p {
      color: #666;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="goBack(); return false;" style="background: #6b7280; margin-right: 8px; cursor: pointer;">← Zurück</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Änderungen speichern</button>
    <p>Bearbeite die Felder direkt. Nach dem Drucken kannst du die Änderungen speichern.</p>
  </div>

  <div class="page">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${event?.title ? `<strong>Event:</strong> ${event.title}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>E-Mail Newsletter</h1>
    
    <div class="field-group">
      <label>E-Mail Betreff</label>
      <input type="text" id="newsletter-subject" value="${(newsletter?.subject || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Newsletter Inhalt</label>
      <textarea id="newsletter-body" rows="30">${((newsletter?.body || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        newsletter: {
          subject: document.getElementById('newsletter-subject').value,
          body: document.getElementById('newsletter-body').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-editable-newsletter-${event?.id || 'unknown'}-${Date.now()}`,
        name: `Newsletter (bearbeitbar) - ${event?.title || 'Event'}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `newsletter-editable-${(event?.title || 'event').replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event?.id,
        eventTitle: event?.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event?.id && d.name.includes('Newsletter (bearbeitbar)'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
  }

  // Bearbeitbare PR-Vorschläge als PDF generieren
  const generateEditablePRSuggestionsPDF = (suggestions: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PR-Vorschläge - ${suggestions.eventTitle || 'Event'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important; 
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
      .page { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: none !important; 
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 0 30mm 0 !important;
        max-width: 100% !important;
      }
      .header { 
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
        margin-bottom: 25px !important;
      }
      .header h1 { 
        color: #667eea !important; 
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }
      .header-info { color: #666 !important; }
      h1 { 
        color: #1a1a1a !important; 
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
        margin-bottom: 20px !important;
      }
      h2 { 
        color: #333 !important; 
        border-bottom: 1px solid #ddd !important;
        padding-bottom: 8px !important;
        margin-top: 30px !important;
      }
      label { 
        color: #333 !important; 
        font-weight: 700 !important;
      }
      textarea, input[type="text"] { 
        background: white !important; 
        color: #1a1a1a !important; 
        border: 2px solid #ddd !important;
        padding: 12px !important;
      }
      textarea:focus, input[type="text"]:focus {
        border-color: #667eea !important;
        outline: 2px solid rgba(102, 126, 234, 0.2) !important;
      }
      .info-box { 
        background: #f5f5f5 !important; 
        border-left: 4px solid #667eea !important;
        color: #333 !important;
      }
      .info-box strong { 
        color: #667eea !important; 
      }
      .field-group {
        margin-bottom: 25px !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto 2rem;
      padding: 30mm 25mm;
      background: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.2rem;
      color: #667eea;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header-info {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.8;
    }
    .header-info strong {
      color: #333;
      font-weight: 600;
    }
    h1 {
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 700;
    }
    h2 {
      font-size: 1.4rem;
      color: #333;
      margin: 30px 0 15px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      font-weight: 600;
    }
    .field-group {
      margin-bottom: 25px;
    }
    label {
      display: block;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Arial', sans-serif;
    }
    textarea, input[type="text"] {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      resize: vertical;
      background: white;
      color: #1a1a1a;
      transition: all 0.2s ease;
    }
    textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    textarea {
      min-height: 200px;
      font-size: 1.05rem;
    }
    input[type="text"] {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .info-box {
      background: #f5f5f5;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin-bottom: 25px;
      border-radius: 6px;
      font-size: 0.95rem;
      line-height: 1.8;
    }
    .info-box strong {
      color: #667eea;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .no-print p {
      color: #666;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="goBack()" style="background: #6b7280; margin-right: 8px;">← Zurück</button>
    <button onclick="window.print()">🖨️ Als PDF drucken</button>
    <button onclick="saveAllChanges()">💾 Alle Änderungen speichern</button>
    <p>Bearbeite die Felder direkt. Nach dem Drucken kannst du die Änderungen speichern.</p>
  </div>

  <!-- Seite 1: Presseaussendung -->
  <div class="page">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>Presseaussendung</h1>
    
    <div class="field-group">
      <label>Titel der Presseaussendung</label>
      <input type="text" id="presse-title" value="${(suggestions.presseaussendung?.title || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Inhalt der Presseaussendung</label>
      <textarea id="presse-content" rows="22">${(suggestions.presseaussendung?.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <!-- Seite 2: Social Media -->
  <div class="page page-break">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}` : ''}
      </div>
    </div>
    
    <h1>Social Media Posts</h1>
    
    <h2>Instagram Post</h2>
    <div class="field-group">
      <label>Instagram Text</label>
      <textarea id="instagram-post" rows="15">${((suggestions.socialMedia?.instagram || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    
    <h2>Facebook Post</h2>
    <div class="field-group">
      <label>Facebook Text</label>
      <textarea id="facebook-post" rows="15">${((suggestions.socialMedia?.facebook || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <!-- Seite 3: Newsletter -->
  <div class="page page-break">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}` : ''}
      </div>
    </div>
    
    <h1>E-Mail Newsletter</h1>
    
    <div class="field-group">
      <label>E-Mail Betreff</label>
      <input type="text" id="newsletter-subject" value="${(suggestions.newsletter?.subject || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Newsletter Inhalt</label>
      <textarea id="newsletter-body" rows="22">${((suggestions.newsletter?.body || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
  </div>

  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveAllChanges() {
      var changes = {
        presseaussendung: {
          title: document.getElementById('presse-title').value,
          content: document.getElementById('presse-content').value
        },
        socialMedia: {
          instagram: document.getElementById('instagram-post').value,
          facebook: document.getElementById('facebook-post').value
        },
        newsletter: {
          subject: document.getElementById('newsletter-subject').value,
          body: document.getElementById('newsletter-body').value
        }
      }
      
      // Kopiere die Änderungen in die Zwischenablage
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-editable-all-${event?.id || 'unknown'}-${Date.now()}`,
        name: `PR-Vorschläge (alle bearbeitbar) - ${event?.title || suggestions.eventTitle || 'Event'}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `pr-suggestions-editable-${(event?.title || suggestions.eventTitle || 'event').replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event?.id,
        eventTitle: event?.title || suggestions.eventTitle
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event?.id && d.name.includes('PR-Vorschläge (alle bearbeitbar)'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
  }

  // Presseaussendung mit Content generieren (Hilfsfunktion)
  const generatePresseaussendungWithContent = (event: any, content: string) => {
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presseaussendung - ${event.title}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    .header {
      border-bottom: 2px solid rgba(95, 251, 241, 0.2);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .content {
      line-height: 1.8;
      font-size: 1.1rem;
      white-space: pre-wrap;
      color: #b8c5e0;
    }
    .highlight {
      color: #5ffbf1;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
    <button onclick="navigator.clipboard.writeText(document.querySelector('.content').textContent)">📋 Text kopieren</button>
  </div>
  
  <div class="container">
    <div class="header">
      <h1>PRESSEAUSSENDUNG</h1>
    </div>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-presseaussendung-${event.id}-${Date.now()}`,
        name: `Presseaussendung - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `presseaussendung-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      // Entferne alte Presseaussendung für dieses Event
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Presseaussendung'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Presseaussendung generiert!')
  }

  // Presseaussendung generieren (mit App-Design)
  const generatePresseaussendung = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const content = eventSuggestion?.presseaussendung?.content || generatePresseaussendungContent(event).content
    
    generatePresseaussendungWithContent(event, content)
  }

  // Social Media Posts für spezifisches Event generieren
  const generateSocialMediaPostsForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const socialContent = eventSuggestion?.socialMedia || generateSocialMediaContent(event)
    const instagramPost = socialContent.instagram
    const facebookPost = socialContent.facebook

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media Posts - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2rem;
      color: #5ffbf1;
      margin-bottom: 2rem;
      text-align: center;
    }
    .post {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    }
    .platform {
      font-size: 1.5rem;
      font-weight: 600;
      color: #5ffbf1;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .post-content {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      white-space: pre-wrap;
      font-size: 1.1rem;
      line-height: 1.8;
      color: #b8c5e0;
      font-family: inherit;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Social Media Posts</h1>
    
    <div class="post">
      <div class="platform">📱 Instagram</div>
      <div class="post-content">${instagramPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${instagramPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
    
    <div class="post">
      <div class="platform">📘 Facebook</div>
      <div class="post-content">${facebookPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${facebookPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-socialmedia-${event.id}-${Date.now()}`,
        name: `Social Media Posts - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `social-media-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Social Media'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Social Media Posts generiert!')
  }

  // Social Media Posts generieren (mit App-Design) - Fallback
  const generateSocialMediaPosts = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateSocialMediaPostsForEvent(selectedEvent || events[0])
  }

  // Event-Flyer für spezifisches Event generieren
  const generateEventFlyerForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const flyerContent = eventSuggestion?.flyer || generateFlyerContent(event)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(flyerContent.qrCode)}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flyer - ${flyerContent.headline}</title>
  <style>
    @media print {
      body { margin: 0; background: white; }
      .no-print { display: none; }
      .flyer { background: white !important; color: #1a1f3a !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .flyer {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    h1 {
      font-size: 3rem;
      margin: 0 0 2rem 0;
      color: #5ffbf1;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .event-info {
      font-size: 1.3rem;
      margin: 2rem 0;
      line-height: 2;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
    }
    .description {
      margin: 2rem 0;
      line-height: 1.8;
      font-size: 1.1rem;
      color: #b8c5e0;
    }
    .qr-code {
      text-align: center;
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
    }
    .qr-code img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
    }
    .contact {
      margin-top: auto;
      font-size: 1rem;
      color: #8fa0c9;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      padding-top: 1.5rem;
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.2rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Drucken (A4)</button>
  </div>
  
  <div class="flyer">
    <div>
      <h1>${flyerContent.headline}</h1>
      
      ${flyerContent.type ? `<p style="font-size: 1.2rem; color: #8fa0c9; margin-bottom: 1rem;">${flyerContent.type === 'galerieeröffnung' ? 'Galerieeröffnung' : flyerContent.type === 'vernissage' ? 'Vernissage' : flyerContent.type === 'finissage' ? 'Finissage' : flyerContent.type === 'öffentlichkeitsarbeit' ? 'Öffentlichkeitsarbeit' : 'Veranstaltung'}</p>` : ''}
      
      <div class="event-info">
        <p><strong>📅 Termindaten:</strong></p>
        <p style="white-space: pre-wrap; margin-left: 1rem;">${flyerContent.date.replace(/\n/g, '<br>')}</p>
        
        ${flyerContent.location ? `<p style="margin-top: 1rem;"><strong>📍 Ort:</strong> ${flyerContent.location}</p>` : ''}
      </div>
      
      ${flyerContent.description ? `<div class="description">${flyerContent.description.replace(/\n/g, '<br>')}</div>` : ''}
    </div>
    
    <div class="qr-code">
      <p style="color: #5ffbf1; font-weight: 600; margin-bottom: 1rem;">Besuchen Sie uns online:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #8fa0c9;">${flyerContent.qrCode}</p>
    </div>
    
    <div class="contact">
      <p><strong>${flyerContent.contact?.address ? flyerContent.contact.address.split(',')[0] : (galleryData.name || 'K2 Galerie')}</strong></p>
      ${flyerContent.contact?.address ? `<p>${flyerContent.contact.address}</p>` : (galleryData.address ? `<p>${galleryData.address}</p>` : '')}
      ${flyerContent.contact?.phone ? `<p>Tel: ${flyerContent.contact.phone}</p>` : (galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : '')}
      ${flyerContent.contact?.email ? `<p>E-Mail: ${flyerContent.contact.email}</p>` : (galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : '')}
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-flyer-${event.id}-${Date.now()}`,
        name: `Flyer - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `flyer-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Flyer'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Flyer generiert! Bitte im Browser drucken.')
  }

  // Event-Flyer generieren (mit App-Design) - Fallback
  const generateEventFlyer = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateEventFlyerForEvent(selectedEvent || events[0])
  }

  // E-Mail-Newsletter für spezifisches Event generieren
  const generateEmailNewsletterForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const newsletterContent = eventSuggestion?.newsletter || generateNewsletterContent(event)
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    .email {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1.5rem;
      letter-spacing: 0.02em;
    }
    .greeting {
      font-size: 1.2rem;
      color: #b8c5e0;
      margin-bottom: 1.5rem;
    }
    .event-box {
      background: rgba(95, 251, 241, 0.1);
      border: 1px solid rgba(95, 251, 241, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    .event-box p {
      margin: 0.75rem 0;
      color: #b8c5e0;
      font-size: 1.1rem;
    }
    .event-box strong {
      color: #5ffbf1;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      text-decoration: none;
      border-radius: 12px;
      margin: 1.5rem 0;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      font-size: 0.95rem;
      color: #8fa0c9;
    }
    .footer strong {
      color: #5ffbf1;
      font-size: 1.1rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 2rem;">
    <button onclick="navigator.clipboard.writeText(document.querySelector('.email').outerHTML)">📋 HTML kopieren</button>
  </div>
  
  <div class="container">
    <div class="email">
      <h1>${event.title}</h1>
      
      <p class="greeting">${newsletterContent.greeting}</p>
      
      <div class="event-box" style="white-space: pre-wrap;">
        ${newsletterContent.body.replace(/\n/g, '<br>')}
      </div>
      
      <a href="${galleryData.website || window.location.origin}" class="button">Mehr erfahren →</a>
      
      <div class="footer">
        <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
        ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
        ${galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : ''}
        ${galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-newsletter-${event.id}-${Date.now()}`,
        name: `Newsletter - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `newsletter-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Newsletter'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Newsletter generiert! HTML-Code kann kopiert werden.')
  }

  // E-Mail-Newsletter generieren (mit App-Design) - Fallback
  const generateEmailNewsletter = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateEmailNewsletterForEvent(selectedEvent || events[0])
  }

  // Plakat für spezifisches Event generieren
  const generatePlakatForEvent = (event: any) => {
    let blob: Blob | null = null // WICHTIG: Außerhalb try-catch definieren
    
    try {
      console.log('generatePlakatForEvent aufgerufen mit Event:', event)
      
      if (!event) {
        console.error('Kein Event übergeben')
        alert('Fehler: Kein Event ausgewählt')
        return
      }
      
      // IMMER frische Daten aus localStorage laden
      const freshGalleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
      const freshSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
      const freshEventSuggestion = freshSuggestions.find((s: any) => s.eventId === event.id)
      
      // Generiere Plakat-Content mit aktuellen Daten
      let plakatContent = freshEventSuggestion?.plakat || generatePlakatContent(event)
      
      // Sicherstellen dass alle Werte vorhanden sind und mit aktuellen Daten aktualisieren
      if (!plakatContent || typeof plakatContent !== 'object') {
        plakatContent = generatePlakatContent(event)
      }
      
      // Aktualisiere mit neuesten Event-Daten
      plakatContent.title = event.title || plakatContent.title || 'Event'
      plakatContent.date = formatEventDates(event) || plakatContent.date || 'Datum folgt'
      plakatContent.location = event.location || plakatContent.location || freshGalleryData.address || ''
      plakatContent.description = event.description || plakatContent.description || ''
      
      // QR-Code: Verwende Website-URL oder Homepage-URL
      const websiteUrl = freshGalleryData.website || window.location.origin
      plakatContent.qrCode = websiteUrl
      
      // Event-Typ aktualisieren
      const eventTypeNames: Record<string, string> = {
        galerieeröffnung: 'Galerieeröffnung',
        vernissage: 'Vernissage',
        finissage: 'Finissage',
        öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
        sonstiges: 'Veranstaltung'
      }
      plakatContent.type = eventTypeNames[event.type] || plakatContent.type || 'Veranstaltung'
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(plakatContent.qrCode)}`
      
      // Verwende die bereits geladenen frischen Galerie-Daten
      const currentGalleryData = freshGalleryData
      
      console.log('Plakat Content:', plakatContent)
      console.log('Event:', event)
      console.log('QR Code URL:', qrCodeUrl)
      console.log('Aktuelle Galerie-Daten:', currentGalleryData)
    
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Plakat - ${plakatContent.title}</title>
  <style>
    @media print {
      body { margin: 0; background: white !important; }
      .no-print { display: none; }
      .plakat { width: 297mm; height: 420mm; background: white !important; color: #1a1f3a !important; }
      .plakat h1 { color: #1a1f3a !important; }
      .plakat .event-info { color: #333 !important; }
      .plakat .contact { color: #666 !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .plakat {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 297mm;
      min-height: 420mm;
      margin: 0 auto;
      padding: 4rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 5rem;
      margin: 0 0 3rem 0;
      color: #5ffbf1;
      text-align: center;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    .event-info {
      font-size: 2rem;
      text-align: center;
      margin: 2rem 0;
      line-height: 2.5;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
      font-size: 2.2rem;
    }
    .qr-code {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }
    .qr-code img {
      width: 250px;
      height: 250px;
      border-radius: 12px;
    }
    .qr-code p {
      font-size: 1.2rem;
      margin-top: 1rem;
      color: #8fa0c9;
    }
    .contact {
      text-align: center;
      font-size: 1.5rem;
      color: #8fa0c9;
      margin-top: auto;
      width: 100%;
      padding-top: 2rem;
      border-top: 2px solid rgba(95, 251, 241, 0.2);
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.8rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="goBack(); return false;" style="background: #6b7280; margin-right: 8px; cursor: pointer;">← Zurück</button>
    <button onclick="window.print(); return false;">🖨️ Drucken (A3)</button>
  </div>
  
  <div class="plakat">
    <h1>${String(plakatContent.title || 'Event').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
    
    ${plakatContent.type ? `<p style="font-size: 2rem; color: #8fa0c9; margin-bottom: 2rem; text-align: center;">${String(plakatContent.type).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
    
    <div class="event-info">
      <p><strong>Termindaten:</strong></p>
      <p style="white-space: pre-wrap; font-size: 1.8rem; line-height: 1.6; margin-top: 1rem;">${String(plakatContent.date || 'Datum folgt').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
      
      ${plakatContent.location ? `<p style="margin-top: 2rem; font-size: 1.6rem;">📍 ${String(plakatContent.location).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      
      ${plakatContent.description ? `<p style="margin-top: 2rem; font-size: 1.4rem; line-height: 1.6; color: #b8c5e0;">${String(plakatContent.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>` : ''}
    </div>
    
    <div class="qr-code">
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p>${String(plakatContent.qrCode || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
    
    <div class="contact">
      <p><strong>${String(currentGalleryData.name || 'K2 Galerie').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></p>
      ${currentGalleryData.address ? `<p>${String(currentGalleryData.address).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      ${currentGalleryData.phone ? `<p>${String(currentGalleryData.phone).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      ${currentGalleryData.email ? `<p>${String(currentGalleryData.email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
    </div>
  </div>
  
  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
  </script>
</body>
</html>
    `
      
      console.log('HTML generiert, Länge:', html.length)

      blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      console.log('Plakat HTML generiert, Größe:', blob.size, 'bytes')
      console.log('Plakat URL erstellt:', url.substring(0, 50) + '...')
      
      // Versuche Fenster zu öffnen
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        // Pop-up blockiert - öffne als Link ohne Download-Attribut
        console.log('Popup blockiert, verwende Fallback-Link')
        URL.revokeObjectURL(url)
        const newUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = newUrl
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          // URL nicht sofort revoken - Browser braucht Zeit zum Laden
          setTimeout(() => {
            console.log('Revoking fallback URL nach 15 Sekunden')
            URL.revokeObjectURL(newUrl)
          }, 15000)
        }, 100)
      } else {
        // Fenster erfolgreich geöffnet - Cleanup NUR wenn Fenster geschlossen wird
        // WICHTIG: URL nicht sofort revoken, sonst wird Seite weiß!
        console.log('Fenster erfolgreich geöffnet')
        
        // Warte bis Seite geladen ist bevor wir URL revoken
        pdfWindow.addEventListener('load', function() {
          console.log('Plakat-Seite geladen')
        })
        
        pdfWindow.addEventListener('beforeunload', function() {
          console.log('Fenster wird geschlossen, revoke URL')
          URL.revokeObjectURL(url)
        })
        
        // Fallback: Cleanup nach 60 Sekunden (falls beforeunload nicht funktioniert)
        setTimeout(function() {
          if (pdfWindow.closed) {
            console.log('Fenster geschlossen (Timeout), revoke URL')
            URL.revokeObjectURL(url)
          } else {
            console.log('Fenster noch offen nach 60 Sekunden, URL bleibt aktiv')
          }
        }, 60000)
      }
    } catch (error) {
      console.error('Fehler beim Generieren des Plakats:', error)
      alert('Fehler beim Generieren des Plakats: ' + (error instanceof Error ? error.message : String(error)))
      return // WICHTIG: Return wenn Fehler, damit blob nicht verwendet wird
    }
    
    // Speichere auch in Dokumente-Sektion (nur wenn blob erfolgreich erstellt wurde)
    if (blob) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `pr-plakat-${event.id}-${Date.now()}`,
          name: `Plakat - ${event.title}`,
          type: 'text/html',
          size: blob!.size,
          data: reader.result as string,
          fileName: `plakat-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: event.id,
          eventTitle: event.title
        }
        const existingDocs = loadDocuments()
        const filteredDocs = existingDocs.filter((d: any) => 
          !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Plakat'))
        )
        const updated = [...filteredDocs, documentData]
        saveDocuments(updated)
      }
      reader.readAsDataURL(blob)
      
      alert('✅ Plakat generiert! Bitte im Browser drucken (A3 Format).')
    }
  }

  // Plakat generieren (mit App-Design) - Fallback
  const generatePlakat = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generatePlakatForEvent(selectedEvent || events[0])
  }

  // Pressemappe generieren
  const generatePressemappe = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pressemappe - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        background: white !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
      }
      h3 {
        color: #555 !important;
      }
      .section {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
      }
      p {
        color: #333 !important;
      }
      strong {
        color: #1a1a1a !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      font-size: 2.5rem;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    h2 {
      color: #333;
      margin-top: 35px;
      margin-bottom: 20px;
      font-size: 1.6rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 600;
    }
    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 600;
    }
    .section {
      margin: 25px 0;
      padding: 20px 25px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      border-left: 4px solid #667eea;
    }
    p {
      color: #333;
      line-height: 1.8;
      margin: 10px 0;
      font-size: 1.05rem;
    }
    strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
      margin: 8px;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <div class="container">
    <h1>PRESSEMAPPE</h1>
    <h2>${galleryData.name || 'K2 Galerie'}</h2>
    
    <div class="section">
      <h2>Galerie-Informationen</h2>
      <p><strong>Name:</strong> ${galleryData.name || 'K2 Galerie'}</p>
      ${galleryData.address ? `<p><strong>Adresse:</strong> ${galleryData.address}</p>` : ''}
      ${galleryData.phone ? `<p><strong>Telefon:</strong> ${galleryData.phone}</p>` : ''}
      ${galleryData.email ? `<p><strong>E-Mail:</strong> ${galleryData.email}</p>` : ''}
      ${galleryData.website ? `<p><strong>Website:</strong> ${galleryData.website}</p>` : ''}
      ${galleryData.openingHours ? `<p><strong>Öffnungszeiten:</strong> ${galleryData.openingHours}</p>` : ''}
    </div>
    
    <div class="section">
      <h2>Künstler</h2>
      <h3>${martinaData.name}</h3>
      <p>${martinaData.bio}</p>
      ${martinaData.email ? `<p>E-Mail: ${martinaData.email}</p>` : ''}
      ${martinaData.phone ? `<p>Telefon: ${martinaData.phone}</p>` : ''}
      
      <h3>${georgData.name}</h3>
      <p>${georgData.bio}</p>
      ${georgData.email ? `<p>E-Mail: ${georgData.email}</p>` : ''}
      ${georgData.phone ? `<p>Telefon: ${georgData.phone}</p>` : ''}
    </div>
    
    <div class="section">
      <h2>Aktuelle Events</h2>
      ${events.slice(0, 5).map(event => `
        <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; border-left: 3px solid #667eea;">
          <h3>${event.title}</h3>
          <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}` : ''}</p>
          ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>Kontakt für Presseanfragen</h2>
      <p>${galleryData.email || ''}</p>
      <p>${galleryData.phone || ''}</p>
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    alert('✅ Pressemappe generiert!')
  }

  // Website-Content generieren
  const generateWebsiteContent = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Website Content - ${event.title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
      }
      .content {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
        box-shadow: none !important;
      }
      pre {
        background: white !important;
        border: 1px solid #ddd !important;
        color: #1a1a1a !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      font-size: 2.2rem;
      margin-bottom: 30px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    .content {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      padding: 25px;
      margin: 25px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    h2 {
      color: #333;
      font-size: 1.4rem;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 600;
    }
    pre {
      background: white;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      color: #1a1a1a;
      font-family: 'Courier New', 'Monaco', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 15px 0;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      margin: 10px 10px 10px 0;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <div class="container">
    <h1>Website Content für: ${event.title}</h1>
    
    <div class="content">
      <h2>HTML Content</h2>
      <pre id="htmlContent"><section class="event-detail">
  <h2>${event.title}</h2>
  <div class="event-meta">
    <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}` : ''}</p>
    ${event.startTime ? `<p><strong>Uhrzeit:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr</p>` : ''}
    ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
  </div>
  ${event.description ? `<div class="event-description">${event.description.replace(/\n/g, '<br>')}</div>` : ''}
</section></pre>
      <button onclick="navigator.clipboard.writeText(document.getElementById('htmlContent').textContent)">📋 HTML kopieren</button>
    </div>
    
    <div class="content">
      <h2>Meta Description (SEO)</h2>
      <pre id="metaContent">${event.title} - ${new Date(event.date).toLocaleDateString('de-DE')} bei ${galleryData.name || 'K2 Galerie'}. ${event.description ? event.description.substring(0, 120) : ''}...</pre>
      <button onclick="navigator.clipboard.writeText(document.getElementById('metaContent').textContent)">📋 Meta kopieren</button>
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-website-content-${event.id}-${Date.now()}`,
        name: `Website-Content - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `website-content-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Website-Content'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Website-Content generiert!')
  }

  // Katalog generieren
  const generateKatalog = () => {
    const artworks = loadArtworks()
    if (artworks.length === 0) {
      alert('Bitte zuerst Werke hinzufügen')
      return
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Katalog - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        background: white !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
      }
      .artwork {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
        box-shadow: none !important;
        page-break-inside: avoid;
      }
      .artwork-title {
        color: #1a1a1a !important;
      }
      .artwork-info p {
        color: #333 !important;
      }
      .artwork-info strong {
        color: #1a1a1a !important;
      }
      .artwork-image {
        border-color: #ddd !important;
      }
      .footer {
        color: #666 !important;
        border-top-color: #ddd !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    h2 {
      color: #333;
      text-align: center;
      font-size: 1.6rem;
      margin-bottom: 30px;
      font-weight: 600;
    }
    .artwork {
      margin: 25px 0;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      display: flex;
      gap: 25px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .artwork-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid #ddd;
      flex-shrink: 0;
    }
    .artwork-info {
      flex: 1;
    }
    .artwork-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 15px 0;
      color: #1a1a1a;
    }
    .artwork-info p {
      color: #333;
      margin: 8px 0;
      font-size: 1.05rem;
    }
    .artwork-info strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #666;
      padding-top: 25px;
      border-top: 2px solid #ddd;
      font-size: 1rem;
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
      <button onclick="window.print()">🖨️ Als PDF speichern</button>
    </div>
    
    <h1>KATALOG</h1>
    <h2>${galleryData.name || 'K2 Galerie'}</h2>
    
    ${artworks.map((artwork: any) => `
    <div class="artwork">
      ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
      <div class="artwork-info">
        <div class="artwork-title">${artwork.title}</div>
        <p><strong>Künstler:</strong> ${artwork.artist}</p>
        <p><strong>Kategorie:</strong> ${artwork.category === 'malerei' ? 'Bilder' : 'Keramik'}</p>
        ${artwork.description ? `<p>${artwork.description}</p>` : ''}
        <p><strong>Preis:</strong> €${artwork.price?.toFixed(2) || '0.00'}</p>
        <p><strong>Nummer:</strong> ${artwork.number || artwork.id}</p>
      </div>
    </div>
  `).join('')}
    
    <div class="footer">
      <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
      ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
      ${galleryData.email ? `<p>${galleryData.email}</p>` : ''}
      ${galleryData.phone ? `<p>${galleryData.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-katalog-${Date.now()}`,
        name: `Katalog - ${galleryData.name || 'K2 Galerie'}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `katalog-${(galleryData.name || 'k2-galerie').replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente'
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.name.includes('Katalog'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Katalog generiert!')
  }

  // Dokument zu Event hinzufügen
  const handleAddEventDocument = async () => {
    if (!eventDocumentFile || !eventDocumentName || !selectedEventForDocument) {
      alert('Bitte Datei und Name auswählen')
      return
    }

    try {
      // Datei zu Data URL konvertieren
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `doc-${Date.now()}`,
          name: eventDocumentName,
          type: eventDocumentType,
          fileData: reader.result as string,
          fileName: eventDocumentFile.name,
          fileType: eventDocumentFile.type,
          addedAt: new Date().toISOString()
        }

        const updatedEvents = events.map(event => {
          if (event.id === selectedEventForDocument) {
            return {
              ...event,
              documents: [...(event.documents || []), documentData]
            }
          }
          return event
        })

        setEvents(updatedEvents)
        saveEvents(updatedEvents)
        
        // Zurücksetzen
        setShowDocumentModal(false)
        setSelectedEventForDocument(null)
        setEventDocumentFile(null)
        setEventDocumentName('')
        setEventDocumentType('flyer')
        
        alert('✅ Dokument hinzugefügt!')
      }
      reader.readAsDataURL(eventDocumentFile)
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Dokuments:', error)
      alert('Fehler beim Hinzufügen des Dokuments')
    }
  }

  // Dokument von Event löschen
  const handleDeleteEventDocument = (eventId: string, documentId: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            documents: (event.documents || []).filter((doc: any) => doc.id !== documentId)
          }
        }
        return event
      })

      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Dokument gelöscht!')
    }
  }

  // Dokument öffnen/anschauen (documentUrl = Link zum Projekt-Flyer, z. B. K2 Galerie Flyer)
  const handleViewEventDocument = (document: any) => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank')
      return
    }
    const newWindow = window.open()
    if (newWindow && document.fileData) {
      newWindow.document.write(`
        <html>
          <head><title>${document.name}</title></head>
          <body style="margin:0; padding:20px; background:#f5f5f5;">
            ${document.fileType?.includes('pdf') 
              ? `<iframe src="${document.fileData}" style="width:100%; height:100vh; border:none;"></iframe>`
              : document.fileType?.includes('image')
              ? `<img src="${document.fileData}" style="max-width:100%; height:auto;" />`
              : `<a href="${document.fileData}" download="${document.fileName}">Download: ${document.name}</a>`
            }
          </body>
        </html>
      `)
    }
  }

  // Event löschen
  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Möchtest du dieses Event wirklich löschen?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Event gelöscht!')
    }
  }

  // Eröffnungsevent 24.–26. April anlegen (wie gestern angelegt) – Dokumente danach im Event hinzufügen
  const handleCreateEröffnungsevent = () => {
    const location = [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ') || ''
    const newEvent = {
      id: `event-${Date.now()}`,
      title: 'Eröffnung der K2 Galerie',
      type: 'galerieeröffnung',
      date: '2026-04-24',
      endDate: '2026-04-26',
      startTime: '',
      endTime: '',
      dailyTimes: {} as Record<string, { start: string; end: string }>,
      description: '',
      location,
      documents: [] as any[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...events, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEvents(updated)
    saveEvents(updated)
    alert('✅ Eröffnungsevent 24.–26. April wieder angelegt!\n\nJetzt auf das Event klicken und unter „Dokumente“ deinen Flyer (PDF) hinzufügen. Danach „Veröffentlichen“, damit es überall sicher mitgeht.')
  }

  // Event-Modal öffnen
  const openEventModal = () => {
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    // Automatisch komplette Adresse aus Stammdaten übernehmen
    setEventLocation([galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ') || '')
    setEventPRSuggestions(null)
    setEditingPRType(null)
    setShowEventModal(true)
  }

  // Komplette Adresse aus Stammdaten (Straße, Ort, Land)
  const fullAddressFromStammdaten = [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ')

  // Stammdaten in Event-Felder übernehmen
  const applyStammdatenToEvent = () => {
    // Komplette Adresse aus Stammdaten übernehmen (Straße + Ort + Land)
    setEventLocation(fullAddressFromStammdaten || '')
    
    // Kontaktdaten in Beschreibung einfügen (wenn noch keine Beschreibung vorhanden)
    if (!eventDescription) {
      const kontaktInfo: string[] = []
      if (galleryData.phone) kontaktInfo.push(`Tel: ${galleryData.phone}`)
      if (galleryData.email) kontaktInfo.push(`E-Mail: ${galleryData.email}`)
      if (fullAddressFromStammdaten) kontaktInfo.push(`Adresse: ${fullAddressFromStammdaten}`)
      if (galleryData.openingHours) kontaktInfo.push(`Öffnungszeiten: ${galleryData.openingHours}`)
      
      if (kontaktInfo.length > 0) {
        setEventDescription(kontaktInfo.join('\n'))
      }
    }
    
    alert('✅ Stammdaten übernommen (komplette Adresse + ggf. Kontakt in Beschreibung)!')
  }

  // Dokumente speichern (Key abhängig von K2 vs. ök2 – K2-Daten werden in ök2 nie überschrieben)
  const saveDocuments = (docs: any[]) => {
    try {
      localStorage.setItem(getDocumentsKey(), JSON.stringify(docs))
      setDocuments(docs)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.')
    }
  }

  // Dokument hochladen
  const handleDocumentUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string
          const newDoc = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
            uploadedAt: new Date().toISOString(),
            isPDF: file.type === 'application/pdf'
          }
          const updated = [...documents, newDoc]
          saveDocuments(updated)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Dokument zu PDF konvertieren
  const convertToPDF = async (doc: any) => {
    if (doc.isPDF) {
      // Bereits PDF - direkt öffnen
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        // Fallback: Download-Link erstellen wenn Pop-up blockiert wird
        if (doc.data) {
          const link = document.createElement('a')
          link.href = doc.data
          link.download = doc.name || `document-${Date.now()}.pdf`
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
          }, 100)
          alert('✅ Dokument wurde heruntergeladen!\n\nÖffne die Datei, um sie anzuzeigen.')
        } else {
          alert('⚠️ Pop-up-Blocker verhindert PDF-Öffnung.\n\nBitte erlaube Pop-ups für diese Seite oder öffne das Dokument manuell.')
        }
        return
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${doc.data}"></iframe>
            <script>
              window.onload = () => {
                setTimeout(() => window.print(), 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Bild zu PDF konvertieren
    if (doc.type.startsWith('image/')) {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Pop-up-Blocker verhindert PDF-Erstellung.')
        return
      }

      const date = new Date(doc.uploadedAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      })

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name} - PDF</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
              }
              .header {
                margin-bottom: 20px;
                border-bottom: 2px solid #8b6914;
                padding-bottom: 10px;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                color: #8b6914;
              }
              .header p {
                margin: 5px 0 0;
                font-size: 12px;
                color: #666;
              }
              img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                font-size: 10px;
                color: #999;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>K2 GALERIE</h1>
              <p>${doc.name}</p>
              <p>Erstellt am: ${date}</p>
            </div>
            <img src="${doc.data}" alt="${doc.name}" />
            <div class="footer">
              <div>K2 Galerie - Kunst & Keramik</div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Andere Formate - versuche als HTML zu rendern
    alert(`Dateiformat "${doc.type}" kann nicht direkt zu PDF konvertiert werden. Bitte konvertiere die Datei manuell zu PDF oder verwende ein Bildformat.`)
  }

  // Dokument löschen
  const deleteDocument = (id: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updated = documents.filter(d => d.id !== id)
      saveDocuments(updated)
    }
  }

  // Laufende Nummer generieren - WICHTIG: Finde maximale Nummer aus ALLEN artworks
  // Kategorie-basiert: K für Keramik, M für Malerei
  // WICHTIG: Unterstützt auch alte Nummern ohne K/M Präfix (z.B. "K2-0001")
  const generateArtworkNumber = async (category: 'malerei' | 'keramik' = 'malerei') => {
    // Bestimme Präfix basierend auf Kategorie
    const prefix = category === 'keramik' ? 'K' : 'M'
    const categoryPrefix = `K2-${prefix}-`
    
    // Lade alle artworks (lokal)
    const localArtworks = loadArtworks()
    
    // Versuche auch gallery-data.json zu laden (für Synchronisation ohne Supabase)
    let serverArtworks: any[] = []
    try {
      const response = await fetch('/gallery-data.json?' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        serverArtworks = data.artworks || []
        console.log('📡 Server-Nummern geladen (gallery-data.json):', serverArtworks.length, 'Werke')
      }
    } catch (e) {
      console.log('⚠️ Server-Check fehlgeschlagen, verwende nur lokale Nummer')
    }
    
    // Finde maximale Nummer aus artworks der GLEICHEN Kategorie
    // WICHTIG: Unterstützt auch alte Nummern ohne Präfix
    let maxNumber = 0
    const usedNumbers = new Set<string>()
    
    // ZUERST Server-Nummern prüfen (höchste Priorität - synchronisiert über gallery-data.json)
    if (serverArtworks && Array.isArray(serverArtworks)) {
      serverArtworks.forEach((a: any) => {
        if (!a.number) return
        usedNumbers.add(a.number)
        
        if (a.number.startsWith(categoryPrefix)) {
          const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
          const num = parseInt(numStr || '0')
          if (num > maxNumber) {
            maxNumber = num
          }
        } else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-')) {
          const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
          const num = parseInt(numStr || '0')
          if (num > maxNumber) {
            maxNumber = num
          }
        }
      })
    }
    
    // DANN lokale Nummern prüfen
    localArtworks.forEach((a: any) => {
      if (!a.number) return
      usedNumbers.add(a.number)
      
      // Prüfe ob neue Nummer mit K/M Präfix
      if (a.number.startsWith(categoryPrefix)) {
        const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
        const num = parseInt(numStr || '0')
        if (num > maxNumber) {
          maxNumber = num
        }
      } 
      // Prüfe ob alte Nummer ohne Präfix (z.B. "K2-0001")
      else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-')) {
        // Alte Nummer ohne Kategorie-Präfix
        const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
        const num = parseInt(numStr || '0')
        // Nur zählen wenn Kategorie passt (für Migration)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    })
    
    // Die nächste Nummer ist maxNumber + 1
    let nextNumber = maxNumber + 1
    let formattedNumber = `${categoryPrefix}${String(nextNumber).padStart(4, '0')}`
    
    // KRITISCH: Prüfe auf Konflikte und erhöhe bis eindeutig
    // Dies verhindert doppelte Nummern bei gleichzeitiger Erstellung auf mehreren Geräten
    let attempts = 0
    while (usedNumbers.has(formattedNumber) && attempts < 100) {
      nextNumber++
      formattedNumber = `${categoryPrefix}${String(nextNumber).padStart(4, '0')}`
      attempts++
    }
    
    // Falls immer noch Konflikt: Verwende Timestamp + Device-ID für eindeutige Nummer
    if (usedNumbers.has(formattedNumber)) {
      const deviceId = localStorage.getItem('k2-device-id') || `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
      if (!localStorage.getItem('k2-device-id')) {
        localStorage.setItem('k2-device-id', deviceId)
      }
      const timestamp = Date.now().toString().slice(-6) // Letzte 6 Ziffern
      const deviceHash = deviceId.split('-').pop()?.substring(0, 2) || Math.floor(Math.random() * 100).toString().padStart(2, '0')
      formattedNumber = `${categoryPrefix}${timestamp}${deviceHash}`
      console.warn('⚠️ Konflikt erkannt - verwende eindeutige Device+Timestamp-Nummer:', formattedNumber)
    }
    
    // Speichere auch in localStorage für Rückwärtskompatibilität (kategorie-spezifisch)
    localStorage.setItem(`k2-last-artwork-number-${prefix}`, String(nextNumber))
    
    console.log('🔢 Neue Nummer generiert:', formattedNumber, '(Kategorie:', category, ', max gefunden:', maxNumber, ', Versuche:', attempts, ')')
    return formattedNumber
  }

  // Artwork-URL für QR (gleiche Basis wie Mobile Connect) – mit Stand für Cache-Busting
  const getArtworkUrlForQR = (artworkId: string): string => {
    let base = ''
    try {
      base = (typeof localStorage !== 'undefined' && localStorage.getItem('k2-mobile-url')) || ''
    } catch (_) {}
    base = (base || GALERIE_QR_BASE).replace(/\?.*$/, '').replace(/#.*$/, '')
    const url = `${base}${base.includes('?') ? '&' : '?'}werk=${encodeURIComponent(artworkId)}`
    return urlWithBuildVersion(url)
  }

  // QR als Data-URL lokal erzeugen (Standalone – funktioniert ohne Internet/WLAN)
  const getQRDataUrl = async (artworkId: string): Promise<string> => {
    const url = getArtworkUrlForQR(artworkId)
    return QRCode.toDataURL(url, { width: 200, margin: 1 })
  }

  // QR-Code URL für Etiketten-Vorschau (API – nur wo Netz; Druck nutzt getQRDataUrl)
  const getQRCodeUrl = (artworkId: string) => {
    const artworkUrl = getArtworkUrlForQR(artworkId)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(artworkUrl)}`
  }

  // QR-Code aus Bild lesen (vereinfacht - würde normalerweise eine Library verwenden)
  const readQRCodeFromImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Hier würde normalerweise eine QR-Code-Library verwendet werden
          // Für jetzt: URL aus Bild-URL extrahieren (falls QR-Code eine URL enthält)
          // Oder manuelle Eingabe verwenden
          resolve(null) // Würde QR-Code-Text zurückgeben
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Werk als verkauft markieren
  const handleMarkAsSold = (artworkNumber: string) => {
    // Hier würde normalerweise die Datenbank aktualisiert werden
    const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
    if (!soldArtworks.find((a: any) => a.number === artworkNumber)) {
      soldArtworks.push({
        number: artworkNumber,
        soldAt: new Date().toISOString()
      })
      localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
      alert(`✅ Werk ${artworkNumber} wurde als verkauft markiert!`)
    } else {
      alert(`⚠️ Werk ${artworkNumber} ist bereits als verkauft markiert.`)
    }
    
    // Modal schließen
    setShowSaleModal(false)
    setSaleInput('')
    setSaleMethod('scan')
  }


  // Datei auswählen (funktioniert für Datei-Upload und Kamera)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      // Sofort als Data URL konvertieren für Preview (nicht Blob URL!)
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setPreviewUrl(dataUrl) // Data URL statt Blob URL
      }
      reader.readAsDataURL(file)
    }
    // Reset für erneute Nutzung
    e.target.value = ''
  }

  // Kamera öffnen - auf Desktop mit MediaDevices API, auf Mobile/iPad mit capture
  const handleCameraClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prüfe ob wir auf einem mobilen Gerät oder iPad sind
    const isIPad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent) || isIPad
    
    if (isMobile || isIPad) {
      // Auf Mobile/iPad: Verwende capture Attribut
      const input = document.getElementById('camera-input-direct') as HTMLInputElement
      if (input) {
        input.value = ''
        input.click()
      }
      return
    }

    // Auf Desktop: Verwende MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Kamera wird auf diesem Browser nicht unterstützt. Bitte verwende "Datei auswählen".')
      return
    }

    try {
      // Öffne Kamera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        })
      } catch (envError) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }
      
      setCameraStream(stream)
      setShowCameraView(true)
      
      // Video-Element verbinden
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err)
          })
        }
      }, 300)
    } catch (error: any) {
      console.error('Kamera-Fehler:', error)
      let errorMessage = 'Kamera konnte nicht geöffnet werden.'
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Keine Kamera gefunden.'
      }
      alert(errorMessage)
    }
  }

  // Kamera schließen
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCameraView(false)
  }

  // Foto aufnehmen
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // Canvas zu Blob konvertieren
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' })
            setSelectedFile(file)
            
            // Preview erstellen
            const reader = new FileReader()
            reader.onloadend = () => {
              setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            
            // Kamera schließen
            closeCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])



  // Bild komprimieren - AGRESSIV komprimiert für viele Bilder (wenig Speicher)
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Für mobile: kleinere Größe (800px statt 1200px)
          // Größe reduzieren falls zu groß
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context nicht verfügbar'))
            return
          }
          
          // Bild zeichnen
          ctx.drawImage(img, 0, 0, width, height)
          
          // Für mobile: niedrigere Qualität (0.65 statt 0.8) = weniger Speicher
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Werk speichern
  const handleSaveArtwork = async () => {
    // Bei Bearbeitung: Bild ist optional (wird beibehalten wenn kein neues ausgewählt)
    if (!editingArtwork && !selectedFile) {
      alert('Bitte ein Bild auswählen')
      return
    }
    
    // Bei Keramik: Titel automatisch aus Unterkategorie setzen
    if (artworkCategory === 'keramik') {
      const subcategoryLabels: Record<string, string> = {
        'vase': 'Gefäße - Vasen',
        'teller': 'Schalen - Teller',
        'skulptur': 'Skulptur',
        'sonstig': 'Sonstig'
      }
      setArtworkTitle(subcategoryLabels[artworkCeramicSubcategory] || 'Keramik')
    }
    
    // Validierung: Titel nur bei Malerei erforderlich
    if (artworkCategory === 'malerei' && !artworkTitle) {
      alert('Bitte einen Titel eingeben')
      return
    }
    
    if (!artworkPrice || parseFloat(artworkPrice) <= 0) {
      alert('Bitte einen gültigen Preis eingeben')
      return
    }
    
    // Validierung für Keramik-Unterkategorien
    if (artworkCategory === 'keramik') {
      if (artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') {
        const height = parseFloat(artworkCeramicHeight)
        if (!artworkCeramicHeight || height < 10 || height % 5 !== 0) {
          alert('Bitte die Höhe in cm eingeben (mindestens 10cm, nur 5cm Schritte: 10, 15, 20, 25, ...)')
          return
        }
      }
      if (artworkCeramicSubcategory === 'teller') {
        const diameter = parseFloat(artworkCeramicDiameter)
        if (!artworkCeramicDiameter || diameter < 10 || diameter % 5 !== 0) {
          alert('Bitte den Durchmesser in cm eingeben (mindestens 10cm, nur 5cm Schritte: 10, 15, 20, 25, ...)')
          return
        }
      }
      if (artworkCeramicSubcategory === 'sonstig') {
        if (!artworkCeramicDescription || artworkCeramicDescription.trim() === '') {
          alert('Bitte eine Beschreibung eingeben')
          return
        }
      }
    }
    
    // Laufende Nummer generieren (nur bei neuem Werk)
    // WICHTIG: Übergebe Kategorie für korrekte Nummerierung (K/M)
    const newArtworkNumber = editingArtwork ? (editingArtwork.number || editingArtwork.id) : await generateArtworkNumber(artworkCategory)
    setArtworkNumber(newArtworkNumber)
    
    // Bild komprimieren bevor es gespeichert wird - optimiert für mobile (wenig Speicher)
    try {
      let imageDataUrl: string
      
      if (selectedFile) {
        // Neues Bild wurde ausgewählt - komprimieren
        // Für mobile: kleinere Größe (800px) und niedrigere Qualität (0.65)
        const compressedDataUrl = await compressImage(selectedFile, 800, 0.65)
        
        // Prüfe ob Data URL zu groß ist (localStorage Limit ~5-10MB)
        // Für mobile: strengeres Limit (1.5MB statt 2MB)
        if (compressedDataUrl.length > 1500000) {
          // Versuche noch stärkere Kompression
          const moreCompressed = await compressImage(selectedFile, 600, 0.5)
          if (moreCompressed.length > 1500000) {
            alert('Bild ist auch nach Kompression zu groß. Bitte verwende ein kleineres Bild (max. ~1.5MB nach Kompression).')
            return
          }
          imageDataUrl = moreCompressed
        } else {
          imageDataUrl = compressedDataUrl
        }
        // Option im Admin: Foto freistellen (Pro-Hintergrund) oder Original unverändert
        if (photoUseFreistellen) {
          try {
            const { compositeOnProfessionalBackground } = await import('../src/utils/professionalImageBackground')
            imageDataUrl = await compositeOnProfessionalBackground(imageDataUrl, photoBackgroundPreset)
          } catch (err) {
            console.warn('Freistellung fehlgeschlagen, verwende Original:', err)
            // imageDataUrl bleibt komprimiertes Original
          }
        }
      } else if (editingArtwork && editingArtwork.imageUrl) {
        // Bei Bearbeitung ohne neues Bild: Altes Bild beibehalten
        imageDataUrl = editingArtwork.imageUrl
      } else {
        alert('Bitte ein Bild auswählen')
        return
      }
      
      await saveArtworkData(imageDataUrl, newArtworkNumber)
    } catch (error) {
      console.error('Fehler beim Komprimieren:', error)
      alert('Fehler beim Verarbeiten des Bildes. Bitte versuche es erneut.')
    }
  }

  // Werk-Daten speichern
  const saveArtworkData = async (imageDataUrl: string, newArtworkNumber: string) => {
      
    // Titel bestimmen: Bei Keramik aus Unterkategorie, sonst aus Eingabe
    let finalTitle = artworkTitle
    if (artworkCategory === 'keramik') {
      const subcategoryLabels: Record<string, string> = {
        'vase': 'Gefäße - Vasen',
        'teller': 'Schalen - Teller',
        'skulptur': 'Skulptur',
        'sonstig': 'Sonstig'
      }
      finalTitle = subcategoryLabels[artworkCeramicSubcategory] || 'Keramik'
    }
    
    // Prüfe ob Nummer bereits existiert (Konflikt-Erkennung)
    const existingArtworks = loadArtworks()
    const existingWithSameNumber = existingArtworks.find((a: any) => a.number === newArtworkNumber && (!editingArtwork || (a.id !== editingArtwork.id && a.number !== editingArtwork.number)))
    
    // Falls Konflikt: Generiere neue eindeutige Nummer
    let finalArtworkNumber = newArtworkNumber
    if (existingWithSameNumber && !editingArtwork) {
      console.warn('⚠️ Nummer bereits vorhanden:', newArtworkNumber, '- generiere neue Nummer')
      finalArtworkNumber = await generateArtworkNumber(artworkCategory)
    }
    
    // Werk-Daten speichern
    const artworkData: any = {
      id: finalArtworkNumber,
      number: finalArtworkNumber,
      title: finalTitle,
      category: artworkCategory,
      artist: artworkArtist,
      description: artworkDescription,
      price: parseFloat(artworkPrice),
      inExhibition: isInExhibition,
      inShop: isInShop,
      imageUrl: imageDataUrl, // Komprimierte Data URL
      createdAt: new Date().toISOString(),
      addedToGalleryAt: new Date().toISOString(), // Zeitstempel: wann in Galerie aufgenommen
      // Markiere als Mobile-Werk für bessere Synchronisation
      createdOnMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      deviceId: localStorage.getItem('k2-device-id') || `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }
    
    // Erstelle/Setze Device-ID falls nicht vorhanden
    if (!localStorage.getItem('k2-device-id')) {
      const deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
      localStorage.setItem('k2-device-id', deviceId)
      artworkData.deviceId = deviceId
    }
    
    // Malerei-spezifische Daten hinzufügen
    if (artworkCategory === 'malerei') {
      if (artworkPaintingWidth) {
        artworkData.paintingWidth = parseFloat(artworkPaintingWidth)
      }
      if (artworkPaintingHeight) {
        artworkData.paintingHeight = parseFloat(artworkPaintingHeight)
      }
    }
    
    // Keramik-spezifische Daten hinzufügen
    if (artworkCategory === 'keramik') {
      artworkData.ceramicSubcategory = artworkCeramicSubcategory
      artworkData.ceramicType = artworkCeramicType
      artworkData.ceramicSurface = artworkCeramicSurface
      if (artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') {
        artworkData.ceramicHeight = artworkCeramicHeight ? parseFloat(artworkCeramicHeight) : undefined
      }
      if (artworkCeramicSubcategory === 'teller') {
        artworkData.ceramicDiameter = artworkCeramicDiameter ? parseFloat(artworkCeramicDiameter) : undefined
      }
      if (artworkCeramicSubcategory === 'sonstig') {
        artworkData.ceramicDescription = artworkCeramicDescription || undefined
      }
    }
    
    // Werk in localStorage speichern
    const artworks = loadArtworks()
    
    // KRITISCH: Prüfe auf doppelte Nummern und behebe Konflikte
    const duplicateNumbers = new Map<string, any[]>()
    artworks.forEach((a: any) => {
      if (a.number) {
        if (!duplicateNumbers.has(a.number)) {
          duplicateNumbers.set(a.number, [])
        }
        duplicateNumbers.get(a.number)!.push(a)
      }
    })
    
    // Behebe Konflikte: Behalte das neueste Werk, benenne andere um
    duplicateNumbers.forEach((duplicates, number) => {
      if (duplicates.length > 1) {
        console.warn(`⚠️ Doppelte Nummer gefunden: ${number} (${duplicates.length} Werke)`)
        // Sortiere nach createdAt (neuestes zuerst)
        duplicates.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        
        // Behalte das erste (neueste), benenne andere um
        for (let i = 1; i < duplicates.length; i++) {
          const duplicate = duplicates[i]
          const newNumber = `${number}-${i}`
          console.log(`🔄 Umbenennen: ${number} → ${newNumber}`)
          
          // Finde und aktualisiere im artworks Array
          const index = artworks.findIndex((a: any) => 
            a.id === duplicate.id || (a.number === duplicate.number && a.createdAt === duplicate.createdAt)
          )
          if (index !== -1) {
            artworks[index].number = newNumber
            artworks[index].id = newNumber
            if (artworks[index].number === finalArtworkNumber && !editingArtwork) {
              // Falls das aktuelle Werk betroffen ist, aktualisiere auch artworkData
              finalArtworkNumber = newNumber
              artworkData.number = newNumber
              artworkData.id = newNumber
            }
          }
        }
      }
    })
    
    if (editingArtwork) {
      // Bestehendes Werk aktualisieren
      const index = artworks.findIndex((a: any) => 
        (a.id === editingArtwork.id || a.number === editingArtwork.number) ||
        (a.id === editingArtwork.id && a.number === editingArtwork.number)
      )
      if (index !== -1) {
        // Behalte createdAt und addedToGalleryAt wenn vorhanden
        artworkData.createdAt = artworks[index].createdAt || new Date().toISOString()
        artworkData.addedToGalleryAt = artworks[index].addedToGalleryAt || artworks[index].createdAt || artworkData.createdAt
        artworkData.updatedOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        artworks[index] = artworkData
      } else {
        // Falls nicht gefunden, als neues Werk hinzufügen
        artworks.push(artworkData)
      }
    } else {
      // Neues Werk hinzufügen - prüfe nochmal ob Nummer eindeutig ist
      const existing = artworks.find((a: any) => a.number === finalArtworkNumber)
      if (existing) {
        // Falls immer noch Konflikt: Verwende Timestamp-basierte Nummer
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
        const prefix = artworkCategory === 'keramik' ? 'K' : 'M'
        finalArtworkNumber = `K2-${prefix}-${timestamp}${random}`
        artworkData.number = finalArtworkNumber
        artworkData.id = finalArtworkNumber
        console.warn('⚠️ Letzter Konflikt-Fallback - neue Nummer:', finalArtworkNumber)
      }
      artworks.push(artworkData)
    }
    
    // KRITISCH: Wenn Mobile-Werk gespeichert wird, automatisch Event auslösen für Synchronisation
    if (artworkData.createdOnMobile || artworkData.updatedOnMobile) {
      console.log(`📱 Mobile-Werk gespeichert: ${artworkData.number || artworkData.id} - Event für Synchronisation ausgelöst`)
      // Event auslösen damit andere Geräte das neue Werk erkennen können
      window.dispatchEvent(new CustomEvent('mobile-artwork-saved', { 
        detail: { artwork: artworkData } 
      }))
    }
    
    try {
      const dataToStore = JSON.stringify(artworks)
      
      // Prüfe localStorage-Größe und führe automatisches Cleanup durch
      const currentSize = new Blob([dataToStore]).size
      const maxSize = 3.5 * 1024 * 1024 // 3.5MB Limit (unter 5MB Browser-Limit)
      
      if (currentSize > maxSize) {
        // Automatisches Cleanup: Entferne große Bilder und alte Werke
        console.log(`⚠️ Daten zu groß (${(currentSize / 1024 / 1024).toFixed(2)}MB) - führe Cleanup durch...`)
        
        // 1. Komprimiere große Bilder (entferne sehr große Bilder >500KB)
        const cleanedArtworks = artworks.map((artwork: any) => {
          if (artwork.imageUrl && artwork.imageUrl.length > 500000) { // Über 500KB
            console.log(`🗜️ Entferne sehr großes Bild von Werk ${artwork.number || artwork.id} (${(artwork.imageUrl.length / 1024).toFixed(0)}KB)`)
            return { ...artwork, imageUrl: '' }
          }
          return artwork
        })
        
        // 2. Sortiere nach Datum (neueste zuerst)
        const sortedArtworks = cleanedArtworks.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        
        // 3. Behalte nur die 20 neuesten Werke
        let keptArtworks = sortedArtworks.slice(0, 20)
        let keptData = JSON.stringify(keptArtworks)
        let keptSize = new Blob([keptData]).size
        
        // 4. Falls immer noch zu groß: Entferne mehr alte Werke
        if (keptSize > maxSize) {
          keptArtworks = sortedArtworks.slice(0, 15)
          keptData = JSON.stringify(keptArtworks)
          keptSize = new Blob([keptData]).size
          
          if (keptSize > maxSize) {
            // Letzter Versuch: Nur 10 neueste Werke
            keptArtworks = sortedArtworks.slice(0, 10)
            keptData = JSON.stringify(keptArtworks)
            keptSize = new Blob([keptData]).size
            
            if (keptSize > maxSize) {
              alert(`⚠️ localStorage ist voll (${(currentSize / 1024 / 1024).toFixed(2)}MB)!\n\nBitte lösche einige alte Werke manuell oder verwende kleinere Bilder.\n\nAutomatisches Cleanup konnte nicht genug Platz schaffen.`)
              return
            }
          }
        }
        
        const saved = saveArtworks(keptArtworks)
        if (!saved) {
          console.error('❌ Speichern fehlgeschlagen!')
          alert('⚠️ Fehler beim Speichern! Bitte versuche es erneut.')
          return
        }
        
        const removedCount = artworks.length - keptArtworks.length
        if (removedCount > 0) {
          alert(`⚠️ localStorage war zu voll!\n\nDie ältesten ${removedCount} Werke wurden automatisch gelöscht.\n\nBitte verwende kleinere Bilder um Platz zu sparen.`)
        }
      } else {
        const saved = saveArtworks(artworks)
        if (!saved) {
          console.error('❌ Speichern fehlgeschlagen!')
          alert('⚠️ Fehler beim Speichern! Bitte versuche es erneut.')
          return
        }
      }
      
      console.log('✅ Werk gespeichert:', {
        number: artworkData.number,
        title: artworkData.title,
        imageUrlLength: artworkData.imageUrl?.length || 0,
        compressed: true,
        totalArtworks: artworks.length
      })
      
      // KRITISCH: Prüfe ob Werk wirklich gespeichert wurde
      const verifyStored = loadArtworks()
      const isStored = verifyStored.some((a: any) => 
        (a.number && artworkData.number && a.number === artworkData.number) ||
        (a.id && artworkData.id && a.id === artworkData.id)
      )
      
      if (!isStored) {
        console.error('❌ KRITISCH: Werk wurde NICHT gespeichert!', {
          gesucht: artworkData.number || artworkData.id,
          gespeichert: verifyStored.map((a: any) => a.number || a.id),
          anzahl: verifyStored.length
        })
        alert(`⚠️ Fehler: Werk konnte nicht gespeichert werden!\n\nNummer: ${artworkData.number}\nGespeicherte Werke: ${verifyStored.length}\n\nBitte versuche es erneut.`)
        return
      }
      
      console.log('✅ Werk-Verifikation erfolgreich:', {
        nummer: artworkData.number,
        titel: artworkData.title,
        gesamtAnzahl: verifyStored.length,
        alleNummern: verifyStored.map((a: any) => a.number || a.id)
      })
      
      // KRITISCH: Markiere Nummer als verwendet für bessere Synchronisation
      // Speichere Nummer in separatem Index für schnelle Prüfung
      try {
        const numberIndex = JSON.parse(localStorage.getItem('k2-number-index') || '[]')
        if (!numberIndex.includes(artworkData.number)) {
          numberIndex.push(artworkData.number)
          localStorage.setItem('k2-number-index', JSON.stringify(numberIndex))
          console.log('✅ Nummer im Index gespeichert:', artworkData.number)
        }
      } catch (e) {
        console.warn('⚠️ Nummer-Index fehlgeschlagen:', e)
      }
      
      // Optional: Versuche Supabase-Sync (falls konfiguriert)
      try {
        const { isSupabaseConfigured, saveArtworkToSupabase, autoSyncMobileToSupabase } = await import('../src/utils/supabaseClient')
        if (isSupabaseConfigured()) {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
          
          if (isMobile) {
            await autoSyncMobileToSupabase()
            console.log('✅ Mobile-Sync erfolgreich - Nummer synchronisiert:', artworkData.number)
          } else {
            await saveArtworkToSupabase(artworkData)
            console.log('✅ Desktop-Sync erfolgreich - Nummer synchronisiert:', artworkData.number)
          }
        }
      } catch (syncError) {
        // Nicht kritisch - Supabase ist optional
        console.log('ℹ️ Supabase nicht konfiguriert oder Sync fehlgeschlagen (optional)')
      }
      
      // KRITISCH: Aktualisiere lokale Liste SOFORT
      const reloaded = loadArtworks()
      console.log('📦 Reloaded artworks:', reloaded.length, 'Nummern:', reloaded.map((a: any) => a.number || a.id))
      
      // Prüfe ob das neue Werk wirklich drin ist
      const containsNewArtwork = reloaded.some((a: any) => 
        (a.number && artworkData.number && a.number === artworkData.number) ||
        (a.id && artworkData.id && a.id === artworkData.id)
      )
      
      if (!containsNewArtwork) {
        console.error('❌ KRITISCH: Neues Werk nicht in reloaded gefunden!')
        alert(`⚠️ Fehler: Werk wurde gespeichert, aber nicht in Liste gefunden!\n\nNummer: ${artworkData.number}\n\nBitte Seite neu laden.`)
        return
      }
      
      console.log('✅ Neues Werk in reloaded gefunden:', artworkData.number)
      
      // KRITISCH: Setze Filter auf 'alle' damit das neue Werk sichtbar ist
      // Oder setze Filter auf die Kategorie des neuen Werks
      if (categoryFilter !== 'alle' && categoryFilter !== artworkData.category) {
        console.log('🔄 Setze Filter auf Kategorie des neuen Werks:', artworkData.category)
        setCategoryFilter(artworkData.category)
      }
      
      // Lösche Such-Query falls vorhanden
      if (searchQuery) {
        setSearchQuery('')
      }
      
      setAllArtworks(reloaded)
      
      // WICHTIG: Kurze Verzögerung damit React State aktualisiert wird
      setTimeout(() => {
        const afterUpdate = loadArtworks()
        const filteredAfterUpdate = afterUpdate.filter((a: any) => {
          if (!a) return false
          if (categoryFilter !== 'alle' && a.category !== categoryFilter) return false
          return true
        })
        console.log('📊 Nach State-Update:', {
          allArtworksState: allArtworks.length,
          localStorage: afterUpdate.length,
          gefiltert: filteredAfterUpdate.length,
          enthaeltNeuesWerk: afterUpdate.some((a: any) => (a.number || a.id) === (artworkData.number || artworkData.id)),
          filter: categoryFilter
        })
      }, 100)
      
      // Gespeichertes Werk für Druck-Modal ZUERST setzen
      setSavedArtwork({
        ...artworkData,
        file: selectedFile // Für QR-Code-Generierung behalten
      })
      
      // Modal schließen und zurücksetzen
      setShowAddModal(false)
      setEditingArtwork(null)
      setSelectedFile(null)
      setPreviewUrl(null)
      setArtworkTitle('')
      setArtworkCategory('malerei')
      setArtworkCeramicSubcategory('vase')
      setArtworkCeramicHeight('')
      setArtworkCeramicDiameter('')
      setArtworkCeramicDescription('')
      setArtworkPaintingWidth('')
      setArtworkPaintingHeight('')
      setArtworkArtist('')
      setArtworkDescription('')
      setArtworkPrice('')
      setIsInShop(true)
      
      // Event dispatchen, damit Galerie-Seite sich aktualisiert
      window.dispatchEvent(new CustomEvent('artworks-updated', { 
        detail: { count: reloaded.length, newArtwork: artworkData.number } 
      }))
      
      // WICHTIG: Dispatch Event für automatisches Veröffentlichen
      // DevViewPage hört auf dieses Event und ruft publishMobile() auf
      window.dispatchEvent(new CustomEvent('artwork-saved-needs-publish', { 
        detail: { artworkCount: reloaded.length } 
      }))
      
      // NICHT nochmal setAllArtworks aufrufen - wurde bereits oben gemacht!
      // Die Liste wurde bereits mit reloaded aktualisiert
      
      // Etikett-Druck-Modal immer anbieten (bei neuem Werk und bei Bearbeitung)
      setTimeout(() => {
        setShowPrintModal(true)
      }, 200)
      if (editingArtwork) {
        console.log('✅ Werk aktualisiert – Etikett kann erneut gedruckt werden')
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      if (error instanceof Error && error.message.includes('QuotaExceededError')) {
        alert('localStorage ist voll! Bitte lösche einige alte Werke oder verwende kleinere Bilder.')
      } else {
        alert('Fehler beim Speichern. Bitte versuche es erneut.')
      }
    }
  }

  // One-Click: Etikett direkt an Print-Server senden (kein Druckdialog)
  const handleOneClickPrint = async () => {
    if (!savedArtwork) return
    const tenant = getCurrentTenantId()
    const settings = loadPrinterSettingsForTenant(tenant)
    const url = (settings.printServerUrl || '').trim().replace(/\/$/, '').replace(/\/print\/?$/i, '')
    if (!url) {
      alert('Print-Server URL fehlt. Einstellungen → Drucker → Print-Server URL eintragen (z.B. http://localhost:3847)')
      return
    }
    // Von Vercel (HTTPS) aus: Browser blockiert Anfragen an http:// (Mixed Content). Print-Server muss dann per HTTPS erreichbar sein (z. B. ngrok), oder K2 wird vor Ort per http:// geöffnet.
    setOneClickPrinting(true)
    const timeoutMs = 20000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout – Server antwortet nicht. One-Click-Anwendung im Projektordner starten?')), timeoutMs)
    )
    try {
      const lm = parseLabelSize(settings.labelSize)
      const blob = await Promise.race([getEtikettBlob(lm.width, lm.height), timeoutPromise])
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => {
          const data = (r.result as string) || ''
          const m = data.match(/^data:[^;]+;base64,(.+)$/)
          resolve(m ? m[1]! : data)
        }
        r.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'))
        r.readAsDataURL(blob)
      })
      const res = await Promise.race([
        fetch(`${url}/print`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            printerIP: settings.ipAddress || '192.168.1.102',
            widthMm: lm.width,
            heightMm: lm.height
          })
        }),
        timeoutPromise
      ])
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Fehler ${res.status}`)
      setShowPrintModal(false)
      alert('✅ Etikett gesendet – Brother druckt.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'One-Click-Druck fehlgeschlagen'
      const isIpadOrPhone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isNetworkError = /fetch|network|Failed to fetch/i.test(String(msg))
      const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
      const isHttpUrl = url.toLowerCase().startsWith('http://')
      let urlHint = ''
      if (isHttps && isHttpUrl && isNetworkError) {
        urlHint = '\n\n📌 Standalone (ohne Mac vor Ort): Von Vercel aus blockiert der Browser Anrufe an http://. Print-Server muss per HTTPS erreichbar sein (z.B. ngrok am Gerät vor Ort). Oder: K2 vor Ort per http:// öffnen (siehe DRUCKER-STANDALONE.md).'
      } else if (isIpadOrPhone) {
        urlHint = '\n\n📱 Auf iPad/Handy: Print-Server URL = IP des Geräts, das den Print-Server läuft (z.B. http://192.168.1.1:3847), alle im gleichen WLAN.'
      } else if (isNetworkError) {
        urlHint = '\n\n💡 Print-Server läuft auf dem Gerät vor Ort? Dort: npm run print-server'
      }
      alert('❌ One-Click-Druck fehlgeschlagen: ' + msg + '\n\nVersucht: ' + url + '/print' + urlHint + '\n\nOne-Click-Anwendung starten (auf dem Gerät, das am gleichen Netz wie Drucker/Tablet ist):\n  npm run print-server\n  oder\n  node scripts/k2-print-server.js')
    } finally {
      setOneClickPrinting(false)
    }
  }

  // Drucken: Fenster SOFORT öffnen (vor await) – sonst blockiert Pop-up-Blocker
  const handlePrint = async () => {
    if (!savedArtwork) return
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) {
      alert('Pop-up blockiert. Bitte erlaube Fenster für diese Seite (Adresszeile/Safari) und versuche erneut.')
      return
    }
    win.document.write('<html><body style="margin:0;padding:2rem;font-family:system-ui;text-align:center;">Etikett wird erstellt …</body></html>')
    try {
      const activeTenant = getCurrentTenantId()
      const settings = loadPrinterSettingsForTenant(activeTenant)
      const lm = parseLabelSize(settings.labelSize)
      const blob = await getEtikettBlob(lm.width, lm.height)
      const url = URL.createObjectURL(blob)
      const w = lm.width
      const h = lm.height
      // Pixelmaße = Etikett in mm bei 300 DPI, damit Druck-Engine die Größe nicht falsch interpretiert
      const pw = Math.round(w * (300 / 25.4))
      const ph = Math.round(h * (300 / 25.4))
      win.document.write(`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etikett ${w}×${h}mm</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${w}mm ${h}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; width: ${w}mm; height: ${h}mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.etikett-wrap { width: ${w}mm; height: ${h}mm; display: block; overflow: hidden; }
.etikett-wrap img { width: 100%; height: 100%; display: block; object-fit: contain; object-position: center; }
</style></head>
<body><div class="etikett-wrap"><img src="${url}" alt="Etikett" width="${pw}" height="${ph}"></div></body></html>`)
      win.document.close()
      const doPrint = () => {
        win.print()
        win.addEventListener('afterprint', () => {
          win.close()
          URL.revokeObjectURL(url)
        }, { once: true })
      }
      const img = win.document.querySelector('img')
      if (img?.complete) {
        setTimeout(doPrint, 100)
      } else {
        img?.addEventListener('load', () => setTimeout(doPrint, 100), { once: true })
        img?.addEventListener('error', () => { win.close(); URL.revokeObjectURL(url) }, { once: true })
      }
    } catch (e) {
      win.close()
      console.error('Etikett für Druck fehlgeschlagen:', e)
      alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden. Bitte erneut versuchen.')
    }
  }

  // Mobil: Etikett als Bild erzeugen und Teilen-Menü öffnen (ein Tipp → Drucker/Brother-App wählen)
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window)

  const closeShareFallbackOverlay = () => {
    if (shareFallbackImageUrl) URL.revokeObjectURL(shareFallbackImageUrl)
    setShareFallbackImageUrl(null)
    shareFallbackBlobRef.current = null
    setShowShareFallbackOverlay(false)
  }

  const canUseShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleDownloadEtikettFromOverlay = () => {
    const blob = shareFallbackBlobRef.current
    if (!blob || !savedArtwork) return
    const name = `etikett-${savedArtwork.number}.png`.replace(/[^a-zA-Z0-9._-]/g, '_')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareFromFallbackOverlay = async () => {
    const blob = shareFallbackBlobRef.current
    if (!blob || !savedArtwork) {
      alert('Etikett-Bild nicht mehr verfügbar. Bitte erneut „Etikett teilen“ im Druck-Modal tippen.')
      return
    }
    if (!canUseShare) {
      handleDownloadEtikettFromOverlay()
      return
    }
    const file = new File([blob], `etikett-${savedArtwork.number}.png`, { type: 'image/png' })
    try {
      await navigator.share({ title: `Etikett ${savedArtwork.number}`, files: [file] })
      closeShareFallbackOverlay()
    } catch (e) {
      const err = e as Error
      if (err?.name === 'AbortError') return
      const msg = err?.message || ''
      alert('Teilen fehlgeschlagen' + (msg ? ': ' + msg : '') + '.\n\nNutze „Etikett herunterladen“ und öffne die Datei in Brother iPrint & Label.')
    }
  }

  /** Erzeugt Etikett als PNG-Bild in exakter Etikettengröße (widthMm x heightMm). Brother 300 DPI = 300/25.4 px/mm. */
  const getEtikettBlob = (widthMm = 29, heightMm = 90.3): Promise<Blob> => {
    if (!savedArtwork) return Promise.reject(new Error('Kein Werk'))
    const pxPerMm = 300 / 25.4  /* Brother QL-820: 300 DPI */
    const w = Math.round(widthMm * pxPerMm)
    const h = Math.round(heightMm * pxPerMm)
    return getQRDataUrl(savedArtwork.number).then((qrDataUrl) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return Promise.reject(new Error('Canvas fehlgeschlagen'))
      const pad = Math.max(2, w * 0.03)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#8b6914'
      ctx.lineWidth = Math.max(1, w * 0.007)
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2)
      ctx.fillStyle = '#8b6914'
      ctx.textAlign = 'center'
      const fs1 = Math.max(8, w * 0.12)
      const fs2 = Math.max(10, w * 0.16)
      const fs3 = Math.max(6, w * 0.1)
      const fs4 = Math.max(5, w * 0.09)
      ctx.font = `bold ${fs1}px Arial,sans-serif`
      ctx.fillText('K2 Galerie', w / 2, h * 0.08)
      ctx.font = `bold ${fs2}px Arial,sans-serif`
      ctx.fillText(savedArtwork.number, w / 2, h * 0.15)
      ctx.fillStyle = '#666'
      ctx.font = `${fs3}px Arial,sans-serif`
      const title = ((savedArtwork.title || '').substring(0, 18)) + ((savedArtwork.title || '').length > 18 ? '…' : '')
      ctx.fillText(title, w / 2, h * 0.21)
      if (savedArtwork.category === 'malerei' && savedArtwork.paintingWidth && savedArtwork.paintingHeight) {
        ctx.font = `${fs4}px Arial,sans-serif`
        ctx.fillText(`${savedArtwork.paintingWidth} × ${savedArtwork.paintingHeight} cm`, w / 2, h * 0.26)
      }
      const qrSize = Math.min(w * 0.75, h * 0.25)
      const qrX = (w - qrSize) / 2
      const qrY = h * 0.55
      return new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
          ctx.fillStyle = '#999'
          ctx.font = `${fs4}px Arial,sans-serif`
          const footer = `${savedArtwork.category === 'malerei' ? 'Bilder' : 'Keramik'} • ${(savedArtwork.artist || '').substring(0, 15)}`
          ctx.fillText(footer, w / 2, h - pad - fs4)
          canvas.toBlob((b) => {
            if (!b) { reject(new Error('Blob fehlgeschlagen')); return }
            b.arrayBuffer().then((ab) => {
              try {
                const withDpi = writePngDpi(ab, 300)
                const slice = withDpi.buffer.slice(withDpi.byteOffset, withDpi.byteOffset + withDpi.byteLength)
                resolve(new Blob([slice as ArrayBuffer], { type: 'image/png' }))
              } catch {
                resolve(b)
              }
            }).catch(() => resolve(b))
          }, 'image/png', 0.95)
        }
        img.onerror = () => reject(new Error('QR-Bild konnte nicht geladen werden.'))
        img.src = qrDataUrl
      })
    })
  }

  /** Ein Tipp → auf Mobil: Teilen-Sheet (Speichern / iPrint&Label), sonst Download. */
  const handleDownloadEtikettDirect = async () => {
    if (!savedArtwork) return
    try {
      const blob = await getEtikettBlob()
      const name = `etikett-${String(savedArtwork.number).replace(/[^a-zA-Z0-9._-]/g, '_')}.png`
      const file = new File([blob], name, { type: 'image/png' })

      if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: `Etikett ${savedArtwork.number}`,
            text: `${savedArtwork.title || ''} – K2 Galerie`,
            files: [file]
          })
          setShowPrintModal(false)
        } catch (shareErr: unknown) {
          const err = shareErr as Error
          if (err?.name === 'AbortError') return
          const msg = err?.message || ''
          if (/freigegeben|cannot be shared|Share canceled/i.test(msg)) {
            alert('Teilen wurde abgebrochen oder ist hier nicht möglich.\n\nVersuche: „Etikett in neuem Tab öffnen“ (unten) → im Tab langes Drücken auf das Bild → „Bild speichern“ oder „In Fotos speichern“. Dann in Brother iPrint & Label öffnen.')
          } else {
            alert('Teilen fehlgeschlagen: ' + (msg || 'Unbekannter Fehler') + '.\n\nNutze „Etikett in neuem Tab öffnen“ (unten), dann Bild speichern und in iPrint & Label öffnen.')
          }
        }
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowPrintModal(false)
    } catch (e) {
      alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden. Bitte erneut versuchen.')
    }
  }

  const handleShareLabel = async () => {
    if (!savedArtwork) return
    try {
      const blob = await getEtikettBlob()
      const file = new File([blob], `etikett-${savedArtwork.number}.png`, { type: 'image/png' })
      if (isMobile) {
        shareFallbackBlobRef.current = blob
        setShareFallbackImageUrl(URL.createObjectURL(blob))
        setShowShareFallbackOverlay(true)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `Etikett ${savedArtwork.number}`, text: `${savedArtwork.title || ''} – K2 Galerie`, files: [file] })
      } else {
        const blobUrl = URL.createObjectURL(blob)
        const w = window.open(blobUrl, '_blank')
        if (w) w.document.title = `Etikett ${savedArtwork.number}`
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
      }
    } catch (e) {
      if ((e as Error)?.message?.includes('QR')) alert('QR konnte nicht erzeugt werden. Bitte erneut versuchen.')
      else alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden.')
    }
  }

  // PDF für QR-Code Plakat erstellen (lokal generiert – keine externe API)
  const printQRCodePlakat = async () => {
    const homepageUrl = `${window.location.origin}/projects/k2-galerie/galerie`
    const rundgangUrl = `${window.location.origin}/projects/k2-galerie/virtueller-rundgang`
    const [homepageQRUrl, rundgangQRUrl] = await Promise.all([
      QRCode.toDataURL(homepageUrl, { width: 300, margin: 1 }),
      QRCode.toDataURL(rundgangUrl, { width: 300, margin: 1 })
    ])

    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-Codes - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #1f1f1f !important;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            @media screen {
              body {
                padding: 20px;
                background: #f5f5f5 !important;
              }
            }
            .plakat {
              width: 210mm;
              min-height: 297mm;
              background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%) !important;
              padding: 20mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              position: relative;
              color: #ffffff !important;
            }
            .content {
              position: relative;
              z-index: 1;
              width: 100%;
            }
            .icon {
              font-size: 60px;
              margin-bottom: 20px;
              opacity: 0.8;
            }
            h1 {
              font-size: 48px;
              font-weight: 700;
              margin: 0 0 15px;
              background: linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.02em;
              line-height: 1.2;
            }
            h2 {
              font-size: 28px;
              font-weight: 600;
              margin: 0 0 10px;
              color: #ffffff;
              letter-spacing: -0.01em;
            }
            .subtitle {
              font-size: 18px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 35px;
              font-weight: 300;
              line-height: 1.5;
            }
            .text-block {
              font-size: 15px;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.7;
              margin-bottom: 30px;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
              text-align: center;
            }
            .text-block strong {
              color: #ffffff;
              font-weight: 600;
            }
            .highlight-box {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 25px;
              margin: 35px 0;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }
            .highlight-box p {
              margin: 0;
              font-size: 16px;
              color: #ffffff;
              font-weight: 500;
              line-height: 1.8;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin: 40px 0;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
            }
            .qr-container {
              background: rgba(255, 255, 255, 0.95);
              padding: 20px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .qr-code {
              width: 100%;
              max-width: 200px;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            .qr-label {
              margin-top: 15px;
              font-size: 16px;
              color: #1f1f1f;
              font-weight: 700;
            }
            .qr-description {
              margin-top: 8px;
              font-size: 13px;
              color: #666;
              line-height: 1.5;
            }
            .footer {
              margin-top: 50px;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.6;
            }
            .footer strong {
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="plakat">
            <div class="content">
              <div class="icon">🏛️</div>
              <h1>K2 GALERIE</h1>
              <h2>Besuchen Sie uns online</h2>
              <p class="subtitle">Kunst & Keramik • Jederzeit verfügbar</p>
              
              <div class="text-block">
                <p><strong>Entdecken Sie die K2 Galerie – auch wenn wir geschlossen haben!</strong></p>
                <p>Die K2 Galerie öffnet ihre Türen für Sie – jederzeit und überall. Erleben Sie die aktuellen Werke von Martina und Georg Kreinecker bequem von zu Hause oder unterwegs. Entdecken Sie die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.</p>
              </div>

              <div class="highlight-box">
                <p>🎨 Malerei & Keramik<br>
                📱 Einfach QR-Code scannen<br>
                🌐 Sofort verfügbar, jederzeit</p>
              </div>

              <div class="qr-grid">
                <div class="qr-container">
                  <img src="${homepageQRUrl}" alt="QR-Code für Homepage" class="qr-code" />
                  <div class="qr-label">Homepage</div>
                  <div class="qr-description">Besuchen Sie unsere Galerie-Website</div>
                </div>
                <div class="qr-container">
                  <img src="${rundgangQRUrl}" alt="QR-Code für virtuellen Rundgang" class="qr-code" />
                  <div class="qr-label">Virtueller Rundgang</div>
                  <div class="qr-description">Erkunden Sie die Ausstellung</div>
                </div>
              </div>

              <div class="text-block">
                <p><strong>So funktioniert's:</strong></p>
                <p>1. Öffnen Sie die Kamera-App auf Ihrem Smartphone<br>
                2. Scannen Sie einen der QR-Codes<br>
                3. Erkunden Sie unsere Galerie in Ruhe</p>
                <p style="margin-top: 15px;">Lassen Sie sich von der Vielfalt unserer Kunstwerke inspirieren und entdecken Sie die einzigartige Verbindung von Malerei und Keramik.</p>
              </div>

              <div class="footer">
                <p><strong>K2 Galerie</strong><br>
                Martina & Georg Kreinecker<br>
                Kunst & Keramik</p>
                <p style="margin-top: 12px;">Erstellt am: ${date}</p>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              // Zeige PDF an - Nutzer kann dann selbst drucken/speichern
              // Kein automatischer Druck-Dialog mehr
            }
          </script>
        </body>
      </html>
    `

    // Speichere das PDF automatisch im Dokumentenordner
    try {
      // Erstelle ein Blob aus dem HTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const base64 = reader.result as string
          
          // Prüfe, ob bereits eine "Virtuelle Einladung" existiert
          const existingDocs = loadDocuments()
          const existingInvitation = existingDocs.find((d: any) => 
            d.name && d.name.includes('Virtuelle Einladung')
          )
          
          // Erstelle Dokument-Objekt
          const doc = {
            id: existingInvitation ? existingInvitation.id : `qr-plakat-${Date.now()}`,
            name: `Virtuelle Einladung - QR-Code Plakat (${date}).html`,
            type: 'text/html',
            size: blob.size,
            data: base64,
            uploadedAt: new Date().toISOString(),
            isPDF: false,
            isPlaceholder: false
          }
          
          // Ersetze vorhandenes oder füge neues hinzu
          const updated = existingInvitation
            ? existingDocs.map((d: any) => d.id === existingInvitation.id ? doc : d)
            : [...existingDocs, doc]
          
          saveDocuments(updated)
          setDocuments(updated)
          
          // Zeige Erfolgsmeldung
          alert(`✅ Virtuelle Einladung wurde im Dokumentenordner gespeichert!\n\nDateiname: ${doc.name}`)
        } catch (error) {
          console.error('Fehler beim Speichern:', error)
          alert('❌ Fehler beim Speichern der virtuellen Einladung')
        }
      }
      
      reader.onerror = () => {
        alert('❌ Fehler beim Lesen der Datei')
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Fehler beim Erstellen des Blobs:', error)
      alert('❌ Fehler beim Speichern der virtuellen Einladung')
    }

    // Öffne auch das PDF-Fenster zur Ansicht
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Ansicht. Bitte erlaube Pop-ups.')
      return
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // PDF für Werke drucken
  const printPDF = (type: 'galerie' | 'verkauft') => {
    let filteredArtworks = allArtworks
    
    if (type === 'galerie') {
      // Nur Werke die in der Galerie sind
      filteredArtworks = allArtworks.filter((a: any) => a.inExhibition === true)
    } else if (type === 'verkauft') {
      // Nur verkaufte Werke
      try {
        const soldData = localStorage.getItem('k2-sold-artworks')
        if (soldData) {
          const soldArtworks = JSON.parse(soldData)
          const soldNumbers = new Set(soldArtworks.map((a: any) => a.number))
          filteredArtworks = allArtworks.filter((a: any) => soldNumbers.has(a.number))
        } else {
          filteredArtworks = []
        }
      } catch (error) {
        filteredArtworks = []
      }
    }

    if (filteredArtworks.length === 0) {
      alert(`Keine Werke gefunden für "${type === 'galerie' ? 'Galerie' : 'Verkaufte Werke'}"`)
      return
    }

    filteredArtworks = sortArtworksNewestFirst(filteredArtworks)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Erstellung. Bitte erlaube Pop-ups.')
      return
    }

    const title = type === 'galerie' ? 'Werke in der Galerie' : 'Verkaufte Werke'
    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.5;
              color: #000;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #8b6914;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #8b6914;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 12px;
              color: #666;
            }
            .artwork-item {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #ddd;
              page-break-inside: avoid;
            }
            .artwork-item:last-child {
              border-bottom: none;
            }
            .artwork-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 10px;
            }
            .artwork-title {
              font-size: 14px;
              font-weight: bold;
              color: #1f1f1f;
            }
            .artwork-number {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
            }
            .artwork-details {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .artwork-image {
              max-width: 200px;
              max-height: 200px;
              margin: 10px 0;
              border: 1px solid #ddd;
            }
            .artwork-price {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 9px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K2 GALERIE</h1>
            <p>${title}</p>
            <p>Erstellt am: ${date} • ${filteredArtworks.length} ${filteredArtworks.length === 1 ? 'Werk' : 'Werke'}</p>
          </div>
          
          ${filteredArtworks.map((artwork: any) => `
            <div class="artwork-item">
              <div class="artwork-header">
                <div class="artwork-title">${artwork.title || artwork.number}</div>
                <div class="artwork-number">Seriennummer: ${artwork.number || artwork.id}</div>
              </div>
              <div class="artwork-details">
                ${artwork.category === 'malerei' ? 'Bilder' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                ${artwork.artist ? ' • ' + artwork.artist : ''}
                ${artwork.description ? '<br/>' + artwork.description : ''}
              </div>
              ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
              <div class="artwork-price">Preis: € ${artwork.price ? artwork.price.toFixed(2) : '0.00'}</div>
              ${type === 'verkauft' ? '<div style="color: #2d6a2d; font-weight: bold; margin-top: 5px;">✓ Verkauft</div>' : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <div>K2 Galerie - Kunst & Keramik</div>
            <div>www.k2-galerie.at</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Cleanup nicht mehr nötig, da wir Data URLs verwenden (keine Blob URLs)

  // Kein body/html-Override mehr – K2-Theme (Orange) aus index.css/index.html gilt für die ganze App

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--k2-bg-1, #1a0f0a) 0%, var(--k2-bg-2, #2d1a14) 50%, var(--k2-bg-3, #3d2419) 100%)',
      color: 'var(--k2-text, #fff5f0)',
      position: 'relative',
      overflowX: 'hidden',
      width: '100%'
    }}>
      {/* Animated Background Elements – K2 Orange */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255, 140, 66, 0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 165, 116, 0.08), transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
          paddingTop: 'clamp(2rem, 5vw, 3rem)',
          maxWidth: '1600px',
          margin: '0 auto',
          marginBottom: 'clamp(2rem, 5vw, 3rem)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(2rem, 6vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}>
                K2 Galerie
              </h1>
              <span style={{
                marginTop: '0.5rem',
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: '300'
              }}>
                Admin-Verwaltung
              </span>
            </div>
            <nav style={{
              display: 'flex',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].galerie}
                state={{ fromAdmin: true }}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Zur Galerie
              </Link>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].shop}
                state={{ openAsKasse: true }}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}
              >
                💰 Kasse
              </Link>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].kunden} 
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'rgba(95, 251, 241, 0.15)',
                  border: '1px solid rgba(95, 251, 241, 0.4)',
                  color: '#5ffbf1',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.25)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                👥 Kunden
              </Link>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}>
                <span style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'rgba(45, 106, 45, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(45, 106, 45, 0.3)',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#4ade80',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>✓</span> Admin-Modus
                </span>
                {!isOeffentlichAdminContext() && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.removeItem(ADMIN_CONTEXT_KEY)
                        localStorage.removeItem('k2-admin-unlocked')
                        localStorage.removeItem('k2-admin-unlocked-expiry')
                      } catch (_) {}
                      navigate(PROJECT_ROUTES['k2-galerie'].galerie)
                    }}
                    style={{
                      padding: 'clamp(0.5rem, 1.5vw, 0.6rem) clamp(0.75rem, 2vw, 1rem)',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '10px',
                      fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Admin-Login auf diesem Gerät beenden"
                  >
                    Abmelden
                  </button>
                )}
              </span>
            </nav>
          </div>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Admin Tabs – Klare Struktur: Kasse | Werke | Eventplanung | Design | Einstellungen */}
          <div style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            {[
              { id: 'werke' as const, label: '🎨 Werke verwalten', desc: 'Neue Werke hinzufügen' },
              { id: 'eventplan' as const, label: '📢 Marketing', desc: 'Eventplanung, Außenkommunikation, Flyer, Dokumente' },
              { id: 'design' as const, label: '✨ Design', desc: 'Aussehen ändern' },
              { id: 'einstellungen' as const, label: '⚙️ Einstellungen', desc: 'Stammdaten, Sicherheit, Lager' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.desc}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  boxShadow: activeTab === tab.id ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Werke verwalten – Kasse = ein Button im Header, öffnet direkt den Shop */}
          {activeTab === 'werke' && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                letterSpacing: '-0.01em'
              }}>
                Werke verwalten
              </h2>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <button 
                  onClick={() => {
                    setEditingArtwork(null)
                    setShowAddModal(true)
                  }}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  + Neues Werk hinzufügen
                </button>
                <button 
                  onClick={handleSyncFromServer}
                  disabled={isSyncing}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: isSyncing ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: isSyncing ? 'wait' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isSyncing ? 0.8 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSyncing) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSyncing ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isSyncing ? '⏳ Synchronisiere...' : '🔄 Vom Server laden'}
                </button>
                <button 
                  onClick={() => {
                    navigate(PROJECT_ROUTES['k2-galerie'].platzanordnung)
                  }}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  📍 Platzanordnung
                </button>
            </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <input 
                  type="text" 
                  placeholder="Werke durchsuchen..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                />
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    color: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="alle" style={{ background: '#1a1f3a', color: '#ffffff' }}>Alle Kategorien</option>
                  <option value="malerei" style={{ background: '#1a1f3a', color: '#ffffff' }}>Bilder</option>
                  <option value="keramik" style={{ background: '#1a1f3a', color: '#ffffff' }}>Keramik</option>
                </select>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 30vw, 280px), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
              {(() => {
                const filtered = sortArtworksNewestFirst(
                  allArtworks.filter((artwork) => {
                    if (!artwork) return false
                    if (categoryFilter !== 'alle' && artwork.category !== categoryFilter) return false
                    if (searchQuery && !artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
                        !artwork.number?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                    return true
                  })
                )

                if (filtered.length === 0) {
                  return (
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: 'clamp(3rem, 8vw, 5rem)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px'
                    }}>
                      <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'rgba(255, 255, 255, 0.9)' }}>
                        Noch keine Werke vorhanden
                      </p>
                      <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Klicke auf "+ Neues Werk hinzufügen" um ein Werk anzulegen.
                      </p>
                    </div>
                  )
                }

                return filtered.map((artwork) => {
                  const imageSrc = artwork.imageUrl || artwork.previewUrl
                  
                  return (
                  <div 
                    key={artwork.number || artwork.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {imageSrc ? (
                      <div style={{ position: 'relative', width: '100%', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
                        <img 
                          src={imageSrc} 
                          alt={artwork.title || artwork.number}
                          style={{ width: '100%', height: 'clamp(180px, 30vw, 220px)', objectFit: 'cover', borderRadius: '12px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const placeholder = document.createElement('div')
                            placeholder.textContent = '🖼️'
                            placeholder.style.cssText = 'width: 100%; height: clamp(180px, 30vw, 220px); display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; color: rgba(255, 255, 255, 0.3); font-size: clamp(2rem, 5vw, 3rem)'
                            target.parentElement?.insertBefore(placeholder, target)
                          }}
                        />
                        {/* Nummer als Overlay auf dem Bild */}
                        {artwork.number && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            right: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                            fontWeight: '600',
                            fontFamily: 'monospace',
                            pointerEvents: 'none',
                            zIndex: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                          }}>
                            {artwork.number}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 'clamp(180px, 30vw, 220px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '12px', 
                        marginBottom: 'clamp(0.75rem, 2vw, 1rem)', 
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: 'clamp(2rem, 5vw, 3rem)'
                      }}>
                        🖼️
                      </div>
                    )}
                    <h3 style={{
                      margin: '0 0 0.5rem',
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h3>
                    <p style={{
                      margin: '0.25rem 0',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {artwork.category === 'malerei' ? 'Bilder' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                    </p>
                    {artwork.artist && (
                      <p style={{ 
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', 
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: '0.25rem 0'
                      }}>
                        {artwork.artist}
                      </p>
                    )}
                    {artwork.price && (
                      <p style={{ 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                        margin: '0.5rem 0'
                      }}>
                        € {artwork.price.toFixed(2)}
                      </p>
                    )}
                    <div style={{ 
                      marginTop: '0.75rem', 
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', 
                      color: 'rgba(255, 255, 255, 0.6)' 
                    }}>
                      {artwork.inExhibition && <span style={{ display: 'block' }}>✓ Ausstellung</span>}
                      {artwork.inShop && <span style={{ display: 'block' }}>✓ Shop</span>}
                      {(artwork.addedToGalleryAt || artwork.createdAt) && (
                        <span style={{ display: 'block', color: 'rgba(255, 255, 255, 0.45)', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                          Aufgenommen: {(() => {
                            const d = artwork.addedToGalleryAt || artwork.createdAt
                            if (!d) return ''
                            try {
                              const dt = new Date(d)
                              return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            } catch { return d }
                          })()}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                      marginTop: 'clamp(1rem, 3vw, 1.5rem)'
                    }}>
                      <button 
                        onClick={() => {
                          // Setze editingArtwork State für Bearbeitung
                          setEditingArtwork(artwork)
                          
                          const category = artwork.category || 'malerei'
                          setArtworkCategory(category)
                          // Bei Keramik: Titel aus Unterkategorie setzen, nicht aus artwork.title
                          if (category === 'keramik') {
                            const subcategory = artwork.ceramicSubcategory || 'vase'
                            setArtworkCeramicSubcategory(subcategory as 'vase' | 'teller' | 'skulptur' | 'sonstig')
                            const subcategoryLabels: Record<string, string> = {
                              'vase': 'Gefäße - Vasen',
                              'teller': 'Schalen - Teller',
                              'skulptur': 'Skulptur',
                              'sonstig': 'Sonstig'
                            }
                            setArtworkTitle(subcategoryLabels[subcategory] || 'Keramik')
                            setArtworkCeramicHeight(artwork.ceramicHeight ? String(artwork.ceramicHeight) : '10')
                            setArtworkCeramicDiameter(artwork.ceramicDiameter ? String(artwork.ceramicDiameter) : '10')
                            setArtworkCeramicDescription(artwork.ceramicDescription || '')
                            setArtworkCeramicType(artwork.ceramicType || 'steingut')
                            setArtworkCeramicSurface(artwork.ceramicSurface || 'mischtechnik')
                          } else {
                            setArtworkTitle(artwork.title || '')
                            setArtworkPaintingWidth(artwork.paintingWidth ? String(artwork.paintingWidth) : '')
                            setArtworkPaintingHeight(artwork.paintingHeight ? String(artwork.paintingHeight) : '')
                            setArtworkCeramicSubcategory('vase')
                            setArtworkCeramicHeight('10')
                            setArtworkCeramicDiameter('10')
                            setArtworkCeramicDescription('')
                            setArtworkCeramicType('steingut')
                            setArtworkCeramicSurface('mischtechnik')
                          }
                          setArtworkArtist(artwork.artist || '')
                          setArtworkDescription(artwork.description || '')
                          setArtworkPrice(String(artwork.price || ''))
                          setIsInShop(artwork.inShop !== undefined ? artwork.inShop : true)
                          setArtworkNumber(artwork.number || '')
                          
                          // Setze Preview-URL wenn vorhanden
                          if (artwork.imageUrl) {
                            setPreviewUrl(artwork.imageUrl)
                          }
                          
                          setShowAddModal(true)
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        Bearbeiten
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Möchtest du "${artwork.title || artwork.number}" wirklich löschen?`)) {
                            const artworks = loadArtworks()
                            const filtered = artworks.filter((a: any) => a.number !== artwork.number && a.id !== artwork.id)
                            const saved = saveArtworks(filtered)
                            if (saved) {
                              window.dispatchEvent(new CustomEvent('artworks-updated'))
                              setAllArtworks(filtered)
                            } else {
                              alert('⚠️ Fehler beim Löschen! Bitte versuche es erneut.')
                            }
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                  )
                })
              })()}
              </div>
            </section>
          )}

          {/* Eventplanung: Dokumente (Marketingabteilung) – Sub-Tabs stehen in Eventplanung-Section oben */}
          {activeTab === 'eventplan' && eventplanSubTab === 'dokumente' && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                letterSpacing: '-0.01em'
              }}>
                Dokumente verwalten
              </h2>
              
              {/* Filter für Dokumente */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setDocumentFilter('alle')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: documentFilter === 'alle' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    fontWeight: documentFilter === 'alle' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Alle
                </button>
                <button
                  onClick={() => setDocumentFilter('pr-dokumente')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: documentFilter === 'pr-dokumente' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    fontWeight: documentFilter === 'pr-dokumente' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📢 PR-Dokumente
                </button>
                <button
                  onClick={() => setDocumentFilter('sonstige')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: documentFilter === 'sonstige' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    fontWeight: documentFilter === 'sonstige' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sonstige
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  + Dokument hochladen
                </button>
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf'
                    input.onchange = async (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || [])
                      if (files.length === 0) return
                      
                      let successCount = 0
                      let errorCount = 0
                      
                      for (const file of files) {
                        try {
                          await handleDocumentUpload(file)
                          successCount++
                        } catch (error) {
                          console.error('Fehler beim Hochladen:', file.name, error)
                          errorCount++
                        }
                      }
                      
                      if (successCount > 0) {
                        alert(`✅ ${successCount} Dokument${successCount > 1 ? 'e' : ''} erfolgreich hochgeladen${errorCount > 0 ? `\n❌ ${errorCount} Fehler` : ''}`)
                      } else {
                        alert(`❌ Fehler beim Hochladen der Dokumente`)
                      }
                    }
                    input.click()
                  }}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  📁 Mehrere Dokumente hochladen
                </button>
                {documents.length === 0 && (
                  <button 
                  onClick={() => {
                    if (confirm('Möchtest du die Beispiel-Dokumente wiederherstellen? Diese sind Platzhalter ohne echte Dateien.')) {
                      const exampleDocs = [
                        {
                          id: 'example-1',
                          name: 'Einladungsfolder',
                          type: 'application/pdf',
                          size: 2400000,
                          data: '',
                          uploadedAt: new Date('2026-02-01').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-2',
                          name: 'Plakat A4',
                          type: 'application/pdf',
                          size: 1800000,
                          data: '',
                          uploadedAt: new Date('2026-02-02').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-3',
                          name: 'Presse',
                          type: 'application/pdf',
                          size: 3100000,
                          data: '',
                          uploadedAt: new Date('2026-02-03').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-4',
                          name: 'Katalog',
                          type: 'application/pdf',
                          size: 5200000,
                          data: '',
                          uploadedAt: new Date('2026-02-04').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        }
                      ]
                      saveDocuments(exampleDocs)
                      alert('✅ Beispiel-Dokumente wiederhergestellt!\n\nHinweis: Diese sind Platzhalter. Bitte lade die echten Dokumente hoch, indem du auf die Dokumente klickst und sie durch echte Dateien ersetzt.')
                    }
                  }}
                  style={{ background: '#666' }}
                >
                  📋 Beispiel-Dokumente wiederherstellen
                </button>
              )}
            </div>
            
              {documents.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'clamp(3rem, 8vw, 5rem)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px'
                }}>
                  <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Noch keine Dokumente vorhanden
                  </p>
                  <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Klicke auf "+ Dokument hochladen" um ein Dokument hinzuzufügen.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(0.75rem, 2vw, 1rem)'
                }}>
                {documents
                  .filter((doc: any) => {
                    if (documentFilter === 'alle') return true
                    if (documentFilter === 'pr-dokumente') return doc.category === 'pr-dokumente'
                    if (documentFilter === 'sonstige') return !doc.category || doc.category !== 'pr-dokumente'
                    return true
                  })
                  .map((doc) => {
                  const fileSizeMB = (doc.size / (1024 * 1024)).toFixed(2)
                  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                  
                  let icon = '📄'
                  if (doc.type.startsWith('image/')) icon = '🖼️'
                  else if (doc.type === 'application/pdf') icon = '📋'
                  else if (doc.type.includes('word') || doc.type.includes('document')) icon = '📝'
                  
                  return (
                    <div key={doc.id} className="document-admin-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#fff',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f1f1f' }}>{doc.name}</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#666' }}>
                          {doc.isPlaceholder ? '⚠️ Platzhalter - Bitte Datei hochladen' : `${doc.isPDF ? 'PDF' : doc.type.split('/')[1]?.toUpperCase() || 'DATEI'} • ${fileSizeMB} MB`} • {doc.isPlaceholder ? 'Erstellt' : 'Hochgeladen'}: {uploadDate}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {doc.isPlaceholder ? (
                          <>
                            <button 
                              className="btn-secondary"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    try {
                                      const reader = new FileReader()
                                      reader.onload = (e) => {
                                        const base64 = e.target?.result as string
                                        const updated = documents.map(d => 
                                          d.id === doc.id 
                                            ? { ...d, name: file.name, type: file.type, size: file.size, data: base64, isPDF: file.type === 'application/pdf', isPlaceholder: false }
                                            : d
                                        )
                                        saveDocuments(updated)
                                        alert('✅ Dokument erfolgreich ersetzt!')
                                      }
                                      reader.onerror = () => alert('❌ Fehler beim Laden der Datei')
                                      reader.readAsDataURL(file)
                                    } catch (error) {
                                      alert('❌ Fehler beim Ersetzen')
                                    }
                                  }
                                }
                                input.click()
                              }}
                              style={{ background: '#8b6914', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              📤 Datei hochladen
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => deleteDocument(doc.id)}
                              style={{ background: '#c33', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              🗑️ Löschen
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="btn-secondary"
                              onClick={() => convertToPDF(doc)}
                              style={{ background: '#8b6914', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              📄 Zu PDF
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = doc.data
                                link.download = doc.name
                                link.click()
                              }}
                              style={{ background: '#2d6a2d', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ⬇️ Download
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => deleteDocument(doc.id)}
                              style={{ background: '#c33', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              🗑️ Löschen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUploadModal(false)
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginTop: 0 }}>Dokument hochladen</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Unterstützte Formate: PDF, Bilder (JPG, PNG, etc.), Word-Dokumente
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      await handleDocumentUpload(file)
                      alert('✅ Dokument erfolgreich hochgeladen!')
                      setShowUploadModal(false)
                    } catch (error) {
                      console.error('Upload-Fehler:', error)
                      alert('❌ Fehler beim Hochladen. Bitte versuche es erneut.')
                    }
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Design-Abteilung – Vorschau füllt den Bereich ohne Kopfzeilen; Farben mit Titel */}
        {activeTab === 'design' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: designSubTab === 'vorschau' ? '0' : 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            {/* Nur bei Farben: Titel + Zurück zur Vorschau */}
            {designSubTab === 'farben' && (
              <>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '700', color: '#ffffff', marginBottom: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '-0.01em' }}>✨ Design</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>Farben und Themes anpassen.</p>
                <button type="button" onClick={() => setDesignSubTab('vorschau')} style={{ padding: '0.75rem 1.5rem', marginBottom: '2rem', border: 'none', borderRadius: 8, fontSize: '1rem', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', cursor: 'pointer' }}>← Zur Vorschau</button>
              </>
            )}

            {/* Vorschau – füllt den gesamten Bereich, nur minimale Leiste */}
            {designSubTab === 'vorschau' && !isOeffentlichAdminContext() && (
              <div ref={previewContainerRef} style={{ width: '100%', minHeight: 'calc(100vh - 180px)', background: 'linear-gradient(135deg, var(--k2-bg-1, #0a0e27) 0%, var(--k2-bg-2, #1a1f3a) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.5rem 1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setPreviewFullscreenPage(1)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem', background: previewFullscreenPage === 1 ? 'rgba(95, 251, 241, 0.25)' : 'transparent', border: '1px solid ' + (previewFullscreenPage === 1 ? 'var(--k2-accent)' : 'rgba(255,255,255,0.2)'), borderRadius: 6, color: previewFullscreenPage === 1 ? 'var(--k2-accent)' : 'var(--k2-muted)', cursor: 'pointer' }}>Seite 1</button>
                    <button type="button" onClick={() => setPreviewFullscreenPage(2)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem', background: previewFullscreenPage === 2 ? 'rgba(95, 251, 241, 0.25)' : 'transparent', border: '1px solid ' + (previewFullscreenPage === 2 ? 'var(--k2-accent)' : 'rgba(255,255,255,0.2)'), borderRadius: 6, color: previewFullscreenPage === 2 ? 'var(--k2-accent)' : 'var(--k2-muted)', cursor: 'pointer' }}>Seite 2</button>
                    <a href={PROJECT_ROUTES['k2-galerie'].galerie} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', borderRadius: 6, color: '#10b981', textDecoration: 'none', fontWeight: 600 }} title="Öffnet die Galerie – genau wie Kunden sie sehen">So sehen Kunden die Galerie →</a>
                  </div>
                  <button type="button" onClick={() => setDesignSubTab('farben')} style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: 'var(--k2-muted)', cursor: 'pointer' }}>🎨 Farben</button>
                </div>
                <p style={{ margin: '0 1rem 0.5rem', fontSize: '0.85rem', color: 'var(--k2-muted)' }}>Am Handy: Seite 1 oder 2 wählen – dann ist die ganze Seite sichtbar, Texte zum Bearbeiten antippen.</p>
                <input type="file" accept="image/*" ref={welcomeImageInputRef} style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPageContent({ ...pageContent, welcomeImage: await compressImage(f, 1200, 0.7) }) } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                <input type="file" accept="image/*" ref={galerieImageInputRef} style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPageContent({ ...pageContent, galerieCardImage: await compressImage(f, 1200, 0.7) }) } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                <input type="file" accept="image/*" ref={virtualTourImageInputRef} style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPageContent({ ...pageContent, virtualTourImage: await compressImage(f, 1200, 0.7) }) } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                {(() => {
                  const tc = TENANT_CONFIGS.k2
                  const galleryName = tc.galleryName
                  const tagline = tc.tagline
                  const welcomeIntroDefault = defaultPageTexts.galerie.welcomeIntroText || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'
                  return (
                <>
                {/* Bildausfüllend: 412px-Layout mit scale() auf Container-Breite skaliert */}
                {(() => {
                  const scale = Math.max(0.5, Math.min(2.5, previewContainerWidth / 412))
                  return (
                <div style={{ overflow: 'auto', marginBottom: '1rem', width: '100%', minHeight: '100%' }}>
                <div style={{ width: 412 * scale, minWidth: Math.min(412, previewContainerWidth), maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                <div style={{ width: 412, transform: `scale(${scale})`, transformOrigin: 'top left', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 0, boxSizing: 'border-box' }}>
                  {previewFullscreenPage === 1 && (
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' }}>
                    {/* Brand linkes oberes Eck – nur K2 Galerie */}
                    <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 10 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.92)', letterSpacing: '0.02em', lineHeight: 1.25 }}>{PRODUCT_BRAND_NAME}</div>
                    </div>
                    <header style={{ padding: '24px 18px 24px', paddingTop: 44, maxWidth: 412, margin: 0 }}>
                      <div style={{ marginBottom: 32 }}>
                        {designPreviewEdit === 'p1-heroTitle' ? (
                          <input autoFocus type="text" value={pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle ?? galleryName} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, heroTitle: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.5rem', fontSize: '2rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} placeholder="Großer Titel (z. B. Galeriename)" />
                        ) : (
                          <h1 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-heroTitle')} style={{ margin: 0, fontSize: '2rem', fontWeight: '700', background: 'linear-gradient(135deg, var(--k2-text) 0%, var(--k2-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em', lineHeight: 1.1, cursor: 'pointer' }} title="Klicken: Großer Titel bearbeiten">{(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName}</h1>
                        )}
                        {designPreviewEdit === 'p1-tagline' ? (
                          <input autoFocus type="text" value={pageTexts.galerie?.welcomeSubtext ?? tagline} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeSubtext: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-tagline')} style={{ margin: '0.5rem 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', fontWeight: '300', letterSpacing: '0.05em', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                        )}
                      </div>
                      <section style={{ marginBottom: 40, maxWidth: 412, width: '100%' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700', lineHeight: 1.2, color: '#ffffff', letterSpacing: '-0.02em' }}>
                          {designPreviewEdit === 'p1-welcomeHeading' ? (
                            <input autoFocus type="text" value={pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading ?? 'Willkommen bei'} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.4rem', fontSize: '1.5rem', fontWeight: '700', color: '#fff', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} placeholder="z. B. Willkommen bei" />
                          ) : (
                            <span role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-welcomeHeading')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-welcomeHeading')} style={{ cursor: 'pointer' }}>{(pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading)?.trim() || 'Willkommen bei'} {(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName} –</span>
                          )}<br />
                          {designPreviewEdit === 'p1-taglineH2' ? (
                            <textarea autoFocus rows={2} value={pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext ?? tagline} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeSubtext: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', marginTop: 4, padding: '0.4rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                          ) : (
                            <span role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-taglineH2')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-taglineH2')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</span>
                          )}
                        </h2>
                        {designPreviewEdit === 'p1-intro' ? (
                          <textarea autoFocus rows={4} value={pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeIntroText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.75rem', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, background: 'rgba(0,0,0,0.25)', border: '2px solid var(--k2-accent)', borderRadius: 12, marginBottom: '1rem', resize: 'vertical', boxSizing: 'border-box' }} placeholder={welcomeIntroDefault} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-intro')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-intro')} style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: '300', maxWidth: 340, marginBottom: 24, cursor: 'pointer' }}>{(pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText)?.trim() || welcomeIntroDefault}</p>
                        )}
                        <div role="button" tabIndex={0} onClick={() => welcomeImageInputRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && welcomeImageInputRef.current?.click()} style={{ cursor: 'pointer', width: '100%', marginTop: 20, overflow: 'hidden', border: '2px dashed rgba(255,255,255,0.2)', boxSizing: 'border-box' }}>
                          {pageContent.welcomeImage ? (
                            <img src={pageContent.welcomeImage} alt="Willkommen" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 480, objectFit: 'cover', boxSizing: 'border-box' }} />
                          ) : (
                            <div style={{ width: '100%', minHeight: 200, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fa0c9', fontSize: '1rem' }}>Klicken zum Willkommensbild</div>
                          )}
                        </div>
                      </section>
                    </header>
                  </div>
                  )}
                  {previewFullscreenPage === 2 && (
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' }}>
                    <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 10 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.92)', letterSpacing: '0.02em', lineHeight: 1.25 }}>{PRODUCT_BRAND_NAME}</div>
                    </div>
                    <main style={{ padding: '24px 18px 40px', maxWidth: 412, margin: 0 }}>
                      <section style={{ marginTop: 36 }}>
                        {designPreviewEdit === 'p2-kunstschaffendeHeading' ? (
                          <input autoFocus value={pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, kunstschaffendeHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '1.5rem', fontWeight: '700', color: '#fff', background: 'rgba(0,0,0,0.25)', border: '2px solid var(--k2-accent)', borderRadius: 8, marginBottom: 24, textAlign: 'center', boxSizing: 'border-box' }} />
                        ) : (
                          <h3 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-kunstschaffendeHeading')} style={{ fontSize: '1.5rem', marginBottom: 24, fontWeight: '700', color: '#ffffff', textAlign: 'center', letterSpacing: '-0.02em', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading) || 'Die Kunstschaffenden'}</h3>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                          <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(184, 184, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(184, 184, 255, 0.2)', borderRadius: '16px 16px 8px 16px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '60%', background: 'linear-gradient(180deg, var(--k2-accent) 0%, #e67a2a 100%)', borderRadius: '0 4px 4px 0' }} />
                            {designPreviewEdit === 'p2-martinaBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, martinaBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.25)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-martinaBio')} style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio) || 'Kurzbio Künstler:in 1 (z. B. Martina)'}</p>
                            )}
                          </div>
                          <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(255, 119, 198, 0.06) 0%, rgba(255, 255, 255, 0.04) 50%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(245, 87, 108, 0.2)', borderRadius: '16px 16px 16px 8px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '60%', background: 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)', borderRadius: '4px 0 0 4px' }} />
                            {designPreviewEdit === 'p2-georgBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, georgBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.25)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-georgBio')} style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio) || 'Kurzbio Künstler:in 2 (z. B. Georg)'}</p>
                            )}
                          </div>
                        </div>
                        {designPreviewEdit === 'p2-gemeinsamText' ? (
                          <textarea autoFocus rows={3} value={pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, gemeinsamText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} placeholder="Leer = wird aus Namen erzeugt" style={{ width: '100%', margin: '0 auto 28px', display: 'block', padding: '0.6rem', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, textAlign: 'center', background: 'rgba(0,0,0,0.25)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-gemeinsamText')} style={{ marginTop: 24, fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: 28, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText) || 'Gemeinsam eröffnen … (leer = automatisch)'}</p>
                        )}
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: 16, textAlign: 'center' }}>Willkommen in der Eingangshalle – wähle deinen Weg:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, alignItems: 'stretch' }}>
                          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                            <div role="button" tabIndex={0} onClick={() => galerieImageInputRef.current?.click()} style={{ cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: pageContent.galerieCardImage ? 'transparent' : 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)' }}>
                              {pageContent.galerieCardImage ? <img src={pageContent.galerieCardImage} alt="In die Galerie" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fa0c9', fontSize: '0.9rem' }}>Klicken: Bild „In die Galerie“</div>}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>In die Galerie</h3>
                          </div>
                          <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                            <div role="button" tabIndex={0} onClick={() => virtualTourImageInputRef.current?.click()} style={{ cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: pageContent.virtualTourImage ? 'transparent' : 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)' }}>
                              {pageContent.virtualTourImage ? <img src={pageContent.virtualTourImage} alt="Virtueller Rundgang" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fa0c9', fontSize: '0.9rem' }}>Klicken: Bild Virtueller Rundgang</div>}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>Virtueller Rundgang</h3>
                          </div>
                        </div>
                      </section>
                    </main>
                  </div>
                  )}
                </div>
                </div>
                </div>
                </div>
                );
                })()}
                </>
                  ); })()}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <button type="button" className="btn-primary" onClick={() => {
                    try {
                      setPageContentGalerie(pageContent)
                      setPageTexts(pageTexts)
                      if (designSettings && Object.keys(designSettings).length > 0) {
                        const ds = JSON.stringify(designSettings)
                        if (ds.length < 50000) localStorage.setItem('k2-design-settings', ds)
                      }
                      const pageTextsRaw = localStorage.getItem('k2-page-texts')
                      const pageTextsOk = pageTextsRaw != null && pageTextsRaw.length > 0
                      const pageContentOk = localStorage.getItem('k2-page-content-galerie') != null
                      const designStored = localStorage.getItem('k2-design-settings')
                      const designOk = !designSettings || Object.keys(designSettings).length === 0 || (designStored != null && designStored.length > 0)
                      if (pageTextsOk && pageContentOk && designOk) {
                        setDesignSaveFeedback('ok')
                        setTimeout(() => setDesignSaveFeedback(null), 5000)
                        alert('Gespeichert. ✓ Kontrolle: Seitentexte, Seitengestaltung und Design sind im Speicher. Du kannst die Seite schließen – die Änderungen bleiben erhalten.')
                      } else {
                        alert('Speichern teilweise fehlgeschlagen. Bitte erneut auf „Speichern“ klicken. Falls es wieder passiert: Speicher prüfen (z. B. wenig Platz?).')
                      }
                    } catch (e) {
                      console.error('Design speichern:', e)
                      alert('Fehler beim Speichern: ' + (e instanceof Error ? e.message : String(e)))
                    }
                  }} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>💾 Speichern</button>
                  {designSaveFeedback === 'ok' && <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>✓ Gerade gespeichert</span>}
                  <span style={{ fontSize: '0.9rem', color: '#8fa0c9' }}>Mit „Veröffentlichen“ (Einstellungen) auf alle Geräte.</span>
                </div>
              </div>
            )}

            {designSubTab === 'farben' && (() => {
              const simpleKeys = ['accentColor', 'backgroundColor1', 'textColor'] as const
              const labels: Record<string, string> = { accentColor: 'Akzentfarbe', backgroundColor1: 'Hintergrund', textColor: 'Textfarbe' }
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.5rem, 4vw, 2.5rem)', alignItems: 'start' }}>
                  {/* Linke Spalte: einfache Farbwahl */}
                  <div style={{ flex: '1 1 260px', minWidth: 260, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: 0 }}>Schnellwahl</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {Object.entries(themes).map(([name, theme]) => (
                        <button key={name} type="button" onClick={() => applyTheme(name as keyof typeof themes)} style={{ padding: '0.75rem 1.25rem', background: `linear-gradient(135deg, ${theme.backgroundColor2}, ${theme.backgroundColor3})`, border: `2px solid ${theme.accentColor}`, borderRadius: 10, color: theme.textColor, cursor: 'pointer', fontSize: '0.9rem' }}>
                          {name === 'default' ? 'Standard' : name === 'warm' ? 'Warm' : name === 'elegant' ? 'Elegant' : 'Modern'}
                        </button>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: 0 }}>Drei Farben anpassen</h3>
                    {simpleKeys.map((key) => {
                      const hex = designSettings[key] || '#ff8c42'
                      const isHex = /^#[0-9A-Fa-f]{3,6}$/.test(hex)
                      const hsl = isHex ? hexToHsl(hex) : { h: 180, s: 80, l: 65 }
                      return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ color: 'var(--k2-muted)', fontSize: '0.9rem' }}>{labels[key]}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="color" value={hex} onChange={(e) => handleDesignChange(key, e.target.value)} style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                            <input type="range" min={0} max={360} value={hsl.h} onChange={(e) => handleDesignChange(key, hslToHex(Number(e.target.value), hsl.s, hsl.l))} style={{ flex: 1, accentColor: 'var(--k2-accent)' }} title="Farbton" />
                            <input type="range" min={0} max={100} value={hsl.l} onChange={(e) => handleDesignChange(key, hslToHex(hsl.h, hsl.s, Number(e.target.value)))} style={{ width: 80, accentColor: 'var(--k2-accent)' }} title="Helligkeit" />
                          </div>
                        </div>
                      )
                    })}
                    <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', margin: 0 }}>Wird automatisch gespeichert. Gilt sofort in Vorschau und Galerie.</p>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Varianten</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', margin: '0 0 0.5rem' }}>Zum Experimentieren: aktuellen Stand als A oder B speichern, später anwenden. Die aktuelle Einstellung gilt – jederzeit änderbar.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button type="button" onClick={() => saveDesignVariant('a')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-accent)', borderRadius: 8, color: 'var(--k2-accent)', cursor: 'pointer' }}>Aktuell als A speichern</button>
                      <button type="button" onClick={() => saveDesignVariant('b')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-accent)', borderRadius: 8, color: 'var(--k2-accent)', cursor: 'pointer' }}>Aktuell als B speichern</button>
                      <button type="button" onClick={() => loadDesignVariant('a')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer' }}>Variante A anwenden</button>
                      <button type="button" onClick={() => loadDesignVariant('b')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer' }}>Variante B anwenden</button>
                    </div>
                  </div>
                  {/* Rechte Spalte: echte Galerie-Seite (Willkommen) als Vorschau */}
                  <div style={{ flex: '1 1 280px', minWidth: 280, position: 'sticky', top: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: '0.75rem' }}>Vorschau</h3>
                    <div style={{ overflow: 'auto', maxHeight: 'min(70vh, 520px)', borderRadius: 16, border: '2px solid var(--k2-accent)', background: 'var(--k2-bg-1)' }}>
                      {(() => {
                        const tc = TENANT_CONFIGS.k2
                        const galleryName = tc.galleryName
                        const tagline = tc.tagline
                        const welcomeIntroDefault = defaultPageTexts.galerie.welcomeIntroText || 'Ein Neuanfang mit Leidenschaft …'
                        const scale = 0.68
                        return (
                          <div style={{ width: 412 * scale, overflow: 'hidden', margin: '0 auto' }}>
                            <div style={{ width: 412, transform: `scale(${scale})`, transformOrigin: 'top left', background: 'linear-gradient(135deg, var(--k2-bg-1), var(--k2-bg-2))', padding: '24px 18px 24px', paddingTop: 44 }}>
                              <div style={{ marginBottom: 32 }}>
                                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, var(--k2-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName}</h1>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--k2-muted)', fontSize: '1rem' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                              </div>
                              <section style={{ marginBottom: 24 }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--k2-text)' }}>
                                  {(pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading)?.trim() || 'Willkommen bei'} {(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName} –
                                </h2>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--k2-muted)', fontSize: '1rem', background: 'linear-gradient(135deg, var(--k2-accent), #e67a2a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                                <p style={{ fontSize: '1.05rem', color: 'var(--k2-text)', lineHeight: 1.6, marginTop: 12, marginBottom: 16 }}>{(pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText)?.trim() || welcomeIntroDefault}</p>
                                <div style={{ width: '100%', marginTop: 12, overflow: 'hidden', border: '2px solid var(--k2-accent)', borderRadius: 8 }}>
                                  {pageContent.welcomeImage ? <img src={pageContent.welcomeImage} alt="" style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }} /> : <div style={{ minHeight: 160, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)' }}>Willkommensbild</div>}
                                </div>
                              </section>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )
            })()}
          </section>
        )}

        {/* Einstellungen */}
        {activeTab === 'einstellungen' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              letterSpacing: '-0.01em'
            }}>
              ⚙️ Einstellungen
            </h2>

            {/* Veröffentlichung – gesamte App auf alle Geräte */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.25rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '16px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '0.5rem' }}>🚀 Veröffentlichung</h3>

              {/* Vor dem Veröffentlichen: Seiten komplett prüfen */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.95)', marginBottom: '0.5rem' }}>📋 Vor dem Veröffentlichen: Seiten prüfen</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Speichert alle Änderungen und zeigt die Seite hier an (kein neuer Tab). Oben erscheint „← Zurück zu Einstellungen“. Wenn alles passt, zurückgehen und unten auf Veröffentlichen klicken.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      saveAllForVorschau()
                      requestAnimationFrame(() => { navigate(PROJECT_ROUTES['k2-galerie'].galerie + '?vorschau=1') })
                    }}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.9rem', background: 'rgba(95, 251, 241, 0.15)', border: '1px solid rgba(95, 251, 241, 0.4)', borderRadius: 8, color: '#5ffbf1', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Seite 1 (Willkommen) anzeigen →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveAllForVorschau()
                      requestAnimationFrame(() => { navigate(PROJECT_ROUTES['k2-galerie'].galerieVorschau + '?vorschau=1') })
                    }}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.9rem', background: 'rgba(95, 251, 241, 0.15)', border: '1px solid rgba(95, 251, 241, 0.4)', borderRadius: 8, color: '#5ffbf1', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Seite 2 (Werke) anzeigen →
                  </button>
                </div>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Stammdaten, Werke, Events, Dokumente und Seitentexte auf Vercel pushen. Danach auf allen Geräten aktuell (Seite neu öffnen oder QR-Code neu scannen).
              </p>
              <button 
                onClick={() => {
                  if (allArtworks.length === 0) {
                    alert('ℹ️ Keine Werke zum Veröffentlichen.\n\nFüge zuerst Werke hinzu oder lade sie vom Server.')
                    return
                  }
                  const detail = `${allArtworks.length} Werk(e), Stammdaten, Events, Dokumente, Seitentexte`
                  if (confirm(`🚀 App veröffentlichen?\n\nEs wird die gesamte App aktualisiert:\n• ${detail}\n\nNach dem Push (2–3 Min) sind alle Daten auf allen Geräten aktuell. Seite neu öffnen oder QR-Code neu scannen.`)) {
                    publishMobile()
                  }
                }}
                disabled={isDeploying}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isDeploying ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isDeploying ? 'not-allowed' : 'pointer',
                  boxShadow: isDeploying ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.4)',
                  opacity: isDeploying ? 0.6 : 1
                }}
              >
                {isDeploying ? '⏳ App wird aktualisiert...' : '🚀 Veröffentlichen'}
              </button>
            </div>

            {/* Lager (Backup) – Backup & Wiederherstellung; bei Wiederherstellung automatisch aufklappen */}
            {settingsSubTab === 'lager' && (
            <div style={{
              marginBottom: '2rem',
              background: 'rgba(95, 251, 241, 0.08)',
              border: '1px solid rgba(95, 251, 241, 0.25)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <button
                type="button"
                onClick={() => setBackupPanelMinimized(!backupPanelMinimized)}
                style={{
                  width: '100%',
                  padding: backupPanelMinimized ? '0.6rem 1rem' : '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#5ffbf1',
                  fontSize: backupPanelMinimized ? '0.95rem' : '1.1rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
              >
                <span>💾 Backup & Wiederherstellung</span>
                <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>{backupPanelMinimized ? '▼ Aufklappen' : '▲ Einklappen'}</span>
              </button>
              {!backupPanelMinimized && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(95, 251, 241, 0.15)' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
                Wenn Einstellungen oder Eventplanung weg sind: Hier kannst du das letzte Auto-Backup wiederherstellen, eine zuvor gespeicherte Backup-Datei einspielen oder ein neues Vollbackup herunterladen.
              </p>
              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  setRestoreProgress('running')
                  const reader = new FileReader()
                  reader.onload = () => {
                    try {
                      const raw = reader.result as string
                      const backup = JSON.parse(raw)
                      const ok = restoreFromBackupFile(backup)
                      if (!ok) {
                        setRestoreProgress('idle')
                        alert('❌ Die Datei ist kein gültiges K2-Vollbackup (erwartet: Stammdaten/Werke/Events/Dokumente).')
                        return
                      }
                      setRestoreProgress('done')
                      setTimeout(() => window.location.reload(), 800)
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
                }}
              />
              {restoreProgress !== 'idle' && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: '1px solid rgba(95, 251, 241, 0.3)'
                }}>
                  <div style={{ color: '#5ffbf1', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    {restoreProgress === 'running' ? 'Wiederherstellung läuft…' : 'Fertig. Lade neu…'}
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: restoreProgress === 'done' ? '100%' : undefined,
                      background: 'linear-gradient(90deg, #5ffbf1, #33a1ff)',
                      borderRadius: '4px',
                      transition: restoreProgress === 'done' ? 'width 0.3s ease' : 'none',
                      animation: restoreProgress === 'running' ? 'backup-progress-pulse 1s ease-in-out infinite' : 'none'
                    }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={downloadFullBackup}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  💾 Vollbackup herunterladen
                </button>
                <button
                  type="button"
                  disabled={restoreProgress !== 'idle'}
                  onClick={() => backupFileInputRef.current?.click()}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📂 Aus Backup-Datei wiederherstellen
                </button>
                {hasBackup() ? (
                  <button
                    disabled={restoreProgress !== 'idle'}
                    onClick={() => {
                      if (!confirm('Alle aktuellen Daten mit dem letzten Auto-Backup überschreiben? Die Seite wird danach neu geladen.')) return
                      setRestoreProgress('running')
                      requestAnimationFrame(() => {
                        const ok = restoreFromBackup()
                        if (!ok) {
                          setRestoreProgress('idle')
                          alert('❌ Kein Backup gefunden oder Fehler.')
                          return
                        }
                        setRestoreProgress('done')
                        setTimeout(() => window.location.reload(), 800)
                      })
                    }}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: 'rgba(95, 251, 241, 0.2)',
                      border: '1px solid rgba(95, 251, 241, 0.4)',
                      borderRadius: '10px',
                      color: '#5ffbf1',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Aus letztem Backup wiederherstellen
                    {getBackupTimestamp() && (
                      <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9, marginTop: '0.2rem' }}>
                        Backup: {new Date(getBackupTimestamp()!).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </button>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    Kein Auto-Backup vorhanden (wird alle 5 Sek. erstellt, wenn du im Admin arbeitest).
                  </span>
                )}
              </div>
              {/* Verlauf: letzte Backups */}
              {backupTimestamps.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Verlauf (letzte Backups, neueste zuerst)</div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: '1.5'
                  }}>
                    {backupTimestamps.map((iso, i) => (
                      <li key={iso + i}>
                        {new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                </div>
              )}
            </div>
            )}

            {/* PDFs & Speicherdaten */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>📄 PDFs & Speicherdaten</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                PDF-Export (Galerie, verkaufte Werke), Werke-Daten exportieren/importieren, Speicher prüfen, Cleanup.
              </p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📄 PDFs & Speicherdaten {showExportMenu ? '▲' : '▼'}
                </button>
                {showExportMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    background: 'rgba(18, 22, 35, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    minWidth: '240px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#8fa0c9', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>PDFs</div>
                    <button type="button" onClick={() => { printPDF('galerie'); setShowExportMenu(false) }} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📄 Werke in Galerie</button>
                    <button type="button" onClick={() => { printPDF('verkauft'); setShowExportMenu(false) }} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📄 Verkaufte Werke</button>
                    <div style={{ fontSize: '0.8rem', color: '#8fa0c9', padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Speicherdaten</div>
                    <button type="button" onClick={() => {
                      try {
                        const artworks = JSON.parse(localStorage.getItem(getArtworksKey()) || '[]')
                        const exportData = { artworks, exportedAt: new Date().toISOString(), version: '1.0' }
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `k2-artworks-export-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        setTimeout(() => { try { URL.revokeObjectURL(url) } catch (_) {} }, 1000)
                        alert(`✅ ${artworks.length} Werke exportiert!`)
                      } catch (e) { console.error(e); alert('Fehler beim Export.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: 'rgba(45,106,45,0.3)', border: '1px solid rgba(45,106,45,0.5)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📤 Daten exportieren</button>
                    <button type="button" onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'application/json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          try {
                            const importData = JSON.parse(ev.target?.result as string)
                            if (importData.artworks && Array.isArray(importData.artworks)) {
                              const existing = loadArtworks()
                              const existingIds = new Set(existing.map((a: any) => a.id || a.number))
                              const newArtworks = importData.artworks.filter((a: any) => !existingIds.has(a.id || a.number))
                              if (newArtworks.length === 0) { alert('Keine neuen Werke zum Importieren.'); return }
                              const merged = [...existing, ...newArtworks]
                              if (saveArtworks(merged)) { setAllArtworks(merged); window.dispatchEvent(new CustomEvent('artworks-updated')); alert(`✅ ${newArtworks.length} Werke importiert!`) }
                              else alert('⚠️ Fehler beim Speichern.')
                            } else alert('Ungültiges Format.')
                          } catch (_) { alert('Fehler beim Importieren.') }
                        }
                        reader.readAsText(file)
                      }
                      input.click()
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: 'rgba(45,106,45,0.3)', border: '1px solid rgba(45,106,45,0.5)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📥 Daten importieren</button>
                    <button type="button" onClick={() => {
                      try {
                        let totalSize = 0
                        for (let key in localStorage) { if (localStorage.hasOwnProperty(key)) totalSize += localStorage[key].length + key.length }
                        alert(`localStorage: ${(totalSize / (1024 * 1024)).toFixed(2)} MB (max. ~5–10 MB)`)
                      } catch (_) { alert('Fehler.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📊 Speicher prüfen</button>
                    <button type="button" onClick={() => {
                      try { cleanupUnnecessaryData(); alert('✅ Cleanup abgeschlossen.') } catch (_) { alert('⚠️ Cleanup mit Fehlern.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: 'rgba(102,126,234,0.3)', border: '1px solid rgba(102,126,234,0.5)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>🧹 Cleanup durchführen</button>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Tabs für Stammdaten und Design */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '1rem'
            }}>
              <button
                onClick={() => setSettingsSubTab('stammdaten')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: settingsSubTab === 'stammdaten' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: settingsSubTab === 'stammdaten'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }}
              >
                👥 Stammdaten
              </button>
              <button
                onClick={() => setSettingsSubTab('sicherheit')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: settingsSubTab === 'sicherheit' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: settingsSubTab === 'sicherheit'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }}
              >
                🔒 Sicherheit
              </button>
              <button
                onClick={() => setSettingsSubTab('lager')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: settingsSubTab === 'lager' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: settingsSubTab === 'lager'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }}
              >
                📦 Lager
              </button>
              <button
                onClick={() => setSettingsSubTab('drucker')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: settingsSubTab === 'drucker' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: settingsSubTab === 'drucker'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }}
              >
                🖨️ Drucker
              </button>
            </div>

            {/* Stammdaten Sub-Tab */}
            {settingsSubTab === 'stammdaten' && (
              <div>
                {isOeffentlichAdminContext() && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    background: 'rgba(184, 184, 255, 0.15)',
                    border: '1px solid rgba(184, 184, 255, 0.4)',
                    borderRadius: '8px',
                    color: '#b8b8ff',
                    fontSize: '0.9rem'
                  }}>
                    🔒 Demo-Modus (ök2): Nur Musterdaten – Speichern schreibt keine echten K2-Daten.
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'clamp(1rem, 2.5vw, 1.5rem)',
                  marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)'
                }}>
                  {/* Martina */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '0.5rem'
                    }}>
                      👩‍🎨 {isOeffentlichAdminContext() ? MUSTER_TEXTE.martina.name : (martinaData.name || 'Künstlerin')}
                    </h3>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                        <input
                          type="email"
                          value={martinaData.email || ''}
                          onChange={(e) => setMartinaData({ ...martinaData, email: e.target.value })}
                          placeholder="martina@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                        <input
                          type="tel"
                          value={martinaData.phone || ''}
                          onChange={(e) => setMartinaData({ ...martinaData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Georg */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '0.5rem'
                    }}>
                      👨‍🎨 {isOeffentlichAdminContext() ? MUSTER_TEXTE.georg.name : (georgData.name || 'Künstler')}
                    </h3>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                        <input
                          type="email"
                          value={georgData.email || ''}
                          onChange={(e) => setGeorgData({ ...georgData, email: e.target.value })}
                          placeholder="georg@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                        <input
                          type="tel"
                          value={georgData.phone || ''}
                          onChange={(e) => setGeorgData({ ...georgData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Galerie */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '0.5rem'
                    }}>
                      🏛️ Galerie
                    </h3>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Adresse (Straße, Hausnummer)</label>
                        <input
                          type="text"
                          value={galleryData.address || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, address: e.target.value })}
                          placeholder="z. B. Hauptstraße 12"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Ort (PLZ und Ortsname)</label>
                        <input
                          type="text"
                          value={galleryData.city || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, city: e.target.value })}
                          placeholder="z. B. 1010 Wien"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Land</label>
                        <input
                          type="text"
                          value={galleryData.country || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, country: e.target.value })}
                          placeholder="z. B. Österreich"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                        <input
                          type="tel"
                          value={galleryData.phone || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                        <input
                          type="email"
                          value={galleryData.email || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, email: e.target.value })}
                          placeholder="info@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Website</label>
                        <input
                          type="url"
                          value={galleryData.website || ''}
                          onChange={(e) => {
                            const value = e.target.value.trim()
                            setGalleryData({ 
                              ...galleryData, 
                              website: value
                            })
                          }}
                          placeholder="https://k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem' }}>Bankverbindung / IBAN (für Überweisungszwecke, z. B. Shop)</label>
                        <input
                          type="text"
                          value={galleryData.bankverbindung || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, bankverbindung: e.target.value })}
                          placeholder="z. B. AT12 3456 7890 1234 5678, K2 Galerie"
                          style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={galleryData.internetShopNotSetUp !== false}
                            onChange={(e) => setGalleryData({ ...galleryData, internetShopNotSetUp: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          Hinweis anzeigen: Galerie besuchen & Termin vereinbaren
                        </label>
                        <small style={{ color: '#8fa0c9', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          Wenn aktiv: Im Shop erscheint ein freundlicher Hinweis, dass ein Besuch der Galerie und eine Terminvereinbarung sinnvoll sind. Der Shop bleibt voll nutzbar (Bestellung, Zahlung).
                        </small>
                      </div>
                      <small style={{ color: '#8fa0c9', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                        Bilder und Texte für Willkommensseite & Galerie findest du im <strong>Design</strong>-Tab in der Vorschau – dort auf Text oder Bild klicken zum Bearbeiten.
                      </small>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <button 
                    className="btn-primary" 
                    onClick={saveStammdaten}
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                      width: '100%'
                    }}
                  >
                    💾 Stammdaten speichern
                  </button>
                </div>
              </div>
            )}

            {/* Sicherheit Sub-Tab */}
            {settingsSubTab === 'sicherheit' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#5ffbf1', marginBottom: '1rem' }}>🔒 Sicherheitsabteilung</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                  Admin-Zugang, Passwort-Einstellungen und Zugriffskontrolle.
                </p>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    Verwaltet in Stammdaten (Admin-Passwort). Admin-Login beenden über den Header (👤 Symbol).
                  </p>
                </div>
              </div>
            )}

            {/* Drucker Sub-Tab */}
            {settingsSubTab === 'drucker' && (
              <div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#5ffbf1',
                  marginBottom: '1.5rem'
                }}>
                  🖨️ Drucker-Einstellungen
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {/* Brother QL-820MWBc Einstellungen */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '16px'
                  }}>
                    <h4 style={{
                      marginTop: 0,
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '0.75rem'
                    }}>
                      Drucker &amp; Format (pro Mandant)
                    </h4>

                    <div className="field">
                      <label style={{ fontSize: '0.9rem', color: '#8fa0c9', marginBottom: '0.5rem', display: 'block' }}>
                        Einstellungen für
                      </label>
                      <select
                        value={printerSettingsForTenant}
                        onChange={(e) => setPrinterSettingsForTenant(e.target.value as TenantId)}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          width: '100%'
                        }}
                      >
                        <option value="k2">K2 Galerie</option>
                        <option value="oeffentlich">ök2 (öffentlich)</option>
                        <option value="demo">Demo</option>
                      </select>
                      <p style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.5rem', marginBottom: 0 }}>
                        K2, ök2 und Kassabeleg können jeweils eigenen Drucker und Etikettenformat haben.
                      </p>
                    </div>

                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: '#8fa0c9', marginBottom: '0.5rem', display: 'block' }}>
                          IP-Adresse
                        </label>
                        <input
                          type="text"
                          value={printerSettings.ipAddress}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, ipAddress: v }))
                            savePrinterSetting(printerSettingsForTenant, 'ip', v)
                          }}
                          placeholder="192.168.1.102"
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.5rem', marginBottom: 0 }}>
                          Aktuelle IP: 192.168.1.102 (auf mobilem Gerät als zweiter Router)
                        </p>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: '#8fa0c9', marginBottom: '0.5rem', display: 'block' }}>
                          Drucker-Typ
                        </label>
                        <select
                          value={printerSettings.printerType}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, printerType: v as 'etikettendrucker' | 'standarddrucker' }))
                            savePrinterSetting(printerSettingsForTenant, 'type', v)
                          }}
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        >
                          <option value="etikettendrucker">Etikettendrucker</option>
                          <option value="standarddrucker">Standarddrucker</option>
                        </select>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: '#8fa0c9', marginBottom: '0.5rem', display: 'block' }}>
                          Etikettenformat (Brother)
                        </label>
                        <input
                          type="text"
                          value={printerSettings.labelSize}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, labelSize: v }))
                            savePrinterSetting(printerSettingsForTenant, 'labelSize', v)
                          }}
                          placeholder="29x90,3"
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.5rem', marginBottom: 0 }}>
                          Breite × Höhe in mm (z. B. 29x90,3). Pro Mandant getrennt; Kassabeleg kann anderes Format nutzen.
                        </p>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: '#8fa0c9', marginBottom: '0.5rem', display: 'block' }}>
                          Print-Server URL (One-Click-Druck)
                        </label>
                        <input
                          type="text"
                          value={printerSettings.printServerUrl ?? ''}
                          onChange={(e) => {
                            const v = e.target.value.trim()
                            setPrinterSettings(prev => ({ ...prev, printServerUrl: v }))
                            savePrinterSetting(printerSettingsForTenant, 'printServerUrl', v)
                          }}
                          placeholder="Am Mac: http://localhost:3847 — Im mobilen LAN (192.168.1.x): z.B. http://192.168.1.1:3847"
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.5rem', marginBottom: 0 }}>
                          Optional. Wenn gesetzt: „One-Click drucken“ im Etikett-Modal. Bei Fehlermeldung: One-Click-Anwendung im Projektordner starten: <code style={{ fontSize: '0.75rem' }}>npm run print-server</code> oder <code style={{ fontSize: '0.75rem' }}>node scripts/k2-print-server.js</code>
                        </p>
                      </div>

                      <div style={{
                        padding: '1rem',
                        background: 'rgba(95, 251, 241, 0.1)',
                        border: '1px solid rgba(95, 251, 241, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: '#8fa0c9'
                      }}>
                        <strong style={{ color: '#5ffbf1' }}>ℹ️ Info:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          <li>Drucker funktioniert bereits auf IP 192.168.1.102</li>
                          <li>Zweiter Router auf mobilem Gerät installiert</li>
                          <li>Zugriff von Mac, iPad und Handy möglich</li>
                          <li>Einstellungen werden automatisch gespeichert</li>
                          <li><strong>AirPrint aktiv:</strong> Im Druckdialog Brother wählen (Name ggf. „QL-820NWB“ ohne c). Papier: 29×90,3 mm, 100 %.</li>
                        </ul>
                      </div>

                      <details style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px'
                      }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#5ffbf1' }}>📖 Druck-Anleitung (AirPrint, iPad, Android, One-Click)</summary>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#8fa0c9', lineHeight: 1.6 }}>
                          <p style={{ marginTop: 0 }}><strong>Mac:</strong> Brother per IP hinzufügen (Systemeinstellungen → Drucker &amp; Scanner).</p>
                          <p><strong>iPad/iPhone:</strong> 1) Druck über Mac („Für iOS freigeben“) oder 2) Etikett teilen → Brother iPrint &amp; Label App.</p>
                          <p><strong>Android:</strong> Etikett teilen/herunterladen → Brother iPrint &amp; Label App (Play Store).</p>
                          <p><strong>One-Click:</strong> Print-Server starten (<code>npm run print-server</code>), URL hier eintragen.</p>
                          <p style={{ marginBottom: 0 }}>Ausführlich: <code>DRUCKER-AIRPRINT.md</code> im Projektordner.</p>
                        </div>
                      </details>

                      <button
                        onClick={() => {
                          savePrinterSetting(printerSettingsForTenant, 'ip', printerSettings.ipAddress)
                          savePrinterSetting(printerSettingsForTenant, 'type', printerSettings.printerType)
                          savePrinterSetting(printerSettingsForTenant, 'labelSize', printerSettings.labelSize)
                          savePrinterSetting(printerSettingsForTenant, 'printServerUrl', printerSettings.printServerUrl ?? '')
                          alert(`✅ Drucker & Format für ${printerSettingsForTenant === 'k2' ? 'K2' : printerSettingsForTenant === 'oeffentlich' ? 'ök2' : 'Demo'} gespeichert!`)
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '0.5rem'
                        }}
                      >
                        💾 Einstellungen speichern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Statistiken – jetzt in Kasse-Tab integriert, alter Block deaktiviert */}
        {false && (() => {
          // Echte Statistiken berechnen
          const totalArtworks = allArtworks.length
          const inGalerie = allArtworks.filter((a: any) => a.inExhibition === true).length
          const inShop = allArtworks.filter((a: any) => a.inShop === true).length
          
          // Verkaufte Werke
          let soldCount = 0
          let soldTotal = 0
          try {
            const soldData = localStorage.getItem('k2-sold-artworks')
            if (soldData) {
              const soldArtworks = JSON.parse(soldData as string) as any[]
              soldCount = soldArtworks.length
              // Berechne Gesamtwert der verkauften Werke
              const soldNumbers = new Set<string>(soldArtworks.map((a: any) => a.number).filter((n: unknown): n is string => n != null && n !== ''))
              const soldItems = allArtworks.filter((a: any) => { const n = a.number; if (n == null) return false; return soldNumbers.has(String(n)) })
              soldTotal = soldItems.reduce((sum: number, a: any) => sum + (a.price || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Verkäufe aus Orders
          let ordersCount = 0
          let ordersTotal = 0
          try {
            const ordersData = localStorage.getItem('k2-orders')
            if (ordersData) {
              const orders = JSON.parse(ordersData as string) as any[]
              ordersCount = orders.length
              ordersTotal = orders.reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Kategorien
          const malereiCount = allArtworks.filter((a: any) => a.category === 'malerei').length
          const keramikCount = allArtworks.filter((a: any) => a.category === 'keramik').length

          return (
            <section className="admin-section">
              <h2>Statistiken</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎨</div>
                  <div className="stat-value">{totalArtworks}</div>
                  <div className="stat-label">Werke insgesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏛️</div>
                  <div className="stat-value">{inGalerie}</div>
                  <div className="stat-label">In Galerie</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-value">{inShop}</div>
                  <div className="stat-label">Im Shop</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{soldCount}</div>
                  <div className="stat-label">Verkaufte Werke</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-value">€{ordersTotal.toFixed(2)}</div>
                  <div className="stat-label">Umsatz gesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-value">{ordersCount}</div>
                  <div className="stat-label">Bestellungen</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Kategorien */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Kategorien</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Bilder:</span>
                      <strong>{malereiCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Keramik:</span>
                      <strong>{keramikCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Verkäufe */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Verkäufe</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Verkaufte Werke:</span>
                      <strong>{soldCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Gesamtwert:</span>
                      <strong style={{ color: '#2d6a2d' }}>€{soldTotal.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bestellungen:</span>
                      <strong>{ordersCount}</strong>
                    </div>
                  </div>
                </div>
              </div>
              {/* Verkaufshistorie */}
              <div style={{ marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#8b6914' }}>Letzte Verkäufe</h3>
                <div style={{ marginTop: '1rem' }}>
                  {(() => {
                    try {
                    const ordersData = localStorage.getItem('k2-orders')
                    if (ordersData) {
                        const orders = JSON.parse(ordersData as string) as any[]
                        const recentOrders = orders.slice().reverse().slice(0, 10)
                        
                        if (recentOrders.length === 0) {
                          return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                        }
                        
                        return (
                          <div>
                            {recentOrders.map((order: any, index: number) => (
                              <div key={index} style={{ 
                                padding: '1rem', 
                                background: '#f5f5f5', 
                                borderRadius: '8px', 
                                marginBottom: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <strong>{order.orderNumber}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {new Date(order.date).toLocaleDateString('de-DE', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} • {order.items.length} {order.items.length === 1 ? 'Werk' : 'Werke'}
                                  </small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <strong style={{ color: '#2d6a2d' }}>€{(Number(order?.total) || 0).toFixed(2)}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {order.paymentMethod === 'cash' ? '💵 Bar' : order.paymentMethod === 'card' ? '💳 Karte' : '🏦 Überweisung'}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    } catch (error) {
                      // Ignoriere Fehler
                    }
                    return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                  })()}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Marketing (Eventplanung + Außenkommunikation): Events | Dokumente | Öffentlichkeitsarbeit | Flyer etc. */}
        {activeTab === 'eventplan' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em'
            }}>
              📢 Marketing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
              Außenkommunikation: Eventplanung, Events, Dokumente, Flyer, Öffentlichkeitsarbeit – alles an einem Ort.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {[
                { id: 'events' as const, label: '📅 Events' },
                { id: 'dokumente' as const, label: '📄 Dokumente' },
                { id: 'öffentlichkeitsarbeit' as const, label: '📢 Öffentlichkeitsarbeit' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEventplanSubTab(t.id)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: eventplanSubTab === t.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: eventplanSubTab === t.id ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {eventplanSubTab === 'events' && (
            <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <button
                onClick={openEventModal}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}
              >
                + Event hinzufügen
              </button>
            </div>

            {/* Events Liste */}
            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(3rem, 8vw, 5rem)',
                color: '#8fa0c9'
              }}>
                <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1rem' }}>📅</div>
                <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', margin: 0 }}>
                  Noch keine Events vorhanden
                </p>
                <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', marginTop: '0.5rem', opacity: 0.7 }}>
                  Klicke auf „Event hinzufügen“ oder stelle das Eröffnungsevent 24.–26. April wieder her.
                </p>
                <button
                  type="button"
                  onClick={handleCreateEröffnungsevent}
                  style={{
                    marginTop: '1.5rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  🎉 Eröffnung 24.–26. April wiederherstellen
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {events.map((event) => {
                  const eventIcons: Record<string, string> = {
                    galerieeröffnung: '🎉',
                    vernissage: '🍷',
                    finissage: '👋',
                    öffentlichkeitsarbeit: '📢',
                    sonstiges: '📌'
                  }
                  const eventLabels: Record<string, string> = {
                    galerieeröffnung: 'Galerieeröffnung',
                    vernissage: 'Vernissage',
                    finissage: 'Finissage',
                    öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
                    sonstiges: 'Sonstiges'
                  }
                  
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(1rem, 3vw, 1.5rem)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                            marginBottom: '0.5rem'
                          }}>
                            {eventIcons[event.type] || '📌'}
                          </div>
                          <h3 style={{
                            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                            fontWeight: '600',
                            color: '#ffffff',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {event.title}
                          </h3>
                          <div style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            color: '#8fa0c9',
                            background: 'rgba(102, 126, 234, 0.2)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                          }}>
                            {eventLabels[event.type] || event.type}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        color: '#b8c5e0',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>📅 Datum:</strong> {
                            event.endDate && event.endDate !== event.date
                              ? `${new Date(event.date).toLocaleDateString('de-DE', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })} - ${new Date(event.endDate).toLocaleDateString('de-DE', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}`
                              : new Date(event.date).toLocaleDateString('de-DE', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                          }
                        </div>
                        {(event.startTime || event.endTime || event.time || (event.dailyTimes && Object.keys(event.dailyTimes).length > 0)) && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <strong>🕐 Uhrzeit:</strong> {
                              (() => {
                                const startTime = event.startTime || event.time || ''
                                const endTime = event.endTime || ''
                                const isMultiDay = event.endDate && event.endDate !== event.date
                                const hasDailyTimes = event.dailyTimes && Object.keys(event.dailyTimes).length > 0
                                
                                if (hasDailyTimes && isMultiDay) {
                                  // Zeige tägliche Zeiten
                                  const days = getEventDays(event.date, event.endDate)
                                  return (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      {days.map((day) => {
                                        const dayTime = event.dailyTimes[day]
                                        if (!dayTime) return null
                                        const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                                          weekday: 'short',
                                          day: 'numeric',
                                          month: 'short'
                                        })
                                        let timeDisplay = ''
                                        if (typeof dayTime === 'string') {
                                          // Altes Format (nur Startzeit)
                                          timeDisplay = `${dayTime} Uhr`
                                        } else if (dayTime.start || dayTime.end) {
                                          // Neues Format (Start- und Endzeit)
                                          timeDisplay = dayTime.start 
                                            ? (dayTime.end ? `${dayTime.start} - ${dayTime.end} Uhr` : `${dayTime.start} Uhr`)
                                            : (dayTime.end ? `bis ${dayTime.end} Uhr` : '')
                                        }
                                        if (!timeDisplay) return null
                                        return (
                                          <div key={day} style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                                            {dayLabel}: {timeDisplay}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                } else if (isMultiDay) {
                                  // Mehrere Tage ohne tägliche Zeiten: Zeige Startzeit für ersten Tag und Endzeit für letzten Tag
                                  return startTime && endTime 
                                    ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}) - ${endTime} Uhr (${new Date(event.endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                    : startTime 
                                    ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                    : ''
                                } else {
                                  // Ein Tag: Zeige Start- und Endzeit
                                  return startTime && endTime 
                                    ? `${startTime} - ${endTime} Uhr`
                                    : startTime 
                                    ? `${startTime} Uhr`
                                    : ''
                                }
                              })()
                            }
                          </div>
                        )}
                        {event.location && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <strong>📍 Ort:</strong> {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div style={{ marginTop: '0.75rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                            {event.description}
                          </div>
                        )}
                      </div>

                      {/* Dokumente – bei Galerieeröffnung immer K2 Galerie Flyer (Druckversion) mit anzeigen */}
                      {((event.documents && event.documents.length > 0) || event.type === 'galerieeröffnung') && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '0.5rem'
                          }}>
                            📎 Dokumente ({event.type === 'galerieeröffnung' ? 1 + (event.documents?.length || 0) : (event.documents?.length || 0)})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(() => {
                              const docIcons: Record<string, string> = {
                                flyer: '📄',
                                plakat: '🖼️',
                                presseaussendung: '📰',
                                sonstiges: '📎'
                              }
                              const k2FlyerDoc = event.type === 'galerieeröffnung' ? { id: 'k2-galerie-flyer', name: 'K2 Galerie Flyer (Druckversion)', type: 'flyer', documentUrl: '/flyer-k2-galerie' } : null
                              const list = k2FlyerDoc ? [k2FlyerDoc, ...(event.documents || [])] : (event.documents || [])
                              return list.map((doc: any) => (
                                <div
                                  key={doc.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <span>{docIcons[doc.type] || '📎'}</span>
                                    <span
                                      onClick={() => handleViewEventDocument(doc)}
                                      style={{
                                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                        color: '#5ffbf1',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      {doc.name}
                                    </span>
                                  </div>
                                  {!doc.documentUrl && (
                                    <button
                                      onClick={() => handleDeleteEventDocument(event.id, doc.id)}
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(255, 100, 100, 0.2)',
                                        border: '1px solid rgba(255, 100, 100, 0.3)',
                                        borderRadius: '4px',
                                        color: '#ff6464',
                                        cursor: 'pointer',
                                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                                      }}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(102, 126, 234, 0.2)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          ✏️ Bearbeiten
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventForDocument(event.id)
                            setShowDocumentModal(true)
                          }}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(95, 251, 241, 0.2)',
                            border: '1px solid rgba(95, 251, 241, 0.3)',
                            borderRadius: '8px',
                            color: '#5ffbf1',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          📎 Dokument
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(255, 100, 100, 0.2)',
                            border: '1px solid rgba(255, 100, 100, 0.3)',
                            borderRadius: '8px',
                            color: '#ff6464',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          🗑️ Löschen
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            </>
            )}
          </section>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEventModal(false)
                setEditingEvent(null)
                setEventTitle('')
                setEventType('galerieeröffnung')
                setEventDate('')
                setEventEndDate('')
                setEventStartTime('')
                setEventEndTime('')
                setEventDailyTimes({})
                setEventDescription('')
                setEventLocation('')
                setEventPRSuggestions(null)
                setEditingPRType(null)
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginTop: 0,
                  marginBottom: 0
                }}>
                  {editingEvent ? 'Event-Stammblatt: bearbeiten' : 'Event-Stammblatt: neues Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false)
                    setEditingEvent(null)
                    setEventTitle('')
                    setEventType('galerieeröffnung')
                    setEventDate('')
                    setEventEndDate('')
                    setEventStartTime('')
                    setEventEndTime('')
                    setEventDailyTimes({})
                    setEventDescription('')
                    setEventLocation('')
                    setEventPRSuggestions(null)
                    setEditingPRType(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    lineHeight: 1,
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="z.B. Eröffnung der K2 Galerie"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Event-Typ
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="galerieeröffnung">🎉 Galerieeröffnung</option>
                    <option value="vernissage">🍷 Vernissage</option>
                    <option value="finissage">👋 Finissage</option>
                    <option value="öffentlichkeitsarbeit">📢 Öffentlichkeitsarbeit</option>
                    <option value="sonstiges">📌 Sonstiges</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startdatum *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Enddatum (bei mehrtägigem Event)
                    </label>
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      min={eventDate}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startzeit
                    </label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Endzeit
                    </label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                {/* Anfangs- und Endzeiten pro Tag – Event kann mehrere Tage haben, jeder Tag eigene Zeiten */}
                {eventDate && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(95, 251, 241, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(95, 251, 241, 0.2)'
                  }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#5ffbf1',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '600'
                    }}>
                      🕐 Anfangs- und Endzeiten pro Tag (jeder Tag kann unterschiedliche Zeiten haben)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {getEventDays(eventDate, eventEndDate || eventDate).map((day) => {
                        const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })
                        return (
                          <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{
                                minWidth: '100px',
                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                color: '#b8c5e0',
                                fontWeight: '500'
                              }}>
                                {dayLabel}:
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                    color: '#8fa0c9',
                                    marginBottom: '0.25rem'
                                  }}>
                                    Start
                                  </label>
                                  <input
                                    type="time"
                                    value={typeof eventDailyTimes[day] === 'string' ? eventDailyTimes[day] : (eventDailyTimes[day]?.start || '')}
                                    onChange={(e) => {
                                      const current = eventDailyTimes[day]
                                      const newValue = typeof current === 'string' 
                                        ? { start: e.target.value, end: '' }
                                        : { ...current, start: e.target.value }
                                      setEventDailyTimes({
                                        ...eventDailyTimes,
                                        [day]: newValue
                                      })
                                    }}
                                    placeholder="Start"
                                    style={{
                                      width: '100%',
                                      padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '8px',
                                      color: '#ffffff',
                                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                                    }}
                                  />
                                </div>
                                <span style={{ 
                                  color: '#8fa0c9', 
                                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                  marginTop: '1.5rem'
                                }}>
                                  bis
                                </span>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                    color: '#8fa0c9',
                                    marginBottom: '0.25rem'
                                  }}>
                                    Ende
                                  </label>
                                  <input
                                    type="time"
                                    value={typeof eventDailyTimes[day] === 'string' ? '' : (eventDailyTimes[day]?.end || '')}
                                    onChange={(e) => {
                                      const current = eventDailyTimes[day]
                                      const newValue = typeof current === 'string'
                                        ? { start: current, end: e.target.value }
                                        : { ...current, end: e.target.value }
                                      setEventDailyTimes({
                                        ...eventDailyTimes,
                                        [day]: newValue
                                      })
                                    }}
                                    placeholder="Ende"
                                    style={{
                                      width: '100%',
                                      padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '8px',
                                      color: '#ffffff',
                                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                                    }}
                                  />
                                </div>
                                {(eventDailyTimes[day] && (typeof eventDailyTimes[day] === 'string' || eventDailyTimes[day].start || eventDailyTimes[day].end)) && (
                                  <button
                                    onClick={() => {
                                      const newDailyTimes = { ...eventDailyTimes }
                                      delete newDailyTimes[day]
                                      setEventDailyTimes(newDailyTimes)
                                    }}
                                    style={{
                                      padding: '0.4rem 0.6rem',
                                      background: 'rgba(255, 100, 100, 0.2)',
                                      border: '1px solid rgba(255, 100, 100, 0.3)',
                                      borderRadius: '6px',
                                      color: '#ff6464',
                                      cursor: 'pointer',
                                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                      marginTop: '1.5rem',
                                      height: 'fit-content'
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={async () => {
                        if (editingEvent) {
                          // Aktualisiere das Event direkt mit den neuen täglichen Zeiten
                          const updatedEvents = events.map(e => 
                            e.id === editingEvent.id 
                              ? { ...e, dailyTimes: eventDailyTimes }
                              : e
                          )
                          setEvents(updatedEvents)
                          saveEvents(updatedEvents)
                          
                          // Erstelle ein Dokument mit den täglichen Zeiten
                          const days = getEventDays(eventDate, eventEndDate || eventDate)
                          const timesContent = days
                            .filter(day => eventDailyTimes[day] && (typeof eventDailyTimes[day] === 'string' || eventDailyTimes[day].start || eventDailyTimes[day].end))
                            .map(day => {
                              const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                              const dayTime = eventDailyTimes[day]
                              let timeDisplay = ''
                              if (typeof dayTime === 'string') {
                                timeDisplay = `${dayTime} Uhr`
                              } else if (dayTime.start || dayTime.end) {
                                timeDisplay = dayTime.start 
                                  ? (dayTime.end ? `${dayTime.start} - ${dayTime.end} Uhr` : `${dayTime.start} Uhr`)
                                  : (dayTime.end ? `bis ${dayTime.end} Uhr` : '')
                              }
                              return `<p><strong>${dayLabel}:</strong> ${timeDisplay}</p>`
                            })
                            .join('')
                          
                          if (timesContent) {
                            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tägliche Zeiten - ${editingEvent.title}</title>
  <style>
    @media print {
      body { margin: 0; background: white !important; }
      .no-print { display: none; }
      .page { background: white !important; color: #1a1f3a !important; border: none !important; box-shadow: none !important; }
      h1 { color: #667eea !important; border-bottom-color: #667eea !important; }
      p { color: #333 !important; }
      strong { color: #667eea !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
    }
    h1 {
      font-size: 2rem;
      color: #5ffbf1;
      margin-bottom: 1rem;
      border-bottom: 2px solid rgba(95, 251, 241, 0.3);
      padding-bottom: 0.5rem;
      letter-spacing: 0.02em;
    }
    h2 {
      font-size: 1.3rem;
      color: #5ffbf1;
      margin: 1.5rem 0 1rem;
    }
    p {
      color: #b8c5e0;
      line-height: 1.8;
      margin: 0.75rem 0;
      font-size: 1.1rem;
    }
    strong {
      color: #5ffbf1;
    }
    .no-print {
      text-align: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(95, 251, 241, 0.2);
      border-radius: 12px;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 0 0.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF drucken</button>
  </div>
  <div class="page">
    <h1>🕐 Tägliche Zeiten</h1>
    <h2>${editingEvent.title}</h2>
    <p style="color: #8fa0c9; margin-bottom: 1.5rem;">
      ${new Date(editingEvent.date).toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}${editingEvent.endDate && editingEvent.endDate !== editingEvent.date ? ` - ${new Date(editingEvent.endDate).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}` : ''}
    </p>
    ${timesContent}
  </div>
</body>
</html>
                            `
                            
                            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const documentData = {
                                id: `daily-times-${editingEvent.id}-${Date.now()}`,
                                name: `Tägliche Zeiten - ${editingEvent.title}`,
                                type: 'sonstiges' as const,
                                fileData: reader.result as string,
                                fileName: `tägliche-zeiten-${editingEvent.title.replace(/\s+/g, '-').toLowerCase()}.html`,
                                fileType: 'text/html',
                                addedAt: new Date().toISOString()
                              }
                              
                              const finalEvents = updatedEvents.map(event => {
                                if (event.id === editingEvent.id) {
                                  // Entferne alte "Tägliche Zeiten" Dokumente und füge neues hinzu
                                  const filteredDocs = (event.documents || []).filter((doc: any) => 
                                    !doc.name || !doc.name.includes('Tägliche Zeiten')
                                  )
                                  return {
                                    ...event,
                                    documents: [...filteredDocs, documentData]
                                  }
                                }
                                return event
                              })
                              
                              setEvents(finalEvents)
                              saveEvents(finalEvents)
                              alert('✅ Tägliche Zeiten gespeichert und als Dokument hinzugefügt!')
                            }
                            reader.readAsDataURL(blob)
                          } else {
                            alert('✅ Tägliche Zeiten gespeichert!')
                          }
                        }
                      }}
                      disabled={!editingEvent}
                      style={{
                        marginTop: '1rem',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: editingEvent 
                          ? 'linear-gradient(135deg, rgba(95, 251, 241, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: editingEvent
                          ? '1px solid rgba(95, 251, 241, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: editingEvent ? '#5ffbf1' : '#8fa0c9',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600',
                        cursor: editingEvent ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (editingEvent) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95, 251, 241, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (editingEvent) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95, 251, 241, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      💾 Tägliche Zeiten speichern
                    </button>
                  </div>
                )}

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Ort
                    </label>
                    <button
                      type="button"
                      onClick={applyStammdatenToEvent}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(95, 251, 241, 0.2)',
                        border: '1px solid rgba(95, 251, 241, 0.3)',
                        borderRadius: '6px',
                        color: '#5ffbf1',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                        fontWeight: '500'
                      }}
                    >
                      📋 Aus Stammdaten übernehmen
                    </button>
                  </div>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder={fullAddressFromStammdaten || "z.B. Hauptstraße 12, 1010 Wien, Österreich"}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {fullAddressFromStammdaten && (
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                      color: '#8fa0c9',
                      fontStyle: 'italic'
                    }}>
                      Stammdaten: {fullAddressFromStammdaten}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Beschreibung
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Weitere Details zum Event..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* PR-Vorschläge als Text anzeigen */}
                {eventPRSuggestions && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(95, 251, 241, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                    border: '1px solid rgba(95, 251, 241, 0.2)',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                      fontWeight: '600',
                      color: '#5ffbf1',
                      margin: '0 0 1rem 0'
                    }}>
                      ✨ PR-Vorschläge
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Presseaussendung */}
                      {eventPRSuggestions.presseaussendung?.content && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <button
                            onClick={() => {
                              const event = editingEvent || {
                                id: eventPRSuggestions.eventId,
                                title: eventPRSuggestions.eventTitle,
                                date: eventDate,
                                location: eventLocation
                              }
                              // Öffne bearbeitbares PDF-Fenster
                              generateEditablePresseaussendungPDF(eventPRSuggestions.presseaussendung, event)
                            }}
                            style={{
                              width: '100%',
                              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                              fontWeight: '600',
                              color: '#5ffbf1',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <span>📰</span>
                            <span>Presseaussendung</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>→ PDF öffnen</span>
                          </button>
                          <div style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            color: '#b8c5e0',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            fontFamily: 'inherit'
                          }}>
                            {(eventPRSuggestions.presseaussendung.content || '').split('\n').map((line: string, idx: number) => (
                              <div key={idx} style={{ marginBottom: line.trim() ? '0.5rem' : '0.25rem' }}>
                                {line.trim() || '\u00A0'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Media */}
                      {eventPRSuggestions.socialMedia && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <button
                            onClick={() => {
                              const event = editingEvent || {
                                id: eventPRSuggestions.eventId,
                                title: eventPRSuggestions.eventTitle,
                                date: eventDate,
                                location: eventLocation
                              }
                              generateEditableSocialMediaPDF(eventPRSuggestions.socialMedia, event)
                            }}
                            style={{
                              width: '100%',
                              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                              fontWeight: '600',
                              color: '#5ffbf1',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <span>📱</span>
                            <span>Social Media</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>→ PDF öffnen</span>
                          </button>
                          {eventPRSuggestions.socialMedia.instagram && (
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                color: '#8fa0c9',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                              }}>
                                Instagram:
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                color: '#b8c5e0',
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                fontFamily: 'inherit'
                              }}>
                                {eventPRSuggestions.socialMedia.instagram.split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginBottom: line.trim() ? '0.5rem' : '0.25rem' }}>
                                    {line.trim() || '\u00A0'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {eventPRSuggestions.socialMedia.facebook && (
                            <div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                color: '#8fa0c9',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                              }}>
                                Facebook:
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                color: '#b8c5e0',
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                fontFamily: 'inherit'
                              }}>
                                {((eventPRSuggestions.socialMedia.facebook || '')).split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginBottom: line.trim() ? '0.5rem' : '0.25rem' }}>
                                    {line.trim() || '\u00A0'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Newsletter */}
                      {eventPRSuggestions.newsletter && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <button
                            onClick={() => {
                              const event = editingEvent || {
                                id: eventPRSuggestions.eventId,
                                title: eventPRSuggestions.eventTitle,
                                date: eventDate,
                                location: eventLocation
                              }
                              generateEditableNewsletterPDF(eventPRSuggestions.newsletter, event)
                            }}
                            style={{
                              width: '100%',
                              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                              fontWeight: '600',
                              color: '#5ffbf1',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <span>📧</span>
                            <span>Newsletter</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>→ PDF öffnen</span>
                          </button>
                          {eventPRSuggestions.newsletter.subject && (
                            <div style={{
                              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                              color: '#b8c5e0',
                              marginBottom: '0.75rem',
                              padding: '0.75rem',
                              background: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: '8px'
                            }}>
                              <strong style={{ color: '#8fa0c9' }}>Betreff:</strong> {eventPRSuggestions.newsletter.subject}
                            </div>
                          )}
                          {eventPRSuggestions.newsletter.body && (
                            <div style={{
                              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                              color: '#b8c5e0',
                              lineHeight: '1.8',
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              fontFamily: 'inherit'
                            }}>
                              {((eventPRSuggestions.newsletter.body || '')).split('\n').map((line: string, idx: number) => (
                                <div key={idx} style={{ marginBottom: line.trim() ? '0.5rem' : '0.25rem' }}>
                                  {line.trim() || '\u00A0'}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PR-Vorschläge als PDF exportieren */}
                {eventPRSuggestions && (
                  <button
                    onClick={() => generateEditablePRSuggestionsPDF(eventPRSuggestions, editingEvent)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    📄 PR-Vorschläge als bearbeitbare PDF-Seiten
                  </button>
                )}

                {/* Vorschläge neu generieren Button */}
                {editingEvent && !eventPRSuggestions && (
                  <button
                    onClick={() => {
                      const event = {
                        id: editingEvent.id,
                        title: eventTitle,
                        type: eventType,
                        date: eventDate,
                        endDate: eventEndDate,
                        startTime: eventStartTime,
                        endTime: eventEndTime,
                        description: eventDescription,
                        location: eventLocation
                      }
                      const newSuggestions = {
                        eventId: event.id,
                        eventTitle: event.title,
                        generatedAt: new Date().toISOString(),
                        presseaussendung: generatePresseaussendungContent(event),
                        socialMedia: generateSocialMediaContent(event),
                        flyer: generateFlyerContent(event),
                        newsletter: generateNewsletterContent(event),
                        plakat: generatePlakatContent(event)
                      }
                      setEventPRSuggestions(newSuggestions)
                    }}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, rgba(95, 251, 241, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
                      color: '#5ffbf1',
                      border: '1px solid rgba(95, 251, 241, 0.3)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ✨ PR-Vorschläge generieren
                  </button>
                )}

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleSaveEvent}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {editingEvent ? '✅ Aktualisieren' : '✅ Hinzufügen'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setEventTitle('')
                      setEventType('galerieeröffnung')
                      setEventDate('')
                      setEventEndDate('')
                      setEventStartTime('')
                      setEventEndTime('')
                      setEventDailyTimes({})
                      setEventDescription('')
                      setEventLocation('')
                      setEventPRSuggestions(null)
                      setEditingPRType(null)
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dokumente Modal */}
        {showDocumentModal && selectedEventForDocument && (
          <div
            onClick={() => {
              setShowDocumentModal(false)
              setSelectedEventForDocument(null)
              setEventDocumentFile(null)
              setEventDocumentName('')
              setEventDocumentType('flyer')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginTop: 0,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                📎 Dokument hinzufügen
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Name *
                  </label>
                  <input
                    type="text"
                    value={eventDocumentName}
                    onChange={(e) => setEventDocumentName(e.target.value)}
                    placeholder="z.B. Flyer Eröffnung"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Typ
                  </label>
                  <select
                    value={eventDocumentType}
                    onChange={(e) => setEventDocumentType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="flyer">📄 Flyer</option>
                    <option value="plakat">🖼️ Plakat</option>
                    <option value="presseaussendung">📰 Presseaussendung</option>
                    <option value="sonstiges">📎 Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Datei auswählen *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEventDocumentFile(file)
                        if (!eventDocumentName) {
                          setEventDocumentName(file.name.replace(/\.[^/.]+$/, ''))
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {eventDocumentFile && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                      color: '#5ffbf1'
                    }}>
                      ✓ {eventDocumentFile.name} ({(eventDocumentFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleAddEventDocument}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    ✅ Hinzufügen
                  </button>
                  <button
                    onClick={() => {
                      setShowDocumentModal(false)
                      setSelectedEventForDocument(null)
                      setEventDocumentFile(null)
                      setEventDocumentName('')
                      setEventDocumentType('flyer')
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eventplanung: Öffentlichkeitsarbeit (Marketingabteilung) */}
        {activeTab === 'eventplan' && eventplanSubTab === 'öffentlichkeitsarbeit' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: '#ffffff',
              marginTop: 0,
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              letterSpacing: '-0.01em'
            }}>
              📢 Öffentlichkeitsarbeit
            </h2>

            {/* PR-Vorschläge nach Events gruppiert */}
            {(() => {
              const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
              
              // Events mit Vorschlägen zusammenführen
              const eventsWithSuggestions = events
                .map(event => {
                  const suggestion = suggestions.find((s: any) => s.eventId === event.id)
                  return { event, suggestion }
                })
                .filter(item => item.suggestion) // Nur Events mit Vorschlägen
                .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()) // Neueste zuerst
              
              if (eventsWithSuggestions.length > 0) {
                return (
                  <div style={{
                    marginBottom: 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                      fontWeight: '600',
                      color: '#5ffbf1',
                      margin: '0 0 1.5rem 0'
                    }}>
                      📅 PR-Vorschläge nach Events
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem'
                    }}>
                      {eventsWithSuggestions.map(({ event, suggestion }: any, idx: number) => (
                        <div
                          key={event.id}
                          style={{
                            background: 'linear-gradient(135deg, rgba(95, 251, 241, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                            border: '1px solid rgba(95, 251, 241, 0.2)',
                            borderRadius: '16px',
                            padding: 'clamp(1.5rem, 4vw, 2rem)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Event Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: '0 0 0.5rem 0'
                              }}>
                                {event.title}
                              </h4>
                              <div style={{
                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                color: '#8fa0c9',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem'
                              }}>
                                <span>📅 {new Date(event.date).toLocaleDateString('de-DE', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}</span>
                                {event.location && <span>📍 {event.location}</span>}
                                {event.type && <span>🏷️ {event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : event.type === 'öffentlichkeitsarbeit' ? 'Öffentlichkeitsarbeit' : 'Sonstiges'}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleEditEvent(event)
                                setActiveTab('eventplan')
                              }}
                              style={{
                                padding: '0.4rem 0.75rem',
                                background: 'rgba(102, 126, 234, 0.3)',
                                border: '1px solid rgba(102, 126, 234, 0.5)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ✏️ Event bearbeiten
                            </button>
                          </div>

                          {/* PR-Vorschläge als PDF Button */}
                          <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '12px'
                          }}>
                            <button
                              onClick={() => {
                                const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
                                if (eventSuggestion) {
                                  generateEditablePRSuggestionsPDF(eventSuggestion, event)
                                } else {
                                  alert('Keine PR-Vorschläge für dieses Event gefunden.')
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                              }}
                            >
                              📄 Alle PR-Vorschläge als bearbeitbare PDF-Seiten
                            </button>
                          </div>

                          {/* PR-Medien Grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem'
                          }}>
                            {/* Presseaussendung */}
                            <div
                              onClick={() => {
                                const selectedEvent = events.find(e => e.id === event.id)
                                if (selectedEvent) {
                                  const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                  const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
                                  if (eventSuggestion && eventSuggestion.presseaussendung) {
                                    generateEditablePresseaussendungPDF(eventSuggestion.presseaussendung, selectedEvent)
                                  } else {
                                    const presseaussendung = generatePresseaussendungContent(selectedEvent)
                                    generateEditablePresseaussendungPDF(presseaussendung, selectedEvent)
                                  }
                                }
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📰</div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '500',
                                color: '#ffffff',
                                marginBottom: '0.2rem'
                              }}>
                                Presseaussendung
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#8fa0c9'
                              }}>
                                Generieren
                              </div>
                            </div>

                            {/* Social Media */}
                            <div
                              onClick={() => {
                                const selectedEvent = events.find(e => e.id === event.id)
                                if (selectedEvent) {
                                  const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                  const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
                                  if (eventSuggestion && eventSuggestion.socialMedia) {
                                    generateEditableSocialMediaPDF(eventSuggestion.socialMedia, selectedEvent)
                                  } else {
                                    const socialMedia = generateSocialMediaContent(selectedEvent)
                                    generateEditableSocialMediaPDF(socialMedia, selectedEvent)
                                  }
                                }
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📱</div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '500',
                                color: '#ffffff',
                                marginBottom: '0.2rem'
                              }}>
                                Social Media
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#8fa0c9'
                              }}>
                                Instagram & Facebook
                              </div>
                            </div>

                            {/* Flyer */}
                            <div
                              onClick={() => {
                                const selectedEvent = events.find(e => e.id === event.id)
                                if (selectedEvent) {
                                  const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                  const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
                                  if (eventSuggestion && eventSuggestion.flyer) {
                                    generateEditableNewsletterPDF(eventSuggestion.flyer, selectedEvent)
                                  } else {
                                    const flyer = generateEventFlyerContent(selectedEvent)
                                    generateEditableNewsletterPDF(flyer, selectedEvent)
                                  }
                                }
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📄</div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '500',
                                color: '#ffffff',
                                marginBottom: '0.2rem'
                              }}>
                                Flyer
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#8fa0c9'
                              }}>
                                A4 Format
                              </div>
                            </div>

                            {/* Bei Galerieeröffnung: K2-Galerie-Flyer zum Ausdrucken (statische Druckversion) */}
                            {event.type === 'galerieeröffnung' && (
                              <div
                                onClick={() => window.open('/flyer-k2-galerie', '_blank')}
                                style={{
                                  background: 'rgba(95, 251, 241, 0.1)',
                                  border: '1px solid rgba(95, 251, 241, 0.3)',
                                  borderRadius: '10px',
                                  padding: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.2)'
                                  e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                                  e.currentTarget.style.transform = 'translateY(0)'
                                }}
                              >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🖨️</div>
                                <div style={{
                                  fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                  fontWeight: '500',
                                  color: '#5ffbf1',
                                  marginBottom: '0.2rem'
                                }}>
                                  K2 Galerie Flyer
                                </div>
                                <div style={{
                                  fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                  color: '#8fa0c9'
                                }}>
                                  Zum Ausdrucken öffnen
                                </div>
                              </div>
                            )}

                            {/* Newsletter */}
                            <div
                              onClick={() => {
                                const selectedEvent = events.find(e => e.id === event.id)
                                if (selectedEvent) {
                                  const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                  const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
                                  if (eventSuggestion && eventSuggestion.newsletter) {
                                    generateEditableNewsletterPDF(eventSuggestion.newsletter, selectedEvent)
                                  } else {
                                    const newsletter = generateEmailNewsletterContent(selectedEvent)
                                    generateEditableNewsletterPDF(newsletter, selectedEvent)
                                  }
                                }
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📧</div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '500',
                                color: '#ffffff',
                                marginBottom: '0.2rem'
                              }}>
                                Newsletter
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#8fa0c9'
                              }}>
                                E-Mail HTML
                              </div>
                            </div>

                            {/* Plakat */}
                            <div
                              onClick={() => {
                                console.log('Plakat-Button geklickt für Event:', event)
                                const selectedEvent = events.find(e => e.id === event.id)
                                console.log('Gefundenes Event:', selectedEvent)
                                if (selectedEvent) {
                                  console.log('Rufe generatePlakatForEvent auf...')
                                  generatePlakatForEvent(selectedEvent)
                                } else {
                                  console.error('Kein Event gefunden für ID:', event.id)
                                  alert('Fehler: Event nicht gefunden')
                                }
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🖼️</div>
                              <div style={{
                                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                                fontWeight: '500',
                                color: '#ffffff',
                                marginBottom: '0.2rem'
                              }}>
                                Plakat
                              </div>
                              <div style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#8fa0c9'
                              }}>
                                A3 Format
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#8fa0c9',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                }}>
                  Noch keine PR-Vorschläge vorhanden. Erstelle ein Event, um automatisch Vorschläge zu generieren.
                </div>
              )
            })()}

            {/* QR-Code Plakat (allgemein, nicht Event-spezifisch) */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'rgba(95, 251, 241, 0.1)',
              border: '1px solid rgba(95, 251, 241, 0.2)',
              borderRadius: '16px'
            }}>
              <h3 style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                fontWeight: '600',
                color: '#5ffbf1',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                🏛️ QR-Code Plakat (Galerie)
              </h3>
              <p style={{
                color: '#b8c5e0',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                Erstelle ein Plakat mit QR-Codes für die Homepage und den virtuellen Rundgang. Perfekt zum Aufhängen in der Galerie oder für Veranstaltungen.
              </p>
              <button
                onClick={() => printQRCodePlakat()}
                style={{
                  padding: 'clamp(0.5rem, 1.5vw, 0.65rem) clamp(1rem, 2.5vw, 1.25rem)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                🏛️ QR-Code Plakat erstellen
              </button>
            </div>

            {/* Fallback: Generische Medien-Generatoren (wenn keine Events vorhanden) */}
            {events.length === 0 && (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#8fa0c9',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
              }}>
                Erstelle zuerst ein Event in der Eventplanung, um PR-Vorschläge zu generieren.
              </div>
            )}
          </section>
        )}

        </main>
      </div>

      {/* Kamera-Vollbild-Ansicht */}
      {showCameraView && (
        <div 
          onClick={closeCamera}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              zIndex: 10001
            }}
          >
            <button
              onClick={closeCamera}
              style={{
                padding: '1rem 2rem',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                zIndex: 10002
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={takePicture}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid #333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                zIndex: 10002
              }}
            >
              📸
            </button>
          </div>
          
          {/* X-Button oben rechts */}
          <button
            onClick={closeCamera}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}


      {/* Modal: Veröffentlichung erfolgreich – Button öffnet Vercel (kein Popup-Block) */}
      {publishSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '1rem'
          }}
          onClick={() => setPublishSuccessModal(null)}
        >
          <div
            style={{
              background: '#1a1d24',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(95, 251, 241, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#22c55e', fontSize: '1.2rem' }}>✅ App aktualisiert</h3>
            {typeof window !== 'undefined' && (() => {
              const ua = navigator.userAgent
              const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua)
              const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
              return !isMobileUA && !isTouch && window.innerWidth >= 768
            })() ? (
              <>
                <p style={{ margin: '0 0 0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                  Stammdaten, Werke, Events, Dokumente und Seitentexte sind veröffentlicht ({((publishSuccessModal.size || 0) / 1024).toFixed(1)} KB). In 2–3 Min auf allen Geräten aktuell.
                </p>
                <p style={{ margin: '0 0 0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: '600' }}>
                  Einfach OK drücken.
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  E-Mail bei Ready/Fehler? → vercel.com/account/notifications (evtl. Spam prüfen)
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: '600' }}>
                  Fertig. Einfach OK drücken.
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  E-Mail bei Ready/Fehler? → vercel.com/account/notifications (evtl. Spam prüfen)
                </p>
              </>
            )}
            <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
              Vercel baut in 1–2 Min. E-Mail kommt nur, wenn unter Vercel → Notifications aktiviert.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {typeof window !== 'undefined' && (() => {
                const ua = navigator.userAgent
                const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua)
                const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
                return !isMobileUA && !isTouch && window.innerWidth >= 768
              })() && (
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Vercel-Dashboard öffnen – siehst ob Deployment läuft oder fertig ist"
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  🚀 Vercel öffnen
                </a>
              )}
              <button
                onClick={() => setPublishSuccessModal(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fehlermeldung Veröffentlichen – mit Kopieren-Button für Mobile → Cursor schicken */}
      {publishErrorMsg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '1rem'
          }}
          onClick={() => setPublishErrorMsg(null)}
        >
          <div
            style={{
              background: '#1a1d24',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '1.1rem', fontWeight: 600, color: '#f59e0b' }}>
              ⚠️ Veröffentlichen fehlgeschlagen
            </div>
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              Text antippen → halten → „Kopieren“ wählen (funktioniert auf iPad/iPhone)
            </div>
            <textarea
              readOnly
              value={publishErrorMsg}
              style={{
                flex: 1,
                minHeight: '120px',
                overflow: 'auto',
                padding: '1rem 1.25rem',
                margin: '0 1rem',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                background: '#0f1114',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                resize: 'none',
                fontFamily: 'monospace'
              }}
              onClick={e => e.stopPropagation()}
            />
            <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => {
                  const doCopy = () => {
                    const ta = document.createElement('textarea')
                    ta.value = publishErrorMsg
                    ta.style.position = 'fixed'
                    ta.style.left = '-9999px'
                    document.body.appendChild(ta)
                    ta.select()
                    try {
                      document.execCommand('copy')
                      alert('✅ Kopiert! In Cursor einfügen und an den Assistenten schicken.')
                    } catch {
                      alert('Text antippen, halten, dann „Kopieren“ wählen.')
                    }
                    document.body.removeChild(ta)
                  }
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(publishErrorMsg).then(() => alert('✅ Kopiert! In Cursor einfügen und an den Assistenten schicken.')).catch(doCopy)
                  } else {
                    doCopy()
                  }
                }}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📋 Kopieren (an Cursor schicken)
              </button>
              <button
                onClick={() => setPublishErrorMsg(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Neues Werk hinzufügen - z-index hoch damit es über allem liegt */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
          onClick={() => {
            setShowAddModal(false)
            setEditingArtwork(null)
            setArtworkCategory('malerei')
            setArtworkCeramicSubcategory('vase')
            setArtworkCeramicHeight('10')
            setArtworkCeramicDiameter('10')
            setArtworkCeramicDescription('')
            setArtworkCeramicType('steingut')
            setArtworkCeramicSurface('mischtechnik')
            setArtworkTitle('') // Bei Malerei leer
            setArtworkPaintingWidth('')
            setArtworkPaintingHeight('')
            setArtworkArtist('')
            setArtworkDescription('')
            setArtworkPrice('')
            setSelectedFile(null)
setPreviewUrl(null)
            setPhotoUseFreistellen(true)
            setPhotoBackgroundPreset('hell')
            setIsInShop(true)
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(18, 22, 35, 0.98) 0%, rgba(12, 16, 28, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(95, 251, 241, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Kompakt */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                {editingArtwork ? 'Werk bearbeiten' : 'Neues Werk'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false)
                  setEditingArtwork(null)
                  setArtworkTitle('')
                  setArtworkCategory('malerei')
                  setArtworkCeramicSubcategory('vase')
                  setArtworkCeramicHeight('10')
                  setArtworkCeramicDiameter('10')
                  setArtworkCeramicDescription('')
                  setArtworkPaintingWidth('')
                  setArtworkPaintingHeight('')
                  setArtworkArtist('')
                  setArtworkDescription('')
                  setArtworkPrice('')
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setPhotoUseFreistellen(true)
                  setPhotoBackgroundPreset('hell')
                  setIsInShop(true)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8fa0c9',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8fa0c9'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Content - Kompakt */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Bild-Upload - Sehr kompakt */}
              {previewUrl ? (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="Vorschau" 
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button 
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✏️ Ändern
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(95, 251, 241, 0.3)'
                }}>
                  <label 
                    htmlFor="file-input-upload" 
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      border: 'none',
                      flex: 1
                    }}
                  >
                    📁 Datei
                  </label>
                  <input
                    id="file-input-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <input
                    id="camera-input-direct"
                    type="file"
                    accept="image/*"
                    capture
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      flex: 1
                    }}
                  >
                    📸 Kamera
                  </button>
                </div>
              )}

              {/* Option: Foto freistellen oder Original – nur anzeigen wenn Bild gewählt */}
              {previewUrl && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(95, 251, 241, 0.2)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Bildverarbeitung
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
                      <input
                        type="radio"
                        name="photo-option"
                        checked={photoUseFreistellen}
                        onChange={() => setPhotoUseFreistellen(true)}
                      />
                      Foto freistellen (mit Pro-Hintergrund)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
                      <input
                        type="radio"
                        name="photo-option"
                        checked={!photoUseFreistellen}
                        onChange={() => setPhotoUseFreistellen(false)}
                      />
                      Original benutzen
                    </label>
                  </div>
                  {photoUseFreistellen && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#8fa0c9', display: 'block', marginBottom: '0.35rem' }}>
                        Hintergrund (wirkt wie im professionellen Studio)
                      </span>
                      <select
                        value={photoBackgroundPreset}
                        onChange={(e) => setPhotoBackgroundPreset(e.target.value as 'hell' | 'weiss' | 'warm' | 'kuehl' | 'dunkel')}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#f4f7ff',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          minWidth: '140px'
                        }}
                      >
                        <option value="hell">Studio hell (Standard)</option>
                        <option value="weiss">Studio weiß</option>
                        <option value="warm">Studio warm</option>
                        <option value="kuehl">Studio kühl</option>
                        <option value="dunkel">Studio dunkel</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Formular - Kompakt Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: artworkCategory === 'malerei' ? '1fr 140px' : '140px',
                gap: '0.75rem',
                alignItems: 'start'
              }}>
                {artworkCategory === 'malerei' && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      placeholder="z.B. Frühlingslandschaft"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Kategorie *
                  </label>
                  <select
                    value={artworkCategory}
                    onChange={(e) => {
                      setArtworkCategory(e.target.value as 'malerei' | 'keramik')
                      if (e.target.value === 'keramik') {
                        // Setze Titel automatisch basierend auf Unterkategorie
                        const subcategoryLabels: Record<string, string> = {
                          'vase': 'Gefäße - Vasen',
                          'teller': 'Schalen - Teller',
                          'skulptur': 'Skulptur',
                          'sonstig': 'Sonstig'
                        }
                        setArtworkTitle(subcategoryLabels[artworkCeramicSubcategory] || 'Keramik')
                      } else {
                        setArtworkTitle('')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="malerei">Bilder</option>
                    <option value="keramik">Keramik</option>
                  </select>
                </div>
              </div>
              {/* Keramik-Unterkategorie */}
              {artworkCategory === 'keramik' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  alignItems: 'start'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Unterkategorie *
                    </label>
                    <select
                      value={artworkCeramicSubcategory}
                      onChange={(e) => {
                        const newSubcategory = e.target.value as 'vase' | 'teller' | 'skulptur' | 'sonstig'
                        setArtworkCeramicSubcategory(newSubcategory)
                        setArtworkCeramicHeight('10')
                        setArtworkCeramicDiameter('10')
                        setArtworkCeramicDescription('')
                        setArtworkCeramicType('steingut')
                        setArtworkCeramicSurface('mischtechnik')
                        // Setze Titel automatisch auf Unterkategorie-Bezeichnung
                        const subcategoryLabels: Record<string, string> = {
                          'vase': 'Gefäße - Vasen',
                          'teller': 'Schalen - Teller',
                          'skulptur': 'Skulptur',
                          'sonstig': 'Sonstig'
                        }
                        setArtworkTitle(subcategoryLabels[newSubcategory] || 'Keramik')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="vase">Gefäße - Vasen</option>
                      <option value="teller">Schalen - Teller</option>
                      <option value="skulptur">Skulptur</option>
                      <option value="sonstig">Sonstig</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Beschreibung *
                    </label>
                    <select
                      value={artworkCeramicType}
                      onChange={(e) => setArtworkCeramicType(e.target.value as 'steingut' | 'steinzeug')}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="steingut">Steingut (porös, nicht wasserdicht, niedrig gebrannt)</option>
                      <option value="steinzeug">Steinzeug (dicht gebrannt, wasserundurchlässig)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Oberfläche *
                    </label>
                    <select
                      value={artworkCeramicSurface}
                      onChange={(e) => setArtworkCeramicSurface(e.target.value as 'engobe' | 'glasur' | 'mischtechnik')}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="mischtechnik">Mischtechnik</option>
                      <option value="engobe">Engobe</option>
                      <option value="glasur">Glasur</option>
                    </select>
                  </div>
                </div>
              )}
              {/* Keramik-Maße */}
              {artworkCategory === 'keramik' && (
                <>
                  {(artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') && (
                    <div style={{ minWidth: '120px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Höhe (cm) *
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={artworkCeramicHeight || '10'}
                          onChange={(e) => setArtworkCeramicHeight(e.target.value)}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.2rem',
                          flexWrap: 'wrap'
                        }}>
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
                            <div
                              key={val}
                              style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0.2rem 0.3rem',
                                background: artworkCeramicHeight === String(val) 
                                  ? 'rgba(95, 251, 241, 0.3)' 
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: artworkCeramicHeight === String(val)
                                  ? '1px solid rgba(95, 251, 241, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                color: artworkCeramicHeight === String(val) ? '#5ffbf1' : '#8fa0c9',
                                fontWeight: artworkCeramicHeight === String(val) ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '28px'
                              }}
                              onClick={() => setArtworkCeramicHeight(String(val))}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={artworkCeramicHeight || '10'}
                            onChange={(e) => {
                              const val = e.target.value
                              const numVal = parseFloat(val)
                              // Nur 5cm-Schritte erlauben
                              if (val === '' || (numVal >= 10 && numVal <= 100 && numVal % 5 === 0)) {
                                setArtworkCeramicHeight(val)
                              } else if (numVal >= 10 && numVal <= 100) {
                                // Runde auf nächsten 5cm-Schritt
                                const rounded = Math.round(numVal / 5) * 5
                                setArtworkCeramicHeight(String(rounded))
                              }
                            }}
                            style={{
                              width: '70px',
                              padding: '0.4rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                          <span style={{ color: '#8fa0c9', fontSize: '0.8rem', fontWeight: '600' }}>{artworkCeramicHeight || '10'} cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {artworkCeramicSubcategory === 'teller' && (
                    <div style={{ minWidth: '120px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Durchmesser (cm) *
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={artworkCeramicDiameter || '10'}
                          onChange={(e) => setArtworkCeramicDiameter(e.target.value)}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.2rem',
                          flexWrap: 'wrap'
                        }}>
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
                            <div
                              key={val}
                              style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0.2rem 0.3rem',
                                background: artworkCeramicDiameter === String(val) 
                                  ? 'rgba(95, 251, 241, 0.3)' 
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: artworkCeramicDiameter === String(val)
                                  ? '1px solid rgba(95, 251, 241, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                color: artworkCeramicDiameter === String(val) ? '#5ffbf1' : '#8fa0c9',
                                fontWeight: artworkCeramicDiameter === String(val) ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '28px'
                              }}
                              onClick={() => setArtworkCeramicDiameter(String(val))}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={artworkCeramicDiameter || '10'}
                            onChange={(e) => {
                              const val = e.target.value
                              const numVal = parseFloat(val)
                              // Nur 5cm-Schritte erlauben
                              if (val === '' || (numVal >= 10 && numVal <= 100 && numVal % 5 === 0)) {
                                setArtworkCeramicDiameter(val)
                              } else if (numVal >= 10 && numVal <= 100) {
                                // Runde auf nächsten 5cm-Schritt
                                const rounded = Math.round(numVal / 5) * 5
                                setArtworkCeramicDiameter(String(rounded))
                              }
                            }}
                            style={{
                              width: '70px',
                              padding: '0.4rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                          <span style={{ color: '#8fa0c9', fontSize: '0.8rem', fontWeight: '600' }}>{artworkCeramicDiameter || '10'} cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {artworkCeramicSubcategory === 'sonstig' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Beschreibung *
                      </label>
                      <textarea
                        value={artworkCeramicDescription}
                        onChange={(e) => setArtworkCeramicDescription(e.target.value)}
                        placeholder="Beschreibe das Werk..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Malerei Bildgröße */}
              {artworkCategory === 'malerei' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  alignItems: 'start'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Breite (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={artworkPaintingWidth}
                      onChange={(e) => setArtworkPaintingWidth(e.target.value)}
                      placeholder="z.B. 50"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Höhe (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={artworkPaintingHeight}
                      onChange={(e) => setArtworkPaintingHeight(e.target.value)}
                      placeholder="z.B. 70"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Weitere Felder - Kompakt Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px',
                gap: '0.75rem',
                alignItems: 'start'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Künstler (optional)
                  </label>
                  <input
                    type="text"
                    value={artworkArtist}
                    onChange={(e) => setArtworkArtist(e.target.value)}
                    placeholder={artworkCategory === 'malerei' ? 'Martina Kreinecker' : 'Georg Kreinecker'}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Preis (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={artworkPrice}
                    onChange={(e) => setArtworkPrice(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Beschreibung */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontSize: '0.8rem',
                  color: '#8fa0c9',
                  fontWeight: '500'
                }}>
                  Beschreibung (optional)
                </label>
                <textarea
                  value={artworkDescription}
                  onChange={(e) => setArtworkDescription(e.target.value)}
                  placeholder="Optionale Beschreibung..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Shop-Checkbox */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                }}
                >
                  <input
                    type="checkbox"
                    checked={isInShop}
                    onChange={(e) => setIsInShop(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#8fa0c9' }}>
                    Im Online-Shop verfügbar
                  </span>
                </label>
              </div>

              {/* Aktionen - Kompakt */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingArtwork(null)
                    setArtworkTitle('')
                    setArtworkCategory('malerei')
                    setArtworkCeramicSubcategory('vase')
                    setArtworkCeramicHeight('10')
                    setArtworkCeramicDiameter('10')
                    setArtworkCeramicDescription('')
                    setArtworkPaintingWidth('')
                    setArtworkPaintingHeight('')
                    setArtworkArtist('')
                    setArtworkDescription('')
                    setArtworkPrice('')
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setIsInShop(true)
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleSaveArtwork}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  💾 Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Druck-Modal – auf Mobil: Buttons zuerst, kurzer Weg (ein Tipp = Download) */}
      {showPrintModal && savedArtwork && (
        <div className="admin-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Etikett drucken</h2>
              <button className="admin-modal-close" onClick={() => setShowPrintModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              <div style={{ textAlign: 'center', padding: isMobile ? '0.75rem' : '1rem' }}>
                <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold', color: '#8b6914', marginBottom: isMobile ? '0.5rem' : '0.75rem' }}>
                  {savedArtwork.number}
                </div>
                {/* Mobil: Zuverlässige Methode zuerst – Speichern → iPrint&Label. Safari-AirPrint oft falsche Skalierung. */}
                <div className="admin-modal-actions" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'stretch', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                  {isMobile ? (
                    <>
                      <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                        Auf dem iPad: So passt die Größe garantiert
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadEtikettDirect}
                        style={{
                          padding: '1.25rem 1.5rem',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                          touchAction: 'manipulation'
                        }}
                      >
                        📥 Etikett speichern → in Brother iPrint&amp;Label drucken
                      </button>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.35rem 0 0 0' }}>
                        Teilen-Menü öffnet sich → „In Fotos speichern“ oder <strong>Brother iPrint&amp;Label</strong> wählen → Drucken.
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                        Wenn „Daten können nicht freigegeben werden“ erscheint: <button type="button" onClick={async () => { try { const b = await getEtikettBlob(); const u = URL.createObjectURL(b); window.open(u, '_blank'); setTimeout(() => URL.revokeObjectURL(u), 60000); } catch (e) { alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden.'); } }} style={{ background: 'none', border: 'none', color: '#16a34a', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Etikett in neuem Tab öffnen</button> → im Tab langes Drücken auf das Bild → „Bild speichern“. Dann in iPrint&amp;Label öffnen.
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.75rem' }}>
                        Oder direkt über Safari:
                      </p>
                      <button
                        type="button"
                        onClick={() => { handlePrint(); setShowPrintModal(false); }}
                        style={{ padding: '0.75rem 1rem', fontSize: '0.95rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#475569', cursor: 'pointer' }}
                      >
                        🖨️ Jetzt drucken (Safari – Skalierung kann abweichen)
                      </button>
                      <button className="btn-secondary" onClick={() => setShowPrintModal(false)} style={{ marginTop: '0.5rem' }}>
                        Später drucken
                      </button>
                      <details style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                        <summary style={{ cursor: 'pointer' }}>Optional: One-Click (nur wenn Print-Server vor Ort läuft)</summary>
                        <p style={{ margin: '0.35rem 0 0 0' }}>Braucht ein Gerät im gleichen WLAN wie Tablet und Drucker mit laufendem Print-Server.</p>
                        <button
                          type="button"
                          disabled={oneClickPrinting}
                          onClick={(e) => {
                            e.preventDefault()
                            const url = (loadPrinterSettingsForTenant(getCurrentTenantId()).printServerUrl || '').trim()
                            if (url) handleOneClickPrint()
                            else alert('Einstellungen → Drucker → Print-Server URL eintragen (IP des Geräts vor Ort, z. B. http://192.168.1.1:3847)')
                          }}
                          style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '8px', color: '#16a34a', cursor: oneClickPrinting ? 'wait' : 'pointer' }}
                        >
                          {oneClickPrinting ? '⏳ Wird gesendet …' : '⚡ One-Click drucken'}
                        </button>
                      </details>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={oneClickPrinting}
                        onClick={(e) => {
                          e.preventDefault()
                          const url = (loadPrinterSettingsForTenant(getCurrentTenantId()).printServerUrl || '').trim()
                          if (url) handleOneClickPrint()
                          else alert('Einstellungen → Drucker → Print-Server URL eintragen (z. B. http://localhost:3847)')
                        }}
                        style={{ padding: '0.6rem 1rem', fontWeight: 600, background: oneClickPrinting ? 'rgba(34, 197, 94, 0.6)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '8px', color: '#fff', cursor: oneClickPrinting ? 'wait' : 'pointer' }}
                      >
                        {oneClickPrinting ? '⏳ Wird gesendet …' : '⚡ One-Click drucken'}
                      </button>
                      <button type="button" onClick={handleShareLabel} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: '1px solid #16a34a', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        📤 Etikett teilen
                      </button>
                      <button type="button" onClick={handleDownloadEtikettDirect} className="btn-secondary">⬇️ Herunterladen</button>
                      <button className="btn-primary" onClick={handlePrint}>🖨️ Jetzt drucken</button>
                      <button className="btn-secondary" onClick={() => setShowPrintModal(false)}>Später drucken</button>
                    </>
                  )}
                </div>
                {/* Vorschau kompakt */}
                {(() => {
                  const printTenant = getCurrentTenantId()
                  const previewSettings = loadPrinterSettingsForTenant(printTenant)
                  const lm = parseLabelSize(previewSettings.labelSize)
                  const scale = isMobile ? 3 : 4
                  const pw = Math.round(lm.width * scale)
                  const ph = Math.round(lm.height * scale)
                  return (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '2px' }}>
                        Vorschau ({previewSettings.labelSize} mm)
                      </div>
                      <div style={{
                        width: pw + 'px',
                        height: ph + 'px',
                        margin: '0 auto',
                        border: '1px solid #8b6914',
                        borderRadius: '4px',
                        padding: '4px',
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                      }}>
                        <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#8b6914' }}>K2 Galerie</div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#8b6914' }}>{savedArtwork.number}</div>
                        <div style={{ fontSize: '6px', color: '#666', textAlign: 'center', wordBreak: 'break-word', maxWidth: '100%' }}>
                          {(savedArtwork.title || '').substring(0, 18)}{(savedArtwork.title || '').length > 18 ? '…' : ''}
                        </div>
                        <div style={{ minWidth: '66px', minHeight: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                          <img src={getQRCodeUrl(savedArtwork.number)} alt="QR" style={{ width: '66px', height: '66px', display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '6px', color: '#999' }}>
                          {savedArtwork.category === 'malerei' ? 'Bilder' : 'Keramik'} • {(savedArtwork.artist || '').substring(0, 10)}
                        </div>
                      </div>
                    </div>
                  )
                })()}
                <details style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'left' }}>
                  <summary style={{ cursor: 'pointer' }}>Werk-Details</summary>
                  <div style={{ padding: '0.5rem 0', borderTop: '1px solid #eee', marginTop: '0.25rem' }}>
                    <p style={{ margin: '0.25rem 0' }}><strong>Kategorie:</strong> {savedArtwork.category === 'malerei' ? 'Bilder' : 'Keramik'}</p>
                    <p style={{ margin: '0.25rem 0' }}><strong>Künstler:</strong> {savedArtwork.artist}</p>
                    {savedArtwork.category === 'malerei' && savedArtwork.paintingWidth && savedArtwork.paintingHeight && (
                      <p style={{ margin: '0.25rem 0' }}><strong>Größe:</strong> {savedArtwork.paintingWidth} × {savedArtwork.paintingHeight} cm</p>
                    )}
                    {savedArtwork.category === 'keramik' && (savedArtwork.ceramicHeight || savedArtwork.ceramicDiameter) && (
                      <p style={{ margin: '0.25rem 0' }}>
                        {savedArtwork.ceramicSubcategory === 'teller' ? `Ø ${savedArtwork.ceramicDiameter} cm` : `H ${savedArtwork.ceramicHeight} cm`}
                      </p>
                    )}
                  </div>
                </details>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  AirPrint (QL-820NWBc): „Jetzt drucken“ → Brother wählen (im Dialog ggf. „QL-820NWB“ ohne c). Papier: 29×90,3 mm, 100 %.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etikett-Druck: ein Bild im Hauptfenster (nur bei Druck sichtbar, index.css @media print) */}
      {printLabelData && typeof document !== 'undefined' && document.body && createPortal(
        <div
          id="k2-print-label"
          style={{
            display: 'none',
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${printLabelData.widthMm}mm`,
            height: `${printLabelData.heightMm}mm`,
            background: '#fff'
          }}
          aria-hidden="true"
        >
          <img
            src={printLabelData.url}
            alt={`Etikett ${savedArtwork?.number || ''}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>,
        document.body
      )}

      {/* Teilen-Fallback Overlay: Bild + „Etikett teilen“ oder „Etikett herunterladen“ (neutral, kein blaues Rahmen) */}
      {showShareFallbackOverlay && shareFallbackImageUrl && savedArtwork && (
        <div className="admin-modal-overlay" onClick={closeShareFallbackOverlay}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="admin-modal-header">
              <h2>{canUseShare ? 'Etikett teilen' : 'Etikett herunterladen'}</h2>
              <button className="admin-modal-close" onClick={closeShareFallbackOverlay}>×</button>
            </div>
            <div className="admin-modal-content" style={{ padding: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#8b6914' }}>Etikett {savedArtwork.number}</p>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, margin: '0.5rem 0' }}>
                <img src={shareFallbackImageUrl} alt="Etikett" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', border: 'none', outline: 'none' }} />
              </div>
              {canUseShare ? (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.75rem 0' }}>→ Brother iPrint &amp; Label wählen</p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.75rem 0' }}>Datei öffnen → Brother iPrint &amp; Label → Drucken</p>
              )}
              <button
                type="button"
                onClick={handleShareFromFallbackOverlay}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {canUseShare ? '📤 Etikett teilen' : '⬇️ Etikett herunterladen'}
              </button>
              <button type="button" className="btn-secondary" onClick={closeShareFallbackOverlay} style={{ marginTop: '0.5rem' }}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verkaufs-Modal */}
      {showSaleModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Werk als verkauft markieren</h2>
              <button className="admin-modal-close" onClick={() => setShowSaleModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              {/* Methode wählen */}
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Methode</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className={saleMethod === 'scan' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('scan')}
                    style={{ flex: 1 }}
                  >
                    📷 QR-Code scannen
                  </button>
                  <button
                    className={saleMethod === 'manual' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('manual')}
                    style={{ flex: 1 }}
                  >
                    ⌨️ Seriennummer eingeben
                  </button>
                </div>
              </div>

              {/* QR-Code Scanner */}
              {saleMethod === 'scan' && (
                <div className="scan-area">
                  <div className="upload-placeholder" style={{ padding: '2rem' }}>
                    <div className="upload-icon">📷</div>
                    <p>QR-Code mit Kamera scannen</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // QR-Code aus Bild lesen
                          const qrText = await readQRCodeFromImage(file)
                          if (qrText) {
                            // QR-Code enthält Werk-Nummer oder URL
                            const match = qrText.match(/K2-\d{4}/) || qrText.match(/werk=([^&]+)/)
                            if (match) {
                              const artworkNum = match[1] || match[0]
                              handleMarkAsSold(artworkNum)
                            } else {
                              alert('QR-Code konnte nicht gelesen werden. Bitte Seriennummer manuell eingeben.')
                              setSaleMethod('manual')
                            }
                          } else {
                            // Fallback: Manuelle Eingabe
                            alert('QR-Code-Scan: Bitte Seriennummer manuell eingeben.\n\nFormat: K2-0001')
                            setSaleMethod('manual')
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                      id="qr-scanner-input"
                    />
                    <label htmlFor="qr-scanner-input" className="btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>
                      📷 Kamera öffnen
                    </label>
                    <p className="upload-hint" style={{ marginTop: '1rem' }}>
                      Auf iPhone/iPad: Kamera öffnet sich automatisch
                    </p>
                  </div>
                </div>
              )}

              {/* Seriennummer Eingabe */}
              {saleMethod === 'manual' && (
                <div className="field">
                  <label>Seriennummer eingeben</label>
                  <input
                    type="text"
                    value={saleInput}
                    onChange={(e) => setSaleInput(e.target.value.toUpperCase())}
                    placeholder="z.B. K2-0001"
                    style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && saleInput.trim()) {
                        handleMarkAsSold(saleInput.trim())
                      }
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Format: K2-0001, K2-0002, etc.
                  </small>
                </div>
              )}

              {/* Aktionen */}
              <div className="admin-modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowSaleModal(false)
                  setSaleInput('')
                  setSaleMethod('scan')
                }}>
                  Abbrechen
                </button>
                {saleMethod === 'manual' && saleInput.trim() && (
                  <button className="btn-primary" onClick={() => handleMarkAsSold(saleInput.trim())}>
                    Als verkauft markieren
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXPORT-BLOCK - KRITISCH: NUR EINMAL EXPORTIEREN!
// ============================================================================
// ⚠️ WICHTIG: Doppelte Exports verursachen Build-Fehler!
// ⚠️ Diese Zeilen NICHT duplizieren oder kopieren!
// ⚠️ Vite Plugin prüft automatisch auf Duplikate beim Build!
// ============================================================================
export default ScreenshotExportAdmin
export { ScreenshotExportAdmin }
// ============================================================================