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

/**
 * Vorherige Ausgabe abbrechen und den Text vorlesen.
 * Leerzeichen normalisieren; Sprache de-DE.
 */
export function speakFamilieMusterHintText(text: string): void {
  if (typeof window === 'undefined') return
  const syn = window.speechSynthesis
  if (!syn) return
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return
  try {
    syn.cancel()
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = 'de-DE'
    u.rate = 0.92
    syn.speak(u)
  } catch {
    /* ignore */
  }
}
