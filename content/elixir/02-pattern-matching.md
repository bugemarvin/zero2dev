---
title: Pattern matching
summary: The equals sign does not assign. It matches shapes, and takes values apart as it does so.
---

## = is a match

In Elixir, `=` is the **match operator**. It tries to make the left side fit the right side.

```elixir
x = 1          # matches by binding x to 1
1 = x          # also fine: 1 matches 1
2 = x          # ** (MatchError) no match of right hand side value: 1
```

With a plain variable on the left it looks like assignment. With a more interesting shape on the left, it takes data apart.

## Destructuring

**Tuples:**

```elixir
{a, b} = {1, 2}                   # a = 1, b = 2
{:ok, value} = {:ok, 42}          # value = 42
{:ok, value} = {:error, :nope}    # MatchError: :ok does not match :error
```

The last line is the point. A pattern can **demand** a particular value in a position. Here the code states that it expects success, and it fails loudly otherwise.

**Lists.** `[head | tail]` splits a list into its first element and the rest:

```elixir
[head | tail] = [1, 2, 3]         # head = 1, tail = [2, 3]
[first, second | rest] = [1, 2, 3, 4]
[only] = [7]                      # matches a list of exactly one element
[head | tail] = []                # MatchError: an empty list has no head
```

**Maps.** A map pattern matches any map that contains **at least** the given keys:

```elixir
%{name: name} = %{name: "Sam", age: 30}     # name = "Sam"
```

## Ignoring parts

The underscore matches anything and keeps nothing:

```elixir
{_, second} = {1, 2}
[first | _] = [1, 2, 3]
```

## Tagged tuples

Functions that can fail conventionally return `{:ok, value}` or `{:error, reason}`:

```elixir
File.read("notes.txt")
# {:ok, "the contents"}   or   {:error, :enoent}

Integer.parse("42abc")
# {42, "abc"}             or   :error
```

Pattern matching is how you tell them apart.

## case

`case` tries patterns from top to bottom and runs the first that matches:

```elixir
case File.read("notes.txt") do
  {:ok, content} ->
    "read #{String.length(content)} characters"

  {:error, :enoent} ->
    "no such file"

  {:error, reason} ->
    "failed: #{reason}"
end
```

The variables bound by a pattern exist inside that branch. If nothing matches, a `CaseClauseError` is raised. A final `_ ->` branch catches everything else.

The order matters: `{:error, :enoent}` must come before the more general `{:error, reason}`.

## The pin operator

A variable in a pattern is normally **rebound**. To match against the value it already holds, pin it with `^`:

```elixir
expected = 5
^expected = 5      # fine
^expected = 6      # MatchError

case result do
  {:ok, ^expected} -> "exactly what we wanted"
  {:ok, other} -> "got #{other}"
end
```

## Matching in function heads

Patterns can go straight into a function's parameters. Write several **clauses** of the same function, and Elixir runs the first one whose patterns match the arguments:

```elixir
defmodule Shape do
  def area({:circle, r}), do: 3.14159 * r * r
  def area({:rect, w, h}), do: w * h
  def area({:square, s}), do: s * s
end

Shape.area({:rect, 3, 4})     # 12
```

There is no `if` and no `switch`. Each case is a separate, readable line. Most Elixir code is written in this style, and the next lesson builds on it.

## if and cond

They exist, and are used less than in other languages:

```elixir
if age >= 18 do
  "adult"
else
  "minor"
end

cond do
  score >= 90 -> "A"
  score >= 80 -> "B"
  true -> "C"
end
```

`cond` runs the first branch whose condition is true. The final `true ->` is the catch-all.

Only `false` and `nil` count as false. Everything else, including `0` and `""`, counts as true.

## Common mistakes

- **Reading `=` as assignment** and being surprised by a `MatchError`.
- **General patterns before specific ones.** The specific clause never runs. The compiler warns.
- **Forgetting the pin** and silently rebinding a variable in a pattern.
- **Matching `[head | tail]` against an empty list.** Handle `[]` in a separate clause.
