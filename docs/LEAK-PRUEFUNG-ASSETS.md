# Leak-Prüfung: Assets & Kontext (Sportwagenmodus)

**Regel:** Ein Asset, ein Zweck. Keine statische Datei darf sowohl von einer **globalen/öffentlichen Seite** genutzt werden als auch von **User-Upload** überschreibbar sein.

---

## Behobener Leak (Michal-Foto auf Entdecken)

| Was | Problem | Lösung |
|-----|---------|--------|
| **willkommen.jpg** | EntdeckenPage (Landing) zeigte dasselbe Bild wie ök2-Demo. Upload im ök2-Admin überschrieb die Datei → Test-Foto erschien weltweit. | (1) EntdeckenPage nutzt nur **willkommen.svg** (fest, nie überschrieben). (2) Admin-Upload für ök2 schreibt in **willkommen-demo.jpg**, nie in willkommen.jpg. |

**Betroffene Stellen:** `EntdeckenPage.tsx` (Hero-Bild), `ScreenshotExportAdmin.tsx` (welcomeFilename = willkommen-demo.jpg bei context oeffentlich), `tenantConfig.ts` (OEK2_WILLKOMMEN_IMAGES.welcomeImage = Fallback willkommen.jpg).

---

## Geprüft – keine weiteren Leaks

| Bereich | Prüfung | Ergebnis |
|---------|----------|----------|
| **galerie-card.jpg / virtual-tour.jpg** | Upload via uploadPageImageToGitHub(file, field, filename) – verwendet **tenant** (K2/ök2/VK2) und schreibt in den passenden Subfolder. Nur Galerie-Seiten zeigen diese Bilder, immer mit Kontext. | ✅ Kein globales Asset betroffen |
| **virtual-tour.mp4** | uploadVideoToGitHub schreibt immer nach `/img/k2/`. Nur aufgerufen wenn **!tenant.isOeffentlich** – ök2 lädt kein Video nach GitHub. | ✅ ök2 überschreibt K2-Video nicht |
| **WillkommenPage** | Lädt keine getPageContentGalerie/welcomeImage, nur Slogan/Name aus localStorage (Marketing). | ✅ Kein Bild-Leak |
| **FlyerK2GaleriePage** | getGalerieImages(stamm) ohne tenantId → K2. Nur APf/Werkzeug für K2. | ✅ K2-only |
| **pageContentGalerie** | ök2-Key bereinigt K2-Pfade (/img/k2/) und blob:-URLs. getPageContentGalerie(tenantId) wird mit korrektem Tenant aufgerufen (GaleriePage: musterOnly ? 'oeffentlich' : undefined). | ✅ Trennung eingehalten |

---

## Checkliste bei neuen Assets/Uploads

- [ ] Wird die Datei auf einer **globalen** Seite angezeigt (z. B. /entdecken, Landing ohne Login)? → Dann **darf** sie nicht von User-Upload überschrieben werden (eigenes Dateiname/Subfolder oder nur feste Datei im Repo).
- [ ] Upload mit Kontext (K2/ök2/VK2)? → Immer **eigenen** Dateinamen oder Subfolder für ök2 nutzen, wenn dieselbe Basis-Datei auch global genutzt wird (z. B. willkommen-demo.jpg statt willkommen.jpg für ök2).
- [ ] Neue „öffentliche“ Seite? → Keine Bilder aus localStorage/getPageContentGalerie ohne festen Tenant; nur feste Repo-Assets oder explizit tenant-spezifische Quellen.

---

## Bild auf der Entdecken-Seite austauschen

**Ein Klick (für dich als normaler User):** Admin → **Design** → oben im Bereich „Entdecken-Seite (Landing)“ auf **Bild wählen** klicken → Bild auswählen → Fertig. In ca. 2 Minuten erscheint es auf der Entdecken-Seite. (Nur im K2-Admin sichtbar, nicht in der Demo.)

Technisch: Das Hero-Bild kommt aus `/img/oeffentlich/entdecken-hero.jpg`. Wenn noch keins hochgeladen wurde, wird automatisch `willkommen.svg` angezeigt. Upload schreibt nur in `entdecken-hero.jpg` (nie in willkommen.jpg oder willkommen-demo.jpg).

---

## Kurzfassung

**Ein Asset, ein Zweck.** Global sichtbare Dateien (Entdecken, Landing) = nur feste Dateien im Repo oder SVG. User-Upload (Admin) = immer in tenant-spezifische Dateien (z. B. willkommen-demo.jpg für ök2), nie in die gleiche Datei wie die Landing.
