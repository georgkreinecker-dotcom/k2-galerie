# K2 Familie – Lehren aus K2 Galerie (nicht zweimal machen)

**Zweck:** Alle Fehlerklassen und Lehren, die wir in K2 Galerie gemacht haben, gelten auch für K2 Familie. Beim Bauen und Ändern von K2 Familie diese Checkliste anwenden – damit wir dieselben Fehler nicht ein zweites Mal machen.

**Verbindlich:** Bei jeder Änderung an K2 Familie (Code, Routen, Speicher, Backup, UI) die KI und Entwickler: diese Doku + Regel `.cursor/rules/k2-familie-lehren-galeria-anwenden.mdc` beachten.

**Quellen K2 Galerie:** docs/FEHLERANALYSEPROTOKOLL.md, docs/GELOESTE-BUGS.md, .cursor/rules (niemals-kundendaten-loeschen, fehlersuche-zuerst-struktur-datenfluss, prozesssicherheit, etc.).

---

## 0a. Mitglieder-Einladung (QR / t+z+m) – eine Quelle

**Eiserne technische Kette:** Einladungs-URLs bauen nur in **`src/utils/familieEinladungsUrls.ts`**, Verarbeitung beim Öffnen in **`FamilieEinladungQuerySync`**. Keine zweite URL-Logik in Seiten. Details: **docs/K2-FAMILIE-EINLADUNGS-URL-QUELLE.md**, Regel **k2-familie-mitglieder-einladung-qr-eine-quelle.mdc**.

---

## 0. K2 Familie = eigenes Projekt (niemals von außen überschreiben)

**K2 Familie ist ein eigenes Projekt.** Kein anderer Bereich (K2 Galerie, APf, Admin, ök2, VK2, Backup/Restore anderer Kontexte) darf K2-Familie-Daten überschreiben oder die Tenant-Liste leeren.

- **Schreiben in `k2-familie-*`:** Nur Code innerhalb des K2-Familie-Projekts (FamilieTenantContext, familieStorage, familieHuberMuster, K2-Familie-Seiten) und der **bewusste** K2-Familie-Backup-Restore (`restoreK2FamilieFromBackup` in autoSave.ts). Kein Fremdcode.
- **Restore:** Beim Wiederherstellen eines K2-Familie-Backups wird die **Tenant-Liste gemerged** (nicht ersetzt): Backup-Liste + alle aktuellen Tenants mit vorhandenen Personendaten bleiben. So bleibt z. B. die Musterfamilie „huber“ in der Auswahl, auch bei Restore eines älteren Backups.
- **Musterfamilie:** Definiert in `src/data/familieHuberMuster.ts` (Tenant-ID `huber`). Laden: K2FamilieStartPage (Leitbild & Vision) oder K2FamilieHomePage (Karte „Musterfamilie laden“). Nach dem Laden erscheint „Familie Huber“ im Dropdown.

---

## 1. Keine stillen Überschreibungen / kein Filter + setItem

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Gefilterte Liste wurde in localStorage geschrieben → Daten weg. Regel: **niemals** filter + setItem. | **Gleiche Regel.** Nur schreiben nach **expliziter User-Aktion** (z. B. „Löschen“, „Wiederherstellen“). Kein „Aufräumen“ beim Laden, kein Überschreiben mit weniger Einträgen ohne Bestätigung. Keys: nur `k2-familie-*`. |

---

## 2. Kundendaten niemals automatisch löschen

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Absolutes Verbot: automatisches Löschen, Überschreiben mit leer, Filter und Zurückschreiben. | **Familien-Daten = Kundendaten.** Gleiche Regel: Kein automatisches Löschen, kein Überschreiben mit leerer Liste wenn bereits 2+ Einträge (außer explizite User-Aktion). Regel: niemals-kundendaten-loeschen.mdc gilt sinngemäß für `k2-familie-*`. |

---

## 3. Kontext trennen – richtiger Key, keine Vermischung

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Auto-Save schrieb bei VK2/ök2-Kontext in K2-Keys → K2 zeigte VK2-Inhalte. Schreibpfad muss vom Kontext abhängen. | **K2 Familie = eigener Kontext.** Nur in `k2-familie-*` schreiben/lesen. **Niemals** in `k2-artworks`, `k2-stammdaten-*`, `k2-oeffentlich-*`, `k2-vk2-*` schreiben. Umgekehrt: K2/ök2/VK2 schreiben **nie** in `k2-familie-*`. Backup/Restore bereits getrennt (createK2FamilieBackup, restoreK2FamilieFromBackup). |

---

## 4. Struktur und Datenfluss zuerst (Fehlersuche)

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Reparatur an der Oberfläche statt an der Quelle → Sumpf, Fehler kam wieder. Regel: Zuerst klären: Woher kommen die Daten? Wer schreibt wohin? | **Gleiche Regel.** Bei Fehlern in K2 Familie: Zuerst Struktur und Datenfluss (welche Keys, wer liest/schreibt), dann Ursache eingrenzen (Quelle vs. Anzeige), erst dann an der **Quelle** reparieren. Nicht nur Anzeige „säubern“. |

---

## 5. Sync / autoritative Quelle – Grundregel zuerst

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Merge ließ Lokal den Server überschreiben → „Server = einzige Wahrheit“ erst nach vielen Stunden eingeführt. Lehre: Bei Sync **zuerst** Grundregel klären (wer ist nach welcher Aktion die Wahrheit?), dann bauen. | **Falls K2 Familie jemals Sync/Server/„Stand holen“ bekommt:** Vor dem Bauen klären: Wer ist nach welcher Nutzeraktion die einzige Wahrheit? Dann **eine** konsistente Logik (z. B. serverAsSoleTruth), keine Mischlogik. Doku: LEHRE-DESIGN-FEHLER-SERVER-WAHRHEIT.md. |

