# 🔍 RAM-ANALYSE: Cursor Reopen Problem

## 📊 Mögliche Ursachen für RAM-Probleme

### 1. **Viele setTimeout/setInterval ohne sauberes Cleanup**
- **Gefunden**: Über 60 `setTimeout` Aufrufe in `ScreenshotExportAdmin.tsx`
- **Problem**: Nicht alle werden in `useRef` gespeichert für Cleanup
- **Risiko**: Memory Leaks wenn Component unmountet

### 2. **Event Listener ohne Cleanup**
- **Gefunden**: 31 `addEventListener` Aufrufe
- **Gefunden**: 21 `removeEventListener` Aufrufe
- **Problem**: Nicht alle werden aufgeräumt beim Unmount
- **Risiko**: Event Listener bleiben im Speicher

### 3. **localStorage kann sehr groß werden**
- **Problem**: Bilder werden als Base64 in localStorage gespeichert
- **Risiko**: Bei vielen Bildern kann localStorage > 10MB werden
- **Aktuell**: Wir prüfen bereits die Größe, aber nicht aggressiv genug

### 4. **PDF Windows bleiben im Speicher**
- **Gefunden**: `openPDFWindows` Array speichert alle PDF-Fenster
- **Problem**: Fenster werden nicht immer sauber geschlossen
- **Risiko**: Browser-Fenster bleiben im RAM

## 🛠️ Lösungen

### ✅ Sofort umsetzbar:

1. **RAM-Check Script ausführen**:
   ```bash
   ./check-ram.sh
   ```

2. **Cursor RAM prüfen**:
   - Activity Monitor öffnen
   - Nach "Cursor" suchen
   - Wenn > 2GB: Cursor neu starten

3. **localStorage aufräumen**:
   - In Browser Console:
   ```javascript
   // Prüfe Größe
   let total = 0;
   for (let key in localStorage) {
     total += localStorage[key].length;
   }
   console.log('localStorage Größe:', (total / 1024 / 1024).toFixed(2), 'MB');
   
   // Wenn > 5MB: Aufräumen
   if (total > 5 * 1024 * 1024) {
     // Alte Bilder löschen
     localStorage.removeItem('k2-artworks');
     console.log('✅ localStorage aufgeräumt');
   }
   ```

### 🔧 Code-Verbesserungen (bereits implementiert):

1. ✅ `isMountedRef` für alle State-Updates
2. ✅ Cleanup in `useEffect` return functions
3. ✅ `safeMode.ts` für Crash-Schutz
4. ✅ localStorage Größen-Prüfung

### 📋 Empfohlene Maßnahmen:

1. **Cursor regelmäßig neu starten** (alle 2-3 Stunden)
2. **Browser-Tabs schließen** wenn nicht benötigt
3. **Dev-Server neu starten** wenn RAM hoch ist
4. **localStorage regelmäßig aufräumen**

## 🎯 Nächste Schritte

1. Führe `./check-ram.sh` aus um aktuellen RAM-Verbrauch zu sehen
2. Prüfe Activity Monitor für Cursor RAM
3. Wenn Cursor > 2GB: Sofort neu starten
4. Teste ob Reopen-Problem nach RAM-Reduktion besser wird
