// Patch-Skript: ersetzt den alten K2-only Backup-Panel durch den neuen für alle 3 Kontexte
const fs = require('fs');
let content = fs.readFileSync('components/ScreenshotExportAdmin.tsx', 'utf8');

// Finde den Prototyp-Archiv-Text (mit dem schmalen Leerzeichen \u202f vor dem B)
const searchStr = 'Prototyp-Archiv';
const protoPos = content.indexOf(searchStr);
if (protoPos < 0) { console.error('ERROR: Prototyp-Archiv not found'); process.exit(1); }

// Gehe zurück zu "<p style..." 
const pTagStr = '<p style={{ color: s.muted, fontSize:';
let pTagPos = content.lastIndexOf(pTagStr, protoPos);
if (pTagPos < 0) { console.error('ERROR: p tag not found'); process.exit(1); }

console.log('Old section starts at:', pTagPos);

// Finde das Ende: closing tags nach dem Verlauf-Block
// Suche "Verlauf (letzte Backups" Kommentar
const verlaufComment = '{/* Verlauf: letzte Backups */}';
let verlaufPos = content.indexOf(verlaufComment, protoPos);
if (verlaufPos < 0) { console.error('ERROR: Verlauf comment not found'); process.exit(1); }

// Suche das Ende-Pattern: </ul></div>)} </div>)}  </div>)}
// Wir suchen die 3 schließenden Blöcke nach dem <ul> in der Verlauf-Sektion
const ulCloseStr = '</ul>\n                </div>\n              )}\n                </div>\n              )}\n            </div>\n            )}';
let ulClosePos = content.indexOf(ulCloseStr, verlaufPos);
if (ulClosePos < 0) {
  // Alternative - suche das Ende etwas anders
  const altEndStr = '                </div>\n              )}\n            </div>\n            )}';
  ulClosePos = content.indexOf(altEndStr, verlaufPos);
  if (ulClosePos < 0) { 
    console.error('ERROR: End of backup panel not found');
    // Show what comes after verlaufPos
    console.log('After verlauf:', JSON.stringify(content.slice(verlaufPos, verlaufPos + 500)));
    process.exit(1); 
  }
  // Find the actual end including the closing tags
  const sectionEnd = ulClosePos + altEndStr.length;
  console.log('Using alt end at:', sectionEnd);
  
  const oldSection = content.slice(pTagPos, sectionEnd);
  console.log('Old section length:', oldSection.length);
  
  const newSection = buildNewSection();
  content = content.slice(0, pTagPos) + newSection + content.slice(sectionEnd);
  fs.writeFileSync('components/ScreenshotExportAdmin.tsx', content, 'utf8');
  console.log('Done! File length:', content.length);
  return;
}

const sectionEnd = ulClosePos + ulCloseStr.length;
console.log('Section end at:', sectionEnd);
const oldSection = content.slice(pTagPos, sectionEnd);
console.log('Old section length:', oldSection.length);

const newSection = buildNewSection();
content = content.slice(0, pTagPos) + newSection + content.slice(sectionEnd);
fs.writeFileSync('components/ScreenshotExportAdmin.tsx', content, 'utf8');
console.log('Done! File length:', content.length);