---

## 6. Variable vor Verwendung (Hooks-Reihenfolge)

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| useLocation() in useEffect verwendet, Deklaration stand weiter unten → „Cannot access uninitialized variable“. | **Gleiche Regel.** Router-Hooks (useLocation, useNavigate) und alle in Hooks/Dependencies genutzten Variablen **am Anfang** der Komponente deklarieren. Regel: variable-vor-verwendung-hooks.mdc. |

---

## 7. Routen / Links – spezifische Routen vor Catch-all

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Link zu Projekt-Unterseite öffnete APf statt Zielseite (Route-Reihenfolge, Catch-all). | **Neue K2-Familie-Routen** in App.tsx **vor** generischer Route `/projects/:projectId` eintragen. Links zu K2-Familie-Seiten mit korrektem path (BASE_APP_URL + path). Bei „Link öffnet falsche Seite“: ANALYSE-LINK-OEFFNET-APF-STATT-UNTERSEITE.md + link-projekt-unterseite-nie-apf.mdc. |

---

## 8. Datenmenge / Komprimierung / Speicher

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Base64 in localStorage, große Datenmengen → Quota, Timeout, „Laden geht nicht“. Beim Speichern von Server-Daten: stripBase64; beim Erzeugen: Komprimierung. | **Falls K2 Familie Bilder/Fotos speichert:** Kein Base64 dauerhaft in localStorage. Komprimierung vor Speichern; gleiche Prinzipien wie in komprimierung-fotos-videos.mdc. Export/Backup: keine großen Binärdaten im JSON-Payload. |

---

## 9. Backup & Wiederherstellung – ein Kontext, eine Quelle

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Backup/Restore pro Kontext (K2, ök2, VK2 getrennt). Admin weist bei falscher Datei auf richtigen Ort hin. | **Umgesetzt:** K2 Familie hat eigenen Backup (createK2FamilieBackup, restoreK2FamilieFromBackup). Admin: „Diese Sicherungsdatei ist von K2 Familie. Bitte in K2 Familie wiederherstellen.“ Wiederherstellung nur in K2FamilieSicherungPage. Keine Vermischung mit K2/ök2/VK2-Backups. |

---

## 10. Fehlermeldung von Georg – gleiche Qualität

| In K2 Galerie passiert | In K2 Familie: |
|------------------------|----------------|
| Bei Fehlermeldung: GELOESTE-BUGS + FEHLERANALYSEPROTOKOLL prüfen, an der Quelle fixen, absichern, eintragen. Kein ad-hoc-Fix ohne Prüfung vergangener Fehler. | **Gleicher Ablauf.** Bei Fehlermeldung zu K2 Familie: (1) Diese Doku + GELOESTE-BUGS (gleiche Fehlerklasse?) prüfen. (2) Struktur/Datenfluss klären. (3) An der Quelle fixen + absichern. (4) In FEHLERANALYSEPROTOKOLL eintragen; bei K2-Familie-Bug in GELOESTE-BUGS mit Hinweis „K2 Familie“. |

---

## 11. Feinschliff: Trennung sichtbar machen (SEO, PWA, Copyright)

| Risiko | Maßnahme |
|--------|----------|
| **SEO `getPageMeta`:** Route fällt auf `DEFAULT_META` („K2 Galerie …“) | Jede **öffentliche** K2-Familie-URL in `src/config/seoPageMeta.ts` eintragen – besonders **`/familie`**, **`/k2-familie-handbuch`** (eigener Pfad, nicht unter `/projects/k2-familie/`), alle unter **`/projects/k2-familie/…`**. Test: `src/tests/seoPageMetaK2FamilieTrennung.test.ts`. |
| **PWA** | Manifest `id` getrennt; Familie-`start_url` Kurzform **`/familie`** (nicht `/galerie`). Siehe `k2FamiliePwaBranding.ts`, `index.html` (Manifest/Icon bei Familien-Pfaden). |
| **Copyright** | Oberflächen-Seiten: zwei Zeilen aus `tenantConfig` (`PRODUCT_COPYRIGHT_BRAND_ONLY`, `PRODUCT_URHEBER_ANWENDUNG`). Layout `K2FamilieLayout` für eingebettete Routen; **Standalone**-Seiten (z. B. `K2FamilieHandbuchPage`, Willkommen, Viewer) explizit prüfen. |

---

## Checkliste vor Änderungen an K2 Familie

- [ ] Schreibe ich in den **richtigen Kontext**? Nur `k2-familie-*` Keys.
- [ ] Kann es **stilles Überschreiben** oder **Löschen ohne User-Aktion** geben? → Verboten.
- [ ] **Neue Route/Unterseite?** → Route vor `/projects/:projectId`, Link mit korrektem path.
- [ ] **Sync/Server/Stand?** → Grundregel „wer ist Wahrheit“ zuerst klären.
- [ ] **Hooks/Dependencies?** → Deklaration vor erster Verwendung.
- [ ] **Bilder/Fotos?** → Komprimierung, kein Base64 in localStorage.
- [ ] **Fehleranalyse?** → Struktur/Datenfluss zuerst, dann Quelle fixen; Protokoll aktualisieren.

---

**Kurz:** Alles, was in K2 Galerie als Fehlerklasse und Regel festgehalten ist, gilt für K2 Familie mit. Eine Quelle für „nicht zweimal machen“: diese Doku + FEHLERANALYSEPROTOKOLL + GELOESTE-BUGS.
