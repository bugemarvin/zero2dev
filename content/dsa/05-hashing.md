---
title: Hash tables
summary: The structure behind dictionaries and sets. Lookup, insert and delete in constant time on average.
---

## The problem

Finding a value in an unsorted list is O(n). In a sorted array it is O(log n). A **hash table** does it in O(1) on average, which is why dictionaries and sets are used everywhere.

## How it works

Start with an array of **buckets**. To store a key:

1. Run the key through a **hash function**, which turns it into a large whole number.
2. Take that number modulo the number of buckets. That gives an index.
3. Put the key and its value in that bucket.

To look the key up, compute the same index and go straight there. No searching.

```text
key "cat" --hash--> 9173482 --% 8--> bucket 2

buckets:  0      1      2          3      4      5      6      7
          .      .   ("cat", 3)    .      .      .      .      .
```

A good hash function is fast, always gives the same number for the same key, and spreads different keys evenly across the buckets.

## Collisions

Two different keys can land in the same bucket. That is a **collision**, and it is unavoidable. There are two standard ways to handle it.

**Chaining:** each bucket holds a small list of entries. A lookup goes to the bucket and scans that short list.

```python
class HashMap:
    def __init__(self, size=8):
        self.buckets = [[] for _ in range(size)]

    def _bucket(self, key):
        return self.buckets[hash(key) % len(self.buckets)]

    def put(self, key, value):
        bucket = self._bucket(key)
        for entry in bucket:
            if entry[0] == key:
                entry[1] = value        # the key exists: replace
                return
        bucket.append([key, value])

    def get(self, key, default=None):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return default
```

**Open addressing:** if the bucket is taken, try the next one, and the next, until a free slot appears. Lookups follow the same path.

## Keeping it fast

If many keys share few buckets, the chains grow and the table slows to O(n). The **load factor** is the number of entries divided by the number of buckets. When it passes a threshold, often around 0.7, the table allocates a larger array and **rehashes** every entry into it. That resize is O(n), and rare enough that the average cost per operation stays O(1).

| Operation | Average | Worst case |
| --- | --- | --- |
| insert | O(1) | O(n) |
| lookup | O(1) | O(n) |
| delete | O(1) | O(n) |

## What can be a key

A key must be **hashable**: its hash must never change. In Python that means immutable values: numbers, strings, tuples of those. A list cannot be a key, because changing it would change its hash and the entry would be lost in the wrong bucket.

## What you give up

A hash table has **no order by key**. You cannot ask for "the smallest key" or "all keys between 10 and 20" without scanning everything. When you need order, use a sorted array or a [tree](dsa/09-trees-and-bst).

## Pattern: have I seen this?

A set answers membership in O(1). Finding the first repeated value becomes one pass:

```python
def first_duplicate(items):
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None
```

## Pattern: look up the partner

**Two sum:** find two numbers in an unsorted list that add up to a target. Checking every pair is O(n²). With a dictionary, for each number you ask whether its partner has already gone by:

```python
def two_sum(numbers, target):
    position = {}                    # value -> index where it was seen
    for i, x in enumerate(numbers):
        need = target - x
        if need in position:
            return position[need], i
        position[x] = i
    return None
```

One pass, O(n) time, O(n) extra space. Trading memory for time is the usual hash table bargain.

## Pattern: group by a computed key

Words are anagrams of each other when their letters, sorted, are identical. Use that sorted form as the key:

```python
def group_anagrams(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())
```

The same shape handles counting, grouping records by a field, and removing duplicates.

## Common mistakes

- **Using a list where a set would do.** `x in some_list` inside a loop is O(n²) in disguise.
- **A mutable key.** Lists and dictionaries cannot be keys. Convert to a tuple or a string.
- **Relying on order.** Use a sorted structure when order matters.
- **Forgetting the worst case.** With a poor hash function, or keys chosen by an attacker, everything can land in one bucket.
