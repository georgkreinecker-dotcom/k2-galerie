# Datensicherheit – Absicherung (Überblick und Lücken)

**Zweck:** Eine zentrale Übersicht aller Absicherungen für Datensicherheit (Kontext-Trennung K2/ök2/VK2, kein stilles Löschen, keine Vermischung) und dokumentierte Lücken bzw. Prüfpunkte.

---

## 1. Bereits abgesichert (Referenzen)

| Bereich | Absicherung | Wo nachlesen |
|--------|-------------|--------------|
| **Kundendaten** | Kein automatisches Löschen/Filter+setItem; Server-Überschreiben nur mit Leer-/50%-Prüfung | niemals-kundendaten-loeschen.mdc, KRITISCHE-ABLAEUFE.md §6 |
| **K2/ök2 Trennung** | Keine K2-Daten in ök2 (Stammdaten, Werke, Belege); getPageTexts/getPageContentGalerie mit Tenant | k2-oek2-eisernes-gesetz-keine-daten.mdc, KRITISCHE-ABLAEUFE.md §10 |
| **Events/Dokumente** | Leere-Liste-Schutz (2+ Einträge) für K2, ök2, VK2; keine fremden Kontext-Daten | k2-events-documents-niemals-vk2-schreiben.mdc, eventsStorage.ts, documentsStorage.ts, KRITISCHE-ABLAEUFE.md §13 |
| **Stammdaten** | Nicht mit leer überschreiben; Merge aus bestehendem Speicher | kein-datenverlust.mdc, autoSave mergeStammdaten*, KRITISCHE-ABLAEUFE.md §7 |
| **Werke speichern** | ImageStore-Pfad, prepareArtworksForStorage, allowReduce/Filter-Regeln | werke-bilder-immer-imagestore.mdc, WERKE-SPEICHERUNG-CHECKLISTE.md, KRITISCHE-ABLAEUFE.md §4 |
| **Backup/Wiederherstellung** | K2/ök2/VK2 getrennt; restoreOek2FromBackup nur bei backup.kontext === 'oeffentlich'; restoreVk2FromBackup nur bei 'vk2'; K2-Backup keine VK2-Werke in k2-artworks | autoSave.ts createK2Backup/createOek2Backup/createVk2Backup, restoreFromBackup (VK2-Check), restoreOek2FromBackup, restoreVk2FromBackup |
| **Schutzmechanismen alle Bereiche** | Geltung für Werke, Kassa, Lager, Listen, Werkkatalog, Presse, Buchhaltung, Galerie gestalten, Einstellungen – keine Ausnahmen | schutzmechanismen-alle-bereiche-keine-ausnahmen.mdc, KRITISCHE-ABLAEUFE.md §14 |

---

## 2. Lücken / Zu prüfen (Stand: März 2026)

### 2.1 Shop/Kassa – Kontext-Keys für Bestellungen und Verkäufe (behoben)

- **Problem:** Beim Abschließen eines Verkaufs in der **ök2-Kassa** (fromOeffentlich) wurden Bestellungen und verkaufte Werke in **K2-Keys** geschrieben (`k2-orders`, `k2-sold-artworks`, teils `k2-artworks`). Demo-Verkäufe würden echte K2-Daten verändern.
- **Lösung:** Kontexteigene Keys verwenden: **ök2** → `k2-oeffentlich-orders`, `k2-oeffentlich-sold-artworks`; Lesen/Schreiben von Orders und Sold-Artworks sowie Storno/Listen immer mit demselben Key-Schema (fromOeffentlich → oeffentlich-Keys, fromVk2 → vk2-Keys, sonst K2).
- **Zusätzlich:** Beim Verkauf abschließen Werke-Stückzahl nur in dem Kontext-Key ändern, der zur Kasse gehört (z. B. `k2-oeffentlich-artworks` bei fromOeffentlich), und wo möglich **saveArtworksByKey** nutzen statt direktem `localStorage.setItem` auf Artworks (ImageStore/Checkliste).

### 2.2 Restore aus Backup-Datei (Kontext-Check)

- **restoreFromBackupFile(backup)** schreibt aktuell **nur in K2**. Wenn die UI später „Aus Datei wiederherstellen“ pro Kontext anbietet: Nur die Wiederherstellung für **diesen** Kontext aufrufen (z. B. nur restoreOek2FromBackup wenn Kontext = ök2). Bereits abgesichert: restoreOek2FromBackup prüft `backup.kontext === 'oeffentlich'`, restoreVk2FromBackup prüft `backup.kontext === 'vk2'`.

### 2.3 Weitere Bereiche (Checkliste)

- **Lager / Listen / Werkkatalog:** Bei neuen Features prüfen: Lese-/Schreib-Key immer vom Kontext abhängig (K2/ök2/VK2); kein gemeinsamer Key für mehrere Kontexte.
- **Presse/Buchhaltung:** Generatoren und Belege nur mit Stammdaten/Daten des aktuellen Kontexts (dokumente-kontext-eine-quelle.mdc).
- **Galerie gestalten / Einstellungen:** Bereits in schutzmechanismen-alle-bereiche-keine-ausnahmen.mdc; bei Änderungen Checkliste dort durchgehen.

---

## 3. Checkliste vor Änderungen (Datensicherheit)

- [ ] Wird ein **geschützter Key** (k2-artworks, k2-stammdaten-*, k2-orders, k2-sold-artworks, k2-oeffentlich-*, k2-vk2-*) gelesen oder geschrieben? → **Kontext** (K2/ök2/VK2) berücksichtigen; richtigen Key verwenden.
- [ ] **Shop/Kassa:** Orders und sold-artworks immer mit kontexteigenem Key (k2-orders vs k2-oeffentlich-orders vs k2-vk2-orders; k2-sold-artworks vs k2-oeffentlich-sold-artworks).
- [ ] **Kein stilles Löschen:** Kein Filter + setItem auf Kundendaten; kein Überschreiben mit leerer Liste, wenn 2+ Einträge (wo Regel gilt).
- [ ] **Backup/Wiederherstellung:** Nur in den Kontext wiederherstellen, aus dem das Backup stammt (kontext-Feld prüfen).
- [ ] **Neue Liste/Collection:** Wenn pro Kontext getrennt → von Anfang an kontexteigene Keys (z. B. k2-oeffentlich-* für ök2).

---

## 4. Verweise

- **Regeln:** .cursor/rules/niemals-kundendaten-loeschen.mdc, k2-oek2-eisernes-gesetz-keine-daten.mdc, k2-events-documents-niemals-vk2-schreiben.mdc, schutzmechanismen-alle-bereiche-keine-ausnahmen.mdc, kein-datenverlust.mdc, dokumente-kontext-eine-quelle.mdc.
- **Kritische Abläufe:** docs/KRITISCHE-ABLAEUFE.md (Abschnitte 6, 7, 10, 13, 14).
- **Tests:** src/tests/datentrennung.test.ts, src/tests/kundendaten-schutz.test.ts.
