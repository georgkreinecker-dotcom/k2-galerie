# 10 Platzhalter / Bilder wiederbekommen (Mac, iPad, Handy)

**Situation:** Am Mac 10 Werke mit Platzhalter-Foto; die Bilder waren teilweise am Handy, nach iPad-Neustart/QR-Scan sind sie dort auch weg.

---

## Warum das passiert

- **iPad nach App-Löschen / neuem QR-Scan:** Es gibt **kein lokales Speicher** mehr → beim Laden kommen nur die Daten vom **Server** (API oder statische gallery-data.json). Enthält der Server für diese 10 Werke **keine Bild-URLs** (oder nur Platzhalter), bleiben sie Platzhalter – es gibt nichts „Lokales“, das wir bewahren könnten.
- **Mac:** Zeigt die 10 Platzhalter, weil entweder (a) der Mac beim „Bilder vom Server laden“ die Server-Liste (ohne Bilder) übernommen hat, oder (b) die Bilder nie als URL auf dem Mac ankamen (nur auf dem Handy).

---

## Lösung A: Handy hat die Bilder noch

**Wenn auf dem Handy die Galerie noch die echten Fotos für diese 10 Werke zeigt:**

1. **Am Handy:** Galerie öffnen → **Admin** → **Veröffentlichen** („Jetzt an Server senden“ o.ä.).
2. Damit schreibt das Handy die **aktuellen Daten inkl. Bild-URLs** in den Vercel-Blob und in gallery-data.
3. **Am Mac:** Admin → **„Bilder vom Server laden“** (oder in der Galerie-Vorschau den entsprechenden Button). Dann kommen die Werke **mit** Bild-URLs vom Server.
4. **Am iPad:** Ebenfalls **„Bilder vom Server laden“** (oder Galerie per **aktuellem QR** öffnen und dort laden). Dann hat auch das iPad die Bilder wieder.

**Wichtig:** Das Handy muss **vor** dem Laden am Mac/iPad veröffentlichen, damit der Server die Bild-URLs hat.

---

## Lösung B: Nirgends mehr die Bilder (nur noch Platzhalter)

- **Vollbackup:** Admin (am Mac) → **Einstellungen** → **Backup & Wiederherstellung**. Prüfen, ob ein **Vollbackup** aus der Zeit existiert, als die 10 Werke noch Bilder hatten. Wenn ja: **„Aus letztem Backup wiederherstellen“** (oder das passende Backup wählen). Die Werke inkl. Bild-Referenzen kommen aus dem Backup zurück.
- **Kein passendes Backup:** Dann sind die Bilddaten nur noch außerhalb der App (z.B. Fotos-App, alte Exporte). Bilder müssten manuell wieder den Werken zugeordnet werden (Admin → Werk bearbeiten → Bild erneut einfügen).

---

## Damit es nicht wieder passiert

- **Ein Gerät als „Quelle“ veröffentlichen:** Wenn du am Mac oder Handy die volle Galerie mit allen Bildern hast, einmal **Veröffentlichen** – dann hat der Server den vollständigen Stand. Andere Geräte holen sich mit „Bilder vom Server laden“ bzw. QR-Scan diesen Stand.
- **App löschen = Lokal weg:** Nach App-Löschen (oder „Website-Daten löschen“) ist auf dem Gerät nichts mehr lokal. Beim nächsten Öffnen kommt nur, was der **Server** liefert. Deshalb: Bevor ein Gerät „leer“ gemacht wird, auf einem anderen Gerät **Veröffentlichen**, damit der Server aktuell ist.

---

**Wo nachlesen:** preserveLocalImageData (syncMerge.ts), „Bilder vom Server laden“ (GalerieVorschauPage, GaleriePage), Veröffentlichen (GalerieVorschauPage), WERKE-SPEICHERUNG-CHECKLISTE.md.
