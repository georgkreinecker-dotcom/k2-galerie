/** Ein Standard: Drucken für Mission-Besucher-Zeitleisten-Seiten */
export function printMissionVisitZeitleiste(): void {
  document.body.setAttribute('data-mission-print-zeitleiste', '1')
  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    document.body.removeAttribute('data-mission-print-zeitleiste')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  window.setTimeout(cleanup, 2000)
}
