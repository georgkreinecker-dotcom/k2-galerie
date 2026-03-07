# Handbuch – Aufbau und Ziel (Kurzanleitung + Langversion als Buch)

**Stand:** 07.03.26 · Für Georg: Wie die Handbücher aufgebaut sind und was sie enthalten. Ziel: **Kurzanleitung** + **Langversion in schöner redigierter Form**, druckbar mit Titelseite – ein Herzeigeobjekt wie ein Buch.

**Status:** Gespeichert – bei Gelegenheit umsetzen (Kurzanleitung anlegen, „Als Buch drucken“ mit Titelseite). Nicht verwechseln mit: **Benutzerhandbuch für ök2/VK2** (für unsere User) – siehe docs/BENUTZERHANDBUCH-OEK2-VK2-KONZEPT.md.

---

## 1. Aktueller Aufbau

### Drei Handbuch-Einstiege in der App

| Handbuch | Route / Zugang | Inhalt (Kapitel) | Drucken |
|----------|----------------|------------------|---------|
| **K2Team Handbuch** | `/k2team-handbuch` · APf → Handbuch | Team-Grundlagen, Werte, Vision, Backup, Sicherheit, Git/Vercel, Stabilität, Martina/Muna, Pilot-Zettel, Zentrale Themen, … (viele Kapitel) | Ja, kompakt, Seitenzahl |
| **K2 Galerie Handbuch** | Mission Control → K2 Galerie Handbuch | Auswahl aus K2Team: Backup, APf-Verbesserungen, Vollbackup, Sicherheit, Skalierung, Zentrale Themen | Ja, kompakt |
| **K2 Familie Handbuch** | Projekt K2 Familie | Erste Schritte, Projekt-Zusammenfassung (zum Ausdrucken) | Ja, Lesefassung + Druck |

### Wo die Inhalte liegen

- **Quelle (bearbeitbar):** `k2team-handbuch/*.md` (Root)
- **Spiegel für die App:** `public/k2team-handbuch/*.md` (damit die App die Dateien per URL laden kann)
- **Inhaltsverzeichnis:** `k2team-handbuch/00-INDEX.md`

### Was es schon an „Kurz“ gibt

- **ANLEITUNG-ARBEITSPLATTFORM.md** (Root) – Kurzanleitung zur Arbeitsplattform (öffnen, Phasen, Häkchen)
- **17-K2-FAMILIE-ERSTE-SCHRITTE.md** – „Kurzanleitung für Nutzer:innen“ (K2 Familie)
- Einzelne Kapitel haben am Ende eine „Kurzfassung“ – aber **keine** zentrale **eine** Kurzanleitung für die K2 Galerie / das Gesamtsystem
- **Keine** einheitliche **Langversion als Buch** (Titelseite + Inhaltsverzeichnis + alle Kapitel in einem durchgehenden, redigierten Druck-Layout)

---

## 2. Zielbild (was du brauchst)

### Kurzanleitung

- **Eine** zentrale Kurzanleitung: schnell lesbar, alle wichtigsten Schritte und Themen auf einen Blick.
- Auffindbar: z. B. erstes Kapitel im Handbuch oder eigener Eintrag „Kurzanleitung“ im Inhaltsverzeichnis.
- Inhalt: Was ist was (APf, Galerie, Admin, Backup, Veröffentlichen, Stand), erste Schritte, wo was steht – **keine** langen Texte.

### Langversion (Buch – Herzeigeobjekt)

- **Redigierte Langversion** in schöner Form: gut lesbar, klare Gliederung, einheitliche Typografie.
- **Druckbar** mit:
  - **Titelseite** (z. B. „K2 Galerie – Handbuch“, Untertitel, evtl. Stand/Datum)
  - **Inhaltsverzeichnis**
  - **Alle Kapitel** in einem durchgehenden Fluss (oder klare Kapitel-Umbruche)
  - **Seitenzahlen** im Fuß
  - **Keine** Buttons/Sidebar im Druck – nur Inhalt
- **Herzeigeobjekt:** So, dass man es ausdrucken und wie ein Buch herzeigen kann (z. B. für Martina, Partner, Piloten).

---

## 3. Wo das umgesetzt werden soll

| Element | Vorschlag | Ort |
|--------|-----------|-----|
| **Kurzanleitung** | Ein neues Kapitel `00-KURZANLEITUNG.md` (oder `KURZANLEITUNG-K2-GALERIE.md`) im Handbuch | `k2team-handbuch/` + Spiegel `public/k2team-handbuch/` · Im 00-INDEX als erstes verlinkt |
| **Langversion als Buch** | Eine eigene **„Handbuch drucken (Buch)“-Ansicht** in der App: eine Seite, die nur für den Druck optimiert ist: Titelseite → Inhaltsverzeichnis → alle ausgewählten Kapitel nacheinander, ein durchgehendes Dokument mit einheitlichem Layout | Neue Route oder Modus in K2TeamHandbuchPage / K2GalerieHandbuchPage (z. B. „Als Buch drucken“-Button) oder eigene Seite `HandbuchBuchPage` |

---

## 4. Regeln (bereits verbindlich)

- **handbuch-dokumente-leserlich-kein-formular.mdc** – Handbuch-Dokumente in leserlicher, redigierter Form, nicht wie Buchhaltungsformular.
- **druckbare-version-anspruch.mdc** – Druck = lesbar, Seitenzahl, Fußnoten wo nötig, kompakt ohne Leerräume.

---

## 5. Nächste Schritte (konkret)

1. **Kurzanleitung:** Inhalt festlegen (Themen: APf, Galerie, Admin, Backup, Veröffentlichen, Stand, erste Schritte), dann eine Markdown-Datei anlegen, in 00-INDEX eintragen, in K2 Galerie Handbuch / K2Team Handbuch als erstes Kapitel anzeigen.
2. **Titelseite + Buch-Layout:** Entwurf für eine Titelseite (Text + evtl. Logo) und ein Druck-CSS, das beim „Als Buch drucken“ zuerst Titelseite, dann TOC, dann alle Kapitel ausgibt.
3. **„Als Buch drucken“-Button:** In den Handbuch-Seiten einen Button „Als Buch drucken“ (oder „Langversion drucken“), der die Buch-Ansicht öffnet bzw. den Druck mit Titelseite + allen Kapiteln startet.

Wenn du magst, können wir mit **Schritt 1 (Kurzanleitung)** starten und den genauen Inhalt der Kurzanleitung gemeinsam festlegen; danach Titelseite und Buch-Ansicht.
