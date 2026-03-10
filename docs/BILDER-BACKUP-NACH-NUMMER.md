# Bilder-Backup nach Nummer (parallele Datei)

**Idee:** Eine zusätzliche Datei auf den Geräten, die **nur die Bilder** enthält – mit derselben Nummerierung wie die Werke (0030, K2-K-0031, …). Im Notfall kann diese Datei „hereingeladen“ werden; die Bilder werden den bestehenden Werken anhand der Nummer zugeordnet.

---

## Warum das hilft

- **Vollbackup** enthält heute nur `imageRef` (Verweis auf IndexedDB). Auf einem anderen Gerät ist IndexedDB leer → nach Wiederherstellung fehlen die Bilder.
- **Bilder-Backup** = eine Datei, in der pro Werknummer das **echte Bild** (komprimierte Data-URL oder Binär) steht. Unabhängig vom Gerät: Werke haben Nummern, die Datei hat Bilder unter denselben Nummern → beim Laden werden die Bilder den Werken zugeordnet.

---

## Was gebaut werden müsste

| Teil | Beschreibung | Aufwand (grob) |
|------|--------------|----------------|
| **1. Bilder-Backup speichern** | Button in Einstellungen (Backup & Wiederherstellung). Lädt alle Werke, löst Bilder aus IndexedDB auf (`resolveArtworkImages`), baut ein Objekt `{ "K2-K-0030": dataUrl, "K2-K-0031": dataUrl, … }`. Bilder vor dem Speichern komprimieren (z. B. wie „mobile“). Datei als JSON herunterladen (z. B. `k2-bilder-backup-2026-03-10.json`). | 1–1,5 h |
| **2. Bilder-Backup laden** | Button „Bilder-Backup laden“ → Datei-Dialog. Datei einlesen, parsen. Für jeden Eintrag (Nummer → Bild): passendes Werk in der aktuellen Werkliste finden (über `getKeysForMatching`, damit 0030 und K2-K-0030 treffen), Bild in IndexedDB legen (`putArtworkImage`), Werk mit `imageRef` aktualisieren. Geänderte Werkliste mit `saveArtworksByKeyWithImageStore` speichern. **Nur Bilder** werden ergänzt/ersetzt, Werke (Titel, Preis, …) bleiben unverändert. | 1,5–2 h |
| **3. UI + Fehlerbehandlung** | Zwei Buttons + kurze Hilfetexte in „Backup & Wiederherstellung“. Bei Laden: Hinweis wenn keine passenden Werke gefunden werden; Fortschritt bei vielen Bildern optional. | 0,5 h |

**Gesamt: etwa 3–4 Stunden** für eine schlanke, nutzbare Version.

---

## Dateigröße

- Pro Bild (komprimiert, z. B. 560 px, Qualität 0,48): grob 80–150 KB als Data-URL im JSON.
- 20 Werke: ~2–3 MB. 70 Werke: ~7–12 MB. Für eine Backup-Datei am Gerät/auf backupmicro machbar.

---

## Ablauf (nach Umsetzung)

1. **Regelmäßig (z. B. nach Fotosession):** „Bilder-Backup speichern“ → Datei landet im Download-Ordner (iPad/Mac). Datei z. B. auf backupmicro oder in „K2 Backups“ kopieren.
2. **Notfall (Bilder weg nach Stand holen / Gerätewechsel):** „Bilder-Backup laden“ → Datei wählen → Bilder werden den vorhandenen Werken (anhand Nummer) zugeordnet und in IndexedDB gespeichert. Kein Ersetzen der ganzen Werkliste – nur Bilder zurückholen.

---

## Offen

- Soll das umgesetzt werden? Wenn ja, kann die Implementierung an obige Schritte angelehnt werden.
- Optional: Beim „Vollbackup herunterladen“ könnte ein zweiter Download „Bilder-Backup (nach Nummer)“ angeboten werden, damit man nur eine Aktion braucht und zwei Dateien bekommt (Vollbackup + Bilder-Backup).
