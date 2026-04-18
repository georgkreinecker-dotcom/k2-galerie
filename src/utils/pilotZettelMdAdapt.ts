/**
 * Pilot-Zettel 20-PILOT-ZETTEL-OEK2-VK2.md ist ein kombinierter Mustertext.
 * Bei nur ök2 oder nur VK2 werden Überschrift und Fließtext angepasst –
 * getrennte Anwendungen, kein Eindruck eines „gemeinsamen“ Zugangs.
 *
 * @param pilotDisplayName Gewählter App-/Galeriename (z. B. Neumann) – erscheint bei ök2 in Überschrift/Kurz, kein „Demo“-Ton.
 */
export function adaptPilotOek2Vk2ZettelMd(
  md: string,
  pilotType: 'oek2' | 'vk2' | null,
  pilotDisplayName?: string,
): string {
  if (pilotType !== 'oek2' && pilotType !== 'vk2') return md
  const display = pilotDisplayName?.trim() || ''
  return md
    .split('\n')
    .flatMap((line) => {
      /**
       * Ausführlicher Text steht im orangefarbenen Kasten oben (ZettelPilotPage).
       * Hier nur ein kurzer Verweis – sonst fehlt der Weg-Hinweis, wenn man nur „Erste Schritte“ sieht.
       */
      if (
        line.startsWith('**Deinen Weg festlegen:**') ||
        line.startsWith('**Deinen Weg festlegen (wichtig):**')
      ) {
        if (pilotType === 'oek2') {
          return [
            '*Sparte („Wofür nutzt du deine Galerie?“): ausführlich im **Kasten „Deinen Weg wählen“ ganz oben** auf dem Zettel (über der Überschrift „Testpilot:in …“).*',
          ]
        }
        if (pilotType === 'vk2') {
          return [
            '*Verein und Kunstrichtungen: ausführlich im **Kasten „Deinen Weg wählen“ ganz oben** auf dem Zettel.*',
          ]
        }
      }
      if (pilotType === 'oek2') {
        if (line.startsWith('# ')) {
          const h1 = display
            ? `# Testpilot:in ök2 – Galerie von ${display} (voller Gratis-Zugang)`
            : '# Testpilot:in ök2 – deine Galerie (voller Gratis-Zugang)'
          return [h1]
        }
        if (line.startsWith('**QR und feste Adressen**')) {
          const qr =
            display.length > 0
              ? `**QR und Adresse** stehen in der **Tabelle unten**. Das ist **deine** Galerie **„${display}“** im Browser – dieselbe Plattform wie spätere Lizenz-Galerien. Getrennt von VK2 und K2 Familie.`
              : '**QR und Adresse** stehen in der **Tabelle unten**. **ök2** ist **deine** persönliche Galerie im Browser – getrennt von VK2 und K2 Familie.'
          return [qr]
        }
        if (line.trim().startsWith('*ök2 = Demo')) {
          const kurz =
            display.length > 0
              ? `*Das ist **deine** Web-Galerie **${display}** (Laptop und Handy) – **nicht** die anonyme Startseite. Einmal **Drucken / Als PDF speichern**, mitgeben.*`
              : '*Das ist **deine** Web-Galerie im Browser (Laptop und Handy), mit deinem gewählten Namen. Einmal **Drucken / Als PDF speichern**, mitgeben.*'
          return [kurz]
        }
        /** „In einem Satz“ für ök2 nicht anzeigen (weder kombiniert noch alte Varianten) */
        if (line.includes('**In einem Satz:**')) {
          return []
        }
        if (line.trim().startsWith('*Stand:') && line.includes('ök2 & VK2')) {
          return ['*Stand: April 2026. Nur ök2.*']
        }
      }
      if (pilotType === 'vk2') {
        if (line.startsWith('# ')) return ['# Testpilot:in VK2 – Vereinsplattform (voller Gratis-Zugang)']
        if (line.startsWith('**QR und feste Adressen**')) {
          return [
            '**QR und Adresse** stehen in der **Tabelle unten**. **VK2** ist eine **eigene Anwendung** (Vereinsplattform) – getrennt von ök2 und K2 Familie.',
          ]
        }
        if (line.trim().startsWith('*ök2 = Demo')) {
          return [
            '*VK2 = Vereinsplattform – **eigene** Anwendung im Browser (Laptop und Handy). Einmal **Drucken / Als PDF speichern**, mitgeben.*',
          ]
        }
        if (line.includes('**In einem Satz:**') && line.includes('ök2')) {
          return [
            '**In einem Satz:** *„Vereinsplattform mit Mitgliedern und öffentlicher Galerie – **nur VK2**, eigene Anwendung.“*',
          ]
        }
        if (line.trim().startsWith('*Stand:') && line.includes('ök2 & VK2')) {
          return ['*Stand: April 2026. Nur VK2.*']
        }
      }
      return [line]
    })
    .join('\n')
}
