import dataclasses
import math
import typing

import solution
from solution import Point, find_user, lengths, mean


def hints(f):
    return typing.get_type_hints(f)


def test_mean():
    """mean returns the average"""
    assert math.isclose(mean([1.0, 2.0, 6.0]), 3.0), f"mean([1.0, 2.0, 6.0]) is {mean([1.0, 2.0, 6.0])!r}"
    assert math.isclose(mean([2.5]), 2.5)


def test_mean_empty():
    """mean([]) raises ValueError"""
    try:
        mean([])
    except ValueError:
        return
    except Exception as exc:
        assert False, f"mean([]) raised {type(exc).__name__}, expected ValueError"
    assert False, "mean([]) should raise ValueError"


def test_mean_hints():
    """mean is annotated: (values: list[float]) -> float"""
    assert hints(mean) == {"values": list[float], "return": float}, f"hints are {hints(mean)!r}"


def test_find_user():
    """find_user returns the name or None"""
    users = {1: "ada", 2: "linus"}
    assert find_user(users, 2) == "linus"
    assert find_user(users, 9) is None
    assert find_user({}, 1) is None


def test_find_user_hints():
    """find_user is annotated: (users: dict[int, str], user_id: int) -> str | None"""
    assert hints(find_user) == {"users": dict[int, str], "user_id": int, "return": typing.Optional[str]}, f"hints are {hints(find_user)!r}"


def test_lengths():
    """lengths maps each word to its length"""
    assert lengths(["hi", "hello"]) == {"hi": 2, "hello": 5}
    assert lengths([]) == {}


def test_lengths_hints():
    """lengths is annotated: (words: list[str]) -> dict[str, int]"""
    assert hints(lengths) == {"words": list[str], "return": dict[str, int]}, f"hints are {hints(lengths)!r}"


def test_point_is_dataclass():
    """Point is a dataclass with float fields x and y"""
    assert dataclasses.is_dataclass(Point), "Point is not a dataclass (add @dataclass)"
    fields = {f.name: f.type for f in dataclasses.fields(Point)}
    assert fields in ({"x": float, "y": float}, {"x": "float", "y": "float"}), f"fields are {fields!r}"
    assert Point(1.0, 2.0) == Point(1.0, 2.0), "dataclass instances with equal fields should be equal"


def test_point_distance():
    """Point.distance_to returns the distance and is annotated"""
    assert math.isclose(Point(0.0, 0.0).distance_to(Point(3.0, 4.0)), 5.0)
    assert math.isclose(Point(1.0, 1.0).distance_to(Point(1.0, 1.0)), 0.0)
    got = typing.get_type_hints(Point.distance_to, vars(solution))
    assert got == {"other": Point, "return": float}, f"hints of distance_to are {got!r}"
