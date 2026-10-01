export function initialState() {
  return { mode: "menu", score: 0, lives: 3, level: 1 };
}

export function next(state, event) {
  return state;
}
