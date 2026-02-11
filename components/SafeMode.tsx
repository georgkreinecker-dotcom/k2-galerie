// Safe Mode: Prüft localStorage-Größe und verhindert Crashes
export function checkLocalStorageSize(): { size: number, limit: number, percentage: number, needsCleanup: boolean } {
  let totalSize = 0
  const limit = 5 * 1024 * 1024 // 5MB Limit (Browser hat meist 5-10MB)
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        totalSize += key.length + value.length
      }
    }
  } catch (e) {
    console.error('Fehler beim Prüfen der localStorage-Größe:', e)
  }
  
  const percentage = (totalSize / limit) * 100
  const needsCleanup = totalSize > limit * 0.8 // Warnung bei 80%
  
  return { size: totalSize, limit, percentage, needsCleanup }
}

export function cleanupLargeImages(): number {
  let cleaned = 0
  const { size } = checkLocalStorageSize()
  const isVeryFull = size > 4 * 1024 * 1024 // Über 4MB = sehr voll
  
  // Prüfe alle localStorage Keys
  const allKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) allKeys.push(key)
  }
  
  // Priorisiere große Keys
  const keysWithSize = allKeys.map(key => ({
    key,
    size: (key.length + (localStorage.getItem(key)?.length || 0))
  })).sort((a, b) => b.size - a.size)
  
  // Bereinige die größten Keys zuerst
  for (const { key, size: keySize } of keysWithSize) {
    if (keySize < 100000) continue // Überspringe kleine Keys (<100KB)
    
    try {
      const data = localStorage.getItem(key)
      if (!data || data.length < 100000) continue // Überspringe kleine Daten
      
      const parsed = JSON.parse(data)
      
      // Für artworks: Aggressives Cleanup
      if (Array.isArray(parsed)) {
        const originalLength = parsed.length
        let cleanedArray = parsed.map((item: any) => {
          // Entferne Bilder ab 200KB (nicht nur 500KB!)
          if (item.imageUrl && item.imageUrl.length > 200000) {
            console.log(`🗑️ Entferne Bild von Werk ${item.number || item.id} (${(item.imageUrl.length / 1024).toFixed(0)}KB)`)
            cleaned++
            return { ...item, imageUrl: '' }
          }
          if (item.image && item.image.length > 200000) {
            cleaned++
            return { ...item, image: '' }
          }
          return item
        })
        
        // Sortiere nach Datum
        const sorted = cleanedArray.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        
        // Aggressiv: Behalte nur 15 neueste Werke wenn sehr voll, sonst 20
        const maxWorks = isVeryFull ? 15 : 20
        const finalArray = sorted.length > maxWorks ? sorted.slice(0, maxWorks) : sorted
        
        const removedCount = originalLength - finalArray.length
        if (removedCount > 0) {
          cleaned += removedCount
          console.log(`✅ Cleanup: ${removedCount} alte Werke entfernt (von ${originalLength} auf ${finalArray.length})`)
        }
        
        localStorage.setItem(key, JSON.stringify(finalArray))
        
      } else if (parsed.welcomeImage || parsed.virtualTourImage) {
        // Für gallery data: Entferne große Bilder ab 200KB
        let changed = false
        if (parsed.welcomeImage && parsed.welcomeImage.length > 200000) {
          parsed.welcomeImage = ''
          cleaned++
          changed = true
        }
        if (parsed.virtualTourImage && parsed.virtualTourImage.length > 200000) {
          parsed.virtualTourImage = ''
          cleaned++
          changed = true
        }
        if (changed) {
          localStorage.setItem(key, JSON.stringify(parsed))
        }
      }
    } catch (e) {
      console.warn(`Fehler beim Bereinigen von ${key}:`, e)
    }
  }
  
  return cleaned
}

export function getLocalStorageReport(): string {
  const { size, limit, percentage, needsCleanup } = checkLocalStorageSize()
  const sizeMB = (size / 1024 / 1024).toFixed(2)
  const limitMB = (limit / 1024 / 1024).toFixed(2)
  
  return `localStorage: ${sizeMB}MB / ${limitMB}MB (${percentage.toFixed(1)}%)${needsCleanup ? ' ⚠️ BRAUCHT BEREINIGUNG' : ''}`
}
