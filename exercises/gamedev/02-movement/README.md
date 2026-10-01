# Move and jump

Write three functions in `game.mjs`. The input is plain data, so they are easy to test.

## `direction(keys)`

`keys` is `{ left, right, up, down }`, each `true` or `false`. Returns `{ x, y }`:

- `x` is -1 for left, 1 for right, and 0 for neither or both. `y` is -1 for up and 1 for down, the same way.
- A diagonal is **normalised**: its length is 1, so `x` and `y` are about 0.7071 in size.

## `movePlayer(player, keys, dt, bounds)`

A player is `{ x, y, w, h, speed }`: the top left corner, the size, and the speed in pixels per second. `bounds` is `{ width, height }`. Returns a **new** player, moved in the direction of the keys by `speed * dt`, and kept fully inside the bounds: `x` between `0` and `width - w`, `y` between `0` and `height - h`.

## `jump(body, pressed, dt, groundY)`

A body is `{ y, vy, onGround }`. Returns a **new** body after `dt` seconds:

1. If `pressed` is true and the body is on the ground, set `vy` to `-550` and `onGround` to `false`.
2. If it is not on the ground: add `1500 * dt` to `vy`, then add `vy * dt` to `y`.
3. If `y` is now at or below the ground (`y >= groundY`), put it on the ground: `y = groundY`, `vy = 0`, `onGround = true`.

A body resting on the ground with nothing pressed does not change.

**Start app** opens the game in a browser tab. It runs your `game.mjs`, so you see your work move. Reload the tab after each change.
