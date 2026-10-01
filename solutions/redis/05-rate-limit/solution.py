def allow(redis, client, limit, window):
    key = f"rate:{client}"
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window)
    return count <= limit


def remaining(redis, client, limit):
    count = int(redis.get(f"rate:{client}") or 0)
    return max(limit - count, 0)
