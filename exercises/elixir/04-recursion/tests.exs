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

  test "sum/1" do
    assert Rec.sum([1, 2, 3, 4]) == 10
    assert Rec.sum([]) == 0
    assert Rec.sum([-5, 5, 2.5]) == 2.5
  end

  test "count/1" do
    assert Rec.count([:a, :b, :c]) == 3
    assert Rec.count([]) == 0
    assert Rec.count([[1, 2], [3]]) == 2
  end

  test "reverse/1" do
    assert Rec.reverse([1, 2, 3]) == [3, 2, 1]
    assert Rec.reverse([]) == []
    assert Rec.reverse([:only]) == [:only]
  end

  test "map/2" do
    assert Rec.map([1, 2, 3], fn x -> x * 2 end) == [2, 4, 6]
    assert Rec.map([], fn x -> x end) == []
    assert Rec.map(["a", "b"], &String.upcase/1) == ["A", "B"]
  end

  test "largest/1" do
    assert Rec.largest([3, 9, 4]) == 9
    assert Rec.largest([-8, -2, -5]) == -2
    assert Rec.largest([7]) == 7
    assert Rec.largest([]) == nil
  end

  test "the functions handle a list of 200,000 elements" do
    big = :lists.seq(1, 200_000)
    assert Rec.sum(big) == 20_000_100_000
    assert Rec.count(big) == 200_000
    assert hd(Rec.reverse(big)) == 200_000
    assert Rec.largest(big) == 200_000
  end

  test "solution.ex does not use Enum, List or Stream" do
    source = File.read!("solution.ex")
    refute source =~ ~r/\b(Enum|List|Stream)\./, "write the recursion yourself, with no calls to Enum, List or Stream"
  end
end
