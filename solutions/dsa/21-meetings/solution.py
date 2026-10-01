import sys


def max_meetings(meetings):
    count = 0
    free_from = None
    for start, end in sorted(meetings, key=lambda m: m[1]):
        if free_from is None or start >= free_from:
            count += 1
            free_from = end
    return count


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    meetings = [(int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(n)]
    print(max_meetings(meetings))


main()
