import json


def get_user(cache, db, user_id):
    key = f"user:{user_id}"
    cached = cache.get(key)
    if cached is not None:
        return json.loads(cached)
    user = db.load_user(user_id)
    if user is None:
        cache.setex(key, 30, "null")
    else:
        cache.setex(key, 300, json.dumps(user))
    return user


def update_user(cache, db, user_id, fields):
    db.save_user(user_id, fields)
    cache.delete(f"user:{user_id}")
