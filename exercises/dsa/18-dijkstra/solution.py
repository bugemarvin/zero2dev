import sys


def shortest_distances(n, edges):
    # edges is a list of (a, b, w): a road from a to b with cost w.
    # Return a list of n numbers: the distance from node 1 to nodes 1..n, -1 if unreachable.
    return []


def main():
    data = sys.stdin.read().split()
    n, m = int(data[0]), int(data[1])
    edges = [(int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])) for i in range(m)]
    print(" ".join(str(d) for d in shortest_distances(n, edges)))


main()
