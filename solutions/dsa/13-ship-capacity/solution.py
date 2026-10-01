import sys


def days_needed(weights, capacity):
    days = 1
    load = 0
    for w in weights:
        if load + w > capacity:
            days += 1
            load = 0
        load += w
    return days


def min_capacity(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(weights, mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo


def main():
    data = sys.stdin.read().split()
    n, days = int(data[0]), int(data[1])
    weights = [int(x) for x in data[2:2 + n]]
    print(min_capacity(weights, days))


main()
