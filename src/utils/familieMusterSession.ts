/**
 * K2 Familie: Nach Einstieg über Flyer/Willkommen oder Musterfamilie-Einstieg
 * bleibt die Sitzung auf „nur Musterfamilie (huber)“ – bis eine Einladung mit anderem ?t= kommt.
 */

export const K2_FAMILIE_NUR_MUSTER_SESSION_KEY = 'k2-familie-nur-muster-session'

export function setFamilieNurMusterSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
    } else {
      sessionStorage.removeItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY)
    }
  } catch {
    /* Session z. B. blockiert */
  }
}

export function isFamilieNurMusterSession(): boolean {
  try {
    return sessionStorage.getItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearFamilieNurMusterSession(): void {
  setFamilieNurMusterSession(false)
}

/** Layout (`K2FamilieLayout`) hört zu und öffnet den Huber-Leitfaden – z. B. Startseite „Leitfaden jetzt öffnen“. */
export const K2_FAMILIE_OPEN_MUSTER_LEITFADEN_EVENT = 'k2-familie-open-muster-leitfaden'

export function dispatchOpenMusterLeitfaden(): void {
  try {
    window.dispatchEvent(new CustomEvent(K2_FAMILIE_OPEN_MUSTER_LEITFADEN_EVENT))
  } catch {
    /* ignore */
  }
}
