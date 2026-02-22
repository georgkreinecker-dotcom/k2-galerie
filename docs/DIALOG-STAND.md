# Dialog-Stand

## Datum: 22.02.26

## Thema: Mehrere Fixes – Mobile-Werk-Verlust, Foto-Upload, ök2-Header, Zurück-Button

## Fixes heute (chronologisch):

### Commit ee384de – Foto-Upload beim Speichern immer
- Beim "Speichern – fertig!" wird das Foto IMMER zu GitHub hochgeladen
- Auch wenn Base64 schon im localStorage liegt (frühere Session)

### Commit 9a222fc – ök2-Admin Header
- ök2-Admin zeigt "ök2 / Muster-Galerie" statt "K2 Galerie"
- Kein ADMIN-Badge bei ök2

### Commit bfcd622 – Zurück-Button Fix (gelber Balken)
- Von ök2-Vorschau → zurück zu /admin?context=oeffentlich (nicht K2)

### Commit 88fd0c4 – data:-Bilder nicht löschen bei ök2
- Fotos die per Drag&Drop hochgeladen werden, bleiben jetzt in ök2 sichtbar

### Commit f83c510 – Race Condition syncAdminContextFromUrl()
- ök2-Admin zeigte K2-Fotos weil Kontext zu spät gesetzt

### Commit 0ee5229 – Mobile-Werke 7 Tage behalten (AKTUELL)
- Werke vom iPad/iPhone werden 7 Tage im localStorage gehalten (vorher: 10 Min!)
- Verhindert: Werk erstellt → Seite reload → Werk weg

## Nächster Schritt:
- iPad: Werk nochmal anlegen → Seite neu laden → Werk muss noch da sein ✅
- Das verlorene Werk von heute muss manuell nochmal angelegt werden

## Offenes Problem:
- Verlorenes Werk (heute) ist weg – muss nochmal am iPad angelegt werden
- Zukünftig: Werke bleiben 7 Tage, bis sie vom Mac veröffentlicht werden
