# Datenfluss Galerie – Struktur und Quellen (verbindlich)

**Zweck:** Eine verbindliche Beschreibung, woher die Galerie ihre Daten bekommt und wer wohin schreibt. Damit bei Fehlern **zuerst Struktur und Datenfluss** geprüft werden – Reparatur **an der Quelle**, nicht nur an der Oberfläche (sonst gerät man immer tiefer in den Sumpf).

**Lehre (15.03.26):** K2-Galerie zeigte VK2-Inhalte. Ursache war **nicht** die Anzeige, sondern das **Schreiben**: Auto-Save lief im VK2-Admin und schrieb VK2-State in K2-Keys. Fix = Auto-Save nur bei K2 starten (Quelle), nicht nur Oberfläche sanieren.

---

## Grundsatz: Zwei Datenquellen für die Galerie

Die **Galerie-Seite** (K2, ök2, VK2) bezieht ihre Anzeige-Daten aus **genau zwei Quellen**. Woanders können die Grunddaten **nicht** herkommen.

| Quelle | Inhalt | Keys (Beispiele) |
|--------|--------|------------------|
| **1. Stammdaten** | Kontakt, Adresse, Galerie-Infos, Willkommensbild (Stammdaten-Galerie), Öffnungszeiten | K2: `k2-stammdaten-martina`, `k2-stammdaten-georg`, `k2-stammdaten-galerie`. ök2: `k2-oeffentlich-stammdaten-*`. VK2: `k2-vk2-stammdaten`. |
| **2. Galerie gestalten / Texte** | Seitentexte (heroTitle, welcomeIntroText, eventSectionHeading, …), Seitengestaltung (Bilder: welcomeImage, galerieCardImage, virtualTourImage, Video) | K2: `k2-page-texts`, `k2-page-content-galerie`. ök2: `k2-oeffentlich-page-texts`, `k2-oeffentlich-page-content-galerie`. VK2: `k2-vk2-page-texts`, `k2-vk2-page-content-galerie`. |

**Regel:** Pro Kontext (K2 / ök2 / VK2) gibt es **eigene Keys**. Kein Schreiben aus Kontext A in die Keys von Kontext B.

---

## Wer liest (Galerie-Seite)

| Kontext | Route / Komponente | Stammdaten aus | Texte / Gestaltung aus |
|---------|--------------------|----------------|-------------------------|
| K2 | GaleriePage, `vk2=false`, `musterOnly=false` | `k2-stammdaten-*` | `k2-page-texts`, `k2-page-content-galerie` (getPageTexts(undefined), getPageContentGalerie(undefined)) |
| ök2 | GaleriePage, `musterOnly=true` | MUSTER_TEXTE / `k2-oeffentlich-stammdaten-*` | `k2-oeffentlich-page-texts`, `k2-oeffentlich-page-content-galerie` |
| VK2 | Vk2GaleriePage bzw. GaleriePage `vk2=true` | `k2-vk2-stammdaten` | `k2-vk2-page-texts`, `k2-vk2-page-content-galerie` |

Die Galerie-Seite **liest** immer den Key, der zum aktuellen Kontext gehört. Sie **schreibt** nicht in diese Keys (außer evtl. Bereinigung bei erkanntem Kontext-Bug).

---

## Wer schreibt (Admin, Auto-Save, Backup)

| Schreibvorgang | Kontext-Abhängigkeit | Keys (nur dieser Kontext) |
|----------------|----------------------|---------------------------|
| **Admin: Stammdaten** | Tenant aus URL/sessionStorage (`?context=oeffentlich` / `context=vk2`). | K2: saveStammdaten('k2', …). ök2: k2-oeffentlich-stammdaten-*. VK2: saveVk2Stammdaten / k2-vk2-stammdaten. |
| **Admin: Seitentexte** | setPageTexts(..., tenantId). tenantId = tenant.isOeffentlich ? 'oeffentlich' : tenant.isVk2 ? 'vk2' : undefined. | K2: `k2-page-texts`. ök2: `k2-oeffentlich-page-texts`. VK2: `k2-vk2-page-texts`. |
| **Admin: Seitengestaltung (Bilder/Video)** | setPageContentGalerie(..., tenantId). tenantId wie oben. | K2: `k2-page-content-galerie`. ök2: `k2-oeffentlich-page-content-galerie`. VK2: `k2-vk2-page-content-galerie`. |
| **Auto-Save** | **Nur K2.** Auto-Save schreibt **ausschließlich** in K2-Keys (k2-stammdaten-*, k2-page-texts, k2-events, k2-documents, k2-design-settings). | **Darf nur laufen, wenn Admin-Kontext = K2.** Wenn Auto-Save bei VK2 oder ök2 liefe, würde der aktuelle State (VK2-Texte, VK2-Stammdaten) in K2-Keys geschrieben → Datenvermischung. |
| **Backup / Restore** | Kontext-spezifisch (createK2Backup, createOek2Backup, createVk2Backup; restore*FromBackup). | Jeweils nur die Keys des Kontexts. |

**Kritische Stelle (BUG-039):** In ScreenshotExportAdmin wurde Auto-Save bei `!tenant.isOeffentlich` gestartet – also auch bei **VK2**. Dadurch wurde alle 5 Sekunden VK2-State in K2-Keys geschrieben. **Fix:** (1) Auto-Save nur bei `!tenant.isOeffentlich && !tenant.isVk2`. (2) **TenantContext:** `?context=` case-insensitive (VK2/vk2), damit keine falsche Erkennung. (3) **Zweite Absicherung:** Auto-Save startet nur, wenn die URL weder `context=oeffentlich` noch `context=vk2` enthält (so auch bei falschem tenant kein Schreiben).

