# Optimierung Schritt für Schritt – ohne Sicherheit und Funktion zu gefährden

**Zweck:** Reihenfolge und Regeln, damit Performance/Größe verbessert werden, **ohne** Datenschutz, Datentrennung, kritische Abläufe oder die **K2 echte Galerie** zu verletzen.

**Leitlinie:** Erst messen → dann eine kleine Änderung → **Tests + Build** → nur dann nächster Schritt.

---

## Unveränderliche Grenzen (vor jedem Schritt lesen)

| Thema | Regel |
|--------|--------|
| **K2 echte Galerie** | Keine „Optimierung“ am K2-Kern (Werke, Galerie, Sync, Stammdaten) **ohne** ausdrückliche Anordnung von Georg. Siehe `.cursor/rules/k2-echte-galerie-eisernes-gesetz.mdc`. |
| **K2 / ök2 / VK2 Daten** | Kein Refactor, der Keys, Merge, Publish oder Kontext verwischt. Checklisten: `k2-oek2-eisernes-gesetz-keine-daten.mdc`, `niemals-kundendaten-loeschen.mdc`, `docs/KRITISCHE-ABLAEUFE.md`. |
| **Stand / QR / Cache** | Keine „Vereinfachung“ von Build, `build-info.json`, QR-URLs, `vercel.json` ohne `stand-qr-niemals-zurueck.mdc`. |
| **Sicherheit** | Keine Lockerung von `TenantContext`, `PlatformOnlyRoute`, Lizenznehmer-Isolation (`eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc`). |
| **Automatik** | Kein automatischer Reload in der App (`code-5-crash-kein-auto-reload.mdc`). |

Wenn ein Schritt **eine dieser Grenzen** berührt: **stoppen**, nur mit **expliziter** Freigabe weitermachen.

---

## Kein Kaputtmachen – Wiederherstellung muss sicher sein (alle Phasen)

**Grundsatz:** Optimierung ist **nachrangig**. Lieber nichts ändern, als etwas zu riskieren, das wir **nicht** zuverlässig zurückdrehen können.

**Vor jeder Änderung, die Dateien löscht, ersetzt oder Pfade bricht:**

1. **Wiederherstellbarkeit klären:** Wie kommen wir **genau** zum heutigen Stand zurück? (z. B. `git revert` / vorheriger Commit, Kopie der Originaldatei **außerhalb** des Repos, Vollbackup aus der App – siehe `docs/KRITISCHE-ABLAEUFE.md` §11 Backup.)
2. **Kein „mal eben“:** Große Medien in `public/` **ersetzen** nur, wenn eine **Kopie** des Originals existiert (z. B. Ordner-Backup auf **backupmicro** oder Duplikat mit anderem Namen), bis die neue Version verifiziert ist.
3. **Git:** Sinnvoller Zwischenstand auf **`main`** (oder klar benannter Branch): **ein** fokussierter Commit pro Optimierungsschritt → bei Problemen **revert** oder zurück auf diesen Commit.
4. **Unklar, ob Referenzen im Repo treffen:** **Nicht** löschen; erst `grep`/Suche, ggf. Georg kurz einbeziehen.

**Wenn Wiederherstellung nicht zweifelsfrei möglich ist:** Schritt **nicht** ausführen.

---

## Phase 0 – Baseline (einmal, risikolos)

1. **Größen-Snapshot** (nur lesen):  
   `du -sh .git node_modules src public dist`  
   Optional: größte Dateien in `public/` (z. B. `find public -type f -exec ls -l {} \; | sort -k5 -n | tail -20`).
2. **Build-Referenz:** `npm run test` → grün, dann `npm run build` → erfolgreich.  
   Notiz: Datum/Uhrzeit – „Stand vor Optimierung“.
3. **Nichts am Verhalten ändern** – nur dokumentieren.

**Stop, wenn:** Tests oder Build rot → erst Ursache klären (keine Optimierung parallel).

### Messung Phase 0 (erführt – 17.04.26, lokales Projekt)

**Verzeichnisse** (`du -sh .git node_modules src public dist`):

| Pfad | Größe |
|------|--------|
| `.git` | 1.5G |
| `node_modules` | 934M |
| `src` | 5.4M |
| `public` | 129M |
| `dist` | 190M |

**Größte Dateien in `public/` (Auszug):** Viele `gallery-data.json.backup.*` je etwa 1.3–1.6 MB. Darüber: `img/k2/virtual-tour.mp4` und `img/oeffentlich/virtual-tour.mp4` je ca. 19 MB; `video/entdecken-eingangstor.mp4` ca. 8 MB; `img/k2/masterflyer-k2-seite1.png` ca. 2.5 MB; Willkommen-/Galerie-JPGs ca. 1.4–1.6 MB.

**QS-Referenz:** `npm run test` → **91** Test-Dateien, **576** Tests, grün (Laufzeit der Suite ca. 76 s). `npm run build` → grün (Vite „built in“ ca. 23 s).

**Build-Ausgabe (gzip, Auszug für spätere Vergleiche):** Hauptbundle `appBootstrap-*.js` ca. **806 kB** gzip; Chunk `ScreenshotExportAdmin-*.js` ca. **229 kB** gzip; ONNX-WASM `ort-wasm-simd-threaded*.wasm` ca. **5.66 MB** gzip (Werkzeug/Hintergrund-Entfernung – erwartbar groß). Vite-Hinweis: einige Chunks > 600 kB → für **Phase 3** notieren, nicht in Phase 0 ändern.

