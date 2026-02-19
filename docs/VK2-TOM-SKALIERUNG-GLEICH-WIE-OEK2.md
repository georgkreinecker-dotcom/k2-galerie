# Tom-Galerie & Admin = identisch mit ök2 (Skalierungsregel)

## Was die Skalierungsregel verlangt

- **Eine Struktur, viele Instanzen:** Gleiche Architektur (Willkommensseite, Galerie, Admin) für K2, ök2, VK2-Mitglieder.
- **Kontext/Mandant** steuert nur: welche Daten, welches Design – nicht anderen Ablauf oder andere UX.
- Tom-Galerie und Tom-Admin sollen **dieselbe** Oberfläche und denselben Ablauf haben wie ök2; nur die **Inhalte** (Werke, Fotos, Stammdaten) sind andere.

## Ist-Zustand (warum es noch nicht so ist)

| Bereich | ök2 | Tom (VK2-Mitglied mit Vollversion) |
|--------|-----|-----------------------------------|
| **Galerie** | `GaleriePage` (musterOnly) – eine Komponente | `Vk2MemberGaleriePage` – **eigene** Seite (anderer Aufbau, andere Datenquelle) |
| **Vorschau** | `GalerieVorschauPage` (musterOnly) | Keine eigene Vorschau-Route für Mitglied; nur Galerie |
| **Admin** | `ScreenshotExportAdmin` (context=oeffentlich) – voller Admin | `Vk2MemberAdminPage` – **eigener** reduzierter Admin (nur 5 Werke, Design-Presets, Passwort) |

Ursache: Die Mitglieder-Galerie und der Mitglieder-Admin wurden als **eigene** Seiten gebaut (Vk2MemberGaleriePage, Vk2MemberAdminPage), statt die **gleichen** Komponenten wie bei ök2 mit Kontext „Mitglied“ zu nutzen. Die Stammdaten und die Struktur (Willkommen, Galerie, Design, Werke) sind aber schon da – sie müssten nur über dieselbe Oberfläche laufen.

## Soll-Zustand (Skalierungsregel umsetzen)

- **Tom-Galerie** (`/projects/vk2/member/:memberId`): **GaleriePage** mit `vk2` + `memberId`. Gleiche UX wie ök2 (Willkommen, Galerie betreten, Werke …), Daten aus `k2-vk2-member-{memberId}-*`.
- **Tom-Vorschau** (optional): **GalerieVorschauPage** mit `vk2` + `memberId`.
- **Tom-Admin** (`/projects/vk2/member/:memberId/admin`): **ScreenshotExportAdmin** mit `context=vk2` und `memberId`. Gleiche Tabs wie K2/ök2 (Stammdaten, Werke, Design, Events, …), Lese-/Schreib-Keys: `k2-vk2-member-{memberId}-artworks`, `k2-vk2-member-{memberId}-stammdaten-galerie`, `k2-vk2-member-{memberId}-design-settings` usw.

Dann: Eine Codebasis, eine Oberfläche; nur der Kontext (oeffentlich vs. vk2+memberId) steuert Daten und Keys.

## Umsetzungsschritte (konkret)

1. **GaleriePage / GalerieVorschauPage**  
   - Optionalen Parameter `memberId` (aus Route) unterstützen.  
   - Wenn `vk2` und `memberId` gesetzt: Daten aus `vk2MemberGalerie` (bzw. Keys `k2-vk2-member-{memberId}-*`) laden/anzeigen; gleiche Sektionen wie bei ök2 (Willkommen, Eingangshalle, Werke, Design).

2. **ScreenshotExportAdmin**  
   - `memberId` aus URL lesen (z. B. `/admin` mit `?context=vk2&memberId=vk2-m-2` oder Route `/projects/vk2/member/:memberId/admin` so belassen und Admin-Komponente mit memberId aufrufen).  
   - Wenn `context=vk2` und `memberId` gesetzt: alle Key-Funktionen (getArtworksKey, getEventsKey, getStammdatenGalerieKey, Design-Key, …) auf `k2-vk2-member-{memberId}-*` umstellen.  
   - Gleiche Tabs und Abläufe wie bei K2/ök2 (Stammdaten, Werke, Design, Events, Dokumente …); nur Keys und ggf. Labels („Künstler:in“ statt „Werk“) kontextabhängig.

3. **Routen**  
   - `/projects/vk2/member/:memberId` → `<GaleriePage vk2 memberId={memberId} />` (statt Vk2MemberGaleriePage).  
   - `/projects/vk2/member/:memberId/admin` → Aufruf von ScreenshotExportAdmin mit `context=vk2` und `memberId` (z. B. über AdminRoute oder Wrapper, der memberId aus Params übergibt).  
   - Nach Umsetzung: Vk2MemberGaleriePage und Vk2MemberAdminPage können entfernt oder nur noch als Fallback/Redirect genutzt werden.

4. **Datenmodell**  
   - Prüfen: Reicht die bestehende Struktur in `vk2MemberGalerie` (5 Werke + Design) oder sollen Mitglieder-Galerien das gleiche Datenmodell wie K2/ök2 haben (beliebig viele Werke, gleiche Stammdatenfelder). Bei „identisch mit ök2“ langfristig gleiches Modell sinnvoll; Übergang: Admin zeigt gleiche Tabs, liest/schreibt aber weiterhin die bestehenden Member-Keys (mit Mapping wenn nötig).

5. **Stammdaten**  
   - Bereits vorhanden (Mitgliedername, Vita, Kategorie, …). Im „gleichen“ Admin aus den gleichen Quellen (bzw. k2-vk2-member-{memberId}-stammdaten-*) in den gleichen Feldern wie bei ök2 pflegen.

## Kurzfassung

- **Warum noch nicht umgesetzt:** Tom nutzt eigene Seiten (Vk2MemberGaleriePage, Vk2MemberAdminPage) statt derselben Komponenten wie ök2.  
- **Ziel:** Tom-Galerie = GaleriePage (vk2 + memberId), Tom-Admin = ScreenshotExportAdmin (context=vk2 + memberId).  
- **Vorteil:** Eine Struktur, eine Wartung; Skalierungsregel erfüllt; Stammdaten und Inhalte nur anders, nicht die Oberfläche.

## Umgesetzt (19.02.26)

- **Tom-Admin:** Route `/projects/vk2/member/:memberId/admin` leitet auf `/admin?context=vk2&memberId=xxx` um. Es wird **dieselbe** Komponente **ScreenshotExportAdmin** verwendet; bei gesetztem `memberId` nutzt der Admin die Keys `k2-vk2-member-{memberId}-artworks`, `-design-settings`, `-stammdaten-galerie`, `-events`, `-documents`. Damit ist der Admin-Bereich für Tom (und jedes andere Mitglied mit Vollversion) **identisch** mit K2/ök2 (gleiche Tabs, gleicher Ablauf), nur mit anderen Daten.
- **Tom-Galerie:** Die URL `/projects/vk2/member/:memberId` zeigt weiterhin **Vk2MemberGaleriePage** (eigene, schlanke Seite). Eine spätere Vereinheitlichung auf **GaleriePage** mit `vk2` + `memberId` ist optional (gleiche Oberfläche wie ök2, Daten aus vk2MemberGalerie).

Stand: 19.02.26
