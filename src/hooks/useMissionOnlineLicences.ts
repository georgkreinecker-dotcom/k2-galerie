import { useEffect, useState } from 'react'
import {
  parseMissionLicenceDataPayload,
  type MissionOnlineLicence,
} from '../utils/missionOnlineLicences'
import { getVisitCountApiOrigin } from '../utils/visitCountApiOrigin'

export function useMissionOnlineLicences() {
  const [licences, setLicences] = useState<MissionOnlineLicence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emptyOnlineHint, setEmptyOnlineHint] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const origin = getVisitCountApiOrigin()
    fetch(`${origin}/api/licence-data`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const parsed = parseMissionLicenceDataPayload(data)
        setLicences(parsed.licences)
        setEmptyOnlineHint(parsed.emptyOnlineHint)
        setError(parsed.error ?? null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError((e as Error)?.message || 'Lizenzdaten nicht geladen')
        setLicences([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { licences, loading, error, emptyOnlineHint, count: licences.length }
}
