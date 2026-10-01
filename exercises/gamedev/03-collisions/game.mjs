export function rectsOverlap(a, b) {
  return false;
}

export function circlesOverlap(a, b) {
  return false;
}

export function circleRect(circle, rect) {
  return false;
}

export function collect(player, coins) {
  return { coins, collected: 0 };
}
