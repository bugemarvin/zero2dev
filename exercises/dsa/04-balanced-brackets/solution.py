import sys


def balanced(text):
    # Return True if the brackets in text are balanced.
    pass


def main():
    lines = sys.stdin.read().split("\n")
    t = int(lines[0])
    for line in lines[1:1 + t]:
        print("yes" if balanced(line) else "no")


main()
