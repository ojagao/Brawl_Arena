const CharacterSprites = {
  draw(ctx, characterId, radius, angle, team) {
    const drawer = this.sprites[characterId]
    if (drawer) {
      drawer(ctx, radius, angle, team)
    } else {
      this.drawDefault(ctx, radius, team)
    }
  },

  drawDefault(ctx, radius, team) {
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()
  },

  sprites: {
    brawler(ctx, r, angle) {
      // Bulky red body
      ctx.fillStyle = '#e74c3c'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      // Darker inner ring (muscle tone)
      ctx.fillStyle = '#c0392b'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
      ctx.fill()

      // Fists (two circles on sides)
      ctx.save()
      ctx.rotate(angle)
      ctx.fillStyle = '#f5d6a8'
      ctx.beginPath()
      ctx.arc(r * 0.7, -r * 0.5, r * 0.32, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(r * 0.7, r * 0.5, r * 0.32, 0, Math.PI * 2)
      ctx.fill()

      // Angry eyes
      ctx.restore()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-r * 0.25, -r * 0.2, r * 0.18, 0, Math.PI * 2)
      ctx.arc(r * 0.25, -r * 0.2, r * 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.2, -r * 0.2, r * 0.09, 0, Math.PI * 2)
      ctx.arc(r * 0.3, -r * 0.2, r * 0.09, 0, Math.PI * 2)
      ctx.fill()

      // Mouth (grin)
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, r * 0.1, r * 0.3, 0.1, Math.PI - 0.1)
      ctx.stroke()
    },

    sniper(ctx, r, angle) {
      // Slim purple body
      ctx.fillStyle = '#9b59b6'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#8e44ad'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Scope/visor (one big eye)
      ctx.fillStyle = '#e8f0ff'
      ctx.beginPath()
      ctx.arc(0, -r * 0.15, r * 0.35, 0, Math.PI * 2)
      ctx.fill()

      // Crosshair in eye
      ctx.fillStyle = '#e74c3c'
      ctx.beginPath()
      ctx.arc(0, -r * 0.15, r * 0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#e74c3c'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.15 - r * 0.3)
      ctx.lineTo(0, -r * 0.15 + r * 0.3)
      ctx.moveTo(-r * 0.3, -r * 0.15)
      ctx.lineTo(r * 0.3, -r * 0.15)
      ctx.stroke()

      // Rifle barrel
      ctx.save()
      ctx.rotate(angle)
      ctx.fillStyle = '#555'
      ctx.fillRect(r * 0.3, -r * 0.1, r * 1.0, r * 0.2)
      ctx.fillStyle = '#333'
      ctx.fillRect(r * 1.1, -r * 0.13, r * 0.25, r * 0.26)
      ctx.restore()
    },

    healer(ctx, r, angle) {
      // Green body
      ctx.fillStyle = '#2ecc71'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#27ae60'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Cross symbol
      ctx.fillStyle = '#fff'
      ctx.fillRect(-r * 0.12, -r * 0.45, r * 0.24, r * 0.55)
      ctx.fillRect(-r * 0.35, -r * 0.28, r * 0.7, r * 0.22)

      // Gentle eyes
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.25, r * 0.1, r * 0.08, 0, Math.PI * 2)
      ctx.arc(r * 0.25, r * 0.1, r * 0.08, 0, Math.PI * 2)
      ctx.fill()

      // Smile
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(0, r * 0.2, r * 0.2, 0.2, Math.PI - 0.2)
      ctx.stroke()
    },

    speedster(ctx, r, angle) {
      // Orange body
      ctx.fillStyle = '#f39c12'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#e67e22'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Lightning bolt
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(-r * 0.1, -r * 0.55)
      ctx.lineTo(r * 0.15, -r * 0.1)
      ctx.lineTo(-r * 0.05, -r * 0.1)
      ctx.lineTo(r * 0.1, r * 0.5)
      ctx.lineTo(-r * 0.15, r * 0.05)
      ctx.lineTo(r * 0.05, r * 0.05)
      ctx.closePath()
      ctx.fill()

      // Speed lines (behind)
      ctx.save()
      ctx.rotate(angle + Math.PI)
      ctx.strokeStyle = '#fff'
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 1.5
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(r * 0.8, i * r * 0.3)
        ctx.lineTo(r * 1.4, i * r * 0.3)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.restore()
    },

    bomber(ctx, r, angle) {
      // Dark orange body (bomb shape)
      ctx.fillStyle = '#e67e22'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#d35400'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
      ctx.fill()

      // Bomb fuse on top
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.7)
      ctx.quadraticCurveTo(r * 0.3, -r * 1.1, r * 0.1, -r * 1.2)
      ctx.stroke()

      // Spark at fuse tip
      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.arc(r * 0.1, -r * 1.2, r * 0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e74c3c'
      ctx.beginPath()
      ctx.arc(r * 0.1, -r * 1.2, r * 0.08, 0, Math.PI * 2)
      ctx.fill()

      // Skull face
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.1, r * 0.16, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.1, r * 0.16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.1, r * 0.08, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.1, r * 0.08, 0, Math.PI * 2)
      ctx.fill()

      // Grin
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, r * 0.15, r * 0.25, 0.1, Math.PI - 0.1)
      ctx.stroke()
    },

    shield(ctx, r, angle) {
      // Blue body (armored)
      ctx.fillStyle = '#3498db'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#2980b9'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
      ctx.fill()

      // Shield emblem
      ctx.fillStyle = '#e8f4fd'
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.5)
      ctx.lineTo(-r * 0.4, -r * 0.2)
      ctx.lineTo(-r * 0.4, r * 0.15)
      ctx.quadraticCurveTo(0, r * 0.55, 0, r * 0.55)
      ctx.quadraticCurveTo(0, r * 0.55, r * 0.4, r * 0.15)
      ctx.lineTo(r * 0.4, -r * 0.2)
      ctx.closePath()
      ctx.fill()

      // Shield stripe
      ctx.fillStyle = '#3498db'
      ctx.fillRect(-r * 0.1, -r * 0.35, r * 0.2, r * 0.7)

      // Determined eyes (above shield)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-r * 0.2, -r * 0.55, r * 0.1, 0, Math.PI * 2)
      ctx.arc(r * 0.2, -r * 0.55, r * 0.1, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.2, -r * 0.55, r * 0.05, 0, Math.PI * 2)
      ctx.arc(r * 0.2, -r * 0.55, r * 0.05, 0, Math.PI * 2)
      ctx.fill()
    },

    ninja(ctx, r, angle) {
      // Dark body
      ctx.fillStyle = '#2c3e50'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1a252f'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Mask band (horizontal stripe across eyes)
      ctx.fillStyle = '#c0392b'
      ctx.fillRect(-r * 0.65, -r * 0.3, r * 1.3, r * 0.3)

      // Glowing eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(-r * 0.25, -r * 0.15, r * 0.18, r * 0.08, -0.15, 0, Math.PI * 2)
      ctx.ellipse(r * 0.25, -r * 0.15, r * 0.18, r * 0.08, 0.15, 0, Math.PI * 2)
      ctx.fill()

      // Shuriken on back
      ctx.save()
      ctx.rotate(angle + Math.PI)
      ctx.fillStyle = '#95a5a6'
      const sr = r * 0.25
      for (let i = 0; i < 4; i++) {
        ctx.save()
        ctx.rotate((Math.PI / 2) * i)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-sr * 0.3, -sr)
        ctx.lineTo(0, -sr * 0.6)
        ctx.lineTo(sr * 0.3, -sr)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ctx.restore()

      // Headband tails
      ctx.save()
      ctx.rotate(angle + Math.PI)
      ctx.strokeStyle = '#c0392b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(r * 0.5, -r * 0.2)
      ctx.quadraticCurveTo(r * 1.0, -r * 0.1, r * 1.2, -r * 0.35)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(r * 0.5, -r * 0.05)
      ctx.quadraticCurveTo(r * 0.9, r * 0.1, r * 1.1, -r * 0.1)
      ctx.stroke()
      ctx.restore()
    },

    frost(ctx, r, angle) {
      // Icy blue body
      ctx.fillStyle = '#74b9ff'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0984e3'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Ice crystal pattern (6-pointed star)
      ctx.strokeStyle = '#dfe6e9'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55)
        ctx.stroke()
        // Small branches
        const bx = Math.cos(a) * r * 0.35
        const by = Math.sin(a) * r * 0.35
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + Math.cos(a + 0.6) * r * 0.15, by + Math.sin(a + 0.6) * r * 0.15)
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + Math.cos(a - 0.6) * r * 0.15, by + Math.sin(a - 0.6) * r * 0.15)
        ctx.stroke()
      }

      // Cold eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.15, r * 0.15, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.15, r * 0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#00cec9'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.15, r * 0.08, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.15, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
    },

    gunner(ctx, r, angle) {
      // Military green body
      ctx.fillStyle = '#6c7a3a'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#556b2f'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Helmet
      ctx.fillStyle = '#4a5a2a'
      ctx.beginPath()
      ctx.arc(0, -r * 0.15, r * 0.7, Math.PI, 0)
      ctx.fill()

      // Gatling barrel
      ctx.save()
      ctx.rotate(angle)
      ctx.fillStyle = '#555'
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(r * 0.4, i * r * 0.15 - r * 0.05, r * 0.9, r * 0.1)
      }
      ctx.fillStyle = '#444'
      ctx.beginPath()
      ctx.arc(r * 0.4, 0, r * 0.28, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Tough eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-r * 0.2, -r * 0.05, r * 0.12, 0, Math.PI * 2)
      ctx.arc(r * 0.2, -r * 0.05, r * 0.12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.2, -r * 0.05, r * 0.06, 0, Math.PI * 2)
      ctx.arc(r * 0.2, -r * 0.05, r * 0.06, 0, Math.PI * 2)
      ctx.fill()

      // Ammo belt
      ctx.fillStyle = '#b8860b'
      for (let i = 0; i < 4; i++) {
        const bx = -r * 0.45 + i * r * 0.22
        ctx.fillRect(bx, r * 0.25, r * 0.12, r * 0.18)
      }
    },

    mystic(ctx, r, angle) {
      // Purple magic body
      ctx.fillStyle = '#6c5ce7'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#5f3dc4'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
      ctx.fill()

      // Wizard hat (triangle on top)
      ctx.fillStyle = '#4a2d8a'
      ctx.beginPath()
      ctx.moveTo(0, -r * 1.4)
      ctx.lineTo(-r * 0.45, -r * 0.5)
      ctx.lineTo(r * 0.45, -r * 0.5)
      ctx.closePath()
      ctx.fill()

      // Hat brim
      ctx.fillStyle = '#3d2570'
      ctx.beginPath()
      ctx.ellipse(0, -r * 0.5, r * 0.6, r * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()

      // Star on hat
      ctx.fillStyle = '#f1c40f'
      const sx = 0, sy = -r * 0.85
      const sp = r * 0.12
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (Math.PI * 2 / 5) * i
        const ax = sx + Math.cos(a) * sp
        const ay = sy + Math.sin(a) * sp
        if (i === 0) ctx.moveTo(ax, ay)
        else ctx.lineTo(ax, ay)
        const b = a + Math.PI / 5
        ctx.lineTo(sx + Math.cos(b) * sp * 0.4, sy + Math.sin(b) * sp * 0.4)
      }
      ctx.closePath()
      ctx.fill()

      // Glowing eyes
      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.1, r * 0.12, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.1, r * 0.12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(-r * 0.22, -r * 0.1, r * 0.05, 0, Math.PI * 2)
      ctx.arc(r * 0.22, -r * 0.1, r * 0.05, 0, Math.PI * 2)
      ctx.fill()

      // Magic orbs orbiting
      const time = performance.now() / 600
      ctx.globalAlpha = 0.7
      for (let i = 0; i < 3; i++) {
        const orbAngle = time + (Math.PI * 2 / 3) * i
        const ox = Math.cos(orbAngle) * r * 1.1
        const oy = Math.sin(orbAngle) * r * 1.1
        ctx.fillStyle = ['#f1c40f', '#e74c3c', '#00cec9'][i]
        ctx.beginPath()
        ctx.arc(ox, oy, r * 0.1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  },

  drawPreview(ctx, characterId, x, y, size) {
    ctx.save()
    ctx.translate(x, y)
    const r = size / 2
    this.draw(ctx, characterId, r, 0, null)
    ctx.restore()
  }
}
