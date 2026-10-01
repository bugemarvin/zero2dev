def evens(numbers):
    return [n for n in numbers if n % 2 == 0]


def longest(words):
    best = ""
    for word in words:
        if len(word) > len(best):
            best = word
    return best


def running_total(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        result.append(total)
    return result


def unique(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
