# Datentransport iPad ↔ Vercel ↔ Mac

**Eine zentrale Stelle:** Vercel. Alle Geräte (iPad, Mac, lokal) nutzen dieselbe API und dieselbe Datei.

---

## 🔑 Datenabgleich = Schlüsselfunktion (wie Standangleichung)

**Datenabgleich muss 100 % funktionieren.** Kein „vielleicht“, kein „im Idealfall“ – der verbindliche Weg funktioniert.

**Verbindlicher Ablauf (ein Weg):**
1. **iPad:** Werk speichern → **„📤 Daten an Server senden“** tippen.
2. **Vercel:** Schreibt sofort in den Blob (kein Build, keine Wartezeit).
3. **Mac:** **„🔄 Bilder vom Server laden“** tippen → Daten sind da.

**Einmalig:** In Vercel **Storage → Blob Store** anlegen. Danach ist dieser Ablauf zuverlässig.  
→ **Blob noch nicht angelegt?** Siehe unten: **„Blob anlegen – Schritt für Schritt“** (unter „Einmalige Einrichtung“).

Wenn es nicht funktioniert: **Checkliste „Datenabgleich 100 %“** weiter unten (Abschnitt „Was tun, wenn etwas nicht funktioniert?“).

---

## Zum Verständnis: Wo liegen die Daten?

- **Primär: Vercel Blob.** Die API schreibt die Daten in einen **Blob Store** (Vercel Storage). Kein GitHub-Token nötig – der Token `BLOB_READ_WRITE_TOKEN` wird von Vercel automatisch gesetzt, sobald ein Blob Store angelegt ist. **Daten sind sofort** abrufbar (kein Build, keine Wartezeit).
- **Optional: GitHub.** Wenn in Vercel zusätzlich `GITHUB_TOKEN` gesetzt ist, wird dieselbe Datei ins Repo geschrieben (Backup). Das ist **nicht** nötig, damit „Daten an Server senden“ funktioniert.
- **Laden:** „Bilder vom Server laden“ holt zuerst `/api/gallery-data` (aus dem Blob), bei 404 Fallback auf `/gallery-data.json` (statische Datei aus dem Build).

---

## Ablauf (technisch)

1. **iPad/Mac:** Nutzer tippt „📤 Daten an Server senden“ (oder am Mac läuft nach Speichern automatisch mit).
2. **App** sendet POST an `https://k2-galerie.vercel.app/api/write-gallery-data` mit dem kompletten gallery-Export (JSON).
3. **Vercel Serverless** schreibt die Daten in **Vercel Blob** (pathname `gallery-data.json`). Optional: bei gesetztem GITHUB_TOKEN zusätzlich ins Repo.
4. **Sofort:** Die Daten liegen im Blob. **Kein Build**, keine 1–2 Min Wartezeit.
5. **Am anderen Gerät:** „🔄 Bilder vom Server laden“ ruft `https://k2-galerie.vercel.app/api/gallery-data` ab (Blob). Falls 404 (Blob noch leer), Fallback auf `gallery-data.json`.
6. App merged Server-Daten mit lokalen Daten und speichert das Ergebnis.

---

## Datentransport Mobil → Mac – genau (Schritt für Schritt)

**Was passiert technisch, wenn du am iPad ein Werk speicherst und es am Mac sehen willst:**

| Schritt | Wo | Was passiert |
|--------|-----|----------------|
| 1 | **iPad** | Du speicherst ein Werk (oder bearbeitest eines). Die Daten liegen erst nur **lokal auf dem iPad** (im Browser-Speicher der App). |
| 2 | **iPad** | Du tippst **„📤 Daten an Server senden“** (unter Werke verwalten). Die App packt **alle** K2-Werke plus Stammdaten, Events, Design usw. in eine JSON-Datei. |
| 3 | **iPad → Internet** | Die App sendet diese JSON per **POST** an `https://k2-galerie.vercel.app/api/write-gallery-data`. (Ohne diesen Klick gehen die Daten **nicht** vom iPad weg.) |
| 4 | **Vercel (Server)** | Die Server-Funktion schreibt die JSON in **Vercel Blob** (Speicher im Projekt). **Kein GitHub-Token nötig** – Vercel setzt `BLOB_READ_WRITE_TOKEN` automatisch, sobald ein Blob Store angelegt ist. |
| 5 | **Sofort** | Die Daten liegen im Blob. **Keine** 1–2 Min Wartezeit (kein Build nötig). |
| 6 | **Mac** | Du tippst **„🔄 Bilder vom Server laden“**. Die App ruft zuerst `/api/gallery-data` (Blob) ab; bei 404 Fallback auf `gallery-data.json`. |
| 7 | **Mac** | Die App **merged** die Server-Daten mit deinen lokalen Daten und speichert das Ergebnis. |

