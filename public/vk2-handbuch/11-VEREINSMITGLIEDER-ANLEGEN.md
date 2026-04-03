# Vereinsmitglieder anlegen – Schritt für Schritt

Dieses Kapitel beschreibt, wie ihr Mitglieder anlegt, aus Listen übernehmt, bearbeitet und dem Mitglied die Bearbeitung selbst erlaubt (PIN und Login).

---

## Wo legt ihr neue Mitglieder an?

- **Neue Profile** (mit allen Feldern): Tab **„Vereinsmitglieder neu anlegen oder ändern“** – erste Karte auf der Admin-Startseite. Dort: **„+ Profil anlegen“** oder **„👥 User übernehmen“** (Muster-Profile).
- **Nur ein Name** in der Liste (ohne Profil): **Einstellungen → Stammdaten** → unter der Tabelle **„Nur Name hinzufügen (ohne Profil)“**.
- **Übersicht, Bearbeiten, CSV-Import, Druck:** **Einstellungen → Stammdaten** → Block „Mitgliederliste“.

---

## 1. Einzelnes Profil anlegen („+ Profil anlegen“)

1. Tab **„Vereinsmitglieder neu anlegen oder ändern“** öffnen → **„+ Profil anlegen“** klicken.
2. Formular ausfüllen: **Name** (Pflicht), E-Mail, Telefon, Website, **Kategorie**, Adresse, Eintrittsdatum. Optional: Mitgliedsfoto, Werkfoto, **Lizenznummer**, **Link zur eigenen Galerie** – das sind nur weitere Felder wie die anderen.
3. **PIN (4-stellig):** Nur ausfüllen, wenn das Mitglied später **selbst** sein Profil bearbeiten dürfen soll (siehe Abschnitt „Freigabe für Mitglieder“).
4. **Speichern.** Das Mitglied erscheint in der Liste. **Hakerl „In Galerie anzeigen“** = erscheint auf der öffentlichen Karte „Unsere Mitglieder“; ohne Hakerl nur in der Verwaltung sichtbar.

---

## 2. Muster-Profile übernehmen („👥 User übernehmen“)

Im Tab **„Vereinsmitglieder“** auf **„👥 User übernehmen“** klicken. Es werden vordefinierte Beispiel-Profile (noch nicht vorhandene) in die Liste übernommen. Danach wie gewohnt bearbeitbar.

---

## 3. CSV-Import

**Einstellungen → Stammdaten** → im Block „Mitgliederliste“ die **CSV-Datei** hochladen (Drag & Drop oder Auswahl). Erste Zeile = Spaltenüberschriften (z. B. Name, E-Mail, Typ, Ort, Telefon, Lizenz). Pro Zeile entsteht ein Mitglied; Duplikate (gleicher Name) werden zusammengeführt. Anschließend in der Liste bearbeiten.

---

## 4. Nur Name in die Liste (ohne Profil)

**Einstellungen → Stammdaten** → unter der Tabelle **„Nur Name hinzufügen (ohne Profil)“**: Namen eintippen, **Hinzufügen**. Der Name erscheint in der Tabelle (Spalte „Unterscheidung“: nur Name). Für diese Einträge gibt es keinen Mitglieder-Login – sie dienen nur der Übersicht.

---

## 5. Mitglieder bearbeiten

In der Mitgliederliste auf eine **Zeile** klicken → Bearbeiten-Modal mit allen Feldern. Änderungen speichern. Hakerl „In Galerie anzeigen“ setzen oder abwählen.

---

## 6. Freigabe für Mitglieder (PIN + Login)

Damit ein Mitglied **sein eigenes Profil** bearbeiten kann:

1. **Bearbeiten** öffnen → Feld **„PIN (4-stellig)“** ausfüllen (oder Zufalls-PIN) → Speichern.
2. Dem Mitglied **Link** (z. B. `/vk2-login`) **und PIN** mitteilen (QR-Code unter Einstellungen → Stammdaten; Link kopieren und weitergeben).
3. Mitglied: Login-Seite öffnen → Namen wählen → PIN eingeben → Anmelden. Danach eigener Bereich zum Bearbeiten. **Vorstand** kommt in den vollen Admin.

