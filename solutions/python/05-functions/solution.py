def clamp(x, low=0, high=100):
    return max(low, min(x, high))


def average(*numbers):
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)


def min_max(numbers):
    return min(numbers), max(numbers)


def apply_twice(f, x):
    return f(f(x))
