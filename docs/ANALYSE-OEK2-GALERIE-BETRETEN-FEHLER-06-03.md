# Analyse: ök2 „Galerie betreten“ – App-Fehler & Fix (06.03.26)

## Was passiert ist

1. **Georg:** „In ök2 öffnet die Galerie betreten nicht.“  
2. **Erste Änderung:** Damit der Klick „Galerie betreten“ nicht sofort zurück zur Willkommensseite redirectet, wurde `location.state.fromOeffentlichGalerie` genutzt. Dafür:
   - GaleriePage: Link und Modal setzen `state: { fromOeffentlichGalerie: true }`.
   - GalerieVorschauPage: Im Redirect-useEffect wurde geprüft `location.state?.fromOeffentlichGalerie === true` und `location.state` in die Dependency-Liste des useEffects aufgenommen.
3. **Neuer Fehler:** Nach Klick „Galerie betreten“ → **„Cannot access uninitialized variable“** in GalerieVorschauPage.tsx Zeile 247.
4. **Fix:** `const location = useLocation()` wurde von weiter unten (ca. Zeile 465) **an den Anfang der Komponente** verschoben (direkt nach `useNavigate()`).

## Ursache (technisch)

- **Variable vor Deklaration verwendet:** Im Redirect-useEffect (Zeilen 281–291) wurde `location` verwendet – sowohl im Effect-Body als auch in der Dependency-Liste `[musterOnly, navigate, location.state]`.
- **Späte Deklaration:** `const location = useLocation()` stand erst rund 250 Zeilen weiter unten in derselben Komponente.
- In JavaScript/TypeScript gilt für `const`/`let`: Zwischen dem Anfang des Blocks und der Zeile der Deklaration liegt die **temporal dead zone**. Jeder Zugriff auf `location` vor seiner Deklaration führt zu „Cannot access uninitialized variable“.
- Beim ersten Render wird die Komponente von oben nach unten ausgeführt. Sobald der useCallback/useEffect mit `location` in den Dependencies oder im Body ausgewertet wird, muss `location` bereits existieren – sonst genau dieser Laufzeitfehler.

## Lehre für künftige Änderungen

- **Regel:** Wenn du **eine Variable** (z. B. `location`, `navigate`, ein State) **in einem Hook** (useEffect, useCallback, useMemo) oder in frühem Code **verwendest**, muss die **Deklaration dieser Variable** (z. B. `useLocation()`, `useNavigate()`, `useState()`) **oberhalb** dieser Verwendung stehen.
- **Checkliste vor Commit:** In der geänderten Komponente prüfen: Für jede in Hooks oder Dependencies genutzte Variable – ist der zugehörige Hook / die Deklaration **vor** der ersten Verwendung platziert? Gerade in großen Dateien (z. B. GalerieVorschauPage) passiert es schnell, dass man `location` oder anderes „weiter unten“ deklariert und „weiter oben“ schon nutzt.
- **Konkret bei React Router:** `useLocation()` und `useNavigate()` am **Anfang** der Komponente aufrufen, direkt nach den Props, damit alle nachfolgenden Hooks und Callbacks sie sicher nutzen können.

## Kurzfassung

| Was | Detail |
|-----|--------|
| **Symptom** | „Galerie betreten“ in ök2 → App-Fehler „Cannot access uninitialized variable“ (GalerieVorschauPage.tsx ~247). |
| **Ursache** | `location` wurde in einem useEffect (Redirect-Logik) und in dessen Dependencies verwendet, war aber erst ~250 Zeilen weiter unten mit `useLocation()` deklariert → Zugriff in der temporal dead zone. |
| **Fix** | `const location = useLocation()` an den Komponentenanfang verschieben (direkt nach `useNavigate()`). |
| **Prävention** | Bei neuer Nutzung einer Hook-Variable (location, navigate, state …) immer prüfen: Deklaration **vor** erster Verwendung; Router-Hooks am Anfang der Komponente. |

Verknüpfung: .cursor/rules/georg-merke-dir-reproduzierbarkeit.mdc („merken“ = so festhalten, dass es reproduzierbar ist).
