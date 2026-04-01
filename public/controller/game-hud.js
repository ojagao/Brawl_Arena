const MobileGameHUD = {
  elements: null,

  init() {
    this.elements = {
      healthFill: document.getElementById('mobile-health-fill'),
      scoreDisplay: document.getElementById('mobile-score-display'),
      timerDisplay: document.getElementById('mobile-timer-display'),
      respawnOverlay: document.getElementById('respawn-overlay'),
      respawnTimer: document.getElementById('respawn-timer')
    }
  },

  update(state) {
    if (!this.elements) return

    const healthPercent = (state.health / state.maxHealth) * 100
    this.elements.healthFill.style.width = `${healthPercent}%`

    if (healthPercent > 50) {
      this.elements.healthFill.style.background = '#2ecc71'
    } else if (healthPercent > 25) {
      this.elements.healthFill.style.background = '#f39c12'
    } else {
      this.elements.healthFill.style.background = '#e74c3c'
    }

    this.elements.scoreDisplay.innerHTML =
      `<span style="color:#e74c3c">${state.scores.red}</span> - <span style="color:#3498db">${state.scores.blue}</span>`

    const seconds = Math.max(0, Math.floor(state.timeRemaining / 1000))
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    this.elements.timerDisplay.textContent = `${min}:${String(sec).padStart(2, '0')}`

    if (!state.alive) {
      this.elements.respawnOverlay.style.display = 'flex'
      const respawnSec = Math.ceil(state.respawnIn / 1000)
      this.elements.respawnTimer.textContent = respawnSec > 0 ? respawnSec : ''
    } else {
      this.elements.respawnOverlay.style.display = 'none'
    }
  },

  showGameOver(data, myTeam) {
    document.getElementById('game-screen').style.display = 'none'
    const screen = document.getElementById('gameover-screen')
    screen.style.display = 'flex'

    const winnerEl = document.getElementById('mobile-winner')
    const resultEl = document.getElementById('mobile-result')
    const statsEl = document.getElementById('mobile-stats')

    if (data.winner === 'draw') {
      winnerEl.textContent = 'DRAW!'
      winnerEl.style.color = '#f39c12'
      resultEl.textContent = ''
    } else if (data.winner === myTeam) {
      winnerEl.textContent = 'VICTORY!'
      winnerEl.style.color = '#2ecc71'
      resultEl.textContent = `${data.scores.red} - ${data.scores.blue}`
    } else {
      winnerEl.textContent = 'DEFEAT'
      winnerEl.style.color = '#e74c3c'
      resultEl.textContent = `${data.scores.red} - ${data.scores.blue}`
    }

    statsEl.innerHTML = data.players
      .sort((a, b) => b.kills - a.kills)
      .map(p => {
        const color = SHARED.TEAM_COLORS[p.team]
        return `<span style="color:${color}">${p.name}</span>: ${p.kills}K / ${p.deaths}D`
      })
      .join('<br>')
  }
}
