const roomManager = require('../rooms/room-manager')
const { isFull, allSelected } = require('../rooms/room')
const { getAllCharacters } = require('../characters/characters')
const { createGameState } = require('../game/game-state')
const GameLoop = require('../game/game-loop')
const CONFIG = require('../config')

function setupLobbyHandler(io, activeGames) {
  io.on('connection', (socket) => {
    socket.on('room:join', (data) => {
      handleJoin(socket, io, data, activeGames)
    })

    socket.on('select:pick', (data) => {
      handleCharacterSelect(socket, io, data, activeGames)
    })
  })
}

function handleJoin(socket, io, data, activeGames) {
  const { roomId, playerName } = data
  if (!roomId || !playerName) {
    socket.emit('error', { message: 'Room ID and name required' })
    return
  }

  const sanitizedName = String(playerName).slice(0, 12).trim()
  if (!sanitizedName) {
    socket.emit('error', { message: 'Invalid name' })
    return
  }

  const player = {
    id: socket.id,
    name: sanitizedName,
    socketId: socket.id
  }

  const result = roomManager.join(roomId, player)
  if (result.error) {
    socket.emit('error', { message: result.error })
    return
  }

  socket.join(roomId)
  socket.join(`player:${socket.id}`)
  socket.data = { ...socket.data, playerId: socket.id }

  socket.emit('room:joined', {
    playerId: socket.id,
    team: result.room.players.find(p => p.id === socket.id)?.team,
    players: result.room.players
  })

  io.to(roomId).emit('room:player-joined', {
    players: result.room.players
  })

  if (isFull(result.room)) {
    startCharacterSelect(io, roomId, activeGames)
  }
}

function startCharacterSelect(io, roomId, activeGames) {
  const room = roomManager.transition(roomId, 'CHARACTER_SELECT')
  if (!room) return

  const characters = getAllCharacters()

  io.to(roomId).emit('room:state-change', { state: 'CHARACTER_SELECT' })
  io.to(roomId).emit('select:start', {
    characters,
    timeLimit: CONFIG.CHARACTER_SELECT_TIME
  })

  setTimeout(() => {
    const currentRoom = roomManager.get(roomId)
    if (currentRoom && currentRoom.state === 'CHARACTER_SELECT') {
      assignDefaultCharacters(currentRoom, roomId)
      startGame(io, roomId, activeGames)
    }
  }, CONFIG.CHARACTER_SELECT_TIME)
}

function assignDefaultCharacters(room, roomId) {
  const defaults = ['brawler', 'sniper', 'healer', 'speedster', 'bomber', 'shield']
  let idx = 0
  for (const player of room.players) {
    if (!room.selections[player.id]) {
      roomManager.selectCharacter(roomId, player.id, defaults[idx % defaults.length])
    }
    idx++
  }
}

function handleCharacterSelect(socket, io, data, activeGames) {
  const { characterId } = data
  const roomId = socket.data?.roomId
  if (!roomId) return

  const room = roomManager.get(roomId)
  if (!room || room.state !== 'CHARACTER_SELECT') return

  const updated = roomManager.selectCharacter(roomId, socket.id, characterId)
  if (!updated) return

  io.to(roomId).emit('select:update', {
    selections: updated.selections
  })

  if (allSelected(updated)) {
    startGame(io, roomId, activeGames)
  }
}

function startGame(io, roomId, activeGames) {
  const room = roomManager.get(roomId)
  if (!room || room.state === 'PLAYING') return

  const gameState = createGameState(room)
  const updated = roomManager.transition(roomId, 'PLAYING', { gameState })
  if (!updated) return

  const mapData = {
    width: gameState.map.width,
    height: gameState.map.height,
    tileSize: gameState.map.tileSize,
    tiles: gameState.map.tiles,
    spawns: gameState.map.spawns
  }

  io.to(roomId).emit('room:state-change', { state: 'PLAYING' })
  io.to(roomId).emit('game:start', {
    mapData,
    players: Array.from(gameState.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      team: p.team,
      characterId: p.characterId,
      x: p.x,
      y: p.y
    })),
    teams: updated.teams
  })

  const gameLoop = new GameLoop(updated, io, roomManager, handleGameEnd)
  activeGames.set(roomId, gameLoop)
  gameLoop.start()
}

let _ioRef = null

function handleGameEnd(roomId, winner, scores) {
  const room = roomManager.get(roomId)
  if (!room) return

  roomManager.transition(roomId, 'GAME_OVER')

  if (_ioRef) {
    _ioRef.to(roomId).emit('game:over', {
      winner,
      scores,
      players: room.gameState ? Array.from(room.gameState.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        team: p.team,
        kills: p.kills,
        deaths: p.deaths
      })) : []
    })
  }

  setTimeout(() => {
    roomManager.destroy(roomId)
  }, 10000)
}

function setIo(io) {
  _ioRef = io
}

module.exports = { setupLobbyHandler, setIo }
