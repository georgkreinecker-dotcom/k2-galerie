# Empfehlungskonzept – einfacher Weg (Kostensenkung, kein Cashback)

**Stand:** Februar 2026  
**Ziel:** Konkretes Konzept für Vermarktung und technische Umsetzung – ohne Cashback-System, mit Rabatt/Gutschrift (Kosten des Users senken).

---

## 1. Grundentscheidung

- **Kein Cashback:** Keine Auszahlung von Geld an Empfehler:innen (kein Abrechnungssystem, keine Überweisungen, weniger Rechtliches).
- **Kostensenkung:** Beide Seiten profitieren über **Rabatt** bzw. **Gutschrift** im Produkt:
  - **Geworbene:r** (Neukunde): z. B. **10 % Rabatt auf die erste Lizenz** (oder erste 3 Monate).
  - **Empfehler:in** (Werber:in): z. B. **10 % Gutschrift auf die nächste eigene Lizenzrechnung** pro geworbenem Kunden. **10 Geworbene = 100 % Gutschrift = nächste Rechnung gratis.**
- **Effekt:** Ähnliche Motivation wie „Geld zurück“, aber deutlich weniger Aufwand und rechtlich einfacher.

---

## 2. Vermarktung – wo und wie

### 2.1 Botschaften (mök2, App, Werbematerial)

| Zielgruppe | Botschaft |
|------------|-----------|
| **Empfehler:in** | „Empfiehl die K2 Galerie – du sparst bei deiner nächsten Lizenz.“ |
| **Geworbene:r** | „Von einer Künstlerin empfohlen? Du bekommst 10 % Rabatt auf den Einstieg.“ |
| **Kurz** | „Empfehlen lohnt sich: Du sparst, sie spart.“ |

- **Sprache:** „Empfehlungs-Programm“, „Empfehler-ID“, „Gutschrift“ / „Rabatt“ – keine Begriffe wie „Provision“, „Cashback“, „Auszahlung“.
- **Transparenz:** In AGB / Teilnahmebedingungen: Wer darf mitmachen, wie viel Rabatt/Gutschrift, wann wird sie angerechnet.

### 2.2 Wo es sichtbar ist

| Ort | Inhalt |
|-----|--------|
| **mök2 (Marketing ök2)** | Sektion „Empfehlungs-Programm“: Ablauf, 10 % Rabatt / 10 % Gutschrift, Link zum Empfehlungstool; Kurz-Anleitung „So empfiehlst du“. |
| **App – Einstellungen** | Bereich „Empfehlungs-Programm“: eigene Empfehler-ID anzeigen, kopieren; Empfehlungs-Link; ein Satz: „Wenn jemand deinen Link nutzt und eine Lizenz abschließt, bekommst du 10 % Gutschrift auf deine nächste Rechnung.“ |
| **Empfehlungstool** (bestehende Route) | ID + Link + vorgefertigter Text zum Teilen (E-Mail, WhatsApp); gleiche Botschaft wie oben. |
| **Lizenz-Vergabe / Checkout** | Optionales Feld „Empfehler-ID (falls du von jemandem geworben wurdest)“ – Hinweis: „Du erhältst 10 % Rabatt auf diese Lizenz.“ |

### 2.3 Teilnahmebedingungen (Stichpunkte für AGB)

- Mitmachen darf, wer eine gültige Lizenz hat (Basic, Pro, VK2-Verein oder VK2-Mitglied).
- **Geworbene:r:** Max. einmal 10 % Rabatt auf die erste Lizenz (bzw. erste Laufzeit), nur bei Angabe einer gültigen Empfehler-ID beim Abschluss.
- **Empfehler:in:** 10 % Gutschrift auf die **nächste** eigene Lizenzrechnung pro erfolgreich geworbenem Kunden (einmalig pro Geworbenem); Gutschriften addieren sich – z. B. 10 Geworbene = 100 % = Lizenz für diese Rechnung kostenlos. Keine Auszahlung, nur Anrechnung.
- Keine Selbstempfehlung; ID nur gültigen, aktiven Konten zugeordnet; Missbrauch führt zum Ausschluss.

