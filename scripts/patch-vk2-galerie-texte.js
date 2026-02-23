// Patch: VK2-Galerie Texte + Admin-Button-Duplikat + K2-Link
const fs = require('fs');
let c = fs.readFileSync('src/pages/GaleriePage.tsx', 'utf8');

// Fix 1: K2-Fallback-Text → VK2-bewusst (2 Stellen)
const OLD_FALLBACK = "galerieTexts.welcomeIntroText?.trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'";
const NEW_FALLBACK = "galerieTexts.welcomeIntroText?.trim() || (vk2 ? 'Die Mitglieder unseres Vereins \u2013 K\u00fcnstler:innen mit Leidenschaft und K\u00f6nnen.' : 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')";

const before1 = c.split(OLD_FALLBACK).length - 1;
c = c.split(OLD_FALLBACK).join(NEW_FALLBACK);
console.log('Fix 1 (Fallback-Text):', before1, 'Stellen ersetzt');

// Fix 2: Admin-Button im VK2-Balken entfernen
// Der Balken hat: <span>VK2 Vereinsplattform – Unsere Mitglieder</span>
// gefolgt von einem <button ...>Admin</button>
// Wir entfernen nur den Button-Teil
const ADMIN_BTN_IN_BALKEN = `<button
          type="button"
          onClick={handleAdminButtonClick}
          style={{
            padding: '0.35rem 0.75rem',
            background: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Admin
        </button>`;

if (c.includes(ADMIN_BTN_IN_BALKEN)) {
  c = c.replace(ADMIN_BTN_IN_BALKEN, '');
  console.log('Fix 2 (Admin-Button-Duplikat): entfernt');
} else {
  console.log('Fix 2: Button nicht gefunden, suche alternative...');
  // Suche nach dem Balken-Admin-Button mit leicht abweichendem Whitespace
  const idx = c.indexOf("onClick={handleAdminButtonClick}\n          style={{\n            padding: '0.35rem 0.75rem'");
  if (idx > -1) {
    // Finde Start (<button) und Ende (</button>)
    const btnStart = c.lastIndexOf('<button', idx);
    const btnEnd = c.indexOf('</button>', idx) + '</button>'.length;
    if (btnStart > -1 && btnEnd > -1) {
      c = c.slice(0, btnStart) + c.slice(btnEnd);
      console.log('Fix 2 (Admin-Button-Duplikat): via Index entfernt');
    }
  }
}

// Fix 3: 'K2 im Internet öffnen' → VK2-aware
if (c.includes('K2 im Internet öffnen')) {
  c = c.replace(
    'K2 im Internet öffnen',
    '{vk2 ? \'VK2 im Internet \u00f6ffnen\' : \'K2 im Internet \u00f6ffnen\'}'
  );
  console.log('Fix 3 (K2-Link): ersetzt');
}

fs.writeFileSync('src/pages/GaleriePage.tsx', c, 'utf8');
console.log('Done, length:', c.length);
