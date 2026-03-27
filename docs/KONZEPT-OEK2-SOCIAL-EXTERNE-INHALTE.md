# Konzept: ök2 & externe Inhalte (YouTube, Instagram, Social)

**Stand:** 27.03.26  
**Zweck:** Künstler:innen haben Inhalte bereits auf Plattformen (YouTube, Instagram, …). Die Galerie soll **nicht** ein abgeschlossenes Silo sein, sondern Besucher:innen **verlässlich** zu diesen Inhalten führen – optional mit **Einstieg in der Galerie** (Highlight), ohne dass alles doppelt hochgeladen werden muss.

---

## 1. Ausgangslage

- Viele Nutzer:innen sind **ohnehin** auf YouTube, Instagram, TikTok, Facebook unterwegs.
- Videos, Reels oder Kanäle dort **noch einmal** in die App hochladen ist **doppelt** und fehleranfällig.
- **Galeriebesucher:innen** sollen trotzdem **einfach** finden: „Hier geht es zu meinem Kanal / zum Video“ – und **optional** ein **Highlight** direkt in der Galerie sehen (z. B. virtueller Rundgang auf YouTube).

---

## 2. Ziele

| Ziel | Kurzbeschreibung |
|------|------------------|
| **Verbindung** | Eine klare Brücke: Galerie ↔ bestehende Social-/Video-Präsenz. |
| **Eine Quelle der Wahrheit** | URLs und Kennungen **einmal** pflegen (Stammdaten oder Seitengestaltung), **überall** dieselben Links nutzen – Sportwagenmodus. |
| **Besucherfreundlichkeit** | Kein Zwang, Konto bei Meta/Google zu haben; **öffentliche** Links und Embeds funktionieren für alle. |
| **Skalierung** | Gleiche Struktur für **ök2**, Demo, spätere Lizenznehmer: **Konfiguration pro Mandant**, kein Sonderbau pro Person. |

### Positionierung: zentrale Stelle für Galerie und Social

**Selbstverständnis (nach außen):** Die App ist die **zentrale Verwaltungsstelle** für die **Verknüpfung** von Galerie und Social-Media-Aktivitäten: Kanäle, Profile und Highlights werden **hier gebündelt** und **einheitlich** für Galeriebesucher:innen aufbereitet – statt verstreuter Links nur in der Profil-Bio oder in getrennten Notizen.

**Abgrenzung:** Wir **ersetzen** YouTube, Instagram & Co. **nicht** (kein zweites Video-Hosting, kein vollwertiger Posting-Planer für Meta). Das Versprechen ist: **eine Oberfläche**, an der der/die Nutzer:in festlegt, **was** zur Galerie gehört und **wie** Besucher:innen dorthin geführt werden – technisch sauber, wiederholbar, skalierbar.

**Formulierungshinweis:** In Texten für Nutzer:innen eher **„Ihre zentrale Stelle für Galerie und Social“** oder **„Alles, was Besucher sehen sollen – an einem Ort verknüpft“** als harte Behörden-Sprache **„Verwaltungsstelle“** – außer in internen Konzeptpapieren, wo der Begriff Klarheit schafft.

---

## 3. Nutzergruppen

- **Künstler:in / Galerieinhaber:in:** Trägt **profil- oder video-URLs** (und optional ein „Highlight“) in der App ein – **kein** technisches Wissen nötig; Hilfetext: „Link aus dem Browser kopieren“.
- **Besucher:in:** Sieht in der Galerie **Buttons oder kurze Texte** („Auf YouTube ansehen“, „Instagram“). Klick öffnet in **neuem Tab** (oder eingebettetes Video bleibt in der Galerie – je nach Stufe).

---

## 4. Kanäle (Priorität)

| Kanal | Typische Nutzung | Technik (kurz) |
|-------|------------------|-----------------|
| **YouTube** | Kanal, einzelnes Video, Shorts | **Embed** (iframe, offizielle API) sehr stabil; **Link** immer möglich. |
| **Instagram** | Profil, einzelner Post, Reel | **Embed** eingeschränkt (oEmbed, Widget); oft **Link zum Profil/Post** zuverlässiger als „alles eingebettet“. |
| **Weitere** (TikTok, Facebook, Vimeo) | Nach Bedarf | Gleiches Muster: **URL-Felder** + optional **Embed**, wo stabil. |

**Priorität für MVP:** **YouTube** (Link + optional ein Embed) und **Instagram** (mindestens **Profil-Link**).

---

## 5. Umsetzungsstufen (empfohlen)

### Stufe A – Nur Links (schnell, robust)

- Felder z. B.: `socialYoutubeUrl`, `socialInstagramUrl`, optional `socialWebsiteUrl` (bereits teils vorhanden über Website).
- **Darstellung:** Im Bereich **Willkommen** oder **Footer** / Kontakt: **Icon + Text**, `target="_blank"`, `rel="noopener noreferrer"`.
- **Vorteil:** Keine Embed-APIs, wenig Wartung, funktioniert auf allen Geräten.

