// Draws the game on the canvas. You do not need to change this file: it uses your game.mjs.
import { initialState, next } from "./game.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let state = initialState() ?? { mode: "menu", score: 0, lives: 3, level: 1 };
const KEYS = { Enter: { type: "start" }, KeyP: { type: "pause" }, KeyR: { type: "resume" }, KeyH: { type: "hit" },
  KeyS: { type: "score", points: 40 }, KeyN: { type: "restart" } };

window.addEventListener("keydown", (event) => {
  if (KEYS[event.code]) {
    state = next(state, KEYS[event.code]) ?? state;
    draw();
  }
});

function draw() {
  ctx.fillStyle = { menu: "#1b2230", playing: "#16302a", paused: "#30301a", over: "#3a1a1a" }[state.mode] ?? "#1b2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d8dee9";
  ctx.textAlign = "center";
  ctx.font = "28px sans-serif";
  ctx.fillText(String(state.mode).toUpperCase(), canvas.width / 2, 120);
  ctx.font = "16px monospace";
  ctx.fillText(`score ${state.score}   lives ${state.lives}   level ${state.level}`, canvas.width / 2, 170);
  ctx.font = "13px sans-serif";
  ctx.fillText("Enter start · P pause · R resume · S score · H hit · N restart", canvas.width / 2, 260);
}

draw();
