# Admin-Layout – Analyse und Regel (damit es nicht wieder passiert)

## Was das „Chaos“ war

1. **Admin „fehlte“ in K2 und VK2**
   - Kontext wurde aus sessionStorage gelesen; nach Besuch in ök2 blieb `context=oeffentlich` → Aufruf von `/admin` ohne `?context=` zeigte Demo-Admin statt K2.
   - Der normale Hub („Was möchtest du heute tun?“ + Kacheln) wurde nur gerendert, wenn `!guideFlowAktiv` war. Wenn der Guide-Flow noch aktiv war (z. B. von ök2), fehlte der Hub in K2/VK2.

2. **ök2 zeigte „falsches“ Layout**
   - Statt desselben Hubs wie K2/VK2 erschienen:
     - grüner Balken „Dein Galerie-Guide“,
     - großes Guide-Panel (Willkommens-Hub mit anderen Kacheln),
     - zweites Panel („Willkommen, [Name]! Galerie-Zentrale“).
   - Abhängig von `guideFlowAktiv`, `guideVorname`, `guideBannerClosed` und `tenant.isOeffentlich` wurde eines davon angezeigt – nie einheitlich.

3. **Drei konkurrierende Ansichten**
   - Drei verschiedene UIs für „Admin-Start“ (Balken + zwei Panel-Varianten + normaler Hub), gesteuert durch mehrere Bedingungen → leicht falsche Kombination und Verwirrung.

4. **Guide vs. Hub vermischt**
   - Guide für neue Besucher gehört in **GlobaleGuideBegleitung** (schwarzer Dialog, endet mit „ID anlegen“). Stattdessen war Guide-UI auch im Admin (Balken, Panels) eingebaut → zwei Konzepte, die sich gegenseitig blockierten.

---

## Getroffene Fixes (Code) – **Stand März 2026**

- **TenantContext.tsx:** `/admin` ohne `?context=` → immer `'k2'`; syncStorageFromUrl: ohne context → `'k2'` setzen.
- **ScreenshotExportAdmin.tsx:** Der **normale Hub** („Was möchtest du heute tun?“ + Kacheln) wird **immer** gerendert – für K2, VK2 und ök2 gleich. Die beiden großen Guide-Panels (mittlerer Willkommens-Hub, zweites Panel) bleiben mit `false &&` **aus** – kein zweites Hub-UI.
- **Grüner Orientierungs-Balken** (nur **ök2/VK2**, wenn `guideFlowAktiv`): **erlaubt** – ersetzt **nicht** den Hub, nur Text + Orientierung oben (siehe Kommentar im Code: „Kein schwarzer Dialog – nur dieser Balken“).
- **GlobaleGuideBegleitung:** **nicht** mehr global gemountet; Komponente ist **Stub** (`return null`). Zustand `k2-guide-flow` liegt in **`src/utils/k2GuideFlowStorage.ts`**.

---

## Verbindliche Regeln (aktuell – nicht mit alter Fassung verwechseln)

1. **Ein Hub-Layout für alle:** Admin-Start = immer dieselben Kacheln – K2, ök2, VK2.

2. **Kein schwarzer Vollbild-Guide über alle Routen:** `GlobaleGuideBegleitung` **nicht** in `App.tsx` einhängen (nur bei ausdrücklicher Anordnung). Ursache der früheren Doppel-UI (APf, iframe).

3. **Orientierung ök2/VK2:** **Grüner Balken** oben = **ein** erlaubter Weg für Guide-Text – **kein** Ersatz-Hub, keine zweiten Kachel-Panels.

4. **Kontext bei /admin:** `/admin` ohne `?context=` = immer K2.

5. **`false &&`-Panels** (große Guide-Panels im Admin): **nicht** wieder aktivieren – würden das einheitliche Hub-Layout brechen (das ist **nicht** dasselbe wie der grüne Balken).

---

## Checkliste bei künftigen Admin-Änderungen

Vor Änderungen an TenantContext, Admin-Route, ScreenshotExportAdmin (Hub/Guide-Bereiche) oder GlobaleGuideBegleitung:

- [ ] `/admin` ohne context = K2?
- [ ] Hub für K2, ök2, VK2 dasselbe Layout?
- [ ] Kein globales erneutes Mounten von `GlobaleGuideBegleitung` ohne Anordnung?
- [ ] Grüner Balken nur als **Zusatz** zur Orientierung – Hub bleibt sichtbar?

**Verbindliche Quelle:** `.cursor/rules/admin-einheitliches-layout.mdc` und `.cursor/rules/guide-nahtlos-begleitung.mdc` (immer aktueller als diese Analyse-Datei bei Widerspruch).

---

## Verknüpfung

- **Regel (alwaysApply):** .cursor/rules/admin-einheitliches-layout.mdc  
- **Ein Standard pro Problem:** .cursor/rules/ein-standard-problem.mdc (Tabelle: Admin-Startseite)
