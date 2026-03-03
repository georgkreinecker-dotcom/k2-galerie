# Medienstudio für User – Produkt-Feature (Künstler:innen & Kunstvereine)

**Stand:** 03.03.26  
**Ziel:** Presse und Medienarbeit von Anfang an professionell – wie ein eigenes kleines Medienstudio, eingebaut in die K2 Galerie. **Gewaltiger Mehrwert** für Künstler:innen und Kunstvereine.

**Hintergrund:** Wir setzen für uns (mök2, APf) bereits Standards: Medienstudio K2 (docs/MEDIENSTUDIO-K2.md), Presse-Standard, Medienkit, Redaktionsplan. Dasselbe Niveau wollen wir **den Usern** anbieten – ohne dass sie etwas Neues erfinden müssen.

---

## 1. Zielgruppe & Nutzen

| Zielgruppe | Nutzen |
|------------|--------|
| **Künstler:innen** (Atelier, Ausstellungen, Märkte) | Pressearbeit ohne Agentur: Medienkit zum Kopieren/Versand, Vorlage für Einladungen/Vernissagen, Überblick „Presseinfo verschickt?“. Seriös und einheitlich. |
| **Kunstvereine (VK2)** | Gleiche Funktion mit Vereinsdaten: Vereinsname, Ansprechpartner, nächste Events – eine Quelle, professioneller Auftritt nach außen. |

**Abhebung:** Kaum eine Galerie-/Künstler-Software bietet „Presse & Medien“ aus einer Hand mit Stammdaten-Anbindung. Das hebt uns klar ab (siehe FEATURES-ABHEBUNG-ZIELGRUPPE.md).

---

## 2. Wo im Produkt

- **Ort:** **Marketing** (Außenkommunikation) – neben Events, Flyer, Dokumente.
- **Einstieg:** Eine Karte / ein Bereich **„Presse & Medien“** oder **„Medienkit“** im Admin (Marketing-Tab oder eigener Unterpunkt).
- **Eine Implementierung für alle Kontexte:** K2, ök2, VK2 – Datenquelle je nach Mandant (Stammdaten Galerie vs. Vereins-Stammdaten).

---

## 3. Umfang in Phasen

### Phase 1 (MVP) – Medienkit + Presse-Vorlage

| Baustein | Beschreibung |
|----------|--------------|
| **Medienkit** | Aus **Stammdaten** automatisch erzeugt: Kurztext über Galerie/Verein, Ansprechpartner (Name, E-Mail, Telefon), Adresse, optional 1–2 Sätze Bild-/Nutzungshinweise. Buttons: **„Als PDF“** / **„Kopieren“** – sofort nutzbar für E-Mail-Anhänge oder Versand. |
| **Presse-Vorlage** | **Eine** Vorlage (z. B. Einladung Vernissage / Eröffnung) mit Variablen: **Datum, Anlass, Ort**. User füllt nur diese Felder aus → fertiger Text zum Kopieren oder „In Zwischenablage“. Kein Neuerfinden, gleicher Standard wie bei uns (PRESSEARBEIT-STANDARD). |

**Datenquellen:** K2/ök2 → Stammdaten Galerie (galleryData, martinaData, georgData bzw. Muster). VK2 → vk2Stammdaten (Verein, Ansprechpartner, Mitglieder optional).

### Phase 2 – Pressekontakte

| Baustein | Beschreibung |
|----------|--------------|
| **Meine Pressekontakte** | Einfache Liste: Name, E-Mail (optional Medium/Notiz). Speicher z. B. `k2-pressekontakte` / `k2-oeffentlich-pressekontakte` / `k2-vk2-pressekontakte`. Kein Versand in der App – nur Liste zum Export/Kopieren für E-Mail-Programm. |

### Phase 3 – Redaktionsplan light

| Baustein | Beschreibung |
|----------|--------------|
| **Nächste Presse-Termine** | Anzeige der nächsten **Events** (z. B. 3–5) mit Checkbox **„Presseinfo verschickt?“**. Speicher pro Event optional (z. B. in Event-Objekt oder kleinem Mapping). So behalten User den Überblick ohne separates Tool. |

---

## 4. Umsetzungsreihenfolge: K2 zuerst, dann ök2

