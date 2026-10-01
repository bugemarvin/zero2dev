import sys


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        # Return the root of the group containing x.
        return x

    def union(self, a, b):
        pass

    def same(self, a, b):
        return False

    def count(self):
        # Return the number of groups.
        return 0


def main():
    lines = sys.stdin.read().split("\n")
    n, q = (int(x) for x in lines[0].split())
    groups = UnionFind(n)
    out = []
    for line in lines[1:1 + q]:
        parts = line.split()
        if parts[0] == "union":
            groups.union(int(parts[1]), int(parts[2]))
        elif parts[0] == "same":
            out.append("yes" if groups.same(int(parts[1]), int(parts[2])) else "no")
        elif parts[0] == "count":
            out.append(str(groups.count()))
    print("\n".join(out))


main()
