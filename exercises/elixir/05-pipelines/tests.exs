# Test file. Do not edit. You can run it yourself:  elixir -r solution.ex tests.exs

defmodule Z2D.Formatter do
  # Prints one line per test, in the form the zero2dev checker reads.
  use GenServer

  def init(_opts), do: {:ok, nil}

  def handle_cast({:test_finished, %ExUnit.Test{name: name, state: nil}}, state) do
    IO.puts("ok - #{label(name)}")
    {:noreply, state}
  end

  def handle_cast({:test_finished, %ExUnit.Test{name: name, state: {:failed, failures}}}, state) do
    IO.puts("not ok - #{label(name)}: #{failures |> Enum.map(&describe/1) |> Enum.join(" | ")}")
    {:noreply, state}
  end

  def handle_cast(_event, state), do: {:noreply, state}

  defp label(name), do: name |> Atom.to_string() |> String.replace_prefix("test ", "")

  defp describe({:error, %ExUnit.AssertionError{} = error, _stack}) do
    none = ExUnit.AssertionError.no_value()

    details =
      [code: error.expr, left: error.left, right: error.right]
      |> Enum.reject(fn {_key, value} -> value == none end)
      |> Enum.map(fn
        {:code, value} when is_binary(value) -> "code: #{value}"
        {:code, value} -> "code: #{Macro.to_string(value)}"
        {key, value} -> "#{key}: #{inspect(value)}"
      end)

    one_line(Enum.join([to_string(error.message) | details], "; "))
  end

  defp describe({:error, %{__exception__: true} = error, _stack}) do
    one_line("#{inspect(error.__struct__)}: #{Exception.message(error)}")
  end

  defp describe({kind, reason, _stack}), do: one_line("#{kind}: #{inspect(reason)}")

  defp one_line(text), do: text |> String.split() |> Enum.join(" ") |> String.slice(0, 400)
end

ExUnit.start(formatters: [Z2D.Formatter], seed: 0)

defmodule SolutionTest do
  use ExUnit.Case

  test "sum_of_even_squares/1" do
    assert Pipes.sum_of_even_squares([1, 2, 3, 4]) == 20
    assert Pipes.sum_of_even_squares([1, 3, 5]) == 0
    assert Pipes.sum_of_even_squares([]) == 0
    assert Pipes.sum_of_even_squares([-2, -6]) == 40
  end

  test "sum_of_even_squares/1 accepts a range" do
    assert Pipes.sum_of_even_squares(1..10) == 220
  end

  test "initials/1" do
    assert Pipes.initials("ada lovelace") == "AL"
    assert Pipes.initials("Grace Brewster Hopper") == "GBH"
    assert Pipes.initials("linus") == "L"
    assert Pipes.initials("  extra   spaces  here ") == "ESH"
  end

  test "word_frequencies/1 counts words, ignoring case" do
    assert Pipes.word_frequencies("The cat the hat") == %{"the" => 2, "cat" => 1, "hat" => 1}
    assert Pipes.word_frequencies("") == %{}
    assert Pipes.word_frequencies("a  a\na") == %{"a" => 3}
  end

  test "top_words/2 orders by count, then alphabetically" do
    assert Pipes.top_words("b a b a c", 2) == [{"a", 2}, {"b", 2}]
    assert Pipes.top_words("the cat and the hat and the bat", 3) == [{"the", 3}, {"and", 2}, {"bat", 1}]
  end

  test "top_words/2 when n is larger than the number of words" do
    assert Pipes.top_words("x y x", 10) == [{"x", 2}, {"y", 1}]
    assert Pipes.top_words("", 3) == []
  end
end
