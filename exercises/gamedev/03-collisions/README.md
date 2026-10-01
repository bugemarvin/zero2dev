# Collisions and coins

Write four functions in `game.mjs`. A rectangle is `{ x, y, w, h }` with `x, y` the top left corner. A circle is `{ x, y, r }` with `x, y` the centre.

- `rectsOverlap(a, b)` returns whether two rectangles overlap. Rectangles that only touch at an edge or a corner do **not** overlap.
- `circlesOverlap(a, b)` returns whether two circles overlap: the distance between the centres is **less than** the sum of the radii. Do not use a square root.
- `circleRect(circle, rect)` returns whether a circle overlaps a rectangle: the distance from the circle's centre to the nearest point of the rectangle is less than the radius.
- `collect(player, coins)` receives a rectangle and an array of circles. It returns `{ coins, collected }`: a **new** array with the coins the player does not touch, in their original order, and the number of coins that were picked up. The array it was given is not changed.

**Start app** opens the game in a browser tab. It runs your `game.mjs`, so you see your work move. Reload the tab after each change.
