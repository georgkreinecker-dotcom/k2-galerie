/**
 * /projects/k2-familie → „Meine Familie“ (täglicher Einstieg). Query (?t=, ?z=, optional ?m=) erhalten.
 * Umschauen (Musterfamilie): **meine-familie** oder Flyer **willkommen** mit ?t=huber.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'

export function K2FamilieRootIndexRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: K2_FAMILIE_APP_SHORT_PATH, search }} replace />
}
