const DisplayApp = {
  socket: null,
  roomId: null,
  players: [],
  selectTimer: null,

  init() {
    LobbyScreen.init()
    GameRenderer.init()
    GameHUD.init()

    this.socket = io({ query: { type: 'display' } })
    this.setupEvents()
  },

  setupEvents() {
    this.socket.on('room:created', (data) => {
      this.roomId = data.roomId
      LobbyScreen.loadQR(data.roomId)
      LobbyScreen.updatePlayers(data.players || [])
    })

    this.socket.on('room:player-joined', (data) => {
      this.players = data.players
      LobbyScreen.updatePlayers(data.players)
    })

    this.socket.on('lobby:timer', (data) => {
      LobbyScreen.startCountdown(data.remaining)
    })

    this.socket.on('room:player-left', (data) => {
      this.players = data.players
      LobbyScreen.updatePlayers(data.players)
    })

    this.socket.on('room:state-change', (data) => {
      this.handleStateChange(data.state)
    })

    this.socket.on('select:start', (data) => {
      this.showSelectScreen(data)
    })

    this.socket.on('select:update', (data) => {
      this.updateSelectStatus(data.selections)
    })

    this.socket.on('game:start', (data) => {
      this.startGame(data)
    })

    this.socket.on('game:state', (data) => {
      GameRenderer.updateState(data)
      GameHUD.update(data)
      this.players = data.players
    })

    this.socket.on('game:effects', (effects) => {
      for (const effect of effects) {
        EffectSystem.add(effect)
      }
    })

    this.socket.on('game:kill', (event) => {
      GameHUD.addKill(event, this.players)
    })

    this.socket.on('game:over', (data) => {
      GameRenderer.stop()
      GameHUD.showGameOver(data)
    })
  },

  handleStateChange(state) {
    if (state === 'CHARACTER_SELECT') {
      LobbyScreen.hide()
      document.getElementById('select-screen').style.display = 'flex'
    } else if (state === 'PLAYING') {
      document.getElementById('select-screen').style.display = 'none'
    }
  },

  showSelectScreen(data) {
    const timerEl = document.getElementById('select-timer')
    const statusEl = document.getElementById('select-status')
    let remaining = Math.floor(data.timeLimit / 1000)

    if (this.selectTimer) clearInterval(this.selectTimer)

    this.selectTimer = setInterval(() => {
      remaining--
      timerEl.textContent = remaining > 0 ? remaining : ''
      if (remaining <= 0) clearInterval(this.selectTimer)
    }, 1000)

    statusEl.textContent = 'Players are selecting characters on their phones...'
  },

  updateSelectStatus(selections) {
    const count = Object.keys(selections).length
    const statusEl = document.getElementById('select-status')
    statusEl.textContent = `${count}/6 players have selected their character`
  },

  startGame(data) {
    GameRenderer.setMap(data.mapData)
    GameRenderer.start()
    GameHUD.show()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  DisplayApp.init()
})
