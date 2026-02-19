# VK2 – Künstlervereinsplattform (dritte Lizenzvariante)

## Idee (Kern)

**VK2** = Plattform für **Künstlervereine**. Dritte Form der Lizenz neben Einzelkünstler und (später) größere Galerie.

- Viele Künstler:innen sind in **Vereinen** organisiert.
- Der **Verein** nutzt die Plattform **kostenlos**, wenn er **mindestens 10 zahlende Lizenzmitglieder** hat (nicht die Anzahl der Künstler:innen in der Galerie).
- **Lizenzmitglieder** zahlen **50 % der normalen Lizenzgebühr**, haben keinen eigenen Bonusanspruch, aber die Möglichkeit zu updaten. Ob ein Künstler eine Lizenznummer hat (weil er/sie auch ök2 nutzt), ist für die Vereinskostenfreiheit unerheblich – der Verein muss nur die Mindestzahl zahlender Lizenzmitglieder erreichen.

---

## Was wir technisch anpassen

- **Grundstruktur und Design** bleiben gleich (eine Codebasis, Konfiguration pro Mandant).
- **Kundendatenbank** → dient als **Mitgliederverzeichnis** (Mitglieder statt „Kunden“).
- **Werke** → sind die **Künstler:innen** (ein „Werk“ = ein Künstler/Profil im Verein).
- **Neue Mandanten-Variante** z. B. `vk2` oder `verein` in Config; Texte/Labels: „Mitglieder“, „Künstler“, „Vereinsplattform“.

---

## Lizenzlogik (für spätere Umsetzung)

| Rolle            | Bedingung                    | Lizenz / Nutzen                    |
|------------------|-----------------------------|------------------------------------|
| **Verein**       | ≥ 10 zahlende Lizenzmitglieder | Plattformnutzung **kostenlos**     |
| **Lizenzmitglied** | zahlt 50 % Lizenz           | Kein eigener Bonus; Update möglich |

---

## Smart Panel – alles vom Panel aus organisierbar

**VK2 soll vom Smart Panel aus gut bedienbar sein.** Keine versteckten Menüs; alle wichtigen Bereiche mit einem Klick erreichbar.

- **Einstieg:** „VK2 Vereinsplattform“ (eigener Block im Smart Panel, wie K2 Galerie).
- **Schnellzugriffe im VK2-Bereich:**
  - **Mitglieder** → Mitgliederverzeichnis (technisch: Kunden-Datenbank).
  - **Künstler (Galerie)** → Übersicht der Künstler:innen (technisch: Werke).
  - **Control Studio** → Steuerung, Einstellungen, ggf. Plan.
- Später optional: eigene Routen unter `/projects/vk2/…` (Mitglieder, Künstler, Einstellungen), dann verweisen die Panel-Links dorthin.

Siehe Implementierung: `src/components/SmartPanel.tsx` – VK2-Block mit diesen Schnellzugriffen.

---

## Umgesetzt (Stand 18.02.26)

- **Tenant-Config:** `tenantConfig.ts` – Typ `vk2`, `TENANT_CONFIGS.vk2` (Vereinsplattform, Künstler:in), `VK2_KUNSTBEREICHE` (Kategorien = Kunstbereiche: Malerei, Keramik, Grafik, Skulptur, Fotografie, Textil, Sonstiges).
- **Routen:** `PROJECT_ROUTES['vk2']` – `/projects/vk2/galerie`, `/projects/vk2/galerie-vorschau`, `/projects/vk2/kunden`; kein eigener Shop (Shop-Link zeigt auf Galerie).
- **Admin mit Kontext VK2:** `/admin?context=vk2` – eigene Storage-Keys `k2-vk2-artworks`, `k2-vk2-events`, `k2-vk2-documents`; **Kasse-Button ausgeblendet**; Link „Kunden“ → „Mitglieder“, Ziel VK2-Kunden; „Zur Galerie“ führt zu VK2-Galerie.
- **DevView:** Bei `?context=vk2` wird der **Shop-Tab ausgeblendet** (APf ohne Kasse).
- **Smart Panel:** VK2-Block – „Mitglieder“ → `/projects/vk2/kunden`, „Künstler (Galerie)“ → `/projects/vk2/galerie`, „Admin“ → `/admin?context=vk2`.
- **App-Routen:** `/projects/vk2/galerie`, `/projects/vk2/galerie-vorschau`, `/projects/vk2/kunden` rendern dieselben Seiten (GaleriePage, GalerieVorschauPage, KundenPage); Datenquelle für VK2 (k2-vk2-* beim Admin) ist getrennt.

## Nächste Schritte (VK2 voll nutzbar)

1. **GaleriePage / GalerieVorschauPage unter VK2:** Wenn Route `/projects/vk2/...` → Stammdaten und Werke aus `k2-vk2-*` laden (wie bei ök2 mit `musterOnly`), Labels „Künstler“ statt „Werke“, Kategorien aus `VK2_KUNSTBEREICHE`.
2. **KundenPage unter VK2:** Unter `/projects/vk2/kunden` Mitgliederverzeichnis aus eigenem Key (z. B. `k2-vk2-customers` oder weiter Kunden-Key mit VK2-Kontext) laden, Label „Mitglieder“.
3. **Stammdaten Verein:** Admin Einstellungen bei `context=vk2` – Verein (Name, Kontakt, Adresse) in `k2-vk2-stammdaten-galerie` speichern/laden; optional „Kunstbereiche“ dort pflegbar.
4. **Werke = Künstler + Vita:** Ein „Werk“ im VK2 = ein Mitglied mit Vita-Eintrag (wie bestehende Vita); Anzeige in Galerie = Künstlerprofile; Mitgliederverzeichnis liefert die Basis, Vita den Text/Bild.
5. **Lizenz-Prüfung** – Backend/Abonnements: „Verein kostenlos bei ≥ 10 zahlenden Lizenzmitgliedern“, „Lizenzmitglied: 50 % Lizenz“. Künstler mit/ohne Lizenznummer (ök2) ist für die Vereinskostenfreiheit unerheblich.

---

## Kurzfassung

- **VK2** = Vereinsplattform, Kunden = Mitglieder, Werke = Künstler.
- Verein kostenlos bei ≥ 10 zahlenden Lizenzmitgliedern; Lizenzmitglied: 50 % Lizenz, Update, kein Bonus. Künstler:innen können eine Lizenznummer haben (ök2) – für den Verein zählt nur die Anzahl der zahlenden Lizenzmitglieder.
- **Smart Panel:** VK2 als eigener Bereich, Schnellzugriff auf Mitglieder, Künstler, Control Studio – alles vom Panel aus organisierbar.
