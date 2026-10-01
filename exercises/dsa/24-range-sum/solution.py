import sys


class RangeSum:
    def __init__(self, data):
        self.data = data

    def update(self, index, value):
        # Set the number at position index to value.
        pass

    def total(self, left, right):
        # Return the sum of positions left..right, both included.
        return 0


def main():
    lines = sys.stdin.read().split("\n")
    n, q = (int(x) for x in lines[0].split())
    tree = RangeSum([int(x) for x in lines[1].split()][:n])
    out = []
    for line in lines[2:2 + q]:
        parts = line.split()
        if parts[0] == "sum":
            out.append(str(tree.total(int(parts[1]), int(parts[2]))))
        elif parts[0] == "set":
            tree.update(int(parts[1]), int(parts[2]))
    print("\n".join(out))


main()
