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
  }),
  ninja: Object.freeze({
    id: 'ninja',
    name: 'Ninja',
    health: 65,
    speed: 4.2,
    damage: 35,
    fireRate: 600,
    range: 180,
    projectileSpeed: 11,
    projectileCount: 2,
    spreadAngle: Math.PI / 20,
    radius: 14,
    color: '#2c3e50',
    role: 'assassin'
  }),
  frost: Object.freeze({
    id: 'frost',
    name: 'Frost',
    health: 95,
    speed: 2.8,
    damage: 18,
    fireRate: 650,
    range: 280,
    projectileSpeed: 7,
    projectileCount: 1,
    spreadAngle: 0,
    slowEffect: 0.5,
    slowDuration: 1500,
    radius: 16,
    color: '#74b9ff',
    role: 'control'
  }),
  gunner: Object.freeze({
    id: 'gunner',
    name: 'Gunner',
    health: 110,
    speed: 2.3,
    damage: 10,
    fireRate: 150,
    range: 220,
    projectileSpeed: 9,
    projectileCount: 1,
    spreadAngle: Math.PI / 16,
    radius: 18,
    color: '#6c7a3a',
    role: 'dps'
  }),
  mystic: Object.freeze({
    id: 'mystic',
    name: 'Mystic',
    health: 85,
    speed: 2.7,
    damage: 22,
    fireRate: 900,
    range: 350,
    projectileSpeed: 6,
    projectileCount: 1,
    spreadAngle: 0,
    bounceCount: 2,
    radius: 16,
    color: '#6c5ce7',
    role: 'mage'
  })
})

function getCharacter(id) {
  return CHARACTERS[id] || null
}

function getAllCharacters() {
  return Object.values(CHARACTERS)
}

module.exports = { CHARACTERS, getCharacter, getAllCharacters }
