# Catch the stars

A complete game: stars fall from the top, and a paddle at the bottom catches them. Write two functions in `game.mjs`.

## `createGame(width, height)`

Returns the starting state:

```javascript
{
  mode: "playing", width, height,
  paddle: { x: width / 2 - 40, y: height - 20, w: 80, h: 10, speed: 300 },
  stars: [], score: 0, lives: 3, spawnIn: 1,
}
```

## `update(game, input, dt, random = Math.random)`

`input` is `{ left, right }`. Returns a **new** game state after `dt` seconds, and never changes the one it was given. When `mode` is not `"playing"`, it returns the game unchanged. Otherwise, in this order:

1. **Paddle.** Move it left or right by `speed * dt` (both or neither key: no movement), and keep it between `0` and `width - w`.
2. **Stars fall.** Every star `{ x, y, r, vy }` moves down by `vy * dt`.
3. **Spawn.** Subtract `dt` from `spawnIn`. When it is `0` or less, add one star at the top: `{ x: 10 + random() * (width - 20), y: 0, r: 8, vy: 120 + score * 2 }`, and add `1` to `spawnIn`. A star that was just added does not move in this frame. Its `vy` uses the score from before this frame.
4. **Catch.** A star that overlaps the paddle is caught: it disappears and `score` grows by 10. Use the circle-against-rectangle test of lesson 3.
5. **Miss.** A star whose centre is below the bottom (`y > height`) disappears and costs one life.
6. **Game over.** When `lives` is 0 or less, set `lives` to 0 and `mode` to `"over"`.

**Start app** opens the game in a browser tab. It runs your `game.mjs`, so you see your work move. Reload the tab after each change.
