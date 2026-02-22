# Dialog-Stand

## Datum: 22.02.26

## Thema: Design-Tab Bilder – Root-Cause gefunden und gefixt

## Was der echte Bug war:
- sessionStorage behielt `k2-admin-context = 'oeffentlich'` nach ök2-Admin-Besuch
- Beim nächsten K2-Admin-Aufruf (ohne ?context=) dachte Code: "ich bin im ök2-Kontext"
- → Bilder wurden in ök2-Keys gespeichert (k2-oeffentlich-page-content-galerie)
- → K2-Galerie las aus K2-Keys (k2-page-content-galerie) → leer → altes Bild
- → Beim Zurückgehen lud Admin neu → las aus K2-Keys → auch leer → Foto weg

## Was gefixt wurde (MIT Commit-Hash):
- K2-Admin löscht beim Start sessionStorage-Kontext wenn kein ?context= Parameter – Commit: 94b52ae ✅
- pageContentGalerie: 6MB-Limit-Check entfernt (raw.length > 0 statt < 6MB) – Commit: 94b52ae ✅

## Nächster Schritt:
- Nach Vercel-Deployment (~2 Min): Design-Tab testen
- WICHTIG: Einmal den Browser-Tab komplett neu laden (damit sessionStorage sauber ist)
- Dann Foto reinziehen → Galerie ansehen → Foto muss sichtbar sein
- Beim Zurückgehen → Foto muss noch da sein

## Wo nachlesen:
- `components/ScreenshotExportAdmin.tsx` → useEffect URL-Parameter context (Zeile ~1250)
- `src/config/pageContentGalerie.ts` → getPageContentGalerie
