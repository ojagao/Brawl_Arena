const CONFIG = require('../config')

// 0 = open, 1 = wall, 2 = bush
function createArenaMap() {
  const cols = Math.floor(CONFIG.MAP_WIDTH / CONFIG.TILE_SIZE)
  const rows = Math.floor(CONFIG.MAP_HEIGHT / CONFIG.TILE_SIZE)
  const tiles = []

  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(1)
      } else {
        row.push(0)
      }
    }
    tiles.push(row)
  }

  const wallPositions = [
    [4, 8], [4, 9], [5, 8], [5, 9],
    [4, 31], [4, 32], [5, 31], [5, 32],
    [17, 8], [17, 9], [18, 8], [18, 9],
    [17, 31], [17, 32], [18, 31], [18, 32],

    [10, 14], [10, 15], [11, 14], [11, 15],
    [10, 24], [10, 25], [11, 24], [11, 25],

    [7, 19], [7, 20], [8, 19], [8, 20],
    [14, 19], [14, 20], [15, 19], [15, 20],

    [3, 4], [3, 5],
    [3, 34], [3, 35],
    [19, 4], [19, 5],
    [19, 34], [19, 35],

    [11, 4], [11, 5],
    [11, 34], [11, 35],

    [6, 12], [6, 27],
    [16, 12], [16, 27],
  ]

  for (const [r, c] of wallPositions) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      tiles[r][c] = 1
    }
  }

  const bushPositions = [
    [5, 18], [5, 19], [5, 20], [5, 21],
    [17, 18], [17, 19], [17, 20], [17, 21],
    [10, 10], [10, 11], [11, 10], [11, 11],
    [10, 28], [10, 29], [11, 28], [11, 29],
    [8, 5], [8, 6],
    [14, 5], [14, 6],
    [8, 33], [8, 34],
    [14, 33], [14, 34],
  ]

  for (const [r, c] of bushPositions) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      tiles[r][c] = 2
    }
  }

  return Object.freeze({
    id: 'arena_1',
    name: 'Dusty Arena',
    width: cols,
    height: rows,
    tileSize: CONFIG.TILE_SIZE,
    tiles,
    spawns: Object.freeze({
      red: [
        { x: 80, y: 200 },
        { x: 80, y: 450 },
        { x: 80, y: 700 }
      ],
      blue: [
        { x: CONFIG.MAP_WIDTH - 80, y: 200 },
        { x: CONFIG.MAP_WIDTH - 80, y: 450 },
        { x: CONFIG.MAP_WIDTH - 80, y: 700 }
      ]
    })
  })
}

function getWallRects(map) {
  const rects = []
  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      if (map.tiles[r][c] === 1) {
        rects.push({
          x: c * map.tileSize,
          y: r * map.tileSize,
          w: map.tileSize,
          h: map.tileSize
        })
      }
    }
  }
  return rects
}

const MAPS = Object.freeze({
  arena_1: createArenaMap()
})

module.exports = { MAPS, getWallRects }
