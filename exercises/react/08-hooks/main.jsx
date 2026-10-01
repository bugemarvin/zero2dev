// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import { useCounter, useLocalStorage, useToggle } from "./hooks.js";

function Demo() {
  const [on, toggle] = useToggle();
  const { count, increment, decrement, reset } = useCounter(0, 1);
  const [name, setName] = useLocalStorage("demo-name", "");
  return (
    <>
      <p><button onClick={toggle}>Toggle</button> {on ? "on" : "off"}</p>
      <p>
        <button onClick={decrement}>-</button> {count} <button onClick={increment}>+</button>{" "}
        <button onClick={reset}>Reset</button>
      </p>
      <p>
        <label>Name (kept after a reload) <input value={name} onChange={(e) => setName(e.target.value)} /></label>
      </p>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