**Nächster sinnvoller Schritt:** Phase 1 nur bei Bedarf (`git gc`), oder Phase 2 nach bewusster Prüfung großer Medien in `public/` (keine Löschaktion ohne Referenz-Check im Repo).

---

## Phase 1 – Nur Entwicklungsumgebung / Repo (kein Nutzerverhalten)

| Schritt | Maßnahme | Risiko | Prüfung |
|--------|-----------|--------|---------|
| 1.1 | `.git` groß: lokal `git gc` | Sehr gering | Repo funktioniert, `git status` ok |
| 1.2 | **Keine** großen Binärdateien neu ins Repo ohne LFS/Grund | – | Regel im Team |
| 1.3 | `node_modules` regelmäßig frisch: `rm -rf node_modules && npm ci` (nur bei Bedarf) | Gering | Danach `npm run test` |

**Nicht:** Dependencies „aufräumen“ mit großem Bang ohne Changelog und Tests.

---

## Phase 2 – Statische Assets (`public/`) – geringes Risiko für Logik

**Vor Phase 2:** Abschnitt **„Kein Kaputtmachen – Wiederherstellung muss sicher sein“** lesen. Ohne nachvollziehbaren Rückweg **keine** Ersetzung/Löschung.

| Schritt | Maßnahme | Sicherheit |
|--------|-----------|------------|
| 2.1 | Größte Bilder identifizieren (PDFs/Videos prüfen: brauchen die alle Vollauflösung?). | Nur Dateien ersetzen, **keine** Pfad-Umbrüche ohne Suche nach Verweisen. |
| 2.2 | Bilder: komprimieren / WebP wo sichtbar gleichwertig; **immer** visuell prüfen. | **Original behalten** (Kopie/Backup), bis die neue Version in der App geprüft ist; Git-Commit vorher sinnvoll. |
| 2.3 | Doppelte/nutzlose Kopien entfernen (nach `grep`/Suche im Repo). | Keine gelöschte Datei, die noch von einer Route importiert wird. |

**Stop, wenn:** Ein Handbuch oder eine Seite fehlt – sofort zurück auf letzten grünen Stand.

---

## Phase 3 – Bundle / Ladezeit (mittleres Risiko → nur mit Disziplin)

| Schritt | Maßnahme | Sicherheit |
|--------|-----------|------------|
| 3.1 | **Messung:** `npm run build` – Ausgabe der Chunk-Größen notieren (oder Vite-Report, falls eingebaut). | Nur lesen. |
| 3.2 | Bereits **lazy** geladene Module nicht wieder „eager“ ziehen (z. B. Admin). | Nach Änderung gleiche Route manuell testen. |
| 3.3 | Schwere Bibliotheken (**PDF, html2canvas, onnx, background-removal**) nur prüfen: **dynamischer Import** dort, wo noch fehlt – **nicht** Verhalten ändern. | Feature einmal durchklicken. |
| 3.4 | Keine **zweite** PDF-/Canvas-Library einführen (Sportwagenmodus: ein Standard). | `ein-standard-problem.mdc` |

**Nicht:** K2-Galerie-Kern-Dateien anfassen, um „mal eben“ zu splitten.

---

## Phase 4 – Laufzeit / UX (ohne Datenfluss zu brechen)

| Schritt | Maßnahme | Sicherheit |
|--------|-----------|------------|
| 4.1 | `useMemo` / `useCallback` nur wo **nachweislich** teuer und stabil – nicht „überall“. | Keine geänderte Reihenfolge von Seiteneffekten. |
| 4.2 | Listen/Tabellen: Virtualisierung **nur** bei nachgewiesenem Performance-Problem und mit Tests. | K2/ök2/VK2 getrennt testen. |

**Stop, wenn:** Flackern, falsche Daten oder Gelegenheits-Bugs → Revert.

---

## Phase 5 – Kontinuierliche Kontrolle (Dauer)

- Vor **jedem** Merge auf `main`: `npm run test` + `npm run build` (wie `qs-standard-vor-commit.mdc`).
- Nach größeren Optimierungen: **kritische Tests** zusätzlich (`npm run test:kritische-schranken` oder `test:daten` je nach Thema).
- **Doku:** Diese Datei um **ein** Ergebnis pro Phase ergänzen (Datum, was gemessen wurde, Chunk-Größe vor/nach – keine Romane).

---

## Kurz-Checkliste vor „Fertig“ bei Optimierung

- [ ] Keine Änderung an K2-Kern ohne Anordnung  
- [ ] Datentrennung / localStorage / Merge unangetastet oder explizit geprüft  
- [ ] Stand/QR/Build nicht geschwächt  
- [ ] Tests grün, Build grün  
- [ ] Manuell: betroffene **eine** Route/Klick getestet  

---

## Verknüpfungen

- `docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md` – Gesamtprozesse  
- `docs/KRITISCHE-ABLAEUFE.md` – was nicht gebrochen werden darf  
- `.cursor/rules/eiserne-regel-groessere-aenderung-kein-chaos.mdc` – vor großen Eingriffen  

**Stand:** 17.04.26 – Phase-0-Baseline gemessen; Regel **Kein Kaputtmachen / Wiederherstellung** ergänzt.
