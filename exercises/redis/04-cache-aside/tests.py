import json

from solution import get_user, update_user


class FakeCache:
    """Behaves like a Redis client for the three commands used here. Time is moved by hand."""

    def __init__(self):
        self.data = {}
        self.now = 0
        self.calls = []

    def get(self, key):
        self.calls.append(("get", key))
        entry = self.data.get(key)
        if entry is None or entry[1] <= self.now:
            return None
        return entry[0]

    def setex(self, key, seconds, value):
        assert isinstance(value, str), f"values stored in Redis must be strings, got {type(value).__name__}"
        self.calls.append(("setex", key, seconds))
        self.data[key] = (value, self.now + seconds)

    def delete(self, key):
        self.calls.append(("delete", key))
        self.data.pop(key, None)


class FakeDb:
    def __init__(self):
        self.users = {7: {"id": 7, "name": "Ada"}}
        self.loads = 0

    def load_user(self, user_id):
        self.loads += 1
        user = self.users.get(user_id)
        return dict(user) if user else None

    def save_user(self, user_id, fields):
        self.users[user_id] = dict(self.users.get(user_id, {"id": user_id}), **fields)


def test_miss_then_hit():
    """the first read loads from the database, the second comes from the cache"""
    cache, db = FakeCache(), FakeDb()
    assert get_user(cache, db, 7) == {"id": 7, "name": "Ada"}
    assert get_user(cache, db, 7) == {"id": 7, "name": "Ada"}, "the cached user should be decoded from JSON"
    assert db.loads == 1, f"the database was asked {db.loads} times, expected 1"


def test_key_and_ttl():
    """the user is stored under user:7 as JSON, for 300 seconds"""
    cache, db = FakeCache(), FakeDb()
    get_user(cache, db, 7)
    assert "user:7" in cache.data, f"keys in the cache: {list(cache.data)}"
    value, expires = cache.data["user:7"]
    assert json.loads(value) == {"id": 7, "name": "Ada"}, f"stored value: {value!r}"
    assert expires == 300, f"the time limit is {expires} seconds, expected 300"


def test_expiry():
    """after the time limit, the database is asked again"""
    cache, db = FakeCache(), FakeDb()
    get_user(cache, db, 7)
    cache.now = 301
    get_user(cache, db, 7)
    assert db.loads == 2, f"the database was asked {db.loads} times, expected 2"


def test_missing_user_is_cached():
    """a user that does not exist is cached as null for 30 seconds"""
    cache, db = FakeCache(), FakeDb()
    assert get_user(cache, db, 99) is None
    assert get_user(cache, db, 99) is None
    assert db.loads == 1, f"the database was asked {db.loads} times for a missing user, expected 1"
    value, expires = cache.data.get("user:99", (None, None))
    assert value == "null", f"stored value for the missing user: {value!r}"
    assert expires == 30, f"the time limit is {expires} seconds, expected 30"


def test_update_invalidates():
    """update_user saves, deletes the key, and the next read sees the new data"""
    cache, db = FakeCache(), FakeDb()
    get_user(cache, db, 7)
    update_user(cache, db, 7, {"name": "Ada L."})
    assert "user:7" not in cache.data, "the cached copy should be deleted after an update"
    assert ("delete", "user:7") in cache.calls, "use cache.delete to remove the key"
    assert get_user(cache, db, 7) == {"id": 7, "name": "Ada L."}


def test_users_do_not_mix():
    """each user has its own key"""
    cache, db = FakeCache(), FakeDb()
    db.users[8] = {"id": 8, "name": "Sam"}
    assert get_user(cache, db, 7)["name"] == "Ada"
    assert get_user(cache, db, 8)["name"] == "Sam"
    assert get_user(cache, db, 7)["name"] == "Ada"
    assert db.loads == 2, f"the database was asked {db.loads} times, expected 2"
