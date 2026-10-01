import { useState } from "react";

export default function Counter({ start = 0, step = 1 }) {
  return <p>Count: {start}</p>;
}
