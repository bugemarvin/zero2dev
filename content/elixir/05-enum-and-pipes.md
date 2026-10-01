---
title: Enum, pipes and comprehensions
summary: The standard tools for collections. Map, filter, reduce, and pipelines that read like a description.
---

## Enum

The `Enum` module works on anything that can be enumerated: lists, ranges, maps. Its functions take the collection as the first argument and usually a function as the second.

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)         # [2, 4, 6]
Enum.filter([1, 2, 3, 4], fn x -> rem(x, 2) == 0 end)   # [2, 4]
Enum.sum([1, 2, 3])                            # 6
Enum.count([1, 2, 3])                          # 3
Enum.max([3, 9, 4])                            # 9
Enum.sort([3, 1, 2])                           # [1, 2, 3]
Enum.reverse([1, 2, 3])                        # [3, 2, 1]
Enum.member?([1, 2, 3], 2)                     # true
```

With the capture shorthand:

```elixir
Enum.map([1, 2, 3], &(&1 * 2))
Enum.filter(1..10, &(rem(&1, 2) == 0))
```

`1..10` is a **range**: the whole numbers from 1 to 10.

## The functions you will use most

| Function | Result |
| --- | --- |
| `Enum.map(c, f)` | a list of `f` applied to each element |
| `Enum.filter(c, f)` | the elements for which `f` is true |
| `Enum.reject(c, f)` | the elements for which `f` is false |
| `Enum.reduce(c, acc, f)` | one value, built up step by step |
| `Enum.find(c, f)` | the first element for which `f` is true, or `nil` |
| `Enum.any?(c, f)`, `Enum.all?(c, f)` | whether some, or all, satisfy `f` |
| `Enum.sort_by(c, f)` | sorted by the value `f` gives |
| `Enum.group_by(c, f)` | a map from `f`'s result to the elements |
| `Enum.frequencies(c)` | a map from each element to its count |
| `Enum.take(c, n)`, `Enum.drop(c, n)` | the first `n`, or all but the first `n` |
| `Enum.join(c, sep)` | a string |
| `Enum.zip(a, b)` | a list of pairs |
| `Enum.with_index(c)` | each element paired with its position |

## reduce

`reduce` is the general one: all the others can be written with it. It walks the collection carrying an **accumulator**, and the function decides the next accumulator from each element.

```elixir
Enum.reduce([1, 2, 3, 4], 0, fn x, acc -> acc + x end)        # 10

Enum.reduce(["a", "b", "a"], %{}, fn word, counts ->
  Map.update(counts, word, 1, &(&1 + 1))
end)
# %{"a" => 2, "b" => 1}
```

It is the [accumulator recursion](elixir/04-lists-and-recursion) from the last lesson, packaged. Reach for it when no more specific function fits.

## Pipelines

Combine the pieces with the pipe operator, one step per line:

```elixir
"the cat and the hat"
|> String.split()
|> Enum.frequencies()
|> Enum.sort_by(fn {word, count} -> {-count, word} end)
|> Enum.take(2)
# [{"the", 2}, {"and", 1}]
```

Read it from the top: split into words, count each, sort by count from high to low and then alphabetically, keep two.

Sorting by a tuple sorts by its first element, then its second. Negating the count turns ascending order into descending.

When a pipeline gives a surprising result, put `|> IO.inspect()` between two steps to see the data at that point.

## Maps are enumerable

Enumerating a map gives `{key, value}` tuples:

```elixir
%{a: 1, b: 2}
|> Enum.map(fn {key, value} -> {key, value * 10} end)
|> Map.new()
# %{a: 10, b: 20}
```

`Enum.map` always returns a **list**. `Map.new` turns a list of pairs back into a map.

## Comprehensions

`for` in Elixir is not a loop that changes things. It builds a new list:

```elixir
for x <- 1..5, do: x * x                       # [1, 4, 9, 16, 25]
for x <- 1..10, rem(x, 2) == 0, do: x          # [2, 4, 6, 8, 10]   with a filter
for x <- 1..2, y <- [:a, :b], do: {x, y}       # every combination
for {key, value} <- %{a: 1, b: 2}, into: %{}, do: {key, value * 2}
```

## Streams: lazy pipelines

Each `Enum` function builds a complete list before the next step starts. With big data, or data with no end, use `Stream`, which does nothing until a result is demanded:

```elixir
1..1_000_000
|> Stream.map(&(&1 * 2))
|> Stream.filter(&(rem(&1, 3) == 0))
|> Enum.take(3)
# [6, 12, 18]
```

Only as many elements are produced as the final `Enum.take` asks for. `File.stream!("big.log")` reads a file line by line in the same lazy way.

## Common mistakes

- **Expecting `Enum.map` on a map to return a map.** It returns a list of tuples. Finish with `Map.new`.
- **The argument order in `reduce`.** The function receives the element first and the accumulator second.
- **Long anonymous functions inside a pipeline.** Move them into named private functions.
- **Using `Enum` on something endless.** Use `Stream` and take what you need.