| Schritt | Was | Warum |
|--------|-----|-------|
| **1. K2 als Testobjekt** | Medienstudio (Medienkit + Presse-Vorlage) **zuerst für K2** bauen und testen – mit echten Stammdaten (Martina & Georg, echte Galerie). | Du siehst sofort, ob es passt; echte Pressearbeit kann von Anfang an damit laufen. |
| **2. Kontextfähig bauen** | Von vornherein **eine** Implementierung, die den **Kontext** (K2 vs. ök2 vs. VK2) nutzt: Stammdaten aus der richtigen Quelle (z. B. `loadStammdaten(tenant)` bzw. musterOnly → Muster-Stammdaten). | Dann muss für ök2 **nichts Zweites** gebaut werden – dieselbe Oberfläche, andere Daten. |
| **3. ök2 „dazu“** | **Nichts extra für ök2 programmieren.** Wer im ök2-Admin „Presse & Medien“ öffnet, bekommt dieselbe Seite mit **Muster-Stammdaten** (Galerie Muster, Lena Berg, Paul Weber). Optional: kurzer Hinweis „Demo – in Ihrer lizenzierten Galerie nutzen Sie Ihre eigenen Daten.“ | Kein doppelter Aufwand; ök2 dient zur Vorschau/Demo für spätere Lizenznehmer. |

**Kurz:** K2 zuerst umsetzen und testen. Weil wir kontextfähig bauen, ist ök2 automatisch mit dabei – nur die Datenquelle wechselt. Die „Sache mit ök2“ ist also: **nicht zweimal bauen, einmal kontextfähig bauen.**

---

## 5. Nächste Schritte (abarbeitbar)

**Reihenfolge für Phase 1 (K2 zuerst, kontextfähig):**

| Nr. | Schritt | Konkret |
|-----|--------|--------|
| **1** | **Ort im Admin festlegen** | ✅ Erledigt: eigener Tab **„Presse & Medien“** im Admin (neben Events, Design). Hub-Kacheln und Bereichs-Karten ergänzt. |
| **2** | **Stammdaten-Anbindung** | ✅ Erledigt: Medienkit-Text aus galleryData, martinaData, georgData (K2/ök2) bzw. vk2Stammdaten (VK2). Tenant aus useTenant() – kontextfähig. |
| **3** | **UI Medienkit** | ✅ Erledigt: Block „Medienkit“ mit generiertem Text, Button **„Kopieren“**. Hinweis bei fehlenden Daten: „In Einstellungen → Stammdaten ergänzen.“ („Als PDF“ optional später.) |
| **4** | **Presse-Vorlage** | ✅ Erledigt: Drei Felder Anlass, Datum, Ort; fertiger Text; Button **„In Zwischenablage“**. |
| **5** | **Test K2** | Mit echten K2-Stammdaten testen: Medienkit passt, Presse-Vorlage füllt sich, Kopieren funktioniert. |
| **6** | **Prüfung ök2** | Im ök2-Admin denselben Bereich öffnen – Muster-Stammdaten; Hinweis „Demo – in Ihrer Galerie nutzen Sie Ihre eigenen Daten.“ eingebaut. |

**Danach (optional):** Phase 2 Pressekontakte-Liste, Phase 3 „Presseinfo verschickt“ an Events.

---

## 6. Technik & Regeln

- **Keine doppelten Eingaben:** Medienkit-Text kommt aus Stammdaten; wo Stammdaten fehlen, Fallback/Platzhalter und Hinweis „In Stammdaten ergänzen“.
- **Kontext getrennt:** K2 / ök2 / VK2 je eigene Keys und Datenquelle (dokumente-kontext-eine-quelle, k2-oek2-trennung).
- **Skalierbar:** Eine UI, eine Logik – Mandant steuert nur die Datenquelle.
- **One-Click wo möglich:** Ein Klick „Kopieren“ = Medienkit in Zwischenablage; ein Klick „Text anzeigen“ = Presse-Vorlage mit ausgefüllten Variablen.

---

## 7. Verweise

- **Medienstudio K2 (unser Standard):** docs/MEDIENSTUDIO-K2.md  
- **Presse-Ablauf:** docs/PRESSEARBEIT-STANDARD.md  
- **Feature-Ideen & Zielgruppe:** docs/FEATURES-ABHEBUNG-ZIELGRUPPE.md  
- **Roadmap (Einbau):** docs/SPORTWAGEN-ROADMAP.md → Phase 10 / Produkt-Features  
- **Produkt-Vision:** docs/PRODUKT-VISION.md  

---

## 8. Kurzfassung

**Medienstudio für User = Medienkit (aus Stammdaten) + Presse-Vorlage (Variablen) + optional Pressekontakte + optional „Presseinfo verschickt“ an Events. Ein Bereich unter Marketing, eine Implementierung für K2/ök2/VK2. Großes Plus für Künstler:innen und Kunstvereine – professionell von Beginn an.**
