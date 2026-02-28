/**
 * Build-Stand für QR und Stand-Badge. Placeholder werden beim Build von write-build-info.js ersetzt.
 * So liefert jeder Deployment den aktuellen Build-Zeitpunkt (kein CDN-Cache-Problem).
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '28.02.26 08:57', timestamp: 1772265470701 })
}
