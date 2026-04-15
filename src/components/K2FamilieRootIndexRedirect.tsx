/**
 * /projects/k2-familie → „Meine Familie“ (täglicher Einstieg). Query (?t=, ?z=, optional ?m=) erhalten.
 * Umschauen (Musterfamilie): **meine-familie** oder Flyer **willkommen** mit ?t=huber.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

export function K2FamilieRootIndexRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: PROJECT_ROUTES['k2-familie'].meineFamilie, search }} replace />
}
