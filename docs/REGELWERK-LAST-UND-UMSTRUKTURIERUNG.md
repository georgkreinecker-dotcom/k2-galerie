# Regelwerk-Last und Umstrukturierung

**Stand: 01.03.26** – Analyse der programmierrelevanten Last durch unser Regelwerk und Vorschlag zur Entlastung (ohne Inhalt zu opfern).

---

## 1. Aktuelle Last (Fakten)

| Quelle | Umfang | Wann geladen |
|--------|--------|--------------|
| **.cursorrules** | ~19 KB | Jede Session / jeder Kontext |
| **.cursor/rules/*.mdc** | ~126 KB (53 Dateien) | 43 davon mit `alwaysApply: true` → bei **jedem** Request im Kontext |
| **Session-Start-Regel** | – | Verlangt zusätzlich: HAUS-INDEX, Handbuch 00-INDEX, STRUKTUR-HANDELN-QUELLEN, GRAFIKER-TISCH-NOTIZEN, GELOESTE-BUGS **einlesen** |
| **Geschätzte Kontext-Last** | **~150 KB+** nur für Regeln + Session-Start-Lesepflicht | Pro Chat-Turn / Agent-Aktion |

**Konsequenz:** Cursor lädt bei jeder Interaktion einen sehr großen Regelblock. Das kann Speicher und Verarbeitung belasten – unabhängig davon, ob die App im Browser läuft. Die Last kommt vom **Regelwerk**, nicht von der laufenden Anwendung.

---

## 2. Warum so viele Regeln?

Die Regeln sind gewachsen, weil:
- Wiederkehrende Fehler (Code 5, Datentrennung, Kundendaten, Stand/QR) abgefangen werden sollten.
- Jede Session die gleiche Basis haben soll (Session-Start, DIALOG-STAND, Absturz-Wiederaufnahme).
- Klarheit für Georg (keine doppelten Eingaben, fertige Form, ein Standard pro Problem).

**Nichts davon ist falsch.** Die Frage ist: **Müssen alle 43 Regeln bei jeder Anfrage geladen werden?**

---

## 3. Vorschlag: Umstrukturierung (Last reduzieren, Inhalt behalten)

### Grundprinzip

- **Kern:** Eine kleine Menge „immer an“ (ca. 5–8 Regeln), sehr kompakt.
- **Rest:** „Bei Bedarf“ – entweder `alwaysApply: false` + Verweis in docs, oder in wenige thematische Dateien gebündelt, die nur bei passenden Aufgaben gelesen werden.

### Schritt 1: Eine Kern-Regel-Datei (immer an)

**Neue Datei:** `.cursor/rules/00-kern.mdc` (alwaysApply: true)

- Enthält **nur Kurzfassungen** (1–3 Sätze pro Thema) zu:
  - Kommunikation (Deutsch, kurz, keine unnötigen Georg-Eingaben)
  - Kundendaten (niemals automatisch löschen/filtern)
  - K2 vs. ök2 (keine Vermischung, Kontext prüfen)
  - Stand/QR (Server-Stand + Cache-Bust, kein Auto-Reload)
  - Fertig = getestet + committed, Stand aktualisieren
  - Session-Ende: DIALOG-STAND schreiben
  - Bei Crash/„weiter“: WEITERARBEITEN-NACH-ABSTURZ + DIALOG-STAND lesen
- Ziel: **max. ~2–3 KB** statt 126 KB immer im Kontext.

### Schritt 2: alwaysApply auf „Kern“ reduzieren

- **Dauerhaft alwaysApply: true:** nur `00-kern.mdc` (und ggf. .cursorrules stark gekürzt oder als Verweis auf 00-kern).
- **Alle übrigen .mdc:** auf `alwaysApply: false` setzen.
- In **00-kern** oder in **docs/REGELWERK-INDEX.md** steht: „Vollständige Regeln: .cursor/rules/*.mdc und docs/… – bei Bedarf lesen (z. B. vor Änderungen an localStorage, Stand, Crash, Session-Start).“

### Schritt 3: Session-Start vereinfachen

- Statt „lies 5+ Dateien zu Sessionbeginn“: „Prüfe bei Sessionbeginn: DIALOG-STAND.md, GRAFIKER-TISCH-NOTIZEN (Offen). Bei Crash/weiter: WEITERARBEITEN-NACH-ABSTURZ.md.“
- HAUS-INDEX / Handbuch / STRUKTUR-HANDELN-QUELLEN / GELOESTE-BUGS: **nur bei passender Aufgabe** einlesen (z. B. „wo liegt X?“ → HAUS-INDEX; Code-Änderung → GELOESTE-BUGS prüfen).

### Schritt 4: .cursorrules kürzen

- Nur noch: Kommunikation, Projekt-Kontext (K2 Galerie, APf, mök2), Marke, **Verweis auf** `docs/REGELWERK-LAST-UND-UMSTRUKTURIERUNG.md` und `.cursor/rules/00-kern.mdc`.
- Detaillierte Blöcke (Vercel, Deployment, Backup, alle Checklisten) → in docs verschieben und verlinken.

---

## 4. Erwarteter Effekt

- **Kontext pro Request:** von ~150 KB+ auf grob **unter 25 KB** für Regeln.
- **Verhalten:** Unverändert, wenn die AI bei relevanten Aufgaben die richtigen docs/rules gezielt liest („vor localStorage-Änderung → datentrennung / niemals-kundendaten“).
- **Risiko:** Einzelne Regeln werden seltener „automatisch“ mitgeliefert; dafür in 00-kern und REGELWERK-INDEX klar referenziert, damit sie bei Bedarf nachgelesen werden.

---

## 5. Reihenfolge der Umsetzung

1. **00-kern.mdc** anlegen (Kurzfassungen, ~2–3 KB), `alwaysApply: true`.
2. **REGELWERK-INDEX.md** in docs anlegen (Liste aller Regeln + wann lesen).
3. **Alle anderen .mdc** auf `alwaysApply: false` setzen.
4. **session-start-regeln-struktur.mdc** anpassen: nur noch DIALOG-STAND + GRAFIKER-TISCH (Offen) + bei Crash WEITERARBEITEN; Rest „bei Bedarf“.
5. **.cursorrules** auf Kern + Verweise reduzieren; Detailliertes nach docs auslagern.
6. **Test:** Einige Sessions normal arbeiten; prüfen ob Verhalten stimmt und ob Cursor/Code-5 spürbar entlastet ist.

---

## 6. Offen

- Ob Cursor durch weniger Kontext tatsächlich stabiler wird, lässt sich nur durch Ausprobieren klären. Die Last durch das Regelwerk ist aber real und gut messbar; die Umstrukturierung ist sinnvoll, um sie zu verringern ohne Regeln zu streichen.
- Optional: Nach der Umstellung in **CRASH-BEREITS-GEPRUEFT.md** oder **DIALOG-STAND** vermerken: „Regelwerk auf Kern umgestellt (Datum); Last reduziert.“

Wenn du willst, können wir mit **Schritt 1 (00-kern.mdc anlegen)** starten und die genaue Kurzfassung pro Thema gemeinsam festzurren.
