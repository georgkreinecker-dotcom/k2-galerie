export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '03.03.26 08:55', timestamp: 1772524537396 })
}