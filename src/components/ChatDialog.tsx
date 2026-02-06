import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

type Message = { role: 'user' | 'ai'; content: string; imageDataUrl?: string }

type Props = { standalone?: boolean }

export default function ChatDialog({ standalone = false }: Props) {
  const [searchParams] = useSearchParams()
  const openByDefault = searchParams.get('chat') === 'open' || standalone
  const [open, setOpen] = useState(openByDefault)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  const isElectron = typeof window !== 'undefined' && !!(window as unknown as { electronAPI?: { getApiKey: () => Promise<string | null>; setApiKey: (k: string) => Promise<void> } }).electronAPI
  const [apiKey, setApiKeyState] = useState('')
  const [apiKeyLoaded, setApiKeyLoaded] = useState(!isElectron)

  useEffect(() => {
    if (!isElectron) {
      setApiKeyState(localStorage.getItem('k2-control-openai-key') || '')
      setApiKeyLoaded(true)
      return
    }
    const api = (window as unknown as { electronAPI: { getApiKey: () => Promise<string | null> } }).electronAPI
    api.getApiKey().then((k) => {
      setApiKeyState(k || '')
      setApiKeyLoaded(true)
    })
  }, [isElectron])

  const saveApiKey = (key: string) => {
    if (isElectron) {
      (window as unknown as { electronAPI: { setApiKey: (k: string) => Promise<void> } }).electronAPI.setApiKey(key).then(() => setApiKeyState(key.trim()))
    } else {
      localStorage.setItem('k2-control-openai-key', key)
      setApiKeyState(key)
    }
  }

  const sendMessage = async (text: string, imageDataUrl?: string) => {
    if (!text.trim() && !imageDataUrl) return
    if (!apiKey) {
      setMessages((m) => [...m, { role: 'ai', content: isElectron ? 'Bitte unten deinen OpenAI API-Key eintragen.' : 'Bitte zuerst im Control-Studio deinen OpenAI API-Key eintragen.' }])
      return
    }
    const displayText = text.trim() || (imageDataUrl ? '[Bild angehängt]' : '')
    setMessages((m) => [...m, { role: 'user', content: displayText, imageDataUrl }])
    setInput('')
    setLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000)
    try {
      const userContent: { type: string; text?: string; image_url?: { url: string } }[] = []
      if (text.trim()) userContent.push({ type: 'text', text: text.trim() })
      if (imageDataUrl) userContent.push({ type: 'image_url', image_url: { url: imageDataUrl } })
      const userMsg = userContent.length === 1 && userContent[0].type === 'text'
        ? userContent[0].text!
        : userContent
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.6,
          messages: [
            { role: 'system', content: 'Du bist der KI-Assistent für die K2 Galerie. Antworte kurz und hilfreich auf Deutsch. Bei Bildern beschreibe, was du siehst.' },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg },
          ],
        }),
      })
      clearTimeout(timeoutId)
      const data = await res.json()
      if (!res.ok) {
        const errMsg = (data?.error?.message || data?.error?.code || res.status) as string
        setMessages((m) => [...m, { role: 'ai', content: 'API-Fehler: ' + errMsg }])
        return
      }
      const reply = data?.choices?.[0]?.message?.content ?? 'Keine Antwort.'
      setMessages((m) => [...m, { role: 'ai', content: reply }])
      const usage = data?.usage
      if (usage?.prompt_tokens != null || usage?.completion_tokens != null) {
        const { addUsage } = await import('../utils/openaiUsage')
        addUsage(usage.prompt_tokens || 0, usage.completion_tokens || 0)
      }
    } catch (e) {
      clearTimeout(timeoutId)
      const msg = e instanceof Error ? e.message : 'Verbindungsproblem'
      setMessages((m) => [...m, { role: 'ai', content: msg === 'The user aborted a request.' ? 'Zeitüberschreitung (45 s). Bitte erneut versuchen.' : 'Fehler: ' + msg }])
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('chat-drop-active')
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve) => {
          const r = new FileReader()
          r.onload = () => resolve((r.result as string) || '')
          r.readAsDataURL(file)
        })
        if (dataUrl) void sendMessage(input || 'Was siehst du auf diesem Bild?', dataUrl)
      } else {
        setMessages((m) => [...m, { role: 'user', content: `📎 ${file.name}` }])
        setInput('')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add('chat-drop-active')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('chat-drop-active')
  }

  const startListening = () => {
    const SR = (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition
    if (!SR) {
      setMessages((m) => [...m, { role: 'ai', content: 'Spracheingabe wird in diesem Browser nicht unterstützt.' }])
      return
    }
    const rec = new (SR as new () => { stop: () => void; start: () => void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null })()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'de-DE'
    rec.onresult = (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => {
      const t = e.results[0][0].transcript
      setInput(t)
      void sendMessage(t)
    }
    rec.onend = () => setListening(false)
    rec.start()
    setListening(true)
    recognitionRef.current = rec
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  return (
    <>
      {!standalone && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setOpen(!open)}
          title="Mit KI chatten"
        >
          💬
        </button>
      )}
      {open && (
        <div className={`chat-dialog ${standalone ? 'chat-dialog-standalone' : ''}`}>
          <div className="chat-dialog-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <span style={{ fontWeight: 600 }}>KI-Assistent</span>
            </div>
            {!standalone && (
              <button type="button" className="chat-close" onClick={() => setOpen(false)}>×</button>
            )}
          </div>
          {apiKeyLoaded && !apiKey && isElectron && (
            <div className="chat-api-key-row">
              <input
                type="password"
                placeholder="🔑 API-Key eingeben..."
                className="chat-api-key-input"
                id="chat-api-key-input"
              />
              <button type="button" className="chat-api-key-btn" onClick={() => {
                const t = (document.getElementById('chat-api-key-input') as HTMLInputElement)?.value?.trim()
                if (t) saveApiKey(t)
              }}>
                Speichern
              </button>
            </div>
          )}
          <div
            className="chat-messages chat-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {messages.length === 0 && (
              <div className="chat-hint">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Hallo!</div>
                <div style={{ color: '#8fa0c9', fontSize: '0.9rem' }}>Wie kann ich dir helfen?</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.imageDataUrl && <img src={m.imageDataUrl} alt="" className="chat-msg-img" />}
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-loading">
                  <span>✨</span>
                  <span>Denke nach</span>
                  <span className="loading-dots">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={apiKey ? 'Schreibe etwas...' : '🔑 API-Key benötigt'}
            />
            <button
              type="button"
              className={`mic-btn ${listening ? 'active' : ''}`}
              onClick={listening ? stopListening : startListening}
              title="Sprechen"
            >
              🎤
            </button>
            <button type="button" className="send-btn" onClick={() => sendMessage(input)}>
              Senden
            </button>
          </div>
        </div>
      )}
    </>
  )
}
