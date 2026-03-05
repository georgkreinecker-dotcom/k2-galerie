# Code 5 – Lösungen aus dem Netz (Cursor-Forum, Profis, Community)

---

## 🔥 Bei 5× Code 5 in einer Session: sofort das probieren (ohne auf Cursor zu warten)

**Zuerst (2 Min.):** In Cursor **Cmd+Shift+P** → „Preferences: Configure Runtime Arguments“ → **argv.json** öffnet sich. Eintragen: `"js-flags": "--max-old-space-size=8192"` (bei 16 GB+ RAM). Cursor **komplett beenden** (alle Fenster), neu starten.

**Wenn es danach noch crasht:** Cursor beenden → im **Mac-Terminal:** `cd ~/Library/"Application Support"` → `mv Cursor CursorBackup` → Cursor neu starten. (Einstellungen zurückgesetzt, Backup bleibt.)

**Dazu:** Preview zu, App im Browser; bei Bedarf `cursor --disable-gpu` starten. Details unten.

---

## Wenn Code 5 wieder kommt – Sofort-Checkliste (ohne auf Cursor zu warten)

**Reihenfolge, die Profis und Cursor-Staff empfehlen:**

| # | Was | Wo / wie |
|---|-----|----------|
| 1 | **Preview zu, App im Browser** | Cursor-Preview schließen; `npm run dev` → im Browser http://localhost:5177 öffnen. Entlastet sofort. |
| 2 | **Cursor mit GPU aus** starten | Im Terminal: `cursor --disable-gpu` (oder aus dem Projekt: `bash scripts/cursor-start-stabil.sh`). |
| 3 | **Chat-Verlauf entlasten** | `~/Library/Application Support/Cursor/User/workspaceStorage` → Ordner **dieses** Projekts umbenennen (z. B. `...Backup`). Cursor neu starten. Oft großer Effekt. |
| 4 | **Speicher-Limit erhöhen** | In Cursor: **Cmd+Shift+P** → „Preferences: Configure Runtime Arguments“ → in **argv.json** eintragen: `"js-flags": "--max-old-space-size=8192"` → Cursor **komplett beenden** und neu starten. (8 GB Heap – braucht mind. 16 GB RAM am Mac.) |
| 5 | **Cursor-Daten-Reset** | Cursor beenden → Terminal: `cd ~/Library/"Application Support"` und `mv Cursor CursorBackup` → Cursor neu starten. Einstellungen weg, Backup bleibt. |
| 6 | **Erweiterungen testen** | Im Terminal: `cursor --disable-extensions`. Wenn Crashes weg: Erweiterungen einzeln wieder an – so findest du die Übeltäter. |

**Wichtig:** Auf Cursor-Update zu warten hilft oft nicht – das Problem ist bei vielen seit Monaten offen. Die obigen Schritte sind das, was Profis und Cursor-Staff konkret empfehlen.

---

**Im Projekt umgesetzt:** Cursor mit GPU aus starten → **im Terminal am Mac aus dem Projektordner:**  
`bash scripts/cursor-start-stabil.sh`  
(Dann öffnet Cursor dieses Projekt mit `--disable-gpu`; kann Code-5-Crashes reduzieren.)

---

**Quelle:** Cursor-Forum (Staff Dean Rie, Bug Reports), VS Code/Electron, OOM-Threads 2024–2025.  
**Zweck:** Eine Checkliste mit dem, was wirklich empfohlen wird – du probierst der Reihe nach.

---

## 1. Von Cursor-Staff (Dean Rie, Forum) empfohlen

### A) Erweiterungen ausschließen

Im **Terminal (Mac):**

```bash
cursor --disable-extensions
```

Wenn die Crashes **aufhören**: Cursor normal starten, Erweiterungen **einzeln** wieder aktivieren – so findest du die verursachende Erweiterung.

---

### B) Cursor-Daten zurücksetzen (hilft vielen)

**Vorher:** Cursor **komplett beenden**.

Im **Terminal:**

```bash
cd ~/Library/"Application Support"
mv Cursor CursorBackup
```

Dann Cursor neu starten. Einstellungen sind zurückgesetzt, das **Backup** (CursorBackup) bleibt liegen. Wenn es danach stabil läuft, kannst du schrittweise aus CursorBackup übernehmen, was du brauchst.

---

