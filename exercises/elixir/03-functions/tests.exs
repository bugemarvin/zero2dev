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

  test "sign/1" do
    assert Calc.sign(5) == :positive
    assert Calc.sign(-3) == :negative
    assert Calc.sign(0) == :zero
    assert Calc.sign(0.5) == :positive
  end

  test "fizzbuzz/1 for the numbers 1 to 15" do
    expected = ~w(1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz)
    assert Enum.map(1..15, &Calc.fizzbuzz/1) == expected
  end

  test "fizzbuzz/1 for larger numbers" do
    assert Calc.fizzbuzz(30) == "FizzBuzz"
    assert Calc.fizzbuzz(98) == "98"
  end

  test "greet/1 uses the default greeting" do
    assert Calc.greet("Sam") == "Hello, Sam!"
  end

  test "greet/2 uses the greeting given" do
    assert Calc.greet("Sam", "Hi") == "Hi, Sam!"
  end

  test "apply_n/3 applies the function n times" do
    assert Calc.apply_n(fn x -> x * 2 end, 3, 1) == 8
    assert Calc.apply_n(&(&1 + 1), 100, 0) == 100
    assert Calc.apply_n(&String.upcase/1, 0, "same") == "same"
    assert Calc.apply_n(fn s -> s <> "!" end, 2, "hey") == "hey!!"
  end

  test "compose/2 returns a function that applies f, then g" do
    add_one_then_double = Calc.compose(&(&1 + 1), &(&1 * 2))
    assert is_function(add_one_then_double, 1)
    assert add_one_then_double.(3) == 8
    shout = Calc.compose(&String.trim/1, &String.upcase/1)
    assert shout.("  hi ") == "HI"
  end
end
