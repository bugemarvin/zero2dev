import sys


def max_meetings(meetings):
    # meetings is a list of (start, end) pairs.
    pass


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    meetings = [(int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(n)]
    print(max_meetings(meetings))


main()
