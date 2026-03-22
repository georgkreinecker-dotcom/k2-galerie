# Servicarbeit im Betrieb – ohne unnötiges „User-Update-Theater“

**Zweck:** Ihr wollt das System laufend verbessern und anpassen, **ohne** Besucher:innen mit jedem kleinen Schritt zu überfordern. Dieses Dokument ordnet **wo** ihr arbeitet, **was** sichtbar wird, und **welche Tests** die Daten-Schicht absichern.

**Stand:** 22.03.26

---

## 1. Was „ohne sichtbares Update“ in der Praxis heißt

| Realität | Bedeutung |
|----------|-----------|
| **Ein Deployment (Vercel)** | Technisch kommt mit jedem Push auf `main` **ein** neuer Stand (Bundle + ggf. `api/*`). Es gibt **kein** zweites „nur-Server“-Deployment im gleichen Repo – alles geht in **einen** Build. |
| **„Unsichtbar“ für Galerie-Besucher** | Viele Änderungen **ändern keine sichtbaren Texte oder Layouts** auf Willkommen/Galerie/Shop: z. B. Fehlerbehebung in `api/`, Logging, interne Admin-Logik, Tests, Doku, Performance, Sicherheit hinter den Kulissen. Besucher merken nur: Seite lädt wie gewohnt (oder etwas zuverlässiger). |
| **Sichtbar** | Neue Buttons, geänderte Texte auf öffentlichen Routen, geändertes Verhalten der Galerie – das solltet ihr bewusst kommunizieren, wenn es Nutzer betrifft. |
| **APf / Admin = Werkzeug** | Anpassungen, die **nur** DevView, Admin-Tabs, Mission Control, mök2, Handbuch-APf-Routen betreffen, sind **primär für euch**. Besucher der **öffentlichen Galerie** sehen das nicht. Siehe Regel **APf = Werkzeug, Galerie = Produkt**. |

**Kurz:** Ihr könnt **continuierlich** auf `main` liefern; „kein User-Update“ heißt: **fokussiert bauen** (Werkzeug/API/Fixes) und **keine unnötigen** Änderungen an öffentlicher Produkt-UI. Der **Stand-Badge** zeigt weiterhin technisch den Build – das ist gewollt für Geräte-Sync, nicht als „Marketing-Update“.

---

## 2. Saubere Servicarbeit – Checkliste (vor Merge/Push)

1. **`npm run test`** (gesamte Suite) und **`npm run build`** grün – verbindlich (QS-Standard).
2. **Schnell-Fokus Datenlage (optional vor größeren Storage/Merge-Änderungen):** `npm run test:daten` – siehe Abschnitt 4.
3. **K2-Kern (echte Galerie):** Keine Refactors oder UX-Änderungen ohne **explizite** Anordnung (eisernes Gesetz K2).
4. **K2 / ök2 / VK2:** Jede Änderung an Keys, `load*` / `save*`, Publish, Merge → **Datentrennung** und **PROZESS-VEROEFFENTLICHEN-LADEN** im Kopf; bei Zweifel **K2-OEK2-DATENTRENNUNG** lesen.
5. **Dokumentation der Spur:** Nach größeren Betriebsänderungen kurz **DIALOG-STAND** / **WIR-PROZESS** – damit die nächste Session weiß, was im Betrieb angepasst wurde.

---

## 3. Test-Audit: Datenspeicherung, Trennung, Merge/Publish/Load

### 3.1 Gut abgedeckt (weiterführen, nicht abschwächen)

