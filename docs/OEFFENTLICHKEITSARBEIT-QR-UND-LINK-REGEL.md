# Öffentlichkeitsarbeit – QR und Link (verbindliche Regel)

**Stand:** 17.03.26 – Festgehalten nach Georg: Welche Medien bekommen automatisch QR, welche brauchen nur den Link.

---

## Zwei Gruppen

### 1. Automatisch mit QR-Codes versehen (keine Extra-Eingabe)

**Plakate, Event-Flyer, Newsletter, QR-Code-Plakate** werden automatisch mit den QR-Codes des Users bzw. des Vereins versehen. Der Nutzer muss sie **nicht** extra eintragen.

- **Quelle:** Galerie-URL des Mandanten (K2 / ök2 / VK2) – daraus wird der QR erzeugt.
- **Technik:** Beim Erzeugen/Öffnen dieser Dokumente wird die passende URL (User-Galerie oder Verein-Galerie) verwendet und als QR-Bild eingebettet (z. B. Platzhalter `<!-- QR_BLOCK -->` beim Öffnen ersetzen, oder beim PDF/HTML-Export den QR automatisch einbauen).
- **Konsequenz:** Keine Eingabefelder „QR-Code hier einfügen“ für diese Medien – System setzt sie aus Kontext.

### 2. Nur Link nötig (kein QR-Bild im Dokument)

**Social Media und Presseaussendung** benötigen nur den **Link** (URL zum Teilen/Kopieren). Ein QR-Bild muss nicht ins Dokument – der Link reicht.

- **Social Media:** Post-Text mit Link; Nutzer kopiert Link in Instagram/Facebook/WhatsApp.
- **Presseaussendung:** Text mit Link zur Galerie/Pressebereich; Redaktion klickt oder kopiert den Link.
- **Konsequenz:** Kein zwingendes QR-Bild in diesen Formaten – Link anzeigen/kopierbar reicht.

---

## Kurzfassung

| Medien | QR/Link |
|--------|--------|
| Plakat, Event-Flyer, Newsletter, QR-Plakat | **Automatisch** QR-Codes (User/Verein) – keine Extra-Eingabe |
| Social Media, Presseaussendung | **Nur Link** – reicht zum Teilen/Kopieren |

---

**Verknüpfung:** Admin Tab Presse & Medien, Eventplanung → Öffentlichkeitsarbeit; GaleriePage `openEventDocument` (QR-Injection); ScreenshotExportAdmin Generatoren (Presse, Social, Newsletter, Plakat).
