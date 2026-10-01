import sys


def largest(numbers):
    best = numbers[0]
    for x in numbers:
        if x > best:
            best = x
    return best


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = [int(x) for x in data[1:1 + n]]
    print(largest(numbers))


main()
