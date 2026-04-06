# Promo-Video – Umsetzungskonzept (von vorn)

**Stand:** 05.04.26  
**Ziel:** Ein **klarer, realistischer Weg** von der Idee bis zum **sichtbaren Video** in der ök2-Demo – ohne zu erwarten, dass Repo oder Cursor ein **fertiges Filmfile** erzeugen.

---

## Die End-to-End-Lösung für dich (eine Spur)

**Was in der App schon end-to-end ist:** **Eine URL** im Feld **Highlight-Video** (Stammdaten Galerie, ök2) – dieselbe Quelle für **APf-Vorschau** und **öffentliche Galerie** (kein zweiter Ort). Technisch: `socialFeaturedVideoUrl` in den Stammdaten.

**Was kein Repo leisten kann:** Das **Videofile** selbst erzeugen (Schnitt, Ton, Export) – das machst du am Mac mit **iMovie / CapCut / QuickTime** oder lädst ein fertiges File zu **YouTube** hoch. Das ist **normal** – wie bei jedem Produktvideo.

### So kommst du vom „nichts“ zum „läuft bei Besuchern“

| Schritt | Du machst | Ergebnis |
|--------|-----------|----------|
| **1** | **Sprechertext** offen: [`PROMO-VIDEO-SPRECHERTEXT-90S-V1.md`](PROMO-VIDEO-SPRECHERTEXT-90S-V1.md) | Du weißt, was gesagt wird |
| **2** | **QuickTime** → neue Bildschirmaufnahme → nacheinander ök2: Galerie [`/projects/k2-galerie/galerie-oeffentlich`](https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich), Admin-Hub [`/admin?context=oeffentlich`](https://k2-galerie.vercel.app/admin?context=oeffentlich), Lizenzen [`/projects/k2-galerie/licences`](https://k2-galerie.vercel.app/projects/k2-galerie/licences) | Roh-Clips mit **echter App** |
| **3** | **iMovie oder CapCut:** Clips anordnen, **Ton** (einlesen oder TTS), Titel **K2 Galerie** einblenden; optional Untertitel aus [`PROMO-VIDEO-SPRECHERTEXT-90S-V1.srt`](PROMO-VIDEO-SPRECHERTEXT-90S-V1.srt) | **Ein** fertiges **MP4** auf dem Mac |
| **4** | **YouTube** (am einfachsten): Video hochladen, Sichtbarkeit **nicht gelistet** → im Browser **Link kopieren** (`https://www.youtube.com/watch?v=…` oder `youtu.be/…`) | **Öffentliche HTTPS-URL**, die die App einbetten kann |
| **5** | Im Browser: **Admin ök2** → [`/admin?context=oeffentlich`](https://k2-galerie.vercel.app/admin?context=oeffentlich) → Tab **Einstellungen** → **Stammdaten** → Bereich Galerie → Feld **Highlight-Video (optional)** → URL einfügen → **Speichern** | URL liegt in der **einen** Produkt-Quelle |
| **6** | Öffentliche Demo öffnen: [`/projects/k2-galerie/galerie-oeffentlich`](https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich) → Video soll im **Willkommens-/Social-Bereich** laufen (wie bei YouTube/Instagram) | **End-to-End sichtbar für Besucher** |
| **7** | Optional APf: [`/projects/k2-galerie/promo-video-produktion`](https://k2-galerie.vercel.app/projects/k2-galerie/promo-video-produktion) – dort siehst du dieselbe **Vorschau** wie mit eingetragener URL | Kontrolle ohne zweite Wahrheit |

**Alternative zu YouTube:** MP4 unter einer **direkten** `https://…`-Adresse (endet auf `.mp4` oder `.webm`) – z. B. nach Upload ins Repo unter `public/…` und Push; dann dieselbe URL in **Schritt 5**. (Technik: `videoUrlToFeaturedEmbed` in `featuredVideoEmbed.ts`.)

**Runway** ist **kein** Pflicht-Schritt – nur wenn du Zwischenbilder willst; siehe unten §3.

---

## 1. Was wir wirklich wollen (ein Satz)

Ein **kurzes, seriöses Erklärvideo** (~90 s), das **K2 Galerie** als **eine durchgängige Linie** (Schaufenster + Zentrale + Geschäft) zeigt – **sichtbar** durch echte **ök2-Screens** und **verständlich** durch **Sprecher oder Untertitel**.

---

## 2. Drei Schichten – wer liefert was

| Schicht | Werkzeug | Was dabei herauskommt |
|--------|----------|------------------------|
| **A. Substanz / Wahrheit** | **Browser + ök2** (gleicher Build-Stand) | Echte Oberflächen: Galerie, Admin, Lizenzen – **das ist das Produkt**. |
| **B. Atmo / Übergänge (optional)** | **Runway** (Gen-3, Multi-Shot, Auto) | Abstrakte **Zwischenbilder**, Stimmung – **kein** Ersatz für A. |
| **C. Fassung** | **iMovie, CapCut oder DaVinci** | Schnitt, **Ton** (Stimme/TTS), **Titel „K2 Galerie“**, **Untertitel** (SRT), **ein** MP4. |

**Wichtig:** **Cursor / Repo** liefern **Texte, Routen, SRT, Anleitung** – **kein** automatisches Rendern eines fertigen Videos. Das ist technisch normal.

---

## 3. Realität Runway (damit es nicht frustriert)

- Runway kennt **keine** Mappe und **kein** `tenantConfig` – nur deinen **Prompt**.
- **10 s** Generation = die ganze Story wird **komprimiert** → oft **abstrakte** Kurzclips. Für ~90 s: **mehrere** 10-s-Clips **oder** längere Dauer, falls angeboten – dann **im Schnitt** aneinanderreihen.
- **Lesbarer Text** („K2 Galerie“, Sätze) **im KI-Bild** = meist **schlecht**. **Lösung:** Titel und Text in **Schicht C** (Schnitt), nicht im Runway-Prompt erzwingen.

---

## 4. Umsetzung in Phasen (Reihenfolge)

### Phase 1 – Festlegen (einmal)

- **Länge:** z. B. **90 s** (passt zu `PROMO-VIDEO-SPRECHERTEXT-90S-V1.md`).
- **Stimme:** du selbst **oder** TTS – **eine** Spur, durchgängig.
- **Stil:** z. B. **animiert + Screen** (wie in `VIDEO-PRODUKTION-PRAEMAPPE-ANALYSE.md` §1a) – **keine** Darsteller:innen.

### Phase 2 – Rohmaterial Screens (Pflicht für Glaubwürdigkeit)

- **Gleicher Tag, gleicher Stand:** `build-info.json` / Vercel aktuell.
- **QuickTime** (oder OBS): nacheinander **kurz** aufnehmen:
  - öffentliche Galerie (`…/galerie-oeffentlich`),
  - Admin-Hub (`/admin?context=oeffentlich`),
  - Lizenzen (`…/licences`).
- **Format festlegen:** z. B. **1920×1080**, ruhige Mausbewegungen.

### Phase 3 – Rohmaterial Runway (optional)

- **Einen** englischen **Story-Prompt** nutzen (z. B. `PROMO-VIDEO-RUNWAY-PROMPT-90S-V1.md` oder deinen eigenen Block wie im Screenshot).
- Erwartung: **Stimmung / Übergänge**, nicht die ganze Story in einem Stück.

### Phase 4 – Schnitt

- Reihenfolge z. B.: **Hook** (Runway oder Titelbild) → **Sprecher passt zu Screen 1** → … → **Lizenzen** → **ruhiges Ende**.
- **Titel „K2 Galerie“** und **Werbelinie** (aus `tenantConfig` / mök2) **hier** einblenden – nicht in Runway.

### Phase 5 – Ton

- Sprechertext **einlesen** oder TTS aus dem Text in `PROMO-VIDEO-SPRECHERTEXT-90S-V1.md`.
- **SRT** (`PROMO-VIDEO-SPRECHERTEXT-90S-V1.srt`) als Unterstützung oder Einbrennen.

### Phase 6 – Export

- **Ein** Master: **MP4** (Web-tauglich, z. B. 1080p).
- Optional: kurze Version für Social (separate Export-Einstellung).

### Phase 7 – Im Produkt sichtbar

- **Konkret:** siehe Tabelle **„So kommst du vom ‚nichts‘ zum ‚läuft bei Besuchern‘“** oben (YouTube oder direkte MP4-URL → Feld Highlight-Video → öffentliche Galerie prüfen).

---

## 5. Eine Quelle pro Aufgabe (Sportwagen)

| Aufgabe | Eine Quelle |
|--------|-------------|
| Sprechertext / Szenen | `PROMO-VIDEO-SPRECHERTEXT-90S-V1.md` |
| Lange Fassung / Routen | `VIDEO-PRODUKTION-MATRIX-UND-DREHBUCH-V1.md` |
| Regeln / Stil Mappe | `VIDEO-PRODUKTION-PRAEMAPPE-ANALYSE.md` |
| Runway-Prompt kopieren | `PROMO-VIDEO-RUNWAY-PROMPT-90S-V1.md` |
| Einspielung in der App | `PromoVideoProduktionPage.tsx`, Route oben |

---

## 6. Checkliste „fertig genug“

- [ ] MP4 liegt vor und ist **einmal** komplett durchgesehen (Ton + Bild).
- [ ] **ök2** ist **erkennbar** (mindestens ein klarer Screen-Block).
- [ ] **Name / Marke** kommt im Schnitt sauber (nicht nur KI-Kleinkram im Bild).
- [ ] **Link** in ök2-Stammdaten eingetragen und auf der **öffentlichen** Seite testbar.

---

## 7. Kurz: Was wir **nicht** erwarten

- Dass **Runway** aus **Repo-Daten** automatisch ein **inhaltsvolles** Produktvideo baut.
- Dass **Cursor** ein **fertiges Video** erzeugt – wir liefern **Konzept, Text, SRT, Prompts und APf-Hilfe**.

**Das ist trotzdem end-to-end:** Rohmaterial → Schnitt → Export → Link → Demo – **du** führst die Schritte in **Schicht A/C** aus; wir halten die **Quellen** konsistent.
