import { useMemo, useState } from 'react'
import { usePersistentBoolean, usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'

type ChatMessage = { role: 'user' | 'ai'; content: string }

const quickPrompts = [
  'Erstelle eine Launch-Checkliste für April (Hybrid-Eröffnung).',
  'Schreibe 5 Social-Media-Post-Ideen für die Galerie.',
  'Formuliere einen Presse-Text für die Eröffnung.',
]

type ControlTab = 'kasse' | 'galerie' | 'verkaufe' | 'archiv' | 'events' | 'einstellungen'

const ControlStudioPage = () => {
  const [activeTab, setActiveTab] = useState<ControlTab>('galerie')
  const [galleryName, setGalleryName] = usePersistentString('k2-control-gallery')
  const [launchDate, setLaunchDate] = usePersistentString('k2-control-launch-date')
  const [team, setTeam] = usePersistentString('k2-control-team', 'Georg & Martina')
  const [audience, setAudience] = usePersistentString('k2-control-audience')
  const [description, setDescription] = usePersistentString('k2-control-description')

  const [g1, setG1] = usePersistentBoolean('k2-control-g1')
  const [g2, setG2] = usePersistentBoolean('k2-control-g2')
  const [g3, setG3] = usePersistentBoolean('k2-control-g3')
  const [g4, setG4] = usePersistentBoolean('k2-control-g4')
  const [gNotes, setGNotes] = usePersistentString('k2-control-g-notes')

  const [m1, setM1] = usePersistentBoolean('k2-control-m1')
  const [m2, setM2] = usePersistentBoolean('k2-control-m2')
  const [m3, setM3] = usePersistentBoolean('k2-control-m3')
  const [m4, setM4] = usePersistentBoolean('k2-control-m4')
  const [mNotes, setMNotes] = usePersistentString('k2-control-m-notes')

  const [c1, setC1] = usePersistentBoolean('k2-control-c1')
  const [c2, setC2] = usePersistentBoolean('k2-control-c2')
  const [c3, setC3] = usePersistentBoolean('k2-control-c3')
  const [c4, setC4] = usePersistentBoolean('k2-control-c4')
  const [cNotes, setCNotes] = usePersistentString('k2-control-c-notes')

  const [apiKey, setApiKey] = usePersistentString('k2-control-openai-key')
  const [model, setModel] = usePersistentString('k2-control-model', 'gpt-4o-mini')
  const [tone, setTone] = usePersistentString('k2-control-tone', 'klar')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const context = useMemo(
    () => ({
      galleryName,
      launchDate,
      team,
      audience,
      description,
      tasks: {
        galerie: { g1, g2, g3, g4 },
        marketing: { m1, m2, m3, m4 },
        control: { c1, c2, c3, c4 },
      },
    }),
    [galleryName, launchDate, team, audience, description, g1, g2, g3, g4, m1, m2, m3, m4, c1, c2, c3, c4]
  )

  const sendMessage = async (text: string) => {
    if (!apiKey) {
      alert('Bitte OpenAI API-Key eintragen.')
      return
    }
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: tone === 'kreativ' ? 0.8 : tone === 'freundlich' ? 0.6 : 0.4,
          messages: [
            {
              role: 'system',
              content:
                'Du bist der KI-Agent für das K2 Control-Studio. Gib klare, umsetzbare Schritte für Nicht-Programmierer. Kontext: ' +
                JSON.stringify(context),
            },
            { role: 'user', content: text },
          ],
        }),
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        const raw = await res.text()
        let errMsg: string = raw || String(res.status)
        try {
          const d = JSON.parse(raw)
          errMsg = d?.error?.message || d?.error?.code || errMsg
        } catch { /* use raw */ }
        setMessages((prev) => [...prev, { role: 'ai', content: `Fehler: ${errMsg}` }])
        return
      }
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content ?? 'Keine Antwort erhalten.'
      setMessages((prev) => [...prev, { role: 'ai', content: reply }])
      const usage = data?.usage
      if (usage?.prompt_tokens != null || usage?.completion_tokens != null) {
        const { addUsage } = await import('../utils/openaiUsage')
        addUsage(usage.prompt_tokens || 0, usage.completion_tokens || 0)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
      const text = message === 'The user aborted a request.' ? 'Zeitüberschreitung (45 s). Bitte erneut versuchen.' : message
      setMessages((prev) => [...prev, { role: 'ai', content: `Fehler: ${text}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')
    void sendMessage(text)
  }

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header className="control-header">
          <div>
            <h1>Control-Studio</h1>
            <div className="meta">Galerie + Marketing + Betrieb – mit integriertem KI-Agenten</div>
          </div>
          <ProjectNavButton projectId="k2-galerie" />
        </header>

        <nav className="control-tabs">
          {(['kasse', 'galerie', 'verkaufe', 'archiv', 'events', 'einstellungen'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'kasse' && 'Kasse'}
              {tab === 'galerie' && 'Galerie'}
              {tab === 'verkaufe' && 'Verkäufe'}
              {tab === 'archiv' && 'Archiv'}
              {tab === 'events' && 'Events'}
              {tab === 'einstellungen' && 'Einstellungen'}
            </button>
          ))}
        </nav>

        <div className="control-grid">
          <div className="control-stack">
            {activeTab === 'kasse' && (
              <div className="card">
                <h2>Kasse</h2>
                <p className="meta">Kassasystem und Vor-Ort-Verkauf – folgt in Kürze.</p>
              </div>
            )}
            {activeTab === 'archiv' && (
              <div className="card">
                <h2>Verkaufshistorie – Archiv</h2>
                <p className="meta">Alle verkauften Kunstwerke im Archiv.</p>
                <div className="stat-row">
                  <span>0 Verkauft</span>
                  <span>0 Malerei</span>
                  <span>0 Keramik</span>
                  <span>€0.00 Gesamtumsatz</span>
                </div>
                <input type="text" placeholder="Suche nach Titel, Beschreibung oder Produktnummer..." className="search-input" />
                <p className="meta">Noch keine Verkäufe</p>
              </div>
            )}
            {activeTab === 'events' && (
              <div className="card">
                <h2>Events</h2>
                <p className="meta">Event-Planer – folgt in Kürze.</p>
              </div>
            )}
            {activeTab === 'einstellungen' && (
              <div className="card">
                <h2>Einstellungen</h2>
                <p className="meta">Galerie-Einstellungen – folgt in Kürze.</p>
              </div>
            )}
            {activeTab === 'galerie' && (
              <>
            <div className="card">
              <h2>Projekt-Rahmen</h2>
              <div className="form-grid">
                <div className="field">
                  <label>Galerie-Name</label>
                  <input
                    type="text"
                    value={galleryName}
                    onChange={(event) => setGalleryName(event.target.value)}
                    placeholder="z. B. K2 Galerie"
                  />
                </div>
                <div className="field">
                  <label>Eröffnung (Ziel)</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(event) => setLaunchDate(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Team</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(event) => setTeam(event.target.value)}
                    placeholder="Georg & Martina"
                  />
                </div>
                <div className="field">
                  <label>Zielgruppe</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder="Kunst- & Keramik-Interessierte"
                  />
                </div>
              </div>
              <label className="field">
                Projektbeschreibung (1–3 Sätze)
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Kurze Beschreibung der Galerie..."
                />
              </label>
            </div>

            <div className="card">
              <h2>1) Galerie (Hybrid-Launch im April)</h2>
              <label className="task">
                <input type="checkbox" checked={g1} onChange={(event) => setG1(event.target.checked)} />
                <span>Website ist live & erreichbar</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={g2} onChange={(event) => setG2(event.target.checked)} />
                <span>Grundinhalte vorhanden (Künstler, Werke, Texte)</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={g3} onChange={(event) => setG3(event.target.checked)} />
                <span>Öffnungszeiten/Ort für reale Eröffnung fixiert</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={g4} onChange={(event) => setG4(event.target.checked)} />
                <span>Presse/Einladung vorbereitet</span>
              </label>
              <textarea
                className="notes"
                value={gNotes}
                onChange={(event) => setGNotes(event.target.value)}
                placeholder="Notizen zur Galerie…"
              />
            </div>

            <div className="card">
              <h2>2) Marketing-Konzept (Technik + Design)</h2>
              <label className="task">
                <input type="checkbox" checked={m1} onChange={(event) => setM1(event.target.checked)} />
                <span>Branding/Design final (Farben, Logo, Stil)</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={m2} onChange={(event) => setM2(event.target.checked)} />
                <span>Social-Media-Plan erstellt (2–4 Wochen)</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={m3} onChange={(event) => setM3(event.target.checked)} />
                <span>Kampagnen-Landingpage geprüft</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={m4} onChange={(event) => setM4(event.target.checked)} />
                <span>Presse- & Partnerliste vorhanden</span>
              </label>
              <textarea
                className="notes"
                value={mNotes}
                onChange={(event) => setMNotes(event.target.value)}
                placeholder="Notizen zum Marketing…"
              />
            </div>

            <div className="card">
              <h2>3) Control-Studio (Betrieb & Verwaltung)</h2>
              <label className="task">
                <input type="checkbox" checked={c1} onChange={(event) => setC1(event.target.checked)} />
                <span>Admin-Zugang getestet</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={c2} onChange={(event) => setC2(event.target.checked)} />
                <span>Upload-Prozess für Bilder klar</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={c3} onChange={(event) => setC3(event.target.checked)} />
                <span>Backups funktionieren</span>
              </label>
              <label className="task">
                <input type="checkbox" checked={c4} onChange={(event) => setC4(event.target.checked)} />
                <span>Verkauf/Bezahlung getestet (z. B. SumUp)</span>
              </label>
              <textarea
                className="notes"
                value={cNotes}
                onChange={(event) => setCNotes(event.target.value)}
                placeholder="Notizen zum Betrieb…"
              />
            </div>
              </>
            )}
            {activeTab === 'verkaufe' && (
              <div className="card">
                <h2>Verkäufe</h2>
                <p className="meta">Aktive Verkäufe – folgt in Kürze.</p>
              </div>
            )}
          </div>

          <aside className="card chat-panel">
            <h2>KI-Agent (OpenAI)</h2>
            <p className="meta">Dein Schlüssel bleibt lokal im Browser gespeichert.</p>
            <label className="field">
              OpenAI API-Key
              <input
                type="text"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
              />
            </label>
            {apiKey && (
              <p className="meta" style={{ marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    const blob = new Blob([apiKey], { type: 'text/plain' })
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(blob)
                    a.download = 'openai-key.txt'
                    a.click()
                    URL.revokeObjectURL(a.href)
                  }}
                >
                  Key für K2 Dialog (Desktop) herunterladen
                </button>
                — Speichere die Datei als <code style={{ fontSize: '0.85em' }}>~/.k2-galerie/openai-key.txt</code>, dann nutzt die Desktop-App denselben Key.
              </p>
            )}
            <div className="form-grid compact">
              <label className="field">
                Modell
                <select value={model} onChange={(event) => setModel(event.target.value)}>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                </select>
              </label>
              <label className="field">
                Ton
                <select value={tone} onChange={(event) => setTone(event.target.value)}>
                  <option value="klar">Klar & kurz</option>
                  <option value="freundlich">Freundlich</option>
                  <option value="kreativ">Kreativ</option>
                </select>
              </label>
            </div>

            <div className="quick-prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" className="ghost-btn" key={prompt} onClick={() => void sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chat-log">
              {messages.length === 0 && <div className="meta">Noch keine Nachrichten.</div>}
              {messages.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={`chat-msg ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {loading && <div className="chat-msg ai">Denke nach …</div>}
            </div>

            <div className="chat-input">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Schreibe eine Frage oder Aufgabe..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button type="button" className="btn" onClick={handleSend} disabled={loading}>
                Senden
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default ControlStudioPage
