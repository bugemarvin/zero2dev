import sys


def count_components(n, edges):
    # Nodes are numbered 1..n. edges is a list of (a, b) pairs.
    pass


def main():
    data = sys.stdin.read().split()
    n, m = int(data[0]), int(data[1])
    edges = [(int(data[2 + 2 * i]), int(data[3 + 2 * i])) for i in range(m)]
    print(count_components(n, edges))


main()
