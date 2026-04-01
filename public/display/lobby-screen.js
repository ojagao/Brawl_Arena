const LobbyScreen = {
  elements: null,

  init() {
    this.elements = {
      screen: document.getElementById('lobby-screen'),
      qrCode: document.getElementById('qr-code'),
      joinUrl: document.getElementById('join-url'),
      playerCount: document.getElementById('player-count'),
      redPlayers: document.getElementById('red-players'),
      bluePlayers: document.getElementById('blue-players'),
      waitingText: document.getElementById('waiting-text')
    }
  },

  async loadQR(roomId) {
    try {
      const origin = window.location.origin
      const response = await fetch(`/api/qr/${roomId}?origin=${encodeURIComponent(origin)}`)
      const data = await response.json()
      this.elements.qrCode.src = data.qr
      this.elements.joinUrl.textContent = data.url
    } catch (err) {
      this.elements.joinUrl.textContent = 'QR generation failed'
    }
  },

  updatePlayers(players) {
    this.elements.playerCount.textContent = `${players.length}/6`

    const redPlayers = players.filter(p => p.team === 'red')
    const bluePlayers = players.filter(p => p.team === 'blue')

    this.elements.redPlayers.innerHTML = redPlayers
      .map(p => `<li>${p.name}</li>`)
      .join('')

    this.elements.bluePlayers.innerHTML = bluePlayers
      .map(p => `<li>${p.name}</li>`)
      .join('')

    if (players.length >= 6) {
      this.elements.waitingText.textContent = 'All players joined! Starting...'
    } else {
      this.elements.waitingText.textContent = 'Waiting for players...'
    }
  },

  show() {
    this.elements.screen.style.display = 'flex'
  },

  hide() {
    this.elements.screen.style.display = 'none'
  }
}
