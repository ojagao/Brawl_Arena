const { v4: uuidv4 } = require('uuid')
const { createRoom, addPlayer, removePlayer, setSelection, transitionTo, isFull } = require('./room')

class RoomManager {
  constructor() {
    this.rooms = new Map()
    this.playerRoomMap = new Map()
  }

  create() {
    const id = uuidv4().slice(0, 6).toUpperCase()
    const room = createRoom(id)
    this.rooms.set(id, room)
    return room
  }

  get(roomId) {
    return this.rooms.get(roomId) || null
  }

  getByPlayerId(playerId) {
    const roomId = this.playerRoomMap.get(playerId)
    return roomId ? this.get(roomId) : null
  }

  join(roomId, player) {
    const room = this.get(roomId)
    if (!room) return { error: 'Room not found' }
    if (room.state !== 'WAITING') return { error: 'Game already started' }

    const updated = addPlayer(room, player)
    if (!updated) return { error: 'Room is full' }

    this.rooms.set(roomId, updated)
    this.playerRoomMap.set(player.id, roomId)
    return { room: updated }
  }

  leave(playerId) {
    const roomId = this.playerRoomMap.get(playerId)
    if (!roomId) return null

    const room = this.get(roomId)
    if (!room) return null

    const updated = removePlayer(room, playerId)
    this.rooms.set(roomId, updated)
    this.playerRoomMap.delete(playerId)

    if (updated.players.length === 0) {
      this.rooms.delete(roomId)
      return { room: null, destroyed: true }
    }

    return { room: updated, destroyed: false }
  }

  selectCharacter(roomId, playerId, characterId) {
    const room = this.get(roomId)
    if (!room) return null

    const updated = setSelection(room, playerId, characterId)
    this.rooms.set(roomId, updated)
    return updated
  }

  transition(roomId, newState, updates = {}) {
    const room = this.get(roomId)
    if (!room) return null

    const updated = transitionTo(room, newState, updates)
    this.rooms.set(roomId, updated)
    return updated
  }

  updateGameState(roomId, gameState) {
    const room = this.get(roomId)
    if (!room) return null

    const updated = Object.freeze({ ...room, gameState })
    this.rooms.set(roomId, updated)
    return updated
  }

  destroy(roomId) {
    const room = this.get(roomId)
    if (!room) return

    for (const player of room.players) {
      this.playerRoomMap.delete(player.id)
    }
    this.rooms.delete(roomId)
  }
}

module.exports = new RoomManager()
