const roomManager = require('../rooms/room-manager')

function setupConnectionHandler(io, activeGames) {
  io.on('connection', (socket) => {
    const { type, roomId } = socket.handshake.query

    if (type === 'display') {
      handleDisplayConnection(socket, io)
    } else if (type === 'controller') {
      handleControllerConnection(socket, io, roomId, activeGames)
    }

    socket.on('disconnect', () => {
      handleDisconnect(socket, io, activeGames)
    })
  })
}

function handleDisplayConnection(socket, io) {
  const room = roomManager.create()
  socket.join(room.id)
  socket.join(`display:${room.id}`)
  socket.data = { type: 'display', roomId: room.id }

  socket.emit('room:created', {
    roomId: room.id,
    players: room.players
  })
}

function handleControllerConnection(socket, io, roomId, activeGames) {
  if (!roomId) {
    socket.emit('error', { message: 'Room ID required' })
    return
  }

  socket.data = { type: 'controller', roomId, playerId: null }
  socket.emit('room:info', { roomId })
}

function handleDisconnect(socket, io, activeGames) {
  const playerId = socket.data?.playerId
  if (!playerId) return

  const result = roomManager.leave(playerId)
  if (!result) return

  if (result.destroyed) {
    const game = activeGames.get(socket.data.roomId)
    if (game) {
      game.stop()
      activeGames.delete(socket.data.roomId)
    }
    return
  }

  io.to(result.room.id).emit('room:player-left', {
    players: result.room.players
  })
}

module.exports = { setupConnectionHandler }
