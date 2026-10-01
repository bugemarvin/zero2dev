from solution import apply_twice, average, clamp, min_max


def test_apply_twice_with_functions():
    """apply_twice calls the function two times"""
    assert apply_twice(lambda n: n * 3, 2) == 18, "apply_twice(lambda n: n * 3, 2) should be 18"
    assert apply_twice(lambda s: s + "!", "hi") == "hi!!"
    calls = []
    apply_twice(lambda v: calls.append(v) or v, 0)
    assert len(calls) == 2, f"f was called {len(calls)} times, expected 2"


def test_clamp_keywords():
    """clamp accepts low and high as keyword arguments"""
    assert clamp(5, high=3) == 3
    assert clamp(-10, low=-5) == -5
    assert clamp(x=1, low=2, high=4) == 2


def test_min_max_unpacks():
    """min_max returns two values that can be unpacked"""
    low, high = min_max([3, 9, 1, 5])
    assert (low, high) == (1, 9)


def test_average_is_float():
    """average returns a float"""
    assert isinstance(average(2, 4), float), "average(2, 4) should be the float 3.0"
