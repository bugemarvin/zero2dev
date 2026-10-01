---
title: Game state and entities
summary: Menus, pausing, lives and scores: a game as a small state machine, plus lists of things that come and go.
---

## A game is more than playing

There is a title screen, the game itself, a pause, a game-over screen. In each of them the same key does something different, and different things are drawn. Tracking this with a handful of booleans ends badly:

```javascript
let started = false, paused = false, gameOver = false;      // what does started && gameOver && paused mean?
```

Three booleans make eight combinations, and most of them are nonsense.

## A state machine

Give the game **one** variable that says which mode it is in:

```javascript
state.mode = "menu";        // "menu", "playing", "paused" or "over"
```

Then write down which **events** move it from one mode to another:

```text
menu     --start-->    playing
playing  --pause-->    paused
paused   --resume-->   playing
playing  --hit, last life-->  over
over     --restart-->  playing
```

This is a **state machine**: a fixed set of states, and rules for moving between them. An event that has no rule in the current state does nothing. You cannot pause the menu or resume a game that is over, because there is no arrow for it.

## A reducer

A clean way to write it is one function that takes the current state and an event, and returns the next state:

```javascript
function next(state, event) {
  switch (state.mode) {
    case "menu":
      if (event.type === "start") {
        return { ...state, mode: "playing" };
      }
      return state;
    case "playing":
      if (event.type === "pause") {
        return { ...state, mode: "paused" };
      }
      // ...
      return state;
    default:
      return state;
  }
}
```

The function never changes the state it was given. It returns a new object, or the same object when nothing happened. That makes every rule testable in one line, and it is how large applications manage their state too.

The update and draw functions then branch on the mode:

```javascript
function update(state, input, dt) {
  if (state.mode !== "playing") {
    return state;           // nothing moves on the menu, or while paused
  }
  // ...
}
```

## Entities

Most things in a game come in lists: enemies, bullets, coins, particles. Each one is an **entity**, an object with the data it needs:

```javascript
state.enemies = [
  { x: 40, y: 0, vy: 60, alive: true },
  { x: 200, y: -30, vy: 80, alive: true },
];
```

Each frame:

```javascript
state.enemies = state.enemies
  .map((enemy) => ({ ...enemy, y: enemy.y + enemy.vy * dt }))       // move
  .filter((enemy) => enemy.y < height);                            // drop those that left the screen
```

Entities that are never removed pile up off-screen until the game crawls. Always decide how each kind of entity dies.

## Spawning with a timer

```javascript
state.spawnIn -= dt;
if (state.spawnIn <= 0) {
  state.enemies.push(makeEnemy());
  state.spawnIn += 1.5;         // the next one in 1.5 seconds
}
```

Adding the interval to the leftover time, in place of setting the timer to 1.5, keeps the rhythm exact.

## Score, lives and levels

Derive what you can from other values. A level that depends on the score needs no variable of its own that could fall out of step:

```javascript
const level = 1 + Math.floor(state.score / 100);
```

Difficulty usually follows the level: enemies move faster, spawn more often.

## Randomness you can test

`Math.random()` in the middle of the logic makes a function give a different result on every call, which cannot be tested. Pass the random source in:

```javascript
function update(state, input, dt, random = Math.random) {
  const x = random() * width;
}
```

The game uses the real one. A test passes `() => 0.5` and knows exactly what happens.

## Saving

A high score survives a reload with `localStorage`:

```javascript
localStorage.setItem("best", String(score));
const best = Number(localStorage.getItem("best") ?? 0);
```

## Common mistakes

- **Several booleans** in place of one mode.
- **Updating the world while paused**, or on the menu.
- **Entities that are never removed.**
- **A level stored separately** from the score it is computed from.
- **`Math.random()` buried in the logic.**
