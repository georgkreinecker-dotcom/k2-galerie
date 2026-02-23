// Patch v3: Mitgliederlisten-Druck für VK2 (ersetzt Etiketten-Button sauber)
const fs = require('fs');
let c = fs.readFileSync('components/ScreenshotExportAdmin.tsx', 'utf8');
const lines = c.split('\n');

// Verify correct position
const line8762 = lines[8761]; // 0-indexed
if (!line8762 || !line8762.includes("display: 'flex', flexDirection: 'column', gap: '0.3rem'")) {
  console.error('WRONG POSITION at 8762! Found:', (line8762 || '').slice(0, 80));
  process.exit(1);
}

// Replace lines 8762-8796 (1-indexed), 0-indexed: 8761 to 8795 (inclusive)
const startIdx = 8761;
const endIdx = 8796; // exclusive

const PS = "{{ padding: '0.6rem 1.1rem', background: s.bgElevated, color: s.text, border: `1px solid ${s.accent}44`, borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}";

const newLines = `                {isVk2AdminContext() ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const vereinsName = vk2Stammdaten.verein?.name || 'Verein'
                          const datum = new Date().toLocaleDateString('de-AT')
                          const rows = mitglieder.map((m, i) =>
                            '<tr><td>' + (i+1) + '</td><td>' + (m.name||'') + '</td><td>' + (m.typ||'') +
                            '</td><td>' + (m.email||'') + '</td><td>' + (m.phone||'') +
                            '</td><td>' + (m.seit||m.eintrittsdatum||'') + '</td></tr>'
                          ).join('')
                          const html = ['<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">',
                            '<title>Mitgliederliste</title><style>',
                            'body{font-family:Arial,sans-serif;padding:2cm;color:#111}',
                            'h1{font-size:1.4rem;margin-bottom:0.5rem}',
                            'table{width:100%;border-collapse:collapse;font-size:0.82rem}',
                            'th{background:#333;color:#fff;padding:0.5rem 0.75rem;text-align:left}',
                            'td{padding:0.45rem 0.75rem;border-bottom:1px solid #ddd}',
                            'tr:nth-child(even) td{background:#f9f9f9}',
                            '@media print{button{display:none}}</style></head><body>',
                            '<h1>Vereinsmitglieder \u2013 ' + vereinsName + '</h1>',
                            '<p style="font-size:0.8rem;color:#666">Stand: ' + datum + ' | ' + mitglieder.length + ' Mitglieder</p>',
                            '<table><thead><tr><th>#</th><th>Name</th><th>Kunstbereich</th>',
                            '<th>E-Mail</th><th>Telefon</th><th>Mitglied seit</th></tr></thead>',
                            '<tbody>' + rows + '</tbody></table></body></html>'
                          ].join('')
                          const w = window.open('', '_blank')
                          if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400) }
                        }}
                        style=${PS}
                      >
                        \uD83D\uDDB8\uFE0F Mitgliederliste drucken
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const vereinsName = vk2Stammdaten.verein?.name || 'Verein'
                          const datum = new Date().toLocaleDateString('de-AT')
                          const karten = mitglieder.map(m => {
                            const adr = [m.strasse, m.plz && m.ort ? m.plz + ' ' + m.ort : (m.ort || '')].filter(Boolean).join(', ')
                            return '<div class="karte">' +
                              '<div class="name">' + (m.name||'') + '</div>' +
                              (adr ? '<div class="detail">' + adr + '</div>' : '') +
                              (m.email || m.phone ? '<div class="detail">' + (m.email||'') + (m.phone ? ' | '+m.phone : '') + '</div>' : '') +
                              '<div class="detail">' + (m.typ||'') + (m.seit||m.eintrittsdatum ? ' | Mitgl. seit '+(m.seit||m.eintrittsdatum) : '') + '</div></div>'
                          }).join('')
                          const html = ['<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">',
                            '<title>Adressliste</title><style>',
                            'body{font-family:Arial,sans-serif;padding:2cm;color:#111}',
                            'h1{font-size:1.4rem;margin-bottom:0.5rem}',
                            '.karte{border:1px solid #ddd;border-radius:6px;padding:0.65rem 0.9rem;margin-bottom:0.6rem;break-inside:avoid}',
                            '.name{font-weight:700;font-size:0.95rem}.detail{font-size:0.8rem;color:#444;margin-top:0.2rem}',
                            '@media print{button{display:none}}</style></head><body>',
                            '<h1>Adressliste \u2013 ' + vereinsName + '</h1>',
                            '<p style="font-size:0.8rem;color:#666">Stand: ' + datum + '</p>',
                            karten, '</body></html>'
                          ].join('')
                          const w = window.open('', '_blank')
                          if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400) }
                        }}
                        style=${PS}
                      >
                        \uD83D\uDCCB Adressliste drucken
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const header = 'Name;Kunstbereich;E-Mail;Telefon;Adresse;PLZ;Ort;Mitglied seit;Lizenz'
                          const csvRows = mitglieder.map(m =>
                            [m.name,m.typ||'',m.email||'',m.phone||'',m.strasse||'',m.plz||'',m.ort||'',m.seit||m.eintrittsdatum||'',m.lizenz||'']
                              .map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')
                          )
                          const csv = [header, ...csvRows].join('\n')
                          const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'mitglieder-' + new Date().toISOString().slice(0,10) + '.csv'
                          a.style.display = 'none'
                          document.body.appendChild(a)
                          a.click()
                          setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)
                        }}
                        style=${PS}
                      >
                        \uD83D\uDCE5 CSV-Export
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedForBatchPrint.size > 0) {
                          handleBatchPrintEtiketten()
                        } else {
                          alert('Hakerl bei den Werken setzen (\u201eEtikett drucken\u201c), dann auf diesen Button klicken.')
                        }
                      }}
                      style={{
                        padding: '0.7rem 1.2rem',
                        background: selectedForBatchPrint.size > 0 ? s.bgElevated : 'transparent',
                        color: selectedForBatchPrint.size > 0 ? s.text : s.muted,
                        border: \`1px solid \${selectedForBatchPrint.size > 0 ? s.accent + '44' : s.muted + '44'}\`,
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: selectedForBatchPrint.size > 0 ? 600 : 400,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = \`\${s.accent}66\` }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = selectedForBatchPrint.size > 0 ? \`\${s.accent}44\` : \`\${s.muted}44\` }}
                    >
                      \uD83D\uDDB8\uFE0F Etiketten drucken{selectedForBatchPrint.size > 0 ? \` (\${selectedForBatchPrint.size} ausgew\u00e4hlt)\` : ''}
                    </button>
                    {selectedForBatchPrint.size === 0 && (
                      <span style={{ fontSize: '0.72rem', color: s.muted, paddingLeft: '0.2rem' }}>
                        \u2192 Hakerl bei Werken setzen, dann hier drucken
                      </span>
                    )}
                  </div>
                )}`;

const result = [
  ...lines.slice(0, startIdx),
  ...newLines.split('\n'),
  ...lines.slice(endIdx),
];

fs.writeFileSync('components/ScreenshotExportAdmin.tsx', result.join('\n'), 'utf8');
console.log('Done, lines:', result.length, 'chars:', result.join('\n').length);
