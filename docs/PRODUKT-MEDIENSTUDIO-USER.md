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

## 4. Technik & Regeln

- **Keine doppelten Eingaben:** Medienkit-Text kommt aus Stammdaten; wo Stammdaten fehlen, Fallback/Platzhalter und Hinweis „In Stammdaten ergänzen“.
- **Kontext getrennt:** K2 / ök2 / VK2 je eigene Keys und Datenquelle (dokumente-kontext-eine-quelle, k2-oek2-trennung).
- **Skalierbar:** Eine UI, eine Logik – Mandant steuert nur die Datenquelle.
- **One-Click wo möglich:** Ein Klick „Kopieren“ = Medienkit in Zwischenablage; ein Klick „Text anzeigen“ = Presse-Vorlage mit ausgefüllten Variablen.

---

## 5. Verweise

- **Medienstudio K2 (unser Standard):** docs/MEDIENSTUDIO-K2.md  
- **Presse-Ablauf:** docs/PRESSEARBEIT-STANDARD.md  
- **Feature-Ideen & Zielgruppe:** docs/FEATURES-ABHEBUNG-ZIELGRUPPE.md  
- **Roadmap (Einbau):** docs/SPORTWAGEN-ROADMAP.md → Phase 10 / Produkt-Features  
- **Produkt-Vision:** docs/PRODUKT-VISION.md  

---

## 6. Kurzfassung

**Medienstudio für User = Medienkit (aus Stammdaten) + Presse-Vorlage (Variablen) + optional Pressekontakte + optional „Presseinfo verschickt“ an Events. Ein Bereich unter Marketing, eine Implementierung für K2/ök2/VK2. Großes Plus für Künstler:innen und Kunstvereine – professionell von Beginn an.**
