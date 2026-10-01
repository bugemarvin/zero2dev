import { useEffect, useState } from "react";

export function useToggle(initial = false) {
  return [initial, () => {}];
}

export function useCounter(start = 0, step = 1) {
  return { count: start, increment() {}, decrement() {}, reset() {} };
}

export function useLocalStorage(key, initial) {
  return [initial, () => {}];
}
