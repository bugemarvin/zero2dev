from solution import allow, remaining


class FakeRedis:
    """A counter store with expiry. Time is moved by hand."""

    def __init__(self):
        self.data = {}
        self.expires = {}
        self.now = 0
        self.expire_calls = []

    def _clean(self, key):
        if key in self.expires and self.expires[key] <= self.now:
            self.data.pop(key, None)
            self.expires.pop(key, None)

    def incr(self, key):
        self._clean(key)
        self.data[key] = int(self.data.get(key, 0)) + 1
        return self.data[key]

    def expire(self, key, seconds):
        self._clean(key)
        self.expire_calls.append((key, seconds))
        if key in self.data:
            self.expires[key] = self.now + seconds
        return key in self.data

    def get(self, key):
        self._clean(key)
        value = self.data.get(key)
        return None if value is None else str(value)


def test_allows_up_to_the_limit():
    """the first `limit` requests are allowed, the next is refused"""
    r = FakeRedis()
    answers = [allow(r, "10.0.0.1", 3, 60) for _ in range(5)]
    assert answers == [True, True, True, False, False], f"got {answers}"


def test_key_name():
    """the counter is stored under rate:CLIENT"""
    r = FakeRedis()
    allow(r, "10.0.0.1", 3, 60)
    assert list(r.data) == ["rate:10.0.0.1"], f"keys: {list(r.data)}"


def test_expiry_set_once():
    """the expiry is set on the first request of a window, and not again"""
    r = FakeRedis()
    for _ in range(4):
        allow(r, "a", 3, 60)
    assert r.expire_calls == [("rate:a", 60)], f"expire was called like this: {r.expire_calls}"


def test_window_resets():
    """after the window, the client may make requests again"""
    r = FakeRedis()
    for _ in range(4):
        allow(r, "a", 3, 60)
    r.now = 30
    assert allow(r, "a", 3, 60) is False, "still inside the window"
    r.now = 61
    assert allow(r, "a", 3, 60) is True, "the window is over, so this request starts a new one"
    assert r.expires.get("rate:a") == 121, "the new window should expire 60 seconds after its first request"


def test_clients_are_separate():
    """each client has its own counter"""
    r = FakeRedis()
    assert [allow(r, "a", 1, 60), allow(r, "a", 1, 60)] == [True, False]
    assert allow(r, "b", 1, 60) is True


def test_remaining():
    """remaining counts down and never goes below 0"""
    r = FakeRedis()
    assert remaining(r, "a", 3) == 3, "a client with no counter has everything left"
    allow(r, "a", 3, 60)
    assert remaining(r, "a", 3) == 2
    for _ in range(5):
        allow(r, "a", 3, 60)
    assert remaining(r, "a", 3) == 0
    r.now = 100
    assert remaining(r, "a", 3) == 3, "after the window the allowance is back"
