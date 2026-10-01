---
title: Graphs, BFS and DFS
summary: Model anything that has connections, and explore it systematically in two ways.
---

## What a graph is

A graph is a set of **nodes** (also called vertices) and **edges** connecting pairs of them. Roads between cities, friendships, links between web pages and dependencies between tasks are all graphs.

| Term | Meaning |
| --- | --- |
| undirected | an edge works both ways, like a friendship |
| directed | an edge has a direction, like a one-way street |
| weighted | each edge has a cost, like a distance |
| path | a sequence of nodes joined by edges |
| cycle | a path that returns to where it started |
| connected component | a group of nodes that can all reach each other |

A tree is a connected graph with no cycles.

## Storing a graph

The usual form is an **adjacency list**: for each node, the list of its neighbours.

```python
edges = [(1, 2), (1, 3), (2, 4)]
n = 4

graph = {node: [] for node in range(1, n + 1)}
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)        # leave this line out for a directed graph

# graph == {1: [2, 3], 2: [1, 4], 3: [1], 4: [2]}
```

It uses memory proportional to nodes plus edges, and lists a node's neighbours directly. The alternative, an `n` by `n` **adjacency matrix**, answers "is there an edge from a to b?" in O(1) and costs O(n²) memory, which is too much for large sparse graphs.

## Breadth-first search

BFS explores in **waves**: first the start node, then everything one step away, then everything two steps away. It uses a **queue**.

```python
from collections import deque

def bfs_distances(graph, start):
    dist = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbour in graph[node]:
            if neighbour not in dist:
                dist[neighbour] = dist[node] + 1
                queue.append(neighbour)
    return dist
```

Because nodes are reached in order of distance, the first time BFS reaches a node is by a **shortest path** in number of edges. That is the main reason to choose BFS.

Mark a node as visited **when it is added to the queue**, not when it is taken out. Otherwise the same node gets queued many times.

## Depth-first search

DFS goes as **deep** as it can along one path, then backs up and tries the next branch. It uses a **stack**, most simply the call stack through recursion.

```python
def dfs(graph, node, visited):
    visited.add(node)
    for neighbour in graph[node]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited)
```

On very large graphs the recursion can go too deep. Use an explicit stack then:

```python
def dfs_iterative(graph, start):
    visited = {start}
    stack = [start]
    while stack:
        node = stack.pop()
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                stack.append(neighbour)
    return visited
```

Both searches visit each node once and look at each edge once: **O(nodes + edges)**.

## Which one

| Task | Use |
| --- | --- |
| shortest path in an unweighted graph | BFS |
| nearest something | BFS |
| is there any path at all | either |
| count connected components | either |
| detect a cycle | DFS |
| order tasks by their dependencies | DFS |
| explore every possibility, as in backtracking | DFS |

## Counting components

Start a search from every node that has not been reached yet. Each new start is one more component.

```python
def count_components(graph):
    visited = set()
    count = 0
    for node in graph:
        if node not in visited:
            count += 1
            dfs(graph, node, visited)
    return count
```

## Grids are graphs

A grid needs no adjacency list. Each cell is a node, and its neighbours are the cells above, below, left and right.

```python
def shortest_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    dist = {start: 0}
    queue = deque([start])
    while queue:
        r, c = queue.popleft()
        if (r, c) == goal:
            return dist[(r, c)]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                queue.append((nr, nc))
    return -1
```

Check the bounds **before** reading the cell.

## Topological order

In a directed graph with no cycles, a **topological order** lists the nodes so that every edge points forward: each task after everything it depends on. One method: repeatedly take a node that has no remaining incoming edges, output it, and remove its outgoing edges. If nodes are left over when none qualifies, the graph has a cycle.

## Common mistakes

- **No visited set.** On a graph with a cycle the search never ends.
- **Marking visited too late** in BFS, which queues nodes many times.
- **Using DFS for a shortest path.** It finds a path, not the shortest one.
- **Adding each edge once in an undirected graph.** Both directions are needed.
