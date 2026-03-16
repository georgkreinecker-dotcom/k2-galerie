# Notfall-Checkliste – Cursor, Dialog, Parallelstrukturen

**Zweck:** Wenn Cursor ausfällt oder der Dialog/Konversation nicht mehr funktioniert – du hast **Parallelstrukturen**: alles Wichtige liegt auch ohne Cursor erreichbar. Stand: März 2026.

---

## 1. Cursor ist ausgefallen oder nicht nutzbar

| Was du brauchst | Wo es liegt (ohne Cursor) |
|-----------------|---------------------------|
| **Code / Projekt** | **GitHub:** Repository k2Galerie (georgkreinecker). Code ist dort; bei Bedarf klonen oder an anderem Rechner öffnen. → Siehe Links unten. |
| **Backup des Codes** | Optional auf **backupmicro** (Spiegelung); Skript: `scripts/backup-code-to-backupmicro.sh`. |
| **Weiterarbeiten an Code** | **Georg:** In der Regel mit Cursor. **Informatiker:** Mit jeder IDE (z. B. VS Code, WebStorm) oder Terminal + Editor – Cursor ist **nicht** erforderlich. Projekt = Standard React/TypeScript/Vite (npm install, npm run dev, npm run build). |
| **Stand der App** | **Vercel** – laufende App. → Siehe Links unten. |

**Kurz (Georg):** Ohne Cursor kannst du die **App normal nutzen** (Browser, Handy). Code ändern machst du mit Cursor, wenn es wieder läuft.

**Für Informatiker/Nachfolge:** Repo klonen (GitHub), Node.js ≥18, dann `npm install` und `npm run dev` – mit VS Code, WebStorm oder anderer IDE am Code weiterarbeiten. Regeln und Doku liegen im Projekt (`.cursor/rules`, `docs/`); Cursor wird nicht gebraucht.

---

## 2. Dialog / Konversation funktioniert nicht mehr

Der „Dialog“ = die Arbeit mit dem KI-Assistenten in Cursor. Wenn der Chat nicht mehr reagiert, crasht oder der Faden verloren geht:

