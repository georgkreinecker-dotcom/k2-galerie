# Promo-Video – Matrix (Features/Tools) & Drehbuch V1

**Stand:** 04.04.26  
**Status:** Erste Arbeitsfassung – **Georg prüft**; Inhaltliche Wahrheit = Mappe + `VIDEO-PRODUKTION-PRAEMAPPE-ANALYSE.md`.

---

## 1. Was wir brauchen (Matrix)

| Bereich | Notwendiges (Minimum) | Wo im Projekt / Hinweis |
|--------|------------------------|-------------------------|
| **Inhalt** | Ein durchgängiges Narrativ aus der **Vollversion-Mappe**; keine zweite Textquelle | `public/praesentationsmappe-vollversion/`, bei Abweichung zuerst **mök2** |
| **Screens** | **Ein** Build-Stand über alle Aufnahmen; nur **ök2**-Kontext (Muster), **keine** K2-Echtdaten | Vor Aufnahme: gleicher Tag, `build-info.json` prüfen; Demo-Routen siehe §3 |
| **Aufnahme** | Bildschirmaufnahme (Mac): z. B. **QuickTime**, **OBS**, o. ä. – **ein** festes Format (z. B. 1920×1080) | Kein Repo-Feature; Tool nach Gewohnheit |
| **Ton** | **Eine** KI-/TTS-Stimme **oder** Musik + eingeblendete Stichpunkte (§1a ANALYSE) | TTS-Tool / Dienst nach Wahl; Text aus diesem Drehbuch |
| **Motion** | Einfache Einblendungen (Logo, Überschriften, Pfeile) – **Canva, CapCut, DaVinci**, o. ä. | Kein Muss für V1; reicht Screen + Sprecher |
| **Export** | **Eine** Master-Datei (z. B. MP4) + ggf. komprimierte Web-Version | — |
| **Recht** | Musik nur mit **Lizenz**; **Copyright**-Zeilen bei Bedarf aus `tenantConfig` | Endbild/Impressum kurz prüfen |
| **Veröffentlichung** | Video hosten (wo ihr Dateien ablegt) → **ein** öffentlicher Link → **Admin ök2 → Einstellungen → Stammdaten** (Promo-Seite beschreibt den Weg) | `PromoVideoProduktionPage`, `ein-standard-problem.mdc` |

**Nicht** als Start-Minimum: externes Filmteam, mehrere Sprecher, 3D-Avatar, synchron zu vielen Sprachen.

---

## 2. Routen für Screen-Material (ök2, relativ zur App)

*Am Mac: gleiche Origin (z. B. `localhost` oder Vercel) – keine gemischten Stände.*

| Szene (Drehbuch) | Route (Auszug) | Anmerkung |
|------------------|------------------|-----------|
| Öffentliche Galerie (Willkommen / Werke) | `/projects/k2-galerie/galerie-oeffentlich` | Besucheransicht |
| Vorschau / Bearbeitungsnähe | `/projects/k2-galerie/galerie-oeffentlich-vorschau` | nur wenn ihr das zeigen wollt |
| Admin-Zentrale (Hub) | `/admin?context=oeffentlich` | ggf. Tab per UI wechseln (Werke, Design, …) |
| Kassa / Shop (kurz) | `/projects/k2-galerie/kassa`, `/projects/k2-galerie/shop` | mit `fromOeffentlich` nur falls nötig – sonst neutral aus ök2-Admin heraus öffnen |
| Lizenzen | `/projects/k2-galerie/licences` | Abschluss / CTA |
| Mappe (optional Kurz-Screen) | `/projects/k2-galerie/praesentationsmappe-vollversion?context=oeffentlich` | „Es gibt die ausführliche Mappe“ |
| APf: Promo-Anleitung (Meta, nicht „Film-Inhalt“) | `/projects/k2-galerie/promo-video-produktion` | Nur wenn ihr **Einspielung** zeigen wollt – nicht Pflicht für Kunden-Video |

**VK2:** Nur wenn der Film Vereine explizit einbeziehen soll – sonst **einen Satz** + Link in Mappe; extra Route `…praesentationsmappe-vollversion?variant=vk2` sparsam nutzen.

---

