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
        if self.root is None:
            self.root = Node(value)
            return
        node = self.root
        while True:
            if value == node.value:
                return
            if value < node.value:
                if node.left is None:
                    node.left = Node(value)
                    return
                node = node.left
            else:
                if node.right is None:
                    node.right = Node(value)
                    return
                node = node.right

    def contains(self, value):
        node = self.root
        while node is not None:
            if value == node.value:
                return True
            node = node.left if value < node.value else node.right
        return False

    def minimum(self):
        if self.root is None:
            return None
        node = self.root
        while node.left is not None:
            node = node.left
        return node.value

    def maximum(self):
        if self.root is None:
            return None
        node = self.root
        while node.right is not None:
            node = node.right
        return node.value

    def height(self):
        best = 0
        stack = [(self.root, 1)]
        while stack:
            node, depth = stack.pop()
            if node is None:
                continue
            best = max(best, depth)
            stack.append((node.left, depth + 1))
            stack.append((node.right, depth + 1))
        return best

    def in_order(self):
        values = []
        stack = []
        node = self.root
        while stack or node is not None:
            while node is not None:
                stack.append(node)
                node = node.left
            node = stack.pop()
            values.append(node.value)
            node = node.right
        return values


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
