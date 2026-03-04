# Änderungen Handynutzung & ök2 – Übersicht (Stand 04.03.26)

**Zweck:** Schnell sehen, was umgesetzt ist und wo es im Code liegt.

---

## ✅ Umgesetzt

| Thema | Was | Wo |
|-------|-----|-----|
| **Musterdaten entfernen** | Button leert Felder; nach Reload bleiben sie leer | Stammdaten aus localStorage laden: `ScreenshotExportAdmin.tsx` – State für ök2 initialisiert mit `loadStammdaten('oeffentlich', …)` statt festem MUSTER_TEXTE. Button „Musterdaten entfernen“ ruft `clearStammdatenMuster()` + `persistStammdaten(…, { merge: false })`. |
| **Person 1: Name bearbeitbar** | Kein festes „Lena Berg“ mehr; Eingabefeld „Name“ | `ScreenshotExportAdmin.tsx` – Person-1-Karte: Label „Name“ + Input (martinaData.name). |
| **Hinweis zweite Person weg** | Langer Hinweis oben („Optional zweite Person …“) entfernt | `ScreenshotExportAdmin.tsx` – der graue Hinweis-Block über den Einstellungs-Karten wurde entfernt. |
| **Adresse bei Hauptperson** | Vollständige Adresse (Straße, Ort, Land) bei Person 1 | `ScreenshotExportAdmin.tsx` – Person-1-Karte: „Vollständige Adresse“, Ort+Land in einer Zeile (kompakt). Galerie-Block: nur noch Hinweis „Vollständige Adresse bei Person 1“; keine Adressfelder mehr im Galerie-Block. |
| **Einstellungen: Ein Klick = Inhalt sichtbar** | Klick auf „Meine Daten“, „Drucker“ etc. scrollt den geöffneten Bereich sofort in den sichtbaren Bereich (v. a. Handy) | `ScreenshotExportAdmin.tsx` – `settingsContentRef`, useEffect bei `activeTab`/`settingsSubTab` mit `scrollIntoView({ behavior: 'smooth', block: 'start' })` nach 50 ms; Cleanup mit clearTimeout. |
| **Projekt-Start auf ök2 entfernt** | Link „← Projekt-Start“ führt zu K2-Projekt – auf ök2 nicht mehr angezeigt | `GalerieVorschauPage.tsx` – der Link „← Projekt-Start“ wird nur gerendert, wenn `!musterOnly` (also nur bei K2, nicht bei ök2). |
| **Von Admin zur Galerie: kein „Wähle deinen Einstieg“** | Testuser am Handy: von Admin auf Galerie → Galerie sofort, kein Modal | `GaleriePage.tsx` – wenn `location.state?.fromAdmin` oder `sessionStorage['k2-galerie-from-admin']`, wird `showWelcomeModal` nicht gesetzt. `ScreenshotExportAdmin.tsx` – die zwei „Galerie ansehen“-Links sind jetzt `<Link to={…} state={{ fromAdmin: true }}>` (ök2), damit state ankommt. |
| **Vita / Person 2 zugeklappt** | Vita-Bereich und „Person 2 (optional)“ standardmäßig zu; bei Bedarf aufklappen | `ScreenshotExportAdmin.tsx` – `vitaMartinaOpen`, `vitaGeorgOpen`, `person2BlockOpen` initial `false`; Aufklappen per Klick. |
| **E-Mail: Ein Klick = Ersetzen** | Wenn Feld den Muster-/Default-Wert hat, wird bei Fokus der ganze Text ausgewählt → nächster Tastendruck ersetzt | `ScreenshotExportAdmin.tsx` – onFocus auf E-Mail-Feldern (Person 1, Person 2, Galerie): Vergleich mit Default, dann `e.target.select()`. |
| **Telefon: international** | Placeholder „z.B. +43 664 … (international änderbar)“; Speicherung nur Ziffern für wa.me wo relevant | `ScreenshotExportAdmin.tsx` – Placeholder überall; VK2 Vorstand etc. mit Hinweis international. |
| **Crash 5: Einstellungen-Scroll** | Doppelter useEffect entfernt; vor scrollIntoView `el.isConnected`-Check; Cleanup clearTimeout | `ScreenshotExportAdmin.tsx` – ein useEffect für Einstellungen-Scroll. Doku: `docs/CRASH-BEREITS-GEPRUEFT.md`. |

---

## Wo testen (ök2 / Handy)

- **Admin (ök2):** `/projects/k2-galerie/admin?context=oeffentlich` oder über Demo-Galerie → Admin.
- **Einstellungen → Meine Daten:** Karte „Meine Daten“ tippen → Inhalt scrollt in den sichtbaren Bereich. Person 1: Name, E-Mail, Telefon, Vollständige Adresse, Vita (aufklappbar). Galerie: nur Hinweis „Adresse bei Person 1“, dann Telefon, E-Mail, Website, Bankverbindung.
- **Musterdaten entfernen:** Button (nur ök2) → bestätigen → Felder leer; Seite neu laden → Felder bleiben leer.
- **Von Admin zur Galerie:** Im Admin „Galerie ansehen“ (oder aus Guide) → Galerie öffnet sich ohne Modal „Wähle deinen Einstieg“.
- **Galerie-Vorschau (ök2):** Kein „← Projekt-Start“-Link mehr oben.

---

## Noch nicht committed?

Diese Übersicht beschreibt den **Code-Stand im Repo**. Wenn du lokal weitere Änderungen hast: `git status` prüfen, dann committen und pushen, damit Vercel und Handy den gleichen Stand haben.
