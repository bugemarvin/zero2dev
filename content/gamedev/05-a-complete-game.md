---
title: A complete game
summary: Put the pieces together, add sprites, sound and polish, and learn where to go next.
---

## The pieces you have

| Lesson | Piece |
| --- | --- |
| 1 | the loop, delta time, update and draw |
| 2 | input as data, movement, clamping |
| 3 | collisions and removing entities |
| 4 | modes, lives, score, spawning |

A complete small game is these four, in one `update` function:

```javascript
export function update(game, input, dt, random = Math.random) {
  if (game.mode !== "playing") {
    return game;
  }
  // 1. move the player from the input
  // 2. move every entity
  // 3. spawn new entities on a timer
  // 4. find collisions: score, lose lives
  // 5. remove what left the screen or was collected
  // 6. check whether the game is over
  return next;
}
```

Keep that order. Moving first and checking collisions afterwards means the test uses this frame's positions.

The exercise of this lesson is exactly this: a game where you catch falling stars.

## Sprites

Drawing rectangles is enough to make a game work. Pictures make it a game people want to play.

```javascript
const image = new Image();
image.src = "player.png";

image.onload = () => {
  ctx.drawImage(image, player.x, player.y);
};
```

An image loads in the background. Start the game loop only after everything has loaded.

A **sprite sheet** is one image with many pictures in a grid. `drawImage` can cut out one cell:

```javascript
// source x, y, width, height, then destination x, y, width, height
ctx.drawImage(sheet, frame * 32, 0, 32, 32, player.x, player.y, 32, 32);
```

**Animation** is choosing the cell by time:

```javascript
const frame = Math.floor(time * 10) % 4;        // 10 pictures per second, 4 pictures in the cycle
```

For pixel art, turn off smoothing so the pixels stay sharp: `ctx.imageSmoothingEnabled = false`.

## Sound

```javascript
const jumpSound = new Audio("jump.wav");

function playJump() {
  jumpSound.currentTime = 0;
  jumpSound.play();
}
```

Browsers refuse to play sound until the player has clicked or pressed a key. Start the game from a "press any key" screen and the problem is solved.

## Juice

"Juice" is the name game developers give to the small reactions that make a game feel alive. None of it changes the rules:

- a short **screen shake** when the player is hit;
- **particles** when something is destroyed;
- a number that **floats up** when points are scored;
- objects that **squash and stretch** on landing;
- a brief **pause of a few frames** on a big impact.

Add the rules first, then juice. A dull game with particles is still dull.

## Performance

Sixty frames per second leaves 16 milliseconds per frame. For a small canvas game that is plenty, if you avoid a few traps:

- **Do not create piles of objects every frame.** The garbage collector must clean them up, which causes stutter. For hundreds of bullets, reuse objects from a **pool**.
- **Draw only what is visible.**
- **Measure before optimising.** The browser's Performance tab shows where the time goes.

## Fixed time steps

Physics that depends on `dt` gives slightly different results at different frame rates, and can become unstable. Serious games update the simulation in **fixed steps**, for example exactly 1/60 of a second, and run as many steps as the elapsed time needs:

```javascript
accumulator += dt;
while (accumulator >= STEP) {
  update(state, input, STEP);
  accumulator -= STEP;
}
draw(state);
```

The game then behaves identically on every machine, which matters for physics and is essential for multiplayer.

## Where to go next

| Goal | Look at |
| --- | --- |
| bigger 2D games in the browser | Phaser, PixiJS |
| a full engine with an editor, free and open | Godot |
| the industry's most used engines | Unity (C#), Unreal Engine (C++) |
| 3D in the browser | Three.js |
| understanding performance | [C](c/01-hello) and [Rust](rust/01-basics), the languages engines are written in |
| path finding and AI | [graphs and shortest paths](dsa/11-graphs-bfs-dfs) |

An engine gives you the loop, the renderer, physics and an editor. What you learned here is what it does for you underneath, and why its concepts are named the way they are.

## Finish something

The most common outcome of a game project is that it is never finished. The ones that are finished are **small**. Make Pong. Then Breakout. Then something with one idea of your own. A finished small game teaches more than an abandoned big one, and it is something you can show.

## Common mistakes

- **Starting with a huge game.**
- **Polish before the game is fun** with plain rectangles.
- **Checking collisions before moving**, so everything reacts one frame late.
- **Starting the loop before the images have loaded.**
- **Allocating new objects for every particle, every frame.**
