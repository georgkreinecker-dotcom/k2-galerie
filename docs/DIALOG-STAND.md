# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 24.02.26 16:42 |
| **Thema** | VK2 Rollen-System: PIN-Login für Mitglieder, Voll-Admin für Vorstand |
| **Was zuletzt** | `Vk2Mitglied` um `rolle` + `pin` erweitert. Admin-Modal: Zugangsberechtigung-Block (Rolle + PIN + Zufalls-Generator). Mitglied-Login unter `/admin?context=vk2&mitglied=1` → PIN-Screen → eigenes Profil (Foto, Werk, Bio, Vita, Website). Vorstand → automatisch voller Admin. VK2-Galerie: 🔑 Mitglied-Button. Voll-Admin: Liste exportieren (CSV) + drucken. Commit: 961cfef ✅ auf GitHub |
| **Nächster Schritt** | Testen: 1) Mitglied anlegen mit PIN in Admin. 2) VK2-Galerie öffnen → 🔑 Mitglied → Name wählen → PIN → Profil bearbeiten. 3) CSV-Export testen. |
| **Wo nachlesen** | `components/ScreenshotExportAdmin.tsx` (VK2_MITGLIED_SESSION_KEY, isMitgliedRoute), `src/config/tenantConfig.ts` (Vk2Mitglied Interface), `src/pages/Vk2GaleriePage.tsx` |
