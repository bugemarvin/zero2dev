import sys


def pair_with_sum(numbers, target):
    lo, hi = 0, len(numbers) - 1
    while lo < hi:
        total = numbers[lo] + numbers[hi]
        if total == target:
            return numbers[lo], numbers[hi]
        if total < target:
            lo += 1
        else:
            hi -= 1
    return None


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
