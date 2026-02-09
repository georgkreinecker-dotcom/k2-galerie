const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const KEY_FILE = path.join(process.env.HOME || '', '.k2-galerie', 'openai-key.txt')
const KEY_FILE_USER_DATA = path.join(app.getPath('userData'), 'openai-key.txt')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readKeyFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim() || null
    }
  } catch (_) {}
  return null
}

function getStoredKey() {
  return readKeyFromFile(KEY_FILE) || readKeyFromFile(KEY_FILE_USER_DATA)
}

function writeKey(key) {
  const trimmed = (key || '').trim()
  ensureDir(path.dirname(KEY_FILE))
  ensureDir(path.dirname(KEY_FILE_USER_DATA))
  if (trimmed) {
    fs.writeFileSync(KEY_FILE, trimmed, 'utf8')
    fs.writeFileSync(KEY_FILE_USER_DATA, trimmed, 'utf8')
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#03040a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  const isDev = process.argv.includes('--dev')
  if (isDev) {
    win.loadURL('http://localhost:5175/#/dialog')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/dialog',
    })
  }

  win.setMenuBarVisibility(false)
}

ipcMain.handle('get-api-key', () => Promise.resolve(getStoredKey()))
ipcMain.handle('set-api-key', (_event, key) => {
  writeKey(key)
  return Promise.resolve()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
