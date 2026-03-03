# Zwei „Stände“ – warum Mac und Handy unterschiedlich aussehen können

## Das Problem (kurz)

- **Am Mac:** Stand 11:49, Galerie-Vorschau zeigt genau deine Werke.
- **Am Handy:** Stand 13:28 (sogar neuer!), aber es werden **Musterwerke** angezeigt.

Das wirkt irre – ist aber erklärbar: Es gibt **zwei verschiedene „Stände“**.

---

## 1. Build-Stand (App-Stand)

- **Was:** Wann die **App** (Code, Seite, JavaScript) zuletzt auf Vercel gebaut wurde.
- **Wo sichtbar:** „Vercel-Stand: 03.03.26 13:28“ (z. B. am Mac in der Galerie beim QR, oder auf dem Handy wenn build-info geladen wird).
- **Wann ändert sich das:** Bei jedem **Commit + Push** (Vercel baut neu).
- **Bedeutung:** Das Handy kann „13:28“ zeigen = neueste App-Version. Das sagt **nichts** über die Werke.

---

## 2. Daten-Stand (Werke, Stammdaten, Galerie-Inhalt)

- **Was:** Wann die **Daten** (Werke, Texte, Stammdaten) zuletzt vom Mac auf den Server geschrieben wurden.
- **Wo gespeichert:** In `gallery-data.json` auf Vercel (und ggf. im Repo). Darin steht `exportedAt` (Zeitpunkt des letzten Exports).
- **Wann ändert sich das:** Wenn du im Admin auf **„Veröffentlichen“** klickst (oder der Ablauf, der gallery-data.json schreibt, läuft).
- **Bedeutung:** Das Handy lädt die **Werke** aus dieser Datei. Wenn du Musterwerke entfernt und **nicht nochmal veröffentlicht** hast, liegt auf dem Server noch die **alte** gallery-data.json mit Musterwerken → das Handy zeigt sie.

---

## Typische Situation

| Wo      | Build-Stand | Daten-Stand (exportedAt) | Was du siehst        |
|--------|-------------|---------------------------|----------------------|
| Mac    | 11:49 (lokal/alt) | – (nutzt localStorage) | Deine echten Werke ✅ |
| Handy  | 13:28 (neu) | z. B. 02.03. 18:00 (alt) | Alte Daten, Musterwerke ❌ |

- Der **Mac** zeigt die Vorschau aus dem **lokalen Speicher** (localStorage) – daher sofort deine aktuellen Werke.
- Das **Handy** bekommt die Werke **nur** aus `gallery-data.json` auf Vercel. Ist die Datei alt (letztes Veröffentlichen vor Tagen), siehst du dort noch die alten Inhalte.

---

## Was du tun solltest

1. **Im Admin „Veröffentlichen“** klicken (damit die aktuelle Galerie in gallery-data.json geschrieben wird).
2. **Kurz warten** (Vercel/Deploy), dann auf dem Handy die Galerie **neu öffnen** (QR neu scannen oder „Stand & Daten“ / Aktualisieren).
3. In der App siehst du (wenn umgesetzt) **„Daten: DD.MM.YY HH:MM“** – dann siehst du, von wann die geladenen Werke sind.

---

## Ein Stand = eine Quelle (kein Chaos durch mehrere Zeitzustände)

- Beim **Veröffentlichen** geht ein **vollständiger Snapshot** raus: Werke, Events, Dokumente, **Seitengestaltung (Kacheln)**, Design, Stammdaten, pageTexts. Alles in einem Rutsch.
- Beim **Laden** auf dem Handy wird dieser Snapshot **komplett** übernommen (inkl. Seitengestaltung/Kacheln). Nichts wird „gemischt“ mit alten lokalen Resten – Server = Quelle.
- So gibt es **einen** Daten-Stand (exportedAt); wer die Galerie öffnet, bekommt genau diesen Stand. Kein „teilweise neu, teilweise alt“.

---

## 🔒 ESSENZIELL: Eine Quelle = API (Blob), nie zuerst statische Datei

**Ursache des „QR bringt immer alte Daten“-Problems (03.03.26):**

- **Veröffentlichen** schreibt in **Vercel Blob** (API `POST /api/write-gallery-data`).
- **Laden** muss **zuerst** von **d derselben Quelle** kommen: **GET /api/gallery-data** (liest aus Blob).
- Die statische Datei **/gallery-data.json** wird nur beim **Build** aus dem Repo ins `dist/` kopiert – sie ändert sich **nicht** durch „Jetzt an Server senden“. Wenn die Galerie beim Öffnen (z. B. Handy nach QR-Scan) **zuerst** `/gallery-data.json` lud, bekam sie immer den **alten Build-Stand**, nie die gerade veröffentlichten Daten.

**Regel (unveränderlich):** In `GaleriePage` (loadData und handleRefresh) wird **immer zuerst** `GET /api/gallery-data` aufgerufen. Nur wenn die API fehlschlägt, kommt Fallback auf `/gallery-data.json`. So ist **eine Quelle** = Blob = das, was „Jetzt an Server senden“ geschrieben hat.

## Kurzfassung

- **Build-Stand** = Version der App (Commit/Push).
- **Daten-Stand** = Version der Werke und der Seitengestaltung (Veröffentlichen → gallery-data).
- Handy zeigt Musterwerke oder alte Kacheln? → Alte **Daten** auf dem Server → nochmal **Veröffentlichen** vom Mac, dann Handy neu laden (QR neu scannen / „Stand & Daten“).
