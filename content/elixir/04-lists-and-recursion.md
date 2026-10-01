---
title: Lists and recursion
summary: There are no loops. Repetition is a function that calls itself, and lists are built for exactly that.
---

## Lists are linked lists

An Elixir list is a chain: each element points to the rest of the list. Every list is either empty, `[]`, or a **head** followed by a **tail** that is itself a list.

```elixir
[1, 2, 3] == [1 | [2 | [3 | []]]]     # true
```

| Operation | Cost |
| --- | --- |
| add at the front: `[0 \| list]` | O(1) |
| take the head and tail | O(1) |
| `length(list)` | O(n) |
| add at the end: `list ++ [x]` | O(n) |
| read the i-th element | O(n) |

So Elixir code builds lists from the front.

## No loops

There is no `for` or `while` that changes a counter, because nothing can change. Repetition is done by **recursion**.

A function over a list has two clauses:

- the empty list: the base case;
- `[head | tail]`: do something with the head, and recurse on the tail.

```elixir
defmodule MyList do
  def sum([]), do: 0
  def sum([head | tail]), do: head + sum(tail)
end

MyList.sum([1, 2, 3])
```

It unfolds like this:

```text
sum([1, 2, 3])
1 + sum([2, 3])
1 + (2 + sum([3]))
1 + (2 + (3 + sum([])))
1 + (2 + (3 + 0))
6
```

## The same shape, again and again

Counting:

```elixir
def count([]), do: 0
def count([_ | tail]), do: 1 + count(tail)
```

Transforming every element:

```elixir
def double_all([]), do: []
def double_all([head | tail]), do: [head * 2 | double_all(tail)]
```

Keeping some elements, with a guard:

```elixir
def evens([]), do: []
def evens([head | tail]) when rem(head, 2) == 0, do: [head | evens(tail)]
def evens([_ | tail]), do: evens(tail)
```

Passing the operation in as a function gives you your own `map`:

```elixir
def map([], _fun), do: []
def map([head | tail], fun), do: [fun.(head) | map(tail, fun)]
```

## Tail recursion and accumulators

In `sum` above, each call must wait for the next one to return before it can add. A very long list builds a very long chain of waiting calls.

If the recursive call is the **very last thing** a function does, Elixir reuses the same stack frame and the recursion runs in constant memory, like a loop. This is **tail recursion**. The trick is to carry the result so far in an extra argument, an **accumulator**:

```elixir
def sum(list), do: sum(list, 0)

defp sum([], acc), do: acc
defp sum([head | tail], acc), do: sum(tail, acc + head)
```

`sum/1` is the public function. `sum/2` does the work. Nothing remains to be done after the recursive call, so no frame needs to be kept.

## Reversing

Building a list with an accumulator naturally produces it in reverse, since each element goes on the front:

```elixir
def reverse(list), do: reverse(list, [])

defp reverse([], acc), do: acc
defp reverse([head | tail], acc), do: reverse(tail, [head | acc])
```

That is why accumulator-based code that builds a list often ends with a final reverse.

## Recursion on numbers

```elixir
def factorial(0), do: 1
def factorial(n) when n > 0, do: n * factorial(n - 1)

def countdown(0), do: [0]
def countdown(n) when n > 0, do: [n | countdown(n - 1)]
```

The guard `when n > 0` stops a negative argument from recursing for ever. It fails with `FunctionClauseError` instead.

## Do you write all this by hand?

Rarely. The `Enum` module, in the next lesson, already contains `map`, `filter`, `reduce`, `sum` and many more. But they are all built in the way shown here, and whenever a problem does not fit a ready-made function you write the recursion yourself. Knowing the pattern is what makes the rest of Elixir readable.

## Common mistakes

- **No clause for `[]`.** The recursion ends in `FunctionClauseError`.
- **Appending with `++` at each step.** That makes the whole function O(n²). Prepend, and reverse once at the end.
- **Believing a function is tail-recursive** when something still happens after the call, as in `head + sum(tail)`.
- **A numeric recursion with no guard**, which never ends for negative input.
