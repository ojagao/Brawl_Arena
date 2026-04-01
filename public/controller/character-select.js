const CharacterSelect = {
  characters: [],
  selectedId: null,
  confirmedId: null,
  onConfirm: null,
  timerInterval: null,

  init(characters, timeLimit, onConfirm) {
    this.characters = characters
    this.onConfirm = onConfirm
    this.selectedId = null
    this.confirmedId = null
    this.buildGrid()
    this.startTimer(timeLimit)
    RadarChart.init('radar-chart')
  },

  buildGrid() {
    const grid = document.getElementById('character-grid')
    const confirmBtn = document.getElementById('confirm-btn')

    grid.innerHTML = this.characters.map(c => {
      return `
        <div class="char-card" data-id="${c.id}">
          <canvas class="char-preview" width="56" height="56"></canvas>
          <div class="char-name" style="color:${c.color}">${c.name}</div>
          <div class="char-role">${c.role}</div>
        </div>
      `
    }).join('')

    grid.querySelectorAll('.char-card').forEach(card => {
      const charId = card.dataset.id
      const canvas = card.querySelector('.char-preview')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        CharacterSprites.drawPreview(ctx, charId, 28, 28, 44)
      }
      card.addEventListener('click', () => {
        if (card.classList.contains('taken')) return
        this.selectCharacter(card.dataset.id)
      })
    })

    confirmBtn.addEventListener('click', () => {
      if (this.selectedId && !this.confirmedId) {
        this.confirmedId = this.selectedId
        confirmBtn.textContent = 'CONFIRMED!'
        confirmBtn.disabled = true
        if (this.onConfirm) this.onConfirm(this.confirmedId)
      }
    })
  },

  selectCharacter(id) {
    if (this.confirmedId) return
    this.selectedId = id

    document.querySelectorAll('.char-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.id === id)
    })

    document.getElementById('confirm-btn').disabled = false

    const character = this.characters.find(c => c.id === id)
    const container = document.getElementById('radar-chart-container')
    if (character && container) {
      container.style.display = 'flex'
      RadarChart.draw(character)
    }
  },

  updateSelections(selections, myId) {
    document.querySelectorAll('.char-card').forEach(card => {
      const charId = card.dataset.id
      const takenByOther = Object.entries(selections).some(
        ([playerId, selectedCharId]) => selectedCharId === charId && playerId !== myId
      )
      card.classList.toggle('taken', takenByOther)
    })
  },

  startTimer(timeLimit) {
    const timerEl = document.getElementById('select-timer-mobile')
    let remaining = Math.floor(timeLimit / 1000)

    timerEl.textContent = remaining

    if (this.timerInterval) clearInterval(this.timerInterval)

    this.timerInterval = setInterval(() => {
      remaining--
      timerEl.textContent = remaining > 0 ? remaining : '0'
      if (remaining <= 0) {
        clearInterval(this.timerInterval)
      }
    }, 1000)
  },

  cleanup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }
}
