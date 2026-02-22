# Dialog-Stand – Letzter Arbeitsschritt

| Feld | Inhalt |
|---|---|
| **Datum** | 22.02.26 |
| **Thema** | iPad Speichern: Etikett-Modal nach neuem Werk |
| **Was war zuletzt dran** | ✅ Nach Speichern am iPad: kein störender Alert mehr. Stattdessen Etikett-Modal mit Werksnummer, Titel, Preis und QR-Code. QR zeigt auf Galerie-URL mit Werksnummer (für Kassa-Scan). „Teilen"-Button via Web Share API. Build ✅, Push ✅. Stand: 22.02.26 10:43 |
| **Nächster konkreter Schritt** | Am iPad testen: Neues Werk fotografieren → Speichern → Etikett-Modal erscheint mit QR? Dann: Etikett am Mac drucken (Brother QL-820MWBc) testen |
| **Wo nachlesen** | `src/pages/GalerieVorschauPage.tsx` am Ende (EtikettQrCode-Komponente + showEtikettModal State) |
