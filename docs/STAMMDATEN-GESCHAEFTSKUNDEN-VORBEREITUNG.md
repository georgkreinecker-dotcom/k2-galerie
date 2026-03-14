# Stammdaten – auf Geschäftskunden vorbereitet sein

**Anmerkung Georg (14.03.26):** In den Stammdaten müssen wir auf **Geschäftskunden** vorbereitet sein – du weißt, was ich meine.

---

## Was das bedeutet

- **Nicht nur Privatpersonen:** Das Datenmodell (Stammdaten Galerie, Künstler:innen, später ggf. Kunden/Kassa) soll von vornherein **Geschäftskunden** abbilden können.
- **Typische Felder:** Firma / Firmenname, USt-IdNr., Rechnungsadresse (ggf. abweichend von Liefer-/Kontaktadresse), Ansprechpartner:in.
- **Wo es greift:** (1) **Eigene Stammdaten** (Galerie als Betrieb) – z. B. wenn wir Rechnungen ausstellen oder uns als Firma darstellen. (2) **Kunden-/Kassendaten** – Käufer:innen, Lizenznehmer:innen können Firmen sein; dann Firma + USt-IdNr. + Rechnungsadresse erfassen.

---

## Konsequenz für die Arbeit

- **Bei jeder Erweiterung der Stammdaten** (Admin → Stammdaten, neue Felder, Kassa/Kunden): Geschäftskunden mitdenken – keine reine Privatpersonen-Struktur fest verdrahten.
- **Konfiguration statt Festverdrahtung:** Wo Kontakt/Adresse gespeichert wird: Struktur so wählen, dass optional Firma, USt-IdNr., Rechnungsadresse dazu können (oder bereits Platz dafür vorsehen).
- **Bestehende Struktur:** Galerie-Stammdaten haben bereits z. B. `gewerbebezeichnung`; bei neuen Bereichen (z. B. Kunden im Shop/Kassa) von Anfang an „Person oder Firma“ und Rechnungsadresse einplanen.

---

**Kurzfassung:** Stammdaten und künftige Kunden-/Rechnungsdaten so konzipieren, dass Geschäftskunden (Firma, USt-IdNr., Rechnungsadresse) abbildbar sind – nicht nur Privatpersonen.

---

## Umgesetzt (14.03.26)

- **Galerie-Stammdaten** haben optional: **firmenname**, **ustIdNr**, **rechnungAddress**, **rechnungCity**, **rechnungCountry**.
- **Admin → Einstellungen → Galerie-Adresse:** Block „Geschäftskunden (optional)“ mit Firmenname, USt-IdNr., Rechnungsadresse (falls abweichend).
- **Admin → Einstellungen → Registrierung (K2/ök2):** Gleiche Felder unter Galerie/Atelier.
- **Speicher/Merge:** stammdatenStorage mergeStammdatenGallery und Laden/Reparatur ziehen die neuen Felder mit; Backup enthält sie.
- **Quelle:** K2_STAMMDATEN_DEFAULTS.gallery, MUSTER_TEXTE.gallery; Merge-Logik in stammdatenStorage.ts.
