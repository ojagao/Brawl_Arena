const MathUtils = Object.freeze({
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
  },

  lerp(a, b, t) {
    return a + (b - a) * t
  },

  distance(x1, y1, x2, y2) {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
  },

  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1)
  },

  normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2
    while (angle >= Math.PI * 2) angle -= Math.PI * 2
    return angle
  },

  circlesCollide(x1, y1, r1, x2, y2, r2) {
    const dist = MathUtils.distance(x1, y1, x2, y2)
    return dist < r1 + r2
  },

  circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = MathUtils.clamp(cx, rx, rx + rw)
    const closestY = MathUtils.clamp(cy, ry, ry + rh)
    const dx = cx - closestX
    const dy = cy - closestY
    return (dx * dx + dy * dy) < (cr * cr)
  },

  lerpAngle(a, b, t) {
    let diff = b - a
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    return a + diff * t
  }
})
