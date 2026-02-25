# Klare Trennung: K2 | VK2 | ök2

**Stand:** 25.02.26 · **Verbindlich** für alle Änderungen am Admin, an Dokumenten und an der Galerie.

---

## 1. Drei Kontexte – nie vermischen

| Kontext | Wer | Einstieg | Admin-URL | Speicher |
|--------|-----|----------|-----------|----------|
| **K2** | Martina & Georg (echte Galerie) | Galerie → Admin | `/admin` | `k2-artworks`, `k2-events`, `k2-documents`, `k2-stammdaten-*`, `k2-page-texts`, `k2-design-settings` |
| **VK2** | Verein, Vorstand, Mitglieder | VK2-Galerie / VK2-Login → Admin | `/admin?context=vk2` | `k2-vk2-stammdaten`, `k2-vk2-events`, `k2-vk2-documents`, `k2-vk2-page-texts`, `k2-vk2-design-settings` |
| **ök2** | Öffentliche Demo (Muster) | Willkommensseite „Galerie öffentlich“ | `/admin?context=oeffentlich` | `k2-oeffentlich-*` |

- **Eine Aktion = ein Kontext.** Beim Öffnen von Dokumenten, „Zurück“, Links und Listen gilt immer der **aktuelle** Kontext (aus URL + sessionStorage). Es gibt keinen „gemischten“ Modus.
- **Daten:** Im VK2-Admin werden **nur** VK2-Keys gelesen/geschrieben. Im K2-Admin nur K2-Keys. Im ök2-Admin nur ök2-Keys. Keine Ausnahme.

---

## 2. Sichtbare Trennung im Admin

- **Header:** Der Nutzer sieht sofort, in welchem Kontext er ist:
  - **K2:** Logo/Brand + Badge **„K2 ADMIN“**
  - **VK2:** Logo „VK2 Vereinsplattform“ + Badge **„VK2 ADMIN“**
  - **ök2:** „ök2“ + „Muster-Galerie“ (bereits umgesetzt)
- **Links und Aktionen:** Im VK2-Admin führen „Zur Galerie“, „Zurück“, Dokumente-Öffnen und „Zurück“ aus Dokumenten **immer** in den VK2-Kontext (inkl. `?context=vk2`). Kein Link führt unbeabsichtigt in die K2-Galerie oder den K2-Admin.
- **Tabs/Karten:** Im VK2 werden nur Bereiche angezeigt, die für den Verein gelten (Events & Werbung, Design, Einstellungen, Mitglieder, Assistent). Kassa, Werkkatalog, Zertifikat, Newsletter-Tab, Pressemappe = nur K2/ök2, nicht VK2.

---

## 3. Session und URL

- Beim **Laden des Admins** wird der Kontext aus der **URL** gelesen (`?context=vk2` oder `?context=oeffentlich`) und in `sessionStorage['k2-admin-context']` geschrieben. So bleibt der Kontext auch nach Navigation (z. B. „Zurück“ aus einem Dokument) eindeutig.
- Wer den Admin **ohne** `?context=` aufruft (z. B. `/admin`), arbeitet im **K2**-Kontext. `k2-admin-context` wird auf `'k2'` gesetzt bzw. bleibt leer für K2.
- Nach Aufruf von `/admin?context=vk2` darf keine Aktion den Kontext still auf K2 zurücksetzen. „Zurück“ aus generierten Dokumenten nutzt die **zum Erzeugungszeitpunkt** injizierte Admin-URL (mit `?context=vk2`).

---

## 4. Werbematerial / Flyer / Dokumente

- **VK2:** Alle erzeugten Dokumente (Newsletter, Flyer, Presse, Social, QR-Plakat) nutzen **Vereinsdaten** (Verein, Mitglieder) und das **helle VK2-Design**. „Zurück“ führt in den VK2-Admin. Gespeichert wird in `k2-vk2-documents`.
- **K2:** Dokumente nutzen K2-Stammdaten und K2-Design. Gespeichert in `k2-documents`.
- **Listen:** Im VK2-Admin werden nur Dokumente aus `k2-vk2-documents` und Events aus `k2-vk2-events` angezeigt. Keine K2-Daten in der Liste.

---

## 5. Checkliste bei Änderungen

- [ ] Wird der **Kontext** (K2 / VK2 / ök2) überall berücksichtigt, wo Daten geladen oder gespeichert werden?
- [ ] Zeigt der **Header** im Admin klar „VK2 ADMIN“ bzw. „K2 ADMIN“?
- [ ] Setzen wir den Kontext beim **Laden** des Admins aus der URL in den sessionStorage?
- [ ] Führen **alle Links** (Galerie, Zurück, Dokumente) im VK2-Admin in den VK2-Kontext (inkl. `?context=vk2`)?
- [ ] Nutzen **generierte Dokumente** im VK2-Kontext nur Vereinsdaten und VK2-Design?

---

## Kurzfassung

**Klare Trennung = eine sichtbare Kontext-Marke + eine verbindliche Daten- und Navigationsregel pro Kontext. Kein Vermischen, kein stilles Zurückfallen auf K2.**

**Bei jeder Änderung am Admin, an Werbematerial oder Kontext:** Diese Doku und die Checkliste oben prüfen.

Siehe auch: `docs/K2-OEK2-DATENTRENNUNG.md`, `.cursor/rules/k2-oek2-trennung.mdc`, `.cursor/rules/kontext-vergiftung-vermeiden.mdc`.
