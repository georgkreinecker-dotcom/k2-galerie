# E-Mail-Vorlagen – nach Lizenzkauf, Einladung

**Stand:** 08.03.26  
**Zweck:** Eine Quelle für verbindliche E-Mail-Texte. Phase 1: Du nutzt sie manuell (Copy-Paste, Platzhalter ersetzen). **Später im automatisierten Ablauf** können dieselben Texte aus dem System (z. B. nach Checkout) versendet werden – dann läuft alles im Netz. **Eine Vorlage pro Anlass**, keine zweite Variante ohne Grund.

---

## A. Nach Lizenzkauf (Danke, Link, nächster Schritt)

**Einsatz:** Wenn du nach einem Lizenzkauf zusätzlich eine E-Mail schickst – oder als Textvorlage für eine spätere Automatik (z. B. E-Mail nach Stripe Checkout). Erfolgsseite zeigt bereits die Links; diese Vorlage ist für den Fall „E-Mail mit gleicher Botschaft“.

**Betreff (z. B.):** Deine K2 Galerie – Link und nächste Schritte

**Text:**

> [Anrede / Name],
>
> danke für deinen Lizenzkauf. Hier deine Links:
>
> **Deine Galerie (öffentlich):** [Galerie-URL]
> **Admin (bearbeiten):** [Admin-URL]
>
> Nächster Schritt: Admin öffnen, Werke und Texte anlegen, dann „Veröffentlichen“. Deine Galerie ist dann unter der Galerie-URL sichtbar.
>
> Bei Fragen: [Kontakt aus Stammdaten]
>
> K2 Galerie

**Platzhalter ersetzen:** [Anrede / Name], [Galerie-URL] (z. B. https://k2-galerie.vercel.app/g/[tenantId]), [Admin-URL] (z. B. https://k2-galerie.vercel.app/admin?tenantId=[tenantId]), [Kontakt aus Stammdaten].  
**Im automatisierten Ablauf:** Galerie-URL und Admin-URL kommen aus der Lizenz (licences.galerie_url bzw. Admin-Link mit tenantId); keine manuellen Eingaben.

---

## B. Einladung zum Test (Pilot:in / Demo)

**Einsatz:** Gezielte Einladung an jemanden, der die Demo (ök2 oder VK2) testen soll – ohne Lizenzkauf. Kurz, einladend.

**Betreff (z. B.):** Einladung – K2 Galerie / ök2 testen

**Text:**

> [Anrede / Name],
>
> wir laden dich ein, die K2-Demo selbst auszuprobieren – Galerie, Kasse, Presse aus einer Hand. Kein Account nötig zum Anschauen.
>
> **Demo / Willkommen:** https://k2-galerie.vercel.app/willkommen  
> **VK2 (Vereine):** https://k2-galerie.vercel.app/projects/vk2
>
> Wenn du magst, sag uns danach kurz, was dir auffällt oder fehlt. Wir freuen uns auf dein Feedback.
>
> [Dein Name / K2 Galerie]

**Platzhalter ersetzen:** [Anrede / Name], [Dein Name / K2 Galerie]. Links unverändert lassen (SICHTBARKEIT-PHASE1 §5).

---

## Verwendung

| Vorlage | Wann | Platzhalter |
|---------|------|-------------|
| **A (nach Kauf)** | Nach Lizenzkauf, wenn du eine E-Mail schickst (oder für künftige Automatik). | [Anrede/Name], [Galerie-URL], [Admin-URL], [Kontakt] |
| **B (Einladung Test)** | Einladung an Pilot:in oder Interessierte zum Demo-Test. | [Anrede/Name], [Dein Name / K2 Galerie] |

**Eine Quelle** – keine parallelen Texte an anderen Stellen. Mehrsprachigkeit: wenn später nötig, zweite Sprachversion als eigenes Dokument (MEHRSPRACHIGKEIT-PLAN). **Automatisierter Ablauf:** Vorlage A kann später vom System (z. B. nach Webhook) mit echten URLs befüllt und versendet werden – Inhalt bleibt derselbe.
