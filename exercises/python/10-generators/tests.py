import inspect

from solution import chunks, countdown, fibonacci, take


def test_are_generators():
    """countdown, fibonacci and chunks are generator functions (they use yield)"""
    for f in (countdown, fibonacci, chunks):
        assert inspect.isgeneratorfunction(f), f"{f.__name__} does not use yield"


def test_countdown():
    """countdown(3) yields 3, 2, 1"""
    assert list(countdown(3)) == [3, 2, 1], f"got {list(countdown(3))!r}"
    assert list(countdown(1)) == [1]


def test_countdown_empty():
    """countdown(0) and countdown(-2) yield nothing"""
    assert list(countdown(0)) == []
    assert list(countdown(-2)) == []


def test_take():
    """take returns the first n values as a list"""
    assert take(3, [10, 20, 30, 40]) == [10, 20, 30]
    assert take(5, [1, 2]) == [1, 2], "take stops early when the iterable runs out"
    assert take(0, [1, 2]) == []


def test_take_is_lazy():
    """take asks for no more values than it needs"""
    asked = []

    def source():
        for i in range(100):
            asked.append(i)
            yield i

    assert take(3, source()) == [0, 1, 2]
    assert len(asked) <= 4, f"take(3, ...) pulled {len(asked)} values from the source"


def test_fibonacci():
    """fibonacci yields 0, 1, 1, 2, 3, 5, 8, ..."""
    gen = fibonacci()
    first = [next(gen) for _ in range(10)]
    assert first == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], f"got {first!r}"


def test_fibonacci_is_endless():
    """fibonacci keeps going: the 200th value is correct"""
    gen = fibonacci()
    value = None
    for _ in range(200):
        value = next(gen)
    assert value == 173402521172797813159685037284371942044301, f"got {value!r}"


def test_chunks():
    """chunks splits into lists of the given size"""
    assert list(chunks([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]], f"got {list(chunks([1, 2, 3, 4, 5], 2))!r}"
    assert list(chunks([1, 2, 3, 4], 2)) == [[1, 2], [3, 4]]
    assert list(chunks([], 3)) == []
    assert list(chunks("abcde", 3)) == [["a", "b", "c"], ["d", "e"]]


def test_chunks_is_lazy():
    """chunks works on an endless generator"""
    gen = chunks(fibonacci(), 3)
    assert next(gen) == [0, 1, 1]
    assert next(gen) == [2, 3, 5]
