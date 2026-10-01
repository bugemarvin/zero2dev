import sys


def lcs(a, b):
    previous = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        current = [0] * (len(b) + 1)
        ai = a[i - 1]
        for j in range(1, len(b) + 1):
            if ai == b[j - 1]:
                current[j] = previous[j - 1] + 1
            elif previous[j] >= current[j - 1]:
                current[j] = previous[j]
            else:
                current[j] = current[j - 1]
        previous = current
    return previous[len(b)]


def main():
    lines = sys.stdin.read().split("\n")
    print(lcs(lines[0], lines[1] if len(lines) > 1 else ""))


main()
