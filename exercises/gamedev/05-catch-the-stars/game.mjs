export function createGame(width, height) {
  return {
    mode: "playing", width, height,
    paddle: { x: width / 2 - 40, y: height - 20, w: 80, h: 10, speed: 300 },
    stars: [], score: 0, lives: 3, spawnIn: 1,
  };
}

export function update(game, input, dt, random = Math.random) {
  return game;
}
