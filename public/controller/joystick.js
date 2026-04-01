const JoystickController = {
  canvas: null,
  ctx: null,
  leftStick: null,
  rightStick: null,
  touches: new Map(),
  onInput: null,
  onShoot: null,
  sendInterval: null,
  lastAimAngle: 0,

  init(onInput, onShoot) {
    this.onInput = onInput
    this.onShoot = onShoot
    this.canvas = document.getElementById('joystick-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.setupTouch()
    this.startSending()
    this.render()
  },

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  },

  setupTouch() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      for (const touch of e.changedTouches) {
        this.handleTouchStart(touch)
      }
    }, { passive: false })

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      for (const touch of e.changedTouches) {
        this.handleTouchMove(touch)
      }
    }, { passive: false })

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      for (const touch of e.changedTouches) {
        this.handleTouchEnd(touch)
      }
    }, { passive: false })

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault()
      for (const touch of e.changedTouches) {
        this.handleTouchEnd(touch)
      }
    }, { passive: false })
  },

  handleTouchStart(touch) {
    const x = touch.clientX
    const y = touch.clientY
    const isLeft = x < this.canvas.width / 2

    const stick = {
      id: touch.identifier,
      side: isLeft ? 'left' : 'right',
      originX: x,
      originY: y,
      currentX: x,
      currentY: y,
      angle: 0,
      force: 0,
    }

    this.touches.set(touch.identifier, stick)

    if (isLeft) {
      this.leftStick = stick
    } else {
      this.rightStick = stick
    }
  },

  handleTouchMove(touch) {
    const stick = this.touches.get(touch.identifier)
    if (!stick) return

    stick.currentX = touch.clientX
    stick.currentY = touch.clientY

    const dx = stick.currentX - stick.originX
    const dy = stick.currentY - stick.originY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 70

    stick.angle = Math.atan2(dy, dx)
    stick.force = Math.min(dist / maxDist, 1)
  },

  handleTouchEnd(touch) {
    const stick = this.touches.get(touch.identifier)
    if (!stick) return

    if (stick.side === 'left' && this.leftStick === stick) {
      this.leftStick = null
    }
    if (stick.side === 'right' && this.rightStick === stick) {
      if (stick.force > 0.15 && this.onShoot) {
        this.onShoot({ aimAngle: stick.angle, aimForce: stick.force })
      }
      this.rightStick = null
    }

    this.touches.delete(touch.identifier)
  },

  getInput() {
    const aiming = this.rightStick !== null && this.rightStick.force > 0.1
    if (aiming) {
      this.lastAimAngle = this.rightStick.angle
    }
    return {
      moveAngle: this.leftStick ? this.leftStick.angle : 0,
      moveForce: this.leftStick ? this.leftStick.force : 0,
      aimAngle: aiming ? this.rightStick.angle : this.lastAimAngle,
      aimForce: aiming ? this.rightStick.force : 0,
      aiming
    }
  },

  startSending() {
    this.sendInterval = setInterval(() => {
      if (this.onInput) {
        this.onInput(this.getInput())
      }
    }, 1000 / 30)
  },

  stop() {
    if (this.sendInterval) {
      clearInterval(this.sendInterval)
      this.sendInterval = null
    }
  },

  render() {
    requestAnimationFrame(() => this.render())

    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fillRect(0, 0, w / 2, h)

    ctx.setLineDash([4, 4])
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
    ctx.setLineDash([])

    if (!this.leftStick && !this.rightStick) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('MOVE', w / 4, h / 2)
      ctx.fillText('AIM & SHOOT', w * 3 / 4, h / 2)
    }

    this.drawStick(ctx, this.leftStick, 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.5)')
    this.drawStick(ctx, this.rightStick, 'rgba(231,76,60,0.2)', 'rgba(231,76,60,0.6)')
  },

  drawStick(ctx, stick, baseColor, knobColor) {
    if (!stick) return

    const maxDist = 70

    ctx.beginPath()
    ctx.arc(stick.originX, stick.originY, maxDist, 0, Math.PI * 2)
    ctx.fillStyle = baseColor
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.stroke()

    const knobX = stick.originX + Math.cos(stick.angle) * stick.force * maxDist
    const knobY = stick.originY + Math.sin(stick.angle) * stick.force * maxDist

    ctx.beginPath()
    ctx.arc(knobX, knobY, 28, 0, Math.PI * 2)
    ctx.fillStyle = knobColor
    ctx.fill()
  }
}
