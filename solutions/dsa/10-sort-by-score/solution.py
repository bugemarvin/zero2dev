import sys


def ranking(students):
    ordered = sorted(students, key=lambda s: (-s[1], s[0]))
    return [name for name, _ in ordered]


def main():
    lines = sys.stdin.read().split("\n")
    n = int(lines[0])
    students = []
    for line in lines[1:1 + n]:
        name, score = line.split()
        students.append((name, int(score)))
    for name in ranking(students):
        print(name)


main()
