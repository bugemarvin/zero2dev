import sys


def evaluate(tokens):
    stack = []
    for token in tokens:
        if token in ("+", "-", "*"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            else:
                stack.append(a * b)
        else:
            stack.append(int(token))
    return stack.pop()


def main():
    lines = sys.stdin.read().split("\n")
    t = int(lines[0])
    for line in lines[1:1 + t]:
        print(evaluate(line.split()))


main()
