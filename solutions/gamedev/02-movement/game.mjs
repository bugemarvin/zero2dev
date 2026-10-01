export function direction(keys) {
  let x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  let y = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  const length = Math.hypot(x, y);
  if (length > 0) {
    x /= length;
    y /= length;
  }
  return { x, y };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function movePlayer(player, keys, dt, bounds) {
  const d = direction(keys);
  return {
    ...player,
    x: clamp(player.x + d.x * player.speed * dt, 0, bounds.width - player.w),
    y: clamp(player.y + d.y * player.speed * dt, 0, bounds.height - player.h),
  };
}

export function jump(body, pressed, dt, groundY) {
  const next = { ...body };
  if (pressed && next.onGround) {
    next.vy = -550;
    next.onGround = false;
  }
  if (!next.onGround) {
    next.vy += 1500 * dt;
    next.y += next.vy * dt;
    if (next.y >= groundY) {
      next.y = groundY;
      next.vy = 0;
      next.onGround = true;
    }
  }
  return next;
}
