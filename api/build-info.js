export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.json({ label: '12.03.26 05:14', timestamp: 1773288884449 })
}