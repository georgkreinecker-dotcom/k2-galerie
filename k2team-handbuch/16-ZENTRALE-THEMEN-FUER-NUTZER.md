# Zentrale Themen – was Nutzer wissen sollten

**Eine Übersicht:** Alles, was für die Arbeit mit der K2 Galerie zentral und von großer Wichtigkeit ist. Kurz erklärt, mit Verweis auf die ausführliche Doku.

---

## 1. Änderungen → öffentlich sichtbar (in jedem Netz)

**Was:** Werke, Design, Stammdaten, Events, Dokumente – damit sie überall (Handy, Besucher, jedes Netz) sichtbar sind.

**Regel:** Nur Speichern reicht nicht. Am **Mac**: **„Veröffentlichen“** → **„Code-Update (Git)“** → 1–2 Min warten. Dann überall sichtbar.

**Doku:** docs/WERKE-OEFFENTLICH-SICHTBAR.md

---

## 2. Nutzung auf verschiedenen Geräten (Mac, Windows, Handy, Tablet)

**Was:** Wo was geht – Galerie, Admin, Kassa, Veröffentlichen.

**Regel:** Überall (Mac, Windows, Android, iOS): Galerie ansehen, Admin, Werke/Stammdaten bearbeiten, Kassa. **Veröffentlichen + Git nur am Mac.** Änderungen auf Windows/Handy speichern → am Mac veröffentlichen + Git, dann überall sichtbar.

**Doku:** docs/NUTZUNG-VERSCHIEDENE-GERAETE.md

---

## 3. Drucker (Brother Etiketten)

**Was:** Etikettendruck zuverlässig einrichten.

**Regel:** **Brother, Mac und ggf. iPad/Handy im gleichen WLAN.** Sonst oft „Drucker nicht erreichbar“. Zwei Netze (z. B. mobil 192.168.1.x vs. Haus 192.168.0.x) = typisches Problem → alle in ein Netz oder „Etikett speichern“ → Brother iPrint & Label App.

**Doku:** docs/DRUCKER-BROTHER-HINWEISE.md; Root DRUCKER-AIRPRINT.md

---

## 4. Stand / Handy zeigt alte Version

**Was:** Nach Änderungen oder Veröffentlichen zeigt das Handy noch die alte Version (alter Stand, alte Werke).

**Regel:**
- **QR-Code:** Immer **neu scannen** nach Veröffentlichen + Git (und 1–2 Min warten).
- **Stand-Badge:** Unten links auf den **Stand** (z. B. „d: 20.02.26 10:38“) **tippen** → lädt die Seite neu, neuer Stand.
- **Seite neu laden** oder **Website-Daten löschen** (Handy) hilft bei hartnäckigem Cache.
- Nur **main** pushen; Vercel Production Branch = **main**. Dann baut Vercel und der QR liefert den neuesten Stand.

**Doku:** docs/VERCEL-STAND-HANDY.md, docs/STAND-QR-SO-BLEIBT-ES.md

---

## 5. Backup & Daten sichern

**Was:** Daten nicht verlieren; bei Problemen wiederherstellen.

**Regel:**
- **Einstellungen → Backup & Wiederherstellung:** Regelmäßig **„Vollbackup herunterladen“** und Datei sicher aufbewahren (z. B. backupmicro).
- Bei fehlenden Daten oder Fehlern: **„Aus Backup-Datei wiederherstellen“** (gleicher Tab) und die gespeicherte Backup-Datei wählen.
- Auto-Save speichert alle 5 Sekunden im Browser; für Sicherheit trotzdem regelmäßig Vollbackup-Datei erstellen.

**Doku:** Handbuch-Kapitel 13 – Backup & Vollbackup K2 Galerie

---

## 6. Echte Galerie vs. Demo (ök2)

**Was:** Wo arbeite ich mit echten Daten, wo nur mit Mustern?

**Regel:**
- **Echte Galerie (K2):** Normale Galerie-URL (z. B. k2-galerie.vercel.app) → Galerie → **Admin** (Passwort). Hier sind deine echten Werke, Stammdaten, Design.
- **Öffentliche Demo (ök2):** Routen wie „galerie-oeffentlich“ oder Demo-Links = **Musterdaten**, keine echten K2-Daten. Was du dort änderst, betrifft nur die Demo, nicht deine echte Galerie.
- Für echte Werke und Veröffentlichen immer die **normale Galerie + Admin** nutzen, nicht die Demo.

**Doku:** docs/K2-OEK2-DATENTRENNUNG.md

---

## 7. Admin-Zugang

**Was:** Wie komme ich in den Admin (Werke, Stammdaten, Design, Einstellungen, Kassa)?

**Regel:** Auf der Galerie-Seite **„Admin“** (oder ⚙️ Admin) tippen → **Passwort** eingeben (wenn eingerichtet) → **„Admin-Zugang“** bestätigen. Dann siehst du alle Bereiche (Werke, Stammdaten, Design, Einstellungen, Kassa etc.). Ohne Admin siehst du nur die öffentliche Galerie-Ansicht.

---

## 8. Kassa vs. Galerie (Kundenansicht)

**Was:** Wann sehe ich die Kasse, wann die Kundenansicht („Meine Auswahl“)?

**Regel:** Von der **Willkommensseite** in den Admin → von dort **Kassa** öffnen = Kasse (für Verkauf). Von der **Galerie-Vorschau** in den Shop = Kundenansicht („Meine Auswahl“). Wenn du doch in der Kundenansicht landest: **„Als Kasse öffnen“** (wenn Passwort gespeichert) → dann Kasse.

**Doku:** docs/KASSA-MAC-VS-MOBILE.md

---

## Kurzliste (zum Merken)

| Thema | Wichtigste Regel |
|-------|-------------------|
| Öffentlich sichtbar | Veröffentlichen + Code-Update (Git) am Mac |
| Verschiedene Geräte | Überall nutzbar; Veröffentlichen nur am Mac |
| Drucker Brother | Gleiches Netz (WLAN) für alle Geräte |
| Handy alter Stand | Stand-Badge tippen oder QR neu scannen |
| Backup | Einstellungen → Vollbackup herunterladen; bei Bedarf wiederherstellen |
| Echte Galerie | Normale URL + Admin = echte Daten; Demo = nur Muster |
| Admin | Admin-Button → Passwort → Admin-Zugang |
| Kassa | Von Admin aus Kassa öffnen; „Als Kasse öffnen“ falls nötig |
| Außenkommunikation | Nicht normale App – multifunktional am PC/Mac, einzigartig (mök2 Sektion 7) |
