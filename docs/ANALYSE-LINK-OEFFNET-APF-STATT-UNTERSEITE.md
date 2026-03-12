# Analyse: Link öffnet nur APf statt Unterseite (Wiederholung 10×)

**Datum:** 12.03.26  
**Meldung:** „Link öffnet wieder nur APf wie vorher“ / „dieser Fehler passiert dir jetzt schon das 10.mal wo bleibt fehleranalyse“

---

## 1. Fehlerklasse

**Name:** Link zu Projekt-Unterseite öffnet APf (Startseite/DevView) statt die verlinkte Seite.

**Typische betroffene Links:** Präsentationsmappe Vollversion, Kombiniert, ök2/VK2 Kurz/Lang, andere Projekt-Unterseiten (Werbeunterlagen, Handbuch, etc.), die aus dem Admin mit „in neuem Tab öffnen“ geöffnet werden.

---

## 2. Ursachen (warum landet man auf der APf?)

1. **Route fehlt oder steht an falscher Stelle**  
   In React Router v6 gewinnt die **erste** passende Route. Die Route `/projects/:projectId` (ProjectStartPage = APf) matcht nur **zwei** Segmente (`/projects/k2-galerie`).  
   Pfade mit **drei** Segmenten (z. B. `/projects/k2-galerie/praesentationsmappe-vollversion`) matchen **nur**, wenn eine **spezifische** Route dafür **vor** `/projects/:projectId` steht.  
   Steht die Unterseiten-Route **nach** `/projects/:projectId` oder fehlt sie, wird sie nie gematcht. Dann fällt die App auf die Catch-all-Route `path="*"` → `<Navigate to="/" />` → Nutzer sieht die Root-Seite = auf Desktop die APf (DevView).

2. **Deploy-Stand**  
   Wenn die **spezifische Route** erst im Code ergänzt wurde, aber noch **nicht** auf Vercel gepusht/gebaut wurde, kennt die laufende App die Route nicht → wieder `*` → `/` → APf.

3. **Link zeigt nicht auf die volle Ziel-URL**  
   Wenn der Link z. B. nur `href="/projects/k2-galerie"` hätte (ohne den Rest), würde man die APf sehen. Korrekt ist: `href={BASE_APP_URL + path}` mit `path` aus `PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion` etc.

---

## 3. Wo die Routen und Links liegen

| Was | Datei / Stelle |
|-----|-----------------|
| **Routen** (Reihenfolge wichtig) | `src/App.tsx` – alle `/projects/k2-galerie/...`-Unterseiten **vor** Zeile mit `<Route path="/projects/:projectId" />` |
| **Pfade (eine Quelle)** | `src/config/navigation.ts` – `PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion` etc. |
| **Links im Admin** | `components/ScreenshotExportAdmin.tsx` – Tab „Präsentationsmappen“ und Design-Karte: `<a href={BASE_APP_URL + path} target="_blank">` mit `path` aus PROJECT_ROUTES |

---

## 4. Richtige Lösung (wie bei Kombiniert und den 4 Varianten)

**Präsentationsmappe:** Es gibt **eine** Route: `/projects/k2-galerie/praesentationsmappe`. Alle Varianten (Kombiniert, ök2 Kurz/Lang, VK2 Kurz/Lang, **Vollversion**) kommen über **Query-Parameter** `?variant=...`. Keine zweite Route für Vollversion – sonst wieder „Link öffnet APf“. In navigation.ts: `praesentationsmappeVollversion: '/projects/k2-galerie/praesentationsmappe?variant=vollversion'`. In PraesentationsmappePage: wenn `variantParam === 'vollversion'` → `<PraesentationsmappeVollversionPage />` rendern. **Fehleranalyse = bestehende Lösung (die 5 Einträge) 1:1 anwenden, Rad nicht zweimal erfinden.**

---

## 5. Pflicht-Checkliste bei neuer Projekt-Unterseite

- [ ] **navigation.ts:** Neuer Eintrag unter `PROJECT_ROUTES['k2-galerie']` (und ggf. in den anderen Projekt-Objekten, die dieselbe Route nutzen).
- [ ] **App.tsx:** Neue Route **vor** der Zeile `<Route path="/projects/:projectId" element={<ProjectStartPage />} />` einfügen (nicht dahinter).
- [ ] **Admin-Links:** Wenn der Link im Admin angeboten wird: `path` aus `PROJECT_ROUTES['k2-galerie'].xyz` und `href={BASE_APP_URL + path}` sowie `target="_blank"`.
- [ ] **Nach Änderung:** Build (`npm run build`) und Push, damit Vercel die Route ausliefert.

---

## 6. Absicherung (damit es nicht wieder passiert)

- **Regel:** `.cursor/rules/link-projekt-unterseite-nie-apf.mdc` – bei neuer Projekt-Unterseite und bei „Link öffnet APf“ zuerst lesen.
- **App.tsx:** Kommentar-Block oberhalb der Projekt-Routen verweist auf diese Regel und auf die Reihenfolge (spezifische Routen vor `/projects/:projectId`).
- **Catch-all:** Wenn die URL wie eine bekannte Unterseite aussieht, aber keine Route greift, nicht still zu `/` umleiten, sondern kurzen Hinweis anzeigen („Seite nicht gefunden. Bitte Stand aktualisieren (Commit/Push).“) – siehe BUG-034.

---

## 7. Kurzfassung

**Link öffnet APf** = entweder Route fehlt/falsche Reihenfolge, oder alter Deploy. **Fix:** Route in App.tsx **vor** `/projects/:projectId`, Link mit `BASE_APP_URL + path`, Push. **Absicherung:** Checkliste, Regel, Catch-all-Hinweis statt stiller Redirect.
