import sys


def ranking(students):
    # students is a list of (name, score) tuples.
    # Return the names, best score first; equal scores in alphabetical order.
    return []


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
