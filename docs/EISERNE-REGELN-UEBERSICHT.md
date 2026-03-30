# Eiserne Regeln – Übersicht (struktureminent wichtige Bereiche)

**Zweck:** Schnell sehen, welche strukturell wichtigen Bereiche durch eine **eiserne Regel** (alwaysApply, „NIEMALS“ / „unveränderlich“) abgedeckt sind. Lücken schließen wir mit neuen Regeln.

**Stand:** März 2026.

---

## Bereiche mit eiserner Regel (bereits vorhanden)

| Bereich | Regel (.cursor/rules/) | Kern |
|---------|------------------------|------|
| Keine K2-Daten in ök2 | k2-oek2-eisernes-gesetz-keine-daten.mdc | Keine Stammdaten/Werke in ök2 – unumstösslich |
| K2 echte Galerie = fertig | k2-echte-galerie-eisernes-gesetz.mdc | Nichts am K2-Kern ändern ohne dezidierte Anordnung |
| K2-Events/Dokumente nie VK2 | k2-events-documents-niemals-vk2-schreiben.mdc | Keine VK2-Daten in k2-events/k2-documents |
| Stand & QR | stand-qr-niemals-zurueck.mdc | QR = Server-Stand + Cache-Bust; Inject-Script nie entfernen |
| Kundendaten nie löschen | niemals-kundendaten-loeschen.mdc, datentrennung-localstorage-niemals-loeschen.mdc | Kein Filter+setItem; keine stillen Löschungen |
| ök2 und APf nie vermischen | oek2-apf-niemals-vermischen.mdc | Handbuch/ök2 ohne APf-Begriffe |
| Admin einheitliches Layout | admin-einheitliches-layout.mdc | Ein Hub für K2/ök2/VK2; kein Guide-UI im Admin |
| Größere Änderung = kein Chaos | eiserne-regel-groessere-aenderung-kein-chaos.mdc | Vorher Bericht+Bugs, während Standard, nachher alle Pfade+Tests |
| Veröffentlichen & Laden | prozesssicherheit-veroeffentlichen-laden.mdc | Ein Weg Publish/Load; serverAsSoleTruth; preserveLocalImageData |
| Werke mit Bild = ImageStore | werke-bilder-immer-imagestore.mdc | Immer prepareArtworksForStorage / saveArtworks*WithImageStore |
| Kein Auto-Reload (Code 5) | code-5-crash-kein-auto-reload.mdc, crash-beim-programmieren-vermeiden.mdc | Nur Badge/Button; kein Reload in iframe |
| Stammdaten nicht leer überschreiben | kein-datenverlust.mdc | Merge mit bestehendem; nie '' überschreiben |
| Projekt-Unterseiten-Links | link-projekt-unterseite-nie-apf.mdc | Route vor /projects/:projectId; BASE_APP_URL + path |
| Kritische Abläufe nicht abschwächen | kritische-ablaeufe-nicht-abschnwaechen.mdc | Primärer Weg = Standard (Etikett, Publish, Load, …) |

---

## Neu ergänzt (Lücken geschlossen)

| Bereich | Regel | Warum eiserne Regel |
|---------|--------|----------------------|
| **Backup & Wiederherstellung** | eiserne-regel-backup-wiederherstellung.mdc | Überlebenswichtig; war nur in KRITISCHE-ABLAEUFE §11 – jetzt eigene alwaysApply-Regel: NIEMALS entfernen/abschwächen/Format brechen. |
| **VK2-Refactors – K2-Kern unberührt** | eiserne-regel-vk2-refactors-k2-kern-unberuehrt.mdc | Bei VK2-Überarbeitung war Admin-Login wieder da, Impressum ohne Stammdaten; jetzt verbindlich: Admin eine Tür, K2-Impressum Stammdaten+Routenplaner, Stammdaten nur mergen. |
| **End-to-End vollständig – nie „zwischendrin“** | eiserne-regel-end-to-end-vollstaendig.mdc | Georg: immer durchgängige Lösung bis zur echten Funktion; keine Halb-Automatisierung, kein Abbruch nach „nur API“ oder nur Chat-Hinweis ohne eine Spur in Doku/Code. |

---

## Wo die Regeln stehen

- **Alle eisernen Regeln:** `.cursor/rules/*.mdc` mit `alwaysApply: true` (und im Titel/Kern „eiserne Regel“, „NIEMALS“, „unveränderlich“).
- **Kritische Abläufe im Detail:** docs/KRITISCHE-ABLAEUFE.md (Abschnitte 1–15) – dort sind Backup (§11), VK2-Refactors (§15) und alle anderen beschrieben; die eisernen Regeln sind die verbindliche, immer geladene Absicherung dafür.

---

## Kurzfassung

Struktureminent wichtige Bereiche sind durch eiserne Regeln abgedeckt. Lücken (u. a. Backup & Wiederherstellung, VK2-Refactors/K2-Kern, **End-to-End-Vollständigkeit für Georg**) wurden mit eigenen alwaysApply-Regeln geschlossen. Übersicht hier; Details in den jeweiligen .mdc-Dateien und in KRITISCHE-ABLAEUFE.md.
