# K2TEAM - GIT/VERCEL PROBLEM-ANALYSE

**Erstellt:** 9. Februar 2026  
**Version:** 1.0  
**Status:** Kritische Analyse

---

## 🔍 BEobachtung

**Während lokalem Arbeiten:**
- ✅ Code-Änderungen in Cursor → **KEINE Abstürze**
- ✅ Dokumentation erstellen → **KEINE Abstürze**
- ✅ Struktur-Änderungen → **KEINE Abstürze**
- ✅ Handbuch erstellen → **KEINE Abstürze**

**Sobald Git/Vercel ins Spiel kommt:**
- ❌ Git Push Operationen → **Probleme**
- ❌ Vercel-Deployment → **Probleme**
- ❌ API-Endpoints mit Git-Operationen → **Probleme**

---

## 🎯 ANALYSE: Was ist anders?

### Lokales Arbeiten (STABIL):
- **Operationen:** Datei schreiben, Code ändern, lesen
- **Komplexität:** Niedrig
- **Dauer:** Kurz (< 1 Sekunde)
- **Netzwerk:** Keine externen Calls
- **Prozesse:** Nur lokale Datei-Operationen

### Git/Vercel Operationen (PROBLEMATISCH):
- **Operationen:** `execSync('git push')`, Netzwerk-Calls, Timeouts
- **Komplexität:** Hoch
- **Dauer:** Lang (bis zu 60 Sekunden Timeout)
- **Netzwerk:** Externe Calls zu GitHub/Vercel
- **Prozesse:** Blockierende System-Calls (`execSync`)

---

## ⚠️ IDENTIFIZIERTE PROBLEME

### Problem 1: Blockierende Git-Operationen
**Code:** `vite.config.ts` Zeile 302
```typescript
execSync('git push origin main 2>&1', { 
  timeout: 60000 // 60 Sekunden Timeout
})
```

**Risiko:**
- `execSync` blockiert den Node-Prozess
- Während Git Push läuft, kann nichts anderes passieren
- Wenn Git Push hängt → Cursor kann crashen
- Netzwerk-Probleme → Timeout → möglicher Crash

---

### Problem 2: API-Endpoint mit langen Operationen
**Code:** `/api/write-gallery-data` in `vite.config.ts`

**Risiko:**
- API-Endpoint macht mehrere Operationen:
  1. Datei schreiben ✅ (schnell)
  2. Git add ✅ (schnell)
  3. Git commit ✅ (schnell)
  4. Git push ❌ (LANGSAM, bis zu 60 Sekunden!)
- Während dieser Zeit ist der Request "offen"
- Wenn Cursor währenddessen crasht → Request hängt

---

### Problem 3: Vercel-Status-Checks
**Code:** `DevViewPage.tsx` Zeile 31-79

**Risiko:**
- Fetch zu `https://k2-galerie.vercel.app`
- Externe Netzwerk-Calls
- Timeouts (10 Sekunden)
- Wenn Vercel langsam antwortet → möglicher Crash

---

## 💡 WARUM FUNKTIONIERT LOKALES ARBEITEN?

### Lokale Operationen sind:
- ✅ **Schnell:** < 1 Sekunde
- ✅ **Einfach:** Nur Datei-Operationen
- ✅ **Kein Netzwerk:** Alles lokal
- ✅ **Keine Blockierung:** Asynchrone Operationen möglich
- ✅ **Keine externen Dependencies:** Keine GitHub/Vercel-Calls

### Git/Vercel Operationen sind:
- ❌ **Langsam:** Bis zu 60 Sekunden
- ❌ **Komplex:** Mehrere Schritte (add, commit, push)
- ❌ **Netzwerk-abhängig:** Externe Calls
- ❌ **Blockierend:** `execSync` blockiert alles
- ❌ **Externe Dependencies:** GitHub/Vercel müssen erreichbar sein

---

## 🔧 LÖSUNGSANSÄTZE

### Lösung 1: Git-Operationen auslagern (EMPFOHLEN)
**Idee:** Git-Operationen nicht im API-Endpoint machen, sondern:
- Datei schreiben ✅ (bleibt)
- Git-Operationen entfernen ❌
- Separates Git-Script erstellen
- Oder: Manuell im Terminal

