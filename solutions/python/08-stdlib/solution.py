import math
from collections import Counter
from datetime import date


def days_between(first, second):
    delta = date.fromisoformat(second) - date.fromisoformat(first)
    return abs(delta.days)


def top_words(words, n):
    counts = Counter(words)
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return ordered[:n]


def hypotenuse(a, b):
    return math.hypot(a, b)
