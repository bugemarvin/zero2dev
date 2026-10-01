import sys


class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None

    def push_front(self, value):
        pass

    def push_back(self, value):
        pass

    def pop_front(self):
        # Remove the first node and return its value, or None if the list is empty.
        pass

    def reverse(self):
        pass

    def to_list(self):
        # Return the values as a Python list, front to back.
        return []


def main():
    lines = sys.stdin.read().split("\n")
    q = int(lines[0])
    items = LinkedList()
    out = []
    for line in lines[1:1 + q]:
        parts = line.split()
        command = parts[0]
        if command == "push_front":
            items.push_front(int(parts[1]))
        elif command == "push_back":
            items.push_back(int(parts[1]))
        elif command == "pop_front":
            value = items.pop_front()
            out.append("empty" if value is None else str(value))
        elif command == "reverse":
            items.reverse()
        elif command == "print":
            values = items.to_list()
            out.append(" ".join(str(v) for v in values) if values else "empty")
    print("\n".join(out))


main()
