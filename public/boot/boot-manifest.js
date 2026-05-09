;(function () {
  try {
    var p = location.pathname || ''
    var familie =
      p.indexOf('/projects/k2-familie') === 0 ||
      p.indexOf('/k2-familie-handbuch') === 0 ||
      p === '/familie' ||
      p === '/familie/'
    var m = document.createElement('link')
    m.rel = 'manifest'
    m.href = familie ? '/manifest-k2-familie.json' : '/manifest.json'
    document.head.appendChild(m)
    if (!familie) return
    var ap = document.querySelector('link[rel="apple-touch-icon"]')
    if (ap) ap.setAttribute('href', '/k2-familie-icon-192.png')
    var t = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (t) t.setAttribute('content', 'K2 Familie')
    var tc = document.querySelector('meta[name="theme-color"]')
    if (!tc) {
      tc = document.createElement('meta')
      tc.setAttribute('name', 'theme-color')
      document.head.appendChild(tc)
    }
    tc.setAttribute('content', '#b54a1e')
    var fi = document.querySelector('link[rel="icon"]')
    if (fi) fi.setAttribute('href', '/k2-familie-icon-192.png')
    var tit = document.querySelector('title')
    if (tit) tit.textContent = 'K2 Familie'
    var md = document.querySelector('meta[name="description"]')
    if (md)
      md.setAttribute(
        'content',
        'K2 Familie – Stammbaum, Momente und Erinnerungen gemeinsam pflegen.'
      )
  } catch (e) {}
})()
