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

  test "swap/1 exchanges the two elements" do
    assert Match.swap({1, 2}) == {2, 1}
    assert Match.swap({:a, "b"}) == {"b", :a}
  end

  test "first/1 returns {:ok, head}" do
    assert Match.first([1, 2, 3]) == {:ok, 1}
    assert Match.first(["only"]) == {:ok, "only"}
  end

  test "first/1 returns :error for an empty list" do
    assert Match.first([]) == :error
  end

  test "second/1 returns the second element" do
    assert Match.second([1, 2, 3]) == 2
    assert Match.second([:a, :b]) == :b
  end

  test "second/1 returns nil for short lists" do
    assert Match.second([1]) == nil
    assert Match.second([]) == nil
  end

  test "describe/1 handles ok, error and anything else" do
    assert Match.describe({:ok, 5}) == "ok: 5"
    assert Match.describe({:error, "boom"}) == "error: boom"
    assert Match.describe(:something) == "unknown"
    assert Match.describe({:ok, 1, 2}) == "unknown"
  end

  test "area/1 of each shape" do
    assert_in_delta Match.area({:circle, 2}), 12.56, 0.001
    assert Match.area({:rect, 3, 4}) == 12
    assert Match.area({:square, 5}) == 25
  end
end
