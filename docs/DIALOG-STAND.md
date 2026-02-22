# Dialog-Stand

## Datum: 22.02.26

## Thema: ök2 vs K2 Admin – visuelle Unterscheidung + Zurück-Button Fix

## Was gefixt wurde (Commit 9a222fc):
1. **ök2-Admin Header**: Kein "K2 Galerie" Logo mehr – zeigt jetzt "ök2 / Muster-Galerie"
2. **ADMIN-Badge**: Nur noch bei K2 und VK2, nicht bei ök2
3. **Zurück-Button** (gelber Balken in Vorschau): Navigiert jetzt korrekt zurück
   - ök2-Vorschau → zurück zu `/admin?context=oeffentlich` ✅
   - K2-Vorschau → zurück zu `/admin` ✅
   - (GaleriePage + GalerieVorschauPage beide gefixt)

## Davor gefixt (Commit 88fd0c4):
- ök2: data:-Bilder (Base64 User-Uploads) werden nicht mehr gelöscht
- Fotos im Design-Tab erscheinen jetzt in der Vorschau

## Davor gefixt (Commit f83c510):
- Race Condition: syncAdminContextFromUrl() vor useState → ök2 zeigt keine K2-Fotos mehr

## Nächster Schritt:
- Nach Vercel-Deployment (~2 Min) testen:
  - ök2-Admin öffnen → Header zeigt "ök2 / Muster-Galerie" (nicht K2)
  - Design-Tab → Foto einladen → sichtbar in Vorschau
  - "Galerie ansehen" → Foto auch dort sichtbar
  - Zurück (gelber Balken) → landet im ök2-Admin (nicht K2)

## Wo nachlesen:
- `components/ScreenshotExportAdmin.tsx` → Header-Bereich (Logo, ~Zeile 7867)
- `src/pages/GaleriePage.tsx` → isVorschauModus Zurück-Button (~Zeile 2038)
- `src/pages/GalerieVorschauPage.tsx` → isVorschauModus Zurück-Button (~Zeile 2147)
