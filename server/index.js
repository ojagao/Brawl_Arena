const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const path = require('path')
const QRCode = require('qrcode')
const os = require('os')
const CONFIG = require('./config')
const { setupConnectionHandler } = require('./events/connection-handler')
const { setupLobbyHandler, setIo } = require('./events/lobby-handler')
const { setupGameHandler } = require('./events/game-handler')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

const activeGames = new Map()

setIo(io)

app.use('/shared', express.static(path.join(__dirname, '../public/shared')))
app.use('/display', express.static(path.join(__dirname, '../public/display')))
app.use('/controller', express.static(path.join(__dirname, '../public/controller')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/display/index.html'))
})

app.get('/control/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/controller/index.html'))
})

app.get('/api/qr/:roomId', async (req, res) => {
  try {
    const baseUrl = CONFIG.PUBLIC_URL || `http://${getLocalIp()}:${CONFIG.PORT}`
    const url = `${baseUrl}/control/${req.params.roomId}`
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
    res.json({ qr: qrDataUrl, url })
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' })
  }
})

setupConnectionHandler(io, activeGames)
setupLobbyHandler(io, activeGames)
setupGameHandler(io, activeGames)

function getLocalIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

server.listen(CONFIG.PORT, () => {
  const ip = getLocalIp()
  console.log(`Server running at http://${ip}:${CONFIG.PORT}`)
  console.log(`Display: http://localhost:${CONFIG.PORT}`)
})
