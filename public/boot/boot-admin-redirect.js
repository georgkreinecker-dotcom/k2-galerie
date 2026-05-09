;(function () {
  var p = location.pathname
  if (
    window.self === window.top &&
    (p === '/admin/login' || p === '/admin/login/' || p.indexOf('/admin/login') === 0)
  ) {
    location.replace(location.origin + '/projects/k2-galerie/galerie')
  }
})()
