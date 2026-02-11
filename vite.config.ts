import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin: Prüfe auf doppelte Exports BEVOR Build startet
const checkDuplicateExportsPlugin = () => {
  return {
    name: 'check-duplicate-exports',
    buildStart() {
      const files = ['components/ScreenshotExportAdmin.tsx']
      files.forEach((file) => {
        const filePath = path.resolve(__dirname, file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          const lines = content.split('\n')
          const exports = new Map<string, number[]>()
          
          lines.forEach((line: string, index: number) => {
            // Prüfe auf named exports: export { Something }
            const namedExportMatch = line.match(/export\s+\{\s*([^}]+)\s*\}/)
            if (namedExportMatch) {
              const exportNames = namedExportMatch[1].split(',').map((s: string) => s.trim())
              exportNames.forEach((name: string) => {
                if (!exports.has(name)) {
                  exports.set(name, [])
                }
                exports.get(name)!.push(index + 1)
              })
            }
            
            // Prüfe auf default export
            if (line.match(/export\s+default/)) {
              if (!exports.has('default')) {
                exports.set('default', [])
              }
              exports.get('default')!.push(index + 1)
            }
          })
          
          // Prüfe auf Duplikate
          const duplicates: Array<{ name: string; lines: number[] }> = []
          exports.forEach((lines, name) => {
            if (lines.length > 1) {
              duplicates.push({ name, lines })
            }
          })
          
          if (duplicates.length > 0) {
            console.error(`\n❌ FEHLER: Doppelte Exports in ${file}:`)
            duplicates.forEach(({ name, lines }) => {
              console.error(`   - "${name}" exportiert in Zeilen: ${lines.join(', ')}`)
            })
            throw new Error(`Doppelte Exports gefunden in ${file}. Bitte entfernen!`)
          }
        }
      })
    }
  }
}

// Plugin: Schreibe gallery-data.json beim Build automatisch + stelle sicher dass sie kopiert wird
const writeGalleryDataPlugin = () => {
  return {
    name: 'write-gallery-data',
    buildStart() {
      const publicDir = path.resolve(__dirname, 'public')
      const outputFile = path.join(publicDir, 'gallery-data.json')
      
      // Prüfe ob Export-Datei existiert (wird beim "Veröffentlichen" erstellt)
      const exportFile = path.join(__dirname, 'gallery-data-export.json')
      
      if (fs.existsSync(exportFile)) {
        // Kopiere Export-Datei nach public
        try {
          const data = fs.readFileSync(exportFile, 'utf8')
          fs.writeFileSync(outputFile, data, 'utf8')
          console.log('✅ gallery-data.json aus Export aktualisiert')
        } catch (e: any) {
          console.warn('⚠️ Fehler beim Kopieren der Export-Datei:', e?.message || String(e))
        }
      }
      
      // Falls keine Export-Datei und keine gallery-data.json existiert, erstelle Standard
      if (!fs.existsSync(outputFile)) {
        const defaultData = {
          martina: { name: 'Martina Kreinecker', email: '', phone: '' },
          georg: { name: 'Georg Kreinecker', email: '', phone: '' },
          gallery: {
            address: '',
            phone: '',
            email: '',
            website: 'www.k2-galerie.at',
            internetadresse: '',
            adminPassword: 'k2Galerie2026',
            welcomeImage: '',
            virtualTourImage: ''
          },
          artworks: [],
          events: [],
          documents: [],
          designSettings: {},
          exportedAt: new Date().toISOString()
        }
        
        fs.writeFileSync(outputFile, JSON.stringify(defaultData, null, 2), 'utf8')
        console.log('✅ gallery-data.json mit Standard-Daten erstellt')
      }
      
      // WICHTIG: Stelle sicher dass die Datei existiert und lesbar ist
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile)
        console.log(`✅ gallery-data.json vorhanden: ${(stats.size / 1024).toFixed(1)} KB`)
      }
    }
  }
}

