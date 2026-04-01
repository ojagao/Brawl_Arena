const RadarChart = {
  canvas: null,
  ctx: null,

  AXES: [
    { key: 'health',   label: 'HP',       min: 50,  max: 170 },
    { key: 'speed',    label: 'SPD',      min: 1.5, max: 5.0 },
    { key: 'damage',   label: 'DMG',      min: 0,   max: 55 },
    { key: 'range',    label: 'RNG',      min: 50,  max: 550 },
    { key: 'fireRate', label: 'RATE',     min: 1600, max: 100, inverted: true }
  ],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) return
    this.ctx = this.canvas.getContext('2d')
    this.resize()
  },

  resize() {
    if (!this.canvas) return
    const parent = this.canvas.parentElement
    const size = Math.min(parent.clientWidth, 200)
    this.canvas.width = size
    this.canvas.height = size
  },

  normalize(axis, value) {
    const { min, max } = axis
    return Math.max(0, Math.min(1, (value - min) / (max - min)))
  },

  draw(character) {
    if (!this.ctx || !character) return

    this.resize()

    const { ctx, canvas } = this
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = Math.min(cx, cy) * 0.72
    const axes = this.AXES
    const count = axes.length
    const angleStep = (Math.PI * 2) / count
    const startAngle = -Math.PI / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.drawGrid(cx, cy, radius, count, angleStep, startAngle)
    this.drawLabels(cx, cy, radius, axes, count, angleStep, startAngle)
    this.drawData(cx, cy, radius, axes, count, angleStep, startAngle, character)
  },

  drawGrid(cx, cy, radius, count, angleStep, startAngle) {
    const { ctx } = this
    const levels = [0.25, 0.5, 0.75, 1.0]

    for (const level of levels) {
      ctx.beginPath()
      for (let i = 0; i <= count; i++) {
        const angle = startAngle + i * angleStep
        const x = cx + Math.cos(angle) * radius * level
        const y = cy + Math.sin(angle) * radius * level
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  },

  drawLabels(cx, cy, radius, axes, count, angleStep, startAngle) {
    const { ctx, canvas } = this
    const fontSize = Math.max(9, canvas.width * 0.055)
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep
      const labelRadius = radius + fontSize * 1.1
      const x = cx + Math.cos(angle) * labelRadius
      const y = cy + Math.sin(angle) * labelRadius
      ctx.fillText(axes[i].label, x, y)
    }
  },

  drawData(cx, cy, radius, axes, count, angleStep, startAngle, character) {
    const { ctx } = this
    const points = []

    for (let i = 0; i < count; i++) {
      const axis = axes[i]
      const raw = character[axis.key] || 0
      const norm = this.normalize(axis, raw)
      const angle = startAngle + i * angleStep
      points.push({
        x: cx + Math.cos(angle) * radius * norm,
        y: cy + Math.sin(angle) * radius * norm
      })
    }

    const color = character.color || '#ffffff'

    ctx.beginPath()
    for (let i = 0; i <= count; i++) {
      const p = points[i % count]
      if (i === 0) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }
    ctx.closePath()

    ctx.fillStyle = color + '30'
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }
}
