/**
 * Plakatständer A1 – Druck A1 (1:1) oder A4 (proportional, native A4-Maße).
 * Eine Quelle für alle plakatstaender-a1-heute-offen-k2*.html
 */
(function () {
  var ROOT = document.documentElement

  function clearPrintFormat() {
    ROOT.classList.remove('print-a1', 'print-a4')
  }

  function whenReadyForPrint(cb) {
    var fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(function () {})
        : Promise.resolve()

    fontsReady.then(function () {
      var imgs = Array.prototype.slice.call(document.images || [])
      var pending = imgs.filter(function (img) {
        return !img.complete
      })
      function go() {
        window.requestAnimationFrame(function () {
          window.setTimeout(cb, 200)
        })
      }
      if (pending.length === 0) {
        go()
        return
      }
      var left = pending.length
      function done() {
        left -= 1
        if (left <= 0) {
          go()
        }
      }
      pending.forEach(function (img) {
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      })
      window.setTimeout(cb, 2500)
    })
  }

  function druckPlakat(format) {
    clearPrintFormat()
    ROOT.classList.add(format === 'a4' ? 'print-a4' : 'print-a1')
    whenReadyForPrint(function () {
      window.print()
    })
  }

  window.druckPlakat = druckPlakat

  window.addEventListener('afterprint', clearPrintFormat)

  /* ⌘P ohne Button: sicher A4 (HP), nie Bildschirm-118mm */
  window.addEventListener('beforeprint', function () {
    if (!ROOT.classList.contains('print-a1') && !ROOT.classList.contains('print-a4')) {
      ROOT.classList.add('print-a4')
    }
  })

  var y = document.getElementById('y')
  if (y) y.textContent = String(new Date().getFullYear())

  if (new URLSearchParams(window.location.search).get('druck') === '1') {
    window.addEventListener(
      'load',
      function () {
        var format = new URLSearchParams(window.location.search).get('format') === 'a1' ? 'a1' : 'a4'
        window.setTimeout(function () {
          druckPlakat(format)
        }, 400)
      },
      { once: true },
    )
  }
})()