// Middleware für Backup-Upload
const writeBackupMiddleware = () => {
  return {
    name: 'write-backup-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/write-backup', (req: any, res: any, next: any) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk })
          req.on('end', () => {
            try {
              const backupDir = path.resolve(__dirname, 'backup')
              if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true })
              }
              const outputFile = path.join(backupDir, 'k2-ai-memory-backup.json')
              
              // Validiere JSON
              try {
                JSON.parse(body)
              } catch (parseError) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Ungültiges JSON-Format' }))
                return
              }
              
              // Schreibe Backup
              fs.writeFileSync(outputFile, body, 'utf8')
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, message: 'Backup erfolgreich gespeichert' }))
            } catch (e: any) {
              console.error('Backup-Fehler:', e)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: e.message || 'Unbekannter Fehler' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// Middleware für Vercel Status Check
const vercelStatusMiddleware = () => {
  return {
    name: 'vercel-status-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/vercel-status', (req: any, res: any, next: any) => {
        if (req.method === 'GET') {
          try {
            // Prüfe ob gallery-data.json existiert und aktuell ist
            const publicDir = path.resolve(__dirname, 'public')
            const galleryDataFile = path.join(publicDir, 'gallery-data.json')
            
            if (fs.existsSync(galleryDataFile)) {
              const stats = fs.statSync(galleryDataFile)
              const data = JSON.parse(fs.readFileSync(galleryDataFile, 'utf8'))
              const artworksCount = Array.isArray(data.artworks) ? data.artworks.length : 0
              
              // Datei ist "ready" wenn sie existiert und weniger als 5 Minuten alt ist
              const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60)
              const isRecent = ageMinutes < 5
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ 
                status: isRecent ? 'ready' : 'pending',
                message: isRecent ? 'Datei bereit' : 'Warte auf Deployment',
                artworks: artworksCount,
                lastModified: stats.mtime.toISOString(),
                ageMinutes: Math.round(ageMinutes * 10) / 10
              }))
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ 
                status: 'pending',
                message: 'Datei noch nicht erstellt',
                artworks: 0
              }))
            }
          } catch (e: any) {
            console.error('Vercel Status Fehler:', e)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ 
              status: 'error',
              error: e.message || 'Unbekannter Fehler'
            }))
          }
        } else {
          next()
        }
      })
    }
  }
}

