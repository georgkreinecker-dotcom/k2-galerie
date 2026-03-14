# K2TEAM - BACKUP ZUSAMMENFASSUNG

**Erstellt:** 9. Februar 2026  
**Version:** 1.3.0  
**Letzte Aktualisierung:** 9. Februar 2026, 16:00 Uhr

---

## 📋 ÜBERSICHT

Dieses Dokument ist eine zusammengefasste Version des aktuellen AI-Memory-Backups (`k2-ai-memory-backup.json`). Es enthält die wichtigsten Informationen über das K2Team, das Projekt, Arbeitsgewohnheiten und den aktuellen Stand.

---

## 👥 TEAM

**Name:** K2Team  
**Gegründet:** 9. Februar 2026  
**Mitglieder:** Georg Kreinecker, AI-Assistent  
**Zweck:** Gemeinsam die K2 Galerie erfolgreich entwickeln und betreiben

---

## 🎨 PROJEKT

**Name:** K2 Galerie  
**Typ:** Multi-Tenant SaaS  
**Beschreibung:** Galerie für Kunst & Keramik von Martina und Georg Kreinecker  
**Tech-Stack:** React, TypeScript, Tailwind, Vite, Supabase

**Deployment:**
- **Platform:** Vercel
- **URL:** https://k2-galerie.vercel.app
- **Repository:** k2-galerie

---

## 👤 GEORG KREINECKER

**Name:** Georg Kreinecker  
**Geburtsjahr:** 1959  
**Partnerin:** Martina (gemeinsame Galerie)

### Beruflicher Hintergrund:
- **Grundberuf:** Schlosser → Meister → Unternehmer
- **Eigener Betrieb:** Sondermaschinenbau (ab 25)
- **Maschinenbau-Unternehmen:** Inhaber und Chef (bis 1992)
- **Consulting & Trading:** Maschinen/Maschinenteile (1992-2018)
  - Spezialisierung: Tschechien
  - Expansion: Türkei
- **Immobilien:** Errichtung und Betrieb

**Fähigkeiten:** Geschäftsführung, Immobilien, Maschinenbau, Consulting

**Technische Kenntnisse:**
- Softwareentwicklung: KEINE Kenntnisse
- Programmierung: Alles Neuland
- Abhängigkeit: 100% auf AI-Hilfe angewiesen

**Sprachen:**
- Deutsch: Muttersprache
- Englisch: Gut für Konversation, NICHT für Fachwissen/Programmierung

---

## 💬 KOMMUNIKATION

**Sprache:** Deutsch

**Stil:**
- Ton: Freundlich, direkt, enthusiastisch
- Länge: KURZE Antworten, keine langen Textwände
- Struktur: Überschriften, Listen, Code-Blöcke
- Visual: Emojis für bessere Übersicht
- Praktisch: Konkrete Schritt-für-Schritt Anleitungen

**Präferenzen:**
- Terminal-Befehle: IMMER explizit spezifizieren ("Im Terminal am Mac" oder "In Cursor Terminal")
- Keine Marketing-Begriffe
- "Empfehlungs-Programm" statt "Affiliate"
- Einfache Sprache

---

## 📊 PROJEKT-STATUS

**Aktuelle Phase:** Migration von Figma Make zu Cursor

**Hauptprobleme:**
1. Cursor Instabilität - häufige 'reopen' Crashes
2. Mobile Daten-Synchronisation - neue Daten kommen nicht an
3. Veröffentlichungsprozess - Git Push funktioniert, aber Mobile zeigt alte Daten

**Lösungen:**
- Cursor-Crashes: Im Browser arbeiten statt Cursor Preview
- Mobile-Sync: Manueller Refresh-Button auf Mobile, QR-Code neu scannen
- Deployment: Git Push funktioniert, Vercel deployt automatisch

---

## 🔧 TECHNISCHE DETAILS

### Server:
- **Port:** 5177
- **Fallback-Port:** 5178
- **Befehl:** `npm run dev`
- **Node-Pfad:** `$HOME/.local/node-v20.19.0-darwin-x64/bin`

### Deployment:
- **Datei:** `public/gallery-data.json`
- **API-Endpoint:** `/api/write-gallery-data`
- **Git Auto-Push:** ✅ (jetzt über separates Script)
- **Vercel Auto-Deploy:** ✅

### Mobile:
- **Refresh-Button:** 🔄 Aktualisieren Button auf Mobile
- **Cache-Busting:** Aggressiv mit Timestamps und Versionen
- **Manueller Refresh:** Statt automatisches Reload

---

## ⚠️ BEKANNTE PROBLEME

### 1. Cursor 'reopen' Crashes
- **Häufigkeit:** Alle 3-5 Minuten während aktiver Arbeit
- **Ursache:** Cursor IDE Instabilität, nicht Code
- **Workaround:** Browser für Testen verwenden
- **Status:** Bekanntes Cursor-Problem

### 2. Mobile zeigt keine neuen Daten
- **Ursache:** Browser-Cache auf Mobile
- **Lösung:** QR-Code neu scannen, Cache leeren, manueller Refresh-Button
- **Status:** In Arbeit

