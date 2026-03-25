/**
 * Einheitliche Termin-/Zeiten-Formatierung für Events (dailyTimes, startTime/endTime).
 * Kompakte Datumszeile für Listen; lange Datumszeile für Admin/PR-Texte.
 */

export type EventTerminLike = {
  date?: string
  endDate?: string
  startTime?: string
  endTime?: string
  dailyTimes?: Record<string, string | { start?: string; end?: string }>
}

/** ISO-Tage zwischen Start und Ende (inkl.), gleiche Logik wie bisher im Admin. */
export function getEventDaysISO(startDate: string, endDate?: string): string[] {
  if (!startDate) return []
  const end = endDate || startDate
  const days: string[] = []
  const start = new Date(startDate)
  const endDateObj = new Date(end)
  if (isNaN(start.getTime()) || isNaN(endDateObj.getTime())) return []
  for (let d = new Date(start); d <= endDateObj; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/** z. B. „24. April 2025“ oder „24.–26. April 2025“ (Galerie-Listen, Flyer, Plakat). */
export function formatEventDatumZeileKompakt(dateStr?: string, endDateStr?: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const toDe = (x: Date) => x.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!endDateStr || endDateStr === dateStr) return toDe(d)
    const end = new Date(endDateStr)
    if (isNaN(end.getTime())) return toDe(d)
    if (d.getMonth() === end.getMonth() && d.getFullYear() === end.getFullYear()) {
      return `${d.getDate()}.–${end.getDate()}. ${end.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`
    }
    return `${toDe(d)} – ${toDe(end)}`
  } catch {
    return ''
  }
}

/** Erste Zeile wie im Admin: Wochentag lang, Monat lang. */
export function formatEventDatumZeileLang(dateStr?: string, endDateStr?: string): string {
  if (!dateStr) return ''
  try {
    const startDate = new Date(dateStr)
    if (isNaN(startDate.getTime())) return ''
    let endDate = endDateStr ? new Date(endDateStr) : null
    if (endDate && isNaN(endDate.getTime())) endDate = null

    let dateStrOut = startDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    if (endDate && endDate.getTime() !== startDate.getTime()) {
      dateStrOut += ` - ${endDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`
    }
    return dateStrOut
  } catch {
    return ''
  }
}

/** Nur Uhrzeiten-Block (mehrzeilig möglich); leer wenn nichts gesetzt. */
export function formatEventZeitenBlock(
  event: EventTerminLike,
  opts?: { withClockEmojiSingle?: boolean }
): string {
  const withEmoji = opts?.withClockEmojiSingle === true
  if (!event) return ''

  if (event.dailyTimes && Object.keys(event.dailyTimes).length > 0 && event.date) {
    const times: string[] = []
    const days = getEventDaysISO(event.date, event.endDate || event.date)
    days.forEach((day) => {
      const dayTime = event.dailyTimes![day]
      if (!dayTime) return
      const dayDate = new Date(day)
      if (isNaN(dayDate.getTime())) return
      if (typeof dayTime === 'string') {
        times.push(
          `${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${dayTime}`
        )
      } else if (dayTime.start || dayTime.end) {
        const timeStr = dayTime.start
          ? dayTime.end
            ? `${dayTime.start} - ${dayTime.end} Uhr`
            : `${dayTime.start} Uhr`
          : dayTime.end
            ? `bis ${dayTime.end} Uhr`
            : ''
        if (timeStr) {
          times.push(
            `${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${timeStr}`
          )
        }
      }
    })
    if (times.length > 0) return 'Zeiten:\n' + times.join('\n')
  }

  if (event.startTime) {
    const t = `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr`
    return withEmoji ? `🕐 ${t}` : t
  }

  return ''
}

export type EventTerminKomplettOpts = {
  /** 'compact' = Galerie/Flyer; 'long' = Admin & Generatoren */
  mode?: 'compact' | 'long'
  /** Wenn kein gültiges Datum: */
  emptyFallback?: string
  /** Nur bei einzelner startTime/endTime (nicht dailyTimes): Uhr-Emoji wie im Admin */
  withClockEmojiSingle?: boolean
}

/**
 * Datum + Zeiten in einem String; Zeilen mit \n getrennt.
 * Ohne Zeiten nur Datumszeile.
 */
export function formatEventTerminKomplett(
  event: EventTerminLike | null | undefined,
  opts?: EventTerminKomplettOpts
): string {
  const mode = opts?.mode ?? 'compact'
  const emptyFallback = opts?.emptyFallback ?? 'Datum folgt'
  const withClock = opts?.withClockEmojiSingle === true

  if (!event || !event.date) return emptyFallback

  try {
    const d0 = new Date(event.date)
    if (isNaN(d0.getTime())) return emptyFallback
  } catch {
    return emptyFallback
  }

  const datumLine =
    mode === 'long'
      ? formatEventDatumZeileLang(event.date, event.endDate)
      : formatEventDatumZeileKompakt(event.date, event.endDate)

  if (!datumLine) return emptyFallback

  const zeiten = formatEventZeitenBlock(event, { withClockEmojiSingle: withClock })
  if (!zeiten) return datumLine

  if (zeiten.startsWith('Zeiten:')) {
    return `${datumLine}\n\n${zeiten}`
  }
  return `${datumLine}\n${zeiten}`
}
