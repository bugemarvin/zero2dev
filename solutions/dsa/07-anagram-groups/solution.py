import sys


def anagram_groups(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word))
        groups[key] = groups.get(key, 0) + 1
    return len(groups), max(groups.values())


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    groups, largest = anagram_groups(data[1:1 + n])
    print(groups, largest)


main()
