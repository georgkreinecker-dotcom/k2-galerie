/**
 * /projects/k2-familie → Einstieg, dabei Query (?t=, ?z=) erhalten (Einladungs-QR).
 */

import { Navigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

export function K2FamilieRootIndexRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: PROJECT_ROUTES['k2-familie'].einstieg, search }} replace />
}
