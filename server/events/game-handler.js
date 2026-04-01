function setupGameHandler(io, activeGames) {
  io.on('connection', (socket) => {
    socket.on('input:update', (data) => {
      const roomId = socket.data?.roomId
      if (!roomId) return

      const game = activeGames.get(roomId)
      if (!game) return

      game.setInput(socket.id, data)
    })

    socket.on('input:shoot', (data) => {
      const roomId = socket.data?.roomId
      if (!roomId) return

      const game = activeGames.get(roomId)
      if (!game) return

      game.queueShoot(socket.id, data)
    })
  })
}

module.exports = { setupGameHandler }
