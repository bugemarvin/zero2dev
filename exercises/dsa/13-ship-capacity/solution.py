import sys


def min_capacity(weights, days):
    # Return the smallest capacity that ships everything within the given days.
    pass


def main():
    data = sys.stdin.read().split()
    n, days = int(data[0]), int(data[1])
    weights = [int(x) for x in data[2:2 + n]]
    print(min_capacity(weights, days))


main()
