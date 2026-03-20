# ök2 und VK2 – Anmeldung und Lizenzierung: State of the Art

**Stand Haupttext:** 02.03.26 · **Zweck:** Klarer Istzustand Anmeldung/Lizenzierung für **ök2 (Demo)** und **VK2 (Vereinsplattform)** – was gibt es, was fehlt, was ist state of the art.

> **⚠️ Aktualisierung März 2026 (Guide):** Die frühere **`GlobaleGuideBegleitung`** (schwarzer Dialog auf jeder Seite) ist **abgeschaltet** – Komponente ist ein Stub. **Lizenz-Preise und mailto** sind weiterhin über **WillkommenPage, EntdeckenPage, LicencesPage, LicenseManager** (`licencePricing.ts`) abgedeckt – nicht über den alten globalen Guide. Die Tabellenzeilen unten, die noch „Guide auf jeder Seite“ / „GlobaleGuideBegleitung: LizenzInfo“ beschreiben, sind **historisch**; fachliche Quelle für den aktuellen Guide-Umfang: **`guide-nahtlos-begleitung.mdc`** + **`k2GuideFlowStorage.ts`** + grüner Balken in **ScreenshotExportAdmin**.

---

## 1. Was es heute gibt

### 1.1 ök2 – Einstieg (kein klassisches „Anmelden“)

| Stelle | Verhalten |
|--------|-----------|
| **/willkommen** | Leitet sofort auf **/entdecken** weiter (Redirect). Kein Formular, keine Anmeldung. |
| **/entdecken** | **Landingpage für neue Künstler:innen.** 3-Fragen-Flow (Hero → Weg Solo/Verein → Name → Hub). Am Ende: „Meine Galerie zeigen“ → führt in **ök2-Vorschau** (galerieOeffentlichVorschau) oder **VK2-Vorschau**. Kein E-Mail-, kein Passwort-, kein Registrierungsformular. |
| **Guide / Orientierung** *(März 2026)* | **Nicht** mehr der globale schwarze Dialog. **ök2/VK2-Admin:** grüner **Orientierungs-Balken** bei aktivem Flow (`guideFlowAktiv`). **K2-Galerie:** `GalerieEntdeckenGuide` auf der Seite. Lizenz-Infos: **Willkommen**, **Entdecken**, **Lizenzen** – siehe `licencePricing.ts`. |

**Fazit Einstieg ök2:** Es gibt **keine technische Anmeldung** (kein Login, kein Account). Nutzer:in bleibt anonym; Name optional für personalisierte Vorschau (sessionStorage/localStorage).

---

### 1.2 VK2 – Einstieg und Anmeldung

| Stelle | Verhalten |
|--------|-----------|
| **EntdeckenPage (Weg „Verein“)** | Wer „Vereinsgalerie“ wählt, landet am Ende in **VK2-Vorschau** (galerieVorschau). Gleicher Flow wie ök2, anderer Kontext (VK2). Kein separates Verein-Registrierungsformular. |
| **/projects/vk2** | Leitet auf VK2-Galerie weiter. Öffentliche Vereinsgalerie (Werke, Katalog). |
| **/vk2-login (Vk2MitgliedLoginPage)** | **Mitglied-Login:** Name aus Liste wählen → PIN eingeben → Vorstand geht in Admin (context=vk2), Mitglied in eigenen Bereich. Kein Passwort, keine E-Mail-Anmeldung. Daten aus `k2-vk2-stammdaten` (Mitglieder mit PIN). |
| **Guide (VK2-Pfad „gemeinschaft“)** | Zeigt u. a. „Lizenz wählen“ (VK2/Verein € 19), „Jetzt starten“ – **kein** „VK2-Lizenz anfragen“ / „Verein anmelden“-Link. |

**Fazit Einstieg VK2:** Verein **registriert sich nicht** im System – VK2-Stammdaten (Verein + Mitglieder) werden intern gepflegt. **Mitglieder** loggen sich per Name + PIN ein. Für **neue Vereine** („Wir wollen VK2 nutzen“) gibt es **keinen** sichtbaren CTA „VK2-Lizenz anfragen“ oder „Verein anmelden“ – gleiche Lücke wie bei ök2.

