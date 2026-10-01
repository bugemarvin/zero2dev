import sys


def anagram_groups(words):
    # Return a tuple: (number of groups, size of the largest group).
    return (0, 0)


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    groups, largest = anagram_groups(data[1:1 + n])
    print(groups, largest)


main()
