import sys


def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack


def main():
    lines = sys.stdin.read().split("\n")
    t = int(lines[0])
    for line in lines[1:1 + t]:
        print("yes" if balanced(line) else "no")


main()
