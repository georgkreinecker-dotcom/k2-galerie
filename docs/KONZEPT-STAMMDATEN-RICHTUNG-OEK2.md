# Konzept: Stammdaten „Meine Richtung“ (ök2 / Lizenznehmer)

**Stand:** 19.03.26 – Georg: User hat eine Idee/Vorstellung im Kopf, wenn er auf ök2 kommt; in den Stammdaten seine Richtung per Ankreuzen festlegen → bekommt die passenden Einstellungen in Werken und für alle weiteren Schritte. Auswahl erweitern: Marktanalyse nutzen, Kunst + 5 weitere.

---

## 1. Idee (Kern)

- **Beim Einstieg** (ök2-Demo oder nach Lizenzerwerb) hat der User eine **Vorstellung**: „Ich bin Künstler:in“, „Ich zeige Handwerk“, „Ich habe ein Design-Label“ …
- **Statt** ihn erst in Werke/Kategorien/Typ zu schicken: **zuerst in den Stammdaten** eine **Richtung** wählen (Mehrfachauswahl, Ankreuzen).
- Diese Richtung wird **eine Quelle** für:
  - **Werke:** Standard-Typ (Kunstwerk / Produkt / Idee), angezeigte Kategorien, ggf. Begriffe („Werk“ vs. „Produkt“ vs. „Stück“).
  - **Alle weiteren Schritte:** Willkommenstext, Presse-Vorlagen, Events, Flyer – alles kann darauf abgestimmt werden (konfigurierbar, eine Quelle).

**Vorteil:** User legt einmal fest, was er will – der Rest (Werke, Design, Presse) kommt schon „richtig voreingestellt“. Wir schöpfen das Potenzial der Typ-/Markt-Geschichte aus.

---

## 2. „Kunst + 5 weitere“ aus der Marktanalyse

Quelle: **docs/MARKTANALYSE-K2-GALERIE.md**, **docs/MAERKTE-OHNE-KUNST-CHANCEN.md**.

| # | Richtung (ID) | Label (Anzeige) | Kurz was es ist |
|---|----------------|------------------|------------------|
| 1 | **kunst** | Kunst & Galerie | Künstler:innen, Ateliers, kleine Galerien – Werke, Ausstellungen, Verkauf. *(Einstieg, heute schon Kern.)* |
| 2 | **handwerk** | Handwerk & Manufaktur | Tischler:innen, Schmuck, Leder, Keramik (Gebrauch), Kleinserien – Katalog, Kassa, Events. |
| 3 | **design** | Design & Möbel | Möbel, Leuchten, Accessoires – Showroom, Kassa, Einladungen. |
| 4 | **mode** | Mode & Kleinserien | Kollektionen, Kleinserien, Märkte, Pop-up – Katalog, Etiketten, Events. |
| 5 | **food** | Food & Genuss | Direktvermarkter:innen, Manufakturen, limitierte Produkte – Katalog, Verkauf, Events, Etiketten. |
| 6 | **dienstleister** | Dienstleister & Portfolio | Referenzen, Projekte, Workshops – Portfolio, Presse, Events, optional Kassa. |

**Vereine** (VK2) bleiben eigener Einstieg (Vereinsplattform); hier geht es um die **Galerie-Richtung** (ök2 / Lizenznehmer).

---

## 3. Wo speichern (Stammdaten)

- **Eine Quelle:** Stammdaten Galerie (bzw. „Meine Daten“ / Einstellungen).
- **Neues Feld** (konfigurierbar, erweiterbar):
  - z. B. `focusDirections: string[]` oder `richtungen: ('kunst'|'handwerk'|'design'|'mode'|'food'|'dienstleister')[]`
  - Speicher: `k2-stammdaten-galerie` (K2), `k2-oeffentlich-stammdaten-galerie` (ök2), bei Lizenznehmer analog.
- **UI:** Im Admin unter Stammdaten (Galerie / Meine Daten) ein Block **„Meine Richtung“** / **„Wofür nutzt du deine Galerie?“** – Mehrfachauswahl (Checkboxen), mindestens eine Auswahl.