---

### 1.3 Lizenzierung (ök2 und VK2 gemeinsam)

| Stelle | Inhalt / Verhalten |
|--------|---------------------|
| **tenantConfig** | `PRODUCT_LIZENZ_ANFRAGE_EMAIL` (info@kgm.at), `PRODUCT_LIZENZ_ANFRAGE_BETREFF` – werden für **mailto:-Links** „Lizenz anfragen“ genutzt. |
| **WillkommenPage** | **Einstieg wieder aktiv (02.03.26):** Zeigt Variante A/C mit „Galerie ausprobieren“, „Lizenz anfragen“ (mailto), „Lizenz online kaufen“ (Stripe). Kein Redirect mehr zu /entdecken. |
| **EntdeckenPage** | **Kein** „Lizenz anfragen“-Button/Link. Nur Feedback-Mail (andere E-Mail) am Ende. |
| **GalerieVorschauPage (ök2)** | Kein expliziter CTA „Lizenz anfragen“ im sichtbaren Flow (Guide zeigt nur Preise). |
| **Preise / Lizenz-Info (eine Quelle)** | **LIZENZPREISE** in `licencePricing.ts` – u. a. **LicencesPage**, **LicenseManager**, **Willkommen** / **Entdecken** (früher zusätzlich im globalen Guide; dieser ist aus). |
| **LicencesPage** (mök2) | **Intern (APf):** Lizenzstufen aus **LIZENZPREISE** (Basic 15 €, Pro 35 €, Pro+ 45 €, Pro++ 55 €, VK2). Formular „Lizenz vergeben“ (Name, E-Mail, Typ, optional Empfehler-ID). Speicher: **localStorage** (`k2-license-grants`). Kein Backend, keine E-Mail an Kund:in. |
| **LicenseManager** (Komponente) | Wird in **ProjectPlanPage** eingebunden. Zeigt **dieselben** Preise wie LicencesPage (aus **src/config/licencePricing.ts**: 15/35/45/55 €, VK2). **Nicht** auf der öffentlichen Demo sichtbar. |

**Fazit Lizenzierung:**  
- **Nach außen (Demo-Nutzer / Verein):** Einzige vorgesehene „Lizenz anfragen“-Aktion = **mailto** (E-Mail an info@kgm.at) – aber der Link steht nur in der **nicht mehr erreichbaren** WillkommenPage. Für **VK2** (Verein will Plattform nutzen) gilt dasselbe: kein sichtbarer CTA „VK2-Lizenz anfragen“ / „Verein anmelden“.  
- **Intern (Georg):** LicencesPage zum Erfassen vergebener Lizenzen inkl. Typ **VK2** (localStorage); keine Automatik, kein E-Mail-Versand.

---

## 2. Lücken (was fehlt für „state of the art“)

1. **Sichtbarer CTA „Lizenz anfragen“**  
   Nach Demo (Entdecken → Galerie-Vorschau) und im Guide: **kein** klickbarer Link/Button „Lizenz anfragen“ (mailto oder Zielseite). Nutzer:in muss selbst wissen, dass sie eine E-Mail schreiben soll.

2. **WillkommenPage tot**  
   /willkommen zeigt nur „Weiterleitung …“ und springt zu /entdecken. Die alten Varianten (mit „Lizenz anfragen“-Link) werden nie gerendert.

3. **Preise uneinheitlich**  
   **Erledigt (02.03.26):** Eine Quelle **src/config/licencePricing.ts** (LIZENZPREISE). LicencesPage und LicenseManager (sowie öffentliche Seiten) lesen daraus – überall Basic 15 €, Pro 35 €, Pro+ 45 €, Pro++ 55 €, VK2 „ab 10 Mitgliedern kostenfrei“.

4. **Kein „Nächster Schritt“ nach der Demo**  
   Doku (z. B. VERBESSERUNGEN-VERMARKTUNG-GEMEINSAM, mök2) fordert: „klarer Nächster Schritt nach der Demo (z. B. Lizenz anfragen)“. Im aktuellen Flow fehlt genau dieser eine, sichtbare CTA.

