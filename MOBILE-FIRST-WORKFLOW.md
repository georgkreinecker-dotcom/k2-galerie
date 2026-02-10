# 📱 Mobile-First Workflow für K2 Galerie

## Workflow-Übersicht

1. **Fotografieren & Anlegen** (Mobile)
   - Objekt fotografieren
   - Metadaten eingeben (Titel, Kategorie, Preis, etc.)
   - Speichern → automatisch zu Supabase/Vercel synchronisieren

2. **Etikett drucken** (Mobile)
   - QR-Code für Objekt generieren
   - Etikett drucken (mit QR-Code, Nummer, Titel)
   - Aufkleben

3. **Verkauf** (Lokale Kasse ODER Internet-Galerie)
   - **Lokale Kasse**: Objekt scannen → als verkauft markieren → bezahlen (bar/Code)
   - **Internet-Galerie**: Online kaufen → automatisch als verkauft markieren

4. **Verkaufs-History**
   - Alle Verkäufe speichern
   - Konfigurierbare Anzeigedauer in Internet-Galerie
   - Automatische Synchronisation Mobile → Mac → Vercel

## Technische Umsetzung

### 1. Mobile-First Admin-Interface
- Einfache Kamera-Integration für Mobile
- Schnelles Anlegen von Objekten
- Automatische Synchronisation zu Supabase

### 2. Etikett-Druck
- QR-Code-Generierung für jedes Objekt
- Druckfunktion (Browser Print API)
- Etikett-Template mit QR-Code, Nummer, Titel

### 3. Kasse-Interface
- QR-Code-Scanner
- Verkauf markieren
- Bezahlung (bar/Code)
- Automatische History-Speicherung

### 4. Verkaufs-History
- localStorage + Supabase
- Konfigurierbare Anzeigedauer
- Automatische Synchronisation

### 5. Automatische Synchronisation
- Mobile → Supabase → Mac → Vercel
- Echtzeit-Updates
- Konflikt-Lösung
