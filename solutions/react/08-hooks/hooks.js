import { useEffect, useState } from "react";

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((previous) => !previous);
  return [on, toggle];
}

export function useCounter(start = 0, step = 1) {
  const [count, setCount] = useState(start);
  return {
    count,
    increment: () => setCount((c) => c + step),
    decrement: () => setCount((c) => c - step),
    reset: () => setCount(start),
  };
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initial : JSON.parse(stored);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
