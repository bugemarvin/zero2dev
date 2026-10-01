from dataclasses import dataclass
from typing import Optional


def mean(values: list[float]) -> float:
    if not values:
        raise ValueError("mean of an empty list")
    return sum(values) / len(values)


def find_user(users: dict[int, str], user_id: int) -> Optional[str]:
    return users.get(user_id)


def lengths(words: list[str]) -> dict[str, int]:
    return {word: len(word) for word in words}


@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5
