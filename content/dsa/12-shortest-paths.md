---
title: Shortest paths with weights
summary: When edges have different costs, BFS is not enough. Dijkstra's algorithm, and what to use when it does not apply.
---

## Why BFS stops working

BFS finds the path with the fewest **edges**. With weights, the path with the fewest edges may not be the cheapest:

```text
A --1-- B --1-- C
 \             /
  -----5------
```

From A to C the direct edge costs 5. The path through B uses two edges and costs 2.

## Dijkstra's algorithm

Dijkstra finds the cheapest distance from one start node to every other node, as long as **no edge has a negative weight**.

The idea: always settle the unsettled node that is currently closest to the start. Its distance cannot be improved any more, because every other route would have to pass through a node that is at least as far away, and edges only add cost.

1. Set the distance of the start to 0 and of everything else to infinity.
2. Take the closest node that is not yet settled.
3. For each of its edges, check whether going through this node gives a shorter distance to the neighbour. If so, record it. This step is called **relaxing** the edge.
4. Repeat until no nodes are left.

A [heap](dsa/10-heaps) supplies "the closest node" efficiently.

```python
import heapq

def dijkstra(graph, start, n):
    # graph[node] is a list of (neighbour, weight) pairs
    INF = float("inf")
    dist = [INF] * (n + 1)
    dist[start] = 0
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue                  # an outdated entry: skip it
        for neighbour, weight in graph[node]:
            candidate = d + weight
            if candidate < dist[neighbour]:
                dist[neighbour] = candidate
                heapq.heappush(heap, (candidate, neighbour))
    return dist
```

When a shorter distance to a node is found, a new entry is pushed and the old one stays in the heap. The check `if d > dist[node]: continue` throws those old entries away when they surface. That is simpler than updating entries in place.

With a heap the running time is **O((nodes + edges) log nodes)**.

## Recovering the path

Record where each improvement came from, then walk backwards from the goal:

```python
            if candidate < dist[neighbour]:
                dist[neighbour] = candidate
                parent[neighbour] = node
```

```python
def path_to(goal, parent):
    path = [goal]
    while path[-1] in parent:
        path.append(parent[path[-1]])
    return path[::-1]
```

## Why negative weights break it

Dijkstra assumes a settled node is final. A negative edge found later could make it cheaper after all, and the algorithm never looks back.

## Bellman-Ford

Bellman-Ford handles negative edges. It relaxes **every** edge, `n - 1` times over. A shortest path has at most `n - 1` edges, so after that many rounds every distance is final.

```python
def bellman_ford(edges, start, n):
    INF = float("inf")
    dist = [INF] * (n + 1)
    dist[start] = 0
    for _ in range(n - 1):
        for a, b, w in edges:
            if dist[a] + w < dist[b]:
                dist[b] = dist[a] + w
    return dist
```

If one more round still improves something, the graph has a **negative cycle**: a loop whose total weight is below zero. Then "shortest" has no meaning, since going round again always costs less.

It runs in O(nodes × edges), far slower than Dijkstra.

## Choosing

| Situation | Algorithm | Cost |
| --- | --- | --- |
| all edges cost the same | BFS | O(V + E) |
| weights zero or more | Dijkstra | O((V + E) log V) |
| negative weights | Bellman-Ford | O(V × E) |
| shortest paths between all pairs, small graph | Floyd-Warshall | O(V³) |

V is the number of nodes and E the number of edges.

**Floyd-Warshall** is three nested loops that allow each node in turn as a stop-over:

```python
for k in nodes:
    for i in nodes:
        for j in nodes:
            if dist[i][k] + dist[k][j] < dist[i][j]:
                dist[i][j] = dist[i][k] + dist[k][j]
```

## Common mistakes

- **Using Dijkstra with negative edges.** The answers are silently wrong.
- **Marking a node as done when it is pushed.** In Dijkstra a node is final only when it is **popped**.
- **Leaving out the stale-entry check**, which makes the algorithm slow.
- **Treating "unreachable" as 0.** Keep infinity until the end, and report it separately.
