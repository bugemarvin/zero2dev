import sys


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.groups = n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.groups -= 1

    def same(self, a, b):
        return self.find(a) == self.find(b)

    def count(self):
        return self.groups


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
