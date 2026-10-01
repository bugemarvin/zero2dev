"use client";

import { useState } from "react";

export default function LikeButton({ name }) {
  const [likes, setLikes] = useState(0);
  return (
    <button onClick={() => setLikes(likes + 1)}>
      Like {name} ({likes})
    </button>
  );
}
