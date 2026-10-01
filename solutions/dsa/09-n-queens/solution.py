import sys


def count_queens(n):
    columns = set()
    diag1 = set()
    diag2 = set()

    def place(row):
        if row == n:
            return 1
        count = 0
        for col in range(n):
            if col in columns or (row - col) in diag1 or (row + col) in diag2:
                continue
            columns.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            count += place(row + 1)
            columns.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
        return count

    return place(0)


def main():
    n = int(sys.stdin.read().split()[0])
    print(count_queens(n))


main()
