import sys


def count_components(n, edges):
    graph = [[] for _ in range(n + 1)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    visited = [False] * (n + 1)
    count = 0
    for start in range(1, n + 1):
        if visited[start]:
            continue
        count += 1
        visited[start] = True
        stack = [start]
        while stack:
            node = stack.pop()
            for neighbour in graph[node]:
                if not visited[neighbour]:
                    visited[neighbour] = True
                    stack.append(neighbour)
    return count


def main():
    data = sys.stdin.read().split()
    n, m = int(data[0]), int(data[1])
    edges = [(int(data[2 + 2 * i]), int(data[3 + 2 * i])) for i in range(m)]
    print(count_components(n, edges))


main()
