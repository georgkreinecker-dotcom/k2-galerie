/**
 * Neuer Kassausgang: 3 Optionen – Bar privat, Bar an Bank, Bar mit Beleg (QR/Foto).
 * Nach Auswahl: Formular (Betrag, Datum, Verwendungszweck) bzw. zuerst Beleg erfassen.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import jsQR from 'jsqr'
import { PROJECT_ROUTES } from '../config/navigation'
import { addKassabuchEintrag, getKassabuchArtLabel, hasKassabuchVoll, type KassabuchArt } from '../utils/kassabuchStorage'

const s = {
  bg: '#f8f7f5',
  card: '#ffffff',
  accent: '#7a3b1e',
  text: '#1c1a17',
  muted: '#7a6f66',
  radius: '14px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}

function getTenant(location: ReturnType<typeof useLocation>): 'k2' | 'oeffentlich' {
  const state = location.state as { fromOeffentlich?: boolean } | null
  if (state?.fromOeffentlich === true) return 'oeffentlich'
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich') return 'oeffentlich'
  return 'k2'
}

type Step = 'choose' | 'form' | 'beleg'

export default function KassausgangPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const tenant = getTenant(location)
  const kassabuchVoll = hasKassabuchVoll(tenant)
  const [step, setStep] = useState<Step>('choose')
  const [art, setArt] = useState<KassabuchArt>('bar_privat')
  const [bankRichtung, setBankRichtung] = useState<'kassa_an_bank' | 'bank_an_kassa'>('kassa_an_bank')
  const [betrag, setBetrag] = useState('')
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10))
  const [verwendungszweck, setVerwendungszweck] = useState('')
  const [belegImage, setBelegImage] = useState<string | null>(null)
  const [belegQrText, setBelegQrText] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Kamera für QR-Scan (wie ShopPage)
  useEffect(() => {
    if (!showScanner) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
      return
    }
    let cancelled = false
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
        intervalRef.current = setInterval(() => {
          const video = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas || video.readyState < 2) return
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(video, 0, 0)
          try {
            if ('BarcodeDetector' in window) {
              const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: HTMLCanvasElement) => Promise<{ rawValue?: string }[]> } }).BarcodeDetector({ formats: ['qr_code'] })
              detector.detect(canvas).then(codes => {
                if (codes.length > 0 && codes[0].rawValue) {
                  setBelegQrText(codes[0].rawValue)
                  setShowScanner(false)
                }
              }).catch(() => {})
              return
            }
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
            if (result?.data) {
              setBelegQrText(result.data)
              setShowScanner(false)
            }
          } catch (_) {}
        }, 300)
      } catch (e) {
        console.warn('Kamera nicht verfügbar:', e)
      }
    }
    start()
    return () => { cancelled = true }
  }, [showScanner])

  const choose = (a: KassabuchArt, bank?: 'kassa_an_bank' | 'bank_an_kassa') => {
    setArt(a === 'kassa_an_bank' || a === 'bank_an_kassa' ? a : a)
    if (a === 'kassa_an_bank' || a === 'bank_an_kassa') setBankRichtung(bank || 'kassa_an_bank')
    setStep(a === 'bar_beleg' ? 'beleg' : 'form')
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => setBelegImage(r.result as string)
    r.readAsDataURL(file)
    e.target.value = ''
  }

  const finishBeleg = () => {
    setStep('form')
  }

  const submit = () => {
    const b = parseFloat(betrag.replace(',', '.'))
    if (isNaN(b) || b <= 0) {
      alert('Bitte gültigen Betrag eingeben.')
      return
    }
    const effectiveArt = (art === 'kassa_an_bank' || art === 'bank_an_kassa') ? bankRichtung : art
    const ok = addKassabuchEintrag(tenant, {
      datum,
      betrag: b,
      art: effectiveArt,
      verwendungszweck: verwendungszweck.trim() || undefined,
      belegImage: belegImage || undefined,
      belegQrText: belegQrText || undefined,
    })
    if (ok) {
      setSaved(true)
      setTimeout(() => navigate(PROJECT_ROUTES['k2-galerie'].kassabuch, { state: { fromOeffentlich: tenant === 'oeffentlich' } }), 1200)
    } else {
      alert('Speichern fehlgeschlagen.')
    }
  }

  const backToKassabuch = () => navigate(PROJECT_ROUTES['k2-galerie'].kassabuch, { state: { fromOeffentlich: tenant === 'oeffentlich' } })

  if (saved) {
    return (
      <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: s.accent, fontWeight: 600 }}>Gespeichert. Weiterleitung zum Kassabuch …</p>
      </div>
    )
  }

  if (!kassabuchVoll) {
    return (
      <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '1.35rem', color: s.text, marginBottom: '0.5rem' }}>Neuer Kassausgang</h1>
          <p style={{ color: s.muted, marginBottom: '1rem' }}>
            Kassausgänge (Bar privat, Kassa an Bank, Beleg) sind nur mit der Lizenzstufe <strong>Pro+</strong> verfügbar.
          </p>
          <Link to={PROJECT_ROUTES['k2-galerie'].kassabuch} state={{ fromOeffentlich: tenant === 'oeffentlich' }} style={{ display: 'inline-block', marginRight: '0.75rem', color: s.accent, textDecoration: 'none', fontWeight: 600 }}>← Kassabuch</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', borderRadius: s.radius, textDecoration: 'none', fontWeight: 600 }}>Pro+ ansehen</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="no-print" style={{ marginBottom: '1.5rem' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].kassabuch} state={{ fromOeffentlich: tenant === 'oeffentlich' }} style={{ color: s.muted, textDecoration: 'none', fontSize: '0.9rem' }}>← Kassabuch</Link>
        </div>

        <h1 style={{ fontSize: '1.35rem', color: s.text, marginBottom: '1rem' }}>Neuer Kassausgang</h1>

        {step === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => choose('bar_privat')}
              style={{ padding: '1rem 1.25rem', background: s.card, border: `2px solid ${s.accent}`, borderRadius: s.radius, color: s.text, fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: s.shadow }}
            >
              💵 Bar privat
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => choose('kassa_an_bank', 'kassa_an_bank')}
                style={{ flex: 1, padding: '1rem', background: s.card, border: `2px solid ${s.accent}`, borderRadius: s.radius, color: s.text, fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: s.shadow }}
              >
                🏦 Kassa → Bank
              </button>
              <button
                type="button"
                onClick={() => choose('bank_an_kassa', 'bank_an_kassa')}
                style={{ flex: 1, padding: '1rem', background: s.card, border: `2px solid ${s.accent}`, borderRadius: s.radius, color: s.text, fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: s.shadow }}
              >
                🏦 Bank → Kassa
              </button>
            </div>
            <button
              type="button"
              onClick={() => choose('bar_beleg')}
              style={{ padding: '1rem 1.25rem', background: s.card, border: `2px solid ${s.accent}`, borderRadius: s.radius, color: s.text, fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: s.shadow }}
            >
              📄 Bar mit Beleg (QR scannen oder Foto)
            </button>
          </div>
        )}

        {step === 'beleg' && (
          <div style={{ background: s.card, padding: '1.25rem', borderRadius: s.radius, boxShadow: s.shadow }}>
            <p style={{ color: s.muted, marginBottom: '1rem' }}>Beleg erfassen – dann Betrag eingeben.</p>
            {!belegImage && !belegQrText && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowScanner(true)} style={{ padding: '0.75rem', background: s.accent, color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
                  QR-Code scannen
                </button>
                <label style={{ display: 'block', padding: '0.75rem', background: '#f0eeeb', borderRadius: s.radius, cursor: 'pointer', textAlign: 'center' }}>
                  Foto / Datei wählen
                  <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
                </label>
              </div>
            )}
            {showScanner && (
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: s.radius }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button type="button" onClick={() => setShowScanner(false)} style={{ marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.85rem' }}>Abbrechen</button>
              </div>
            )}
            {(belegImage || belegQrText) && (
              <div style={{ marginBottom: '1rem' }}>
                {belegImage && <img src={belegImage} alt="Beleg" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: s.radius }} />}
                {belegQrText && <p style={{ fontSize: '0.85rem', color: s.muted, wordBreak: 'break-all' }}>QR: {belegQrText.slice(0, 120)}{belegQrText.length > 120 ? '…' : ''}</p>}
                <button type="button" onClick={() => { setBelegImage(null); setBelegQrText(null) }} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Entfernen</button>
              </div>
            )}
            <button type="button" onClick={finishBeleg} style={{ padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
              Weiter zu Betrag
            </button>
          </div>
        )}

        {step === 'form' && (
          <div style={{ background: s.card, padding: '1.25rem', borderRadius: s.radius, boxShadow: s.shadow }}>
            <p style={{ color: s.muted, marginBottom: '1rem' }}>
              {getKassabuchArtLabel((art === 'kassa_an_bank' || art === 'bank_an_kassa') ? bankRichtung : art)}
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.25rem' }}>Betrag (€) *</label>
              <input type="text" inputMode="decimal" value={betrag} onChange={e => setBetrag(e.target.value)} placeholder="z.B. 50,00" style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: `1px solid ${s.muted}` }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.25rem' }}>Datum</label>
              <input type="date" value={datum} onChange={e => setDatum(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: `1px solid ${s.muted}` }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.25rem' }}>Verwendungszweck (optional)</label>
              <input type="text" value={verwendungszweck} onChange={e => setVerwendungszweck(e.target.value)} placeholder="z.B. Büromaterial" style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: `1px solid ${s.muted}` }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={submit} style={{ flex: 1, padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer', fontWeight: 600 }}>
                Speichern
              </button>
              <button type="button" onClick={backToKassabuch} style={{ padding: '0.75rem 1rem', background: 'transparent', color: s.muted, border: `1px solid ${s.muted}`, borderRadius: s.radius, cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
