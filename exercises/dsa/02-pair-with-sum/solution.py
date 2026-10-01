import sys


def pair_with_sum(numbers, target):
    # numbers is sorted in increasing order.
    # Return a tuple (a, b) with a < b and a + b == target, or None.
    pass


def main():
    data = sys.stdin.read().split()
    n, target = int(data[0]), int(data[1])
    numbers = [int(x) for x in data[2:2 + n]]
    pair = pair_with_sum(numbers, target)
    if pair is None:
        print("none")
    else:
        print(pair[0], pair[1])


main()
