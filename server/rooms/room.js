const CONFIG = require('../config')

function createRoom(id) {
  return Object.freeze({
    id,
    state: 'WAITING',
    players: [],
    teams: Object.freeze({ red: [], blue: [] }),
    selections: Object.freeze({}),
    gameState: null,
    createdAt: Date.now()
  })
}

function addPlayer(room, player) {
  if (room.players.length >= CONFIG.MAX_PLAYERS) {
    return null
  }

  const team = room.teams.red.length <= room.teams.blue.length ? 'red' : 'blue'
  const newPlayer = Object.freeze({ ...player, team })
  const newPlayers = [...room.players, newPlayer]

  const newTeams = Object.freeze({
    red: team === 'red' ? [...room.teams.red, newPlayer.id] : [...room.teams.red],
    blue: team === 'blue' ? [...room.teams.blue, newPlayer.id] : [...room.teams.blue]
  })

  return Object.freeze({
    ...room,
    players: newPlayers,
    teams: newTeams
  })
}

function removePlayer(room, playerId) {
  const newPlayers = room.players.filter(p => p.id !== playerId)
  return Object.freeze({
    ...room,
    players: newPlayers,
    teams: Object.freeze({
      red: room.teams.red.filter(id => id !== playerId),
      blue: room.teams.blue.filter(id => id !== playerId)
    })
  })
}

function setSelection(room, playerId, characterId) {
  return Object.freeze({
    ...room,
    selections: Object.freeze({
      ...room.selections,
      [playerId]: characterId
    })
  })
}

function transitionTo(room, newState, updates = {}) {
  return Object.freeze({
    ...room,
    state: newState,
    ...updates
  })
}

function isFull(room) {
  return room.players.length >= CONFIG.MAX_PLAYERS
}

function allSelected(room) {
  return room.players.every(p => room.selections[p.id])
}

function getPlayerTeam(room, playerId) {
  const player = room.players.find(p => p.id === playerId)
  return player ? player.team : null
}

module.exports = {
  createRoom,
  addPlayer,
  removePlayer,
  setSelection,
  transitionTo,
  isFull,
  allSelected,
  getPlayerTeam
}
