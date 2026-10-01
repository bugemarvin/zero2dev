---
title: Functions and modules
summary: Several clauses per function, guards, private helpers, anonymous functions and the pipe operator.
---

## Clauses

A function can have several clauses. Elixir tries them from top to bottom and runs the first whose patterns match.

```elixir
defmodule Text do
  def greet(""), do: "Hello, stranger!"
  def greet(name), do: "Hello, #{name}!"
end
```

The specific case comes first. The general one catches the rest.

## Guards

A pattern checks the **shape** of an argument. A **guard**, written with `when`, adds a condition:

```elixir
defmodule Num do
  def sign(n) when n > 0, do: :positive
  def sign(n) when n < 0, do: :negative
  def sign(0), do: :zero

  def describe(x) when is_integer(x), do: "an integer"
  def describe(x) when is_binary(x), do: "a string"
  def describe(_), do: "something else"
end
```

Only a limited set of expressions is allowed in guards: comparisons, arithmetic, `and`, `or`, `not`, `in`, and type checks such as `is_integer`, `is_float`, `is_number`, `is_binary` (strings), `is_atom`, `is_list` and `is_map`. `rem` and `div` are allowed too:

```elixir
def even?(n) when rem(n, 2) == 0, do: true
def even?(_), do: false
```

A function whose name ends in `?` returns `true` or `false`. That is a naming convention.

If no clause matches, Elixir raises `FunctionClauseError`. That is often what you want: the function refuses input it was not written for.

## Private functions

`defp` defines a function that can be called only from inside its module:

```elixir
defmodule Order do
  def total(items), do: items |> subtotal() |> add_tax()

  defp subtotal(items), do: Enum.sum(items)
  defp add_tax(amount), do: amount * 1.2
end
```

## Default arguments

```elixir
def greet(name, greeting \\ "Hello") do
  "#{greeting}, #{name}!"
end

greet("Sam")           # "Hello, Sam!"
greet("Sam", "Hi")     # "Hi, Sam!"
```

This defines both `greet/1` and `greet/2`.

## Anonymous functions

A function can be a value, stored in a variable and passed around:

```elixir
double = fn x -> x * 2 end
double.(5)             # 10
```

Note the **dot** when calling a function held in a variable.

The **capture** operator `&` is a shorter way to write one. `&1` is the first argument:

```elixir
double = &(&1 * 2)
add = &(&1 + &2)
```

`&` also turns a named function into a value. Give its name and arity:

```elixir
upcase = &String.upcase/1
upcase.("hi")          # "HI"
```

## Functions that take functions

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)       # [2, 4, 6]
Enum.map([1, 2, 3], &(&1 * 2))               # the same
Enum.map(["a", "b"], &String.upcase/1)       # ["A", "B"]
```

And functions can return functions:

```elixir
def multiplier(n), do: fn x -> x * n end

triple = multiplier(3)
triple.(5)             # 15
```

The returned function remembers `n`. That is called a **closure**.

## The pipe operator

Nested calls read inside out:

```elixir
String.split(String.upcase(String.trim("  hello world  ")))
```

The pipe `|>` takes the value on its left and passes it as the **first argument** of the function on its right:

```elixir
"  hello world  "
|> String.trim()
|> String.upcase()
|> String.split()
# ["HELLO", "WORLD"]
```

The same steps, in the order they happen. Elixir's standard library is designed for this: the data being worked on is always the first parameter.

## Using other modules

```elixir
alias MyApp.Accounts.User     # write User in place of the full name
import Enum, only: [map: 2]   # call map(...) with no module prefix
```

Use `alias` freely. Use `import` sparingly, since it hides where a function comes from.

## Documentation

```elixir
defmodule Circle do
  @moduledoc "Functions for circles."

  @doc "Returns the area of a circle with the given radius."
  def area(r), do: 3.14159 * r * r
end
```

`h Circle.area` in `iex` then shows the text.

## Common mistakes

- **Calling an anonymous function without the dot**: `double(5)` in place of `double.(5)`.
- **Clauses in the wrong order.** A general clause placed first hides the others.
- **Clauses of one function separated by other functions.** Keep them together.
- **A normal function call in a guard.** Only the permitted guard expressions work there.