## 3. Drehbuch V1 – Stichpunkte (Ziel ~8–10 Min)

*Sprecher: neutral, „Sie“ oder unpersonlich. Keine Namen Martina/Georg als Stimme.*

### A. Hook (ca. 45 s)

- Viele Werkzeuge für Web, Kasse, Werbung – **oder eine Plattform**, die zusammenpasst.
- Kurz nennen: **Schaufenster** (öffentliche Galerie) + **Zentrale** (Admin) + **Kassa** + **Planung** – **eine** Linie.
- **Visuell:** Motion-Titel (Produktname aus Markenregeln) oder erstes App-Screen **Galerie ök2**.

### B. Warum nicht „irgendeine Website“ (ca. 90 s)

- Stichworte aus **USP / Wettbewerb** (Mappe `02-USP-UND-WETTBEWERB.md`): Orientierung im Markt, **was du gewinnst** (kein Superlativ-Wettbewerb).
- **Visuell:** ggf. eine Grafik/Matrix aus der Mappe **oder** statischer Screenshot der Mappe-Seite.

### C. Was ist es – für wen (ca. 3 Min)

- **Was:** Lizenz-Galerie-Software – **Mein Weg** als Struktur, **Sparten** zuordenbar.
- **Für wen:** Künstler:innen, kleine Galerien, optional Vereine (VK2 nur kurz oder weglassen).
- **Visuell:** Mappe `02-WAS-IST…` / `03-FUER-WEN` entsprechend; **Sparten-Tabelle** einmal **voll im Bild** (Screen oder Export).

### D. Beweis: App (ca. 3–4 Min)

- **Willkommen + Galerie:** Scroll kurz, Filter/Werke sichtbar (`galerie-oeffentlich`).
- **Admin-Hub:** Kacheln – **ein** Rundgang, nicht jeden Tab lang (`/admin?context=oeffentlich`).
- **Werke / Design:** je **ein** klares Beispiel (neues Werk muss nicht komplett gezeigt werden).
- Optional: **Statistik/Werkkatalog** – **ein** Screen, wenn Zeit.

### E. Geschäft (ca. 1,5 Min)

- **Kassa** oder **Shop** – **ein** Strang: „Verkauf und Belege hängen an den Werken.“
- **Events/Marketing:** **ein** Hinweis „aus denselben Daten“ – keine Schulung.

### F. Abschluss (ca. 1 Min)

- **Demo ök2** ausprobieren, **Lizenzen** vergleichen (`/licences`), **Kontakt** – ruhig, **kein** Druck.
- **Visuell:** Lizenz-Seite oder Willkommen; optional QR/Link wie in Mappe Kontakt-Kapitel.

### G. Optional streichen bei Kürzung

- Prospekt-Stimmung (`02B-PROSPEKT-ZUKUNFT`) – nur wenn ihr **>8 Min** wollt.
- VK2 – nur bei Vereins-Fokus.

---

## 4. Nächste Schritte (Reihenfolge)

1. **Georg:** Dieses Dokument durchlesen – was streichen / was vertiefen (Randnotizen reichen).
2. **Eine** Probe-Session: **5 Min** nur Screens aufnehmen (ohne Ton) – prüft Stand und Lesbarkeit.
3. Skript in **Sprechertext** gießen (Absatz für Absatz) – ich kann in einer **folgenden** Runde aus §3 einen **fließenden Text** erzeugen, wenn du „Sprechertext“ sagst.
4. TTS oder Musik festlegen → Aufnahme → Schnitt → Upload → Link in ök2-Stammdaten.

---

## 5. Verknüpfungen

| Datei | Rolle |
|-------|--------|
| `docs/VIDEO-PRODUKTION-PRAEMAPPE-ANALYSE.md` | Regeln, §1a/§1b, Checkliste |
| `public/praesentationsmappe-vollversion/00-INDEX.md` | Kapitel-Index |
| `src/pages/PromoVideoProduktionPage.tsx` | Einspielung, APf |

---

**Kurz:** Das ist **V1 zum Anschauen und Verbiegen** – nicht das letzte Wort. Du entscheidest, was rausgeht; diese Datei ist die **gemeinsame Tischplatte** dafür.
