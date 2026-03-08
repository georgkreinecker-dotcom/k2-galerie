# Marktdurchdringung – Plan: Eferding starten, Welt erobern

**Stand:** 08.03.26  
**Zweck:** Klare technische und vertriebliche Überlegung: **Wo** und **wie** und **wann** starten (Eferding), und wie daraus **Marktdurchdringung ohne neue Technik** wird (bis „Welt“). Ein Plan, keine Wunschliste – umsetzbar und prüfbar.

**Referenzen:** docs/START-NUR-NOCH-OFFEN.md (technisch was fehlt), docs/STRIPE-LIZENZEN-GO-LIVE.md (3 Schritte), docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md (Kanäle, keine direkte Kundenansprache), docs/MEDIENVERTEILER-EROEFFNUNG.md (regional Eferding/OÖ), docs/PLAN-SCHRITT-FUER-SCHRITT.md (konkrete Schritte), mök2 (Kampagnen-Bausteine bereits umgesetzt).

---

## 1. Wo starten: Eferding (und unmittelbare Umgebung)

**Warum Eferding als Anker:**

- **Präsenz vor Ort:** Galerie/K2 steht hier; erste Besucher, erste QR-Scans, erste Lizenzinteressenten sind kontrollierbar und erlebbar.
- **Medien:** Eferding wird von OÖN, MeinBezirk, Tips (regional OÖ) abgedeckt – eine Presseinfo erreicht die richtige Region. Medienverteiler steht: docs/MEDIENVERTEILER-EROEFFNUNG.md.
- **Kein Zufall:** „Start in Eferding“ = bewusste Entscheidung: erst hier validieren (Technik, Ablauf, erste Lizenzen/Piloten), dann ausweiten – ohne die Architektur zu ändern.

**Konkret „Eferding“ heißt:**  
Erste sichtbare Schritte (Eröffnung, Event, Flyer, QR in der Galerie, Presseinfo) mit **einer** Adresse, **einer** Galerie-URL, **einem** Stand – alles, was wir technisch schon haben. Kein eigener „Eferding-Modus“ im Code: dieselbe App, dieselbe Domain (k2-galerie.vercel.app bzw. eigene Domain), gleicher Ablauf für spätere Regionen.

---

## 2. Wie (technisch): Was muss wann stehen

Die **Technik** ist bereits auf Skalierung gebaut (Multi-Tenant, tenantId, keine Festverdrahtung auf einen Ort). Für „Start in Eferding“ und „Welt“ braucht es **dieselbe** technische Basis; der Unterschied ist nur **wo und wie stark** wir sichtbar werden.

### 2.1 Vor dem ersten sichtbaren Start (Eferding)

| # | Was | Zweck | Wo nachlesen |
|---|-----|--------|---------------|
| 1 | **Stripe Go-Live (3 Schritte)** | Lizenz „online kaufen“ führt zu Zahlung **und** zu Eintrag in DB + Erfolgsseite + Galerie-URL für Kunden. Ohne das: Demo läuft, aber kein durchgängiger Abschluss. | docs/STRIPE-LIZENZEN-GO-LIVE.md |
| 2 | **Stand/QR stabil** | Jeder Scan (Handy, Flyer, Ausstellung) lädt **aktuellen** Stand vom Server – kein veralteter Cache. Bereits umgesetzt (buildQrUrlWithBust, useServerBuildTimestamp). | .cursor/rules/stand-qr-niemals-zurueck.mdc |
| 3 | **Demo ök2 + Willkommensseite + „Lizenz anfragen“** | Besucher können Galerie ausprobieren und mit einem Klick zu Lizenzen/Checkout. Bereits umgesetzt. | START-NUR-NOCH-OFFEN.md |
| 4 | **Eine Werbelinie überall** | PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 in tenantConfig; mök2, Presse, Flyer – eine Quelle. Bereits umgesetzt. | PRODUKT-STANDARD-NACH-SPORTWAGEN.md, mök2 |

**Fazit:** Einzige **technische** Lücke vor „Start Eferding“ = **Stripe Go-Live (3 Schritte)**. Alles andere steht.

### 2.2 Für Eferding-Start (vertrieblich / sichtbar)

| Was | Zweck |
|-----|--------|
| **Presseinfo (regional)** | Eine Presseinformation an Medienverteiler (OÖN, MeinBezirk, Tips, ORF OÖ) – Eröffnung / Launch / „K2 Galerie startet“. Vorlage und Adressen: docs/MEDIENVERTEILER-EROEFFNUNG.md, docs/SICHTBARKEIT-PHASE1-VORLAGEN.md. |
| **QR + Links in Eferding** | QR auf Flyer, in der Galerie, auf Visitenkarte → führt auf Willkommensseite oder Galerie (ök2/K2). URLs einheitlich (mök2 → Sichtbarkeit & Werbung → Links & QR). |
| **Erste Zielpersonen** | Wen willst du zuerst erreichen? (z. B. Künstler:innen aus dem Umkreis, ein Kunstverein, Galerien.) In mök2 „Kanäle 2026“ oder hier im Plan festhalten – keine Technik, nur Klarheit. |

