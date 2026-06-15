/**
 * E-Mail-Versand für Schulung Freunde – eine Quelle für .eml (Sportwagenmodus).
 * Nutzt schulung-freunde-mail-inhalt.js für HTML + Plaintext.
 */
(function () {
  var SUBJECT = 'Eigenes Projekt mit KI – Leitfaden von Georg';

  function buildEml(toEmail, html, text) {
    var subject =
      (window.SCHULUNG_FREUNDE_MAIL && window.SCHULUNG_FREUNDE_MAIL.subject) || SUBJECT;
    var boundary =
      '----=_K2Schulung_' +
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2));
    var crlf = '\r\n';
    var norm = function (s) {
      return s.replace(/\r\n/g, '\n').split('\n').join(crlf);
    };
    return [
      'From: "Georg Kreinecker" <georg.kreinecker@kgm.at>',
      'To: ' + (toEmail || 'freund@beispiel.at'),
      'Subject: ' + subject,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="' + boundary + '"',
      '',
      '--' + boundary,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      norm(text),
      '',
      '--' + boundary,
      'Content-Type: text/html; charset=UTF-8',
      '',
      norm(html),
      '',
      '--' + boundary + '--',
      '',
    ].join(crlf);
  }

  window.downloadSchulungFreundeEml = function (toEmail) {
    if (!window.SCHULUNG_FREUNDE_MAIL) {
      alert('Mail-Inhalt noch nicht geladen – bitte E-Mail-Seite öffnen.');
      return;
    }
    var pkg = window.SCHULUNG_FREUNDE_MAIL;
    var eml = buildEml(toEmail, pkg.html, pkg.text);
    var blob = new Blob([eml], { type: 'message/rfc822' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Leitfaden-eigenes-Projekt-KI.eml';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };
})();