**Kurz:** iPad „Daten an Server senden“ → Vercel schreibt in den Blob → **sofort** am Mac „Bilder vom Server laden“ → Daten sind da.

---

## Einmalige Einrichtung: Blob Store in Vercel (Datenabgleich Mac ↔ Mobil)

**Ohne Blob Store** erscheint „Blob-Speicher nicht eingerichtet“ – dann funktioniert „Daten an Server senden“ nicht. Einmal anlegen, danach läuft der Datenabgleich.

### Blob anlegen – Schritt für Schritt (wichtig: im Projekt k2-galerie)

Der Store muss **im Projekt k2-galerie** angelegt werden, sonst bekommt die API keinen Token und das iPad meldet „Blob-Speicher nicht eingerichtet“.

1. **https://vercel.com** öffnen, einloggen.
2. **Projekt k2-galerie** öffnen (Dashboard → k2-galerie anklicken).
3. Im **Projekt** oben **Storage** anklicken (Tab neben Deployments, Settings, …).
4. **Create Database** / **Add Storage** → **Blob** wählen.
5. Store Name z. B. `k2-galerie-blob`, **Region** beliebig, **Access: Public** → **Create**.
6. Vercel setzt dann **BLOB_READ_WRITE_TOKEN** automatisch **für dieses Projekt**.
7. **Redeploy:** Deployments → beim neuesten Deployment **⋯** → **Redeploy**. Nach 1–2 Min ist „Daten an Server senden“ aktiv.

**Falls du den Store woanders angelegt hast** (z. B. unter „Create a database“ ohne vorher k2-galerie gewählt zu haben): In **k2-galerie** → **Storage** gehen und den Blob dort **neu** anlegen (oder prüfen, ob es „Connect existing store“ o. Ä. gibt und den Store mit k2-galerie verbinden).

**Optional – Backup ins Repo:** Wenn du **GITHUB_TOKEN** in Vercel unter Settings → Environment Variables setzt, wird dieselbe Datei zusätzlich ins Repo geschrieben. Für den Datenabgleich **nicht nötig**.

---

## Was tun, wenn etwas nicht funktioniert? (Checkliste „Datenabgleich 100 %“)

| Problem | Prüfen / Tun (verbindlich) |
|--------|----------------|
| **„Daten konnten nicht gesendet werden“** | Fehlermeldung lesen. Steht „Blob-Speicher nicht eingerichtet“? → In Vercel: **Storage → Blob Store anlegen** (einmalig). App von **k2-galerie.vercel.app** öffnen? Internet (WLAN/Mobil) OK? |
| **„Bilder vom Server laden“ liefert nichts / 404** | **Zuerst** am iPad „Daten an Server senden“ tippen (dann liegt etwas im Blob). **Dann** am Mac „Bilder vom Server laden“. Bei Blob sofort, keine Wartezeit. |
| **Server antwortet mit 404** | Blob noch leer → zuerst „Daten an Server senden“ ausführen. App nutzt danach automatisch Fallback auf gallery-data.json, wenn vorhanden. |
| **Immer noch keine Daten** | 1) Vercel → Storage: Blob Store vorhanden? 2) App auf beiden Geräten von **k2-galerie.vercel.app**? 3) Nach „Daten an Server senden“ Erfolgsmeldung gesehen? Dann „Bilder vom Server laden“ erneut. |

---

## Kurzfassung für Georg

- **iPad → Mac:** Am iPad Speichern → „Daten an Server senden“ → **sofort** (oder kurz danach) am Mac „Bilder vom Server laden“. Keine 1–2 Min Wartezeit mehr.
- **Mac → iPad:** Am Mac Speichern (geht automatisch an Vercel) → am iPad Galerie öffnen oder Stand-Badge tippen.
- **Einmalig:** In Vercel einen **Blob Store** anlegen (Storage → Blob). Danach funktioniert „Daten an Server senden“ ohne GitHub-Token.

---

## Checkliste: Damit es überall funktioniert

| Was | Prüfen |
|-----|--------|
| **App-URL** | Immer von **k2-galerie.vercel.app** öffnen (iPad/Mac). |
| **Blob Store** | Einmalig in Vercel: Storage → Blob Store anlegen. Danach Redeploy (oder nächster Push). |
| **Nach „Daten an Server senden“** | Daten sind **sofort** im Blob. Am anderen Gerät „Bilder vom Server laden“ – keine Wartezeit nötig. |
| **Fehlermeldung** | „Blob-Speicher nicht eingerichtet“ → Blob Store anlegen. „Verbindung fehlgeschlagen“ → Internet/WLAN, App von vercel.app. |

Siehe auch: **k2team-handbuch/16-MAC-IPAD-SYNC-SCHRITT-FUER-SCHRITT.md**
