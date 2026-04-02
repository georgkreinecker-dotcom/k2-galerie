# 27. Lizenznehmer: Admin-QR fürs Handy

**Ziel:** Nach dem Lizenzabschluss oder nach der Registrierung in der eigenen Galerie-Instanz soll klar sein, wie der **Admin** auf dem Mobilgerät erreichbar ist – getrennt vom **Galerie-QR** für Besucher.

---

## Kurz erklärt

| Was | Zweck |
|-----|--------|
| **Galerie-QR** auf der öffentlichen Galerie-Seite | Führt Besucher zur **Galerie** – nicht in den Admin |
| **Admin-QR** in den Stammdaten bzw. auf der Lizenz-Erfolgsseite | Führt zur **Admin-Adresse** deiner Instanz – Bearbeiten, Werke, Einstellungen |

Ohne diesen zweiten Code ist leicht Verwechslung: Der Galerie-QR öffnet nie den Admin.

---

## Wo du den Admin-QR findest

### 1. Direkt nach dem Kauf – Lizenz-Erfolgsseite

Nach erfolgreicher Zahlung zeigt die Seite **Lizenz erworben** deinen Admin-Link. Wenn die Adresse ein **`/admin`** enthält – in der Regel mit deiner **tenantId** in der URL – erscheint darunter derselbe Bereich mit **QR-Bild speichern** und **Admin-Link kopieren**. So kannst du den QR sofort aufs Handy legen.

### 2. Später – Einstellungen, Stammdaten

In **deiner** Galerie-Instanz – nicht auf der zentralen Plattform-Seite von kgm:

1. **Admin** öffnen, **Einstellungen** → **Stammdaten**.
2. Unter **Registrierung** zuerst deine **Lizenznummer** speichern – erst danach wird der Admin-QR-Bereich angezeigt.
3. Dort: **Admin-Link kopieren**, **QR-Bild speichern** oder **Stand für QR neu laden**, damit der Scan immer die aktuelle App-Version trifft.

Technisch nutzt der QR dieselbe Logik wie die übrigen Produkt-QR-Codes: Server-Stand plus Cache-Bust.

---

## Nutzung am Handy

1. QR scannen oder gespeichertes Bild in der Fotos-App nutzen.
2. Browser öffnet den Admin deiner Galerie – **Galerie-Passwort** wie am Computer eingeben.
3. Optional: Seite als **Lesezeichen** speichern, damit du nicht jedes Mal scannen musst.

---

## Was nicht passiert

- Der **öffentliche** Galerie-QR ersetzt **nicht** den Admin-QR.
- Auf der **Plattform-Instanz** von kgm erscheint dieser Lizenznehmer-Block in den Stammdaten **nicht** – er gilt nur für **deine** eigene Galerie-URL bzw. deinen Clone.

---

**Quelle im Code:** `src/components/LicenseeAdminQrPanel.tsx`, Einstellungen in `ScreenshotExportAdmin`, Erfolgsseite `LizenzErfolgPage`, Hilfsfunktionen `src/utils/publicLinks.ts`.