---

## Vereinsmitglied und ök2-Lizenz – klarer Ablauf

Die Mitgliederliste des Vereins und die ök2-Lizenzen (eigene Galerie) sind **nicht automatisch verknüpft**. Es gibt zwei Wege – beide enden damit, dass der **Verein** die Angaben im Profil einträgt.

### Weg A: Vereinsmitglied erwirbt eine ök2-Lizenz

1. **Mitglied** geht zur **Lizenz-Seite** (z. B. Link von eurer Vereinsseite oder von der Willkommensseite der Plattform: „Lizenz kaufen“ / „Lizenz abschließen“).
2. Lizenz wählen (Basic/Pro), **Name und E-Mail** eingeben, bezahlen (Karte über Stripe).
3. Nach der Zahlung erscheint die **Erfolgsseite** mit dem **Link zur eigenen Galerie** (z. B. `https://…/g/galerie-…`). Diesen Link kann das Mitglied **ausdrucken oder kopieren**.
4. **Mitglied teilt dem Vorstand den Galerie-Link mit** (z. B. per E-Mail oder Messenger).
5. **Vorstand** öffnet die Mitgliederliste, klickt auf das Mitglied (oder legt es neu an) → **Bearbeiten** → im Feld **„Link zur eigenen Galerie“** (Lizenz-Galerie-URL) diesen Link eintragen → Speichern. Optional: **Lizenznummer** eintragen, falls das Mitglied eine bekommt (z. B. von der Bestätigung).

**Kurz:** Mitglied kauft → bekommt Galerie-Link → gibt Link an Verein → Verein trägt Link im Profil ein.

### Weg B: Jemand hat schon eine ök2-Lizenz und wird Vereinsmitglied

1. **Vorstand** legt ein neues Profil an (Tab „Vereinsmitglieder“ → „+ Profil anlegen“) oder bearbeitet ein bestehendes.
2. Name, E-Mail, weitere Felder wie üblich ausfüllen.
3. **„Link zur eigenen Galerie“** eintragen (die Adresse der Galerie des Mitglieds, z. B. `https://…/g/galerie-…`). Optional: **Lizenznummer**, falls bekannt.
4. Speichern. Fertig – das Mitglied erscheint in der Liste, und der Vereinskatalog kann bei Bedarf Werke von dieser Galerie anzeigen.

**Kurz:** Verein trägt die Galerie-URL (und ggf. Lizenznummer) im Mitgliedsprofil ein. Kein automatischer Abgleich – der Verein bekommt die Infos vom Mitglied (z. B. per E-Mail/Link).

### Wichtig (vice versa)

- **Lizenzsystem** (Zahlung, Galerie-URL) und **Vereinsmitgliederliste** sind getrennt. Es gibt **keine automatische Synchronisation**.
- Infos kommen **immer über eine klare Handlung** an: Entweder das Mitglied teilt dem Verein den Galerie-Link (und ggf. Lizenznummer) mit, oder der Verein trägt ein, was das Mitglied ihm mitteilt. So bleibt der Ablauf nachvollziehbar und datensicher.

---

## Kurzüberblick

| Aktion | Wo |
|--------|-----|
| Neues Profil | Tab „Vereinsmitglieder“ → „+ Profil anlegen“ |
| Muster übernehmen | Tab „Vereinsmitglieder“ → „👥 User übernehmen“ |
| CSV importieren | Einstellungen → Stammdaten → Mitgliederliste |
| Nur Name (ohne Profil) | Einstellungen → Stammdaten → „Nur Name hinzufügen (ohne Profil)“ |
| Bearbeiten, Hakerl, PIN | Zeile anklicken → Bearbeiten-Modal |
| Login für Mitglieder | PIN vergeben + Link/QR und PIN mitteilen |
| Mitglied kauft ök2 | Mitglied gibt Galerie-Link an Verein → Verein trägt „Link zur eigenen Galerie“ ein |
| Hat schon ök2, wird Mitglied | Verein trägt im Profil „Link zur eigenen Galerie“ (und ggf. Lizenznummer) ein |

[SEITENUMBRUCH]
