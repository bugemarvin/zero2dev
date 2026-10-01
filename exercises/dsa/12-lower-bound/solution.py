import sys


def lower_bound(numbers, x):
    # numbers is sorted. Return the first index i with numbers[i] >= x,
    # or len(numbers) if there is none.
    pass


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    numbers = [int(x) for x in data[2:2 + n]]
    queries = [int(x) for x in data[2 + n:2 + n + q]]
    print("\n".join(str(lower_bound(numbers, x)) for x in queries))


main()
