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

## Getroffene Fixes (Code)

- **TenantContext.tsx:** `/admin` ohne `?context=` → immer `'k2'`; syncStorageFromUrl: ohne context → `'k2'` setzen.
- **ScreenshotExportAdmin.tsx:** Grüner Balken und beide Guide-Panels mit `false &&` dauerhaft deaktiviert; der **normale Hub** („Was möchtest du heute tun?“ + Kacheln) wird **immer** gerendert – für K2, VK2 und ök2 gleich.

---

## Verbindliche Regeln (damit es 100 % nicht wieder passiert)

1. **Ein Layout für alle:** Admin-Startseite = ein Hub („Was möchtest du heute tun?“ + Kacheln) für K2, ök2 und VK2. Kein kontextabhängiges Ersetzen durch anderes UI (kein Guide-Balken, keine Guide-Panels im Admin).

2. **Guide nur in GlobaleGuideBegleitung:** Guide für neue Besucher = nur der schwarze Dialog; Ende wenn User „Jetzt starten“ / ID anlegt (`beendeGuideFlow()` in `fertigStellen()`). Kein Guide-UI (Balken, Panels) in ScreenshotExportAdmin.

3. **Kontext bei /admin:** `/admin` ohne `?context=` = immer K2. Nicht aus sessionStorage ableiten.

4. **Tote Blöcke nicht reaktivieren:** Die mit `false &&` abgeschalteten Blöcke (grüner Balken, zwei Guide-Panels) in ScreenshotExportAdmin nicht wieder aktivieren – sie verletzen die einheitliche Admin-Startseite.

---

## Checkliste bei künftigen Admin-Änderungen

Vor Änderungen an TenantContext, Admin-Route, ScreenshotExportAdmin (Hub/Guide-Bereiche) oder GlobaleGuideBegleitung:

- [ ] `/admin` ohne context = K2?
- [ ] Hub für K2, ök2, VK2 dasselbe Layout?
- [ ] Kein neues „zweites“ Layout pro Kontext (kein Guide-Balken/Panel im Admin)?
- [ ] Guide = nur GlobaleGuideBegleitung?

---

## Verknüpfung

- **Regel (alwaysApply):** .cursor/rules/admin-einheitliches-layout.mdc  
- **Ein Standard pro Problem:** .cursor/rules/ein-standard-problem.mdc (Tabelle: Admin-Startseite)
