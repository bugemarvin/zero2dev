---
title: Greedy algorithms
summary: Take the choice that looks best right now and never look back. Fast and simple, when it is correct.
---

## The idea

A **greedy algorithm** builds a solution step by step, always taking the option that is best at that moment, and never revises a choice.

When it works, it is usually the simplest and fastest solution: often one sort followed by one pass. The difficulty is knowing **whether** it works. Many greedy ideas sound convincing and are wrong.

## Where greedy fails

Making change with the fewest coins. "Take the largest coin that fits" works for coins 1, 5, 10, 25. With coins 1, 3, 4 and amount 6 it gives 4 + 1 + 1, when 3 + 3 is better. The largest coin first is not always part of the best answer. That problem needs [dynamic programming](dsa/13-dynamic-programming).

So never trust a greedy rule only because it feels right. Either prove it, or try hard to break it with a small example.

## Where greedy works: activity selection

**Problem:** given meetings with start and end times, pick as many as possible so that none overlap.

Some tempting rules, each of which fails:

- *Earliest start first.* One long meeting that starts first can block many short ones.
- *Shortest first.* A short meeting in the middle can overlap two that do not overlap each other.

The rule that works: **always take the meeting that ends earliest**, among those that do not overlap what you already took.

```python
def max_meetings(meetings):
    count = 0
    free_from = float("-inf")
    for start, end in sorted(meetings, key=lambda m: m[1]):
        if start >= free_from:
            count += 1
            free_from = end
    return count
```

O(n log n) for the sort, then one pass.

## Why it is correct: the exchange argument

Take any best solution. Look at its first meeting, and compare it with the meeting that ends earliest overall. Swap one for the other. The earliest-ending meeting finishes no later, so it cannot overlap anything the best solution took afterwards. The swapped solution is still valid and has the same number of meetings.

So there is always a best solution that starts with the greedy choice. The same argument then applies to what remains. This way of reasoning, **"I can exchange their choice for mine without making things worse"**, is how most greedy algorithms are proved.

## More greedy problems

**Fractional knapsack.** If items can be cut into pieces, take them in order of value per unit of weight. Greedy is optimal here. With whole items only, it is not, and you need DP.

**Fewest platforms.** Trains arrive and depart, and each needs a platform while present. Sort all arrivals and departures by time and sweep through them: +1 for an arrival, -1 for a departure. The highest count reached is the answer.

```python
def min_platforms(arrivals, departures):
    events = [(t, 1) for t in arrivals] + [(t, -1) for t in departures]
    events.sort(key=lambda e: (e[0], e[1]))    # at equal times, departures first
    current = best = 0
    for _, change in events:
        current += change
        best = max(best, current)
    return best
```

**Jump game.** Each position says how far you may jump from it. Can you reach the end? Track the furthest index reachable so far. If the current index ever lies beyond it, you are stuck.

**Huffman coding.** To build the shortest prefix code for a text, repeatedly merge the two least frequent symbols. A [heap](dsa/10-heaps) supplies them.

Several graph algorithms are greedy as well: [Dijkstra](dsa/12-shortest-paths) always settles the closest node, and Kruskal's algorithm for the cheapest spanning tree always adds the cheapest edge that does not form a cycle, using [union-find](dsa/16-union-find).

## Greedy or DP?

| | Greedy | Dynamic programming |
| --- | --- | --- |
| Choices | one, fixed for good | all options considered |
| Speed | usually O(n log n) | usually O(n²) or O(n × limit) |
| Correctness | needs a proof | follows from the recurrence |
| Try it when | a local rule can be shown safe | choices interact, or greedy has a counterexample |

A practical approach: think of a greedy rule, then spend five minutes trying to break it with inputs of three or four elements. If it survives, look for an exchange argument. If it breaks, move to DP.

## Common mistakes

- **Not testing the rule on small cases.**
- **Sorting by the wrong key.** In interval problems the end time is right far more often than the start time.
- **Unclear tie-breaking.** Decide whether a meeting that ends at 10 clashes with one that starts at 10.
- **Assuming that what works for fractions works for whole items.**
