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
  const keys = ['k2-stammdaten-galerie', 'k2-artworks']
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data && data.length > 1000000) { // Über 1MB
        const parsed = JSON.parse(data)
        
        // Entferne große Bilder
        if (Array.isArray(parsed)) {
          // Für artworks
          const cleanedArray = parsed.map((item: any) => {
            if (item.image && item.image.length > 500000) {
              return { ...item, image: '' }
            }
            return item
          })
          localStorage.setItem(key, JSON.stringify(cleanedArray))
          cleaned++
        } else if (parsed.welcomeImage || parsed.virtualTourImage) {
          // Für gallery data
          if (parsed.welcomeImage && parsed.welcomeImage.length > 500000) {
            parsed.welcomeImage = ''
            cleaned++
          }
          if (parsed.virtualTourImage && parsed.virtualTourImage.length > 500000) {
            parsed.virtualTourImage = ''
            cleaned++
          }
          localStorage.setItem(key, JSON.stringify(parsed))
        }
      }
    } catch (e) {
      console.warn(`Fehler beim Bereinigen von ${key}:`, e)
    }
  })
  
  return cleaned
}

export function getLocalStorageReport(): string {
  const { size, limit, percentage, needsCleanup } = checkLocalStorageSize()
  const sizeMB = (size / 1024 / 1024).toFixed(2)
  const limitMB = (limit / 1024 / 1024).toFixed(2)
  
  return `localStorage: ${sizeMB}MB / ${limitMB}MB (${percentage.toFixed(1)}%)${needsCleanup ? ' ⚠️ BRAUCHT BEREINIGUNG' : ''}`
}
