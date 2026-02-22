# Dialog-Stand

## Datum: 22.02.26

## Thema: ök2 Design-Tab – Fotos laden nicht in Vorschau

## Was der Bug war:
- `pageContentGalerie.ts` hat ALLE `data:` (Base64) Bilder für ök2 sofort wieder gelöscht
- Das war falsch: `data:` Bilder sind vom User hochgeladen – kein K2-spezifischer Inhalt
- Nur echte K2-Serverpfade (`/img/k2/`, `/img/` außer `/img/oeffentlich/`) sind gefährlich
- Ergebnis: Foto reinziehen → kurz im State sichtbar → beim nächsten Lesen aus localStorage weg

## Was gefixt wurde (Commit 88fd0c4):
- `pageContentGalerie.ts`: Nur `/img/k2/` und `/img/` (außer `/img/oeffentlich/`) Pfade löschen
- `data:` Bilder NICHT löschen (User-Upload, harmlos für ök2)
- `blob:` URLs weiterhin löschen (session-gebunden, nach Reload ungültig)

## Nächster Schritt nach Vercel-Deployment (~2 Min):
- ök2-Admin → Design-Tab öffnen
- Foto reinziehen → muss SOFORT in der Vorschau sichtbar sein
- "Galerie ansehen" → Foto muss auch dort erscheinen
- Zurückgehen → Foto noch da

## Wo nachlesen:
- `src/config/pageContentGalerie.ts` → `getPageContentGalerie` (isK2ServerMedia)
- `components/ScreenshotExportAdmin.tsx` → `syncAdminContextFromUrl()` (Zeile ~17)
