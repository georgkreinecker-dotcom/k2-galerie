# VK2: Smarte Stammdaten-Wartung Vereinsmitglieder (Vorschlag)

**Ziel:** Eine klare, eine Quelle, keine doppelte Pflege – alles am richtigen Ort.

---

## Ausgangslage

- **Registrierte Mitglieder:** Haben K2-Account/Lizenz, erscheinen mit Profil (Name, E-Mail, Kunstrichtung, ggf. Bild/Telefon) in der Vereinsgalerie. Ab 10 wird der Verein kostenfrei.
- **Nicht registrierte Mitglieder:** Nur Namen, im System erfasst (Datenschutz), keine Galerie-Profile.
- **Aktuell:** Registrierte Mitglieder erscheinen an **zwei** Stellen: Tab „Vereinsmitglieder“ (Karten) und unter Einstellungen → Stammdaten (Tabelle + Button „User übernehmen“). Gleiche Daten, doppelte Oberfläche.

---

## Vorschlag: Eine Wartung, eine Anzeige

### 1. **Ein Ort für die Wartung: Einstellungen → Stammdaten (VK2)**

Unter **Einstellungen → Stammdaten** (wenn VK2) bleibt alles Vereins-Stammdaten gebündelt:

- **Verein** (Name, Adresse, Vereinsnummer, E-Mail, Website)
- **Vorstand & Beirat** (Vorsitzende:r/Präsident:in, Stellv. Vorsitzende:r, Kassier:in, Schriftführer:in, Beisitzer:in)
- **Registrierte Mitglieder** (Profile für die Vereinsgalerie)
- **Nicht registrierte Mitglieder** (Namen-Liste)

**Registrierte Mitglieder** dort:

- **Eine Tabelle** mit: Bild, Name, E-Mail, Kunstrichtung, Telefon (optional), Aktionen (Bearbeiten | Entfernen).
- **Ein Button:** „+ Profil für Vereinsgalerie anlegen“ (öffnet die bekannte Maske).
- **Ein Button:** „User aus „Meine User“ übernehmen“ (fügt User mit allen Daten hinzu, ohne Doppel).
- Keine zweite, abgespeckte Tabelle – diese Tabelle ist die **einzige** Bearbeitungsliste.

**Nicht registrierte Mitglieder** unverändert:

- Textbereich, ein Name pro Zeile, Speichern über „Stammdaten speichern“.

### 2. **Tab „Vereinsmitglieder“ = nur Galerie-Ansicht**

Der Tab **„Vereinsmitglieder“** zeigt dieselben registrierten Mitglieder **nur als Vorschau** (Karten mit Bild, Name, E-Mail, Kunstrichtung, „Seit“, Bearbeiten | Entfernen).

- **Ein Klick „Bearbeiten“** → öffnet die **gleiche** Maske „Profil für Vereinsgalerie bearbeiten“; die Daten liegen weiter in `vk2Stammdaten.mitglieder`.
- **Optional:** Unter den Karten ein Hinweis: „Stammdaten (Verein, Vorstand, Mitglieder) bearbeiten → Einstellungen → Stammdaten“ mit Link, der zu Einstellungen → Stammdaten springt.

So gilt: **Stammdaten = eine Quelle (Einstellungen). Tab = Anzeige + schneller Zugriff auf Bearbeiten.**

### 3. **Was wegfällt / was bleibt**

- **Wegfällt:** Kein zweiter, inhaltlich gleicher Block „Registrierte Mitglieder“ an anderer Stelle mit anderer UI.
- **Bleibt:** „User aus „Meine User“ übernehmen“ nur **einmal** – unter Einstellungen → Stammdaten bei den Registrierten Mitgliedern.
- **Bleibt:** Die Maske „Profil für Vereinsgalerie“ (Name, E-Mail, Kunstrichtung) – aufrufbar von der Tabelle in Stammdaten **und** von den Karten im Tab (gleiche Logik, gleicher Speicherort).

### 4. **Ablauf für dich (Georg)**

- **Neues Profil anlegen:** Einstellungen → Stammdaten → „+ Profil für Vereinsgalerie anlegen“ → Maske ausfüllen → Speichern.
- **User aus „Meine User“ holen:** Einstellungen → Stammdaten → „User aus „Meine User“ übernehmen“ → Liste wird ergänzt.
- **Profil ändern:** Entweder im Tab „Vereinsmitglieder“ auf „Bearbeiten“ an der Karte klicken **oder** unter Einstellungen → Stammdaten in der Tabelle „Bearbeiten“ klicken → dieselbe Maske.
- **Verein / Vorstand / Nicht registrierte:** Alles unter Einstellungen → Stammdaten; einmal „Stammdaten speichern“.

---

## Kurzfassung

| Wo | Was |
|----|-----|
| **Einstellungen → Stammdaten (VK2)** | **Eine** Wartung: Verein, Vorstand, **Registrierte Mitglieder** (Tabelle + „Profil anlegen“ + „User übernehmen“), **Nicht registrierte** (Namen). |
| **Tab „Vereinsmitglieder“** | **Anzeige** der registrierten Mitglieder (Karten) + Bearbeiten/Entfernen (öffnet dieselbe Maske, schreibt in dieselben Daten). |

**Prinzip:** Stammdaten-Wartung = unter Einstellungen. Tab = schneller Blick auf die Galerie-Profile und Bearbeiten ohne Umweg.

Wenn du willst, können wir als nächsten Schritt nur die **Redundanz** entfernen (doppelte „Registrierte Mitglieder“-Tabelle an einer der beiden Stellen streichen) und den Link „Stammdaten bearbeiten → Einstellungen“ im Tab ergänzen. Die genaue Platzierung (Tabelle nur in Stammdaten, Karten nur im Tab) kannst du dann in Ruhe testen.