**Vorteil:**
- API-Endpoint bleibt schnell (< 1 Sekunde)
- Keine Blockierung
- Git-Operationen können im Hintergrund laufen
- Cursor crasht nicht mehr

---

### Lösung 2: Git-Operationen optional machen
**Idee:** 
- Datei schreiben immer ✅
- Git-Operationen nur wenn explizit gewünscht
- Checkbox: "Auch Git Push ausführen?"

**Vorteil:**
- Nutzer entscheidet wann Git Push passiert
- Keine automatischen langen Operationen
- Mehr Kontrolle

---

### Lösung 3: Asynchrone Git-Operationen
**Idee:** Statt `execSync` (blockierend) → `exec` (asynchron)

**Vorteil:**
- Blockiert nicht den Haupt-Prozess
- Kann im Hintergrund laufen
- Cursor kann weiterarbeiten

**Nachteil:**
- Komplexer zu implementieren
- Fehlerbehandlung schwieriger

---

## 📋 EMPFOHLENE ÄNDERUNGEN

### Sofort (Kritisch):
1. ✅ **Git Push aus API-Endpoint entfernen**
   - Datei schreiben bleibt ✅
   - Git-Operationen entfernen ❌
   - Rückgabe: "Datei geschrieben, bitte manuell pushen"

2. ✅ **Vercel-Checks nur manuell**
   - Separater Button (bereits vorhanden ✅)
   - Nicht automatisch beim Laden

### Diese Woche:
3. ✅ **Separates Git-Script erstellen**
   - `scripts/git-push-gallery-data.sh`
   - Kann manuell ausgeführt werden
   - Oder: Button der Script startet

---

## 🎯 KONKRETE UMSETZUNG

### Schritt 1: API-Endpoint vereinfachen
**Änderung:** Git-Operationen entfernen, nur Datei schreiben

**Vorher:**
- Datei schreiben ✅
- Git add ✅
- Git commit ✅
- Git push ❌ (60 Sekunden!)

**Nachher:**
- Datei schreiben ✅
- Git-Operationen ❌ (entfernt)

**Rückgabe:**
```json
{
  "success": true,
  "message": "Datei geschrieben",
  "size": 12345,
  "gitHint": "Bitte manuell pushen: git add public/gallery-data.json && git commit -m 'Update' && git push"
}
```

---

### Schritt 2: Git-Script erstellen
**Datei:** `scripts/git-push-gallery-data.sh`

```bash
#!/bin/bash
cd /Users/georgkreinecker/k2Galerie
git add public/gallery-data.json
git commit -m "Update gallery-data.json"
git push origin main
```

**Vorteil:**
- Kann manuell ausgeführt werden
- Oder: Button der Script startet
- Läuft im Hintergrund
- Blockiert nicht Cursor

---

## 💡 ZUSAMMENFASSUNG

**Problem:**
- Git/Vercel-Operationen sind langsam und blockierend
- `execSync` blockiert Node-Prozess bis zu 60 Sekunden
- Können Cursor crashen
- Lokales Arbeiten funktioniert perfekt

**Lösung:**
- Git-Operationen aus API-Endpoint entfernen
- Separates Git-Script erstellen
- Git-Operationen manuell oder über Script
- Vercel-Checks nur manuell

**Ergebnis:**
- Stabile lokale Entwicklung ✅
- Schnelle API-Endpoints ✅
- Git/Vercel-Operationen wenn gewünscht ✅
- Keine automatischen Crash-Risiken ✅

---

## 📊 VERGLEICH

| Operation | Lokal | Git/Vercel |
|-----------|-------|------------|
| **Dauer** | < 1s | Bis zu 60s |
| **Blockierung** | Nein | Ja (execSync) |
| **Netzwerk** | Nein | Ja |
| **Crash-Risiko** | Niedrig | Hoch |
| **Stabilität** | ✅ Stabil | ❌ Problematisch |

---

**Nächste Schritte:**
1. API-Endpoint vereinfachen (Git entfernen)
2. Git-Script erstellen
3. Dokumentation aktualisieren
