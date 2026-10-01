import sys


def lower_bound(numbers, x):
    lo, hi = 0, len(numbers)
    while lo < hi:
        mid = (lo + hi) // 2
        if numbers[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    numbers = [int(x) for x in data[2:2 + n]]
    queries = [int(x) for x in data[2 + n:2 + n + q]]
    print("\n".join(str(lower_bound(numbers, x)) for x in queries))


main()
