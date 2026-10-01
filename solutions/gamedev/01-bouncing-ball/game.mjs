export function clampDt(dt) {
  return Math.min(Math.max(dt, 0), 0.05);
}

export function update(ball, dt, width, height) {
  const next = { ...ball, x: ball.x + ball.vx * dt, y: ball.y + ball.vy * dt };
  if (next.x - next.r < 0) {
    next.x = next.r;
    next.vx = Math.abs(next.vx);
  } else if (next.x + next.r > width) {
    next.x = width - next.r;
    next.vx = -Math.abs(next.vx);
  }
  if (next.y - next.r < 0) {
    next.y = next.r;
    next.vy = Math.abs(next.vy);
  } else if (next.y + next.r > height) {
    next.y = height - next.r;
    next.vy = -Math.abs(next.vy);
  }
  return next;
}
