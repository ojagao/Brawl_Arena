const { getCharacter } = require('../characters/characters')
const CONFIG = require('../config')

function createProjectiles(player, input, gameState) {
  if (!player.alive) return { projectiles: [], nextId: gameState.nextProjectileId }
  if (player.fireCooldown > 0) return { projectiles: [], nextId: gameState.nextProjectileId }
  if (!input || !input.shoot) return { projectiles: [], nextId: gameState.nextProjectileId }

  const character = getCharacter(player.characterId)
  const projectiles = []
  let nextId = gameState.nextProjectileId

  const count = character.projectileCount || 1
  const spread = character.spreadAngle || 0

  for (let i = 0; i < count; i++) {
    let angle = input.aimAngle
    if (count > 1) {
      const offset = spread * (i / (count - 1) - 0.5)
      angle += offset
    }

    const speed = character.projectileSpeed * 60
    const type = character.explosionRadius ? 'explosive'
      : character.bounceCount ? 'magic'
      : 'bullet'

    projectiles.push(Object.freeze({
      id: nextId++,
      ownerId: player.id,
      team: player.team,
      x: player.x + Math.cos(angle) * (character.radius + 6),
      y: player.y + Math.sin(angle) * (character.radius + 6),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      damage: character.damage,
      range: character.range,
      distanceTraveled: 0,
      type,
      explosionRadius: character.explosionRadius || 0,
      bounceCount: character.bounceCount || 0,
      slowEffect: character.slowEffect || 0,
      slowDuration: character.slowDuration || 0
    }))
  }

  return { projectiles, nextId, cooldown: character.fireRate }
}

module.exports = { createProjectiles }
