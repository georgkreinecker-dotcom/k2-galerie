import type { NavigateFunction } from 'react-router-dom'

/**
 * Ein Schritt zurück in der App-Historie (wie der Browser-„Zurück“-Button).
 * React Router legt `history.state.idx` ab; bei idx 0 oder fehlendem Eintrag: Fallback.
 */
export function navigateFamilieBack(navigate: NavigateFunction, fallback: string) {
  const st = window.history.state as { idx?: number } | null
  if (typeof st?.idx === 'number') {
    if (st.idx > 0) {
      navigate(-1)
      return
    }
    navigate(fallback)
    return
  }
  navigate(-1)
}
