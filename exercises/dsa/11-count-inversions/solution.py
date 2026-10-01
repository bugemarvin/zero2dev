import sys


def count_inversions(numbers):
    # Return the number of pairs i < j with numbers[i] > numbers[j].
    pass


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = [int(x) for x in data[1:1 + n]]
    print(count_inversions(numbers))


main()
