---
title: Tries
summary: A tree of characters that makes prefix questions fast. The structure behind autocomplete.
---

## The problem

You have a large set of words and want to answer, many times:

- is this word in the set?
- how many words start with this prefix?
- which words start with this prefix?

A hash set answers the first in O(1) and has nothing to offer for the other two: it has no notion of a prefix. A sorted list with binary search can do it. A **trie** does it directly.

## The structure

A trie, pronounced "try", is a tree where each edge is labelled with one character. A path from the root spells a string. Words that share a prefix share the path for that prefix.

Storing `car`, `card`, `care` and `cat`:

```text
(root)
  |
  c
  |
  a
 / \
r*  t*
|\
d* e*
```

A star marks a node where a complete word ends. The marker is necessary: `car` is a word, and `ca` is only a prefix.

## Implementation

Each node holds a dictionary from character to child node, and an end-of-word flag.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def _find(self, text):
        node = self.root
        for ch in text:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def contains(self, word):
        node = self._find(word)
        return node is not None and node.is_word

    def starts_with(self, prefix):
        return self._find(prefix) is not None
```

`contains` and `starts_with` walk the same path. The only difference is whether the final node must be marked as a word.

## Counting words under a prefix

Store one more number in each node: how many words pass through it. Increase it during insertion.

```python
    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
            node.count += 1            # one more word passes through here
        node.is_word = True

    def count_prefix(self, prefix):
        node = self._find(prefix)
        return node.count if node is not None else 0
```

with `self.count = 0` added to `TrieNode.__init__`. The answer to a prefix question is then a single walk, however many words match.

If the same word may be inserted twice, decide whether that counts once or twice, and make the code agree.

## Listing completions

Walk to the prefix node, then collect every word below it with a depth-first search:

```python
    def completions(self, prefix):
        node = self._find(prefix)
        results = []

        def walk(node, text):
            if node.is_word:
                results.append(text)
            for ch in sorted(node.children):
                walk(node.children[ch], text + ch)

        if node is not None:
            walk(node, prefix)
        return results
```

Visiting the children in sorted order gives the words alphabetically.

## Costs

With `L` the length of the word or prefix:

| Operation | Trie | Hash set |
| --- | --- | --- |
| insert a word | O(L) | O(L) |
| exact lookup | O(L) | O(L) |
| prefix exists | O(L) | not supported |
| count words with a prefix | O(L) | O(n × L) |

None of the trie's costs depend on how many words are stored.

The price is memory. Every character of every distinct prefix is its own node with its own dictionary. When the alphabet is small and fixed, such as lower-case letters, an array of 26 child slots per node is faster than a dictionary.

## Where tries are used

- autocomplete and search suggestions
- spell checkers
- IP routing tables, matching the longest prefix of an address
- word games that explore a board letter by letter, abandoning a path as soon as no word starts that way

## Common mistakes

- **No end-of-word marker.** Every prefix then looks like a stored word.
- **Confusing "is a word" with "is a prefix".** They are two different questions.
- **Double counting** when the same word is inserted again.
- **Using a trie for exact lookups only.** A hash set is simpler and uses less memory.
