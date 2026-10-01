---
title: Collisions
summary: Does this touch that? Rectangles, circles, and what to do when they meet.
---

## Hitboxes

Checking whether the exact pixels of two sprites overlap is slow and rarely needed. Games give each object a simple invisible shape, a **hitbox**: a rectangle or a circle. The player never sees it, and the game feels right as long as it roughly matches the picture.

A slightly **smaller** hitbox than the sprite feels fair. Players forgive a near miss that counted as a miss. They do not forgive being hit by something that visibly did not touch them.

## Rectangle against rectangle

An axis-aligned rectangle (one that is not rotated) is `{ x, y, w, h }`, with `x, y` the top left corner. The test is called **AABB**, for axis-aligned bounding box.

Two rectangles overlap when they overlap on the x axis **and** on the y axis:

```javascript
function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
```

Read the first line as "a's left edge is left of b's right edge". It is easier to see the opposite: they do **not** overlap if one is entirely to the left of, right of, above or below the other.

With `<` and `>`, rectangles that only share an edge do not count as overlapping.

## Circle against circle

Two circles overlap when the distance between their centres is less than the sum of their radii:

```javascript
function circlesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const reach = a.r + b.r;
  return dx * dx + dy * dy < reach * reach;
}
```

The comparison uses **squared** distances. A square root is slow, and unnecessary: if `d < r` then `d * d < r * r`.

## Circle against rectangle

Find the point of the rectangle that is closest to the circle's centre, by clamping the centre into the rectangle. Then check whether that point is inside the circle:

```javascript
function circleRect(circle, rect) {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}
```

This is the test for a ball and a paddle, or a ball and a brick.

## A point in a rectangle

For clicks and taps on buttons:

```javascript
function pointInRect(px, py, rect) {
  return px >= rect.x && px < rect.x + rect.w && py >= rect.y && py < rect.y + rect.h;
}
```

## Detection and response

Finding a collision is half the work. What happens next is the **response**:

| Collision | Response |
| --- | --- |
| player and coin | remove the coin, add to the score |
| bullet and enemy | remove both, play a sound |
| player and wall | push the player back out |
| ball and paddle | reverse the ball's direction |

Pushing out of a wall is simplest one axis at a time: move in x, check, undo if blocked. Then move in y, check, undo if blocked. The player then slides along a wall in place of sticking to it.

## Removing things safely

Do not delete from an array while looping over it: you skip the element after each removal. Build a new array of what survives:

```javascript
const remaining = coins.filter((coin) => !circleRect(coin, player));
const collected = coins.length - remaining.length;
```

## Tunnelling

A fast bullet can be on one side of a thin wall in one frame and on the other side in the next. It was never **inside** the wall, so no collision is found. This is **tunnelling**.

Remedies: cap `dt`, limit top speeds, make walls thicker than the fastest movement per frame, or move in several small steps within a frame.

## Many objects

Checking every object against every other costs the square of their number: 1000 objects need half a million checks per frame. Games cut this down by only comparing objects that are near each other, using a **grid** or a tree that sorts objects by region. For a few dozen objects, checking all pairs is fine.

## Common mistakes

- **Using the centre of a rectangle as its `x, y`** in one place and the corner in another.
- **Deleting from an array inside a `for` loop over it.**
- **A square root where squared distances compare just as well.**
- **Hitboxes as large as the sprite**, which feels unfair.
- **Fast objects passing through thin ones.**
