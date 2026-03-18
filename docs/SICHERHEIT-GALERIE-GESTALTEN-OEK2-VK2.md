# Sicherheit: Galerie gestalten – Besucher können Texte/Bilder nicht ändern

## Kurzfassung

**Besucher der ök2- oder VK2-Galerie können Texte und Bilder in „Galerie gestalten“ nicht verändern.** Die Bearbeitung ist nur im Admin möglich; öffentliche Galerie-Seiten haben ausschließlich Lesezugriff.

---

## 1. Wo wird geändert? Nur im Admin

- **„Galerie gestalten“** (Texte, Willkommensbild, Galerie-Karte, virtueller Rundgang, etc.) lebt ausschließlich im **Admin** (Tab Design in `ScreenshotExportAdmin`).
- Auf den **öffentlichen Seiten** (GaleriePage, GalerieVorschauPage, Vk2GaleriePage, Vk2GalerieVorschauPage) gibt es **keine** Eingabefelder oder Buttons zum Speichern von Seitentexten oder -bildern.
- Dort wird nur **gelesen**: `getPageContentGalerie(tenantId)`, `getPageTexts(tenantId)` – keine Aufrufe von `setPageContentGalerie` oder `setPageTexts` (die Schreibfunktionen aus den Config-Modulen).

---

## 2. Schreibzugriffe nur aus dem Admin

| Aktion | Funktion | Aufrufer |
|--------|----------|----------|
| Seitengestaltung speichern (Bilder, Willkommen, etc.) | `setPageContentGalerie(..., tenantId)` | nur **ScreenshotExportAdmin** (Design-Tab, Auto-Save) |
| Seitentexte speichern | `setPageTexts(..., tenantId)` | nur **ScreenshotExportAdmin** (Design-Tab, Auto-Save) |

- **Quellen:** `src/config/pageContentGalerie.ts`, `src/config/pageTexts.ts`.
- **Aufrufer im Produktivcode:** ausschließlich `components/ScreenshotExportAdmin.tsx`.  
- Die öffentlichen Seiten rufen diese Schreibfunktionen **nicht** auf (Vk2GaleriePage/Vk2GalerieVorschauPage nutzen lokalen React-State `setPageTexts` nur zum **Anzeigen** nach Reload, nicht die Config-`setPageTexts`).

---

## 3. Zugang zum Admin

- **ök2:** Admin unter `/admin?context=oeffentlich`. Auf der öffentlichen Demo-Galerie gibt es für **Fremde** keinen direkten Link dorthin (nur „Mit mir in den Admin“ über Guide/mein-bereich). Wer die URL kennt, kann nur **lokal** (eigenes localStorage) etwas ändern – nicht die für alle sichtbare Veröffentlichung.
- **VK2:** Admin nur nach Login (Vk2MitgliedLoginPage: Name + PIN). Vorstand kommt so in den Admin; normale Besucher der Vereinsgalerie haben keinen Link in den Admin und keine Zugangsdaten.

---

## 4. Was ein Besucher nicht kann

- Auf der **Galerie-Seite** (ök2 oder VK2) gibt es **keine** UI zum Bearbeiten von „Galerie gestalten“ (keine Texteingaben, kein Bild-Upload für Willkommensbild etc.).
- Selbst wenn jemand `/admin?context=oeffentlich` aufruft: Änderungen landen nur im **localStorage seines Browsers**. Die für alle sichtbare Version (z. B. gallery-data.json auf Vercel) wird nur durch **Veröffentlichen + Git Push** von der APf aus aktualisiert – nicht durch Besucher.

---

## 5. Datentrennung (Kontext)

- **ök2** schreibt nur in `k2-oeffentlich-page-content-galerie`, `k2-oeffentlich-page-texts` (und zugehörige Keys).
- **VK2** schreibt nur in `k2-vk2-page-content-galerie`, `k2-vk2-page-texts`.
- K2-Daten werden in ök2/VK2 nicht verändert (eisernes Gesetz, getrennte Keys).

---

## Kurz

**Sicherstellung:** Schreiben von Galerie-Gestaltung (Texte/Bilder) nur aus dem Admin; öffentliche Galerie-Seiten sind rein lesend. Zugang zum Admin: ök2 ohne direkten Link für Fremde, VK2 mit PIN-Login. Änderungen von Dritten betreffen höchstens deren eigenes localStorage, nicht die veröffentlichte Galerie.
