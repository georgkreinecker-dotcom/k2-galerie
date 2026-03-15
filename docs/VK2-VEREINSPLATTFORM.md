# VK2 – Vereinsplattform (dritte Lizenzvariante)

## Idee (Kern) – Schwerpunkt: gemeinsame Interessen

**VK2** = Plattform für **alle Vereine** (Kunstvereine = Einstieg). Dritte Form der Lizenz neben Einzelkünstler und (später) größere Galerie.

- **Schwerpunkt:** Eine **Mitgliederliste** (alle im Verein), Vereinsauftritt, Events. Künstler-Präsentation **optional** pro Mitglied („In Galerie anzeigen“). Die meisten Vereine = gemeinsame Interessen, nicht nur Künstler:innen.
- Der **Verein** erwirbt die **Pro-Version**; **ab 10 eingetragenen Mitgliedern** (in der Liste) kostenfrei.
- **Mitglieder** werden vom Verein eingetragen. Optional: „In Galerie anzeigen“ = Profil/Karte; Lizenzmitglied mit Galerie-Profil optional 50 % Lizenz.
- Detailliert: **docs/VK2-SCHWERPUNKT-VEREIN-GEMEINSAME-INTERESSEN.md**.

---

## Was wir technisch anpassen

- **Grundstruktur und Design** bleiben gleich (eine Codebasis, Konfiguration pro Mandant).
- **Kundendatenbank** → dient als **Mitgliederverzeichnis** (Mitglieder statt „Kunden“).
- **Werke** im VK2 = Mitglieder mit „In Galerie anzeigen“ (technisch: Künstlerprofile). Optional.
- Labels einheitlich (Sportwagenmodus): „Mitglieder“, „Mitglieder in der Galerie“ (bzw. Galerie-Auftritt), „Vereinsplattform“.

---

## Lizenzlogik (für spätere Umsetzung)

| Rolle            | Bedingung                    | Lizenz / Nutzen                    |
|------------------|-----------------------------|------------------------------------|
| **Verein**       | Pro-Version; ≥ 10 eingetragene Mitglieder | Plattformnutzung dann **kostenfrei** |
| **Mitglied**     | Vom Verein eingetragen | In der Liste; optional „In Galerie anzeigen“, optional Login |
| **Lizenzmitglied** (mit Galerie-Profil) | optional 50 % Lizenz | Eigene Präsentation in der Galerie |

---

## Smart Panel – alles vom Panel aus organisierbar

**VK2 soll vom Smart Panel aus gut bedienbar sein.** Keine versteckten Menüs; alle wichtigen Bereiche mit einem Klick erreichbar.

- **Einstieg:** „VK2 Vereinsplattform“ (eigener Block im Smart Panel, wie K2 Galerie).
- **Schnellzugriffe im VK2-Bereich (einheitliche Begriffe):**
  - **Mitglieder** → Mitgliederverzeichnis (eine Liste für alle).
  - **Mitglieder in der Galerie** (bzw. Galerie-Auftritt) → wer „In Galerie anzeigen“ hat (technisch: Werke/Künstlerprofile).
  - **Control Studio** → Steuerung, Einstellungen, ggf. Plan.
- Später optional: eigene Routen unter `/projects/vk2/…` (Mitglieder, Künstler, Einstellungen), dann verweisen die Panel-Links dorthin.

Siehe Implementierung: `src/components/SmartPanel.tsx` – VK2-Block mit diesen Schnellzugriffen.

---

## Umgesetzt (Stand 18.02.26)