---

## Ablauf bei Fehlersuche (verbindlich)

1. **Zuerst: Struktur und Datenfluss klären**
   - Woher kommen die angezeigten Daten? (eine der zwei Quellen: Stammdaten, Galerie gestalten/Texte)
   - Welcher Key gehört zu welchem Kontext? (siehe Tabelle oben)
   - Wer **schreibt** in diesen Key? (Admin mit welchem Kontext? Auto-Save? Backup?)
2. **Dann: Ursache eingrenzen**
   - Wird im **richtigen** Kontext gelesen? (Galerie-Seite nutzt korrekten tenantId/Key?)
   - Wird im **richtigen** Kontext geschrieben? (Schreibvorgang nutzt denselben Kontext wie die Anzeige?)
   - Gibt es einen Schreibpfad, der **unabhängig vom Kontext** immer in einen festen Key schreibt? (z. B. Auto-Save immer in K2 → muss nur bei K2 laufen.)
3. **Erst danach: Reparieren**
   - Reparatur **an der Quelle** (Schreibpfad/Kontext korrigieren), nicht nur an der Oberfläche (Anzeige überschreiben/sanieren). Oberflächen-Sanierung nur als zweite Verteidigungslinie für bereits korrupte Daten.

**Nicht:** Sofort an der Oberfläche reparieren (Texte ersetzen, Bereinigung beim Lesen) und dabei den Schreibpfad ungeprüft lassen – sonst bleibt der Fehler unter der Oberfläche und man gerät immer tiefer in den Sumpf.

---

## Wo die K2-Stammdaten liegen – und wieso sie „weg“ sein können

**Adresse, Telefon, E-Mail im Impressum** kommen ausschließlich aus den **Stammdaten**. Gespeichert werden sie **nur im Browser** (localStorage), pro Gerät getrennt.

| Was | Wo gespeichert |
|-----|-----------------|
| **K2 Stammdaten** (Galerie, Martina, Georg: Adresse, Kontakt, …) | **localStorage** im selben Browser: `k2-stammdaten-galerie`, `k2-stammdaten-martina`, `k2-stammdaten-georg` |
| **Änderungen** | Im **Admin → Meine Daten** (Stammdaten) eintragen und speichern → schreibt in diese Keys. |
| **Backup** | Admin → Einstellungen → Backup & Wiederherstellung: Vollbackup enthält diese Keys. |

**Mögliche Gründe, warum „die alten Daten weg“ sind:**

1. **Anderes Gerät / anderer Browser** – localStorage ist **pro Gerät und pro Browser**. Am Mac sind andere Daten als auf dem Handy, wenn dort nie Stammdaten gespeichert wurden.
2. **Browser-Daten gelöscht** – „Website-Daten löschen“, Cache leeren oder „Daten für diese Website entfernen“ löscht auch die Stammdaten-Keys.
3. **Falsche Seite** – Du schaust **ök2** (`/galerie-oeffentlich`) statt **K2** (`/galerie`): Dann werden Mustertexte angezeigt, nicht die echten K2-Stammdaten.
4. **Wiederherstellung aus Backup** – Ein **älteres** Backup wiederhergestellt → die Keys wurden mit dem Stand von damals überschrieben.
5. **Früherer Bug (bereits behoben)** – BUG-039: Auto-Save lief im VK2-Admin und hat VK2-Daten in K2-Keys geschrieben. Ist abgestellt (Auto-Save nur bei K2).
6. **handleRefresh überschrieb Stammdaten (behoben 18.03.26)** – Beim „Bilder vom Server laden“ / Stand-Badge hatten **Server-Daten Vorrang** vor deinen lokalen Korrekturen. Folge: Telefonnummer (und andere Kontaktfelder) sprangen immer wieder auf den alten Wert aus gallery-data.json zurück. **Fix:** In handleRefresh haben jetzt **bestehende (prev) Kontaktdaten Vorrang**; Server wird nur genutzt, wenn lokal leer ist.

**Was du tun kannst:**

- **Aktuell machen:** Im **Admin (K2)** → **Meine Daten** (Stammdaten) Adresse, Telefon, E-Mail eintragen und **Speichern**. Dann zeigt das Impressum wieder diese Daten (auf diesem Gerät/Browser).
- **Wiederherstellen:** Wenn du ein **Vollbackup** von einem Zeitpunkt hast, als die Daten noch stimmten: Admin → Einstellungen → **Aus Backup-Datei wiederherstellen** (bzw. „Aus letztem Backup“). Enthält die Datei die Stammdaten, kommen sie zurück.

---

## Referenzen

- **GELOESTE-BUGS.md:** BUG-039 (Auto-Save bei VK2 schrieb in K2-Keys), BUG-038 (K2 zeigte VK2-Texte).
- **.cursor/rules/fehlersuche-zuerst-struktur-datenfluss.mdc** – Regel: Bei Fehlersuche zuerst Struktur und Datenfluss, dann reparieren.
- **TenantContext.tsx** – Ableitung tenantId aus URL/sessionStorage; Keys pro Tenant.
- **autoSave.ts** – schreibt nur K2-Keys; Aufrufer (ScreenshotExportAdmin) muss Auto-Save nur bei K2 starten.
