const GameHUD = {
  elements: null,
  killFeedTimeout: null,

  init() {
    this.elements = {
      hud: document.getElementById('game-hud'),
      redScore: document.getElementById('red-score'),
      blueScore: document.getElementById('blue-score'),
      timer: document.getElementById('timer-display'),
      killFeed: document.getElementById('kill-feed'),
      gameOver: document.getElementById('game-over-screen'),
      winnerText: document.getElementById('winner-text'),
      finalScores: document.getElementById('final-scores'),
      playerStats: document.getElementById('player-stats')
    }
  },

  show() {
    this.elements.hud.style.display = 'block'
  },

  hide() {
    this.elements.hud.style.display = 'none'
  },

  update(state) {
    this.elements.redScore.textContent = state.scores.red
    this.elements.blueScore.textContent = state.scores.blue

    const seconds = Math.max(0, Math.floor(state.timeRemaining / 1000))
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    this.elements.timer.textContent = `${min}:${String(sec).padStart(2, '0')}`
  },

  addKill(event, players) {
    const killer = players.find(p => p.id === event.killerId)
    const victim = players.find(p => p.id === event.victimId)
    if (!killer || !victim) return

    const entry = document.createElement('div')
    entry.className = 'kill-entry'

    const killerColor = SHARED.TEAM_COLORS[killer.team]
    const victimColor = SHARED.TEAM_COLORS[victim.team]

    entry.innerHTML = `<span style="color:${killerColor}">${killer.name}</span> eliminated <span style="color:${victimColor}">${victim.name}</span>`

    this.elements.killFeed.appendChild(entry)

    setTimeout(() => {
      if (entry.parentNode) {
        entry.parentNode.removeChild(entry)
      }
    }, 4000)
  },

  showGameOver(data) {
    this.elements.gameOver.style.display = 'flex'

    if (data.winner === 'draw') {
      this.elements.winnerText.textContent = 'DRAW!'
      this.elements.winnerText.style.color = '#f39c12'
    } else {
      this.elements.winnerText.textContent = `${data.winner.toUpperCase()} TEAM WINS!`
      this.elements.winnerText.style.color = SHARED.TEAM_COLORS[data.winner]
    }

    this.elements.finalScores.innerHTML = `
      <span style="color:${SHARED.TEAM_COLORS.red};font-size:48px">${data.scores.red}</span>
      <span style="color:#666;font-size:36px">-</span>
      <span style="color:${SHARED.TEAM_COLORS.blue};font-size:48px">${data.scores.blue}</span>
    `

    this.elements.playerStats.innerHTML = data.players
      .sort((a, b) => b.kills - a.kills)
      .map(p => {
        const teamColor = SHARED.TEAM_COLORS[p.team]
        return `
          <div class="stat-card" style="border-top:3px solid ${teamColor}">
            <div class="name" style="color:${teamColor}">${p.name}</div>
            <div class="kd">${p.kills} kills / ${p.deaths} deaths</div>
          </div>
        `
      })
      .join('')
  }
}