---

## 4. Wie die Richtung wirkt (Folgeschritte)

| Bereich | Wie Richtung genutzt wird (Vorschlag) |
|--------|----------------------------------------|
| **Werke – Typ** | Wenn nur „kunst“ → Standard Typ „Kunstwerk“. Wenn „handwerk“/„design“/„mode“/„food“ dabei → Standard Typ „Produkt“ anbieten oder vorauswählen. Wenn „dienstleister“ → Typ „Idee“ oder „Referenz“ nahelegen. |
| **Werke – Kategorien** | Kategorien-Liste pro Richtung konfigurierbar (z. B. Kunst: Malerei/Keramik/…; Handwerk: Möbel/Schmuck/Textil/…; Design: Möbel/Leuchten/Accessoires). **Eine** Konfiguration (tenantConfig oder Mandant), keine zweite Code-Schiene. |
| **Willkommenstext / Galerie gestalten** | Platzhalter oder Vorschläge je Richtung (z. B. „Willkommen in meinem Atelier“ vs. „Willkommen in meiner Werkstatt“ vs. „Willkommen in meinem Showroom“). |
| **Presse / Flyer / Events** | Vorlagen und Anrede können je Richtung angepasst werden („Vernissage“ vs. „Tag der offenen Tür“ vs. „Workshop“). |
| **Sprache/Begriffe** | Optional: „Werk“ vs. „Produkt“ vs. „Stück“ vs. „Referenz“ je nach Richtung – eine Konfiguration, eine Quelle. |

Alles **konfigurierbar**, kein Sonderbau pro Richtung – **ein** Modell, Richtung als Filter/Default.

---

## 5. Meinung (Joe)

- **Passt sehr gut** zur Vision (Kunst = Träger, ganzer Markt hat Platz) und zur Marktanalyse. User bringt seine Vorstellung mit – wir nehmen sie **einmal** auf und nutzen sie **überall**.
- **Kunst + 5** aus MAERKTE-OHNE-KUNST und MARKTANALYSE ist stimmig; die sechs Richtungen decken das größte Potenzial ab, ohne zu zersplittern.
- **Stammdaten zuerst** ist richtig: Bevor jemand Werke anlegt, weiß die App „wofür“ – dann sind Defaults (Typ, Kategorien, Texte) von Anfang an passend.
- **Umsetzung:** Ein Standard pro Problem (eine Konfiguration für Richtungen, eine für „Richtung → Default-Typ/Kategorien“). Erst Konfiguration und Stammdaten-Feld + UI, dann Werke/Design/Presse schrittweise anbinden.

---

## 6. Nächste Schritte (nach deiner Entscheidung)

1. **Richtungen festlegen:** Die 6 (Kunst + 5) so übernehmen oder 1–2 tauschen (z. B. „Messen & Märkte“ statt „Food“)?
2. **Stammdaten erweitern:** Feld `focusDirections` / `richtungen` in Stammdaten-Galerie (Typ + Keys); Doku DATENFLUSS-GALERIE-STRUKTUR.md ergänzen.
3. **UI Stammdaten:** Block „Meine Richtung“ mit Checkboxen (ök2 zuerst, dann K2/Lizenznehmer).
4. **Verhalten Werke:** Beim ersten Öffnen von „Neues Werk“ Default-Typ und -Kategorien aus gewählter Richtung ableiten (eine Funktion, eine Quelle).
5. **Weitere Schritte:** Willkommenstext, Presse, Events schrittweise an Richtung anbinden.

---

**Verknüpfung:** docs/MARKTANALYSE-K2-GALERIE.md, docs/MAERKTE-OHNE-KUNST-CHANCEN.md, docs/VISION-WERKE-IDEEN-PRODUKTE.md, docs/DATENFLUSS-GALERIE-STRUKTUR.md, tenantConfig (Kategorien pro Typ).