### Stufe B – Highlight-Video in der Galerie

- Zusätzlich ein Feld: **„Hauptvideo“** (eine YouTube-URL oder Video-ID).
- **Darstellung:** Im Block **Virtueller Rundgang** oder **Willkommen**: eingebetteter YouTube-Player **oder** großer Button „Video ansehen“ → gleiche URL.
- **Vorteil:** Besucher bleiben im Kontext der Galerie, ohne das Gefühl „weggeschickt zu werden“.

### Stufe C – Erweiterte Einbettungen

- Instagram-Embed für **einen** ausgewählten Post (wenn API/Embed stabil).
- Mehrere Videos (Playlist-Gefühl) – nur wenn Bedarf aus Pilotfeedback.

**Empfehlung:** **A + B** zuerst; **C** nur bei klarer Nachfrage.

---

## 6. Datenmodell (Prinzip)

Konfiguration **pro Mandant** (Tenant), **nicht** hardcoded:

- **Pflichtfelder:** keine – alles optional, damit leere Galerie nicht „kaputt“ wirkt.
- **Empfohlene Felder:**  
  - `youtubeChannelOrVideoUrl` (eine URL oder Kanal-URL)  
  - `instagramProfileUrl`  
  - optional `featuredVideoUrl` (YouTube – für Embed oder Deep-Link)

**Speicherort:** in **Stammdaten** und/oder **Seitengestaltung Willkommen** – **eine** festgelegte Quelle, **keine** doppelten Links an drei Stellen (Regel: ein Ort pro Zweck).

**Validierung:** Beim Speichern nur **prüfen**, ob URL mit `https://` beginnt und **bekannte Hosts** (youtube.com, youtu.be, instagram.com, …) – keine Pflicht, exotische Shortlinks zu unterstützen.

---

## 7. Wo in der Oberfläche

| Ort | Inhalt |
|-----|--------|
| **Willkommensbereich** | Kurztext + „Mehr auf YouTube / Instagram“ oder eingebettetes Highlight-Video. |
| **Footer / Kontakt** | Wiederholung der **gleichen** Links (aus derselben Quelle), nicht neue URLs tippen. |
| **Vita** (falls vorhanden) | Optional Verweis auf „Interviews / Videos“ – wieder **dieselbe** URL-Quelle. |

**Nicht:** Überall unterschiedliche Links pflegen – das bricht den Sportwagenmodus.

---

## 8. Besucher:innen & Datenschutz (Kurz)

- **Nur Links:** Beim Klick verlassen Nutzer die Galerie; **YouTube/Instagram** gelten deren Bedingungen – in der **Datenschutzerklärung** der Galerie kann ein kurzer Hinweis auf **externe Inhalte** stehen (Standardformulierung).
- **Embeds:** YouTube-iframe lädt Inhalte von Google; **Privacy-Enhanced Mode** (`youtube-nocookie.com`) wo möglich; Hinweis in Datenschutz optional ergänzen.
- **Kein** Tracking durch uns über Social-Buttons von Drittanbietern ohne Einwilligung – **einfache Textlinks** sind am unproblematischsten.

---

## 9. Abgrenzung K2 / ök2 / Lizenz

- **Gleiche technische Struktur** für alle Mandanten: Felder nur in **tenant-spezifischen** Stammdaten / Seitengestaltung.
- **ök2** nutzt **Muster-Stammdaten** oder Demo-URLs – **keine** K2-echten Daten (bestehendes eisernes Gesetz).
- **K2 echte Galerie:** Änderungen nur nach **expliziter** Anordnung (K2-Kern fertig).

---

## 10. Nächste Schritte (wenn umgesetzt werden soll)

1. **Felder** in `tenantConfig` / Stammdaten-Schema definieren (Namen finalisieren).  
2. **Eine** Bearbeitungsstelle im Admin (Design/Stammdaten) mit Hilfetext.  
3. **Eine** Anzeige-Komponente (`SocialLinks` / `ExternalVideoBlock`) – Willkommen + Footer nutzen dieselbe Quelle.  
4. **Tests:** Snapshot oder einfache URL-Prüfung; **kein** automatischer Abruf von Meta ohne API-Key für MVP.

---

## Kurzfassung

**Konzept:** Externe Inhalte **nicht** duplizieren, sondern **verbinden**: **eine URL-Quelle pro Mandant**, zuerst **Links**, optional **ein YouTube-Highlight** in der Galerie, **Instagram** mindestens als Profil-Link. **Positionierung:** zentrale Stelle für die **Verknüpfung** Galerie ↔ Social (nicht Ersatz für die Plattformen). **Skalierbar**, **besucherfreundlich**, **wartungsarm** – Sportwagenprinzip (ein Standard, viele Aufrufer).
