import { useState } from "react";

export default function Counter({ start = 0, step = 1 }) {
  const [count, setCount] = useState(start);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + step)}>Add</button>
      <button onClick={() => setCount((c) => Math.max(0, c - step))} disabled={count === 0}>
        Subtract
      </button>
      <button onClick={() => setCount(start)}>Reset</button>
    </div>
  );
}
