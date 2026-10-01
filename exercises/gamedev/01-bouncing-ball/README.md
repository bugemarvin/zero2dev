# A bouncing ball

Write two functions in `game.mjs`.

## `clampDt(dt)`

Returns `dt`, but never more than `0.05` and never less than `0`.

## `update(ball, dt, width, height)`

A ball is `{ x, y, vx, vy, r }`: its centre, its velocity in pixels per second, and its radius. Returns a **new** ball object, moved by `dt` seconds. The ball it was given is not changed.

- Move: `x` grows by `vx * dt`, and `y` by `vy * dt`.
- If the left edge of the ball (`x - r`) is past `0`, put the ball at `x = r` and make `vx` positive.
- If the right edge (`x + r`) is past `width`, put it at `x = width - r` and make `vx` negative.
- The same for the top (`0`) and the bottom (`height`), with `y` and `vy`.

**Start app** opens the game in a browser tab. It runs your `game.mjs`, so you see your work move. Reload the tab after each change.