### 2.4 VK2-Kompatibilität (Kunstvereine)

- **Dieselbe Regel** gilt für alle Lizenztypen – auch für **VK2** (Vereinsplattform). 10 % Rabatt für Geworbene, 10 % Gutschrift pro Geworbenem für Empfehler:in; 10 Geworbene = nächste Rechnung gratis.
- **Empfehler:in** kann sein: Einzelkünstler:in (Basic/Pro), **Verein** (VK2) oder **Vereinsmitglied** (50 %-Lizenz). **Geworbene:r** kann Basic, Pro oder **VK2** (Verein) wählen.
- **Bezugsgröße:** Bei VK2-Verein = Vereinsbeitrag (z. B. Pro bis 10 Mitglieder, danach kostenfrei). Bei Vereinsmitglied = 50 %-Lizenz. Rabatt bzw. Gutschrift beziehen sich auf die jeweilige Rechnung (Verein oder Mitglied).
- **Verein als Empfehler:** Wenn ein Verein 10 Geworbene hat → 100 % Gutschrift auf die nächste Vereinsrechnung (oder, falls bereits „ab 10 Mitgliedern kostenfrei“, Gutschrift für spätere Gebühren / Mitgliedsanteile definieren).
- **Konsequenz:** Ein einheitliches Empfehlungs-Programm für Basic, Pro und VK2 – gleiche Logik, gleiche Kommunikation, nur die Rechnungsbasis (Einzelkünstler vs. Verein vs. Mitglied) ist kontextabhängig.

---

## 3. Technische Umsetzung

### 3.1 Bereits vorhanden

| Baustein | Wo | Status |
|----------|-----|--------|
| **Empfehler-ID** | `src/utils/empfehlerId.ts` | `getOrCreateEmpfehlerId()`, Format `K2-E-XXXXXX`, Speicher in localStorage. |
| **Empfehlungs-Link** | Empfehlungstool, mök2 | Link mit Parameter `?empfehler=K2-E-XXXXXX` (Willkommensseite / Lizenz-Seite). |
| **Eingabe Empfehler-ID** | `LicencesPage.tsx` | Optionales Feld „ID des Empfehlers“; wird in `LicenceGrant.empfehlerId` gespeichert. |
| **Speicher Lizenzen** | `LicencesPage`, `k2-license-grants` | Pro Lizenz: `id`, `name`, `email`, `licenseType`, `empfehlerId`, `createdAt`. |
| **Empfehlungstool** | Route `/projects/k2-galerie/empfehlungstool` | ID anzeigen, Link kopieren, vorgefertigter Text. |
| **mök2 Sektion 6** | `MarketingOek2Page.tsx` | Empfehlungs-Programm beschrieben (derzeit 50 %-Gebühr; auf 10 % Rabatt/Gutschrift umstellen). |

### 3.2 Noch umzusetzen (Reihenfolge)

1. **Rabatt für Geworbene:r**
   - Beim Lizenzabschluss: Wenn `empfehlerId` angegeben und gültig → **Preis um 10 % reduzieren** (oder erste X Monate).
   - Anzeige im Checkout: „Empfehlungs-Rabatt: −10 %“.
   - Technisch: In `LicencesPage` (oder wo Lizenz „verkauft“ wird) Preisberechnung um Rabatt-Logik ergänzen; ggf. neues Feld `empfehlungsRabattAngewendet: true` in `LicenceGrant`.

2. **Gutschrift für Empfehler:in**
   - Pro gespeicherter Lizenz mit gültiger `empfehlerId`: **Gutschrift dem Empfehler-Konto zuordnen**.
   - Speicher: z. B. `k2-empfehler-gutschriften` als Array `{ empfehlerId, betrag, quelleLicenceId, datum }` oder pro User eine Gutschrift-Summe.
   - Bei **nächster Abrechnung** des Empfehlers: Gutschrift anrechnen (Preis − Gutschrift). Dafür muss „Abrechnung“ bzw. „nächste Rechnung“ definiert sein (z. B. nächste Verlängerung, nächster Monat – je nach Abo-Modell).
   - Technisch: Gutschrift beim Speichern der Lizenz schreiben; bei Anzeige/Berechnung der eigenen Lizenzgebühr des Empfehlers Gutschrift einlesen und abziehen (max. 100 % der Rechnung).

