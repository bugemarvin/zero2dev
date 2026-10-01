import sys


def count_prefixes(words, prefixes):
    # Return a list with, for each prefix, the number of words that start with it.
    return []


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    words = data[2:2 + n]
    prefixes = data[2 + n:2 + n + q]
    print("\n".join(str(c) for c in count_prefixes(words, prefixes)))


main()
