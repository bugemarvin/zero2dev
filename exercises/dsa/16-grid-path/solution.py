import sys


def shortest_path(grid, rows, cols):
    # grid is a list of strings. Return the number of steps from S to G, or -1.
    pass


def main():
    lines = sys.stdin.read().split("\n")
    rows, cols = (int(x) for x in lines[0].split())
    grid = lines[1:1 + rows]
    print(shortest_path(grid, rows, cols))


main()
