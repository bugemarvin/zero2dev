export function createGame(width, height) {
  return {
    mode: "playing", width, height,
    paddle: { x: width / 2 - 40, y: height - 20, w: 80, h: 10, speed: 300 },
    stars: [], score: 0, lives: 3, spawnIn: 1,
  };
}

function touches(star, rect) {
  const nearestX = Math.max(rect.x, Math.min(star.x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(star.y, rect.y + rect.h));
  const dx = star.x - nearestX;
  const dy = star.y - nearestY;
  return dx * dx + dy * dy < star.r * star.r;
}

export function update(game, input, dt, random = Math.random) {
  if (game.mode !== "playing") {
    return game;
  }
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const paddle = { ...game.paddle };
  paddle.x = Math.min(Math.max(paddle.x + direction * paddle.speed * dt, 0), game.width - paddle.w);

  let stars = game.stars.map((star) => ({ ...star, y: star.y + star.vy * dt }));

  let spawnIn = game.spawnIn - dt;
  if (spawnIn <= 0) {
    stars.push({ x: 10 + random() * (game.width - 20), y: 0, r: 8, vy: 120 + game.score * 2 });
    spawnIn += 1;
  }

  let score = game.score;
  let lives = game.lives;
  stars = stars.filter((star) => {
    if (touches(star, paddle)) {
      score += 10;
      return false;
    }
    if (star.y > game.height) {
      lives -= 1;
      return false;
    }
    return true;
  });

  const over = lives <= 0;
  return { ...game, paddle, stars, score, lives: over ? 0 : lives, spawnIn, mode: over ? "over" : "playing" };
}
