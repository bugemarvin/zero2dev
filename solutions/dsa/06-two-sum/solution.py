import sys


def two_sum(numbers, target):
    position = {}
    for i, x in enumerate(numbers):
        need = target - x
        if need in position:
            return position[need], i
        position[x] = i
    return (-1, -1)


def main():
    data = sys.stdin.read().split()
    n, target = int(data[0]), int(data[1])
    numbers = [int(x) for x in data[2:2 + n]]
    i, j = two_sum(numbers, target)
    print(i, j)


main()
