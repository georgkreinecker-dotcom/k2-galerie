/**
 * Inhalt für Schulung Freunde – HTML + Plaintext (eine Quelle = volles Blatt wie Druckversion).
 */
(function () {
  var BASE = 'https://k2-galerie.vercel.app';
  var QR = function (path) {
    return (
      'https://api.qrserver.com/v1/create-qr-code/?size=96x96&margin=2&data=' +
      encodeURIComponent(BASE + path)
    );
  };

  var h2 =
    'font-size:16px;color:#3d2e1f;border-bottom:1px solid #d4c8b8;padding-bottom:4px;margin:24px 0 8px;';
  var p = 'margin:0 0 12px;font-size:14px;line-height:1.6;color:#1a1816;';
  var pMuted = p + 'color:#5c5650;font-size:13px;';
  var link = 'color:#0d7a75;word-break:break-all;';

  var demos = [
    {
      emoji: '🖼️',
      title: 'K2 Galerie',
      desc: 'Digitale Galerie – Werke, Events, Kassa, Etiketten',
      path: '/projects/k2-galerie/galerie-oeffentlich',
    },
    {
      emoji: '🏛️',
      title: 'VK2',
      desc: 'Plattform für Vereine – Mitglieder, gemeinsame Galerie',
      path: '/projects/vk2/galerie',
    },
    {
      emoji: '👨‍👩‍👧',
      title: 'K2 Familie',
      desc: 'Familienstammbaum – modern, privat, vernetzt',
      path: '/projects/k2-familie/willkommen',
    },
  ];

  var demoRowsHtml = demos
    .map(function (d) {
      return (
        '<tr>' +
        '<td style="padding:12px;border:1px solid #ddd5c8;vertical-align:top;width:100px;">' +
        '<img src="' +
        QR(d.path) +
        '" width="88" height="88" alt="QR ' +
        d.title +
        '" style="display:block;border-radius:4px;border:1px solid #ddd5c8;" />' +
        '</td>' +
        '<td style="padding:12px;border:1px solid #ddd5c8;vertical-align:top;">' +
        '<strong style="color:#3d2e1f;font-size:15px;">' +
        d.emoji +
        ' ' +
        d.title +
        '</strong><br/>' +
        '<span style="color:#5c5650;font-size:14px;">' +
        d.desc +
        '</span><br/>' +
        '<a href="' +
        BASE +
        d.path +
        '" style="' +
        link +
        'font-size:13px;">' +
        BASE +
        d.path +
        '</a>' +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var schritte = [
    {
      titel: 'Idee klar machen',
      text: 'Was willst du erreichen? Für wen? Ein Satz reicht – z. B. „Vereinsmitglieder sollen ihre Werke online zeigen.“',
    },
    {
      titel: 'Erstes Bild im Kopf',
      text: 'Wie soll es aussehen, wenn jemand es öffnet? Skizze, Foto, Notiz – Hauptsache sichtbar.',
    },
    {
      titel: 'Werkzeug wählen',
      text: 'Georg nutzt Cursor mit KI-Assistent (Joe). Mac oder PC und Neugier reichen.',
    },
    {
      titel: 'In kleinen Schritten bauen',
      text: 'Ein Bildschirm, ein Button – testen, dann weiter.',
    },
    {
      titel: 'KI führt aus, du entscheidest',
      text: 'Du sagst was du willst – die KI baut. Du prüfst: Passt das?',
    },
    {
      titel: 'Online stellen',
      text: 'Veröffentlichen – dann Handy, Tablet, PC überall erreichbar.',
    },
  ];

  var schritteHtml = schritte
    .map(function (s, i) {
      return (
        '<tr><td style="padding:10px 12px;border:1px solid #ddd5c8;vertical-align:top;width:36px;text-align:center;' +
        'background:#0d7a75;color:#fff;font-weight:700;font-size:14px;border-radius:4px 0 0 4px;">' +
        (i + 1) +
        '</td><td style="padding:10px 12px;border:1px solid #ddd5c8;vertical-align:top;font-size:14px;line-height:1.55;">' +
        '<strong style="color:#3d2e1f;">' +
        s.titel +
        '</strong> ' +
        s.text +
        '</td></tr>'
      );
    })
    .join('');

  var ablauf = [
    ['0:00', 'Willkommen', 'Beispiel-Projekte – als Inspiration, nicht zum Mitmachen.'],
    ['0:10', 'Rundgang', 'Demos per QR oder Link – du siehst, was möglich ist.'],
    ['0:25', 'Leitfaden', 'Die 6 Schritte – Georg erklärt an einem Mini-Beispiel.'],
    ['0:40', 'Live am Mac', 'Georg + Joe: kleine Änderung in Echtzeit.'],
    ['0:55', 'Ehrlichkeit', 'Was gut lief, was schiefging.'],
    ['1:05', 'Deine Idee?', 'Was könntest du bauen? Kein Druck.'],
  ];

  var ablaufHtml = ablauf
    .map(function (row) {
      return (
        '<tr>' +
        '<td style="padding:8px 10px;border:1px solid #c4b8a8;font-weight:600;white-space:nowrap;font-size:13px;">' +
        row[0] +
        '</td>' +
        '<td style="padding:8px 10px;border:1px solid #c4b8a8;font-weight:600;font-size:13px;">' +
        row[1] +
        '</td>' +
        '<td style="padding:8px 10px;border:1px solid #c4b8a8;font-size:13px;line-height:1.5;">' +
        row[2] +
        '</td></tr>'
      );
    })
    .join('');

  var kasten = function (farbe, titel, items) {
    var lis = items.map(function (it) {
      return '<li style="margin-bottom:4px;">' + it + '</li>';
    }).join('');
    return (
      '<div style="background:#fff;border:1px solid #c4b8a8;border-left:4px solid ' +
      farbe +
      ';border-radius:6px;padding:12px 14px;margin:12px 0;">' +
      '<strong style="font-size:14px;color:#3d2e1f;">' +
      titel +
      '</strong>' +
      '<ul style="margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.5;">' +
      lis +
      '</ul></div>'
    );
  };

  var html =
    '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/></head>' +
    '<body style="margin:0;padding:0;background:#f6f2eb;font-family:Georgia,Palatino,serif;color:#1a1816;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2eb;"><tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffefb;border:1px solid #d4c8b8;border-radius:8px;">' +
    '<tr><td style="padding:28px 24px 16px;text-align:center;border-bottom:2px solid #0d7a75;">' +
    '<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0d7a75;">kgm solution · Leitfaden</div>' +
    '<h1 style="margin:8px 0 4px;font-size:22px;color:#2c2419;">Eigenes Projekt entwickeln – mit KI</h1>' +
    '<p style="margin:0;font-size:14px;color:#5c5650;">Georg Kreinecker · Einführung für Freunde</p>' +
    '<p style="margin:8px 0 0;font-size:13px;color:#5c5650;"><strong>Termin:</strong> ______________________ · <strong>Ort:</strong> ______________________</p>' +
    '</td></tr>' +
    '<tr><td style="padding:20px 24px;">' +
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;font-style:italic;border-left:4px solid #0d7a75;padding-left:12px;background:#fff;padding:12px 12px 12px 16px;">' +
    'Georg hat ohne Programmierkenntnisse mehrere digitale Projekte gebaut – mit einem KI-Assistenten. Heute geht es um den Weg: ' +
    '<strong>Wie du aus einer eigenen Idee ein funktionierendes Projekt machen kannst.</strong>' +
    '</p>' +
    '<h2 style="' +
    h2 +
    '">Was Georg als Beispiele zeigt</h2>' +
    '<p style="' +
    pMuted +
    '">Das sind seine Projekte – du kannst etwas völlig anderes bauen. <strong>QR scannen</strong> = Demo am Handy (aktueller Stand im Netz). <strong>Link</strong> = im Browser öffnen.</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 16px;">' +
    demoRowsHtml +
    '</table>' +
    '<div style="background:#fff;border:1px solid #ddd5c8;border-radius:6px;padding:12px 14px;margin:0 0 16px;">' +
    '<strong style="color:#3d2e1f;font-size:15px;">📊 K2 Agentur</strong><br/>' +
    '<span style="color:#5c5650;font-size:14px;line-height:1.5;">Marketing &amp; Kampagnen – Georgs Steuerzentrale für Vermarktung (wird nur kurz erwähnt, kein öffentlicher Demo-Link).</span>' +
    '</div>' +
    '<h2 style="' +
    h2 +
    '">Der Leitfaden – 6 Schritte für dein Projekt</h2>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px;border-collapse:collapse;">' +
    schritteHtml +
    '</table>' +
    '<h2 style="' +
    h2 +
    '">Ablauf heute (ca. 60–75 Minuten)</h2>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px;border-collapse:collapse;">' +
    '<tr><th style="padding:8px 10px;border:1px solid #c4b8a8;background:#ebe6dc;text-align:left;font-size:13px;">Zeit</th>' +
    '<th style="padding:8px 10px;border:1px solid #c4b8a8;background:#ebe6dc;text-align:left;font-size:13px;">Block</th>' +
    '<th style="padding:8px 10px;border:1px solid #c4b8a8;background:#ebe6dc;text-align:left;font-size:13px;">Inhalt</th></tr>' +
    ablaufHtml +
    '</table>' +
    '<h2 style="' +
    h2 +
    '">Was du brauchst – und was nicht</h2>' +
    kasten('#0d7a75', '✅ Reicht zum Start', [
      'Eine Idee, die dich interessiert',
      'Computer (Mac oder Windows)',
      'Geduld und Neugier',
    ]) +
    kasten('#b54a1e', '❌ Nicht nötig', [
      'Programmieren gelernt zu haben',
      'Bei Georgs Projekten mitzuarbeiten',
      'Webdesigner oder teure Agentur',
    ]) +
    '<h2 style="' +
    h2 +
    '">Nach der Einführung</h2>' +
    '<p style="' +
    p +
    '">Ausführlicher Hintergrund: <a href="' +
    BASE +
    '/freunde-erklaerung.html" style="' +
    link +
    '">' +
    BASE +
    '/freunde-erklaerung.html</a></p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 24px 24px;text-align:center;font-size:12px;color:#5c5650;border-top:1px solid #d4c8b8;">' +
    'Georg Kreinecker · kgm solution · Copyright © 2026 kgm solution' +
    '</td></tr></table></td></tr></table></body></html>';

  var textLines = [
    'Eigenes Projekt entwickeln – mit KI',
    'Georg Kreinecker · Einführung für Freunde · kgm solution',
    'Termin: ______________________ · Ort: ______________________',
    '',
    'Georg hat ohne Programmierkenntnisse mehrere digitale Projekte gebaut – mit einem KI-Assistenten.',
    'Heute geht es um den Weg: Wie du aus einer eigenen Idee ein funktionierendes Projekt machen kannst.',
    '',
    '—— Was Georg als Beispiele zeigt ——',
    'QR scannen = Demo am Handy. Link = im Browser öffnen.',
    '',
  ];
  demos.forEach(function (d) {
    textLines.push(d.title + ': ' + d.desc);
    textLines.push('  ' + BASE + d.path);
    textLines.push('');
  });
  textLines.push('K2 Agentur: Marketing & Kampagnen – nur kurz erwähnt, kein Demo-QR.');
  textLines.push('');
  textLines.push('—— Der Leitfaden – 6 Schritte ——');
  schritte.forEach(function (s, i) {
    textLines.push(i + 1 + '. ' + s.titel + ' – ' + s.text);
  });
  textLines.push('');
  textLines.push('—— Ablauf heute (ca. 60–75 Minuten) ——');
  ablauf.forEach(function (row) {
    textLines.push(row[0] + ' · ' + row[1] + ' – ' + row[2]);
  });
  textLines.push('');
  textLines.push('✅ Reicht zum Start: Idee, Computer, Geduld und Neugier');
  textLines.push('❌ Nicht nötig: Programmieren, Mitmachen bei Georg, teure Agentur');
  textLines.push('');
  textLines.push('Nach der Einführung: ' + BASE + '/freunde-erklaerung.html');
  textLines.push('');
  textLines.push('Herzliche Grüße');
  textLines.push('Georg');

  window.SCHULUNG_FREUNDE_MAIL = {
    subject: 'Eigenes Projekt mit KI – Leitfaden von Georg',
    html: html,
    text: textLines.join('\n'),
  };
})();
