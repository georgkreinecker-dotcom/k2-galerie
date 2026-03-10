# Fehleranalyseprotokoll

**Fundamentale Funktion für den Sportwagenmodus:** Ein Standard pro Problemstellung gilt auch bei Fehlern – eine verbindliche Ablauf (Protokoll lesen → vergangene Fehler prüfen → analysieren → fixen + absichern → eintragen), keine doppelten Fixes, Wiederholungen sofort erkennen und absichern. Ohne diese Funktion würden gleiche Fehlerklassen immer wieder neu „erfunden“ statt einmal gelöst und überall angewendet.

**Zweck:** Bei jeder Fehlermeldung von Georg wird dieses Protokoll genutzt und ergänzt. Es dient der Orientierung (welche Fehlerklassen gab es, welche Absicherungen gelten) und der Qualitätsentwicklung (Wiederholungen erkennen, Absicherungen verschärfen).

---

## Vergangene Fehler – Quellen (verbindlich bei Fehleranalyse)

**Bei jeder Fehlermeldung zuerst prüfen**, ob derselbe oder ein ähnlicher Fehler schon vorkam. Keine doppelten Fixes, Wiederholungen sofort erkennen.

| Quelle | Inhalt | Wann nutzen |
|--------|--------|-------------|
| **docs/GELOESTE-BUGS.md** | Alle behobenen Bugs (BUG-001 bis BUG-022+): Symptom, Ursache, Lösung, betroffene Dateien, Regeln. **PFLICHT bei Session-Start** und vor Änderungen an betroffenen Stellen. | Bei jeder Fehlermeldung: Durchsehen ob gleiche Symptomatik oder gleiche Ursachenklasse (z. B. stilles Überschreiben, Merge, Kontext, QR). |
| **docs/CRASH-BEREITS-GEPRUEFT.md** | Bereits geprüfte Crash-Ursachen, ro5, Code-5-Regeln. Bei neuem Crash **zuerst** lesen, nicht dieselben Stellen wieder durchgehen. | Bei Meldung zu Absturz/Code 5/Reopen. |
| **docs/ANALYSE-OEK2-GALERIE-BETRETEN-FEHLER-06-03.md** | Variable vor Verwendung (useLocation/Hooks am Komponentenanfang). | Bei „Cannot access uninitialized variable“ oder Hooks-Reihenfolge. |
| **docs/LEHRE-WERKE-WEG-IPAD-NOCH-DA.md** | Lehre: Werke weg am iPad, Merge/Server-Logik. | Bei Sync/„Werke verschwunden“. |
| **.cursor/rules/niemals-kundendaten-loeschen.mdc** | Absolutes Verbot: Filter + setItem, stilles Löschen, Überschreiben mit weniger Werken. | Bei jedem Thema Speichern/Laden/Merge. |

**Regel:** Vor Analyse und Fix: Diese Quellen konsultieren → Wiederholung oder gleiches Muster? Dann bestehende Lösung/Regel anwenden und ggf. verschärfen, nicht neu erfinden.

---

## Wie die KI es nutzt (verbindlich)

- **Bei jeder Fehlermeldung von Georg:** (1) **Vergangene Fehler** (oben) prüfen – GELOESTE-BUGS, ggf. CRASH-BEREITS-GEPRUEFT. (2) Dieses Protokoll lesen („Bekannte Fehlerklassen“, „Laufende Absicherungen“, letzte Einträge).
- **Nach jeder Fehleranalyse:** Eintrag unter „Protokoll-Einträge“ (Datum, Stichwort Meldung, Ursache, getroffene Maßnahme, ggf. „Wiederholung von BUG-XXX“).
- **Bei Wiederholung derselben Fehlerklasse:** Absicherung verschärfen (Regel/Checkliste), im Eintrag vermerken und in „Bekannte Fehlerklassen“ den Hinweis „Wiederholung – Absicherung verschärft am …“ ergänzen.

---

## Bekannte Fehlerklassen

*(Aus vergangenen Bugs abgeleitet – siehe GELOESTE-BUGS.md für Einzelfälle.)*

