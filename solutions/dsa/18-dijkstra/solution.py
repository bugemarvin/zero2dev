import heapq
import sys


def shortest_distances(n, edges):
    graph = [[] for _ in range(n + 1)]
    for a, b, w in edges:
        graph[a].append((b, w))
    INF = float("inf")
    dist = [INF] * (n + 1)
    dist[1] = 0
    heap = [(0, 1)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for neighbour, weight in graph[node]:
            candidate = d + weight
            if candidate < dist[neighbour]:
                dist[neighbour] = candidate
                heapq.heappush(heap, (candidate, neighbour))
    return [d if d != INF else -1 for d in dist[1:]]


def main():
    data = sys.stdin.read().split()
    n, m = int(data[0]), int(data[1])
    edges = [(int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])) for i in range(m)]
    print(" ".join(str(d) for d in shortest_distances(n, edges)))


main()