### 2.3 Von Eferding zur Region (OÖ, Österreich)

- **Keine neue Technik.** Dieselbe App, dieselbe Domain, derselbe Ablauf. Nur: Presse überregional (Medienverteiler „leicht überregional“), Empfehlungsprogramm nutzen (Nutzer werben mit ID), ggf. Google Business / Social-Bio (docs/SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md).
- **Skalierung = mehr Sichtbarkeit, mehr Empfehlungen, mehr Lizenzen** – kein zweiter Code-Pfad.

### 2.4 Von Region zu „Welt“

- **Architektur ist bereits weltweit:** Multi-Tenant, tenantId, Checkout → Erfolgsseite → /g/:tenantId; Lizenzen in Supabase; Empfehlungsprogramm; keine direkte Kundenansprache (alles systemgestützt). Siehe docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md.
- **„Welt“** heißt: Keine geografische Begrenzung mehr in der Kommunikation (Sprache, Zielgruppe, Kanäle ausweiten). Technisch nichts Neues – nur Nutzung derselben Infrastruktur.

---

## 3. Wann: Meilensteine (klarer Plan)

| Phase | Meilenstein | Kriterium „erledigt“ |
|-------|-------------|------------------------|
| **M1 – Technik startklar** | Stripe Go-Live | 3 Schritte (Migration 003, Vercel Env, Stripe Webhook) erledigt; Test-Kauf → Lizenz in DB, Erfolgsseite mit Galerie-URL. |
| **M2 – Start Eferding (sichtbar)** | Erste sichtbare Aktion vor Ort | Mindestens eines: Presseinfo an regionalen Verteiler **oder** QR/Flyer in Eferding (Galerie, Ausstellung, Messe) **oder** erste gezielte Ansprache (z. B. Verein, Künstler:innen). |
| **M3 – Erste Validierung** | Erste Lizenz/Pilot aus Eferding-Umgebung | Mindestens eine Online-Lizenz oder ein Pilot (ök2/VK2) mit Bezug zu Eferding/Region – bestätigt, dass der Ablauf (Demo → Lizenz → Galerie-URL) in der Praxis funktioniert. |
| **M4 – Bewusst regional ausweiten** | OÖ / Österreich als Ziel | Presse oder Kanäle bewusst auf OÖ/Österreich ausgeweitet (Medienverteiler überregional, Google, Social, Empfehlung); keine technische Änderung. |
| **M5 – Keine geografische Begrenzung** | „Welt“ | Kommunikation und Kanäle nicht mehr auf eine Region beschränkt (z. B. DACH, EU, Sprachversionen, Zielgruppen wo es passt). Technik bleibt unverändert. |

**Reihenfolge:** M1 → M2 → M3 → M4 → M5. Jeder Meilenstein ist prüfbar (ja/nein).

---

## 4. Kurzfassung: Was du jetzt hast

- **Wo:** Eferding als Startort – bewusst, kontrollierbar, medientechnisch abgedeckt.
- **Wie (technisch):** Eine Lücke vor Start: **Stripe Go-Live (3 Schritte)**. Danach: dieselbe Technik für Eferding, Region und Welt – keine neuen Systeme.
- **Wann:** M1 (Stripe) → M2 (erste sichtbare Aktion Eferding) → M3 (erste Lizenz/Pilot) → M4 (regional ausweiten) → M5 (keine geografische Begrenzung).
- **Plan:** Dieses Dokument + STRIPE-LIZENZEN-GO-LIVE.md + MEDIENVERTEILER-EROEFFNUNG.md + mök2 (Kanäle 2026, Sichtbarkeit, Werbelinie). Nächste **konkrete** Handlung: Stripe-3-Schritte abhaken, dann M2 (eine Presseinfo oder QR/Flyer in Eferding) setzen.

---

## 5. Ablage und Verknüpfung

- **Kampagne:** docs/kampagne-marketing-strategie/00-INDEX.md – hier als „Plan Marktdurchdringung (Eferding → Welt)“ verlinken.
- **Technik-Start:** docs/START-NUR-NOCH-OFFEN.md, docs/STRIPE-LIZENZEN-GO-LIVE.md.
- **Medien/Presse Eferding:** docs/MEDIENVERTEILER-EROEFFNUNG.md, docs/MEDIENSTUDIO-K2.md.
