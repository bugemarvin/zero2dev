// Draws the game on the canvas. You do not need to change this file: it uses your game.mjs.
import { circleRect, collect } from "./game.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const player = { x: 220, y: 140, w: 36, h: 36 };
let coins = [];
let score = 0;
for (let i = 0; i < 14; i++) {
  coins.push({ x: 30 + ((i * 97) % 420), y: 30 + ((i * 61) % 260), r: 9 });
}

canvas.addEventListener("pointermove", (event) => {
  const box = canvas.getBoundingClientRect();
  player.x = (event.clientX - box.left) * (canvas.width / box.width) - player.w / 2;
  player.y = (event.clientY - box.top) * (canvas.height / box.height) - player.h / 2;
});

function frame() {
  const result = collect(player, coins) ?? { coins, collected: 0 };
  coins = result.coins;
  score += result.collected;
  ctx.fillStyle = "#1b2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const coin of coins) {
    ctx.fillStyle = circleRect(coin, player) ? "tomato" : "gold";
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#4fa0d1";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#d8dee9";
  ctx.font = "14px monospace";
  ctx.fillText(`coins ${score}`, 10, 18);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
