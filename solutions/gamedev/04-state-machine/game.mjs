export function initialState() {
  return { mode: "menu", score: 0, lives: 3, level: 1 };
}

export function next(state, event) {
  switch (state.mode) {
    case "menu":
      return event.type === "start" ? { ...state, mode: "playing" } : state;
    case "paused":
      return event.type === "resume" ? { ...state, mode: "playing" } : state;
    case "over":
      return event.type === "restart" ? { ...initialState(), mode: "playing" } : state;
    case "playing": {
      if (event.type === "pause") {
        return { ...state, mode: "paused" };
      }
      if (event.type === "score") {
        const score = state.score + event.points;
        return { ...state, score, level: 1 + Math.floor(score / 100) };
      }
      if (event.type === "hit") {
        const lives = state.lives - 1;
        return { ...state, lives, mode: lives <= 0 ? "over" : "playing" };
      }
      return state;
    }
    default:
      return state;
  }
}