| Thema | Datei(en) | Was geprüft wird |
|-------|-----------|------------------|
| **Trennung K2 / ök2 / VK2 (Seitengestaltung)** | `datentrennung.test.ts` | `pageContentGalerie` – richtige Keys, ök2 bereinigt K2-Pfade (BUG-004) |
| **VK2 vs. K2 Stammdaten/Isolation** | `datentrennung.test.ts` | Keine Vermischung in Keys |
| **Events/Dokumente – Leer-Schutz, Fremdkontext** | `datentrennung.test.ts` | `saveEvents` / `saveDocuments` für ök2; K2↔VK2-Guards (mit weiteren Describes in derselben Datei) |
| **Shop-Keys pro Kontext** | `datentrennung.test.ts` | `getShopOrdersKey` / `getShopSoldArtworksKey` |
| **Werke-Keys & Kontext** | `artworksStorage.test.ts` | `getArtworksStorageKey`, Lesen/Schreiben ök2 |
| **Merge Server/Lokal** | `syncMerge.test.ts`, `upload-download-simulation.test.ts` | `mergeServerWithLocal`, `onlyAddLocalIfMobileAndVeryNew`, `serverAsSoleTruth`, Szenarien |
| **Publish (Mock)** | `publish-mock.test.ts` | Payload / zentraler Publish-Pfad |
| **Kundendaten-Schutz** | `kundendaten-schutz.test.ts` | Kein stilloses Löschen, Kontext |
| **Keramik/Merge aus gallery-data** | `mergeMissingK2KeramikFromGalleryData.test.ts` | Spezieller Merge-Fall |
| **ImageStore / Ref-Varianten** | `artworkImageStore.test.ts`, `bild-zu-karte-flow.test.ts` | BUG-031-ähnliche Fälle, Speichern mit Ref |
| **Zwei Speichervorgänge nacheinander** | `kritische-ablaeufe.test.ts` | BUG-033 Warteschlange |
| **VK2-Backup-Struktur** | `vk2-backup.test.ts` | Backup-Format VK2 |

### 3.2 Lücken / sinnvolle Erweiterungen (priorisiert)

Diese Punkte sind **aktuell weniger oder nicht** durch gezielte Unit-/Flow-Tests abgedeckt – bei **Änderungen** dort als Erstes Tests ergänzen:

| Priorität | Bereich | Warum | Vorschlag |
|-----------|---------|-------|-----------|
| **Hoch** | **`getPageTexts` / `page-texts` Keys** mit Tenant | Gleiche Fehlerklasse wie Seitengestaltung: ök2 darf nie K2-Texte lesen | Kleine Tests analog `getPageContentGalerie`: set/get nur richtiger Key |
| **Hoch** | **`autoSave.ts`** – Guards vor `saveEvents`/`saveDocuments` K2 | Race bei Tab-Wechsel – Logik ist in Storage + autoSave verteilt | Flow-Test: simulierte „VK2-Liste im K2-Tick“ darf nicht in `k2-events` schreiben (Mock von `data`) |
| **Mittel** | **`TenantContext` / Plattform vs. Lizenznehmer** | URL/`sessionStorage` – Ignorieren von `context=oeffentlich` auf Nicht-Plattform | Unit-Test der reinen Hilfsfunktionen (`tenantConfig.isPlatformInstance` + Ableitung tenantId), ohne voll Router |
| **Mittel** | **Stammdaten-Merge „nie leer überschreiben“** | `mergeStammdaten*` / Load aus Server | Dedizierter Test mit fixture localStorage + Server-Objekt mit leeren Feldern |
| **Niedrig** | **E2E (Playwright o. ä.)** | Ganze Klicks Galerie ↔ Admin | Nur wenn ihr E2E-Stack wollt; bis dahin Flow-Tests auf Datenebene |

**Hinweis:** Viele Regeln sind in **`.cursor/rules`** und **`docs/KRITISCHE-ABLAEUFE.md`** verankert; Tests sind das **technische Gegenstück**. Neue kritische Pfade = Test mitliefern (**tests-flow-bei-kritischen-ablaufen**).

---

## 4. Befehl: Fokus-Tests „Daten & Trennung“

Für schnelles Feedback vor Arbeit an **Storage, Merge, Publish, Trennung**:

```bash
npm run test:daten
```

**Enthält:** `datentrennung`, `syncMerge`, `artworksStorage`, `kundendaten-schutz`, `publish-mock`, `mergeMissingK2KeramikFromGalleryData`, `upload-download-simulation`, `kritische-ablaeufe`, `bild-zu-karte-flow`, `artworkImageStore`, `vk2-backup`.

**Ersetzt nicht** `npm run test` vor Commit – die **volle Suite** bleibt Pflicht.

---

## 5. Verknüpfungen

- **Prozesse:** `docs/PROZESS-VEROEFFENTLICHEN-LADEN.md`, `docs/K2-OEK2-DATENTRENNUNG.md`
- **Einstieg Wartung:** `docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md`
- **QS:** `docs/QUALITAETSSICHERUNG.md`, Regel **qs-standard-vor-commit**

---

**Kurzfassung:** Servicarbeit = gezielt am **Werkzeug** und an **API/Datenlogik** arbeiten, volle Tests + Build vor Push, optional `test:daten` für Fokus. „Kein User-Update“ = **keine unnötigen** öffentlichen UI-Änderungen – technisch ist ein Deployment normal, sichtbar ist es nur dort, wo ihr es **in der Oberfläche** anfasst.
