# Dialog-Stand

## Datum: 22.02.26

## Thema: Design-Tab ök2 zeigt K2-Fotos – Root-Cause definitiv gefunden

## Was der echte Bug war (Race Condition):
- `syncAdminContextFromUrl()` lief NACH den `useState`-Initialisierungen (in einem useEffect)
- Beim ersten Render: sessionStorage noch nicht gesetzt → `isOeffentlichAdminContext() = false`
- → `pageContent` wird mit K2-Keys initialisiert → K2-Bilder geladen
- → ök2-Admin zeigt K2-Fotos von Georg und Martina

## Was gefixt wurde (Commit f83c510):
- Neue Funktion `syncAdminContextFromUrl()` – setzt sessionStorage synchron aus URL
- Wird als ERSTES in `ScreenshotExportAdmin()` aufgerufen – vor allen useState
- Jetzt ist `isOeffentlichAdminContext()` beim ersten useState-Aufruf bereits korrekt
- Bei K2-Admin (kein ?context=): sessionStorage wird SOFORT gelöscht (kein "hängenbleiben")

## Nächster Schritt:
- Nach Vercel-Deployment (~2 Min): testen
- ök2-Admin öffnen (/admin?context=oeffentlich)
- Design-Tab → Foto einladen → sollte ök2-Fotos sehen, NICHT K2-Fotos
- Galerie ansehen → neues Foto sichtbar
- Zurückgehen → Foto noch da

## Wo nachlesen:
- `components/ScreenshotExportAdmin.tsx` → `syncAdminContextFromUrl()` (Zeile ~17)
- `components/ScreenshotExportAdmin.tsx` → Anfang von `ScreenshotExportAdmin()` (Zeile ~596)
