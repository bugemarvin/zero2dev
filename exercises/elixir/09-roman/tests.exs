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

  test "to_roman/1 for single symbols" do
    assert Roman.to_roman(1) == "I"
    assert Roman.to_roman(5) == "V"
    assert Roman.to_roman(10) == "X"
    assert Roman.to_roman(50) == "L"
    assert Roman.to_roman(100) == "C"
    assert Roman.to_roman(500) == "D"
    assert Roman.to_roman(1000) == "M"
  end

  test "to_roman/1 repeats symbols" do
    assert Roman.to_roman(3) == "III"
    assert Roman.to_roman(8) == "VIII"
    assert Roman.to_roman(30) == "XXX"
    assert Roman.to_roman(2000) == "MM"
  end

  test "to_roman/1 uses the subtractive forms" do
    assert Roman.to_roman(4) == "IV"
    assert Roman.to_roman(9) == "IX"
    assert Roman.to_roman(40) == "XL"
    assert Roman.to_roman(90) == "XC"
    assert Roman.to_roman(400) == "CD"
    assert Roman.to_roman(900) == "CM"
  end

  test "to_roman/1 for full numbers" do
    assert Roman.to_roman(1994) == "MCMXCIV"
    assert Roman.to_roman(2024) == "MMXXIV"
    assert Roman.to_roman(3999) == "MMMCMXCIX"
    assert Roman.to_roman(444) == "CDXLIV"
  end

  test "from_roman/1 for simple numerals" do
    assert Roman.from_roman("I") == 1
    assert Roman.from_roman("III") == 3
    assert Roman.from_roman("VIII") == 8
    assert Roman.from_roman("MM") == 2000
  end

  test "from_roman/1 handles the subtractive forms" do
    assert Roman.from_roman("IV") == 4
    assert Roman.from_roman("IX") == 9
    assert Roman.from_roman("XL") == 40
    assert Roman.from_roman("MCMXCIV") == 1994
    assert Roman.from_roman("MMMCMXCIX") == 3999
  end

  test "from_roman/1 undoes to_roman/1 for every number from 1 to 3999" do
    wrong = Enum.find(1..3999, fn n -> Roman.from_roman(Roman.to_roman(n)) != n end)
    assert wrong == nil, "the round trip fails for #{inspect(wrong)}"
  end
end
