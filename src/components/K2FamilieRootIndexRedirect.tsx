/**
 * /projects/k2-familie → Einstieg, Query (?t=, ?z=, optional ?m=) erhalten.
 * Mit **?m=** (persönlicher Code im Link): direkt „Meine Familie“ — nicht die neutrale Einstiegsseite.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

export function K2FamilieRootIndexRedirect() {
  const { search } = useLocation()
  const m = new URLSearchParams(search).get('m')?.trim()
  const pathname = m ? PROJECT_ROUTES['k2-familie'].meineFamilie : PROJECT_ROUTES['k2-familie'].einstieg
  return <Navigate to={{ pathname, search }} replace />
}