// Middleware für API-Endpoint zum Schreiben der gallery-data.json + automatisches Git-Deployment
const writeGalleryDataMiddleware = () => {
  return {
    name: 'write-gallery-data-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/write-gallery-data', (req: any, res: any, next: any) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk })
          req.on('end', () => {
            try {
              const publicDir = path.resolve(__dirname, 'public')
              // Stelle sicher dass public Ordner existiert
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true })
              }
              const outputFile = path.join(publicDir, 'gallery-data.json')
              
              // Validiere JSON bevor schreiben
              try {
                JSON.parse(body)
              } catch (parseError) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Ungültiges JSON-Format' }))
                return
              }
              
              // Schreibe Datei
              fs.writeFileSync(outputFile, body, 'utf8')
              
              // Bestätige dass Datei existiert
              if (!fs.existsSync(outputFile)) {
                throw new Error('Datei wurde nicht erstellt')
              }
              
              const stats = fs.statSync(outputFile)
              
              // WICHTIG: Prüfe ob Datei Werke enthält
              let artworksCount = 0
              try {
                const fileContent = fs.readFileSync(outputFile, 'utf8')
                const jsonData = JSON.parse(fileContent)
                artworksCount = Array.isArray(jsonData.artworks) ? jsonData.artworks.length : 0
                console.log('✅ Datei geschrieben:', outputFile)
                console.log('📊 Dateigröße:', stats.size, 'Bytes')
                console.log('🎨 Werke in Datei:', artworksCount)
                
                if (artworksCount === 0) {
                  console.warn('⚠️ WARNUNG: Datei enthält keine Werke!')
                }
              } catch (parseError) {
                console.error('❌ Fehler beim Prüfen der Datei:', parseError)
                throw new Error('Datei enthält ungültiges JSON')
              }
              
              // Git Push synchron ausführen (mit Timeout)
              const { execSync } = require('child_process')
              const projectRoot = path.resolve(__dirname)
              
              // WICHTIG: Verwende absoluten Pfad ohne Leerzeichen-Probleme
              const gitScript = path.resolve(projectRoot, 'scripts', 'git-push-gallery-data.sh')
              
              // Prüfe ob Script existiert
              if (!fs.existsSync(gitScript)) {
                throw new Error(`Git-Script nicht gefunden: ${gitScript}`)
              }
              
              // Prüfe ob Script ausführbar ist
              try {
                fs.accessSync(gitScript, fs.constants.X_OK)
              } catch (e) {
                // Mache Script ausführbar falls nötig
                fs.chmodSync(gitScript, 0o755)
              }
              
              let gitOutput = ''
              let gitError = ''
              let gitSuccess = false
              let gitExitCode = 0
              
              try {
                console.log(`🔧 Führe Git-Script aus: ${gitScript}`)
                console.log(`📁 Working Directory: ${projectRoot}`)
                
                // Führe Git Push synchron aus (mit Timeout)
                // WICHTIG: Verwende absoluten Pfad und escape für Shell
                // WICHTIG: stdio: 'inherit' würde Output direkt zeigen, aber wir brauchen es als String
                // Verwende 'pipe' für stdout/stderr um beide zu erfassen
                gitOutput = execSync(`bash "${gitScript}"`, {
                  cwd: projectRoot,
                  timeout: 30000, // 30 Sekunden Timeout
                  maxBuffer: 1024 * 1024 * 10, // 10MB Buffer
                  encoding: 'utf8',
                  stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
                }) as string
                gitSuccess = true
                console.log('✅ Git Push erfolgreich:', gitOutput.substring(0, 200))
              } catch (error: any) {
                // WICHTIG: Bei execSync wird stdout/stderr im error-Objekt gespeichert
                // Aber das Script leitet stderr nach stdout um (2>&1), also sollte alles in stdout sein
                // Erfasse alle möglichen Fehlerquellen
                gitExitCode = error.status || error.code || -1
                const errorParts: string[] = []
                
                // WICHTIG: execSync gibt stdout/stderr im error-Objekt zurück
                // Das Script leitet stderr nach stdout um (2>&1), also sollte alles in stdout sein
                const stdout = error.stdout ? String(error.stdout) : ''
                const stderr = error.stderr ? String(error.stderr) : ''
                const message = error.message ? String(error.message) : ''
                
                console.log('🔍 Fehler-Debug:', {
                  hasStdout: !!stdout,
                  stdoutLength: stdout.length,
                  hasStderr: !!stderr,
                  stderrLength: stderr.length,
                  hasMessage: !!message,
                  status: error.status,
                  code: error.code,
                  signal: error.signal,
                  errorKeys: Object.keys(error)
                })
                
                // Prüfe ob es ein spezifischer Fehler ist
                if (stdout.includes('keine Werke') || stdout.includes('WARNUNG: Datei enthält keine Werke')) {
                  gitError = `⚠️ Datei enthält keine Werke!\n\n${stdout}\n\nBitte zuerst Werke speichern bevor veröffentlicht wird.`
                } else {
                  // Sammle ALLE Fehlerinformationen - IMMER etwas zurückgeben!
                  if (stdout && stdout.trim().length > 0) {
                    // Zeige stdout IMMER, auch wenn kein expliziter Fehler erkannt wird
                    errorParts.push(`SCRIPT OUTPUT:\n${stdout}`)
                  }
                  
                  if (stderr && stderr.trim().length > 0) {
                    errorParts.push(`SCRIPT STDERR:\n${stderr}`)
                  }
                  
                  if (message && message.trim().length > 0) {
                    errorParts.push(`ERROR MESSAGE:\n${message}`)
                  }
                  
                  if (error.signal) {
                    errorParts.push(`SIGNAL: ${error.signal}`)
                  }
                  
                  if (error.status !== undefined) {
                    errorParts.push(`EXIT CODE: ${error.status}`)
                    gitExitCode = error.status
                  }
                  
                  if (error.code) {
                    errorParts.push(`ERROR CODE: ${error.code}`)
                  }
                  
                  // Falls immer noch nichts gefunden, zeige vollständiges Error-Objekt
                  if (errorParts.length === 0) {
                    try {
                      const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
                      errorParts.push(`VOLLSTÄNDIGER FEHLER:\n${errorStr}`)
                    } catch {
                      errorParts.push(`FEHLER OBJEKT: ${String(error)}`)
                      errorParts.push(`FEHLER TYP: ${typeof error}`)
                      errorParts.push(`FEHLER KEYS: ${Object.keys(error).join(', ')}`)
                    }
                  }
                }
                
                // Vollständigen Fehler zusammenstellen - IMMER etwas zurückgeben!
                if (!gitError && errorParts.length > 0) {
                  gitError = errorParts.join('\n\n')
                } else if (!gitError) {
                  // Fallback: Zeige zumindest Exit Code und Message
                  gitError = `Git Push fehlgeschlagen!\n\nExit Code: ${gitExitCode}\nMessage: ${message || 'Keine Fehlermeldung verfügbar'}\n\nBitte prüfe die Konsole für Details.`
                }
                
                gitSuccess = false
                console.error('❌ Git Push Fehler Details:', {
                  scriptPath: gitScript,
                  projectRoot: projectRoot,
                  exitCode: gitExitCode,
                  stdoutLength: stdout.length,
                  stderrLength: stderr.length,
                  stdoutPreview: stdout.substring(0, 1000),
                  stderrPreview: stderr.substring(0, 1000),
                  errorPreview: gitError.substring(0, 1000),
                  fullError: error
                })
              }
              
              // Antwort senden mit Git Push Ergebnis
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Last-Modified': stats.mtime.toUTCString()
              })
              res.end(JSON.stringify({ 
                success: true, 
                message: 'gallery-data.json erfolgreich geschrieben',
                size: stats.size,
                path: outputFile,
                artworksCount: artworksCount,
                git: {
                  output: gitOutput ? gitOutput.substring(0, 2000) : '', // Erste 2000 Zeichen
                  error: gitError ? gitError.substring(0, 2000) : '', // Erste 2000 Zeichen
                  success: gitSuccess,
                  exitCode: gitExitCode
                }
              }))
            } catch (e: any) {
              console.error('Fehler beim Schreiben:', e)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: e.message || 'Unbekannter Fehler' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    checkDuplicateExportsPlugin(), // PRÜFT DOPPELTE EXPORTS BEVOR BUILD STARTET
    writeGalleryDataPlugin(), 
    writeGalleryDataMiddleware(),
    writeBackupMiddleware(), // Backup-Upload Unterstützung
    vercelStatusMiddleware() // Vercel Status Check
  ],
  base: '/',
  server: {
    port: 5177,
    host: '0.0.0.0', // Erlaubt Zugriff von ALLEN Netzwerk-Interfaces (localhost + Netzwerk)
    strictPort: false, // Falls Port belegt, automatisch nächsten Port verwenden
    headers: {
      // Cache-Control für Dev-Server: Kein Caching von JavaScript/TypeScript Dateien
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    hmr: {
      // DEAKTIVIERT: HMR verursacht ständige Reloads und instabile Kommunikation
      overlay: false, // Keine Fehler-Overlays die Reloads auslösen
      clientPort: 5177,
      // KRITISCH: Deaktiviere automatische Reloads komplett
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      // Reduziere Watch-Aktivität um Reloads zu vermeiden
      usePolling: false,
      interval: 5000, // Sehr langes Interval (5 Sekunden) um Reloads zu vermeiden
      // Ignoriere bestimmte Dateien die Reloads auslösen könnten
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/public/gallery-data.json']
    },
    // Verhindere automatische Reloads bei Datei-Änderungen
    fs: {
      strict: false,
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600, // Erhöhe Limit auf 600 KB (war 500 KB)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
  // KRITISCH: Deaktiviere alle automatischen Reloads für stabile Kommunikation
  optimizeDeps: {
    // Verhindere automatische Neubuilds die Reloads auslösen
    force: false,
    // Keine automatische Neubewertung von Dependencies
    holdUntilCrawlEnd: true,
  },
  // Deaktiviere File-Watching das Reloads auslöst
  clearScreen: false,
})
