import sys


def largest(numbers):
    # Return the largest value in the list.
    pass


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = [int(x) for x in data[1:1 + n]]
    print(largest(numbers))


main()
