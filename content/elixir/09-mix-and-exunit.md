---
title: Mix and ExUnit
summary: Create a real project, add dependencies, and test your code the way Elixir developers do.
---

## Mix

`mix` is Elixir's build tool. It creates projects, compiles them, runs tests and manages dependencies.

```console
$ mix new shop
$ cd shop
```

That creates:

```text
shop/
    mix.exs              project settings and dependencies
    lib/
        shop.ex          your code
    test/
        shop_test.exs    your tests
        test_helper.exs
    .formatter.exs
    README.md
```

Files in `lib/` end in `.ex` and are compiled. Tests end in `.exs` and are run as scripts.

| Command | What it does |
| --- | --- |
| `mix compile` | compile the project |
| `mix test` | run all tests |
| `mix test test/shop_test.exs:12` | run the test at line 12 |
| `mix format` | format every file in the standard style |
| `iex -S mix` | open the shell with your project loaded |
| `mix deps.get` | download dependencies |

Run `mix format` before you commit. The whole Elixir world uses the one style, and nobody argues about layout.

## Dependencies

Packages come from [hex.pm](https://hex.pm). List them in `mix.exs`:

```elixir
defp deps do
  [
    {:jason, "~> 1.4"}
  ]
end
```

`"~> 1.4"` accepts 1.4 and later, below 2.0. Then run `mix deps.get`. The exact versions are recorded in `mix.lock`, which you commit so that everyone builds with the same ones.

## ExUnit

ExUnit is the test framework that ships with Elixir.

```elixir
defmodule ShopTest do
  use ExUnit.Case

  test "an empty cart costs nothing" do
    assert Shop.total([]) == 0
  end

  test "adds up the prices" do
    assert Shop.total([2.5, 1.25]) == 3.75
  end
end
```

```console
$ mix test
..
Finished in 0.02 seconds
2 tests, 0 failures
```

`assert` takes any expression. When it fails, ExUnit shows both sides:

```text
  1) test adds up the prices (ShopTest)
     test/shop_test.exs:8
     Assertion with == failed
     code:  assert Shop.total([2.5, 1.25]) == 3.75
     left:  3.5
     right: 3.75
```

## The assertions you need

```elixir
assert Shop.total([1]) == 1
refute Shop.empty?([1])                           # must be false or nil
assert {:ok, user} = Accounts.find(1)             # a pattern match
assert_raise ArgumentError, fn -> Shop.total(nil) end
assert_in_delta 0.1 + 0.2, 0.3, 0.0001            # floats, within a tolerance
assert_receive {:done, _}, 500                    # a message, within 500 ms
```

Asserting on a match, as in the third line, is very common: it checks the shape and binds `user` for the lines that follow.

## Organising tests

```elixir
defmodule AccountTest do
  use ExUnit.Case, async: true

  setup do
    {:ok, account: Account.new("Sam")}
  end

  describe "deposit/2" do
    test "adds to the balance", %{account: account} do
      assert Account.deposit(account, 50).balance == 50
    end

    test "rejects negative amounts", %{account: account} do
      assert_raise ArgumentError, fn -> Account.deposit(account, -1) end
    end
  end
end
```

- `describe` groups the tests of one function.
- `setup` runs before each test, and what it returns is handed to the test.
- `async: true` runs this module's tests concurrently with other modules. It is safe because data is immutable.

## Doctests

Examples in documentation can be run as tests, so the documentation cannot go out of date:

```elixir
defmodule Shop do
  @doc """
  Adds up a list of prices.

      iex> Shop.total([1, 2, 3])
      6
  """
  def total(prices), do: Enum.sum(prices)
end
```

```elixir
defmodule ShopTest do
  use ExUnit.Case
  doctest Shop
end
```

## Without a project

The exercises in this track are single files, with no Mix project. The same framework runs as a script, and you can run it yourself:

```console
$ elixir -r solution.ex tests.exs
```

`-r` loads your module first. Open `tests.exs` in any exercise to see how the tests are written.

## What to test

The advice is the same in every language: the normal case, the empty case, the boundaries, and invalid input. For functions that return `{:ok, _}` or `{:error, _}`, test both.

Pure functions, which only turn arguments into a result, are the easiest code there is to test: no setup and nothing to clean up. Elixir's style produces a lot of them. Keep the logic in pure functions and the processes thin, and most of your tests stay simple.

## Where to go next

You have the core of Elixir: pattern matching, recursion, `Enum` and pipes, structs, processes, GenServer, and the tooling. From here, look at **Phoenix** for web applications, **Ecto** for databases, and the **OTP** design principles that go deeper into supervision.

For more practice, solve the [data structures and algorithms](dsa/01-big-o) exercises in Elixir: `python3 check.py start dsa/01-max-of-list --lang elixir`.

## Common mistakes

- **Putting tests in `.ex` files, or code in `.exs`.**
- **Testing private functions.** Test the public ones that use them.
- **Tests that depend on each other's leftovers.**
- **Comparing floats with `==`.** Use `assert_in_delta`.
- **Not committing `mix.lock`.**