- **Tenant-Config:** `tenantConfig.ts` – Typ `vk2`, `TENANT_CONFIGS.vk2` (Vereinsplattform, Künstler:in), `VK2_KUNSTBEREICHE` (Kategorien = Kunstbereiche: Malerei, Keramik, Grafik, Skulptur, Fotografie, Textil, Sonstiges).
- **Routen:** `PROJECT_ROUTES['vk2']` – `/projects/vk2/galerie`, `/projects/vk2/galerie-vorschau`, `/projects/vk2/kunden`; kein eigener Shop (Shop-Link zeigt auf Galerie).
- **Admin mit Kontext VK2:** `/admin?context=vk2` – eigene Storage-Keys `k2-vk2-artworks`, `k2-vk2-events`, `k2-vk2-documents`; **Kasse-Button ausgeblendet**; Link „Kunden“ → „Mitglieder“, Ziel VK2-Kunden; „Zur Galerie“ führt zu VK2-Galerie.
- **DevView:** Bei `?context=vk2` wird der **Shop-Tab ausgeblendet** (APf ohne Kasse).
- **Smart Panel:** VK2-Block – „Mitglieder“ → `/projects/vk2/kunden`, „Mitglieder in der Galerie“ → `/projects/vk2/galerie`, „Admin“ → `/admin?context=vk2`.
- **App-Routen:** `/projects/vk2/galerie`, `/projects/vk2/galerie-vorschau`, `/projects/vk2/kunden` rendern dieselben Seiten (GaleriePage, GalerieVorschauPage, KundenPage); Datenquelle für VK2 (k2-vk2-* beim Admin) ist getrennt.

## Nächste Schritte (VK2 voll nutzbar)

1. **GaleriePage / GalerieVorschauPage unter VK2:** Stammdaten und Werke aus `k2-vk2-*`; Labels „Mitglieder in der Galerie“ (bzw. Galerie-Auftritt), Kategorien aus `VK2_KUNSTBEREICHE`.
2. **KundenPage unter VK2:** Mitgliederverzeichnis (eine Liste), Label „Mitglieder“.
3. **Stammdaten Verein:** Verein (Name, Kontakt, Adresse), optional „Kunstbereiche“; Rollen (Vorstand, Mitglied).
4. **Galerie-Auftritt:** Wer „In Galerie anzeigen“ hat = Profil/Karte in der Vereinsgalerie (technisch Werke/Künstlerprofile); Mitgliederverzeichnis = Basis.
5. **Lizenz:** Verein kostenfrei bei ≥ 10 eingetragenen Mitgliedern; Lizenzmitglied (mit Galerie-Profil) optional 50 %.

---

## Vereinskassa und Buchhaltung (vorgesehen)

**Der Verein soll seine Vereinskassa und Buchhaltung in derselben App führen können.** Vorgesehen sind:

- **Vereinskassa:** Verkäufe erfassen (z. B. bei Ausstellungen, Vereinsverkauf), Kassenbon/Rechnung drucken, Zahlungsarten Bar/Karte/Rechnung – wie bei K2/ök2, aber mit eigenem Speicher (`k2-vk2-kassabuch`, `k2-vk2-sold-artworks` o. Ä.) und Vereins-Stammdaten auf Belegen.
- **Vereinsbuchhaltung:** Kassabuch (Eingänge/Ausgänge), Kassabuch-CSV, Verkäufe-CSV, Belege als PDF pro Zeitraum – Vorarbeit für den Steuerberater des Vereins; 7 Jahre Aufbewahrung. Optional ab Pro+ bzw. Pro++ (analog zu K2/ök2).

**Stand Umsetzung:** Im Handbuch und in der Kommunikation ist Vereinskassa/Buchhaltung bereits als Nutzen beschrieben. Technisch ist VK2-Kassa derzeit noch nicht freigeschaltet (Kasse-Button im VK2-Admin ausgeblendet; Kassabuch-Storage nur K2/ök2). Die Erweiterung (eigene Keys, Kassa-Tab im VK2-Admin, Buchhaltung pro Verein) ist vorgesehen und als nächster Schritt einplanbar.

---

## Kurzfassung

- **VK2** = Vereinsplattform für **alle Vereine** (Kunstvereine = Einstieg). Schwerpunkt: **gemeinsame Interessen**, eine **Mitgliederliste**, Vereinsauftritt, Events. Künstler-Präsentation **optional** („In Galerie anzeigen“).
- Verein nutzt Pro; **ab 10 eingetragenen Mitgliedern** kostenfrei. Mitglieder vom Verein eingetragen; optional Galerie-Profil, optional Lizenzmitglied (50 %).
- **Vereinskassa und Buchhaltung:** Vorgesehen – technische Freischaltung folgt.
- **Begriffe (Sportwagenmodus):** Überall dieselben – „Mitglieder“, „Mitglieder in der Galerie“ (bzw. Galerie-Auftritt). Quelle: diese Doku + VK2-SCHWERPUNKT-VEREIN-GEMEINSAME-INTERESSEN.md.