5. **Lizenzen nur lokal**  
   LicencesPage speichert nur in localStorage. Keine Synchronisation, kein E-Mail-Versand an Kund:in, keine Integration mit Zahlung oder Vertrag.

---

## 3. Empfohlene nächste Schritte (priorisiert)

| Priorität | Maßnahme | Aufwand |
|-----------|----------|--------|
| 1 | **CTA „Lizenz anfragen“** in EntdeckenPage und (historisch) im globalen Guide. **Erledigt (02.03.26):** EntdeckenPage (Hub): Link „Lizenz anfragen →“ (mailto). Globaler Guide-Dialog ist **März 2026 aus** – CTAs bleiben auf **Willkommen/Entdecken** u. a. | ✅ |
| 2 | **Preise vereinheitlichen:** Eine Quelle definieren; Guide und LicenseManager darauf abstimmen. **Erledigt (02.03.26):** `src/config/licencePricing.ts` (LIZENZPREISE); LicencesPage, Guide, LicenseManager nutzen dieselben Werte (15/35/45 €, VK2). | ✅ |
| 3 | **WillkommenPage:** Entweder Redirect beibehalten und „Lizenz anfragen“ nur auf Entdecken/Guide setzen – oder Redirect entfernen und WillkommenPage wieder als Einstieg mit klarem „Lizenz anfragen“ anzeigen. | **Erledigt (02.03.26):** Redirect entfernt. /willkommen zeigt wieder Variante A oder C (variant=a/c) mit „Meine Galerie ausprobieren“, „Nur Galerie ansehen“, **„Lizenz anfragen“** (mailto) und **„Lizenz online kaufen“** (Link zu Stripe-Checkout). |
| 4 | **LicencesPage:** Optional Backend/ E-Mail (z. B. bei „Lizenz vergeben“ E-Mail an Kund:in) – produktionsreif erst mit klarem Prozess. | Mittel |

---

## 4. Wo im Code was liegt

| Thema | Datei(en) |
|-------|-----------|
| Einstieg /willkommen | `src/pages/WillkommenPage.tsx` (Redirect + alter UI-Code mit mailto) |
| Einstieg /entdecken | `src/pages/EntdeckenPage.tsx` |
| Guide (aktuell) | `src/utils/k2GuideFlowStorage.ts`, grüner Balken in `components/ScreenshotExportAdmin.tsx`; Stub `src/components/GlobaleGuideBegleitung.tsx` |
| Lizenz-Anfrage-Konfiguration | `src/config/tenantConfig.ts` (PRODUCT_LIZENZ_ANFRAGE_*) |
| Lizenzen verwalten (intern) | `src/pages/LicencesPage.tsx` |
| Pricing-Komponente (Plan) | `src/components/LicenseManager.tsx` |
| Routen | `src/config/navigation.ts` (WILLKOMMEN_ROUTE, ENTDECKEN_ROUTE) |

---

**Kurz:** Anmeldung im ök2 = bewusst **keine** (Entdecken ohne Account). Lizenzierung = **sichtbar** auf WillkommenPage (Lizenz anfragen + Lizenz online kaufen), in Entdecken und im Guide (Priorität 1–3 erledigt). Einheitliche Preise aus licencePricing.ts.

---

## 5. Trial 2 Wochen + AGB (Stand 14.03.26)

**Vereinbartes Modell:** 2 Wochen kostenlose Testphase → danach Zahlungspflicht; wenn nicht gezahlt: Lizenz und Daten verfallen.

**AGB:** In **AGBPage.tsx** ist §2 „Testphase (2 Wochen kostenlos) und Umgang mit Daten“ ergänzt:
- Nutzer gibt erforderliche Daten (z. B. E-Mail) ein.
- Versicherung: Daten nur für Testphase und Lizenzabwicklung; **wenn nach 2 Wochen keine Lizenz abgeschlossen wird, werden die Testdaten unverzüglich gelöscht**, Lizenz erlischt.
- Bestätigung „AGB gelesen und akzeptiert“ wie üblich (WillkommenPage: AGB-Modal mit Checkbox vor Eintritt).

**Technische Umsetzung** (Trial-Start, Ablaufprüfung, Löschung bei Verfall) steht noch aus; AGB und Bestätigungsflow sind umgesetzt.