| Fehlerklasse | Kurzbeschreibung | Absicherung / Regel | Referenz (Vergangenheit) |
|-------------|------------------|---------------------|--------------------------|
| Stilles Überschreiben | Daten bei Fehler/Fallback durch alte oder leere Quelle ersetzt, ohne Meldung | „Vom Server laden“: Keine statische Datei bei API-Fehler; klare Fehlermeldung. GalerieVorschauPage handleRefresh. | Sync Mobil→Mac (10.03.26); BUG-018, BUG-021 |
| Kein sichtbares Feedback | Nutzer erfährt nicht, ob Aktion (z. B. Veröffentlichen) Erfolg oder Fehler hatte | Nach Speichern: setLoadStatus „✅ Veröffentlicht …“ oder „❌ Veröffentlichen fehlgeschlagen …“. | Sync Mobil→Mac; BUG-017 |
| Verschiedene Quellen Senden vs. Laden | Mobil sendet an andere Adresse als die, von der Mac lädt | publishGalleryDataToServer immer GALLERY_DATA_BASE_URL (Vercel). | Sync Mobil→Mac; BUG-018 |
| Filter + setItem / stilles Löschen | Gefilterte Liste wird in localStorage geschrieben → Werke gehen verloren | Niemals: filter + setItem. Regel: niemals-kundendaten-loeschen.mdc. | BUG-005, BUG-011, BUG-021; Supergau VK2 (23.02.26) |
| Merge ohne preserveLocalImageData | Server-Daten ersetzen lokale Bilddaten (imageRef/imageUrl) | Immer mergeServerWithLocal + preserveLocalImageData; syncMerge.ts. | BUG-021 |
| Lokale Werke nicht in merged | Lokale Werke ohne Server-Eintrag landen nicht in merged → beim Speichern weg | Merge: lokale Werke ohne Server-Eintrag immer in merged übernehmen (nicht nur „mobile + very new“). | BUG-012, BUG-013 |
| API vs. statische Datei (Reihenfolge) | Zuerst statische Datei geladen → alter Build-Stand | Immer zuerst GET /api/gallery-data (Blob), nur bei Fehler Fallback; GaleriePage loadData. | BUG-018 |
| Kontext-Vergiftung (sessionStorage) | Admin-Kontext bleibt hängen → K2 schreibt in ök2-Keys | syncAdminContextFromUrl; URL vor sessionStorage prüfen. | BUG-004 |
| QR/Stand falsche Quelle (Cache) | QR mit lokalem BUILD_TIMESTAMP → Handy bekommt alte Version | buildQrUrlWithBust + useQrVersionTimestamp; stand-qr-niemals-zurueck.mdc. | BUG-006 |
| Automatischer Reload (Code 5) | Reload bei „Server neuer“ → Loop → Crash | Kein automatischer Reload; nur Badge/Button. code-5-crash-kein-auto-reload.mdc. | BUG-007 |
| ök2 Willkommensbild Uraltbild | Default = Repo-Datei → alte Version sichtbar | OEK2_WILLKOMMEN_IMAGES stabile URL; getOek2WelcomeImageEffective; oek2-willkommensbild-nie-uraltbild.mdc. | BUG-020, BUG-022 |
| Variable vor Verwendung (Hooks) | useLocation/useNavigate in useEffect, Deklaration weiter unten | Router-Hooks am Komponentenanfang; variable-vor-verwendung-hooks.mdc. | ANALYSE-OEK2-GALERIE-BETRETEN-FEHLER-06-03 |
| Mobil: Freistellen/Vollkachel | Auf Mobil angeboten → Absturz / unnötige Last | isMobileDevice; showFreistellen={!isMobileDevice}; runBildUebernehmen erzwingt „original“. mobile-freistellen-vollkachel-nie.mdc. | Mehrfach (10.03.26) |
| Bereinigung: Merge/Reload holt Bilder zurück | Nach „Bilder 0030–0039 bereinigen“ bleiben Bilder sichtbar (Merge behält Server-URL; Reload aus Supabase überschreibt) | preserveLocalImageData: bei lokal leerem Bild Merged-Item ohne Bild. Nach Bereinigung Event mit fromBereinigung; Galerie lädt nur aus localStorage. | BUG-024 (10.03.26) |
| Bereinigung: Admin zeigt wieder Bild (Fallback) | Nach Bereinigung zeigten Admin-Werkkarten weiterhin Fotos („dutzende Versuche“). | Admin lastSavedArtworkImageRef: (1) Bei fromBereinigung Ref auf null; (2) Fallback-Bild nie für Nummern 30–39 einsetzen; (3) Nach Klick Bereinigen Ref sofort null setzen. | BUG-024 Ergänzung (10.03.26) |
| Galerie: Fallback nur bei imageRef | Werke ohne imageRef (v. a. Keramik nach Merge) zeigten in Galerie „Kein Bild“, obwohl Dateien in public/img/k2/ (werk-K2-K-xxxx.jpg) existieren. | resolveArtworkImages: catch + else mit Vercel-Fallback; Fallback-URL auch aus number/id (getVercelFallbackIdFromArtwork). loadArtworksResolvedForDisplay: Fallback aus imageRef und aus number/id. | BUG-025 (10.03.26); FEHLERANALYSE-10-03-26-GALERIE-BILDER-STAND.md |

