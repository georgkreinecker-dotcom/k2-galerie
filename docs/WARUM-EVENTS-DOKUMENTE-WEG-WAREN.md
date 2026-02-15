# Warum Events und Dokumente (Öffentlichkeitsarbeit) weg waren

**Stand:** Februar 2026 – Analyse nach den Fixes

---

## Kurzfassung

Es gab **zwei technische Ursachen**, die zusammenspielten. Beide sind inzwischen behoben.

---

## Ursache 1: Beim Veröffentlichen wurde nur aus dem localStorage gelesen

**Was passiert beim Klick auf „Veröffentlichen“?**

- Es wird eine große JSON (Stammdaten, Werke, Events, Dokumente, …) gebaut und an den Server geschickt.
- **Früher** wurden Events und Dokumente dafür **nur** aus dem **localStorage** geholt (`getItemSafe('k2-events')`, `getItemSafe('k2-documents')`).
- Was du **gerade im Admin siehst**, kommt aus dem **React-State** (Arbeitsspeicher der Seite). Der wird alle 5 Sekunden in den localStorage geschrieben – aber **nicht** in dem Moment direkt für den Export genutzt.

**Folge:**

- Wenn in dem Moment, in dem „Veröffentlichen“ geklickt wurde, im localStorage **keine** oder **leere** Events/Dokumente standen (z. B. anderer Tab, Seite gerade erst geladen, oder localStorage aus anderem Grund leer), wurde eine **gallery-data.json mit leeren Events und Dokumenten** erzeugt und hochgeladen.
- Damit war die **einzige autoritative Kopie auf dem Server** (nach Git Push) plötzlich **ohne** diese Daten – sie waren faktisch „weg“, sobald jemand diese neue Datei wieder lud.

**Fix (bereits umgesetzt):**  
Beim Export werden jetzt **zuerst** die Daten aus dem **aktuellen Admin-State** (Events, Dokumente) verwendet. Nur wenn dort nichts ist, wird aus dem localStorage gelesen. So geht das, was du siehst, zuverlässig in die gallery-data.json.

---

## Ursache 2: Beim Laden der gallery-data.json wurden Dokumente nicht zurückgeschrieben

**Was passiert beim Laden der Galerie-Seite oder bei „Aktualisieren“?**

- Die App lädt die Datei **gallery-data.json** (vom Server bzw. von Vercel).
- Aus dieser Datei werden die Daten wieder in den **localStorage** des Browsers geschrieben, damit Admin und Galerie sie nutzen können.

**Früher:**

- Es wurden **nur** Stammdaten, Werke und **Events** aus der Datei in den localStorage übernommen.
- **Dokumente** (und Seitentexte) aus der gallery-data.json wurden **nicht** in den localStorage geschrieben.
- Selbst wenn die Datei auf dem Server noch Dokumente enthielt, kamen sie nach einem „Aktualisieren“ oder Neuladen **nicht** zurück in die App – sie blieben unsichtbar.

**Folge:**

- Sobald einmal eine **gallery-data.json mit leeren Dokumenten** veröffentlicht worden war (Ursache 1), und du dann die Seite neu geladen oder „Aktualisieren“ geklickt hattest, wurden **keine** Dokumente mehr aus der Datei in den Speicher übernommen.
- Umgekehrt: Wenn die Datei doch noch Dokumente hatte, hast du sie trotzdem nicht wiederbekommen, weil der Code sie beim Laden **ignorierte**.

**Fix (bereits umgesetzt):**  
Beim Laden der gallery-data.json werden jetzt **auch** Dokumente (und Seitentexte, Design-Einstellungen) in den localStorage geschrieben. Alles, was in der Datei steht, kommt wieder in die App.

---

## Warum sie „auf einmal wieder da“ sein können

- **Wenn die gallery-data.json auf dem Server noch Dokumente enthielt** (z. B. von einem älteren Veröffentlichen vor dem „schlechten“ Lauf): Sobald du nach dem Fix die Galerie-Seite neu geladen oder „Aktualisieren“ geklickt hast, wurden diese Dokumente **jetzt erstmals wieder** in den localStorage übernommen → sie erscheinen wieder.
- **Wenn auf diesem Gerät/Browser** im localStorage oder im automatischen Vollbackup noch alte Daten lagen, können sie dort die ganze Zeit dagewesen sein und nach Reload oder nach „Aus letztem Backup wiederherstellen“ wieder sichtbar geworden sein.

---

## Zusammenfassung

| Problem | Ursache | Fix |
|--------|---------|-----|
| Leere Events/Dokumente in gallery-data.json | Export nutzte nur localStorage; der konnte in dem Moment leer sein | Export nutzt zuerst den aktuellen Admin-State (Events, Dokumente) |
| Dokumente kamen nach Laden nicht zurück | Beim Laden der gallery-data.json wurden Dokumente nicht in den localStorage geschrieben | Beim Laden werden jetzt auch Dokumente (und Seitentexte etc.) wiederhergestellt |

Du kannst dich jetzt darauf verlassen, dass (1) beim Veröffentlichen das, was du im Admin siehst, mitgeht, und (2) beim Laden der Datei alle Bereiche – inkl. Dokumente – wieder in die App übernommen werden.

---

## Zusatz-Fix (14.02.26): Sofort-Speicherung überschrieb Events

**Ursache 3:** Beim Tab-Wechsel oder Schließen der Seite wird `saveNow(getData)` aufgerufen. Lieferte `getData()` in dem Moment noch **leere** Events (z. B. weil die Admin-Seite gerade geladen war und der State aus localStorage noch nicht da war), wurden vorhandene Events im localStorage mit `[]` überschrieben → **Events weg**.

**Fix:** In `saveNow()` (autoSave.ts) werden Events und Dokumente **nur noch geschrieben, wenn** nicht gleichzeitig im localStorage bereits welche stehen und die neuen Daten leer wären. Damit können lokale Events/Dokumente nicht mehr durch „leeren“ State gelöscht werden.
