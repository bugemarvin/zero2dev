// Draws the game on the canvas. You do not need to change this file: it uses your game.mjs.
import { createGame, update } from "./game.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
  if (event.code === "Enter" && game.mode === "over") game = createGame(canvas.width, canvas.height);
  if (event.code.startsWith("Arrow")) event.preventDefault();
});
window.addEventListener("keyup", (event) => { keys[event.code] = false; });

let game = createGame(canvas.width, canvas.height);
let last = performance.now();

function frame(time) {
  const dt = Math.min((time - last) / 1000, 0.05);
  last = time;
  game = update(game, { left: !!keys.ArrowLeft, right: !!keys.ArrowRight }, dt) ?? game;

  ctx.fillStyle = "#1b2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "gold";
  for (const star of game.stars ?? []) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  const p = game.paddle;
  if (p) {
    ctx.fillStyle = "#4fa0d1";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
  ctx.fillStyle = "#d8dee9";
  ctx.textAlign = "left";
  ctx.font = "14px monospace";
  ctx.fillText(`score ${game.score}   lives ${game.lives}`, 10, 18);
  if (game.mode === "over") {
    ctx.textAlign = "center";
    ctx.font = "26px sans-serif";
    ctx.fillText("Game over. Press Enter", canvas.width / 2, canvas.height / 2);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
