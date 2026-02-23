const QRCode = require('qrcode')
const fs = require('fs')

const url = 'https://github.com/georgkreinecker-dotcom/k2-galerie'

QRCode.toString(url, { type: 'svg', width: 300, margin: 2 }, (err, svg) => {
  if (err) { console.error(err); return }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Eingang – Georgs Raum</title>
<style>
  @media print { @page { size: A4; margin: 20mm; } }
  body { font-family: Georgia, serif; text-align: center; color: #111; padding: 40px 20px; max-width: 600px; margin: 0 auto; }
  h1 { font-size: 2rem; margin-bottom: 0.25rem; }
  .sub { font-size: 1.1rem; color: #555; margin-bottom: 2rem; font-style: italic; }
  .qr { margin: 2rem auto; width: 260px; }
  .url { font-family: monospace; font-size: 0.95rem; color: #333; word-break: break-all; margin: 1rem 0; background: #f5f5f5; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #ddd; }
  .motto { font-size: 1.15rem; font-style: italic; margin: 2rem 0; color: #555; border-left: 4px solid #8b6914; padding-left: 1rem; text-align: left; }
  .hinweis { font-size: 0.9rem; color: #666; margin-top: 2rem; line-height: 1.7; text-align: left; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
  .footer { font-size: 0.8rem; color: #aaa; margin-top: 2rem; }
</style>
</head>
<body>
  <h1>&#127963; Georgs Raum</h1>
  <div class="sub">Der digitale Nachlass von Georg Kreinecker</div>

  <div class="qr">${svg}</div>

  <div class="url">https://github.com/georgkreinecker-dotcom/k2-galerie</div>

  <hr>

  <div class="motto">
    "Tue eine Sache - und du wirst die Kraft dazu haben."
  </div>

  <hr>

  <div class="hinweis">
    <strong>Fuer wer auch immer diesen Schluessel findet:</strong><br><br>
    Scanne den QR-Code oder tippe die Adresse in jeden Browser ein.<br>
    Dort findest du die Datei <strong>EINGANG.md</strong> - sie erklaert alles.<br><br>
    In diesem Raum liegt das Wissen, die Werte und das Werk von Georg Kreinecker.<br>
    Du kannst darin lesen, verstehen und darauf aufbauen.<br><br>
    Dieser Raum wurde gebaut um zu bleiben.
  </div>

  <hr>
  <div class="footer">Georg Kreinecker &middot; K2 Galerie &middot; Erstellt 23.02.2026</div>
</body>
</html>`

  fs.writeFileSync('docs/SCHLUESSEL-QR.html', html)
  console.log('Fertig: docs/SCHLUESSEL-QR.html')
  console.log('Oeffne diese Datei im Browser und drucke sie aus.')
  console.log('Laminieren + in den Safe legen.')
})
