# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 24.02.26 16:17 |
| **Thema** | VK2 Mitglied-Profil: Foto-Upload, Werk-Upload, Vita-Feld |
| **Was zuletzt** | VK2 Mitglied-Modal komplett erweitert: Porträt-Foto Upload (👤, 400px, 60% JPEG), Werk-Foto Upload (🖼️, 600px, 60% JPEG) – beides mit Drag&Drop und Kamera-Button. Vita-Feld (ausführlich, separater Bereich, 5 Zeilen) + Bio (Kurzform für Karte) – klar getrennt. Vk2Mitglied-Typ um vita-Feld erweitert. Commit: d631a3a ✅ auf GitHub |
| **Nächster Schritt** | VK2 Admin testen: Mitglied bearbeiten → Foto hochladen (Kamera oder Datei) → Werk hochladen → Vita eingeben → Speichern → in der Vorschau prüfen. |
| **Wo nachlesen** | `components/ScreenshotExportAdmin.tsx` (Zeile ~14393), `src/config/tenantConfig.ts` (Vk2Mitglied Interface) |
