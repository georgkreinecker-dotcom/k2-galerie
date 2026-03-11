# Neuer Eintrag unter Notizen → Diverses (technisches Muster)

**Problemstellung:** Ein neuer Brief oder eine neue Notiz soll unter **Notizen → Diverses** im Smart Panel erscheinen und per Klick in der App lesbar sein (wie „Brief an August“, „Brief an Andreas“, „Für meine Freunde“).

## Warum zwei Ablagen?

- **`docs/notizen-georg/diverses/<datei>.md`** = Quelle (Versionierung, Bearbeitung, Doku).
- **`public/notizen-georg/diverses/<datei>.md`** = Kopie für die App: Seiten laden per `fetch('/notizen-georg/...')`; nur Dateien aus `public/` werden ausgeliefert. Ohne Kopie kann die App den Inhalt nicht anzeigen.

Bei inhaltlichen Änderungen: zuerst in `docs/` anpassen, dann dieselbe Änderung in `public/` (oder später Sync-Skript nutzen).

---

## Checkliste – neuer Eintrag (z. B. „Brief an XY“)

1. **Inhalt anlegen**
   - `docs/notizen-georg/diverses/<name>.md` erstellen (z. B. `brief-an-xy.md`).
   - Gleichen Inhalt nach `public/notizen-georg/diverses/<name>.md` kopieren.

2. **Route**
   - In `src/config/navigation.ts` bei `PROJECT_ROUTES['k2-galerie']` eintragen:
     - `notizenBriefXy: '/projects/k2-galerie/notizen/brief-an-xy'`
   - (Namenskonvention: `notizenBriefAugust`, `notizenBriefAndreas` usw.)

3. **Seite**
   - Neue Page-Komponente (z. B. `src/pages/BriefAnXyPage.tsx`):
     - Entweder Inhalt hardcoden (wie BriefAnAugustPage) **oder**
     - Markdown aus `fetch('/notizen-georg/diverses/brief-an-xy.md')` laden und rendern (wie BriefAnAndreasPage).
   - Gleicher Stil wie andere Brief-Seiten (Hintergrund, Typo, „Zurück zu Georgs Notizen“).

4. **App-Route**
   - In `src/App.tsx`: Import der neuen Page, dann
   - `<Route path={PROJECT_ROUTES['k2-galerie'].notizenBriefXy} element={<BriefAnXyPage />} />`
   - (in der Nähe der anderen Notizen-Routen.)

5. **Smart Panel – Diverses**
   - In `src/components/SmartPanel.tsx`:
     - In **DEFAULT_DIVERSES** (bzw. im Array, das `loadDiverses()` als Standard zurückgibt) einen neuen Eintrag:
       - `{ id: 'brief-xy', label: 'Brief an XY', url: PROJECT_ROUTES['k2-galerie'].notizenBriefXy, emoji: '✉️' }`
     - **Migration:** In `loadDiverses()`: Wenn aus localStorage geladen wird und der neue Eintrag (`id: 'brief-xy'`) noch fehlt, einmalig einfügen und `saveDiverses(...)` aufrufen, damit bestehende Nutzer den Eintrag ohne manuelles Löschen des Speichers sehen.

6. **NotizenPage**
   - In `src/pages/NotizenPage.tsx` in der Sektion „Diverses“ unter `items` einen Eintrag hinzufügen:
     - `{ label: 'Brief an XY', to: PROJECT_ROUTES['k2-galerie'].notizenBriefXy }`

---

## Referenz-Implementierung

- **Brief an August:** Route + eigene Page mit hardcodiertem Inhalt.
- **Brief an Andreas:** Route + Page lädt Markdown aus `public/notizen-georg/diverses/brief-an-andreas.md`, rendert mit einfachem Markdown-Parser (Überschriften, Absätze, Listen, Tabelle, Links, Fett/Kursiv). Smart Panel: DEFAULT_DIVERSES + Migration in `loadDiverses()`.

---

## Kurzfassung

**Neuer Diverses-Eintrag = (1) Inhalt in docs/ + public/, (2) Route in navigation.ts, (3) Page-Komponente + Route in App.tsx, (4) Eintrag in SmartPanel DEFAULT_DIVERSES + Migration, (5) Link in NotizenPage.** Ein Ablauf, keine Sonderwege.
