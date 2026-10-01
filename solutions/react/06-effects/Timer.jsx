import { useEffect, useState } from "react";

export function DocumentTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const id = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <p>{seconds} {seconds === 1 ? "second" : "seconds"}</p>
      <button onClick={() => setRunning(!running)}>{running ? "Stop" : "Start"}</button>
    </div>
  );
}
