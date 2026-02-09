// Script zum Schreiben der gallery-data.json in den public Ordner
// Wird beim Build automatisch ausgeführt
const fs = require('fs')
const path = require('path')

// Prüfe ob export-Daten existieren (aus localStorage Export)
const exportDataPath = path.join(__dirname, '..', 'gallery-data-export.json')
const publicPath = path.join(__dirname, '..', 'public', 'gallery-data.json')

// Wenn Export-Datei existiert, kopiere sie nach public
if (fs.existsSync(exportDataPath)) {
  try {
    const data = fs.readFileSync(exportDataPath, 'utf8')
    fs.writeFileSync(publicPath, data, 'utf8')
    console.log('✅ gallery-data.json nach public kopiert')
  } catch (error) {
    console.error('❌ Fehler beim Kopieren:', error)
  }
} else {
  // Erstelle leere Datei falls nicht vorhanden
  const emptyData = {
    martina: { name: 'Martina Kreinecker', email: '', phone: '' },
    georg: { name: 'Georg Kreinecker', email: '', phone: '' },
    gallery: { address: '', phone: '', email: '', website: 'www.k2-galerie.at', internetadresse: '', adminPassword: 'k2Galerie2026', welcomeImage: '', virtualTourImage: '' },
    artworks: [],
    events: [],
    documents: [],
    designSettings: {},
    exportedAt: new Date().toISOString()
  }
  fs.writeFileSync(publicPath, JSON.stringify(emptyData, null, 2), 'utf8')
  console.log('✅ Leere gallery-data.json erstellt')
}
