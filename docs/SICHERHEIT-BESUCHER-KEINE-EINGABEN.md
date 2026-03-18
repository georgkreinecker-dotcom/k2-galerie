# Sicherheit: Eiserne Sperre – Besucher keine Eingaben (gesamte App)

## Grundsatz

**Besucher dürfen auf der gesamten App keine Eingaben vornehmen, die gemeinsame Daten (Galerie, Design, Werke, Events, Dokumente, Stammdaten, Vita, …) verändern.**  
Einzige Ausnahme: Kunden-Eingaben im Shop (Warenkorb, Bestellung).

- **Besucher** = Nutzer auf einer öffentlich erreichbaren Seite **ohne** Zugang vom Admin, von der APf oder (bei VK2) ohne Login.
- **Regel:** .cursor/rules/eiserne-regel-besucher-keine-eingaben.mdc  
- **Hilfsfunktion:** `src/utils/visitorContext.ts` → `mayEditContent(location.state)` / `isVisitorContext(location.state)`.

---

## 1. Besucher-erreichbare Bereiche und Status

| Bereich | Route / Kontext | Eingaben erlaubt? | Absicherung |
|--------|------------------|-------------------|-------------|
| Galerie (ök2/VK2) | galerie-oeffentlich, vk2 Galerie | Nein | Keine Bearbeitungs-UI auf GaleriePage; Admin-Button nur bei showAdminEntryOnGalerie / von APf. |
| Galerie Vorschau (ök2/VK2) | galerie-oeffentlich-vorschau, VK2 Vorschau | Nein | Werke/Design speichern nur bei fromAdminTab / Admin. |
| **Vita** | /projects/k2-galerie/vita/:id | Nein für Besucher | Bearbeiten/Speichern nur wenn `mayEditContent(location.state)`; sonst nur Anzeige. |
| Entdecken | EntdeckenPage | Optional (nur lokale Notizen) | Nach Projekt-Entscheidung: entweder nur lesen oder lokale Notizen (kein Schreiben in Galerie-Keys). |
| Shop | ShopPage | Ja (Ausnahme) | Warenkorb, Bestellung, Kontakt – Kundenrolle. |
| AGB, Willkommen, Lizenz | Öffentliche Seiten | Nein | Nur Lesen. |
| Admin | /admin | Nein (kein Besucher) | Nur mit Admin-/APf-Zugang. |
| APf / VK2-Login | /projects/…, VK2 Login | Nein (kein Besucher) | Berechtigte Nutzer. |

---

## 2. Prüfliste für neue oder geänderte Seiten

- [ ] Ist die Seite für Besucher erreichbar (URL ohne Admin/APf)?
- [ ] Gibt es dort Eingaben, die Galerie-/Stammdaten-/Design-/Werke-/Events-/Dokumente-Daten ändern?
- [ ] Wenn ja: Bearbeitungs-UI nur anzeigen, wenn `mayEditContent(location.state)` true; sonst read-only.
- [ ] Shop: Kunden-Eingaben (Warenkorb, Bestellung) sind die einzige Ausnahme.

---

## 3. Technische Umsetzung

- **visitorContext.ts:**  
  `isVisitorContext(state)` = true, wenn kein Admin/APf/VK2-Signal (sessionStorage, location.state, Referrer).  
  `mayEditContent(state)` = !isVisitorContext(state).

- **Signale „darf bearbeiten“:**  
  `location.state.fromAdmin`, `fromApf`, `fromAdminTab`;  
  `sessionStorage`: `k2-admin-context`, `k2-oek2-from-apf`, `k2-vk2-mitglied-eingeloggt`, `k2-galerie-from-admin`;  
  Referrer von /admin, mission-control, mein-bereich, /projects/k2-galerie (APf).

- **Seiten mit Bearbeitung:**  
  Aufruf `mayEditContent(location.state)`; bei false nur Anzeige (kein Textarea, kein Speichern-Button).

---

## 4. Verknüpfung

- **Galerie gestalten (Detail):** docs/SICHERHEIT-GALERIE-GESTALTEN-OEK2-VK2.md  
- **Eiserne Regel:** .cursor/rules/eiserne-regel-besucher-keine-eingaben.mdc  
- **Code:** src/utils/visitorContext.ts, VitaPage (Beispiel), GaleriePage/GalerieVorschauPage (Admin-Button / fromAdminTab).