### C) GPU-Beschleunigung abschalten

Im **Terminal** Cursor so starten:

```bash
cursor --disable-gpu
```

Wenn es damit stabiler läuft, kannst du GPU dauerhaft in Cursor deaktivieren (siehe Abschnitt 3 unten).

---

### D) VPN / Firmen-Proxy

Wenn du VPN oder Firmen-Proxy nutzt: **Cursor öffnen** → **Cmd + ,** (Einstellungen) → Suche **„HTTP/2“** → **„Disable HTTP/2“** aktivieren.

---

## 2. Chat-/Workspace-Storage (sehr oft genannte Ursache)

**Große Chat-Verläufe** lösen bei vielen Code-5-Crashes aus („every 10 seconds“, „when loading older messages“).

**Speicherort (macOS):**

```
~/Library/Application Support/Cursor/User/workspaceStorage
```

**Option A – Nur dieses Projekt:** In `workspaceStorage` die **Ordner** durchgehen (pro Projekt ein Ordner). Den Ordner für **dieses** Projekt löschen oder umbenennen. **Effekt:** Chat-Verlauf für dieses Projekt ist weg, Cursor startet oft wieder stabil.

**Option B – Alles zurücksetzen:** Gesamten Ordner `workspaceStorage` umbenennen (z. B. `workspaceStorageBackup`). Cursor legt einen neuen an. **Effekt:** Alle Chat-Verläufe in Cursor weg, oft deutlich weniger Crashes.

**Vorher sichern:** Wenn du Chats brauchst, vorher exportieren (z. B. als Markdown) oder den Ordner nur **umbenennen** (Backup), nicht löschen.

---

## 3. GPU dauerhaft in Cursor deaktivieren (argv.json)

Wenn `cursor --disable-gpu` hilft, kannst du es dauerhaft machen:

1. In Cursor: **Cmd + Shift + P** → **„Preferences: Configure Runtime Arguments“** auswählen.
2. In der geöffneten **argv.json** die Zeile suchen:  
   `// "disable-hardware-acceleration": true`
3. **Kommentar entfernen**, also stehen lassen:  
   `"disable-hardware-acceleration": true`
4. Cursor **komplett beenden** und neu starten.

Zusätzlich (bei Terminal-Abstürzen): Einstellungen → Suche **„terminal.integrated.gpuAcceleration“** → auf **„off“** setzen.

---

## 4. Cache leeren (Community-Standard)

Cursor-Cache (analog zu VS Code) leeren:

- **macOS:** Im Finder **„Gehe zu Ordner“** (Cmd + Shift + G), eingeben:  
  `~/Library/Application Support/Cursor/Cache`  
  Ordner **Cache** löschen oder umbenennen (z. B. `CacheBackup`), Cursor neu starten.

Oder den **gesamten** Cursor-Ordner wie unter 1B sichern:  
`~/Library/Application Support/Cursor` → in `CursorBackup` umbenennen, Cursor neu starten (dann kompletter Reset).

---

## 5. Reihenfolge zum Ausprobieren (Empfehlung)

1. **Preview zu, App im Browser** (bei uns schon Regel) – entlastet sofort.
2. **cursor --disable-gpu** testen – schnell, reversibel.
3. **workspaceStorage** für dieses Projekt umbenennen/löschen (Chat-Verlauf dieses Projekts weg) – oft großer Effekt.
4. **Cursor-Daten zurücksetzen** (Cursor → CursorBackup) – wenn 2 und 3 nicht reichen.
5. **Erweiterungen** mit `cursor --disable-extensions` testen – wenn Verdacht auf eine Erweiterung.
6. **HTTP/2 deaktivieren** – nur bei VPN/Proxy relevant.
7. **disable-hardware-acceleration** in argv.json dauerhaft – wenn 2 geholfen hat.

---

## 6. Verweise im Projekt

- **Grundproblem + unsere Regeln:** docs/CODE-5-GRUNDPROBLEM-UND-LOESUNG.md  
- **Bereits geprüft (App-Code):** docs/CRASH-BEREITS-GEPRUEFT.md  
- **Preview zu, App im Browser:** docs/LOSUNG-CRASH-SPIRALE.md  

---

*Stand: 05.03.26 – aus Cursor-Forum, VS Code/Electron und Nutzerberichten zusammengezogen.*
