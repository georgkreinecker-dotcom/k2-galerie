# mök2 komplett umsetzen

**Ziel (Georg, 09.03.26):** mök2 gilt es **komplett** umzusetzen. Wir stehen erst am Anfang – mök2 ist die Vertriebs-Arbeitsplattform für ök2 und soll vollständig ausgebaut werden.

**Quelle:** .cursorrules „mök2 (Marketing ök2) – eigener Bereich“, docs/MOK2-EIGENER-BEREICH.md, src/config/mok2Structure.ts, MarketingOek2Page.tsx.

---

## Was „komplett“ umfasst

| Bereich | Konkret |
|--------|--------|
| **Alle Sektionen mit Inhalt** | Jede Sektion in mok2Structure hat redigierten, lesbaren Inhalt – keine Platzhalter („Noch anzupassen“, „Platzhalter für weitere Ideen“). |
| **Eine Quelle** | Slogan, Botschaft, USPs, Kontakt – eine Stelle in mök2 (bzw. tenantConfig), überall genutzt (Werbeunterlagen, Flyer, K2 Markt, Kampagne). |
| **Werbeunterlagen** | Flyer, Präsentationsmappe, Prospekte, Social – bearbeitbar, druckbar, aus derselben Quelle. |
| **APf-Struktur** | Marketingarbeit in der APf klar organisiert: mök2, Werbeunterlagen, Lizenzen, AGB, Kampagne, K2 Markt – ein Guss. |
| **Verknüpfung K2 Markt** | mök2 = Quelle für Botschaften, USPs, Zielgruppen; K2 Markt (Produkt-Moment, Agenten) kann daraus lesen. Keine doppelte Pflege. |
| **Druck / PDF** | Alles als PDF druckbar, leserlich, einheitliches Layout (handbuch-standard, druckbare-version-anspruch). |

---

## Priorisierte nächste Schritte

1. **Platzhalter schließen** – „Genaue Produktbeschreibung“ und „Platzhalter für weitere Ideen“ mit Inhalt aus USPs/Was kann die App füllen oder klar verweisen.
2. **Eine Quelle durchziehen** – Prüfen: Slogan/Botschaft aus tenantConfig bzw. mök2-Speicher überall (Werbeunterlagen, Willkommen, Kampagne) genutzt; keine Abweichungen.
3. **Sidebar = alle Sektionen** – Sicherstellen, dass jede Sektion aus mok2Structure in MarketingOek2Page eine entsprechende `id` und Inhalt hat (keine toten Links).
4. **K2 Markt ↔ mök2** – Optional: Produkt-Momente oder Texte aus mök2 (z. B. USPs, Slogan) lesen, damit K2 Markt „eine Quelle“ nutzt.
5. **Werbeunterlagen prüfen** – Alle Unterlagen (Flyer, Social, Mappe) mit „Als PDF drucken“ nutzbar, Texte aus mök2.

---

## Wo was liegt

| Was | Datei / Ort |
|-----|--------------|
| **Struktur (Sidebar, Gruppen)** | src/config/mok2Structure.ts |
| **Hauptseite mök2** | src/pages/MarketingOek2Page.tsx |
| **Layout (APf-Wrapper)** | src/components/Mok2Layout.tsx |
| **Werbeunterlagen** | src/pages/WerbeunterlagenPage.tsx |
| **Routen** | /mok2, /projects/k2-galerie/marketing-oek2, /projects/k2-galerie/werbeunterlagen |
| **Eine Quelle (Slogan, Botschaft)** | src/config/tenantConfig.ts (PRODUCT_WERBESLOGAN, PRODUCT_BOTSCHAFT_2), localStorage k2-mok2-werbeslogan, k2-mok2-botschaft2 |

---

*Bei jeder Arbeit an Vertrieb/Marketing: mök2 als eigenen Bereich beibehalten, „komplett umsetzen“ im Blick. Regel: .cursor/rules/mok2-vk2-inhalte-nicht-entfernen.mdc (Inhalte nicht nebenbei löschen).*
