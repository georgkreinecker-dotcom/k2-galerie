/**
 * Sitemap für Suchmaschinen (Google Search Console).
 * Wird unter /sitemap.xml ausgeliefert (Rewrite in vercel.json).
 */

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://k2-galerie.vercel.app/entdecken</loc></url>
<url><loc>https://k2-galerie.vercel.app/agb</loc></url>
<url><loc>https://k2-galerie.vercel.app/galerie</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/galerie</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/shop</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/virtueller-rundgang</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/vita/martina</loc></url>
<url><loc>https://k2-galerie.vercel.app/projects/k2-galerie/vita/georg</loc></url>
</urlset>`

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  return res.status(200).send(XML)
}
