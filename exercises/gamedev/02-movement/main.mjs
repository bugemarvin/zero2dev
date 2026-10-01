// Draws the game on the canvas. You do not need to change this file: it uses your game.mjs.
import { direction, jump, movePlayer } from "./game.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = {};
window.addEventListener("keydown", (event) => { keys[event.code] = true; if (event.code.startsWith("Arrow") || event.code === "Space") event.preventDefault(); });
window.addEventListener("keyup", (event) => { keys[event.code] = false; });

let player = { x: 220, y: 60, w: 28, h: 28, speed: 220 };
let body = { y: 280, vy: 0, onGround: true };
let last = performance.now();

function frame(time) {
  const dt = Math.min((time - last) / 1000, 0.05);
  last = time;
  const input = { left: !!keys.ArrowLeft, right: !!keys.ArrowRight, up: !!keys.ArrowUp, down: !!keys.ArrowDown };
  player = movePlayer(player, input, dt, { width: canvas.width, height: 200 }) ?? player;
  body = jump(body, !!keys.Space, dt, 280) ?? body;
  const d = direction(input) ?? { x: 0, y: 0 };

  ctx.fillStyle = "#1b2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#26324a";
  ctx.fillRect(0, 200, canvas.width, 2);
  ctx.fillStyle = "#4fa0d1";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#e6a23c";
  ctx.fillRect(60, body.y, 24, 24);
  ctx.fillStyle = "#3a4a66";
  ctx.fillRect(0, 304, canvas.width, 16);
  ctx.fillStyle = "#d8dee9";
  ctx.font = "13px monospace";
  ctx.fillText(`direction ${d.x.toFixed(2)}, ${d.y.toFixed(2)}`, 10, 18);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
