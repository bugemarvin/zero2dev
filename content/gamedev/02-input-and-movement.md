---
title: Input and movement
summary: Keyboard state, velocity, acceleration, gravity and jumping.
---

## Keys are a state, not an event

The browser tells you when a key goes down and when it comes up. A game needs to know, every frame, **which keys are held right now**. So record them:

```javascript
const keys = {};

window.addEventListener("keydown", (event) => { keys[event.code] = true; });
window.addEventListener("keyup", (event) => { keys[event.code] = false; });
```

`event.code` names the physical key: `"ArrowLeft"`, `"KeyA"`, `"Space"`. In `update` you then ask:

```javascript
if (keys.ArrowLeft) { player.x -= player.speed * dt; }
```

Do not move the player inside the `keydown` handler. The operating system repeats a held key after a pause and at its own rate, which gives jerky movement that differs from machine to machine.

Calling `event.preventDefault()` for the arrow keys and the space bar stops the page from scrolling while playing.

## Direction as a vector

Turn the keys into a direction:

```javascript
let dx = 0;
let dy = 0;
if (keys.ArrowLeft) dx -= 1;
if (keys.ArrowRight) dx += 1;
if (keys.ArrowUp) dy -= 1;          // up is negative y
if (keys.ArrowDown) dy += 1;
```

Holding left and right together gives 0: they cancel, which is what players expect.

## The diagonal problem

With right and down both held, the direction is `(1, 1)`. Its length is not 1 but the square root of 2, about 1.41. The player moves **41% faster diagonally**. Many old games have this bug.

**Normalise** the vector: divide it by its length, so that its length becomes 1.

```javascript
const length = Math.hypot(dx, dy);
if (length > 0) {
  dx /= length;
  dy /= length;
}

player.x += dx * player.speed * dt;
player.y += dy * player.speed * dt;
```

`Math.hypot(dx, dy)` is the length of the vector. Check for 0 before dividing.

## Staying on the screen

**Clamp** a value between two limits:

```javascript
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

player.x = clamp(player.x, 0, width - player.w);
```

## Velocity and acceleration

Moving at a fixed speed the instant a key is pressed feels stiff. Real things speed up and slow down:

- **position** changes by **velocity**;
- **velocity** changes by **acceleration**.

```javascript
player.vx += acceleration * dx * dt;      // the keys push
player.vx *= 0.9;                         // friction slows it down
player.x += player.vx * dt;
```

Tuning these few numbers is most of what makes a game "feel" right.

## Gravity and jumping

Gravity is a constant acceleration downwards. A jump is a sudden velocity upwards:

```javascript
const GRAVITY = 1500;       // pixels per second, per second
const JUMP = -550;          // negative: up

if (keys.Space && body.onGround) {
  body.vy = JUMP;
  body.onGround = false;
}

body.vy += GRAVITY * dt;
body.y += body.vy * dt;

if (body.y >= groundY) {    // landed
  body.y = groundY;
  body.vy = 0;
  body.onGround = true;
}
```

The check `body.onGround` is what prevents jumping again in mid-air.

## Mouse and touch

```javascript
canvas.addEventListener("pointermove", (event) => {
  const box = canvas.getBoundingClientRect();
  mouse.x = (event.clientX - box.left) * (canvas.width / box.width);
  mouse.y = (event.clientY - box.top) * (canvas.height / box.height);
});
```

Pointer events cover mouse, pen and touch. The scaling matters when CSS shows the canvas at a different size than its `width` and `height`.

## Keep input out of the logic

Pass the input **into** `update` as plain data:

```javascript
update(state, { left: keys.ArrowLeft, right: keys.ArrowRight, jump: keys.Space }, dt);
```

Then the game logic does not know about keyboards. A test can feed it any input, and adding a gamepad or touch buttons later only changes how that small object is filled.

## Common mistakes

- **Moving inside the key event.**
- **Faster diagonal movement.**
- **Dividing by a length of 0.**
- **Forgetting `dt`** on velocity or acceleration.
- **Jumping in mid-air**, because nothing checks the ground.
