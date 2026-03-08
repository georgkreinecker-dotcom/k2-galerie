export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '08.03.26 09:10', timestamp: 1772957402190 })
}