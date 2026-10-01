import sys


def evaluate(tokens):
    # tokens is a list of strings such as ["3", "4", "+", "2", "*"].
    # Return the value of the expression as an integer.
    pass


def main():
    lines = sys.stdin.read().split("\n")
    t = int(lines[0])
    for line in lines[1:1 + t]:
        print(evaluate(line.split()))


main()
