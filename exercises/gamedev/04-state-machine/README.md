# A game state machine

Write two functions in `game.mjs`.

## `initialState()`

Returns `{ mode: "menu", score: 0, lives: 3, level: 1 }`.

## `next(state, event)`

Returns the state after an event. An event is an object with a `type`. When the event does not apply in the current mode, return **the same state object**, unchanged. Never modify the state you were given.

| Mode | Event | Result |
| --- | --- | --- |
| `menu` | `{ type: "start" }` | mode becomes `playing` |
| `playing` | `{ type: "pause" }` | mode becomes `paused` |
| `paused` | `{ type: "resume" }` | mode becomes `playing` |
| `playing` | `{ type: "score", points: N }` | `score` grows by `N`, and `level` becomes `1 + Math.floor(score / 100)` |
| `playing` | `{ type: "hit" }` | `lives` goes down by 1. When it reaches 0, mode becomes `over`. |
| `over` | `{ type: "restart" }` | a fresh game in mode `playing`: score 0, lives 3, level 1 |

Everything else changes nothing: you cannot score while paused, pause the menu, or be hit after the game is over.

**Start app** opens the game in a browser tab. It runs your `game.mjs`, so you see your work move. Reload the tab after each change.
