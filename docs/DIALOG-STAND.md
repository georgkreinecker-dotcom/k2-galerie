# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Klare Trennung K2 | VK2 | ök2 (umgesetzt)** – (1) **Doku:** `docs/TRENNUNG-K2-VK2-OEK2.md` mit verbindlichen Regeln (eine Aktion = ein Kontext, sichtbare Kontext-Marke, Session aus URL, Werbematerial pro Kontext). (2) **Admin-Header:** Badge zeigt „VK2 ADMIN“ bzw. „K2 ADMIN“ (ök2 unverändert). (3) **Session:** Beim Laden des Admins wird `k2-admin-context` aus der URL (`?context=vk2` / `?context=oeffentlich`) in den sessionStorage geschrieben, sonst `k2` – kein Verwischen nach Wechsel. (4) **VK2-Labels:** Karte und Bereich „Eventplan“ heißen im VK2 „Vereins-Events & Werbematerial“ bzw. „Vereins-Events & Werbematerial“ (klar getrennt von K2).
- **Zurück / VK2-Design / Dokumente öffnen** – Bereits umgesetzt (Admin-URL injiziert, helles VK2-Design, Blob + Fallback).

## Letzter Commit
- Klare Trennung K2|VK2|ök2: Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels – Commit: a8ff7de ✅ auf GitHub

## Nächste Schritte (offen)
1. **L3 / vermischte Daten** – Bereits gespeichertes Dokument (z. B. Tab „L 3)“) enthält noch alte K2+VK2-Mischung. Abhilfe: Dieses Dokument in der Liste löschen und mit „Neu erstellen“ neu anlegen → dann nur VK2-Daten.
2. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
3. **VK2-Katalog als PDF-Download** direkt aus der App
4. **Vor Veröffentlichung:** QS und Checkliste **docs/VOR-VEROEFFENTLICHUNG.md** noch einmal genau durchgehen (geplant mit Georg).

## Heute außerdem
- **Zurück aus Dokumenten:** goBack() in generierten Dokumenten nutzt Opener-URL inkl. context (Commit 192d544).
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
