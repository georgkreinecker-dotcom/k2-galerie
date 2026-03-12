# K2 Dokumente – Galerieeröffnung & Vorstellung ök2/VK2

**Stand:** 08.03.26 · **Zweck:** Eine Übersicht: Event Galerieeröffnung + Vorstellung der Plattform (ök2/VK2). Alle Texte dafür liegen bereits in mök2 bzw. in der Doku.

---

## 1. Zwei Themen, eine Eröffnung

| Thema | Inhalt | Wo die Texte liegen |
|-------|--------|----------------------|
| **Event Galerieeröffnung** | Konkretes Event (Datum, Ort, Einladung, Flyer, Presse für „Wir eröffnen die Galerie“). | Admin → **Events & Ausstellungen** → Event „Galerieeröffnung“ (z. B. 24.–26. April) → dort **Dokumente** (Flyer, Einladung, Presseaussendung) erzeugen. Werte kommen aus **Stammdaten** + Event. |
| **Vorstellung ök2/VK2** | Botschaft „Gemeinsame Lounge“, Plattform für Künstler:innen/Galerien/Vereine (K2 · ök2 · VK2). | **mök2** – Sektion **„Eröffnung K2 + ök2 + VK2 (Marketinglinie)“** und **docs/MARKETING-EROEFFNUNG-K2-OEK2.md**. |

Beides gehört zusammen: Eine Eröffnung, eine Botschaft. Die **Texte für die Plattform-Vorstellung** sind in mök2 bereits fertig (Kernbotschaft, Lounge-Text, Einladungs-Muster, Presse-Muster, Links & QR).

---

## 2. Wo was steht (mök2)

- **mök2 → Eröffnung K2 + ök2 + VK2**  
  Kernbotschaft (1 Satz), Lounge-Text (für Einladung/vor Ort), Links & QR (K2 Galerie, ök2 Demo, VK2). Zum Kopieren und in Einladung/Presse einbauen.

- **docs/MARKETING-EROEFFNUNG-K2-OEK2.md**  
  Vollständige Strategie: Checkliste 2 Wochen, Einladung (Muster), Presseinformation (Muster inkl. Absatz „Plattform/Lounge“), Social-Kurztexte, Links & QR. Quelle für alle Eröffnungs-Texte.

- **mök2 → Prospekt Galerieeröffnung K2**  
  Einseitiger Prospekt (Druckversion) – aus Stammdaten befüllt, mit QR zur Galerie. Route in der App: Prospekt Galerieeröffnung öffnen (aus mök2 verlinkt).

---

## 3. Event-Dokumente im Admin (Galerieeröffnung)

Unter **Admin → Events & Ausstellungen** das **Eröffnungsevent** anlegen bzw. nutzen.

**Empfohlener Event-Titel (Galerieeröffnung):**  
„Galerieeröffnung K2 Kunst & Keramik – K2 Galerie, die Künstlerapp, startet.“  
(Wird im Admin beim Typ „Galerieeröffnung“ als Platzhalter-Vorschlag angezeigt.)

Zu diesem Event können erzeugt werden:

- **Einladung** (z. B. zur Vernissage)  
- **Flyer** (Event-Flyer)  
- **Presseaussendung** – **zwei Varianten:**  
  - **Neutral (ohne Personendaten):** Nur sachliche Information (Termin, Ort, Ausstellung), kein Kontaktblock, keine Künstler:innen-Namen – für neutrale/überregionale Verwendung.  
  - **Lokal (mit Personenstory):** Mit Künstler:innen, Kurzbios und Kontakt (E-Mail, Telefon, Adresse) – für lokale Presse und persönliche Ansprache.  
- **Newsletter**, **Plakat** (optional)

Diese Dokumente werden aus **Stammdaten** (Galerie, Martina, Georg) und **Event-Daten** (Titel, Datum, Ort, Beschreibung) befüllt. **Bilder:** Willkommensbild aus Seitengestaltung bzw. Fallback `/img/k2/willkommen.jpg`.

**Tipp:** Den **Lounge-Text** (Vorstellung ök2/VK2) aus mök2 in die **Event-Beschreibung** oder in die **Presseaussendung** kopieren (Copy-Paste aus mök2 → Sektion „Eröffnung K2 + ök2 + VK2“ → Lounge-Text), damit Presse und Gäste die Plattform mitlesen.

---

## 4. Feste Druckseiten (K2)

| Dokument | Route / Wo | Text | Bild |
|----------|------------|------|------|
| **Flyer K2 Galerie** | `/flyer-k2-galerie` (oder über mök2 verlinkt) | Stammdaten, Werbelinie, Event-Datum aus K2-Events | Willkommensbild (Stammdaten/Seitengestaltung), Fallback `/img/k2/willkommen.jpg` |
| **Presse-Einladung K2** | `/presse-einladung-k2-galerie` | Stammdaten + erstes K2-Event (Titel, Datum, Ort) | – |
| **Prospekt Galerieeröffnung** | mök2 → Prospekt Galerieeröffnung K2 → „Prospekt Galerieeröffnung öffnen“ | Stammdaten, Event, QR zur Galerie | – |

Weitere Werke/Bilder: `public/img/k2/` (willkommen.jpg, galerie-card.jpg, virtual-tour.jpg, werk-K2-*.jpg). Standardtexte für Galerie (Adresse, Öffnungszeiten) stehen in **K2_STAMMDATEN_DEFAULTS** (tenantConfig), falls noch keine Stammdaten gespeichert sind.

---

## 5. Kurzfassung

- **Event Galerieeröffnung:** Admin → Events → Eröffnungsevent → Dokumente (Flyer, Einladung, Presse) – befüllt aus Stammdaten + Event.
- **Vorstellung ök2/VK2:** Texte (Kernbotschaft, Lounge-Text, Presse-Muster, Links) **sind in mök2** – Sektion „Eröffnung K2 + ök2 + VK2“ und **docs/MARKETING-EROEFFNUNG-K2-OEK2.md**. Dort nichts Neues erfinden; Copy-Paste in Event-Presse oder Einladung reicht.
- **Bildmaterial:** `/img/k2/` (Willkommen, Galerie-Karte, Werke). Fallback für Flyer: `willkommen.jpg`, wenn kein Bild in Seitengestaltung.

Wenn du willst, können wir als Nächstes ein konkretes Event-Dokument (z. B. Presse für Eröffnung) so anpassen, dass der Lounge-Text aus der Strategie direkt mit eingebaut wird.
