import sys


def two_sum(numbers, target):
    # Return the two positions (i, j), with i < j, whose numbers add up to target.
    return (0, 0)


def main():
    data = sys.stdin.read().split()
    n, target = int(data[0]), int(data[1])
    numbers = [int(x) for x in data[2:2 + n]]
    i, j = two_sum(numbers, target)
    print(i, j)


main()
