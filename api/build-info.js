export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '07.03.26 09:09', timestamp: 1772870962125 })
}