*(Wird bei neuen Fehlerklassen und Wiederholungen ergänzt.)*

---

## Laufende Absicherungen (Checklisten / Regeln)

- **Veröffentlichen & Laden:** docs/PROZESS-VEROEFFENTLICHEN-LADEN.md; .cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc.
- **Vor „Fertig“ bei Sync/Publish/Load:** Kein stilles Überschreiben; Nutzer sieht immer Erfolg oder Fehler; eine Quelle für Senden und Laden.
- **Qualitätsprozess:** .cursor/rules/qualitaet-bei-fehlermeldung.mdc (bei Fehlermeldung: Protokoll lesen → analysieren → fixen + absichern → hier eintragen).
- **Hinweis für Georg:** Dieses Protokoll ist für die KI verbindlich – sie orientiert sich daran und muss es bei Fehlern aktualisieren. Für dich entsteht keine Mehrarbeit.

---

## Protokoll-Einträge

*(Neueste zuerst. Kurz: Datum, Stichwort, Ursache, Maßnahme.)*

- **10.03.26 – Galerie: viele Keramik-Bilder fehlen, Stand mobil (~5 h Fehlersuche):** (1) **Bilder in Galerie fehlen** trotz Bild in Werken (z. B. K2-K-0013/0014): resolveArtworkImages im catch pushte Werk ohne imageUrl; loadArtworksResolvedForDisplay hatte Fallback nur bei imageRef. (2) **Viele Keramik ohne Bild:** Werke ohne imageRef bekamen nie Vercel-URL (Dateien werk-K2-K-xxxx.jpg liegen in public/img/k2/). **Maßnahme:** Fallback in catch; Fallback aus **number/id** (getVercelFallbackIdFromArtwork) in resolveArtworkImages (else) und in loadArtworksResolvedForDisplay. BUG-025; ausführlich docs/FEHLERANALYSE-10-03-26-GALERIE-BILDER-STAND.md. Stand mobil am Ende korrekt (bestehende QR/API-Regeln).
- **10.03.26 – „Bilder 0030–0039 bereinigen“ – Admin zeigt wieder Bild (Fallback):** Trotz BUG-024 blieben Fotos „nach dutzenden Versuchen“ sichtbar. **Ursache:** Admin lastSavedArtworkImageRef setzte für Werke ohne/kleines imageUrl ein Fallback-Bild → bereinigte Werke 30–39 bekamen wieder ein Bild. **Maßnahme:** Bei fromBereinigung Ref null; Fallback nie für Nummern 30–39; im Bereinigen-Button Ref sofort null. Siehe BUG-024 Ergänzung.
- **10.03.26 – „Bilder 0030–0039 bereinigen“ – Bilder bleiben sichtbar:** Nach Bereinigung (lokal, IndexedDB, Supabase, GitHub) zeigte die Galerie die Bilder weiterhin. **Ursache:** (1) Beim Merge (z. B. „Vom Server laden“) blieb bei lokal leerem Bild die Server-URL erhalten (preserveLocalImageData: `if (!localHasImage) return item`). (2) Nach Dispatch lud die Galerie aus Supabase → Race oder alter Supabase-Stand konnte Anzeige überschreiben. **Maßnahme:** (1) preserveLocalImageData: Wenn lokal kein Bild (bewusst leer nach Bereinigung), Merged-Item ebenfalls ohne Bild setzen (`imageUrl/imageRef/previewUrl` leer). (2) Nach Bereinigung Event mit `detail: { fromBereinigung: true }`; GalerieVorschauPage bei fromBereinigung nur aus localStorage laden (kein Supabase), damit Anzeige sofort den bereinigten Stand zeigt. Protokoll ergänzt; siehe BUG-024.
- **10.03.26 – Sync Mobil→Mac „kommt nichts an“:** (1) Veröffentlichen ging teils an andere Quelle als Lade-URL. (2) Bei API-Fehler wurde statische Datei geladen und überschrieb mit altem Stand. (3) Kein sichtbares Feedback bei Veröffentlichen. **Maßnahme:** Immer Vercel-URL für POST; bei API-Fehler keine statische Datei, Fehlermeldung; setLoadStatus für Veröffentlichen-Erfolg/-Fehler. Protokoll und Regel angelegt.

---

*Dieses Protokoll wird bei jeder Fehlermeldung von Georg konsultiert und nach jeder Analyse aktualisiert.*
