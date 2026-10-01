import sys


def count_prefixes(words, prefixes):
    root = {}
    COUNT = "#"
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {COUNT: 0})
            node[COUNT] += 1
    result = []
    for prefix in prefixes:
        node = root
        for ch in prefix:
            node = node.get(ch)
            if node is None:
                break
        result.append(node[COUNT] if node is not None else 0)
    return result


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    words = data[2:2 + n]
    prefixes = data[2 + n:2 + n + q]
    print("\n".join(str(c) for c in count_prefixes(words, prefixes)))


main()
