/**
 * Vercel Edge: Root-URL → Eingangstor /entdecken (serverseitig 307).
 * Grund: vercel.json redirects greifen bei SPA+Vite nicht zuverlässig vor dem Catch-all-Rewrite (curl zeigt 200 auf /).
 * Localhost: kein Redirect (APf bleibt über React MobileRootRedirect).
 */
export const config = {
  matcher: '/',
}

export default function middleware(request: Request): Response | Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname !== '/') {
    return fetch(request)
  }
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1') {
    return fetch(request)
  }
  const doc = url.searchParams.get('doc')
  if (doc === '19-MARTINA-MUNA-BESUCH-OEK2-VK2.md' || doc === '20-PILOT-ZETTEL-OEK2-VK2.md') {
    return fetch(request)
  }
  const page = url.searchParams.get('page')
  if (page === 'handbuch' || (doc != null && doc.length > 0 && /\.md$/i.test(doc))) {
    return fetch(request)
  }
  return Response.redirect(new URL('/entdecken', url.origin), 307)
}
