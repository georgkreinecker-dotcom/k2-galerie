;(function () {
  function safeReload() {
    if (window.self !== window.top) return
    var q = location.search ? location.search.slice(1) : ''
    var p = new URLSearchParams(q)
    p.set('v', Date.now())
    location.replace(location.origin + location.pathname + '?' + p.toString())
  }
  window.safeReload = safeReload

  var root = document.getElementById('root')
  if (root) {
    root.addEventListener('click', function () {
      setTimeout(function () {
        if (window.self !== window.top) return
        var r = document.getElementById('root')
        if (r && r.querySelector('#root-loading')) safeReload()
      }, 100)
    })
  }

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
  var timeoutMs = isMobile ? 8000 : 15000
  var t = setTimeout(function () {
    var rootEl = document.getElementById('root')
    var loading = document.getElementById('root-loading')
    if (rootEl && loading && rootEl.contains(loading)) {
      rootEl.innerHTML =
        '<div style="text-align:center;color:rgba(255,255,255,0.9);font-family:system-ui;padding:2rem;max-width:90vw;"><p style="margin-bottom:1rem;font-size:1.1rem;">Galerie lädt nicht.</p><p style="font-size:0.9rem;margin-bottom:1rem;">Bitte prüfe die Verbindung (WLAN/Mobilfunk).</p><p style="font-size:0.85rem;margin-bottom:1.5rem;color:rgba(255,255,255,0.7);">Tippe unten um neu zu laden.</p><button id="boot-reload-btn" type="button" style="padding:0.75rem 1.5rem;background:#667eea;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem;touch-action:manipulation;">Seite neu laden</button></div>'
      var btn = document.getElementById('boot-reload-btn')
      if (btn) btn.addEventListener('click', safeReload)
    }
  }, timeoutMs)
  document.documentElement.addEventListener(
    'click',
    function () {
      clearTimeout(t)
    },
    { once: true }
  )
})()
