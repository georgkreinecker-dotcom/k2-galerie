# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | Backup-System für alle 3 Kontexte (K2, ök2, VK2) |
| **Was zuletzt** | Neues Backup-System: `createK2Backup`, `createOek2Backup`, `createVk2Backup`, `restoreK2FromBackup`, `restoreOek2FromBackup`, `restoreVk2FromBackup`, `detectBackupKontext` in autoSave.ts. Admin-UI: Backup-Panel für alle 3 Kontexte (war vorher nur K2). Build ✅ Commit 6167212 Push ✅ |
| **Nächster Schritt** | Backup testen: K2-Admin → Einstellungen → Lager → Backup herunterladen → prüfen ob JSON vollständig. Dann VK2-Admin → gleicher Weg. Datei auf backupmicro speichern. |
| **Wo nachlesen** | `src/utils/autoSave.ts` (neue Backup-Funktionen), `components/ScreenshotExportAdmin.tsx` (Backup-Panel UI) |
