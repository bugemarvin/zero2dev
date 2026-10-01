import sys


def count_inversions(numbers):
    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, inv_left = sort(a[:mid])
        right, inv_right = sort(a[mid:])
        merged = []
        inversions = inv_left + inv_right
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
                inversions += len(left) - i
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, inversions

    return sort(numbers)[1]


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = [int(x) for x in data[1:1 + n]]
    print(count_inversions(numbers))


main()
