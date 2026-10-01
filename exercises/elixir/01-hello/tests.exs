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

  test "greet/0 greets the world" do
    assert Hello.greet() == "Hello, world!"
  end

  test "greet/1 greets by name" do
    assert Hello.greet("Sam") == "Hello, Sam!"
    assert Hello.greet("Ada Lovelace") == "Hello, Ada Lovelace!"
  end

  test "shout/1 upper-cases and adds an exclamation mark" do
    assert Hello.shout("hi") == "HI!"
    assert Hello.shout("Stop there") == "STOP THERE!"
  end

  test "sum_and_product/2 returns a tuple" do
    assert Hello.sum_and_product(3, 4) == {7, 12}
    assert Hello.sum_and_product(-2, 5) == {3, -10}
  end

  test "halve/1 gives an integer, rounded down" do
    assert Hello.halve(7) === 3
    assert Hello.halve(10) === 5
    assert Hello.halve(1) === 0
  end
end
