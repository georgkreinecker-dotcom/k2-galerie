# Analyse: Admin/Build-Desaster 06.03.26

**Zweck:** Verstehen, was schiefgelaufen ist, und dokumentieren, damit so etwas nicht wieder passiert.

---

## 1. Was war das „Riesendesaster“? (für Georg)

- **Symptom:** Der **Admin** (Design, Werke, Einstellungen, alles in der APf) war **nicht mehr nutzbar**, weil jeder **Deploy auf Vercel fehlschlug**. Der **Build** (TypeScript/JSX) war rot.
- **Folge:** Du konntest **keine neuen Änderungen** mehr ausliefern. **Mobile** zeigte nur noch den **letzten erfolgreichen Stand** – alles, was danach gepusht wurde, landete nie auf Vercel, weil der Build abbrach.
- **Wahrnehmung:** „Admin funktioniert nicht mehr“ – technisch: nicht die Admin-App an sich, sondern **kein neuer Build** = keine neue Version = Admin und Galerie blieben auf altem Stand.

---

## 2. Technische Ursache (kurz)

Zwei getrennte Fehler haben den Build blockiert:

### A) ScreenshotExportAdmin.tsx – JSX-Struktur-Chaos

- **Ort:** Design-Tab → **Vorschau** (der große Block „Deine Galerie gestalten“ mit Zoom, Seite 1/2, Farben).
- **Problem:** Ein **riesiger Block** (~760 Zeilen) stand **direkt im JSX** hinter einem Conditional:
  ```jsx
  {designSubTab === 'vorschau' && (
    <div>
      ...
      {(() => { return ( <> ... innere IIFE ... </> ); })()}
    </div>
  )}
  ```
- **Warum es kippte:** In diesem Block stehen mehrere `);` – eines schließt das `return` der inneren IIFE, eines der äußeren. Der **Parser** (TypeScript/JSX) hat das erste `);` dem **äußeren** `( ... )` des Conditionals zugeordnet. Dann waren die folgenden `</div>`, `</>`, `)}` „waise“ – der Parser meldete: **')' expected**, **Expected corresponding closing tag for JSX fragment**.
- **Versuchte „Fixes“ (die nicht halfen):** Wrapper-`<div>`, Fragment `<>...</>`, zusätzliche Klammern um IIFEs, Ternary statt `&&`. Alles blieb im **gleichen JSX-Baum** – solange dort `);` und schließende Klammern stehen, die der Parser mit dem Conditional verwechseln kann, bleibt das Problem.
- **Richtige Lösung:** Den **gesamten Vorschau-Inhalt** in eine **Hilfsfunktion** auslagern, **außerhalb** des JSX, z. B. `const renderDesignVorschau = () => { return ( <div>...</div> ); };` und im JSX nur noch: `{designSubTab === 'vorschau' && renderDesignVorschau()}`. Dann gibt es **kein** `);` mehr im gleichen Baum wie das Conditional – der Parser ist zufrieden.

### B) GaleriePage.tsx – navigate in Unterkomponente

- **Ort:** Die **Unterkomponente** `GalerieEntdeckenGuide` (ök2-Entdecken-Guide mit „In den Admin“).
- **Problem:** In der Komponente wurde `navigate(adminUrl)` aufgerufen, aber **navigate** war dort **nicht definiert**. `useNavigate()` steht in der **übergeordneten** GaleriePage – eine **andere** Funktion (GalerieEntdeckenGuide) hat keinen Zugriff darauf.
- **Lösung:** In **GalerieEntdeckenGuide** am Anfang `const navigate = useNavigate();` ergänzt. Jede Komponente, die Router-Funktionen nutzt, muss den Hook **selbst** aufrufen.

---

## 3. Warum wurde es zum „Desaster“?

1. **Dateigröße:** ScreenshotExportAdmin ist extrem groß (~19.000 Zeilen). Ein ~760-Zeilen-Block in der Mitte zu „reparieren“, indem man Klammern oder Wrapper verschiebt, ist fehleranfällig – jede kleine Änderung kann an anderer Stelle neue Parser-Fehler erzeugen.
2. **Symptom vs. Ursache:** Die Fehlermeldungen („')' expected“, „closing tag for fragment“) deuteten auf **Klammer-/Tag-Reihenfolge** hin. Der naheliegende Versuch war: mehr Klammern, bessere Wrapper. Die **eigentliche** Ursache war: **zu viel komplexe Struktur (Conditional + IIFEs + Fragments) in einem JSX-Ausdruck**. Das löst man nicht mit Kosmetik, sondern mit **Auslagerung**.
3. **Build rot = alles blockiert:** Sobald der Build einmal rot war, blockierte **jeder** Push. Es gab keinen „Teil-Deploy“ – entweder der Build geht durch oder nichts Neues geht live. Dadurch wirkte das Problem wie ein Totalausfall.

