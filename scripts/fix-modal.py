#!/usr/bin/env python3

with open('components/ScreenshotExportAdmin.tsx', encoding='utf-8') as f:
    content = f.read()

# Finde das Modal-Start
start_marker = '      {/* Modal: Fehlermeldung Ver\u00f6ffentlichen \u2013 mit Kopieren-Button f\u00fcr Mobile \u2192 Cursor schicken */}'
end_marker = '      {/* Modal: Neues Werk hinzuf\u00fcgen'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print('Start-Marker nicht gefunden')
    # Suche alternativ
    alt = '{/* Modal: Fehlermeldung'
    idx = content.find(alt)
    print(f'Alt-Suche: {idx}')
    if idx >= 0:
        print(repr(content[idx:idx+100]))
elif end_idx == -1:
    print('End-Marker nicht gefunden')
else:
    print(f'Modal gefunden: Start={start_idx}, End={end_idx}')
    new_modal = '''      {/* Modal: Fehlermeldung Speichern \u2013 einfach, klar, kein Techniker-Jargon */}
      {publishErrorMsg && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998, padding: '1rem' }}
          onClick={() => setPublishErrorMsg(null)}
        >
          <div
            style={{ background: '#1a1d24', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2rem', textAlign: 'center' }}>\u26a0\ufe0f</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', textAlign: 'center' }}>Speichern nicht m\u00f6glich</div>
            <div style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.6, textAlign: 'center' }}>
              Bitte nochmal auf <strong>\u201eSpeichern\u201c</strong> klicken.<br/>
              Falls es wieder nicht klappt: Dem Assistenten kurz Bescheid geben.
            </div>
            <button
              onClick={() => setPublishErrorMsg(null)}
              style={{ padding: '0.75rem 2rem', background: '#f59e0b', color: '#1a1d24', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'center' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      '''
    content = content[:start_idx] + new_modal + content[end_idx:]
    with open('components/ScreenshotExportAdmin.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Modal ersetzt und Datei gespeichert.')
