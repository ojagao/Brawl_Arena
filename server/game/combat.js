const CONFIG = require('../config')
const { getCharacter } = require('../characters/characters')

function applyDamage(player, damage, currentTime, projectile) {
  const newHealth = Math.max(0, player.health - damage)
  const slowUpdates = (projectile && projectile.slowEffect)
    ? { slowUntil: currentTime + projectile.slowDuration, slowAmount: projectile.slowEffect }
    : {}
  return Object.freeze({
    ...player,
    health: newHealth,
    alive: newHealth > 0,
    lastDamageTime: currentTime,
    deaths: newHealth <= 0 ? player.deaths + 1 : player.deaths,
    respawnTimer: newHealth <= 0 ? CONFIG.RESPAWN_TIME : player.respawnTimer,
    ...slowUpdates
  })
}

function applyExplosionDamage(projectile, players, currentTime) {
  const events = []
  const updatedPlayers = new Map(players)

  for (const [id, player] of players) {
    if (!player.alive) continue
    if (player.team === projectile.team) continue

    const dx = player.x - projectile.x
    const dy = player.y - projectile.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < projectile.explosionRadius + getCharacter(player.characterId).radius) {
      const damaged = applyDamage(player, projectile.damage, currentTime)
      updatedPlayers.set(id, damaged)

      if (!damaged.alive) {
        events.push({
          type: 'kill',
          killerId: projectile.ownerId,
          victimId: id,
          killerTeam: projectile.team
        })
      }
    }
  }

  return { players: updatedPlayers, events }
}

function processRespawns(players, deltaTime, map) {
  const updated = new Map(players)

  for (const [id, player] of players) {
    if (player.alive) continue
    if (player.respawnTimer <= 0) continue

    const newTimer = player.respawnTimer - deltaTime * 1000
    if (newTimer <= 0) {
      const spawns = player.team === 'red' ? map.spawns.red : map.spawns.blue
      const spawn = spawns[Math.floor(Math.random() * spawns.length)]
      const character = getCharacter(player.characterId)
      updated.set(id, Object.freeze({
        ...player,
        x: spawn.x,
        y: spawn.y,
        health: character.health,
        alive: true,
        respawnTimer: 0,
        lastDamageTime: 0
      }))
    } else {
      updated.set(id, Object.freeze({
        ...player,
        respawnTimer: newTimer
      }))
    }
  }

  return updated
}

function processHealthRegen(players, deltaTime, currentTime) {
  const updated = new Map(players)

  for (const [id, player] of players) {
    if (!player.alive) continue
    if (player.health >= player.maxHealth) continue
    if (currentTime - player.lastDamageTime < CONFIG.HEALTH_REGEN_DELAY) continue

    const newHealth = Math.min(player.maxHealth, player.health + CONFIG.HEALTH_REGEN_RATE * deltaTime)
    updated.set(id, Object.freeze({ ...player, health: newHealth }))
  }

  return updated
}

function processHealing(players, deltaTime) {
  const updated = new Map(players)

  for (const [, healer] of players) {
    if (!healer.alive) continue
    const character = getCharacter(healer.characterId)
    if (!character.healRadius) continue

    for (const [id, ally] of players) {
      if (id === healer.id) continue
      if (ally.team !== healer.team) continue
      if (!ally.alive) continue
      if (ally.health >= ally.maxHealth) continue

      const dx = ally.x - healer.x
      const dy = ally.y - healer.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < character.healRadius) {
        const current = updated.get(id) || ally
        const newHealth = Math.min(current.maxHealth, current.health + character.healRate * deltaTime)
        updated.set(id, Object.freeze({ ...current, health: newHealth }))
      }
    }
  }

  return updated
}

function updateScores(scores, events) {
  let redAdd = 0
  let blueAdd = 0

  for (const event of events) {
    if (event.type === 'kill') {
      if (event.killerTeam === 'red') redAdd++
      else blueAdd++
    }
  }

  if (redAdd === 0 && blueAdd === 0) return scores

  return Object.freeze({
    red: scores.red + redAdd,
    blue: scores.blue + blueAdd
  })
}

function checkWinCondition(scores, timeRemaining) {
  if (scores.red >= CONFIG.KILLS_TO_WIN) return 'red'
  if (scores.blue >= CONFIG.KILLS_TO_WIN) return 'blue'

  if (timeRemaining <= 0) {
    if (scores.red > scores.blue) return 'red'
    if (scores.blue > scores.red) return 'blue'
    return 'draw'
  }

  return null
}

module.exports = {
  applyDamage,
  applyExplosionDamage,
  processRespawns,
  processHealthRegen,
  processHealing,
  updateScores,
  checkWinCondition
}