3. **Gültigkeit der Empfehler-ID**
   - Prüfung: Existiert ein Konto/Lizenz mit dieser ID? Aktuell: Empfehler-IDs sind lokal pro Browser (`getOrCreateEmpfehlerId`). Für echte Zuordnung später: **Backend** (Supabase) muss ID pro User speichern und bei Eingabe prüfbar machen.
   - Übergangslösung: Jede eingegebene ID im Format `K2-E-XXXXXX` akzeptieren; Gutschrift nur verbuchen, wenn wir später eine Abrechnung haben (oder manuell prüfen).

4. **Empfehlungs-Link beim Geworbenen**
   - Beim Aufruf der Willkommens- oder Lizenz-Seite mit `?empfehler=K2-E-XXXXXX`: Parameter aus URL lesen und ins Formular übernehmen (Empfehler-ID vorausgefüllt), damit der Geworbene nichts abtippen muss.

### 3.3 Datenmodell (minimal)

```
LicenceGrant (bereits vorhanden):
  id, name, email, licenseType, empfehlerId?, createdAt

Neu (oder in LicenceGrant ergänzen):
  - empfehlungsRabattAngewendet?: boolean   // 10 % abgezogen
  - preisNachRabatt?: number                 // optional, zur Nachvollziehbarkeit

Gutschriften (neu, z. B. localStorage key k2-empfehler-gutschriften):
  { empfehlerId: string, betrag: number, licenceId: string, datum: string }
```

Später mit Backend: Empfehler-ID pro User in DB; Gutschriften in DB; Abrechnung (nächste Rechnung) pro User auslesen und Gutschrift anrechnen.

### 3.4 Aufwand (grobe Einschätzung)

| Schritt | Aufwand | Priorität |
|---------|---------|-----------|
| Rabatt 10 % im Lizenz-Checkout anzeigen und anwenden | Klein (1–2 Tage) | 1 |
| URL-Parameter `empfehler` auslesen und ins Formular übernehmen | Klein (halber Tag) | 1 |
| Gutschrift bei Lizenz mit empfehlerId speichern | Klein (1 Tag) | 2 |
| Gutschrift bei „eigener nächster Rechnung“ anrechnen | Mittel (Abrechnung muss definiert sein; 1–2 Tage) | 2 |
| mök2 / App-Texte auf 10 % Rabatt/Gutschrift umstellen | Klein (halber Tag) | 1 |
| AGB / Teilnahmebedingungen ergänzen | Klein (Text) | 1 |

---

## 4. Kurzfassung

| Thema | Inhalt |
|-------|--------|
| **Anreiz** | Geworbene:r: 10 % Rabatt auf erste Lizenz. Empfehler:in: 10 % Gutschrift pro Geworbenem auf nächste Rechnung (10 Geworbene = Rechnung gratis). |
| **Vermarktung** | mök2 Sektion 6, Einstellungen „Empfehlungs-Programm“, Empfehlungstool, Checkout-Hinweis; Sprache: Rabatt/Gutschrift, kein Cashback. |
| **Technik** | ID + Link + Speicher empfehlerId vorhanden; offen: Rabatt-Logik, Gutschrift speichern und anrechnen, URL-Parameter vorausfüllen. |
| **Recht** | AGB/Teilnahmebedingungen: Wer, wie viel, wann; keine Selbstempfehlung. |
| **VK2** | Dieselbe Regel für Basic, Pro und VK2 (Verein + Mitglied); Bezugsgröße = jeweilige Rechnung. |

---

*Ergänzt das bestehende Vermarktungskonzept (VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md) um die Variante „einfacher Weg“; 50 %-Gebühr dort kann für eine spätere Phase bleiben oder durch diese 10 %-Rabatt/Gutschrift-Regel ersetzt werden.*
