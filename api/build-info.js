export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '10.03.26 14:37', timestamp: 1773149851942 })
}