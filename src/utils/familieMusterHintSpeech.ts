/**
 * Musterfamilie Huber: optionale Sprachausgabe für Hover-Hinweise (data-muster-hint).
 * Nutzt window.speechSynthesis; nicht in jedem Browser/auf jedem Gerät verfügbar.
 */

const SS_KEY = 'k2-familie-muster-hint-sprache'

export function getFamilieMusterHintSpeechEnabled(): boolean {
  try {
    return sessionStorage.getItem(SS_KEY) === '1'
  } catch {
    return false
  }
}

export function setFamilieMusterHintSpeechEnabled(v: boolean): void {
  try {
    if (v) sessionStorage.setItem(SS_KEY, '1')
    else sessionStorage.removeItem(SS_KEY)
  } catch {
    /* ignore */
  }
}

export function cancelFamilieMusterHintSpeech(): void {
  if (typeof window === 'undefined') return
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

/** True wenn die API grundsätzlich da ist (kein Garant für erfolgreiches Abspielen). */
export function isFamilieMusterHintSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

/** Markdown-Fettdruck **…** für die Stimme entfernen (Anzeige kann fetten, Vorlesen nicht). */
export function stripBoldMarkersForSpeech(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}

/**
 * Englische UI-Wörter „Event(s)“ werden von manchen deutschen Systemstimmen
 * unverständlich oder wie „Entor“ ausgesprochen. Nur für Vorlesen: klare deutsche Begriffe.
 * Reihenfolge: längere Phrasen zuerst.
 */
export function normalizeGermanSpeechForFamilieMuster(text: string): string {
  let s = text
  s = s.replace(/\bEvents\s*&\s*Kalender\b/gi, 'Termine und Kalender')
  s = s.replace(/\bEvents\s+verwalten\b/gi, 'Termine verwalten')
  s = s.replace(/\bEvents-\s*oder\b/gi, 'Termin- oder')
  s = s.replace(/\bEvents-Seite\b/gi, 'Termin-Seite')
  s = s.replace(/\bEvent-Übersicht\b/gi, 'Termin-Übersicht')
  s = s.replace(/\bEvents(?!-)\b/g, 'Termine')
  s = s.replace(/\bEvent(?!-)\b/g, 'Termin')
  s = s.replace(/\s*&\s*/g, ' und ')
  return s
}

/** Bevorzugt eine deutsche Systemstimme – oft wärmer als die Default-Stimme (geräteabhängig). */
function pickPreferredGermanVoice(): SpeechSynthesisVoice | null {
  const syn = window.speechSynthesis
  if (!syn) return null
  const voices = syn.getVoices()
  const de = voices.filter((v) => v.lang.toLowerCase().startsWith('de'))
  const preferNames = ['Anna', 'Helena', 'Petra', 'Marika', 'Claudia', 'Yannick']
  for (const name of preferNames) {
    const v = de.find((x) => x.name.includes(name))
    if (v) return v
  }
  return de.find((v) => v.lang === 'de-DE') ?? de[0] ?? null
}

/**
 * Vorherige Ausgabe abbrechen und den Text vorlesen.
 * **…** wird nicht mitgesprochen; Leerzeichen normalisiert; Sprache de-DE.
 * Etwas **langsamer** und mit **bevorzugter** deutscher Stimme (wo verfügbar).
 */
export function speakFamilieMusterHintText(text: string): void {
  if (typeof window === 'undefined') return
  const syn = window.speechSynthesis
  if (!syn) return
  const clean = normalizeGermanSpeechForFamilieMuster(stripBoldMarkersForSpeech(text))
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return
  try {
    syn.cancel()
    let started = false
    const run = () => {
      if (started) return
      started = true
      const u = new SpeechSynthesisUtterance(clean)
      u.lang = 'de-DE'
      u.rate = 0.76
      u.pitch = 0.96
      const voice = pickPreferredGermanVoice()
      if (voice) u.voice = voice
      syn.speak(u)
    }
    if (syn.getVoices().length === 0) {
      const onVoices = () => {
        syn.removeEventListener('voiceschanged', onVoices)
        run()
      }
      syn.addEventListener('voiceschanged', onVoices)
      window.setTimeout(() => {
        syn.removeEventListener('voiceschanged', onVoices)
        run()
      }, 400)
    } else {
      run()
    }
  } catch {
    /* ignore */
  }
}
