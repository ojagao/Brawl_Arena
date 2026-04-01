const CONFIG = require('../config')
const { getCharacter } = require('../characters/characters')
const { MAPS } = require('../maps/maps')

function createPlayerState(player, spawnPoint, characterId) {
  const character = getCharacter(characterId)
  return Object.freeze({
    id: player.id,
    name: player.name,
    team: player.team,
    characterId,
    x: spawnPoint.x,
    y: spawnPoint.y,
    angle: player.team === 'red' ? 0 : Math.PI,
    vx: 0,
    vy: 0,
    health: character.health,
    maxHealth: character.health,
    alive: true,
    respawnTimer: 0,
    fireCooldown: 0,
    lastDamageTime: 0,
    kills: 0,
    deaths: 0,
    slowUntil: 0,
    slowAmount: 0
  })
}

function createGameState(room) {
  const map = MAPS.arena_1
  const players = new Map()

  const redIndex = { current: 0 }
  const blueIndex = { current: 0 }

  for (const player of room.players) {
    const characterId = room.selections[player.id] || 'brawler'
    const isRed = player.team === 'red'
    const spawnIdx = isRed ? redIndex : blueIndex
    const spawns = isRed ? map.spawns.red : map.spawns.blue
    const spawnPoint = spawns[spawnIdx.current % spawns.length]
    spawnIdx.current++

    players.set(player.id, createPlayerState(player, spawnPoint, characterId))
  }

  return Object.freeze({
    tick: 0,
    map,
    players,
    projectiles: [],
    scores: Object.freeze({ red: 0, blue: 0 }),
    timeRemaining: CONFIG.GAME_DURATION,
    events: [],
    nextProjectileId: 1
  })
}

function updatePlayer(players, playerId, updates) {
  const newPlayers = new Map(players)
  const player = players.get(playerId)
  if (!player) return newPlayers
  newPlayers.set(playerId, Object.freeze({ ...player, ...updates }))
  return newPlayers
}

function serializeGameState(state) {
  const players = []
  for (const [, player] of state.players) {
    players.push({
      id: player.id,
      name: player.name,
      team: player.team,
      characterId: player.characterId,
      x: Math.round(player.x * 10) / 10,
      y: Math.round(player.y * 10) / 10,
      angle: Math.round(player.angle * 100) / 100,
      health: Math.round(player.health),
      maxHealth: player.maxHealth,
      alive: player.alive,
      kills: player.kills,
      deaths: player.deaths,
      aiming: player.aiming || false,
      aimAngle: Math.round((player.aimAngle || 0) * 100) / 100,
      aimRange: player.aimRange || 0
    })
  }

  return {
    tick: state.tick,
    players,
    projectiles: state.projectiles.map(p => ({
      id: p.id,
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      angle: Math.round(p.angle * 100) / 100,
      type: p.type,
      team: p.team
    })),
    scores: state.scores,
    timeRemaining: Math.round(state.timeRemaining),
    events: state.events
  }
}

function serializePlayerState(state, playerId) {
  const player = state.players.get(playerId)
  if (!player) return null
  return {
    health: Math.round(player.health),
    maxHealth: player.maxHealth,
    alive: player.alive,
    respawnIn: Math.max(0, Math.round(player.respawnTimer)),
    scores: state.scores,
    kills: player.kills,
    deaths: player.deaths,
    timeRemaining: Math.round(state.timeRemaining)
  }
}

module.exports = {
  createGameState,
  createPlayerState,
  updatePlayer,
  serializeGameState,
  serializePlayerState
}