---

## 4. Regeln / Prävention (damit es nicht wieder passiert)

### 4.1 Große/komplexe Blöcke im JSX

- **Regel:** Wenn ein **Conditional** (`&&` oder `? :`) einen **sehr großen** oder **strukturell komplexen** Block rendert (viele Zeilen, **verschachtelte IIFEs**, mehrere `return ( ... );`), diesen Block **nicht** im JSX lassen. **Auslagern** in eine Hilfsfunktion im Komponenten-Body (z. B. `const renderX = () => { return ( ... ); };`) und im JSX nur `{condition && renderX()}` aufrufen.
- **Warum:** So vermeidet man, dass der Parser `);` und `}` aus dem Block mit dem umgebenden Conditional verwechselt. Eine klare, bewährte Praxis.

### 4.2 Build darf nicht dauerhaft rot bleiben

- **Regel:** Der **Build muss grün** sein, bevor man die Arbeit als „fertig“ lässt oder in ein anderes Thema wechselt. Ist der Build rot, **sofort** beheben oder (wenn nötig) die letzte Änderung zurücknehmen, bis wieder grün.
- **Konsequenz:** Kein „wir fixen das später“ bei Build-Fehlern – sonst blockiert jeder folgende Push (wie in diesem Fall).

### 4.3 Unterkomponenten und Hooks

- **Regel:** Jede **eigene Funktion/Komponente** (z. B. `function GalerieEntdeckenGuide(...)`) hat ihren **eigenen** Hook-Scope. Braucht sie `navigate`, **muss** sie **selbst** `useNavigate()` aufrufen – sie erbt **nicht** die Hooks der Parent-Komponente.
- **Checkliste:** Wenn in einer Unterkomponente `navigate`, `location` o. Ä. verwendet wird: Steht `useNavigate()` / `useLocation()` **am Anfang** dieser Komponente? Sonst: ergänzen. (Vgl. .cursor/rules/variable-vor-verwendung-hooks.mdc.)

### 4.4 ro5 / Nach Crash

- **Regel:** Wenn ein Fix (wie „Design-Vorschau“) **dokumentiert** ist (z. B. in WEITERARBEITEN-NACH-ABSTURZ oder CRASH-BEREITS-GEPRUEFT), **nicht** wieder einen **anderen** Ansatz (Wrapper, IIFE-Kosmetik) versuchen. Die Doku sagt: **Auslagerung in Funktion** war der richtige Weg. (Siehe Abschnitt „ro5 / Code-5“ in WEITERARBEITEN-NACH-ABSTURZ.md.)

---

## 5. Kurzfassung

| Was | Ursache | Prävention |
|-----|---------|------------|
| Admin „kaputt“ / Build rot | JSX: riesiger Conditional-Block mit IIFEs → Parser-Chaos; plus navigate in Unterkomponente ohne useNavigate | Große/complexe Blöcke in Hilfsfunktion auslagern; Build nie dauerhaft rot lassen; Hooks in jeder Komponente, die sie braucht |
| Warum so lange Leid? | Fix-Versuche im JSX (Wrapper, Klammern) statt Auslagerung; Datei riesig → Fehler schwer lokalisierbar | Regel: bei Parser-Chaos in großem Block → Auslagern, nicht weiter im Baum herumdoktern |

---

## 6. Verweise

- **Fix (06.03.26):** ScreenshotExportAdmin: `renderDesignVorschau()`; GaleriePage: `useNavigate()` in GalerieEntdeckenGuide. DIALOG-STAND 06.03.26, WEITERARBEITEN-NACH-ABSTURZ (ro5 + Design-Vorschau-Fix), CRASH-BEREITS-GEPRUEFT.
- **Regeln:** variable-vor-verwendung-hooks.mdc (Hooks vor Verwendung; Router-Hooks am Anfang); bei ähnlichen JSX-Problemen: diese Analyse + Auslagerungs-Regel oben.
