def add(a, b):
    return a + b


def average(numbers):
    if not numbers:
        raise ValueError("no numbers")
    return sum(numbers) / len(numbers)
