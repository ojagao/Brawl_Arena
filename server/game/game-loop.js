const CONFIG = require('../config')
const { movePlayer, moveProjectile, checkProjectileHit } = require('./physics')
const { getWallRects, isInBush } = require('../maps/maps')
const { createProjectiles } = require('./projectile')
const {
  applyDamage,
  applyExplosionDamage,
  processRespawns,
  processHealthRegen,
  processHealing,
  updateScores,
  checkWinCondition
} = require('./combat')
const { updatePlayer, serializeGameState, serializePlayerState } = require('./game-state')
const { getCharacter } = require('../characters/characters')
const { updateBotInputs } = require('./bot')

class GameLoop {
  constructor(room, io, roomManager, onGameEnd) {
    this.roomId = room.id
    this.io = io
    this.roomManager = roomManager
    this.onGameEnd = onGameEnd
    this.inputs = new Map()
    this.shootQueue = []
    this.intervalId = null
    this.lastTime = Date.now()
    this.tickCount = 0
    this.wallRects = getWallRects(room.gameState.map)
  }

  start() {
    this.lastTime = Date.now()
    this.intervalId = setInterval(() => this.tick(), CONFIG.TICK_INTERVAL)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  setInput(playerId, input) {
    this.inputs.set(playerId, {
      moveAngle: Number(input.moveAngle) || 0,
      moveForce: Math.max(0, Math.min(1, Number(input.moveForce) || 0)),
      aimAngle: Number(input.aimAngle) || 0,
      aimForce: Math.max(0, Math.min(1, Number(input.aimForce) || 0)),
      aiming: Boolean(input.aiming)
    })
  }

  queueShoot(playerId, data) {
    this.shootQueue.push({
      playerId,
      aimAngle: Number(data.aimAngle) || 0,
      aimForce: Math.max(0, Math.min(1, Number(data.aimForce) || 0))
    })
  }

  tick() {
    const now = Date.now()
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now
    this.tickCount++

    const room = this.roomManager.get(this.roomId)
    if (!room || room.state !== 'PLAYING' || !room.gameState) {
      this.stop()
      return
    }

    let state = room.gameState
    let allEvents = []

    updateBotInputs(this, state.players)

    let players = state.players
    for (const [id, player] of players) {
      const input = this.inputs.get(id)
      const moved = movePlayer(player, input, deltaTime, this.wallRects)
      players = new Map(players)
      players.set(id, moved)
    }

    let projectiles = []
    const expiredProjectiles = []
    for (const proj of state.projectiles) {
      const moved = moveProjectile(proj, deltaTime, this.wallRects)
      if (moved) {
        projectiles.push(moved)
      } else {
        expiredProjectiles.push(proj)
      }
    }

    let nextProjectileId = state.nextProjectileId
    const shootEvents = [...this.shootQueue]
    this.shootQueue = []

    for (const shoot of shootEvents) {
      const currentPlayer = players.get(shoot.playerId)
      if (!currentPlayer) continue
      const shootInput = { aimAngle: shoot.aimAngle, aimForce: shoot.aimForce, shoot: true }
      const result = createProjectiles(currentPlayer, shootInput, { ...state, nextProjectileId })

      if (result.projectiles.length > 0) {
        projectiles = [...projectiles, ...result.projectiles]
        nextProjectileId = result.nextId
        players = new Map(players)
        players.set(shoot.playerId, Object.freeze({
          ...currentPlayer,
          fireCooldown: result.cooldown,
          bushRevealUntil: now + 1000
        }))
      }
    }

    // Update aim state on players for display
    for (const [id, player] of players) {
      const input = this.inputs.get(id)
      if (input) {
        const character = getCharacter(player.characterId)
        players = new Map(players)
        players.set(id, Object.freeze({
          ...player,
          aiming: input.aiming,
          aimAngle: input.aiming ? input.aimAngle : player.aimAngle || 0,
          aimRange: character ? character.range : 0
        }))
      }
    }

    for (const [id, player] of players) {
      if (player.fireCooldown > 0) {
        players = new Map(players)
        players.set(id, Object.freeze({
          ...player,
          fireCooldown: Math.max(0, player.fireCooldown - deltaTime * 1000)
        }))
      }
    }

    const remainingProjectiles = []
    for (const proj of projectiles) {
      const hitPlayerId = checkProjectileHit(proj, players)
      if (hitPlayerId) {
        if (proj.type === 'explosive') {
          const result = applyExplosionDamage(proj, players, now)
          players = result.players
          allEvents = [...allEvents, ...result.events]
          allEvents.push({
            type: 'explosion',
            x: proj.x,
            y: proj.y,
            radius: proj.explosionRadius
          })
        } else {
          const target = players.get(hitPlayerId)
          const damaged = applyDamage(target, proj.damage, now, proj)
          players = new Map(players)
          players.set(hitPlayerId, damaged)

          allEvents.push({
            type: 'hit',
            x: proj.x,
            y: proj.y,
            team: proj.team,
            projectileType: proj.type
          })

          if (proj.slowEffect) {
            allEvents.push({
              type: 'slow',
              targetId: hitPlayerId,
              x: target.x,
              y: target.y
            })
          }

          if (!damaged.alive) {
            const killer = players.get(proj.ownerId)
            if (killer) {
              players.set(proj.ownerId, Object.freeze({ ...killer, kills: killer.kills + 1 }))
            }
            allEvents.push({
              type: 'kill',
              killerId: proj.ownerId,
              victimId: hitPlayerId,
              killerTeam: proj.team
            })
          }
        }
      } else {
        remainingProjectiles.push(proj)
      }
    }

    // Projectiles that expired by range or wall collision
    for (const proj of expiredProjectiles) {
      if (proj.type === 'explosive') {
        const result = applyExplosionDamage(proj, players, now)
        players = result.players
        allEvents = [...allEvents, ...result.events]
        allEvents.push({
          type: 'explosion',
          x: proj.x,
          y: proj.y,
          radius: proj.explosionRadius
        })
      }
    }

    players = processRespawns(players, deltaTime, state.map)
    players = processHealthRegen(players, deltaTime, now)
    players = processHealing(players, deltaTime)

    // Expire slow effects
    for (const [id, player] of players) {
      if (player.slowUntil && player.slowUntil <= now) {
        players = new Map(players)
        players.set(id, Object.freeze({ ...player, slowUntil: 0, slowAmount: 0 }))
      }
    }

    // Bush visibility check
    for (const [id, player] of players) {
      if (!player.alive) continue
      const onBush = isInBush(state.map, player.x, player.y)
      const revealed = player.bushRevealUntil > now
      const newInBush = onBush && !revealed
      if (player.inBush !== newInBush) {
        players = new Map(players)
        players.set(id, Object.freeze({ ...player, inBush: newInBush }))
      }
    }

    const newScores = updateScores(state.scores, allEvents)
    const newTimeRemaining = state.timeRemaining - deltaTime * 1000

    const newState = Object.freeze({
      ...state,
      tick: state.tick + 1,
      players,
      projectiles: remainingProjectiles,
      scores: newScores,
      timeRemaining: newTimeRemaining,
      events: allEvents,
      nextProjectileId
    })

    this.roomManager.updateGameState(this.roomId, newState)

    const serialized = serializeGameState(newState)
    this.io.to(`display:${this.roomId}`).emit('game:state', serialized)

    if (this.tickCount % 3 === 0) {
      for (const [id] of players) {
        const playerState = serializePlayerState(newState, id)
        if (playerState) {
          this.io.to(`player:${id}`).emit('game:player-state', playerState)
        }
      }
    }

    for (const event of allEvents) {
      if (event.type === 'kill') {
        this.io.to(this.roomId).emit('game:kill', event)
      }
    }

    if (allEvents.length > 0) {
      const effects = allEvents.filter(e =>
        e.type === 'explosion' || e.type === 'hit' || e.type === 'slow'
      )
      if (effects.length > 0) {
        this.io.to(`display:${this.roomId}`).emit('game:effects', effects)
      }
    }

    const winner = checkWinCondition(newScores, newTimeRemaining)
    if (winner) {
      this.stop()
      this.onGameEnd(this.roomId, winner, newScores)
    }
  }
}

module.exports = GameLoop