function buildNewSection() {
  return `{/* Kontext-Badge */}
              <div style={{
                marginTop: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: \`\${s.accent}18\`,
                borderRadius: '10px',
                border: \`1px solid \${s.accent}33\`
              }}>
                <div style={{ color: s.accent, fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {isVk2AdminContext() ? '\u{1F3DB}\uFE0F VK2 Vereins-Backup' : isOeffentlichAdminContext() ? '\u{1F3A8} \u00f6k2 Demo-Backup' : '\u{1F5BC}\uFE0F K2 Galerie-Backup'}
                </div>
                <div style={{ color: s.muted, fontSize: '0.85rem' }}>
                  {isVk2AdminContext()
                    ? 'Enth\u00e4lt: Vereins-Stammdaten, Vorstand, alle Mitglieder, Events, Design. Komplett wiederherstellbar.'
                    : isOeffentlichAdminContext()
                    ? 'Enth\u00e4lt: Demo-Stammdaten, Demo-Werke, Demo-Events, Demo-Design. Separat von K2 und VK2.'
                    : 'Enth\u00e4lt: Stammdaten (Martina, Georg, Galerie), alle Werke, Events, Dokumente, Kunden, Design.'}
                </div>
              </div>

              <p style={{ color: s.muted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Backup auf backupmicro aufbewahren. Bei Systemchaos: Backup-Datei hochladen \u2013 alles wird wiederhergestellt.
              </p>

              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  setRestoreProgress('running')
                  const reader = new FileReader()
                  reader.onload = () => {
                    try {
                      const raw = reader.result as string
                      const backup = JSON.parse(raw)
                      const kontext = detectBackupKontext(backup)
                      const currentKontext = isVk2AdminContext() ? 'vk2' : isOeffentlichAdminContext() ? 'oeffentlich' : 'k2'
                      if (kontext !== currentKontext && kontext !== 'unbekannt') {
                        const kontextName = kontext === 'vk2' ? 'VK2 Verein' : kontext === 'oeffentlich' ? '\u00f6k2 Demo' : 'K2 Galerie'
                        const currentName = currentKontext === 'vk2' ? 'VK2 Verein' : currentKontext === 'oeffentlich' ? '\u00f6k2 Demo' : 'K2 Galerie'
                        if (!confirm(\`\u26a0\uFE0F Diese Backup-Datei geh\u00f6rt zu \u201e\${kontextName}\u201c, du bist aber gerade in \u201e\${currentName}\u201c.\\n\\nTrotzdem wiederherstellen?\`)) {
                          setRestoreProgress('idle')
                          return
                        }
                      }
                      let ok = false
                      let restored: string[] = []
                      if (kontext === 'vk2') {
                        const r = restoreVk2FromBackup(backup)
                        ok = r.ok; restored = r.restored
                      } else if (kontext === 'oeffentlich') {
                        const r = restoreOek2FromBackup(backup)
                        ok = r.ok; restored = r.restored
                      } else {
                        const r = restoreK2FromBackup(backup)
                        if (r.ok) { ok = true; restored = r.restored }
                        else { ok = restoreFromBackupFile(backup) }
                      }
                      if (!ok) {
                        setRestoreProgress('idle')
                        alert('\u274c Die Datei ist kein g\u00fcltiges Backup (K2, \u00f6k2 oder VK2 Backup erwartet).')
                        return
                      }
                      if (restored.length > 0) console.log('\uD83D\uDCBE Wiederhergestellt:', restored.join(', '))
                      setRestoreProgress('done')
                      setTimeout(() => { if (window.self === window.top) window.location.reload() }, 800)
                    } catch (err) {
                      setRestoreProgress('idle')
                      alert('\u274c Datei konnte nicht gelesen werden: ' + (err instanceof Error ? err.message : String(err)))
                    }
                  }
                  reader.onerror = () => {
                    setRestoreProgress('idle')
                    alert('\u274c Datei konnte nicht gelesen werden.')
                  }
                  reader.readAsText(file, 'UTF-8')
                }}
              />

              {restoreProgress !== 'idle' && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: '1px solid rgba(95, 251, 241, 0.3)'
                }}>
                  <div style={{ color: s.accent, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    {restoreProgress === 'running' ? 'Wiederherstellung l\u00e4uft\u2026' : 'Fertig. Lade neu\u2026'}
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: restoreProgress === 'done' ? '100%' : undefined,
                      background: 'linear-gradient(90deg, #5ffbf1, #33a1ff)',
                      borderRadius: '4px',
                      transition: restoreProgress === 'done' ? 'width 0.3s ease' : 'none',
                      animation: restoreProgress === 'running' ? 'backup-progress-pulse 1s ease-in-out infinite' : 'none'
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    try {
                      if (isVk2AdminContext()) {
                        const result = createVk2Backup()
                        const m = (() => { try { return JSON.parse(localStorage.getItem('k2-vk2-stammdaten') || '{}') } catch { return {} } })()
                        const mitglieder = Array.isArray(m.mitglieder) ? m.mitglieder.length : 0
                        downloadBackupAsFile(result.data, result.filename)
                        alert(\`\u2705 VK2 Vereins-Backup heruntergeladen.\\n\\nEnth\u00e4lt: Vereins-Stammdaten, Vorstand, \${mitglieder} Mitglieder, Events, Design.\\n\\nAuf backupmicro speichern!\`)
                      } else if (isOeffentlichAdminContext()) {
                        const result = createOek2Backup()
                        downloadBackupAsFile(result.data, result.filename)
                        alert(\`\u2705 \u00f6k2 Demo-Backup heruntergeladen.\\n\\nEnth\u00e4lt: Demo-Stammdaten, Demo-Werke, Demo-Events, Demo-Design.\\n\\nAuf backupmicro speichern!\`)
                      } else {
                        const result = createK2Backup()
                        downloadBackupAsFile(result.data, result.filename)
                        const artworks = (() => { try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch { return [] } })()
                        alert(\`\u2705 K2 Galerie-Backup heruntergeladen.\\n\\nEnth\u00e4lt: Stammdaten, \${Array.isArray(artworks) ? artworks.length : 0} Werke, Events, Dokumente, Design.\\n\\nAuf backupmicro speichern!\`)
                      }
                    } catch (e) {
                      alert('Fehler beim Erstellen des Backups: ' + (e instanceof Error ? e.message : String(e)))
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: s.bgElevated,
                    border: \`1px solid \${s.accent}33\`,
                    borderRadius: '10px',
                    color: s.text,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  \uD83D\uDCBE Backup herunterladen
                </button>

                <button
                  type="button"
                  disabled={restoreProgress !== 'idle'}
                  onClick={() => backupFileInputRef.current?.click()}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: s.bgElevated,
                    border: \`1px solid \${s.accent}33\`,
                    borderRadius: '10px',
                    color: s.text,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  \uD83D\uDCC2 Aus Backup-Datei wiederherstellen
                </button>

                {!isOeffentlichAdminContext() && !isVk2AdminContext() && hasBackup() && (
                  <button
                    disabled={restoreProgress !== 'idle'}
                    onClick={() => {
                      if (!confirm('Alle aktuellen Daten mit dem letzten Auto-Backup \u00fcberschreiben? Die Seite wird danach neu geladen.')) return
                      setRestoreProgress('running')
                      requestAnimationFrame(() => {
                        const ok = restoreFromBackup()
                        if (!ok) {
                          setRestoreProgress('idle')
                          alert('\u274c Kein Backup gefunden oder Fehler.')
                          return
                        }
                        setRestoreProgress('done')
                        setTimeout(() => { if (window.self === window.top) window.location.reload() }, 800)
                      })
                    }}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: \`\${s.accent}20\`,
                      border: \`1px solid \${s.accent}66\`,
                      borderRadius: '10px',
                      color: s.accent,
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    \uD83D\uDD04 Aus letztem Auto-Backup wiederherstellen
                    {getBackupTimestamp() && (
                      <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9, marginTop: '0.2rem' }}>
                        Backup: {new Date(getBackupTimestamp()!).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </button>
                )}

                {!isOeffentlichAdminContext() && !isVk2AdminContext() && !hasBackup() && (
                  <span style={{ color: s.muted, fontSize: '0.9rem' }}>
                    Kein Auto-Backup im Browser. Backup-Datei von backupmicro hochladen.
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const freed = tryFreeLocalStorageSpace()
                    if (freed > 0) {
                      alert(\`\u2705 Speicher freigegeben: ca. \${(freed / 1024).toFixed(0)} KB.\\n\\nDas lokale Auto-Backup wurde entfernt. Backup-Datei von backupmicro zum Wiederherstellen nutzen.\`)
                    } else {
                      alert('Kein lokales Auto-Backup im Speicher (oder bereits gel\u00f6scht).')
                    }
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    background: s.bgElevated,
                    border: \`1px solid \${s.accent}33\`,
                    borderRadius: '8px',
                    color: s.text,
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  title="Entfernt das im Browser gespeicherte Auto-Backup"
                >
                  \uD83D\uDD13 Speicher freigeben
                </button>
              </div>

              {!isOeffentlichAdminContext() && !isVk2AdminContext() && backupTimestamps.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: \`1px solid \${s.accent}22\` }}>
                  <div style={{ fontSize: '0.85rem', color: s.muted, marginBottom: '0.5rem' }}>Auto-Backup Verlauf (neueste zuerst)</div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                    color: s.text,
                    lineHeight: '1.5'
                  }}>
                    {backupTimestamps.map((iso, i) => (
                      <li key={iso + i}>
                        {new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                </div>
              )}
            </div>
            )}`;
}
