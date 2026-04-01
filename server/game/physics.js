const CONFIG = require('../config')
const { getCharacter } = require('../characters/characters')
const { getWallRects } = require('../maps/maps')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw)
  const closestY = clamp(cy, ry, ry + rh)
  const dx = cx - closestX
  const dy = cy - closestY
  return (dx * dx + dy * dy) < (cr * cr)
}

function resolveCircleRect(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw)
  const closestY = clamp(cy, ry, ry + rh)
  const dx = cx - closestX
  const dy = cy - closestY
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) {
    return { x: rx - cr, y: cy }
  }

  if (dist < cr) {
    const overlap = cr - dist
    const nx = dx / dist
    const ny = dy / dist
    return {
      x: cx + nx * overlap,
      y: cy + ny * overlap
    }
  }

  return { x: cx, y: cy }
}

function movePlayer(player, input, deltaTime, wallRects) {
  if (!player.alive) return player

  const character = getCharacter(player.characterId)
  const speed = character.speed * 60

  let vx = 0
  let vy = 0

  if (input && input.moveForce > 0.1) {
    vx = Math.cos(input.moveAngle) * input.moveForce * speed
    vy = Math.sin(input.moveAngle) * input.moveForce * speed
  }

  let newX = player.x + vx * deltaTime
  let newY = player.y + vy * deltaTime

  newX = clamp(newX, character.radius, CONFIG.MAP_WIDTH - character.radius)
  newY = clamp(newY, character.radius, CONFIG.MAP_HEIGHT - character.radius)

  for (const rect of wallRects) {
    if (circleRectCollide(newX, newY, character.radius, rect.x, rect.y, rect.w, rect.h)) {
      const resolved = resolveCircleRect(newX, newY, character.radius, rect.x, rect.y, rect.w, rect.h)
      newX = resolved.x
      newY = resolved.y
    }
  }

  newX = clamp(newX, character.radius, CONFIG.MAP_WIDTH - character.radius)
  newY = clamp(newY, character.radius, CONFIG.MAP_HEIGHT - character.radius)

  let angle = player.angle
  if (input && input.aimForce > 0.1) {
    angle = input.aimAngle
  } else if (input && input.moveForce > 0.1) {
    angle = input.moveAngle
  }

  return Object.freeze({
    ...player,
    x: newX,
    y: newY,
    vx,
    vy,
    angle
  })
}

function moveProjectile(projectile, deltaTime, wallRects) {
  const newX = projectile.x + projectile.vx * deltaTime
  const newY = projectile.y + projectile.vy * deltaTime

  const distTraveled = projectile.distanceTraveled +
    Math.sqrt(Math.pow(projectile.vx * deltaTime, 2) + Math.pow(projectile.vy * deltaTime, 2))

  if (distTraveled > projectile.range) {
    return null
  }

  if (newX < 0 || newX > CONFIG.MAP_WIDTH || newY < 0 || newY > CONFIG.MAP_HEIGHT) {
    return null
  }

  for (const rect of wallRects) {
    if (circleRectCollide(newX, newY, 4, rect.x, rect.y, rect.w, rect.h)) {
      return null
    }
  }

  return Object.freeze({
    ...projectile,
    x: newX,
    y: newY,
    distanceTraveled: distTraveled
  })
}

function checkProjectileHit(projectile, players) {
  for (const [, player] of players) {
    if (!player.alive) continue
    if (player.team === projectile.team) continue
    if (player.id === projectile.ownerId) continue

    const character = getCharacter(player.characterId)
    const dx = player.x - projectile.x
    const dy = player.y - projectile.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < character.radius + 4) {
      return player.id
    }
  }
  return null
}

module.exports = { movePlayer, moveProjectile, checkProjectileHit, circleRectCollide, getWallRects }
