import sys


class MinHeap:
    def __init__(self):
        self.items = []

    def push(self, value):
        items = self.items
        items.append(value)
        i = len(items) - 1
        while i > 0:
            parent = (i - 1) // 2
            if items[parent] <= items[i]:
                break
            items[parent], items[i] = items[i], items[parent]
            i = parent

    def pop(self):
        items = self.items
        if not items:
            return None
        top = items[0]
        last = items.pop()
        if items:
            items[0] = last
            i = 0
            n = len(items)
            while True:
                left, right = 2 * i + 1, 2 * i + 2
                smallest = i
                if left < n and items[left] < items[smallest]:
                    smallest = left
                if right < n and items[right] < items[smallest]:
                    smallest = right
                if smallest == i:
                    break
                items[i], items[smallest] = items[smallest], items[i]
                i = smallest
        return top

    def peek(self):
        return self.items[0] if self.items else None

    def size(self):
        return len(self.items)


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
