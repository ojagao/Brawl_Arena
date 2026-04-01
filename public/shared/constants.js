const SHARED = Object.freeze({
  MAP_WIDTH: 1600,
  MAP_HEIGHT: 900,
  TILE_SIZE: 40,

  TEAMS: Object.freeze({
    RED: 'red',
    BLUE: 'blue'
  }),

  TEAM_COLORS: Object.freeze({
    red: '#e74c3c',
    blue: '#3498db'
  }),

  ROOM_STATES: Object.freeze({
    WAITING: 'WAITING',
    CHARACTER_SELECT: 'CHARACTER_SELECT',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
  }),

  CHARACTERS: Object.freeze({
    brawler: { id: 'brawler', name: 'Brawler', color: '#e74c3c', emoji: '💪' },
    sniper: { id: 'sniper', name: 'Sniper', color: '#9b59b6', emoji: '🎯' },
    healer: { id: 'healer', name: 'Healer', color: '#2ecc71', emoji: '💚' },
    speedster: { id: 'speedster', name: 'Speedster', color: '#f39c12', emoji: '⚡' },
    bomber: { id: 'bomber', name: 'Bomber', color: '#e67e22', emoji: '💣' },
    shield: { id: 'shield', name: 'Shield', color: '#3498db', emoji: '🛡' },
    ninja: { id: 'ninja', name: 'Ninja', color: '#2c3e50', emoji: '🥷' },
    frost: { id: 'frost', name: 'Frost', color: '#74b9ff', emoji: '❄️' },
    gunner: { id: 'gunner', name: 'Gunner', color: '#6c7a3a', emoji: '🔫' },
    mystic: { id: 'mystic', name: 'Mystic', color: '#6c5ce7', emoji: '🔮' }
  })
})