### 3. Doppelte QR-Codes auf Willkommensseite
- **Status:** Zu beheben

### 4. Git/Vercel-Operationen verursachen Crashes
- **Häufigkeit:** Bei jedem Git Push oder Vercel-Deployment
- **Ursache:** Blockierende execSync-Operationen (bis zu 60s), externe Netzwerk-Calls
- **Workaround:** Lokales Arbeiten funktioniert perfekt - Git/Vercel-Operationen manuell im Terminal
- **Status:** ✅ Behoben - Git-Operationen aus API-Endpoint entfernt, separates Script erstellt

---

## 📁 WICHTIGE DATEIEN

**Code:**
- `components/ScreenshotExportAdmin.tsx`
- `src/pages/GaleriePage.tsx`
- `vite.config.ts`
- `src/main.tsx`

**Regeln:**
- `/Users/georgkreinecker/.cursor/rules/kommunikations-stil.mdc`
- `/Users/georgkreinecker/.cursor/rules/georg-persoenlich.mdc`
- `/Users/georgkreinecker/.cursor/rules/proaktive-zusammenarbeit.mdc`
- `/Users/georgkreinecker/.cursor/rules/k2team-werte.mdc`
- `/Users/georgkreinecker/k2Galerie/.cursorrules`

---

## 🔄 WORKFLOW

**Entwicklung:** Cursor für Code, Browser für Testen  
**Deployment:** Veröffentlichen Button → Git Push (Script) → Vercel Deploy  
**Mobile-Update:** QR-Code neu scannen nach Deployment  
**RAM-Check:** `./check-ram.sh` alle 2-3 Stunden

---

## 📝 WICHTIGE ENTSCHEIDUNGEN

### 1. Cursor Stabilität (8. Februar 2026)
- **Entscheidung:** Browser für Testen verwenden, nicht Cursor Preview
- **Grund:** Cursor Preview verursacht Crashes

### 2. Mobile Updates (8. Februar 2026)
- **Entscheidung:** Manueller Refresh-Button statt automatisches Reload
- **Grund:** Automatisches Reload verursacht Crashes

### 3. RAM Management (8. Februar 2026)
- **Entscheidung:** Cursor regelmäßig neu starten wenn > 2GB RAM
- **Grund:** Hoher RAM-Verbrauch verursacht Crashes

### 4. Git/Vercel Stabilität (9. Februar 2026)
- **Entscheidung:** Git-Operationen aus API-Endpoint entfernen, separates Script erstellen
- **Grund:** Blockierende Operationen verursachen Crashes

---

## 🎯 ZIELE

### 1. Galerie online bringen
- **Status:** In Arbeit (65% Fortschritt)
- **Phase 1:** Vorbereitung ✅ (abgeschlossen 5. Februar 2026)
- **Phase 2:** Online 🔄 (80% Fortschritt)
- **Phase 3:** Marketing ⏳ (ausstehend)
- **Phase 4:** Betrieb ⏳ (ausstehend)

**Nächste Schritte:**
- Deployment finalisieren
- Mobile-Version testen
- Marketing-Vorbereitung

### 2. Multi-Tenant SaaS System
- **Status:** In Arbeit (40% Fortschritt)
- **Authentifizierung:** ✅ Abgeschlossen
- **Licence-System:** 🔄 In Arbeit (60%)
- **Multi-Tenant-Funktionalität:** ⏳ Ausstehend

**Nächste Schritte:**
- Licence-Manager finalisieren
- Multi-Tenant-Tests
- Beta-Tester-Programm starten

### 3. Stabilität verbessern
- **Status:** In Arbeit (70% Fortschritt)
- **Browser-Workflow:** ✅ Etabliert
- **Backup-System:** ✅ Implementiert
- **RAM-Management:** 🔄 In Arbeit

**Nächste Schritte:**
- RAM-Check automatisieren
- Crash-Prävention verbessern

---

## 🔍 ERKANNTE MUSTER

### 1. Backup vor wichtigen Änderungen
- **Beschreibung:** Georg macht regelmäßig Backups, besonders vor größeren Änderungen
- **Häufigkeit:** 5x erkannt
- **Vorschlag:** Automatisches Backup vor größeren Änderungen anbieten

### 2. Browser-Testing statt Cursor Preview
- **Beschreibung:** Georg testet lieber im Browser als in Cursor Preview (wegen Crashes)
- **Häufigkeit:** 10x erkannt
- **Vorschlag:** Immer Browser-Link anbieten wenn Code geändert wurde

### 3. Proaktive Fragen zu Features
- **Beschreibung:** Georg fragt oft ob Features möglich sind, bevor er sie explizit anfordert
- **Häufigkeit:** 8x erkannt
- **Vorschlag:** Proaktiv Features vorschlagen wenn sie zum Projekt passen

### 4. Schritt-für-Schritt Anleitungen bevorzugt
- **Beschreibung:** Georg mag klare, strukturierte Anleitungen mit konkreten Schritten
- **Häufigkeit:** 15x erkannt
- **Vorschlag:** Immer strukturierte Listen verwenden, nicht nur Text

