# Konzept: Präsentationsmappe – eigenes Bearbeitungskonzept

**Stand:** März 2026  
**Zweck:** Klarstellen, dass die **Präsentationsmappe** ein **eigenes Konzept** hat und nicht 1:1 dem Muster „Presse/Newsletter/Social – ein Dokument, ein Modal“ folgt.

---

## 1. Abgrenzung

| Thema | Muster | Präsentationsmappe |
|-------|--------|---------------------|
| **Presse, Newsletter, Social, Flyer, Plakat** | Ein Dokument pro Typ; Bearbeitung im **Modal** (links Formular, rechts Live-Vorschau); geöffnetes Dokument = nur Ansicht/Druck. | **Eigenes Konzept** – siehe unten. |
| **Struktur** | Ein HTML-Dokument, ein Event, ein Speicher-Eintrag. | **Mehrere Varianten** (z. B. ök2 kurz, Vollversion, Kombiniert); eine Route, Varianten per Query; Inhalte aus mök2. |
| **„Bearbeitung“** | Inhalt (Betreff, Body, Texte) im Admin-Modal ändern → Speichern → Dokument aktualisiert. | Kein einzelner „ein Block wie Presse“; Optionen siehe Abschnitt 2. |

Die Präsentationsmappe ist **kein** weiteres Werbematerial-Dokument mit demselben Modal-Pattern. Sie ist eine **Mappe** (mehrseitig, kapitelbasiert, aus einer gemeinsamen Quelle).

---

## 2. Eigenes Konzept – Optionen (ohne Implementierungsauftrag)

- **Quelle:** Inhalte aus **mök2** (Marketing ök2). Eine Quelle, keine doppelte Pflege. Referenz: docs/PRAESENTATIONSMAPPE-VOLLVERSION-KONZEPT.md, docs/K2-GALERIE-PRAESENTATIONSMAPPE.md.
- **Varianten:** Mehrere Ausgaben (z. B. Kurzform, Langform, ök2, VK2) über **eine Route + Query** (`?variant=…`). Eine Page-Komponente, Variante steuert Inhalt/Tiefe. Referenz: ein-standard-problem.mdc (Tabelle Präsentationsmappen).
- **Bearbeitung:**  
  - **Option A:** Pro Variante „bearbeiten“ = Texte/Bilder in mök2 anpassen; Mappe wird aus mök2 neu aufgebaut (kein Dokument-Speicher pro Mappe).  
  - **Option B:** Mappe als generiertes Dokument belassen; nur in mök2 redigieren; kein eigenes „Präsentationsmappen-Modal“.  
  - **Option C:** Später, falls gewünscht: pro Kapitel oder pro Variante eine Bearbeitungsansicht (z. B. Kapitel-Editor), ohne das einfache „ein Dokument = ein Modal“-Muster zu übernehmen.
- **Kein Zwang:** Es ist **nicht** vorgesehen, die Präsentationsmappe in das gleiche UI-Muster wie Newsletter/Flyer/Plakat zu pressen. Eigenes Konzept = eigene Entscheidungen, wenn Bearbeitung gewünscht wird.

---

## 3. Kurzfassung

**Präsentationsmappe = eigenes Konzept.** Mehrere Varianten, Quelle mök2, kapitelbasierte Mappe. Bearbeitung entweder über mök2 oder später über eigenes (evtl. kapitelweises) Konzept – **nicht** 1:1 wie Presse/Newsletter-Modal. Diese Doku dient der Orientierung; kein Implementierungsauftrag.
