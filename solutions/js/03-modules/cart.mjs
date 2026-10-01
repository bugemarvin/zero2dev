export const TAX_RATE = 0.2;

function round(n) {
  return Math.round(n * 100) / 100;
}

export function addItem(cart, item) {
  return [...cart, item];
}

export function removeItem(cart, id) {
  return cart.filter((item) => item.id !== id);
}

export function total(cart) {
  const net = cart.reduce((sum, item) => sum + item.price, 0);
  return round(net * (1 + TAX_RATE));
}

export default function summary(cart) {
  const count = cart.length === 1 ? "1 item" : `${cart.length} items`;
  return `${count}, total ${total(cart).toFixed(2)}`;
}
