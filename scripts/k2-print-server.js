#!/usr/bin/env node
/**
 * K2 Print-Server: One-Click-Etikett-Druck auf Brother QL-820 per IPP
 *
 * Start: node scripts/k2-print-server.js
 * Dann in K2 Drucker-Einstellungen: Print-Server URL = http://localhost:3847
 * (oder http://MAC-IP:3847 für iPad/iPhone im gleichen WLAN)
 *
 * Voraussetzung: Brother im WLAN erreichbar (z.B. 192.168.1.102)
 * npm install ipp  (falls noch nicht vorhanden)
 */

const http = require('http')
const ipp = require('ipp')

const PORT = parseInt(process.env.K2_PRINT_PORT || '3847', 10)
const DEFAULT_PRINTER_IP = '192.168.1.102'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
}

function sendResponse(res, statusCode, body, contentType = 'application/json') {
  res.writeHead(statusCode, { ...corsHeaders, 'Content-Type': contentType })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

function printToBrother(printerIP, imageBuffer, widthMm, heightMm) {
  return new Promise((resolve, reject) => {
    const url = `http://${printerIP}:631/ipp/print`
    const printer = ipp.Printer(url)

    // IPP media-size: 1/100 mm (RFC 8011)
    const xDim = Math.round((widthMm || 29) * 100)
    const yDim = Math.round((heightMm || 90.3) * 100)

    const msg = {
      'operation-attributes-tag': {
        'requesting-user-name': 'k2-galerie',
        'job-name': 'k2-etikett',
        'document-format': 'image/png'
      },
      'job-attributes-tag': {
        'media-col': {
          'media-size': { 'x-dimension': xDim, 'y-dimension': yDim },
          'media-top-margin': 0,
          'media-left-margin': 0,
          'media-right-margin': 0,
          'media-bottom-margin': 0
        },
        'copies': 1
      },
      data: imageBuffer
    }

    printer.execute('Print-Job', msg, (err, res) => {
      if (err) return reject(err)
      if (res && res['status-code'] && res['status-code'] >= 0x0400) {
        return reject(new Error(res['status-message'] || 'Druckfehler'))
      }
      resolve(res)
    })
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendResponse(res, 204, '')
    return
  }

  if (req.method !== 'POST' || req.url !== '/print') {
    sendResponse(res, 404, { error: 'Nur POST /print unterstützt' })
    return
  }

  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    try {
      const data = JSON.parse(body)
      const base64 = data.image
      if (!base64 || typeof base64 !== 'string') {
        sendResponse(res, 400, { error: 'Feld "image" (Base64) fehlt' })
        return
      }
      const imageBuffer = Buffer.from(base64, 'base64')
      const printerIP = data.printerIP || DEFAULT_PRINTER_IP
      const widthMm = parseFloat(data.widthMm) || 29
      const heightMm = parseFloat(data.heightMm) || 90.3

      printToBrother(printerIP, imageBuffer, widthMm, heightMm)
        .then(() => sendResponse(res, 200, { ok: true, message: 'Etikett gesendet' }))
        .catch((err) => {
          console.error('Print error:', err)
          let msg = err.message || 'Druck fehlgeschlagen'
          if (msg.includes('x-dimension') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT')) {
            msg = 'Drucker nicht erreichbar. Mac und Brother müssen im gleichen WLAN sein (Drucker ist im mobilen LAN).'
          }
          sendResponse(res, 500, { error: msg })
        })
    } catch (e) {
      sendResponse(res, 400, { error: 'Ungültige Anfrage: ' + (e.message || String(e)) })
    }
  })
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('')
    console.error('⚠️  Port ' + PORT + ' ist bereits belegt.')
    console.error('   → Der Print-Server läuft vermutlich schon (einfach One-Click-Druck nutzen).')
    console.error('   → Oder im Projektordner: anderen Prozess beenden (lsof -i :' + PORT + ', dann kill <PID>)')
    console.error('   → Oder anderen Port: K2_PRINT_PORT=3848 npm run print-server')
    console.error('')
    process.exit(1)
  }
  throw err
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`K2 Print-Server: http://localhost:${PORT}`)
  console.log('One-Click-Druck bereit. In K2: Einstellungen → Drucker → Print-Server URL eintragen.')
})
