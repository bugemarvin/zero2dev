// Draws the game on the canvas. You do not need to change this file: it uses your game.mjs.
import { clampDt, update } from "./game.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let ball = { x: 60, y: 60, vx: 180, vy: 130, r: 12 };
let last = performance.now();

function frame(time) {
  const dt = clampDt((time - last) / 1000);
  last = time;
  ball = update(ball, dt, canvas.width, canvas.height) ?? ball;
  ctx.fillStyle = "#1b2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
