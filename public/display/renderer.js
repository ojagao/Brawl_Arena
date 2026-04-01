const GameRenderer = {
  canvas: null,
  ctx: null,
  mapData: null,
  prevState: null,
  currentState: null,
  stateTimestamp: 0,
  animationId: null,

  init() {
    this.canvas = document.getElementById('game-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', () => this.resize())
  },

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  },

  setMap(mapData) {
    this.mapData = mapData
  },

  updateState(state) {
    this.prevState = this.currentState
    this.currentState = state
    this.stateTimestamp = performance.now()
  },

  start() {
    this.canvas.style.display = 'block'
    this.render()
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  },

  render() {
    this.animationId = requestAnimationFrame(() => this.render())

    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.fillStyle = '#2c3e50'
    ctx.fillRect(0, 0, w, h)

    if (!this.currentState || !this.mapData) return

    const scaleX = w / (this.mapData.width * this.mapData.tileSize)
    const scaleY = h / (this.mapData.height * this.mapData.tileSize)
    const scale = Math.min(scaleX, scaleY)

    const mapPixelW = this.mapData.width * this.mapData.tileSize * scale
    const mapPixelH = this.mapData.height * this.mapData.tileSize * scale
    const offsetX = (w - mapPixelW) / 2
    const offsetY = (h - mapPixelH) / 2

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    this.drawMap(ctx)

    const t = this.prevState
      ? Math.min((performance.now() - this.stateTimestamp) / (1000 / 60), 1.0)
      : 1.0
    const state = this.interpolateState(t)

    this.drawAimLines(ctx, state.players)
    this.drawHealAuras(ctx, state.players)
    this.drawProjectiles(ctx, state.projectiles)
    this.drawPlayers(ctx, state.players)

    EffectSystem.update()
    EffectSystem.draw(ctx)

    ctx.restore()
  },

  interpolateState(t) {
    if (!this.prevState || !this.currentState) {
      return this.currentState
    }

    const players = this.currentState.players.map((current) => {
      const prev = this.prevState.players.find(p => p.id === current.id)
      if (!prev) return current
      return {
        ...current,
        x: MathUtils.lerp(prev.x, current.x, t),
        y: MathUtils.lerp(prev.y, current.y, t),
        angle: MathUtils.lerpAngle(prev.angle, current.angle, t)
      }
    })

    return { ...this.currentState, players }
  },

  drawMap(ctx) {
    const { tiles, tileSize } = this.mapData

    for (let r = 0; r < tiles.length; r++) {
      for (let c = 0; c < tiles[r].length; c++) {
        const tile = tiles[r][c]
        const x = c * tileSize
        const y = r * tileSize

        if (tile === 0) {
          ctx.fillStyle = '#3d5a40'
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.strokeStyle = '#355035'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, tileSize, tileSize)
        } else if (tile === 1) {
          ctx.fillStyle = '#8B7355'
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.strokeStyle = '#6B5335'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, tileSize, tileSize)
          ctx.fillStyle = '#7B6345'
          ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)
        } else if (tile === 2) {
          ctx.fillStyle = '#3d5a40'
          ctx.fillRect(x, y, tileSize, tileSize)
          ctx.fillStyle = 'rgba(34, 139, 34, 0.4)'
          ctx.beginPath()
          ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(0, 128, 0, 0.3)'
          ctx.beginPath()
          ctx.arc(x + tileSize / 3, y + tileSize / 3, tileSize / 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  },

  drawPlayers(ctx, players) {
    for (const player of players) {
      if (!player.alive) {
        this.drawDeadMarker(ctx, player)
        continue
      }

      if (player.inBush) continue

      const teamColor = SHARED.TEAM_COLORS[player.team]
      const radius = 18

      ctx.save()
      ctx.translate(player.x, player.y)

      // Shadow
      ctx.fillStyle = teamColor
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.arc(0, 2, radius + 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Team border ring
      ctx.strokeStyle = teamColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, radius + 1, 0, Math.PI * 2)
      ctx.stroke()

      // Slow indicator
      if (player.slowed) {
        ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 200) * 0.1
        ctx.fillStyle = '#74b9ff'
        ctx.beginPath()
        ctx.arc(0, 0, radius + 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Character sprite
      CharacterSprites.draw(ctx, player.characterId, radius, player.angle, player.team)

      const healthPercent = player.health / player.maxHealth
      const barWidth = 36
      const barHeight = 5
      const barY = -radius - 12

      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2)

      ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c'
      ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight)

      // Cooldown gauge
      if (player.fireCooldown > 0 && player.fireRate > 0) {
        const cdPercent = player.fireCooldown / player.fireRate
        const cdBarWidth = 36
        const cdBarHeight = 3
        const cdBarY = barY - 8

        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(-cdBarWidth / 2 - 1, cdBarY - 1, cdBarWidth + 2, cdBarHeight + 2)

        ctx.fillStyle = '#f39c12'
        ctx.fillRect(-cdBarWidth / 2, cdBarY, cdBarWidth * (1 - cdPercent), cdBarHeight)
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(player.name, 0, -radius - 22)

      ctx.restore()
    }
  },

  drawDeadMarker(ctx, player) {
    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#666'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('X', 0, 6)
    ctx.globalAlpha = 1
    ctx.restore()
  },

  drawAimLines(ctx, players) {
    for (const player of players) {
      if (!player.alive || !player.aiming || !player.aimRange || player.inBush) continue

      const teamColor = SHARED.TEAM_COLORS[player.team]
      const range = player.aimRange
      const angle = player.aimAngle
      const charInfo = SHARED.CHARACTERS[player.characterId] || {}
      const radius = 18

      const startX = player.x + Math.cos(angle) * (radius + 4)
      const startY = player.y + Math.sin(angle) * (radius + 4)
      const endX = player.x + Math.cos(angle) * range
      const endY = player.y + Math.sin(angle) * range

      ctx.save()

      // Aim line with gradient fade
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
      gradient.addColorStop(0, teamColor + 'AA')
      gradient.addColorStop(0.7, teamColor + '44')
      gradient.addColorStop(1, teamColor + '00')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.setLineDash([8, 6])
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      ctx.setLineDash([])

      // Range indicator circle at end
      ctx.globalAlpha = 0.15
      ctx.fillStyle = teamColor
      ctx.beginPath()
      ctx.arc(endX, endY, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Spread indicators for multi-shot characters
      const charData = SHARED.CHARACTERS[player.characterId]
      if (charData && (player.characterId === 'brawler' || player.characterId === 'ninja')) {
        const spreadAngle = player.characterId === 'brawler' ? Math.PI / 12 : Math.PI / 20
        for (const offset of [-spreadAngle / 2, spreadAngle / 2]) {
          const sAngle = angle + offset
          const sEndX = player.x + Math.cos(sAngle) * range
          const sEndY = player.y + Math.sin(sAngle) * range
          ctx.strokeStyle = teamColor + '44'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(sEndX, sEndY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Explosion radius indicator for bomber
      if (player.characterId === 'bomber') {
        ctx.globalAlpha = 0.1
        ctx.fillStyle = '#e67e22'
        ctx.beginPath()
        ctx.arc(endX, endY, 60, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.3
        ctx.strokeStyle = '#e67e22'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // Slow range indicator for frost
      if (player.characterId === 'frost') {
        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#74b9ff'
        ctx.beginPath()
        ctx.arc(endX, endY, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.4
        ctx.strokeStyle = '#74b9ff'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(endX, endY, 15, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Bounce indicator for mystic
      if (player.characterId === 'mystic') {
        ctx.globalAlpha = 0.3
        ctx.fillStyle = '#6c5ce7'
        ctx.beginPath()
        ctx.arc(endX, endY, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = '#a29bfe'
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.arc(endX, endY, 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      ctx.restore()
    }
  },

  drawHealAuras(ctx, players) {
    for (const player of players) {
      if (!player.alive || player.characterId !== 'healer' || player.inBush) continue

      const healRadius = 100
      const pulse = (Math.sin(performance.now() / 400) + 1) / 2

      ctx.save()
      ctx.translate(player.x, player.y)

      // Pulsing heal circle
      ctx.globalAlpha = 0.08 + pulse * 0.07
      ctx.fillStyle = '#2ecc71'
      ctx.beginPath()
      ctx.arc(0, 0, healRadius, 0, Math.PI * 2)
      ctx.fill()

      // Ring
      ctx.globalAlpha = 0.2 + pulse * 0.15
      ctx.strokeStyle = '#2ecc71'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.arc(0, 0, healRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.globalAlpha = 1
      ctx.restore()
    }
  },

  drawProjectiles(ctx, projectiles) {
    for (const proj of projectiles) {
      const color = SHARED.TEAM_COLORS[proj.team] || '#fff'

      ctx.save()
      ctx.translate(proj.x, proj.y)

      if (proj.type === 'explosive') {
        ctx.fillStyle = '#f39c12'
        ctx.beginPath()
        ctx.arc(0, 0, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#e74c3c'
        ctx.beginPath()
        ctx.arc(0, 0, 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (proj.type === 'magic') {
        ctx.fillStyle = '#6c5ce7'
        ctx.shadowColor = '#a29bfe'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(0, 0, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(0, 0, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.restore()
    }
  }
}
