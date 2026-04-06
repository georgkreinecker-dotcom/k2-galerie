# Schnellzugriff – Präsentationsmappen (intern)

**Nur für Entwicklung/APf** – steht nicht mehr in der öffentlichen Mappe (`00-INDEX.md`), damit Vortrag/PDF keine internen Repo- und URL-Details zeigen.

**Drei Ebenen:** (1) **In der App** lesen oder als PDF drucken · (2) **Im Repo** die Markdown-Quellen · (3) **Galerie-Präsentationsmodus** = etwas anderes als diese Mappen.

## 1. In der App öffnen

| Mappe | Link / Kurzweg |
|:---|:---|
| **K2 – Vollversion** (diese Mappe) | `/projects/k2-galerie/praesentationsmappe-vollversion` — oder `/projects/k2-galerie/praesentationsmappe` (leitet zur Vollversion) |
| **K2 – Kurzansicht** | `/projects/k2-galerie/praesentationsmappe?view=kurz` |
| **VK2 – Vollversion** | `/projects/k2-galerie/praesentationsmappe-vollversion?variant=vk2` |

## 2. Markdown im Projektordner (Entwicklung)

| Ordner | Rolle |
|:---|:---|
| `public/praesentationsmappe-vollversion/` | K2 · u. a. **`00-INDEX.md`** |
| `public/praesentationsmappe-vk2-vollversion/` | VK2 · Vollversion |
| `public/praesentationsmappe-vk2-promo/` | VK2 · kurze Promo-Mappe |

## 3. Galerie „Präsentationsmodus“ — nicht die PDF-Mappen

**Eigene Funktion:** nur die **öffentliche Galerie** in ruhiger Ansicht / Vollbild (Vernissage, Schaufenster). **Parameter:** `?praesentation=1` an der Galerie-URL.

- ök2-Demo, K2, VK2: siehe `docs/FEATURES-ABHEBUNG-ZIELGRUPPE.md`

## 4. Diese Mappe als Folien (Beamer / Vollbild)

**Eigene Funktion:** dieselbe **Vollversion**, aber **ein Kapitel pro Folie**, Steuerung mit Pfeiltasten oder Leertaste, **Vollbild**-Button, **Esc** beendet den Folienmodus. Optional automatischer Wechsel: `&auto=60` (Sekunden pro Folie, 5–600).

- `?beamer=1` auf der Vollversion; ök2/VK2 mit `context` / `variant` wie in der App.
