def countdown(n):
    while n > 0:
        yield n
        n -= 1


def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


def chunks(items, size):
    chunk = []
    for item in items:
        chunk.append(item)
        if len(chunk) == size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def take(n, iterable):
    result = []
    if n <= 0:
        return result
    for item in iterable:
        result.append(item)
        if len(result) == n:
            break
    return result
