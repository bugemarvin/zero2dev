import sys


class MinHeap:
    def __init__(self):
        self.items = []

    def push(self, value):
        pass

    def pop(self):
        # Remove and return the smallest value, or None if the heap is empty.
        return None

    def peek(self):
        return None

    def size(self):
        return 0


def main():
    lines = sys.stdin.read().split("\n")
    q = int(lines[0])
    heap = MinHeap()
    out = []
    for line in lines[1:1 + q]:
        parts = line.split()
        command = parts[0]
        if command == "push":
            heap.push(int(parts[1]))
        elif command == "pop":
            value = heap.pop()
            out.append("empty" if value is None else str(value))
        elif command == "peek":
            value = heap.peek()
            out.append("empty" if value is None else str(value))
        elif command == "size":
            out.append(str(heap.size()))
    print("\n".join(out))


main()
