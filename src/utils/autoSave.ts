/**
 * AUTO-SAVE SYSTEM - Speichert automatisch bei jedem Change
 * Verhindert Datenverlust bei Cursor-Crashes
 */

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
      
      // Speichere alle Daten in localStorage
      if (data.martina) {
        localStorage.setItem('k2-stammdaten-martina', JSON.stringify(data.martina))
      }
      if (data.georg) {
        localStorage.setItem('k2-stammdaten-georg', JSON.stringify(data.georg))
      }
      if (data.gallery) {
        localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(data.gallery))
      }
      if (data.artworks) {
        try {
          localStorage.setItem('k2-artworks', JSON.stringify(data.artworks))
        } catch (e) {
          console.warn('⚠️ Artworks zu groß für Auto-Save')
        }
      }
      if (data.events) {
        try {
          localStorage.setItem('k2-events', JSON.stringify(data.events))
        } catch (e) {
          console.warn('⚠️ Events zu groß für Auto-Save')
        }
      }
      if (data.documents) {
        try {
          localStorage.setItem('k2-documents', JSON.stringify(data.documents))
        } catch (e) {
          console.warn('⚠️ Documents zu groß für Auto-Save')
        }
      }
      if (data.designSettings) {
        localStorage.setItem('k2-design-settings', JSON.stringify(data.designSettings))
      }
      
      // Speichere Timestamp
      localStorage.setItem('k2-last-auto-save', new Date().toISOString())
      
      console.log('💾 Auto-Save erfolgreich')
    } catch (error) {
      console.error('❌ Auto-Save Fehler:', error)
    }
  }, AUTO_SAVE_INTERVAL)
  
  console.log('✅ Auto-Save gestartet (alle 5 Sekunden)')
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
 * Speichere sofort (ohne auf Timer zu warten)
 */
export function saveNow(getData: () => AutoSaveData) {
  try {
    const data = getData()
    
    if (data.martina) {
      localStorage.setItem('k2-stammdaten-martina', JSON.stringify(data.martina))
    }
    if (data.georg) {
      localStorage.setItem('k2-stammdaten-georg', JSON.stringify(data.georg))
    }
    if (data.gallery) {
      localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(data.gallery))
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
