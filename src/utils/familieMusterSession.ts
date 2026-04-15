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
