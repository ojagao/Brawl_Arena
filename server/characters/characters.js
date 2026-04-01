const CHARACTERS = Object.freeze({
  brawler: Object.freeze({
    id: 'brawler',
    name: 'Brawler',
    health: 120,
    speed: 3.0,
    damage: 25,
    fireRate: 500,
    range: 150,
    projectileSpeed: 6,
    projectileCount: 3,
    spreadAngle: Math.PI / 12,
    radius: 18,
    color: '#e74c3c',
    role: 'tank'
  }),
  sniper: Object.freeze({
    id: 'sniper',
    name: 'Sniper',
    health: 70,
    speed: 2.5,
    damage: 50,
    fireRate: 1200,
    range: 500,
    projectileSpeed: 12,
    projectileCount: 1,
    spreadAngle: 0,
    radius: 16,
    color: '#9b59b6',
    role: 'dps'
  }),
  healer: Object.freeze({
    id: 'healer',
    name: 'Healer',
    health: 90,
    speed: 3.0,
    damage: 15,
    fireRate: 800,
    range: 250,
    projectileSpeed: 8,
    projectileCount: 1,
    spreadAngle: 0,
    healRadius: 100,
    healRate: 5,
    radius: 16,
    color: '#2ecc71',
    role: 'support'
  }),
  speedster: Object.freeze({
    id: 'speedster',
    name: 'Speedster',
    health: 80,
    speed: 4.5,
    damage: 18,
    fireRate: 400,
    range: 200,
    projectileSpeed: 10,
    projectileCount: 1,
    spreadAngle: 0,
    radius: 14,
    color: '#f39c12',
    role: 'flanker'
  }),
  bomber: Object.freeze({
    id: 'bomber',
    name: 'Bomber',
    health: 100,
    speed: 2.5,
    damage: 40,
    fireRate: 1500,
    range: 300,
    projectileSpeed: 5,
    projectileCount: 1,
    spreadAngle: 0,
    explosionRadius: 60,
    radius: 18,
    color: '#e67e22',
    role: 'area'
  }),
  shield: Object.freeze({
    id: 'shield',
    name: 'Shield',
    health: 150,
    speed: 2.0,
    damage: 20,
    fireRate: 700,
    range: 120,
    projectileSpeed: 5,
    projectileCount: 1,
    spreadAngle: 0,
    radius: 22,
    color: '#3498db',
    role: 'tank'
  })
})

function getCharacter(id) {
  return CHARACTERS[id] || null
}

function getAllCharacters() {
  return Object.values(CHARACTERS)
}

module.exports = { CHARACTERS, getCharacter, getAllCharacters }
