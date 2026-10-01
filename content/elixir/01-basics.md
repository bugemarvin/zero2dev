---
title: Elixir basics
summary: A functional language where data never changes. Values, the interactive shell, and your first module.
---

## What is different about Elixir

Elixir is a **functional** language. Three ideas shape everything in it:

- **Data is immutable.** A value never changes after it is created. Functions return new values.
- **Functions transform data.** Programs are chains of small functions, each taking a value and returning a new one.
- **Processes are cheap.** Elixir runs on the Erlang virtual machine (the BEAM), built for systems that run millions of small tasks at the same time and keep running when some of them fail.

Install it with `./setup/install.sh --stack elixir`.

## The interactive shell

```console
$ iex
iex(1)> 1 + 2
3
iex(2)> String.upcase("hello")
"HELLO"
```

Leave with `Ctrl+C` twice. `h String.upcase` shows the documentation of a function.

## Values

| Type | Examples | Notes |
| --- | --- | --- |
| integer | `42`, `1_000_000` | no size limit |
| float | `3.14` | |
| boolean | `true`, `false` | |
| atom | `:ok`, `:error`, `:north` | a constant whose name is its value |
| string | `"hello"` | double quotes, UTF-8 |
| list | `[1, 2, 3]` | a linked list |
| tuple | `{:ok, 42}` | a fixed number of elements |
| map | `%{name: "Sam", age: 30}` | keys and values |
| nil | `nil` | "no value" |

**Atoms** are everywhere in Elixir. They label things: `:ok` and `:error` mark results, and `true`, `false` and `nil` are atoms too.

## Operators

```elixir
7 + 2          # 9
7 / 2          # 3.5   division always gives a float
div(7, 2)      # 3     whole-number division
rem(7, 2)      # 1     remainder
"ab" <> "cd"   # "abcd"   join strings
[1, 2] ++ [3]  # [1, 2, 3]   join lists
1 == 1.0       # true
1 === 1.0      # false: strict, the types differ
true and false # false   also: or, not
```

## Strings

```elixir
name = "Sam"
"Hello, #{name}!"            # "Hello, Sam!"   interpolation
String.length("hello")       # 5
String.upcase("hello")       # "HELLO"
String.split("a b c")        # ["a", "b", "c"]
String.trim("  hi  ")        # "hi"
String.to_integer("42")      # 42
Integer.to_string(42)        # "42"
```

`#{...}` inside a string inserts the value of any expression.

## Variables and immutability

```elixir
x = 1
x = x + 1      # x is now 2
```

This **rebinds the name** `x` to a new value. The value 1 itself was not altered. The difference shows with collections:

```elixir
list = [1, 2, 3]
List.delete(list, 2)    # [1, 3]
list                    # still [1, 2, 3]
```

`List.delete` returned a **new** list. To keep the result, bind it: `list = List.delete(list, 2)`. Nothing in Elixir changes a value in place.

## Modules and functions

Functions live in **modules**.

```elixir
defmodule Greeter do
  def hello(name) do
    "Hello, #{name}!"
  end
end

Greeter.hello("Sam")     # "Hello, Sam!"
```

- `defmodule ... do ... end` defines a module. Module names start with a capital letter.
- `def` defines a public function.
- **The last expression is the return value.** There is no `return` keyword.
- Brackets around arguments are optional, and normally written.

A short function fits on one line:

```elixir
def double(n), do: n * 2
```

A function is identified by its name **and** its number of arguments, called its **arity**. `hello/1` is the `hello` that takes one argument. `hello/0` would be a different function.

## Printing

```elixir
IO.puts("Hello")              # prints text and a newline
IO.inspect([1, 2, 3])         # prints any value, as it looks in code
```

`IO.inspect` returns its argument, so you can put it in the middle of an expression to see what is flowing through.

## Running files

A file ending in `.exs` is a script:

```console
$ elixir hello.exs
```

## The exercises

Each exercise has a `solution.ex` for your module and a `tests.exs` written with ExUnit, Elixir's test framework. You can read the tests. They show exactly what is expected.

```console
$ python3 check.py elixir/01-hello
```

## Common mistakes

- **Expecting a function to change its argument.** It returns a new value. Bind it.
- **Single quotes for strings.** `'hello'` is a different type, a list of character codes. Use double quotes.
- **`/` for whole-number division.** It always gives a float. Use `div`.
- **Forgetting `end`.** Every `do` needs one.
