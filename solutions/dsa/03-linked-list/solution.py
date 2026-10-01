import sys


class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def push_front(self, value):
        self.head = Node(value, self.head)
        if self.tail is None:
            self.tail = self.head

    def push_back(self, value):
        node = Node(value)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node

    def pop_front(self):
        if self.head is None:
            return None
        value = self.head.value
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        return value

    def reverse(self):
        self.tail = self.head
        prev = None
        node = self.head
        while node is not None:
            following = node.next
            node.next = prev
            prev = node
            node = following
        self.head = prev

    def to_list(self):
        values = []
        node = self.head
        while node is not None:
            values.append(node.value)
            node = node.next
        return values


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