---

## 💼 ARBEITSGEWOHNHEITEN

### Bevorzugte Tools:
- **Entwicklung:** Cursor IDE
- **Testing:** Browser (Safari/Chrome)
- **Deployment:** Git + Vercel
- **Backup:** JSON-Dateien in `public/backup/`

### Häufige Workflows:

**1. Code-Änderung → Deployment**
- Code ändern
- Im Browser testen
- Veröffentlichen Button
- Git Push (Script)
- Vercel Deploy
- **Häufigkeit:** Hoch

**2. Backup erstellen**
- Mission Control öffnen
- Backup herunterladen
- Auf Server speichern
- **Häufigkeit:** Regelmäßig

**3. Mobile Update**
- Code deployen
- QR-Code neu scannen
- Manueller Refresh
- **Häufigkeit:** Nach jedem Deployment

### Präferenzen:
- **Kommunikation:** Kurz, strukturiert, mit Emojis
- **Erklärungen:** Schritt-für-Schritt, einfach erklärt
- **Testing:** Browser bevorzugt über Cursor Preview
- **Backup:** Regelmäßig, vor wichtigen Änderungen

### Zeitmuster:
- **Aktive Stunden:** Vormittags und Nachmittags
- **Session-Länge:** 1-2 Stunden typisch
- **Pausen:** Nach längeren Sessions

---

## 💎 TEAM-WERTE

**Grundlage:** Erweiterter Kantischer Imperativ

**Prinzip:** Handle nur nach derjenigen Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde - nicht nur für unsere Zusammenarbeit, sondern für alle Menschen und das Wohle der gesamten Natur.

**Erweiterung:** Weil unsere Entscheidungen und Taten weit über unsere Möglichkeit zu denken hinausgehen, tragen wir Verantwortung für ihre Auswirkungen auf andere Menschen und die gesamte Natur.

### 8 K2Team-Werte:

1. **Respekt & Würde** - Jeder wird mit Respekt behandelt, unabhängig von technischen Fähigkeiten
2. **Ehrlichkeit & Transparenz** - Offene, ehrliche Kommunikation ohne Verheimlichung
3. **Verantwortung & Zuverlässigkeit** - Übernommene Aufgaben werden zuverlässig erledigt
4. **Gegenseitiger Nutzen** - Handlungen sollen beiden Seiten nützen
5. **Lernen & Wachstum** - Aus Fehlern lernen, sich kontinuierlich verbessern
6. **Einfachheit & Klarheit** - Komplexität reduzieren, Klarheit schaffen
7. **Proaktivität & Initiative** - Nicht nur reagieren, sondern proaktiv handeln
8. **Geduld & Verständnis** - Geduld mit Lernprozessen, Verständnis für Herausforderungen

### Entscheidungs-Framework:

1. Würde ich wollen, dass Georg so mit mir umgeht?
2. Ist das zum gegenseitigen Nutzen?
3. Respektiere ich Georg's Würde und Erfahrung?
4. Bin ich ehrlich und transparent?
5. Handle ich verantwortungsvoll?
6. Dient diese Entscheidung dem Wohle aller Menschen?
7. Dient diese Entscheidung dem Wohle der Natur?
8. Welche langfristigen Auswirkungen hat diese Entscheidung?

---

## 📌 WICHTIGE NOTIZEN

- Georg ist sehr geduldig trotz häufiger Crashes
- Wichtig: Einfache Sprache, keine Fachbegriffe
- Wichtig: Immer "Georg" sagen, nicht formell
- Wichtig: Terminal-Befehle immer explizit spezifizieren
- Die K2 Kunst Galerie machen Martina und Georg gemeinsam; das Projekt (Plattform) macht Georg alleine.
- Respekt für Georg's erfolgreiche Karriere zeigen

---

## 🎯 AKTUELLE ZIELE

**Primär:** Galerie online bringen  
**Sekundär:** Stabilität verbessern, Multi-Tenant-System finalisieren  
**Fokus:** Phase 2 abschließen - Deployment finalisieren

**Nächste Session:**
- Deployment-Prozess testen
- Mobile-Version prüfen
- Backup-System dokumentieren

---

## 💡 PROAKTIVE VORSCHLÄGE

**Status:** Aktiviert  
**Häufigkeit:** Moderat  
**Erfolgreiche Vorschläge:**
- Browser-Workflow statt Cursor Preview
- Backup-System auf Mission Control
- Strukturierte Anleitungen

**Präferenzen:**
- Fortschritt anzeigen: ✅
- Optimierungen vorschlagen: ✅
- Muster erkennen: ✅
- Workflows automatisch fortsetzen: ❌

---

## 📅 VERSION & UPDATES

**Version:** 1.3.0  
**Letzte Aktualisierung:** 9. Februar 2026, 16:00 Uhr  
**Nächste Überprüfung:** Bei wichtigen Änderungen

---

**Hinweis:** Dies ist eine Zusammenfassung. Die vollständige Backup-Datei befindet sich in `public/backup/k2-ai-memory-backup.json` und `backup/k2-ai-memory-backup.json`.
