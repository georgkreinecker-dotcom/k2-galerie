# Admin-Struktur im Hub-Design – Idee / Prüfauftrag

**Stand:** 26.02.26  
**Status:** Phase 1 umgesetzt (Admin-Startansicht = Hub-Layout). Optional: Phase 2 (gemeinsame HubLayout-Komponente).

---

## Ausgangslage

Der **Entdecken-Hub** („Das ist deine Galerie“, GALERIE-GUIDE in der Mitte, Kacheln links/rechts) wird als **genial** und **zielsicher** erlebt:
- Eine klare Übersicht: links/rechts Bereiche, Mitte = Fokus mit Beschreibung + **ein** Haupt-Button
- Optisch überzeugend: dunkles Theme, transluzente Karten, Orange-Akzente, runde Ecken
- One-Click-Regel: pro Bereich eine Hauptaktion („Meine Werke öffnen →“)

Der **Admin** hat aktuell:
- „Was möchtest du heute tun?“ + **Karten-Grid** (alle Bereiche gleichzeitig)
- Danach Tabs (Werke, Eventplan, Design, Katalog, Einstellungen, …) mit Inhalt

**Frage:** Sollte die Admin-Struktur dasselbe **Hub-Layout** nutzen – zielsicherer und optisch an die bewährte Entdecken-Erfahrung angepasst?

---

## Vorschlag: Admin im Hub-Layout

- **Links:** Vertikale Kacheln wie im Hub (Meine Werke, Events & Ausstellungen, Aussehen & Design, ggf. Werkkatalog, Kassa, Einstellungen). Aktiver Bereich hervorgehoben (Orange/Gradient).
- **Mitte:** Entweder
  - **Variante A:** Fokus-Karte wie im Hub – aktueller Bereich mit Kurzbeschreibung + **ein** Haupt-Button („Meine Werke öffnen“ = Inhalt darunter einblenden / „Werkkatalog“ = Tab wechseln). Oder
  - **Variante B:** Der **Inhalt** des gewählten Bereichs (Werke-Liste, Eventplan, Design, …) steht in der Mitte; die linke Spalte bleibt die Navigation.
- **Rechts:** Schnellzugriffe (Galerie ansehen, Kasse öffnen, Einstellungen, Schritt-für-Schritt-Hilfe).

**Optik:** Entweder das dunkle Hub-Thema (konsistent mit Entdecken) oder das bestehende helle Admin-Thema (WERBEUNTERLAGEN_STIL) beibehalten, aber **Struktur** (3 Spalten, Fokus in der Mitte, eine Hauptaktion) übernehmen.

**Vorteile:**
- Nutzer, die vom Entdecken-Hub in den Admin kommen, sehen **dieselbe** Logik wieder – keine neue „Was möchtest du tun?“-Welt.
- Zielsicherer: ein Bereich = ein Fokus = eine klare Aktion.
- Optisch sehr überzeugend und wiedererkennbar.

---

## Wo umsetzen (technisch)

- **Datei:** `components/ScreenshotExportAdmin.tsx`
- **Stelle:** Der Block mit „Was möchtest du heute tun?“ und dem Karten-Grid (ca. Zeile 9220–9350) sowie die Tab-Navigation. Beim Tab **werke** (Startansicht) könnte statt Grid ein **Hub-Layout** gerendert werden: linke Spalte = Bereichs-Kacheln, Mitte = Fokus-Karte oder Werke-Inhalt, rechte Spalte = Schnellzugriffe.
- **Wiederverwendung:** Die Hub-Layout-Logik aus `src/pages/EntdeckenPage.tsx` (HubArbeitsbereich: links/rechts/Mitte, Kacheln, eine CTA) könnte als Vorlage dienen oder in eine gemeinsame Komponente (z. B. `HubLayout`) ausgelagert werden, die sowohl Entdecken als auch Admin nutzt.

---

## Nächste Schritte (wenn gewünscht)

1. **Entscheidung:** Soll das Admin-Einstiegslayout (Tab werke) auf Hub-Struktur umgestellt werden? (Ja/Nein/Später)
2. **Farbthema:** Admin weiter hell (wie jetzt) oder im ök2/VK2-Kontext optional dunkles Hub-Thema?
3. **Phase 1:** Nur die **Startansicht** („Was möchtest du tun?“) durch ein 3-Spalten-Hub ersetzen; Klick auf einen Bereich wechselt Tab und zeigt Inhalt wie bisher unterhalb oder in der Mitte.
4. **Phase 2 (optional):** Gemeinsame `HubLayout`-Komponente für Entdecken + Admin, um Doppelcode zu vermeiden und Optik zu vereinheitlichen.

---

## Kurzfassung

**Idee:** Admin-Struktur am bewährten Hub-Design ausrichten – 3 Spalten, Fokus in der Mitte, eine Hauptaktion pro Bereich. Zielsicherer und optisch überzeugend.  
**Umsetzung:** Offen; Prüfauftrag in diesem Doc festgehalten. Bei Go: ScreenshotExportAdmin Startansicht auf Hub-Layout umbauen, optional gemeinsame HubLayout-Komponente.
