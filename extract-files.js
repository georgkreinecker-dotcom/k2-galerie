const fs = require('fs');
const path = require('path');

console.log('🎨 K2 Galerie Export Extractor\n');

const exportData = JSON.parse(fs.readFileSync('k2-export.json', 'utf8'));

console.log('📦 Extrahiere', exportData.meta.totalFiles, 'Dateien...\n');

exportData.files.forEach((file, index) => {
  const filePath = file.path;
  const dirPath = path.dirname(filePath);

  if (dirPath !== '.') {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, file.content, 'utf8');
  console.log(`✅ [${index + 1}/${exportData.meta.totalFiles}] ${filePath}`);
});

console.log('\n🎉 Fertig! Alle Dateien extrahiert!');
