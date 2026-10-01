import sys


def permutations(n):
    result = []
    current = []
    used = [False] * (n + 1)

    def build():
        if len(current) == n:
            result.append(current.copy())
            return
        for value in range(1, n + 1):
            if not used[value]:
                used[value] = True
                current.append(value)
                build()
                current.pop()
                used[value] = False

    build()
    return result


def main():
    n = int(sys.stdin.read().split()[0])
    for p in permutations(n):
        print(" ".join(str(x) for x in p))


main()
