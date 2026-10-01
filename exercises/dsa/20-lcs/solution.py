import sys


def lcs(a, b):
    # Return the length of the longest common subsequence of a and b.
    pass


def main():
    lines = sys.stdin.read().split("\n")
    print(lcs(lines[0], lines[1] if len(lines) > 1 else ""))


main()
