const ControllerApp = {
  socket: null,
  roomId: null,
  playerId: null,
  myTeam: null,

  init() {
    this.roomId = this.getRoomIdFromUrl()

    if (!this.roomId) {
      document.getElementById('join-error').textContent = 'Invalid room URL'
      return
    }

    this.socket = io({ query: { type: 'controller', roomId: this.roomId } })
    this.setupEvents()
    this.setupJoinForm()
  },

  getRoomIdFromUrl() {
    const parts = window.location.pathname.split('/')
    return parts[parts.length - 1] || null
  },

  setupJoinForm() {
    const nameInput = document.getElementById('player-name')
    const joinBtn = document.getElementById('join-btn')

    joinBtn.addEventListener('click', () => this.join())

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.join()
    })
  },

  join() {
    const name = document.getElementById('player-name').value.trim()
    if (!name) {
      document.getElementById('join-error').textContent = 'Please enter a name'
      return
    }

    this.socket.emit('room:join', {
      roomId: this.roomId,
      playerName: name
    })
  },

  setupEvents() {
    this.socket.on('error', (data) => {
      document.getElementById('join-error').textContent = data.message
    })

    this.socket.on('room:joined', (data) => {
      this.playerId = data.playerId
      this.myTeam = data.team
      this.showWaitingScreen(data)
    })

    this.socket.on('room:player-joined', (data) => {
      this.updatePlayerCount(data.players.length)
    })

    this.socket.on('room:player-left', (data) => {
      this.updatePlayerCount(data.players.length)
    })

    this.socket.on('room:state-change', (data) => {
      if (data.state === 'CHARACTER_SELECT') {
        // handled by select:start
      } else if (data.state === 'PLAYING') {
        this.startGame()
      }
    })

    this.socket.on('select:start', (data) => {
      this.showSelectScreen(data)
    })

    this.socket.on('select:update', (data) => {
      CharacterSelect.updateSelections(data.selections, this.playerId)
    })

    this.socket.on('game:start', () => {
      // handled by room:state-change PLAYING
    })

    this.socket.on('game:player-state', (state) => {
      MobileGameHUD.update(state)
    })

    this.socket.on('game:over', (data) => {
      JoystickController.stop()
      MobileGameHUD.showGameOver(data, this.myTeam)
    })
  },

  showWaitingScreen(data) {
    document.getElementById('join-screen').style.display = 'none'
    document.getElementById('waiting-screen').style.display = 'flex'

    const teamLabel = document.getElementById('team-label')
    teamLabel.textContent = `${data.team.toUpperCase()} TEAM`
    teamLabel.style.color = SHARED.TEAM_COLORS[data.team]
    teamLabel.style.background = `${SHARED.TEAM_COLORS[data.team]}22`

    this.updatePlayerCount(data.players.length)
  },

  updatePlayerCount(count) {
    const counter = document.getElementById('player-counter')
    if (counter) {
      counter.textContent = `${count}/6 players`
    }
  },

  showSelectScreen(data) {
    document.getElementById('waiting-screen').style.display = 'none'
    document.getElementById('select-screen').style.display = 'flex'

    CharacterSelect.init(data.characters, data.timeLimit, (characterId) => {
      this.socket.emit('select:pick', { characterId })
    })
  },

  startGame() {
    document.getElementById('select-screen').style.display = 'none'
    document.getElementById('game-screen').style.display = 'block'

    CharacterSelect.cleanup()
    MobileGameHUD.init()

    JoystickController.init(
      (input) => {
        this.socket.emit('input:update', input)
      },
      (shootData) => {
        this.socket.emit('input:shoot', shootData)
      }
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ControllerApp.init()
})
