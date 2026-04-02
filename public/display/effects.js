const EffectSystem = {
  effects: [],

  add(effect) {
    const now = performance.now()

    switch (effect.type) {
      case 'explosion':
        this.effects.push({
          type: 'explosion',
          x: effect.x,
          y: effect.y,
          radius: effect.radius,
          startTime: now,
          duration: 500
        })
        break

      case 'hit':
        this.effects.push({
          type: 'hit',
          x: effect.x,
          y: effect.y,
          team: effect.team,
          projectileType: effect.projectileType,
          startTime: now,
          duration: 300
        })
        break

      case 'slow':
        this.effects.push({
          type: 'slow',
          x: effect.x,
          y: effect.y,
          startTime: now,
          duration: 600
        })
        break

      case 'frost_impact':
        this.effects.push({
          type: 'frost_impact',
          x: effect.x,
          y: effect.y,
          startTime: now,
          duration: 400
        })
        break

      case 'bounce':
        this.effects.push({
          type: 'bounce',
          x: effect.x,
          y: effect.y,
          startTime: now,
          duration: 300
        })
        break
    }
  },

  update() {
    const now = performance.now()
    this.effects = this.effects.filter(e => now - e.startTime < e.duration)
  },

  draw(ctx) {
    const now = performance.now()

    for (const effect of this.effects) {
      const elapsed = now - effect.startTime
      const progress = elapsed / effect.duration

      ctx.save()

      switch (effect.type) {
        case 'explosion':
          this.drawExplosion(ctx, effect, progress)
          break
        case 'hit':
          this.drawHit(ctx, effect, progress)
          break
        case 'slow':
          this.drawSlow(ctx, effect, progress)
          break
        case 'frost_impact':
          this.drawFrostImpact(ctx, effect, progress)
          break
        case 'bounce':
          this.drawBounce(ctx, effect, progress)
          break
      }

      ctx.restore()
    }
  },

  drawExplosion(ctx, effect, progress) {
    const maxRadius = effect.radius
    const currentRadius = maxRadius * Math.min(1, progress * 2)
    const alpha = 1 - progress

    // Outer blast
    ctx.globalAlpha = alpha * 0.4
    ctx.fillStyle = '#f39c12'
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2)
    ctx.fill()

    // Inner fireball
    ctx.globalAlpha = alpha * 0.7
    ctx.fillStyle = '#e74c3c'
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, currentRadius * 0.6, 0, Math.PI * 2)
    ctx.fill()

    // Core flash
    if (progress < 0.3) {
      ctx.globalAlpha = (1 - progress / 0.3) * 0.9
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, currentRadius * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Shockwave ring
    ctx.globalAlpha = alpha * 0.5
    ctx.strokeStyle = '#f39c12'
    ctx.lineWidth = 3 * (1 - progress)
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, currentRadius * 1.2, 0, Math.PI * 2)
    ctx.stroke()

    // Debris particles
    if (progress < 0.7) {
      const particleCount = 8
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + progress * 2
        const dist = currentRadius * (0.5 + progress * 0.8)
        const px = effect.x + Math.cos(angle) * dist
        const py = effect.y + Math.sin(angle) * dist
        ctx.globalAlpha = alpha * 0.6
        ctx.fillStyle = i % 2 === 0 ? '#e67e22' : '#e74c3c'
        ctx.beginPath()
        ctx.arc(px, py, 3 * (1 - progress), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },

  drawHit(ctx, effect, progress) {
    const alpha = 1 - progress
    const teamColor = SHARED.TEAM_COLORS[effect.team] || '#fff'
    const charId = effect.characterId

    if (charId === 'sniper') {
      // Sniper: sharp penetrating impact
      ctx.globalAlpha = alpha * 0.9
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 12 * (1 - progress), 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha * 0.7
      ctx.strokeStyle = '#9b59b6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 18 * progress, 0, Math.PI * 2)
      ctx.stroke()
      // Cross-hair flash
      const len = 15 * (1 - progress)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(effect.x - len, effect.y)
      ctx.lineTo(effect.x + len, effect.y)
      ctx.moveTo(effect.x, effect.y - len)
      ctx.lineTo(effect.x, effect.y + len)
      ctx.stroke()
    } else if (charId === 'ninja') {
      // Ninja: slash marks
      ctx.globalAlpha = alpha * 0.8
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 3 * (1 - progress * 0.5)
      const slashLen = 18
      for (const offset of [-0.4, 0.4]) {
        const a = offset + progress * 0.5
        ctx.beginPath()
        ctx.moveTo(effect.x + Math.cos(a) * slashLen, effect.y + Math.sin(a) * slashLen)
        ctx.lineTo(effect.x - Math.cos(a) * slashLen, effect.y - Math.sin(a) * slashLen)
        ctx.stroke()
      }
      ctx.globalAlpha = alpha * 0.5
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 6 * (1 - progress), 0, Math.PI * 2)
      ctx.fill()
    } else if (charId === 'gunner') {
      // Gunner: small rapid sparks
      ctx.globalAlpha = alpha * 0.9
      ctx.fillStyle = '#ff0'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 5 * (1 - progress), 0, Math.PI * 2)
      ctx.fill()
      const sparkCount = 4
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 / sparkCount) * i + progress * 3
        const dist = 6 + progress * 12
        ctx.globalAlpha = alpha * 0.5
        ctx.fillStyle = '#f39c12'
        ctx.beginPath()
        ctx.arc(effect.x + Math.cos(angle) * dist, effect.y + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (charId === 'shield') {
      // Shield: heavy blunt impact
      ctx.globalAlpha = alpha * 0.6
      ctx.fillStyle = '#3498db'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 14 * (1 - progress * 0.3), 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha * 0.4
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 3 * (1 - progress)
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 20 * progress, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      // Default: standard spark impact
      ctx.globalAlpha = alpha * 0.8
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, 8 * (1 - progress * 0.5), 0, Math.PI * 2)
      ctx.fill()
      const sparkCount = 6
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 / sparkCount) * i
        const dist = 10 + progress * 20
        ctx.globalAlpha = alpha * 0.6
        ctx.fillStyle = teamColor
        ctx.beginPath()
        ctx.arc(effect.x + Math.cos(angle) * dist, effect.y + Math.sin(angle) * dist, 2 * (1 - progress), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },

  drawSlow(ctx, effect, progress) {
    const alpha = 1 - progress

    // Ice crystal effect
    ctx.globalAlpha = alpha * 0.5
    ctx.fillStyle = '#74b9ff'
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, 20 + progress * 10, 0, Math.PI * 2)
    ctx.fill()

    // Ice particles rising
    const particleCount = 6
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + progress * 3
      const dist = 12 + progress * 15
      const px = effect.x + Math.cos(angle) * dist
      const py = effect.y + Math.sin(angle) * dist - progress * 20
      ctx.globalAlpha = alpha * 0.7
      ctx.fillStyle = '#a8d8ea'

      // Diamond shape
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(angle + progress * 4)
      const size = 4 * (1 - progress * 0.5)
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.6, 0)
      ctx.lineTo(0, size)
      ctx.lineTo(-size * 0.6, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  },

  drawBounce(ctx, effect, progress) {
    const alpha = 1 - progress

    // Magic burst on bounce
    ctx.globalAlpha = alpha * 0.6
    ctx.fillStyle = '#a29bfe'
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, 12 * (1 - progress * 0.5), 0, Math.PI * 2)
    ctx.fill()

    // Purple ring expanding
    ctx.globalAlpha = alpha * 0.5
    ctx.strokeStyle = '#6c5ce7'
    ctx.lineWidth = 2 * (1 - progress)
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, 8 + progress * 18, 0, Math.PI * 2)
    ctx.stroke()

    // Star sparkles
    const count = 5
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + progress * 4
      const dist = 6 + progress * 16
      ctx.globalAlpha = alpha * 0.7
      ctx.fillStyle = '#dfe6e9'
      ctx.beginPath()
      ctx.arc(effect.x + Math.cos(angle) * dist, effect.y + Math.sin(angle) * dist, 2 * (1 - progress), 0, Math.PI * 2)
      ctx.fill()
    }
  },

  drawFrostImpact(ctx, effect, progress) {
    const alpha = 1 - progress

    // Ice burst circle
    const radius = 15 + progress * 20
    ctx.globalAlpha = alpha * 0.4
    ctx.fillStyle = '#74b9ff'
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Frost ring
    ctx.globalAlpha = alpha * 0.6
    ctx.strokeStyle = '#a8d8ea'
    ctx.lineWidth = 2 * (1 - progress)
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, radius * 1.2, 0, Math.PI * 2)
    ctx.stroke()

    // Ice shards scattering outward
    const shardCount = 8
    for (let i = 0; i < shardCount; i++) {
      const angle = (Math.PI * 2 / shardCount) * i
      const dist = 8 + progress * 25
      const px = effect.x + Math.cos(angle) * dist
      const py = effect.y + Math.sin(angle) * dist

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(angle + progress * 2)
      ctx.globalAlpha = alpha * 0.7
      ctx.fillStyle = i % 2 === 0 ? '#74b9ff' : '#dfe6e9'
      const size = 3 * (1 - progress * 0.5)
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.5, 0)
      ctx.lineTo(0, size)
      ctx.lineTo(-size * 0.5, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }
}
