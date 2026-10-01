import sys


class RangeSum:
    def __init__(self, data):
        self.n = len(data)
        self.tree = [0] * (2 * self.n)
        self.tree[self.n:] = data
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, index, value):
        i = index + self.n
        self.tree[i] = value
        i //= 2
        while i >= 1:
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]
            i //= 2

    def total(self, left, right):
        result = 0
        lo = left + self.n
        hi = right + self.n + 1
        while lo < hi:
            if lo % 2 == 1:
                result += self.tree[lo]
                lo += 1
            if hi % 2 == 1:
                hi -= 1
                result += self.tree[hi]
            lo //= 2
            hi //= 2
        return result


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
