import sys


def permutations(n):
    # Return a list of all permutations of 1..n in dictionary order.
    # Each permutation is a list, for example [1, 3, 2].
    return []


def main():
    n = int(sys.stdin.read().split()[0])
    for p in permutations(n):
        print(" ".join(str(x) for x in p))


main()