| Was du brauchst | Parallelstruktur (ohne Dialog) |
|-----------------|----------------------------------|
| **Woran wir zuletzt gearbeitet haben** | **docs/DIALOG-STAND.md** – „Letzter Stand“, „Nächster Schritt“, „Was wir JETZT tun“. → Links unten. |
| **Briefing / Orientierung für die KI** | **docs/AGENTEN-BRIEFING.md** – `npm run briefing`; Stand, Offenes, Nächste Schritte. → Links unten. |
| **Regeln und Abläufe** | **.cursor/rules/** und **.cursorrules** – alle Regeln im Projekt. → GitHub-Link unten. |
| **Was bei Fehlern zu tun ist** | **docs/FEHLERANALYSEPROTOKOLL.md**, **docs/GELOESTE-BUGS.md**. → Links unten. |
| **Kritische Abläufe (nicht abschwächen)** | **docs/KRITISCHE-ABLAEUFE.md**. → Links unten. |

**Wenn du wieder einsteigst („ro“ / „weiter“):** KI soll zuerst DIALOG-STAND und Briefing lesen. Das steht in den Regeln; die **Inhalte** liegen in diesen Dateien – unabhängig vom Chat.

---

## 3. Parallelstrukturen – eine Übersicht

Damit nichts „nur im Kopf“ oder nur im Chat liegt:

| Thema | Zentraler Ort (immer im Projekt) |
|-------|-----------------------------------|
| **Sicherheit vor Go-Live** | docs/SICHERHEIT-VOR-GO-LIVE.md + To-dos im Smart Panel → Links unten |
| **Backup & Wiederherstellung** | Handbuch Backup + docs/BACKUP-ZUGANG-NOTFALL.md → Links unten |
| **Vor Veröffentlichung** | docs/VOR-VEROEFFENTLICHUNG.md → Links unten |
| **Kritische Abläufe** | docs/KRITISCHE-ABLAEUFE.md → Links unten |
| **Struktur (wo was liegt)** | docs/STRUKTUR-HANDELN-QUELLEN.md, HAUS-INDEX.md → Links unten |
| **Projekt-Übersicht / Doku** | docs/00-INDEX.md, Handbuch-Index → Links unten |
| **Team / Betrieb** | k2team-handbuch (dieses Handbuch) → Link unten |

**Dieses Dokument** ist die Notfall-Checkliste selbst – im **Smart Panel** verlinkt („Notfall-Checkliste“), damit du sie ohne Cursor öffnen kannst: App im Browser → APf → Smart Panel → Notfall-Checkliste.

---

## 4. Was tun – Kurzablauf

1. **Cursor weg / Chat tot:** App im Browser nutzen; DIALOG-STAND.md lesen (Texteditor oder Cursor beim nächsten Start). Code-Änderungen erst wieder, wenn Cursor geht.
2. **„Wo waren wir?“** → DIALOG-STAND.md + AGENTEN-BRIEFING.md lesen.
3. **Daten weg / etwas kaputt?** → Backup: Admin → Einstellungen → „Aus letztem Backup wiederherstellen“ oder „Aus Backup-Datei“; Vollbackup auf backupmicro (siehe BACKUP-ZUGANG-NOTFALL.md).
4. **Neue Session mit KI:** Kurz sagen: „ro“ oder „DIALOG-STAND lesen, wir waren bei …“ – dann lädt die KI die Dateien und macht weiter.

---

## 5. Direkte Links zu den Parallelstrukturen (zum Anklicken)

**App & Code (ohne Cursor nutzbar):**

[App auf Vercel öffnen (Galerie, Admin, alles)](https://k2-galerie.vercel.app)

[Projekt auf GitHub (Code, docs, Regeln)](https://github.com/georgkreinecker/k2Galerie)

**Dialog-Faden (wenn Chat nicht geht):**

[DIALOG-STAND – woran wir zuletzt gearbeitet haben](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/DIALOG-STAND.md)

[AGENTEN-BRIEFING – Stand, Offenes, Nächste Schritte](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/AGENTEN-BRIEFING.md)

[Regeln im Projekt (.cursor/rules)](https://github.com/georgkreinecker/k2Galerie/tree/main/.cursor/rules)

**Fehler & Abläufe:**

[FEHLERANALYSEPROTOKOLL](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/FEHLERANALYSEPROTOKOLL.md)

[GELOESTE-BUGS](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/GELOESTE-BUGS.md)

[KRITISCHE-ABLAEUFE (nicht abschwächen)](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/KRITISCHE-ABLAEUFE.md)

**Sicherheit, Backup, Doku:**

[SICHERHEIT-VOR-GO-LIVE](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/SICHERHEIT-VOR-GO-LIVE.md)

[BACKUP-ZUGANG-NOTFALL](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/BACKUP-ZUGANG-NOTFALL.md)

[VOR-VEROEFFENTLICHUNG](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/VOR-VEROEFFENTLICHUNG.md)

[STRUKTUR-HANDELN-QUELLEN](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/STRUKTUR-HANDELN-QUELLEN.md)

[HAUS-INDEX (Projekt-Übersicht)](https://github.com/georgkreinecker/k2Galerie/blob/main/HAUS-INDEX.md)

[docs/00-INDEX (technische Doku)](https://github.com/georgkreinecker/k2Galerie/blob/main/docs/00-INDEX.md)

**Handbuch (in dieser App):**

[Backup – Vollbackup K2 Galerie](/k2team-handbuch?doc=13-BACKUP-VOLLBACKUP-K2-GALERIE.md)

[Handbuch-Inhaltsverzeichnis](/k2team-handbuch?doc=00-INDEX.md)

*Hinweis:* GitHub-Links funktionieren, wenn du eingeloggt bist (bei privatem Repo). Vercel-Link und Handbuch-Links funktionieren immer in der App/im Browser.

---

[SEITENUMBRUCH]

**Drucken:** Button „Drucken“ in der Handbuch-Ansicht – diese Seite ausdrucken und an einem festen Ort aufbewahren (Parallelstruktur auf Papier).
