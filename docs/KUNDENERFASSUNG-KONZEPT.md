# Kundenerfassung – Konzept (K2, später ök2)

**Stand:** 14.02.2026

## Ziele

- **K2:** Galeriekunden erfassen – für Verkauf, Einladungen, Nachfass, Ausstellungsbetrieb.
- **Später ök2:** Pro Mandant (Künstler:in/Galerie) eine eigene Kundenliste; gleiche Funktionen.
- **Smarte, unkomplizierte Lösung**, die im **Ausstellungsbetrieb** nutzbar ist (schnell erfassen, zuordnen, wiederfinden).

---

## Datenmodell (einfach)

Ein **Kunde** = ein Kontakt:

| Feld      | Pflicht | Beschreibung |
|-----------|--------|--------------|
| id        | ja     | Eindeutige ID (z. B. Zeitstempel-basiert) |
| name      | ja     | Name (Person oder Firma) |
| email     | nein   | E-Mail |
| phone     | nein   | Telefon |
| notes     | nein   | Notizen (z. B. „Vernissage 3/25“, „Interesse an Keramik“) |
| createdAt | ja     | Erstellungsdatum (ISO) |
| updatedAt | ja     | Letzte Änderung (ISO) |

- **Speicher K2:** `k2-customers` (localStorage, Array).
- **Speicher ök2 (später):** `k2-oeffentlich-customers` oder pro Mandant; gleiche Struktur.

**Verkauf verknüpfen:** In `k2-sold-artworks` und in Bestellungen (`k2-orders`) optional `customerId` speichern. So siehst du im Archiv „verkauft an: Name“.

---

## Wo die Kundenerfassung sichtbar ist

1. **Control Studio → Tab „Kunden“**  
   - Liste aller Kunden, Suche, Sortierung.  
   - Neu anlegen, bearbeiten, löschen.  
   - Für den Ausstellungsbetrieb: Schnell „Neuer Kunde“ (Name + optional Telefon/Email), Notiz z. B. „Vernissage 3/25“.

2. **Shop / Kasse**  
   - Beim Abschluss eines Verkaufs: optional **„Kunde zuordnen“** (Auswahl aus Liste oder „Neuer Kunde“).  
   - Gespeichert wird die `customerId` beim Verkaufseintrag und in der Bestellung – im Archiv wird der Kundenname angezeigt.

3. **Archiv (Verkaufshistorie)**  
   - Bei jedem verkauften Werk: Anzeige „Verkauft an: [Name]“, wenn ein Kunde zugeordnet ist.

4. **Ausstellungsbetrieb**  
   - Besucher/Vernissage-Gäste: Einfach als „Kunde“ anlegen (Name, ggf. Telefon/E-Mail), in Notizen z. B. „Vernissage 3/25“ oder „Eröffnung XY“.  
   - Später erweiterbar: z. B. Zuordnung zu einem konkreten Event („Teilnehmer Vernissage XY“).

---

## Prinzip: unkompliziert

- **Eine** Kundenliste pro Galerie (K2), später pro Mandant (ök2). Kein kompliziertes CRM.
- **Schnell erfassen:** Wenige Pflichtfelder (Name reicht), Rest optional.
- **Schnell zuordnen:** Beim Verkauf Kunde wählen oder neu anlegen; beim Event Notiz nutzen.
- **Wiederfinden:** Suche nach Name, E-Mail, Telefon, Notizen.
- **Backup:** Kundenliste wird im Vollbackup mitgespeichert und bei „Aus Backup-Datei wiederherstellen“ mit übernommen.

---

## Später (ök2 / Multi-Mandant)

- Jeder Mandant (Künstler:in / Galerie) hat eigene Keys, z. B. `k2-oeffentlich-customers` für die Demo, später pro Tenant-ID.
- Gleiche UI-Logik, nur andere Storage-Keys je nach Kontext (wie bei Werken/Events).
- Keine Vermischung: K2-Kunden nur in K2, ök2-Kunden nur in ök2.
