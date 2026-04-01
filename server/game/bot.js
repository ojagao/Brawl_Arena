const CONFIG = require('../config')
const { getAllCharacters } = require('../characters/characters')

const BOT_NAMES = ['Bot_Alpha', 'Bot_Bravo', 'Bot_Charlie', 'Bot_Delta', 'Bot_Echo']

function createBotId(index) {
  return `bot_${index}_${Date.now()}`
}

function createBotPlayers(existingCount, targetCount) {
  const characters = getAllCharacters()
  const bots = []

  for (let i = existingCount; i < targetCount; i++) {
    bots.push({
      id: createBotId(i),
      name: BOT_NAMES[i % BOT_NAMES.length],
      socketId: null,
      isBot: true
    })
  }

  return bots
}

function getBotCharacterSelection(bots) {
  const charIds = ['brawler', 'sniper', 'healer', 'speedster', 'bomber', 'shield', 'ninja', 'frost', 'gunner', 'mystic']
  const selections = {}

  bots.forEach((bot, i) => {
    selections[bot.id] = charIds[i % charIds.length]
  })

  return selections
}

function updateBotInputs(gameLoop, players) {
  for (const [id, player] of players) {
    if (!id.startsWith('bot_')) continue
    if (!player.alive) continue

    let nearestEnemy = null
    let nearestDist = Infinity

    for (const [otherId, other] of players) {
      if (other.team === player.team || !other.alive) continue
      const dx = other.x - player.x
      const dy = other.y - player.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestEnemy = other
      }
    }

    if (!nearestEnemy) {
      gameLoop.setInput(id, {
        moveAngle: Math.random() * Math.PI * 2,
        moveForce: 0.3,
        aimAngle: 0,
        aimForce: 0,
        aiming: false
      })
      continue
    }

    const dx = nearestEnemy.x - player.x
    const dy = nearestEnemy.y - player.y
    const angleToEnemy = Math.atan2(dy, dx)

    const wander = (Math.random() - 0.5) * 0.5
    const moveForce = nearestDist > 200 ? 0.8 : nearestDist < 80 ? 0.6 : 0.4
    const moveAngle = nearestDist < 80
      ? angleToEnemy + Math.PI + wander
      : angleToEnemy + wander

    gameLoop.setInput(id, {
      moveAngle,
      moveForce,
      aimAngle: angleToEnemy,
      aimForce: 0.8,
      aiming: true
    })

    if (nearestDist < 300 && Math.random() < 0.15) {
      gameLoop.queueShoot(id, {
        aimAngle: angleToEnemy,
        aimForce: 0.8
      })
    }
  }
}

module.exports = { createBotPlayers, getBotCharacterSelection, updateBotInputs }
