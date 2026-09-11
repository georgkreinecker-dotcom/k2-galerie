;(function () {
  try {
    var p = location.pathname || ''
    var familie =
      p.indexOf('/projects/k2-familie') === 0 ||
      p.indexOf('/k2-familie-handbuch') === 0 ||
      p === '/familie' ||
      p === '/familie/'
    var apf =
      !familie &&
      (p === '/dev-view' ||
        p === '/dev-view/' ||
        p === '/apf' ||
        p === '/apf/' ||
        p === '/mobile-connect' ||
        p === '/mobile-connect/')
    var m = document.createElement('link')
    m.rel = 'manifest'
    m.href = familie
      ? '/manifest-k2-familie.json'
      : apf
        ? '/manifest-apf.json'
        : '/manifest.json'
    document.head.appendChild(m)
    if (!familie && !apf) return
    if (familie) {
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
      return
    }
    var ap2 = document.querySelector('link[rel="apple-touch-icon"]')
    if (ap2) ap2.setAttribute('href', '/apf-icon-192.png')
    var t2 = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (t2) t2.setAttribute('content', 'APf')
    var tc2 = document.querySelector('meta[name="theme-color"]')
    if (!tc2) {
      tc2 = document.createElement('meta')
      tc2.setAttribute('name', 'theme-color')
      document.head.appendChild(tc2)
    }
    tc2.setAttribute('content', '#0d1b2a')
    var fi2 = document.querySelector('link[rel="icon"]')
    if (fi2) fi2.setAttribute('href', '/apf-icon-192.png')
    var tit2 = document.querySelector('title')
    if (tit2) tit2.textContent = 'APf'
    var md2 = document.querySelector('meta[name="description"]')
    if (md2)
      md2.setAttribute(
        'content',
        'K2 Arbeitsplattform – Smart Panel, Projekte, Admin am Handy.'
      )
  } catch (e) {}
})()
