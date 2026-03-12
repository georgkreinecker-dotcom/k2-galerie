# Medienplanung – Flyer & Werbung (mök2)

**Stand:** 12.03.26  
Orientierung für die Arbeit an Flyern, Werbematerial und Medienplanung im Kontext mök2 und K2 Galerie.

---

## Wo was liegt – ein Einstieg

| Was | Wo in der App / mök2 | Zweck |
|-----|----------------------|--------|
| **mök2 (Marketing ök2)** | APf → mök2 oder `/mok2` | Vertrieb ök2: USPs, Konzepte, Werbelinie, Lizenzen, **Werbeunterlagen** (Link). Alles druckbar als PDF. |
| **Werbeunterlagen** | mök2 → Werbeunterlagen oder `/projects/k2-galerie/werbeunterlagen` | Prospekt, Social-Masken, **Flyer A5**, **QR & Link**, **Präsentationsmappen (Links zum Mitsenden)**. Texte bearbeiten → gelten überall. Modus ök2 oder K2 (echte Galerie). |
| **Präsentationsmappe** | `/projects/k2-galerie/praesentationsmappe` (kombiniert) oder `/praesentationsmappe/oek2-kurz`, `…/oek2-lang`, `…/vk2-kurz`, `…/vk2-lang` | Kurz (1 Seite) und Lang (alle Details) für ök2 und VK2 – als Link in E-Mail/Werbung mitsenden. In Werbeunterlagen Abschnitt 5. |
| **Prospekt Galerieeröffnung** | `/projects/k2-galerie/prospekt-galerieeroeffnung` | Einseitiger Prospekt K2 Kunst und Keramik (Stammdaten, Event, QR). |
| **Links & QR-Codes – Register** | Handbuch-Kapitel (dieses Handbuch) | Alle QR und zentralen Links: wo sie vorkommen, wohin sie führen. Siehe Kapitel „Links & QR-Codes – Register“. |

---

## Checkliste: Flyer & Werbung planen

- **Stammdaten stimmen:** Galerie, Kontakt, Adresse, Event-Daten in Admin/Stammdaten gepflegt – sie fließen in Prospekte und Flyer.
- **Werbelinie einhalten:** Die beiden markanten Sätze (Werbelinie) auf allen Werbemaßnahmen: Presse, Flyer, Plakat, Web, Social. In mök2 nachlesen.
- **QR immer aktuell:** Jeder QR auf Flyer/Prospekt nutzt den Standard (Server-Stand + Cache-Bust), damit Scan die aktuelle Version lädt. Siehe Register.
- **Modus wählen:** Werbeunterlagen gibt es für **ök2** (Demo) und **K2** (echte Galerie) – richtigen Modus wählen, dann passen Kontakt und QR.
- **Eine Quelle für URLs:** Keine feste Adresse eintippen – Basis-URL und Routen kommen aus der zentralen Konfiguration (navigation.ts). Siehe Register.

---

## Was wo drucken / exportieren

| Ausgabe | Wo | Format |
|---------|-----|--------|
| Werbeunterlagen (Prospekt, Flyer A5, QR) | Werbeunterlagen-Seite | Bearbeiten → Drucken oder PDF/Screenshot |
| mök2 komplett | Marketing ök2 (mök2) | „Als PDF drucken“ – alle Sektionen mit Kapiteltrennung |
| Präsentationsmappe | Präsentationsmappe-Seite | 1 Seite, drucken |
| Prospekt Galerieeröffnung | Prospekt Galerieeröffnung-Seite | 1 Seite, drucken |
| Pilot-Zettel / Martina & Muna | Handbuch-Kapitel 20 bzw. 9 | Ausdruck für Piloten/Besuch |

---

## Kontext mök2 – kurz

**mök2** = Marketing ök2 = die Arbeitsplattform für alles, was mit dem **Vertrieb von ök2** zu tun hat. Eigenständiger Bereich neben der App-Entwicklung. In mök2: Ideen, USPs, Werbelinie, Lizenzen, Werbeunterlagen, Technikerzettel, Pilot-Zettel. Alles so strukturiert, dass du dort planen, Texte anpassen und drucken kannst – ohne in der Code-Umgebung zu suchen.

**Für K2 (echte Galerie):** Werbeunterlagen-Seite im Modus **K2** nutzen: dann Stammdaten und QR zur echten K2-Galerie (Flyer/Werbedokumente für Martina & Georg).

---

**Siehe auch:** Links & QR-Codes – Register (in diesem Handbuch). Technische Übersicht: docs/LINKS-QR-CODES-UEBERSICHT.md.
