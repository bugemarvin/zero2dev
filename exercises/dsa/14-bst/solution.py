import sys


class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        pass

    def contains(self, value):
        return False

    def minimum(self):
        # Return the smallest value, or None if the tree is empty.
        return None

    def maximum(self):
        return None

    def height(self):
        return 0

    def in_order(self):
        # Return the values as a sorted Python list.
        return []


def main():
    lines = sys.stdin.read().split("\n")
    q = int(lines[0])
    tree = BST()
    out = []
    for line in lines[1:1 + q]:
        parts = line.split()
        command = parts[0]
        if command == "insert":
            tree.insert(int(parts[1]))
        elif command == "contains":
            out.append("yes" if tree.contains(int(parts[1])) else "no")
        elif command == "min":
            value = tree.minimum()
            out.append("empty" if value is None else str(value))
        elif command == "max":
            value = tree.maximum()
            out.append("empty" if value is None else str(value))
        elif command == "height":
            out.append(str(tree.height()))
        elif command == "inorder":
            values = tree.in_order()
            out.append(" ".join(str(v) for v in values) if values else "empty")
    print("\n".join(out))


main()
