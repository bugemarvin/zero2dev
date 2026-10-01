# Annotated functions and a dataclass

Write the following in `solution.py`, with type hints on **every parameter and every return value**. The tests check both the behaviour and the hints.

- `mean(values: list[float]) -> float`: the average of the values. Raises `ValueError` for an empty list.
- `find_user(users: dict[int, str], user_id: int) -> str | None`: the name stored under `user_id`, or `None` if there is no such user.
- `lengths(words: list[str]) -> dict[str, int]`: a dictionary mapping each word to its length.
- `Point`: a dataclass with two `float` fields, `x` and `y`, and a method `distance_to(self, other: "Point") -> float`.

```python
mean([1.0, 2.0, 6.0])                # 3.0
find_user({1: "ada"}, 2)             # None
lengths(["hi", "hello"])             # {'hi': 2, 'hello': 5}
Point(0, 0).distance_to(Point(3, 4)) # 5.0
```

On Python older than 3.10, write `Optional[str]` (from `typing`) in place of `str | None`.
