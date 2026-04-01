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
  },

  buildGrid() {
    const grid = document.getElementById('character-grid')
    const confirmBtn = document.getElementById('confirm-btn')

    grid.innerHTML = this.characters.map(c => {
      const info = SHARED.CHARACTERS[c.id] || {}
      return `
        <div class="char-card" data-id="${c.id}">
          <div class="char-emoji">${info.emoji || ''}</div>
          <div class="char-name" style="color:${c.color}">${c.name}</div>
          <div class="char-role">${c.role}</div>
          <div class="char-stats">HP:${c.health} SPD:${c.speed} DMG:${c.damage}</div>
        </div>
      `
    }).join('')

    grid.querySelectorAll('.char-card').forEach(card => {
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
