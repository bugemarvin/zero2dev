---
title: The game loop
summary: Every game is one loop: read input, update the world, draw it. Sixty times a second.
---

This track uses [JavaScript](js/01-values-and-functions) and the browser's canvas. No game engine and no libraries: you will see how games work underneath, and the ideas carry over to Unity, Godot, Unreal or any other engine.

## A game is a loop

A web page reacts when something happens. A game keeps running even when the player does nothing: enemies move, timers count, clouds drift. So at its heart is a loop that never stops:

```text
forever:
    read the input
    update the world a little
    draw the world
```

One pass through the loop is a **frame**. At 60 frames per second, each frame has about 16 milliseconds.

## The canvas

A `<canvas>` is a rectangle you draw on with JavaScript:

```html
<canvas id="game" width="480" height="320"></canvas>
```

```javascript
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#1b2230";
ctx.fillRect(0, 0, canvas.width, canvas.height);     // a filled rectangle: x, y, width, height

ctx.fillStyle = "gold";
ctx.beginPath();
ctx.arc(100, 80, 12, 0, Math.PI * 2);                // a circle: centre x, centre y, radius
ctx.fill();

ctx.fillStyle = "white";
ctx.font = "16px sans-serif";
ctx.fillText("Score: 0", 10, 20);
```

The origin `(0, 0)` is the **top left** corner. `x` grows to the right and **`y` grows downwards**. That is the opposite of school mathematics, and you will trip over it at least once.

The canvas keeps no list of objects. It is paint on a wall. To move something, you repaint the whole picture: clear it, then draw everything in its new position.

## requestAnimationFrame

The browser offers a function that calls you back right before it paints the next frame:

```javascript
function frame(time) {
  update();
  draw();
  requestAnimationFrame(frame);       // ask for the next frame
}

requestAnimationFrame(frame);
```

It matches the screen's refresh rate and pauses when the tab is hidden. Never use `setInterval` for a game loop.

## Delta time

Screens differ: 60 frames per second on one machine, 144 on another, 30 on a busy phone. If you move a ball 5 pixels per frame, the game runs more than twice as fast on the gaming monitor.

The fix is to measure how much **time** passed since the last frame, the **delta time**, and to move by speed times time:

```javascript
let last = 0;

function frame(time) {
  const dt = (time - last) / 1000;        // seconds since the last frame
  last = time;

  ball.x += ball.vx * dt;                 // vx is in pixels per SECOND
  // ...
  requestAnimationFrame(frame);
}
```

Now speeds are in pixels per second, and the game runs equally fast everywhere.

One guard is needed. When the player switches to another tab, the next `dt` can be several seconds, and everything jumps through the walls. Cap it:

```javascript
const dt = Math.min((time - last) / 1000, 0.05);
```

## Separate update from draw

Keep two functions with strictly different jobs:

- **`update(state, dt)`** changes the world: positions, scores, timers. It never draws.
- **`draw(state)`** paints the world. It never changes it.

The whole game is then data (the **state**) and functions that work on it:

```javascript
const state = { ball: { x: 50, y: 50, vx: 120, vy: 90, r: 10 } };
```

This split is what makes a game **testable**: `update` is ordinary code that takes numbers and returns numbers. You can check it without a screen, which is exactly how the exercises of this track are tested.

## Bouncing

```javascript
if (ball.x - ball.r < 0) {
  ball.x = ball.r;                // put it back inside
  ball.vx = Math.abs(ball.vx);    // and send it to the right
}
```

Two details matter:

- **Move the ball back inside.** If you only flip the velocity, a ball that went far past the wall can flip again on the next frame and get stuck shaking in the wall.
- Use `Math.abs` to set the direction, not `vx = -vx`, for the same reason.

## Common mistakes

- **Moving by pixels per frame**, so the speed depends on the screen.
- **Forgetting to clear the canvas**, which leaves trails.
- **Mixing update and draw**, so nothing can be tested.
- **Not capping `dt`.**
- **Expecting `y` to grow upwards.**
